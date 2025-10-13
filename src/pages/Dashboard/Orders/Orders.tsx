import { useQuery } from "@tanstack/react-query";
import { TableOfContent } from "../../../components/DashboardComponents/Table/Table";
import { axiosServices } from "../../../utils/axios";
import { useTranslation } from "react-i18next";
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
        actions={[]}
        isFetching={isFetching}
        title={t("dashboard.navLinks.orders")}
        acceptRoute="service-update-status"
      />
    </>
  );
}
