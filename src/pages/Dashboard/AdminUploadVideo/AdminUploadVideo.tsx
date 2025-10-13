import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { axiosServices } from "../../../utils/axios";
import { useParams } from "react-router-dom";
import { TableOfContent } from "../../../components/DashboardComponents/Table/Table";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { Spinner2 } from "../../../components/Spinner/Spinner";
import { RiDeleteBinLine } from "@remixicon/react";
import { AxiosError, AxiosResponse } from "axios";
import Swal from "sweetalert2";

export default function AdminUploadVideo() {
  const { id } = useParams();
  const { t } = useTranslation();
  const [fullPreview, setFullPreview] = useState<string | null>(null);

  const {
    data: videos,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["admin-upload-videos", id],
    queryFn: () => axiosServices.get(`/video-creators/${id}/videos`),
    select: (data) => data.data.videos,
    enabled: !!id,
  });

  const { mutate, isPending } = useMutation<
    AxiosResponse<{ message: string }>,
    AxiosError<Error>,
    number
  >({
    mutationFn: (id) => axiosServices.delete(`/videos/${id}`),
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
        dataBody={videos}
        refetch={refetch}
        dataHead={[
          {
            label: t("dashboard.requestACreatorPage.video"),
            name: "url",
            select: (e) => (
              <video
                src={e}
                className="aspect-square max-w-15 object-cover cursor-pointer"
                onClick={(e) => setFullPreview(e.currentTarget.src)}
              />
            ),
          },
          {
            label: t("dashboard.requestACreatorPage.title"),
            name: "title",
          },
        ]}
        actions={[
          {
            Icon: (
              <button className="text-red-500 cursor-pointer flex items-center justify-content-center">
                {isPending ? <Spinner2 w={10} h={10} /> : <RiDeleteBinLine />},
              </button>
            ),
            action: (id) => mutate(id),
          },
        ]}
        isFetching={isFetching}
        title={t("dashboard.navLinks.uploadVideo")}
        acceptRoute="users"
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
              <video
                src={fullPreview}
                className="w-full max-h-[80vh] object-contain aseptic-video"
                controls
              />
            </div>
          )}
        </div>,
        document.body
      )}
    </>
  );
}
