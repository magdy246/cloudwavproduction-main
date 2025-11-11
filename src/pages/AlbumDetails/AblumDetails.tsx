/* eslint-disable @typescript-eslint/no-explicit-any */
import { RiDeleteBinLine, RiLoader2Line, RiUploadLine } from "@remixicon/react";

import { Dispatch, SetStateAction, useEffect, useState, useRef } from "react";
// import { getImagePath } from "../../utils/functions";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { axiosServices } from "../../utils/axios";
// import { ImageComponent } from "../../components/ImageComponent/ImageComponent";
// import useSnackbar from "../../components/Snackbar/Snackbar";
// import { Spinner2 } from "../../components/Spinner/Spinner";
import SectionLoading from "../../components/SectionLoading/SectionLoading";
import { TTrendingSong, usePlayer } from "../../Context/PlayerContext";
// import clsx from "clsx";
import { useAuth } from "../../Providers/AuthContext";
import NoResultFound from "../../components/NoResultFound/NoResultFound";
import { RiMusic2Line } from "@remixicon/react";
import Dialog from "../../components/Dialog/Dialog";
import { getImagePath } from "../../utils/functions";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { AxiosError, AxiosResponse } from "axios";
import Swal from "sweetalert2";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Spinner2 } from "../../components/Spinner/Spinner";
import TextField from "../../components/Form/TextField/TextField";
import { useTranslation } from "react-i18next";
import SelectField from "../../components/Form/SelectField/SelectField";
import {
  uploadAudioToCloudinary,
  uploadImageToCloudinary,
  UploadProgress,
  clearUploadState,
} from "../../utils/cloudinaryUpload";

function AlbumSong({
  song,
  i,
}: {
  song: TTrendingSong & { 
    cover_image: string;
    song_url?: string;
    artist_name?: string;
    isLiked?: boolean;
  };
  i: number;
}) {
  const { setCurrentSong } = usePlayer();
  // const auth = useAuth();
  // const { Content, handleChange } = useSnackbar();
  // const [isLiking, setIsLiking] = useState(false);
  // const [isDownloading, setIsDownloading] = useState(false);
  // const navigate = useNavigate();
  // const { mutate,isSuccess:liked } = useMutation<any, any, number>({
  //   mutationKey: ["add-like"],
  //   mutationFn: (id) => axiosServices.post(`/songs/${id}/like`),
  //   onSuccess: (data) => {
  //     setIsLiking(false);
  //     handleChange(
  //       data.data.isLiked ? "like successfully" : "like remove",
  //       "success"
  //     );
  //   },
  //   onError: () => {
  //     setIsLiking(false);
  //   },
  // });

  // const { mutate: download,  } = useMutation<
  //   any,
  //   any,
  //   number
  // >({
  //   mutationKey: ["download-song"],
  //   mutationFn: (id) => axiosServices.get(`/songs/download-url/${id}`),
  //   onSuccess: (data) => {
  //     setIsDownloading(false);
  //     const url = data.data;
  //     const button = document.createElement("a");
  //     button.download = "song";
  //     button.href = url.signed_url;
  //     button.click();
  //   },
  //   onError: () => {
  //     setIsDownloading(false);
  //   },
  // });

  // const handleLike = (id: number) => {
  //   if (!auth?.isLogin) navigate("/login");
  //   setIsLiking(true);
  //   mutate(id);
  // };

  // const handleDownload = (id: number) => {
  //   if (!auth?.isLogin) navigate("/login");
  //   setIsDownloading(true);
  //   download(id);
  // };

  return (
    <div className="flex flex-col pb-4 relative before:counter mt-6 border-b-1 border-b-[#DDDDDD]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <h3 className="text-xl font-bold mr-3">{i + 1}. </h3>
          <div className="rounded-full bg-green-500 w-15 h-15 flex-center mx-3 text-white overflow-hidden">
            <img
              src={song.cover_image}
              alt={song.title}
              className="min-w-full min-h-full object-cover"
            />
          </div>
          <div>
            <button
              onClick={() =>
                setCurrentSong({
                  ...song,
                  cover_url: song.cover_image || song.cover_url || '',
                  cover_path: song.cover_image || song.cover_path || '',
                  // Map song_url to audio_url for player
                  audio_url: song.song_url || song.audio_url || '',
                  artist: song.artist_name || song.artist || 'Unknown Artist',
                  isLiked: song.isLiked || false,
                } as any)
              }
              className="font-bold text-2xl cursor-pointer text-green-500"
            >
              {song.title}
            </button>
            <p className="font-normal text-[18px]">{song.artist_name || song.artist}</p>
          </div>
        </div>

        <div className="actions-buttons flex items-center gap-3">
          {/* <button
            onClick={() => handleLike(song.id)}
            className={clsx("text-black", liked && "text-red-500")}
          >
            {isLiking ? (
              <Spinner2 w={6} h={6} b={"black"} />
            ) : (
              <RiHeartFill size={30} />
            )}
          </button> */}
          {/* <button onClick={() => handleDownload(song.id)}>
            {isDownloading ? (
              <Spinner2 w={6} h={6} b={"black"} />
            ) : (
              <RiDownload2Line size={30} />
            )}
          </button> */}
        </div>
      </div>
    </div>
  );
}

