import { useQuery } from "@tanstack/react-query";
import { TableOfContent } from "../../../components/DashboardComponents/Table/Table";
import { axiosServices } from "../../../utils/axios";
import { useTranslation } from "react-i18next";

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
          select: (e) => JSON.parse(e).options.map((el: string, index: number) => <p>{index + 1}- {el}</p>),
        },
      ]}
      actions={[]}
      acceptRoute=""
      dataBody={[...musicDistributions].reverse()}
      title={t("dashboard.navLinks.musicDistribution")}
    />
  );
}
