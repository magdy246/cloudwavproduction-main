import { useMutation, useQuery } from "@tanstack/react-query";
import { TableOfContent } from "../../../components/DashboardComponents/Table/Table";
import { axiosServices } from "../../../utils/axios";
import { useTranslation } from "react-i18next";
import { RiDeleteBinLine } from "@remixicon/react";
import { AxiosError } from "axios";
import Swal from "sweetalert2";
import { Spinner2 } from "../../../components/Spinner/Spinner";
export default function Orders() {
  const { t } = useTranslation();
  const {
    data: orders = [],
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: () => axiosServices.get("/orders"),
    select: (data) => data.data,
  });

  const { mutate: deleteOrder, isPending: deleting } = useMutation<
    any,
    AxiosError<Error>,
    number
  >({
    mutationFn: (id) => axiosServices.delete(`/orders/${id}`),
    onSuccess: (data) => {
      Swal.fire(data.data.message || "Order deleted successfully", "", "success");
      refetch();
    },
    onError: (error) => {
      Swal.fire(error.response?.data.message || "Error deleting order", "", "error");
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
    <>
      <TableOfContent
        dataBody={orders}
        refetch={refetch}
        dataHead={[
          {
            label: t("dashboard.requestACreatorPage.businessPrice"),
            name: "bussiness_price",
          },
          {
            label: t("dashboard.requestACreatorPage.privatePrice"),
            name: "private_price",
          },
          {
            label: t("dashboard.requestACreatorPage.video_creator"),
            name: "video_creator",
            select: (e) => e.name,
          },
          {
            label: t("dashboard.requestACreatorPage.user"),
            name: "user",
            select: (e) => e.name,
          },
          {
            label: t("dashboard.requestACreatorPage.number"),
            name: "phone",
          },
          {
            label: t("dashboard.requestACreatorPage.whatsapp"),
            name: "whatsapp",
          },
          {
            label: t("dashboard.requestACreatorPage.status"),
            name: "status",
          },
        ]}
        actions={actionsList.map((el) => ({
          action: deleting ? () => {} : (id) => deleteOrder(id),
          Icon: (
            <span className="w-10 h-10 flex items-center justify-center bg-red-200 text-red-600 rounded-full cursor-pointer hover:bg-red-300 transition-colors">
              {deleting ? <Spinner2 w={10} h={10} /> : el.Icon}
            </span>
          ),
        }))}
        isFetching={isFetching}
        title={t("dashboard.navLinks.orders")}
        acceptRoute="service-update-status"
      />
    </>
  );
}
