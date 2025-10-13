import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { axiosServices } from "../../../utils/axios";
import { AxiosError } from "axios";
import Swal from "sweetalert2";
import { RiDeleteBinLine } from "@remixicon/react";
import { TableOfContent } from "../../../components/DashboardComponents/Table/Table";
import { Spinner2 } from "../../../components/Spinner/Spinner";

export default function Messages() {
  const { t } = useTranslation();

  const {
    data: messages = [],
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["messages"],
    queryFn: () => axiosServices.get("/messages"),
    select: (data) => data.data,
  });

  const { mutate, isPending } = useMutation<any, AxiosError<Error>, number>({
    mutationFn: (id) => axiosServices.delete(`/admin/messages/${id}`),
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
    },
  ];

  return (
    <TableOfContent
      dataBody={messages}
      refetch={refetch}
      dataHead={[
        {
          label: t("dashboard.requestACreatorPage.first_name"),
          name: "first_name",
        },
        {
          label: t("dashboard.requestACreatorPage.last_name"),
          name: "last_name",
        },
        {
          label: t("dashboard.requestACreatorPage.number"),
          name: "phone",
        },
        {
          label: t("dashboard.requestACreatorPage.email"),
          name: "email",
        },
        {
          label: t("dashboard.requestACreatorPage.message"),
          name: "message",
          select: (e) => <p className="max-w-100 overflow-auto">{e}</p>,
        },
        {
          label: t("dashboard.requestACreatorPage.createdAt"),
          name: "created_at",
          select: (e) => new Date(e).toLocaleString(),
        },
      ]}
      actions={actionsList.map((el) => ({
        action: isPending ? () => {} : (id) => mutate(id),
        Icon: (
          <span
            className={`w-10 h-10 flex items-center justify-center text-red-500 rounded-full cursor-pointer`}
          >
            {isPending ? <Spinner2 w={10} h={10} /> : el.Icon}
          </span>
        ),
      }))}
      isFetching={isFetching}
      title={t("dashboard.navLinks.messages")}
      acceptRoute="messages"
    />
  );
}