interface TAlbum {
  id: number;
  title: string;
  album_cover: string;
}

export default function AlbumDetails() {
  const { id } = useParams();
  const [albumId, setAlbumId] = useState<null | number>(null);
  const [albumData, setAlbumData] = useState<null | TAlbum>(null);
  const navigate = useNavigate();
  const auth = useAuth();
  // Utility function to convert relative path to full URL
  const getFullImageUrl = (path: string | undefined): string => {
    if (!path) return "";
    // If it's already a full URL (starts with http), return as is
    if (path.startsWith("http")) return path;
    // If it's a relative path, convert to full URL
    return getImagePath(path);
  };

  const {
    data: album = { songs: [], album: {} },
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["album", id],
    queryFn: () => axiosServices.get("/albums/" + id),
    select: (data) => {
      if (!data?.data) return data?.data;
      
      // Process album data
      const processedAlbum = {
        ...data.data.album,
        album_cover: getFullImageUrl(data.data.album?.album_cover),
      };
      
      // Process songs data
      const processedSongs = data.data.songs?.map((song: any) => ({
        ...song,
        cover_url: song.cover_image || song.cover_url || '',
        cover_path: song.cover_image || song.cover_path || '',
        // Map song_url to audio_url for player compatibility
        audio_url: song.song_url || song.audio_url || '',
        // Map artist_name to artist if needed
        artist: song.artist_name || song.artist || 'Unknown Artist',
        isLiked: song.isLiked || false,
      })) || [];
      
      return {
        album: processedAlbum,
        songs: processedSongs,
      };
    },
  });

  const { mutate: deleteAlbum, isPending: isDeletingAlbum } = useMutation<
    any,
    AxiosError<{ error: string }>,
    number
  >({
    mutationFn: (id) => axiosServices.delete("/albums-delete/" + id),
    onSuccess: () => {
      Swal.fire("album deleted successfully", "", "success");
      navigate(-1)

    },
    onError: (error) => {
      Swal.fire(error.response?.data.error, "", "error");
    },
  });
  return (
    <>
      <div className="m-8 ">
        {isFetching ? (
          // loading section
          <div>
            <div className="flex items-center gap-3">
              <SectionLoading className="w-40 h-40 rounded" />
              <div>
                <SectionLoading className="w-40 h-7 mb-3 rounded" />
                <SectionLoading className="w-40 h-4 rounded" />
              </div>
            </div>
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="mt-4 flex items-center">
                  <SectionLoading className="w-20 h-20 rounded-full" />
                  <div className="ml-5 flex-1">
                    <SectionLoading className="w-full h-7 mb-3 rounded" />
                    <SectionLoading className="w-full h-4 rounded" />
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-6 mb-6">
              <div
                className="overflow-hidden size-40 rounded-full cursor-pointer relative group"
                onClick={
                  auth?.authData?.artist_id == album.album?.artist.id
                    ? () => setAlbumData(album.album)
                    : () => {}
                }
              >
                <img
                  src={album?.album?.album_cover}
                  alt={album?.album?.title}
                  className=" min-h-full min-w-full object-cover"
                />
                {auth?.authData?.artist_id == album.album?.artist.id && (
                  <div className="flex-center absolute top-0 left-0 w-full h-full bg-black text-green-500 group-hover:opacity-100 opacity-0 transition-opacity">
                    <RiUploadLine size={30} />
                  </div>
                )}
              </div>
              <div className="details flex flex-col">
                <h3 className="text-2xl font-semibold capitalize">
                  {album?.album?.title}
                </h3>
                <p className="text-2xl font-normal mb-3">
                  {album?.album?.artist.name}
                </p>
              </div>
            </div>
            {/* upload song */}
            {auth?.authData?.artist_id == album.album?.artist.id && (
              <button
                onClick={() => setAlbumId(album?.album.id)}
                className="flex items-center justify-center gap-2 cursor-pointer bg-green-500 text-white  rounded-full w-40 h-10 p-2"
              >
                <RiUploadLine size={20} />
                upload song
              </button>
            )}
            {/* delete album */}
            {auth?.authData?.artist_id == album.album?.artist.id && (
              <button
                onClick={() => deleteAlbum(album?.album.id)}
                disabled={isDeletingAlbum}
                className="flex items-center mt-2 justify-center gap-2 cursor-pointer bg-red-500 text-white  rounded-full w-40 h-10 p-2"
              >
                {isDeletingAlbum ? <RiLoader2Line className="animate-spin"/> :<RiDeleteBinLine size={20} /> }
                delete album
              </button>
            )}
            {/* album Song */}
            {album?.songs?.length == 0 ? (
              <NoResultFound>
                <RiMusic2Line size={50} />
              </NoResultFound>
            ) : (
              album?.songs?.map((song: any, i: number) => (
                <AlbumSong song={song} key={song.id} i={i} />
              ))
            )}
            {/* date release */}
            <p className="mt-11 font-bold text-xl">
              Release Date :
              <span className="font-medium">
                {" "}
                {new Date().toLocaleDateString("US-en", {
                  month: "short",
                  year: "numeric",
                  day: "numeric",
                })}
              </span>
            </p>
          </div>
        )}
      </div>
      <UploadSongToAlbum
        albumId={albumId}
        refetch={refetch}
        setAlbumId={setAlbumId}
      />
      <UpdateAlbum
        album={albumData}
        setAlbum={setAlbumData}
        refetch={refetch}
      />
    </>
  );
}
function UpdateAlbum({
  setAlbum,
  album,
  refetch,
}: {
  setAlbum: Dispatch<SetStateAction<TAlbum | null>>;
  album: TAlbum | null;
  refetch: () => void;
}) {
  const { t } = useTranslation();
  const schema = z.object({
    title: z.string({ message: t("validation.required") }),
    album_cover: z.instanceof(File, { message: t("validation.required") }),
  });

  const { mutate: updateAlbum, isPending: uploading } = useMutation<
    any,
    AxiosError<Error>,
    FormData
  >({
    mutationFn: (data) =>
      axiosServices.post(`album-update/${album!.id}`, data, {
        headers: {
          "Content-Type": "multipart/from-data",
        },
      }),
    onSuccess: (data) => {
      Swal.fire(data.data.message, "", "success");
      refetch();
      reset();
      setAlbum(null);
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
    setValue,
  } = useForm<TFields>({
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<TFields> = (data) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("album_cover", data.album_cover);
    formData.append("_method", "put");

    updateAlbum(formData);
  };

  useEffect(() => {
    if (!album) return;
    setValue("title", album.title);
  }, [album]);

  return (
    <Dialog
      open={!!album}
      handleClose={() => {
        reset();
        setAlbum(null);
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
                helperText={error?.message}
              />
            );
          }}
        />
        {/* album cover */}
        <label
          className=" text-sm font-medium mb-1 mt-3 flex items-center justify-center border-purple-500 border-2 border-dashed h-50 dashed rounded-md text-center overflow-hidden "
          htmlFor="cover_path"
        >
          {watch("album_cover") ? (
            <img
              src={URL.createObjectURL(watch("album_cover"))}
              width={"100%"}
              height={"100%"}
              className="object-position-bottom object-contain"
            />
          ) : (
            "Cover Path"
          )}
        </label>
        <Controller
          name="album_cover"
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

function UploadSongToAlbum({
  albumId,
  refetch,
  setAlbumId,
}: {
  albumId: number | null;
  refetch: () => void;
  setAlbumId: Dispatch<SetStateAction<number | null>>;
}) {
  const { t } = useTranslation();
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const CLOUD_NAME = "dg0zyscka";
  const UPLOAD_PRESET = "cloudwav";

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
    division: z.string({ message: t("validation.required") }),
    title: z.string({ message: t("validation.required") }),
    cover_image: z.instanceof(File, { message: t("validation.required") }),
    file: z.instanceof(File, { message: t("validation.required") }),
  });
  type TFields = z.infer<typeof schema>;

  const { mutate: saveSongToBackend, isPending: saving } = useMutation<
    AxiosResponse<{ message: string }>,
    AxiosError<Error>,
    { title: string; songUrl: string; coverUrl: string; division: string; albumId: number }
  >({
    mutationFn: ({ title, songUrl, coverUrl, division, albumId }) => {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("song_url", songUrl); // Cloudinary URL
      formData.append("cover_url", coverUrl); // Cloudinary URL
      formData.append("division", division);
      
      return axiosServices.post(`albums/${albumId}/songs`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: (data) => {
      Swal.fire(data.data.message, "", "success");
      reset();
      refetch();
      setAlbumId(null);
      setUploadProgress(null);
      setIsUploading(false);
      if (watch("file")) {
        clearUploadState(watch("file")!);
      }
    },
    onError: (error) => {
      Swal.fire(error.response?.data.message || "Error saving song", "", "error");
      setUploadProgress(null);
      setIsUploading(false);
    },
  });

  const {
    control,
    formState: { errors },
    watch,
    reset,
    handleSubmit,
  } = useForm<TFields>({
    resolver: zodResolver(schema),
  });

  // Cleanup on unmount or dialog close
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
  };

  const onSubmit: SubmitHandler<TFields> = async (data) => {
    try {
      setIsUploading(true);
      const totalSize = data.file.size + data.cover_image.size;
      setUploadProgress({
        loaded: 0,
        total: totalSize,
        percentage: 0,
        speed: 0,
        timeRemaining: 0,
        uploadedChunks: 0,
        totalChunks: 2,
      });

      // Create abort controller for cancellation
      abortControllerRef.current = new AbortController();

      // Upload song to Cloudinary
      const songResult = await uploadAudioToCloudinary(data.file, {
        cloudName: CLOUD_NAME,
        uploadPreset: UPLOAD_PRESET,
        folder: "cloudwav/songs",
        onProgress: (progress) => {
          setUploadProgress({
            ...progress,
            total: totalSize,
            uploadedChunks: 1,
            totalChunks: 2,
          });
        },
        signal: abortControllerRef.current.signal,
      });

      // Upload cover image to Cloudinary
      const coverResult = await uploadImageToCloudinary(data.cover_image, {
        cloudName: CLOUD_NAME,
        uploadPreset: UPLOAD_PRESET,
        folder: "cloudwav/covers",
        onProgress: (progress) => {
          const songProgress = songResult.bytes;
          const coverProgress = progress.loaded;
          setUploadProgress({
            loaded: songProgress + coverProgress,
            total: totalSize,
            percentage: Math.round(((songProgress + coverProgress) / totalSize) * 100),
            speed: progress.speed,
            timeRemaining: progress.timeRemaining,
            uploadedChunks: 2,
            totalChunks: 2,
          });
        },
        signal: abortControllerRef.current.signal,
      });

      // Upload complete
      setUploadProgress({
        loaded: totalSize,
        total: totalSize,
        percentage: 100,
        speed: 0,
        timeRemaining: 0,
        uploadedChunks: 2,
        totalChunks: 2,
      });

      setIsUploading(false);
      saveSongToBackend({
        title: data.title,
        songUrl: songResult.secure_url,
        coverUrl: coverResult.secure_url,
        division: data.division,
        albumId: albumId!,
      });
    } catch (error: any) {
      setIsUploading(false);
      if (error.message === "Upload aborted") {
        Swal.fire("Upload cancelled", "", "info");
      } else {
        Swal.fire(
          "Error uploading song",
          error.message || "Please try again",
          "error"
        );
      }
      setUploadProgress(null);
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsUploading(false);
    setUploadProgress(null);
  };
  return (
    <Dialog
      open={!!albumId}
      handleClose={() => {
        if (isUploading && abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        reset();
        setAlbumId(null);
        setUploadProgress(null);
        setIsUploading(false);
        if (watch("file")) {
          clearUploadState(watch("file")!);
        }
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
                value={field.value ? field.value : ""}
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
              variant="contained"
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
            "Song Cover"
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
              onChange={(e) => field.onChange(e.target.files?.[0])}
            />
          )}
        />
        {!!errors.file && (
          <span className="error__message block mt-1">
            {errors.file.message}
          </span>
        )}

        {/* File Info */}
        {watch("file") && !isUploading && (
          <div className="mt-3 p-3 bg-gray-50 rounded-md">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">File size:</span>
              <span className="font-medium">{formatFileSize(watch("file")!.size)}</span>
            </div>
          </div>
        )}
        
        {/* Enhanced Progress Bar */}
        {uploadProgress && uploadProgress.percentage < 100 && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                Uploading {uploadProgress.uploadedChunks}/{uploadProgress.totalChunks} chunks
              </span>
              <span className="text-sm font-bold text-purple-600">
                {uploadProgress.percentage}%
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-300 flex items-center justify-end pr-2"
                style={{ width: `${uploadProgress.percentage}%` }}
              >
                {uploadProgress.percentage > 10 && (
                  <span className="text-xs text-white font-medium">
                    {uploadProgress.percentage}%
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-gray-500">Speed:</span>
                <span className="ml-1 font-medium text-gray-700">
                  {uploadProgress.speed > 0
                    ? `${uploadProgress.speed.toFixed(2)} MB/s`
                    : "Calculating..."}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Uploaded:</span>
                <span className="ml-1 font-medium text-gray-700">
                  {formatFileSize(uploadProgress.loaded)} / {formatFileSize(uploadProgress.total)}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Time left:</span>
                <span className="ml-1 font-medium text-gray-700">
                  {uploadProgress.timeRemaining > 0
                    ? formatTime(uploadProgress.timeRemaining)
                    : "Calculating..."}
                </span>
              </div>
            </div>

            {isUploading && (
              <button
                onClick={handleCancel}
                className="mt-2 w-full py-2 text-sm text-red-600 hover:text-red-700 font-medium border border-red-300 rounded-md hover:bg-red-50 transition-colors"
              >
                Cancel Upload
              </button>
            )}
          </div>
        )}

        {/* Success State */}
        {uploadProgress && uploadProgress.percentage === 100 && !saving && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center gap-2 text-green-700">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium">Upload complete! Saving to database...</span>
            </div>
          </div>
        )}

        <button
          className="submit__button"
          disabled={isUploading || saving}
          onClick={handleSubmit(onSubmit)}
        >
          {isUploading ? (
            <div className="flex items-center gap-2">
              <Spinner2 w={6} h={6} />
              <span>Uploading...</span>
            </div>
          ) : saving ? (
            <Spinner2 w={6} h={6} />
          ) : (
            "Submit"
          )}
        </button>
      </div>
    </Dialog>
  );
}
