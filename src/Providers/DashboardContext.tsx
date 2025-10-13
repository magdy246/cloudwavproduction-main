import {
  useContext,
  createContext,
  Dispatch,
  SetStateAction,
  PropsWithChildren,
  useState,
  // useEffect,
} from "react";

interface TDashboardContext {
  drawerWidth: number;
  headerHeight: number;
  drawerMobile: boolean;
  collapseDrawerWidth: number;
  fullDrawerWidth: number;
  isCollapse: boolean;
  sm: boolean; 
  setDrawerWidth: Dispatch<SetStateAction<number>>;
  setHeaderHeight: Dispatch<SetStateAction<number>>;
  setDrawerMobile: Dispatch<SetStateAction<boolean>>;
  setIsCollapse: Dispatch<SetStateAction<boolean>>;
  setSm: Dispatch<SetStateAction<boolean>>;
}

const DashboardContext = createContext<TDashboardContext | undefined>(
  undefined
);

export function DashboardProvider({ children }: PropsWithChildren) {
  const collapseDrawerWidth = 65;
  const fullDrawerWidth = 280;
  const [drawerWidth, setDrawerWidth] = useState(fullDrawerWidth);
  const [headerHeight, setHeaderHeight] = useState(37);
  const [drawerMobile, setDrawerMobile] = useState(false);
  const [isCollapse, setIsCollapse] = useState(false);
  const [sm, setSm] = useState(false);
  const value = {
    drawerWidth,
    setDrawerWidth,
    headerHeight,
    setHeaderHeight,
    drawerMobile,
    setDrawerMobile,
    isCollapse,
    setIsCollapse,
    collapseDrawerWidth,
    fullDrawerWidth,
    sm,
    setSm
  };

  

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export const useDashboard = () => {
  const context = useContext(DashboardContext);

  if (context == undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
};
