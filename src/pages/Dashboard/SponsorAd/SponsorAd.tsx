import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { TableOfContent } from "../../../components/DashboardComponents/Table/Table";
import { axiosServices } from "../../../utils/axios";
import { useTranslation } from "react-i18next";
import { AxiosError } from "axios";
import Swal from "sweetalert2";
import { RiCheckLine, RiPlayLine, RiStopLine, RiDeleteBinLine } from "@remixicon/react";
import { Spinner2 } from "../../../components/Spinner/Spinner";

export default function SponsorAd() {
  const { t } = useTranslation();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const {
    data: creation = [],
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["sponsor-ad"],
    queryFn: () => axiosServices.get("services/type/Sponsored ads"),
    select: (data) => data.data,
  });

  const { mutate, isPending } = useMutation<
    any,
    AxiosError<Error>,
    { id: number; status: string }
  >({
    mutationFn: (data) =>
      axiosServices.put(`/service-update-status/${data.id}`, {
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

  const { mutate: remove, isPending: deleting } = useMutation<
    any,
    AxiosError<Error>,
    number
  >({
    mutationFn: (id) => {
      setDeletingId(id);
      return axiosServices.delete(`/service-delete/${id}`);
    },
    onSuccess: (data) => {
      Swal.fire(data.data.message || "Service deleted successfully", "", "success");
      refetch();
      setDeletingId(null);
    },
    onError: (error) => {
      Swal.fire(error.response?.data.message || "Error deleting service", "", "error");
      setDeletingId(null);
    },
  });

  const actionsList = [
    {
      color: "green",
      Icon: <RiCheckLine />,
      status: "completed",
      label: "completed",
    },
    {
      color: "yellow",
      Icon: <RiStopLine />,
      status: "pending",
      label: "pending",
    },
    {
      color: "blue",
      Icon: <RiPlayLine />,
      status: "in progress",
      label: "in progress",
    },
    {
      color: "red",
      Icon: <RiDeleteBinLine />,
      label: "delete",
    },
  ];

  return (
    <div>
      <TableOfContent
        dataBody={creation}
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
            label: t("dashboard.requestACreatorPage.details"),
            name: "data",
            select: (e) => JSON.parse(e).details,
          },
          {
            label: t("dashboard.requestACreatorPage.status"),
            name: "status",
          },
        ]}
        actions={actionsList.map((el) => ({
          action: el.status 
            ? (isPending ? () => {} : (id) => mutate({ id, status: el.status }))
            : (id) => remove(id),
          Icon: el.status 
            ? (rowId) => (
                <span
                  className={`w-10 h-10 flex items-center justify-center bg-${el.color}-200 text-black rounded-full cursor-pointer`}
                >
                  {isPending ? <Spinner2 w={10} h={10} /> : el.Icon}
                </span>
              )
            : (rowId) => (
                <span
                  className={`w-10 h-10 flex items-center justify-center bg-${el.color}-200 text-black rounded-full cursor-pointer`}
                >
                  {deletingId === rowId ? <Spinner2 w={10} h={10} /> : el.Icon}
                </span>
              ),
        }))}
        isFetching={isFetching}
        title={t("dashboard.navLinks.SponsoredAds")}
        acceptRoute="service-update-status"
      />
    </div>
  );
}
