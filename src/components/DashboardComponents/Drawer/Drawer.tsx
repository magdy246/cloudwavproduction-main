import clsx from "clsx";
import { useEffect, useState } from "react";
import logo from "../../../assets/images/logo.svg";
import { useTranslation } from "react-i18next";
import { useDashboard } from "../../../Providers/DashboardContext";
import { createPortal } from "react-dom";
import { RemixiconComponentType, RiArrowDownSLine } from "@remixicon/react";
import { navLinks } from "../navLinks/navlinks";
import AnimationLink from "../../AnimationLink/AnimationLink";

interface TMenu {
  id: number;
  title: string;
  href: string;
  Icon: RemixiconComponentType;
  children?: TMenu[];
}

interface TActiveSubMenu {
  level: number;
  id: number;
}

function Collapse({
  children,
  show,
}: {
  children: React.ReactNode;
  show: boolean;
}) {
  return (
    <div
      style={{ gridTemplateRows: show ? "1fr" : "0fr" }}
      className="grid transition-all duration-500"
    >
      <div className="overflow-hidden">{children}</div>
    </div>
  );
}

function SubChildrenMenu({
  menu,
  level,
  activeSubMenu,
  setActiveSubMenu,
}: {
  menu: TMenu[];
  level: number;
  activeSubMenu: TActiveSubMenu[];
  setActiveSubMenu: React.Dispatch<React.SetStateAction<TActiveSubMenu[]>>;
}) {
  const { isCollapse } = useDashboard();
  const { t } = useTranslation();
  function handleActiveSubMenu(id: number, level: number) {
    const isOpen = activeSubMenu.some((el) => el.id == id);
    if (isOpen) {
      setActiveSubMenu((prev) => prev.filter((el) => el.id !== id));
    } else {
      setActiveSubMenu((prev) => [
        ...prev.filter((el) => el.level < level),
        { id, level },
      ]);
    }
  }

  return (
    <ul style={{ paddingInlineStart: isCollapse ? 0 : `${level * 15}px` }}>
      {menu.map((link) => {
        const activeMenu = activeSubMenu.some((el) => el.id === link.id);
        return (
          <li key={link.id} className="text-nowrap">
            <AnimationLink
              to={link.children ? "#" : link.href}
              className={clsx(
                "flex items-center w-full h-10 rounded-xl mt-2 font-semibold text-[15px]",
                isCollapse ? 0 : "pe-4",
                activeMenu &&
                  (link.children
                    ? "bg-main-color/50 text-white"
                    : "text-main-color")
              )}
              onClick={() => handleActiveSubMenu(link.id, level)}
            >
              {link.Icon && (
                <span
                  className={`flex items-center justify-center min-w-[60px] min-h-[60px] `}
                >
                  <link.Icon />
                </span>
              )}
              {t(link.title)}
              {link.children && <RiArrowDownSLine />}
            </AnimationLink>
            {link.children && (
              <Collapse show={activeMenu}>
                <SubChildrenMenu
                  menu={link.children}
                  level={level + 1}
                  activeSubMenu={activeSubMenu}
                  setActiveSubMenu={setActiveSubMenu}
                />
              </Collapse>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default function Drawer() {
  const { drawerWidth, drawerMobile, setDrawerMobile, isCollapse } =
    useDashboard();
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [activeSubMenu, setActiveSubMenu] = useState<TActiveSubMenu[]>([]);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const pathname = window.location.pathname;
    function findActiveSubChild(children: TMenu[], level: number) {
      return children.some((children: TMenu) => {
        if (pathname.endsWith(children.href)) {
          setActiveSubMenu([{ level, id: children.id }]);
          return true;
        }
        if (children.children) {
          findActiveSubChild(children.children, level + 1);
        }
        return false;
      });
    }

    function findActivePathName() {
      navLinks.forEach((link) => {
        const child = findActiveSubChild(link.children, 1);
        if (child) {
          setActiveMenu(link.id);
        }
      });
    }
    findActivePathName();
  }, []);
  const isEnglish = i18n.language === "en";
  const directionShow = isEnglish ? "left-0" : "right-0";
  const directionHide = isEnglish ? "-left-full" : "-right-full";

  return (
    <>
      <div
        className={clsx(
          "drawer absolute md:fixed border-e bg-white border-gray-300 h-full overflow-auto top-0 z-9 transition-all duration-300",
          isEnglish ? `md:left-0`:"md:right-0",
          drawerMobile ? directionShow : directionHide,
          isCollapse ? "px-1" : "px-3"
        )}
        style={{ width: drawerWidth }}
      >
        <div className="my-5">
          <AnimationLink to={"/"}>
            <img
              src={logo}
              alt="logo-image"
              className="w-full h-20 object-contain"
            />
          </AnimationLink>
        </div>
        <ul>
          {navLinks.map((link) => {
            const active = activeMenu === link.id;
            return (
              <li key={link.id} className="text-nowrap">
                <button
                  className={clsx(
                    "flex items-center w-full h-13 rounded-xl capitalize font-semibold",
                    active && "bg-main-color text-white",
                    isCollapse ? "px-0" : "pe-4"
                  )}
                  onClick={() =>
                    setActiveMenu((prev) => (prev == link.id ? null : link.id))
                  }
                >
                  {link.Icon && (
                    <span
                      className={`flex items-center justify-center min-w-[60px] min-h-[60px] me-3`}
                    >
                      <link.Icon />
                    </span>
                  )}
                  {t(link.title)}
                  <span className="flex ms-auto">
                    <RiArrowDownSLine />
                  </span>
                </button>
                {link.children && (
                  <Collapse show={active}>
                    <SubChildrenMenu
                      menu={link.children}
                      level={1}
                      activeSubMenu={activeSubMenu}
                      setActiveSubMenu={setActiveSubMenu}
                    />
                  </Collapse>
                )}
              </li>
            );
          })}
        </ul>
      </div>
      {createPortal(
        <div
          className={clsx(
            "fixed w-full h-full inset-0 transition-all",
            drawerMobile ? "visible opacity-100" : "invisible opacity-0"
          )}
        >
          <div
            className="backdrop bg-black/50 absolute w-full h-full z-1"
            onClick={() => setDrawerMobile(false)}
          />
        </div>,
        document.body
      )}
    </>
  );
}
