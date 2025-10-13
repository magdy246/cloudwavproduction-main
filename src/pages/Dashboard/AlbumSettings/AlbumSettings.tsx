import { useTranslation } from "react-i18next";
import { TableOfContent } from "../../../components/DashboardComponents/Table/Table";
import { useMutation, useQuery } from "@tanstack/react-query";
import { axiosServices } from "../../../utils/axios";
import { ToastContainer } from "react-toastify";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { useRef, useState } from "react";
import { RiDeleteBinLine, RiUploadLine } from "@remixicon/react";
import Swal from "sweetalert2";
import { AxiosError } from "axios";
import { Spinner2 } from "../../../components/Spinner/Spinner";
import AnimationLink from "../../../components/AnimationLink/AnimationLink";
import Dialog from "../../../components/Dialog/Dialog";
import TextField from "../../../components/Form/TextField/TextField";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import SelectField from "../../../components/Form/SelectField/SelectField";

export default function AlbumSettings() {
  const coverImageRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();
  const [fullPreview, setFullPreview] = useState<string | null>(null);
  const [albumId, setAlbumId] = useState<number | null>(null);
  const imageBaseUrl = "https://api.cloudwavproduction.com/storage/";
  const options = [
    { id: 1, name: "Rap" },
    { id: 2, name: "pop" },
    { id: 3, name: "Blues" },
    { id: 4, name: "Rock" },
    { id: 5, name: "Mahraganat" },
    { id: 6, name: "Jazz" },
    { id: 7, name: "Metal & Heavy Metal" },
    { id: 8, name: "Sonata" },
    { id: 9, name: "Symphony" },
    { id: 10, name: "Orchestra" },
    { id: 11, name: "Concerto" },
  ];
  const schema = z.object({
    title: z.string({ message: t("validation.required") }),
    cover_image: z.instanceof(File, { message: t("validation.required") }),
    division: z.string({ message: t("validation.required") }),
    file: z.instanceof(File, { message: t("validation.required") }),
  });
  type TFields = z.infer<typeof schema>;

  const {
    data: albums = [],
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["albums-admin"],
    queryFn: () => axiosServices.get("/albums"),
    select: (data) => data.data,
  });

  const { mutate: deleteAlbum, isPending } = useMutation<
    any,
    AxiosError<Error>,
    number
  >({
    mutationFn: (id) => axiosServices.delete(`/admin/albums/${id}`),
    onSuccess: (data) => {
      Swal.fire(data.data.message, "", "success");
      refetch();
    },
    onError: (error) => {
      Swal.fire(error.response?.data.message, "", "error");
    },
  });

  const { mutate: uploadAlbumSong, isPending: uploading } = useMutation<
    any,
    AxiosError<Error>,
    FormData
  >({
    mutationFn: (data) =>
      axiosServices.post(`albums/${data.get("album_ids")}/add-songs`, data, {
        headers: {
          "Content-Type": "multipart/from-data",
        },
      }),
    onSuccess: (data) => {
      Swal.fire(data.data.message, "", "success");
      refetch();
      handleReset();
      setAlbumId(null);
    },
    onError: (error) => {
      Swal.fire(error.response?.data.message, "", "error");
    },
  });

  function handleReset() {
    reset();
    if (coverImageRef.current) coverImageRef.current.value = "";
    if (fileRef.current) fileRef.current.value = "";
  }

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
    formData.append("cover_image", data.cover_image);
    formData.append("file", data.file);
    formData.append("division", data.division);
    formData.append("album_ids", String(albumId));

    uploadAlbumSong(formData);
  };
  return (
    <>
      <TableOfContent
        dataBody={albums}
        isFetching={isFetching}
        dataHead={[
          {
            label: t("dashboard.requestACreatorPage.title"),
            name: "title",
          },
          {
            label: t("dashboard.requestACreatorPage.artist"),
            name: "artist",
            select: (e) => e.name,
          },
          {
            label: t("dashboard.requestACreatorPage.album"),
            name: "id",
            select: (id) => (
              <AnimationLink to={`/album/${id}`} children="album song" />
            ),
          },
          {
            label: t("dashboard.requestACreatorPage.album_cover"),
            name: "album_cover",
            select: (e) => (
              <img
                src={imageBaseUrl + e}
                className="aspect-square max-w-15 object-cover cursor-pointer"
                onClick={(e) => setFullPreview(e.currentTarget.src)}
              />
            ),
          },
        ]}
        title={t("dashboard.navLinks.albumSettings")}
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
          {
            Icon: (
              <button className="text-yellow-500 cursor-pointer flex items-center justify-content-center">
                <RiUploadLine />,
              </button>
            ),
            action: (id) => setAlbumId(id),
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
      <ToastContainer />
      <Dialog
        open={!!albumId}
        handleClose={() => {
          reset();
          setAlbumId(null);
        }}
        title="upload Album Song"
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
                  value={field.value || ""}
                  helperText={error?.message}
                />
              );
            }}
          />
          {/* division */}
          <Controller
            control={control}
            name={"division"}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <SelectField
                options={options}
                getOptionLabel={(option: { id: number; name: string }) =>
                  option.name
                }
                onChange={(newValue) => onChange(newValue.name)}
                value={options.find((el) => el.name == value)}
                variant="outline"
                helperText={error?.message}
                legend="division"
                error={!!error}
              />
            )}
          />

          {/* cover_image */}
          <label
            className=" text-sm font-medium mb-1 mt-3 flex items-center justify-center border-purple-500 border-2 border-dashed h-50 dashed rounded-md text-center overflow-hidden "
            htmlFor="cover_image"
          >
            {watch("cover_image") ? (
              <img
                src={URL.createObjectURL(watch("cover_image"))}
                width={"100%"}
                height={"100%"}
                className="object-position-bottom object-contain"
              />
            ) : (
              "Cover Image"
            )}
          </label>
          <Controller
            name="cover_image"
            control={control}
            render={({ field }) => (
              <input
                id="cover_image"
                className="appearance-none hidden"
                type="file"
                accept="image/*"
                ref={coverImageRef}
                onChange={(e) => field.onChange(e.target.files?.[0])}
              />
            )}
          />
          {!!errors.cover_image && (
            <span className="error__message block mt-1">
              {errors.cover_image.message}
            </span>
          )}
          {/* file */}

          <label
            className=" text-sm font-medium mb-1 mt-3 flex items-center justify-center border-purple-500 border-2 border-dashed h-50 dashed rounded-md text-center overflow-hidden "
            htmlFor="file"
          >
            {watch("file") ? (
              <audio src={URL.createObjectURL(watch("file"))} controls />
            ) : (
              "song Path"
            )}
          </label>
          <Controller
            name="file"
            control={control}
            render={({ field }) => (
              <input
                id="file"
                className="appearance-none hidden"
                type="file"
                accept="audio/*"
                ref={fileRef}
                onChange={(e) => field.onChange(e.target.files?.[0])}
              />
            )}
          />
          {!!errors.file && (
            <span className="error__message block mt-1">
              {errors.file.message}
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
    </>
  );
}
