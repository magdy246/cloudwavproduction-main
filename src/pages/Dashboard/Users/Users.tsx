import { useMutation, useQuery } from "@tanstack/react-query";
import { axiosServices } from "../../../utils/axios";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { TableOfContent } from "../../../components/DashboardComponents/Table/Table";

import { RiDeleteBinLine } from "@remixicon/react";
import { AxiosError } from "axios";
import Swal from "sweetalert2";
import { Spinner2 } from "../../../components/Spinner/Spinner";

export default function Users() {
  const { t } = useTranslation();

  const {
    data: users,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["users"],
    queryFn: () => axiosServices.get("/admin/users"),
    select: (data) => data.data,
  });

  const { mutate, isPending } = useMutation<any, AxiosError<Error>, number>({
    mutationFn: (id) => axiosServices.delete(`/admin/users/${id}`),
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
      color: "red",
      Icon: <RiDeleteBinLine />,
      label: "delete",
    },
  ];

  return (
    <TableOfContent
      dataBody={users?.users}
      refetch={refetch}
      dataHead={[
        {
          label: t("dashboard.requestACreatorPage.name"),
          name: "name",
        },
        {
          label: t("dashboard.requestACreatorPage.role"),
          name: "role",
        },
        {
          label: t("dashboard.requestACreatorPage.email"),
          name: "email",
          select: (e) => (
            <Link className="underline" to={`mailto:${e}`}>
              {e}
            </Link>
          ),
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
      title={t("dashboard.navLinks.users")}
      acceptRoute="users"
    />
  );
}
