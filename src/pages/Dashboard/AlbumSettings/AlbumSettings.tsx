import { useTranslation } from "react-i18next";
import { TableOfContent } from "../../../components/DashboardComponents/Table/Table";
import { useMutation, useQuery } from "@tanstack/react-query";
import { axiosServices } from "../../../utils/axios";
import { ToastContainer } from "react-toastify";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { useRef, useState, useEffect } from "react";
import { RiDeleteBinLine, RiUploadLine } from "@remixicon/react";
import Swal from "sweetalert2";
import { AxiosError, AxiosResponse } from "axios";
import { Spinner2 } from "../../../components/Spinner/Spinner";
import AnimationLink from "../../../components/AnimationLink/AnimationLink";
import Dialog from "../../../components/Dialog/Dialog";
import TextField from "../../../components/Form/TextField/TextField";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import SelectField from "../../../components/Form/SelectField/SelectField";
import {
  uploadAudioToCloudinary,
  uploadImageToCloudinary,
  UploadProgress,
  clearUploadState,
} from "../../../utils/cloudinaryUpload";

export default function AlbumSettings() {
  const coverImageRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();
  const [fullPreview, setFullPreview] = useState<string | null>(null);
  const [albumId, setAlbumId] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const imageBaseUrl = "https://api.cloudwavproduction.com/storage/";
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

  const { mutate: saveSongToBackend, isPending: saving } = useMutation<
    AxiosResponse<{ message: string }>,
    AxiosError<Error>,
    { title: string; songUrl: string; coverUrl: string; division: string; album_ids: number }
  >({
    mutationFn: ({ title, songUrl, coverUrl, division, album_ids }) => {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("song_url", songUrl); // Cloudinary URL
      formData.append("cover_url", coverUrl); // Cloudinary URL
      formData.append("division", division);
      formData.append("album_ids", String(album_ids));
      
      return axiosServices.post(`albums/${album_ids}/add-songs`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: (data) => {
      Swal.fire(data.data.message, "", "success");
      refetch();
      handleReset();
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
        album_ids: albumId!,
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
    </>
  );
}
