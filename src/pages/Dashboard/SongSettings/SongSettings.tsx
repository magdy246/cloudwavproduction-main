import { useTranslation } from "react-i18next";
import { TableOfContent } from "../../../components/DashboardComponents/Table/Table";
import { useMutation, useQuery } from "@tanstack/react-query";
import { axiosServices } from "../../../utils/axios";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { useState } from "react";
import { RiDeleteBinLine } from "@remixicon/react";
import Swal from "sweetalert2";
import { AxiosError } from "axios";
import { Spinner2 } from "../../../components/Spinner/Spinner";

export default function SongSettings() {
  const { t } = useTranslation();
  const [fullPreview, setFullPreview] = useState<string | null>(null);
  const baseUrl = "https://api.cloudwavproduction.com/storage/"
  const {
    data: songs = [],
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["songs-admin"],
    queryFn: () => axiosServices.get("/Songs"),
    select: (data) => data.data,
  });

  const { mutate: deleteAlbum, isPending } = useMutation<
    any,
    AxiosError<Error>,
    number
  >({
    mutationFn: (id) => axiosServices.delete(`/admin/songs/${id}`),
    onSuccess: (data) => {
      Swal.fire(data.data.message, "", "success");
      refetch();
    },
    onError: (error) => {
      Swal.fire(error.response?.data.message, "", "error");
    },
  });

  return (
    <>
      <TableOfContent
        dataBody={songs}
        isFetching={isFetching}
        dataHead={[
          {
            label: t("dashboard.requestACreatorPage.title"),
            name: "title",
          },
          {
            label: t("dashboard.requestACreatorPage.artist"),
            name: "artist_name",
          },
          {
            label: t("dashboard.requestACreatorPage.likeCount"),
            name: "likes_count",
          },
          {
            label: t("dashboard.requestACreatorPage.cover_url"),
            name: "cover_url",
            select: (e) => (
              <img
                src={e}
                className="aspect-square max-w-15 object-cover cursor-pointer"
                onClick={(e) => setFullPreview(e.currentTarget.src)}
              />
            ),
          },
          {
            label: t("dashboard.requestACreatorPage.sound"),
            name: "song_url",
            select: (e) => <audio src={baseUrl + e} controls />,
          },
        ]}
        title={t("dashboard.navLinks.songSettings")}
        actions={[
          {
            Icon: (
              <button
                disabled={isPending}
                className="disabled:opacity-50 text-red-500 cursor-pointer flex items-center justify-content-center"
              >
                {isPending ? (
                  <Spinner2 w={6} h={6} />
                ) : (
                  <RiDeleteBinLine className="text-red-500" />
                )}
                ,
              </button>
            ),
            action: (id) => deleteAlbum(id),
          },
        ]}
        acceptRoute=""
        refetch={refetch}
      />
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
    </>
  );
}
