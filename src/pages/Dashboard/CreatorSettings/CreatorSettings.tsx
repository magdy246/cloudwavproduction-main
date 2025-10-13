import { RiDeleteBinLine, RiEditLine, RiVideoAddLine } from "@remixicon/react";
import { TableOfContent } from "../../../components/DashboardComponents/Table/Table";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery } from "@tanstack/react-query";
import { axiosServices } from "../../../utils/axios";
import { AxiosError, AxiosResponse } from "axios";
import Swal from "sweetalert2";
import { Dispatch, SetStateAction, useState } from "react";
import { z } from "zod";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Dialog from "../../../components/Dialog/Dialog";
import { Spinner2 } from "../../../components/Spinner/Spinner";
import { Link } from "react-router-dom";
import clsx from "clsx";
import { createPortal } from "react-dom";
import TextField from "../../../components/Form/TextField/TextField";
import AnimationLink from "../../../components/AnimationLink/AnimationLink";

interface TUpdate {
  setCreatorId: Dispatch<SetStateAction<number | null>>;
  creatorId: number | null;
  refetch: () => void;
}

function UpdateProfile({ setCreatorId, creatorId, refetch }: TUpdate) {
  const { t } = useTranslation();
  const schema = z.object({
    profile_image: z.instanceof(File, { message: t("validation.required") }),
  });

  const { mutate: updateProfile, isPending: uploading } = useMutation<
    AxiosResponse<{ message: string }>,
    AxiosError<Error>,
    FormData
  >({
    mutationFn: (data) =>
      axiosServices.post(
        `/video-creators/${data.get("creator_id")}/update-profile-image`,
        data,
        {
          headers: {
            "Content-Type": "multipart/from-data",
          },
        }
      ),
    onSuccess: (data) => {
      Swal.fire(data.data.message, "", "success");
      refetch();
      reset();
      setCreatorId(null);
    },
    onError: (error) => {
      Swal.fire(error.response?.data.message, "", "error");
    },
  });

  type TFields = z.infer<typeof schema>;
  const {
    control,
    formState: { errors },
    watch,
    reset,
    handleSubmit,
  } = useForm<TFields>({
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<TFields> = (data) => {
    const formData = new FormData();
    formData.append("profile_image", data.profile_image);
    // if (artistId !== null) {
    formData.append("creator_id", String(creatorId));
    // }

    updateProfile(formData);
  };

  return (
    <Dialog
      open={!!creatorId}
      handleClose={() => {
        reset();
        setCreatorId(null);
      }}
      title="Update image"
    >
      <div className="p-3">
        {/* album cover */}
        <label
          className=" text-sm font-medium mb-1 mt-3 flex items-center justify-center border-purple-500 border-2 border-dashed h-50 dashed rounded-md text-center overflow-hidden "
          htmlFor="cover_path"
        >
          {watch("profile_image") ? (
            <img
              src={URL.createObjectURL(watch("profile_image"))}
              width={"100%"}
              height={"100%"}
              className="object-position-bottom object-contain"
            />
          ) : (
            "Cover Path"
          )}
        </label>
        <Controller
          name="profile_image"
          control={control}
          render={({ field }) => (
            <input
              id="cover_path"
              className="appearance-none hidden"
              type="file"
              accept="image/*"
              onChange={(e) => field.onChange(e.target.files?.[0])}
            />
          )}
        />
        {!!errors.profile_image && (
          <span className="error__message block mt-1">
            {errors.profile_image.message}
          </span>
        )}
        {/* album cover */}

        <button
          className="submit__button"
          disabled={uploading}
          onClick={handleSubmit(onSubmit)}
        >
          {uploading ? <Spinner2 w={6} h={6} /> : "Submit"}
        </button>
      </div>
    </Dialog>
  );
}

export default function CreatorSettings() {
  const { t } = useTranslation();
  const [fullPreview, setFullPreview] = useState<string | null>(null);
  const imageBaseUrl = "https://api.cloudwavproduction.com/storage/";
  const [creatorId, setCreatorId] = useState<number | null>(null);
  const [uploadVideo, setUploadVideo] = useState<boolean>(false);

  const {
    data: creators = [],
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["video-creators-admin"],
    queryFn: () => axiosServices.get("/top-video-creators-all"),
    select: (data) => data.data,
  });

  const { mutate, isPending } = useMutation<
    AxiosResponse<{ message: string }>,
    AxiosError<Error>,
    number
  >({
    mutationFn: (id) => axiosServices.delete(`/video-creators-delete/${id}`),
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
        dataBody={creators}
        refetch={refetch}
        dataHead={[
          {
            label: t("dashboard.requestACreatorPage.profileImage"),
            name: "profile_image",
            select: (e) => (
              <img
                src={imageBaseUrl + e}
                className="aspect-square min-w-15 object-cover cursor-pointer"
                onClick={(e) => setFullPreview(e.currentTarget.src)}
              />
            ),
          },
          {
            label: t("dashboard.requestACreatorPage.idCard"),
            name: "id_card",
            select: (e) => (
              <img
                src={imageBaseUrl + e}
                className="aspect-square min-w-15 object-cover cursor-pointer"
                onClick={(e) => setFullPreview(e.currentTarget.src)}
              />
            ),
          },
          {
            label: t("dashboard.requestACreatorPage.name"),
            name: "name",
          },
          {
            label: t("dashboard.requestACreatorPage.division"),
            name: "division",
          },
          {
            label: t("dashboard.requestACreatorPage.number"),
            name: "number",
            select: (e) => (
              <Link className="underline" to={`tel:${e}`}>
                {e}
              </Link>
            ),
          },
          {
            label: t("dashboard.requestACreatorPage.whatsapp"),
            name: "whatsapp_number",
            select: (e) => (
              <Link className="underline" to={`tel:${e}`}>
                {e}
              </Link>
            ),
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
            label: t("dashboard.requestACreatorPage.businessPrice"),
            name: "bussiness_price",
            select: (e) => e || 0,
          },
          {
            label: t("dashboard.requestACreatorPage.privatePrice"),
            name: "private_price",
            select: (e) => e || 0,
          },

          {
            label: t("dashboard.requestACreatorPage.details"),
            name: "details",
            select: (e) => (
              <p
                className="overflow-ellipsis text-nowrap max-w-20 overflow-hidden"
                title={e}
              >
                {e}
              </p>
            ),
          },
          {
            label: t("dashboard.requestACreatorPage.videos"),
            name: "id",
            select: (e) => (
              <AnimationLink to={`/dashboard/creators-video/${e}`}>
                videos
              </AnimationLink>
            ),
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
          {
            Icon: (
              <button className="text-blue-500 cursor-pointer flex items-center justify-content-center">
                <RiEditLine />,
              </button>
            ),
            action: (id) => {
              setCreatorId(id);
            },
          },
          {
            Icon: (
              <button className="text-blue-500 cursor-pointer flex items-center justify-content-center">
                <RiVideoAddLine />,
              </button>
            ),
            action: (id) => {
              setCreatorId(id);
              setUploadVideo(true);
            },
          },
        ]}
        isFetching={isFetching}
        title={t("dashboard.navLinks.creatorSettings")}
        acceptRoute="users"
      />

      <UpdateProfile
        creatorId={creatorId}
        setCreatorId={setCreatorId}
        refetch={refetch}
      />

      <UploadVideo
        creatorId={creatorId}
        uploadVideo={uploadVideo}
        setUploadVideo={setUploadVideo}
        setCreatorId={setCreatorId}
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

function UploadVideo({
  refetch,
  creatorId,
  setCreatorId,
  uploadVideo: openDialog,
  setUploadVideo: setOpenDialog,
}: {
  setCreatorId: Dispatch<SetStateAction<number | null>>;
  creatorId: number | null;
  refetch: () => void;
  uploadVideo: boolean;
  setUploadVideo: Dispatch<SetStateAction<boolean>>;
}) {
  const { t } = useTranslation();
  const schema = z.object({
    title: z.string({ message: t("validation.required") }),
    video: z.instanceof(File, { message: t("validation.required") }),
  });

  const { mutate: uploadVideo, isPending: uploading } = useMutation<
    any,
    AxiosError<Error>,
    FormData
  >({
    mutationFn: (data) =>
      axiosServices.post(`/video-creators/${creatorId!}/upload-video`, data, {
        headers: {
          "Content-Type": "multipart/from-data",
        },
      }),
    onSuccess: (data) => {
      Swal.fire(data.data.message, "", "success");
      refetch();
      reset();
      setCreatorId(null);
      setOpenDialog(false);
    },
    onError: (error) => {
      Swal.fire(error.response?.data.message, "", "error");
    },
  });

  type TFields = z.infer<typeof schema>;

  const {
    control,
    formState: { errors },
    watch,
    reset,
    handleSubmit,
  } = useForm<TFields>({
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<TFields> = (data) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("video", data.video);

    uploadVideo(formData);
  };

  return (
    <Dialog
      open={!!openDialog}
      handleClose={() => {
        reset();
        setCreatorId(null);
        setOpenDialog(false);
      }}
      title="upload Video"
    >
      <div className="p-3">
        <Controller
          control={control}
          name={"title"}
          render={({ field, fieldState: { error } }) => {
            return (
              <TextField
                legend={t("title")}
                type="text"
                {...field}
                error={!!error}
                helperText={error?.message}
              />
            );
          }}
        />
        {/* album cover */}
        <label
          className=" text-sm font-medium mb-1 mt-3 flex items-center justify-center border-purple-500 border-2 border-dashed dashed rounded-md text-center min-h-70 overflow-hidden "
          htmlFor="video"
        >
          {watch("video") ? (
            <video
              src={URL.createObjectURL(watch("video"))}
              controls
              className="object-position-bottom object-cover aspect-video min-w-full"
            />
          ) : (
            "Video"
          )}
        </label>
        <Controller
          name="video"
          control={control}
          render={({ field }) => (
            <input
              id="video"
              className="appearance-none hidden"
              type="file"
              accept="video/*"
              onChange={(e) => field.onChange(e.target.files?.[0])}
            />
          )}
        />
        {!!errors.video && (
          <span className="error__message block mt-1">
            {errors.video.message}
          </span>
        )}
        <button
          className="submit__button"
          disabled={uploading}
          onClick={handleSubmit(onSubmit)}
        >
          {uploading ? <Spinner2 w={6} h={6} /> : "Submit"}
        </button>
      </div>
    </Dialog>
  );
}
