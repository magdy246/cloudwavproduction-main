import { createPortal } from "react-dom";
import { ToastContainer } from "react-toastify";
import { axiosServices } from "../../../utils/axios";
import { TableOfContent } from "../../../components/DashboardComponents/Table/Table";
import { Link } from "react-router-dom";
import clsx from "clsx";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { AxiosError } from "axios";
import Swal from "sweetalert2";
import { RiCheckLine, RiCloseLine } from "@remixicon/react";
import { Spinner2 } from "../../../components/Spinner/Spinner";

export default function RequestArtist() {
  const [fullPreview, setFullPreview] = useState<string | null>(null);
  const imageBaseUrl = "https://api.cloudwavproduction.com/storage/";

  const { t } = useTranslation();

  const {
    data: creators = [],
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["famous-artist-requests"],
    queryFn: () => axiosServices.get("/famous_artist-requests"),
    select: (data) => data.data,
  });

  const { mutate, isPending } = useMutation<
    any,
    AxiosError<Error>,
    { id: number; status: string }
  >({
    mutationFn: (data) =>
      axiosServices.put(`/famous_artist-requests/${data.id}/status`, {
        status: data.status,
      }),
    onSuccess: (data) => {
      Swal.fire(data.data.message, "", "success");
      refetch();
    },
    onError: (error) => {
      Swal.fire(error.response?.data.message, "", "error");
    },
  });

  const actionsList = [
    {
      color: "green",
      Icon: <RiCheckLine />,
      status: "approved",
      label: "approved",
    },

    {
      color: "red",
      Icon: <RiCloseLine />,
      status: "rejected",
      label: "rejected",
    },
  ];

  return (
    <>
      <div>
        <TableOfContent
          dataBody={creators}
          refetch={refetch}
          dataHead={[
            {
              label: t("dashboard.requestACreatorPage.profileImage"),
              name: "famous_profile_image",
              select: (e) => (
                <img
                  src={imageBaseUrl + e}
                  className="aspect-square min-w-15 object-cover cursor-pointer"
                  onClick={(e) => setFullPreview(e.currentTarget.src)}
                />
              ),
            },
            {
              label: t("dashboard.requestACreatorPage.idCard"),
              name: "famous_id_card_image",
              select: (e) => (
                <img
                  src={imageBaseUrl + e}
                  className="aspect-square min-w-15 object-cover cursor-pointer"
                  onClick={(e) => setFullPreview(e.currentTarget.src)}
                />
              ),
            },
            {
              label: t("dashboard.requestACreatorPage.name"),
              name: "famous_name",
            },
            {
              label: t("dashboard.requestACreatorPage.division"),
              name: "famous_division",
            },
            {
              label: t("dashboard.requestACreatorPage.number"),
              name: "famous_number",
              select: (e) => (
                <Link className="underline" to={`tel:${e}`}>
                  {e}
                </Link>
              ),
            },
            {
              label: t("dashboard.requestACreatorPage.whatsapp"),
              name: "famous_whatsapp_number",
              select: (e) => (
                <Link className="underline" to={`tel:${e}`}>
                  {e}
                </Link>
              ),
            },
            {
              label: t("dashboard.requestACreatorPage.email"),
              name: "famous_email",
              select: (e) => (
                <Link className="underline" to={`mailto:${e}`}>
                  {e}
                </Link>
              ),
            },
            {
              label: t("dashboard.requestACreatorPage.businessPrice"),
              name: "bussiness_price",
              select: (e) => e || 0,
            },
            {
              label: t("dashboard.requestACreatorPage.privatePrice"),
              name: "private_price",
              select: (e) => e || 0,
            },

            {
              label: t("dashboard.requestACreatorPage.details"),
              name: "famous_details",
              select: (e) => (
                <p
                  className="overflow-ellipsis text-nowrap max-w-20 overflow-hidden"
                  title={e}
                >
                  {e}
                </p>
              ),
            },
          ]}
          actions={actionsList.map((el) => ({
            action: isPending
              ? () => {}
              : (id) => mutate({ id, status: el.status }),
            Icon: (
              <span
                className={`w-10 h-10 flex items-center justify-center bg-${el.color}-200 text-black rounded-full cursor-pointer`}
              >
                {isPending ? <Spinner2 w={10} h={10} /> : el.Icon}
              </span>
            ),
          }))}
          isFetching={isFetching}
          title={t("dashboard.navLinks.requestAArtist")}
          acceptRoute="famous_artist-requests"
          otherRoute="/status"
        />
      </div>

      {/* show image in full preview */}
      {createPortal(
        <div
          className={clsx(
            "fixed w-full h-full inset-0 transition-all",
            fullPreview ? "visible opacity-100" : "invisible opacity-0"
          )}
        >
          <div
            className="backdrop bg-black/50 absolute w-full h-full z-1"
            onClick={() => setFullPreview(null)}
          />
          {fullPreview && (
            <div className="image z-2 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ">
              <img
                src={fullPreview}
                alt="image"
                className="w-full max-h-[80vh] object-contain"
              />
            </div>
          )}
        </div>,
        document.body
      )}
      <ToastContainer />
    </>
  );
}
