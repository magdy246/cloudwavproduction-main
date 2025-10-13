import { useTranslation } from "react-i18next";
import { TableOfContent } from "../../../components/DashboardComponents/Table/Table";
import { useMutation, useQuery } from "@tanstack/react-query";
import { axiosServices } from "../../../utils/axios";
import { ToastContainer } from "react-toastify";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { Dispatch, SetStateAction, useRef, useState } from "react";
import {
  RiAlbumLine,
  RiDeleteBinLine,
  RiEditLine,
  RiMusicLine,
} from "@remixicon/react";
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

function UploadSong({
  setArtistId,
  setShowUploadDialog,
  showUploadDialog,
  artistId,
  refetch,
}: {
  setArtistId: Dispatch<SetStateAction<number | null>>;
  setShowUploadDialog: Dispatch<SetStateAction<boolean>>;
  showUploadDialog: boolean;
  artistId: number | null;
  refetch: () => void;
}) {
  const coverPathRef = useRef<HTMLInputElement>(null);
  const songPathRef = useRef<HTMLInputElement>(null);

  const { t } = useTranslation();
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
    cover_path: z.instanceof(File, { message: t("validation.required") }),
    division: z.string({ message: t("validation.required") }),
    song_path: z.instanceof(File, { message: t("validation.required") }),
  });

  const { mutate: uploadSong, isPending: uploading } = useMutation<
    any,
    AxiosError<{ error: string }>,
    FormData
  >({
    mutationFn: (data) =>
      axiosServices.post("/admin/songs/upload", data, {
        headers: {
          "Content-Type": "multipart/from-data",
        },
      }),
    onSuccess: (data) => {
      Swal.fire(data.data.message, "", "success");
      refetch();
      handleReset();
      setArtistId(null);
      setShowUploadDialog(false);
    },
    onError: (error) => {
      Swal.fire(error.response?.data.error, "", "error");
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

  function handleReset() {
    reset();
    if (songPathRef.current) songPathRef.current.value = "";
    if (coverPathRef.current) coverPathRef.current.value = "";
  }

  const onSubmit: SubmitHandler<TFields> = (data) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("cover_path", data.cover_path);
    formData.append("song_path", data.song_path);
    formData.append("division", data.division);
    // if (artistId !== null) {
    formData.append("artist_id", String(artistId));
    // }

    uploadSong(formData);
  };

  return (
    <Dialog
      open={!!showUploadDialog}
      handleClose={() => {
        handleReset();
        setShowUploadDialog(false);
      }}
      title="upload song"
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
                value={field.value || ""}
                error={!!error}
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
        {/* album cover */}
        <label
          className=" text-sm font-medium mb-1 mt-3 flex items-center justify-center border-purple-500 border-2 border-dashed h-50 dashed rounded-md text-center overflow-hidden "
          htmlFor="cover_path"
        >
          {watch("cover_path") ? (
            <img
              src={URL.createObjectURL(watch("cover_path"))}
              width={"100%"}
              height={"100%"}
              className="object-position-bottom object-contain"
            />
          ) : (
            "Cover Path"
          )}
        </label>
        <Controller
          name="cover_path"
          control={control}
          render={({ field }) => (
            <input
              id="cover_path"
              className="appearance-none hidden"
              type="file"
              accept="image/*"
              ref={coverPathRef}
              onChange={(e) => field.onChange(e.target.files?.[0])}
            />
          )}
        />
        {!!errors.cover_path && (
          <span className="error__message block mt-1">
            {errors.cover_path.message}
          </span>
        )}
        {/* album cover */}
        <label
          className=" text-sm font-medium mb-1 mt-3 flex items-center justify-center border-purple-500 border-2 border-dashed h-50 dashed rounded-md text-center overflow-hidden "
          htmlFor="song_path"
        >
          {watch("song_path") ? (
            <audio src={URL.createObjectURL(watch("song_path"))} controls />
          ) : (
            "song Path"
          )}
        </label>
        <Controller
          name="song_path"
          control={control}
          render={({ field }) => (
            <input
              id="song_path"
              className="appearance-none hidden"
              type="file"
              accept="audio/*"
              ref={songPathRef}
              onChange={(e) => field.onChange(e.target.files?.[0])}
            />
          )}
        />
        {!!errors.song_path && (
          <span className="error__message block mt-1">
            {errors.song_path.message}
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
function UpdateProfile({
  setArtistId,
  artistId,
  setShowUpdateDialog,
  showUpdateDialog,
  refetch,
}: {
  setArtistId: Dispatch<SetStateAction<number | null>>;
  artistId: number | null;
  setShowUpdateDialog: Dispatch<SetStateAction<boolean>>;
  showUpdateDialog: boolean;
  refetch: () => void;
}) {
  const { t } = useTranslation();
  const profileImageRef = useRef<HTMLInputElement>(null);
  const schema = z.object({
    name: z.string({ message: t("validation.required") }),
    profile_image: z.instanceof(File, { message: t("validation.required") }),
  });

  const { mutate: updateProfile, isPending: uploading } = useMutation<
    any,
    AxiosError<Error>,
    FormData
  >({
    mutationFn: (data) =>
      axiosServices.post(
        `/admin/artists/${data.get("artist_id")}/update-image`,
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
      handleReset();
      setArtistId(null);
      setShowUpdateDialog(false);
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
    formData.append("name", data.name);
    formData.append("profile_image", data.profile_image);
    // if (artistId !== null) {
    formData.append("artist_id", String(artistId));
    // }

    updateProfile(formData);
  };

  function handleReset() {
    reset();
    if (profileImageRef.current) profileImageRef.current.value = "";
  }

  return (
    <Dialog
      open={showUpdateDialog}
      handleClose={() => {
        reset();
        setShowUpdateDialog(false);
      }}
      title="update profile"
    >
      <div className="p-3">
        <Controller
          control={control}
          name={"name"}
          render={({ field, fieldState: { error } }) => {
            return (
              <TextField
                legend={t("name")}
                type="text"
                {...field}
                value={field.value || ""}
                error={!!error}
                helperText={error?.message}
              />
            );
          }}
        />
        {/* album cover */}
        <label
          className=" text-sm font-medium mb-1 mt-3 flex items-center justify-center border-purple-500 border-2 border-dashed h-50 dashed rounded-md text-center overflow-hidden "
          htmlFor="profile_image"
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
              id="profile_image"
              className="appearance-none hidden"
              type="file"
              accept="image/*"
              ref={profileImageRef}
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
function UploadAlbum({
  setArtistId,
  artistId,
  setShowAlbumDialog,
  showAlbumDialog,
  refetch,
}: {
  setArtistId: Dispatch<SetStateAction<number | null>>;
  artistId: number | null;
  setShowAlbumDialog: Dispatch<SetStateAction<boolean>>;
  showAlbumDialog: boolean;
  refetch: () => void;
}) {
  const albumCoverRef = useRef<HTMLInputElement>(null);

  const { t } = useTranslation();
  const schema = z.object({
    title: z.string({ message: t("validation.required") }),
    album_cover: z.instanceof(File, { message: t("validation.required") }),
  });

  const { mutate: updateProfile, isPending: uploading } = useMutation<
    any,
    AxiosError<Error>,
    FormData
  >({
    mutationFn: (data) =>
      axiosServices.post(`/admin/albums/upload`, data, {
        headers: {
          "Content-Type": "multipart/from-data",
        },
      }),
    onSuccess: (data) => {
      Swal.fire(data.data.message, "", "success");
      refetch();
      handleReset();
      setArtistId(null);
      setShowAlbumDialog(false);
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

  function handleReset() {
    reset();
    if (albumCoverRef.current) albumCoverRef.current.value = "";
  }
  const onSubmit: SubmitHandler<TFields> = (data) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("album_cover", data.album_cover);
    formData.append("artist_id", String(artistId));

    updateProfile(formData);
  };

  return (
    <Dialog
      open={showAlbumDialog}
      handleClose={() => {
        handleReset();
        setShowAlbumDialog(false);
      }}
      title="upload Album"
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
        {/* album cover */}
        <label
          className=" text-sm font-medium mb-1 mt-3 flex items-center justify-center border-purple-500 border-2 border-dashed h-50 dashed rounded-md text-center overflow-hidden "
          htmlFor="album_cover"
        >
          {watch("album_cover") ? (
            <img
              src={URL.createObjectURL(watch("album_cover"))}
              width={"100%"}
              height={"100%"}
              className="object-position-bottom object-contain"
            />
          ) : (
            "Album Cover"
          )}
        </label>
        <Controller
          name="album_cover"
          control={control}
          render={({ field }) => (
            <input
              id="album_cover"
              className="appearance-none hidden"
              type="file"
              accept="image/*"
              onChange={(e) => field.onChange(e.target.files?.[0])}
              ref={albumCoverRef}
            />
          )}
        />
        {!!errors.album_cover && (
          <span className="error__message block mt-1">
            {errors.album_cover.message}
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

export default function ArtistSettings() {
  const { t } = useTranslation();
  const [fullPreview, setFullPreview] = useState<string | null>(null);
  const [artistId, setArtistId] = useState<number | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [showAlbumDialog, setShowAlbumDialog] = useState(false);

  const {
    data: artist = [],
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["artist-admin"],
    queryFn: () => axiosServices.get("/artists"),
    select: (data) => data.data,
  });

  const { mutate: deleteArtist, isPending } = useMutation<
    any,
    AxiosError<Error>,
    number
  >({
    mutationFn: (id) => axiosServices.delete(`/artists/${id}`),
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
        dataBody={artist}
        isFetching={isFetching}
        dataHead={[
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
          },
          {
            label: t("dashboard.requestACreatorPage.whatsapp"),
            name: "whatsapp_number",
          },
          {
            label: t("dashboard.requestACreatorPage.email"),
            name: "email",
          },
          {
            label: t("dashboard.requestACreatorPage.song"),
            name: "id",
            select: (id) => (
              <AnimationLink to={`/artist/${id}`} children="all Songs" />
            ),
          },
          {
            label: t("dashboard.requestACreatorPage.profileImage"),
            name: "profile_image",
            select: (e) => (
              <img
                src={e}
                className="aspect-square max-w-15 object-cover cursor-pointer"
                onClick={(e) => setFullPreview(e.currentTarget.src)}
              />
            ),
          },
        ]}
        title={t("dashboard.navLinks.artistSettings")}
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
            action: (id) => deleteArtist(id),
          },
          {
            Icon: (
              <button className="text-green-500 cursor-pointer flex items-center justify-content-center">
                <RiMusicLine />,
              </button>
            ),
            action: (id) => {
              setArtistId(id);
              setShowUploadDialog(true);
            },
          },
          {
            Icon: (
              <button className="text-blue-500 cursor-pointer flex items-center justify-content-center">
                <RiEditLine />,
              </button>
            ),
            action: (id) => {
              setArtistId(id);
              setShowUpdateDialog(true);
            },
          },
          {
            Icon: (
              <button className="text-yellow-500 cursor-pointer flex items-center justify-content-center">
                <RiAlbumLine />,
              </button>
            ),
            action: (id) => {
              setArtistId(id);
              setShowAlbumDialog(true);
            },
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
      <UploadSong
        setArtistId={setArtistId}
        artistId={artistId}
        refetch={refetch}
        setShowUploadDialog={setShowUploadDialog}
        showUploadDialog={showUploadDialog}
      />
      <UpdateProfile
        setArtistId={setArtistId}
        artistId={artistId}
        refetch={refetch}
        setShowUpdateDialog={setShowUpdateDialog}
        showUpdateDialog={showUpdateDialog}
      />
      <UploadAlbum
        setArtistId={setArtistId}
        artistId={artistId}
        refetch={refetch}
        setShowAlbumDialog={setShowAlbumDialog}
        showAlbumDialog={showAlbumDialog}
      />
    </>
  );
}
