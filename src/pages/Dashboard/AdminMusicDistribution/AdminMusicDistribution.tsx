import { useMutation, useQuery } from "@tanstack/react-query";
import { TableOfContent } from "../../../components/DashboardComponents/Table/Table";
import { axiosServices } from "../../../utils/axios";
import { useTranslation } from "react-i18next";
import { RiDeleteBinLine } from "@remixicon/react";
import { AxiosError } from "axios";
import Swal from "sweetalert2";
import { Spinner2 } from "../../../components/Spinner/Spinner";

export default function AdminMusicDistribution() {
  const { t } = useTranslation();

  const {
    data: musicDistributions = [],
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["music-distributions"],
    queryFn: () => axiosServices.get("/services/artist"),
    select: (data) => data.data,
  });

  const { mutate: deleteService, isPending: isDeleting } = useMutation<
    any,
    AxiosError<Error>,
    number
  >({
    mutationFn: (id) => axiosServices.delete(`/service-delete/${id}`),
    onSuccess: (data) => {
      Swal.fire(data.data.message || "Service deleted successfully", "", "success");
      refetch();
    },
    onError: (error) => {
      Swal.fire(error.response?.data.message || "Error deleting service", "", "error");
    },
  });

  const actionsList = [
    {
      color: "red",
      Icon: <RiDeleteBinLine />,
      label: "delete",
    },
  ];

  return (
    <TableOfContent
      isFetching={isFetching}
      refetch={refetch}
      dataHead={[
        {
          label: t("dashboard.requestACreatorPage.name"),
          name: "data",
          select: (e) => JSON.parse(e).name,
        },
        {
          label: t("dashboard.requestACreatorPage.email"),
          name: "data",
          select: (e) => JSON.parse(e).email,
        },
        {
          label: t("dashboard.requestACreatorPage.number"),
          name: "data",
          select: (e) => JSON.parse(e).phone,
        },
        {
          label: t("dashboard.requestACreatorPage.whatsapp"),
          name: "data",
          select: (e) => JSON.parse(e).whatsapp_number,
        },
        {
          label: t("dashboard.requestACreatorPage.platform"),
          name: "data",
          select: (e) => JSON.parse(e).platform,
        },
        {
          label: t("dashboard.requestACreatorPage.socialMediaAccount"),
          name: "data",
          select: (e) => <a href={JSON.parse(e).social_media_account}>{JSON.parse(e).social_media_account}</a>,
        },
        {
          label: t("dashboard.requestACreatorPage.details"),
          name: "data",
          select: (e) => JSON.parse(e).details,
        },
        { label: t("dashboard.requestACreatorPage.status"), name: "status" },
        {
          label: t("dashboard.requestACreatorPage.options"),
          name: "data",
          select: (e) => JSON.parse(e).options.map((el: string, index: number) => <p key={index}>{index + 1}- {el}</p>),
        },
      ]}
      actions={actionsList.map((el) => ({
        action: isDeleting ? () => {} : (id) => deleteService(id),
        Icon: (
          <span className="w-10 h-10 flex items-center justify-center bg-red-200 text-red-600 rounded-full cursor-pointer hover:bg-red-300 transition-colors">
            {isDeleting ? <Spinner2 w={10} h={10} /> : el.Icon}
          </span>
        ),
      }))}
      acceptRoute=""
      dataBody={[...musicDistributions].reverse()}
      title={t("dashboard.navLinks.musicDistribution")}
    />
  );
}
