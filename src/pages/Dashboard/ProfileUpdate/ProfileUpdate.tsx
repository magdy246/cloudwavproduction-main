import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import { axiosServices } from "../../../utils/axios";
import { RiCheckLine, RiDeleteBinLine } from "@remixicon/react";
import { TableOfContent } from "../../../components/DashboardComponents/Table/Table";
import { Spinner2 } from "../../../components/Spinner/Spinner";
import { useState } from "react";
import clsx from "clsx";
import { createPortal } from "react-dom";

export default function ProfileUpdate() {
  const { t } = useTranslation();
  const [fullPreview, setFullPreview] = useState<string | null>(null);

  const imageBaseUrl = "https://api.cloudwavproduction.com/storage/";

  const {
    data: ProfilesUpdate = [],
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["profiles-update"],
    queryFn: () => axiosServices.get("/profile-update-requests"),
    select: (data) => data.data.data,
  });

  const { mutate: updateProfile, isPending } = useMutation<
    any,
    AxiosError<Error>,
    { id: number; status: "approve" | "reject" }
  >({
    mutationFn: (data) =>
      axiosServices.post(`/profile-update-request/${data.id}/${data.status}`),
    onSuccess: (data) => {
      Swal.fire(data.data.message || "تم الحذف بنجاح", "", "success");
      refetch();
    },
    onError: (error) => {
      Swal.fire(error.response?.data.message, "", "error");
    },
  });

  const actionsList = [
    {
      color: "red",
      Icon: <RiDeleteBinLine />,
      label: "delete",
      action: (id: number) => updateProfile({ id, status: "reject" }),
    },
    {
      color: "green",
      Icon: <RiCheckLine />,
      label: "accept",
      action: (id: number) => updateProfile({ id, status: "approve" }),
    },
  ];

  return (
    <>
      <TableOfContent
        dataBody={ProfilesUpdate}
        refetch={refetch}
        dataHead={[
          {
            label: t("dashboard.requestACreatorPage.name"),
            name: "name",
          },
          {
            label: t("dashboard.requestACreatorPage.division"),
            name: "type",
          },
          {
            label: t("dashboard.requestACreatorPage.status"),
            name: "status",
          },
          {
            label: t("dashboard.requestACreatorPage.profileImage"),
            name: "profile_image",
            select: (e) => (
              <img
                src={imageBaseUrl + e}
                className="aspect-square max-w-20 object-cover cursor-pointer"
                onClick={(e) => setFullPreview(e.currentTarget.src)}
              />
            ),
          },
          {
            label: t("dashboard.requestACreatorPage.createdAt"),
            name: "created_at",
            select: (e) => new Date(e).toLocaleString(),
          },
        ]}
        actions={actionsList.map((el) => ({
          action: isPending ? () => {} : (id) => el.action(id),
          Icon: (
            <span
              className={`w-10 h-10 flex items-center justify-center text-${el.color}-500 rounded-full cursor-pointer`}
            >
              {isPending ? <Spinner2 w={10} h={10} /> : el.Icon}
            </span>
          ),
        }))}
        isFetching={isFetching}
        title={t("dashboard.navLinks.profile-update")}
        acceptRoute="messages"
      />
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
    </>
  );
}
