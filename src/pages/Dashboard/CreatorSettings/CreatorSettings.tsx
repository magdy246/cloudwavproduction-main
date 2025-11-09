import { RiDeleteBinLine, RiEditLine, RiVideoAddLine } from "@remixicon/react";
import { TableOfContent } from "../../../components/DashboardComponents/Table/Table";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery } from "@tanstack/react-query";
import { axiosServices } from "../../../utils/axios";
import { AxiosError, AxiosResponse } from "axios";
import Swal from "sweetalert2";
import { Dispatch, SetStateAction, useState, useRef, useEffect } from "react";
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
import {
  uploadVideoToCloudinary,
  UploadProgress,
  clearUploadState,
} from "../../../utils/cloudinaryUpload";

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
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [enableCompression, setEnableCompression] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const CLOUD_NAME = "dg0zyscka";
  const UPLOAD_PRESET = "cloudwav";

  const schema = z.object({
    title: z.string({ message: t("validation.required") }),
    video: z.instanceof(File, { message: t("validation.required") }),
  });

  const { mutate: saveVideoToBackend, isPending: saving } = useMutation<
    AxiosResponse<{ message: string }>,
    AxiosError<Error>,
    { title: string; videoUrl: string; publicId?: string; duration?: number; size?: number }
  >({
    mutationFn: ({ title, videoUrl }) => {
      // Send simple JSON - Backend only needs title and video URL
      return axiosServices.post(`/video-creators/${creatorId!}/upload-video`, {
        title,
        video: videoUrl, // Cloudinary URL
      });
    },
    onSuccess: (data) => {
      Swal.fire(data.data.message, "", "success");
      refetch();
      reset();
      setCreatorId(null);
      setOpenDialog(false);
      setUploadProgress(null);
      setIsUploading(false);
      if (watch("video")) {
        clearUploadState(watch("video")!);
      }
    },
    onError: (error) => {
      Swal.fire(error.response?.data.message || "Error saving video", "", "error");
      setUploadProgress(null);
      setIsUploading(false);
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
      setUploadProgress({
        loaded: 0,
        total: data.video.size,
        percentage: 0,
        speed: 0,
        timeRemaining: 0,
        uploadedChunks: 0,
        totalChunks: 1,
      });

      // Create abort controller for cancellation
      abortControllerRef.current = new AbortController();

      const result = await uploadVideoToCloudinary(data.video, {
        cloudName: CLOUD_NAME,
        uploadPreset: UPLOAD_PRESET,
        folder: "cloudwav/videos",
        enableCompression,
        compressionQuality: 80,
        onProgress: (progress) => {
          setUploadProgress(progress);
        },
        signal: abortControllerRef.current.signal,
      });

      // Upload complete
      setUploadProgress({
        loaded: result.bytes,
        total: result.bytes,
        percentage: 100,
        speed: 0,
        timeRemaining: 0,
        uploadedChunks: 1,
        totalChunks: 1,
      });

      setIsUploading(false);
      saveVideoToBackend({
        title: data.title,
        videoUrl: result.secure_url,
        publicId: result.public_id,
        duration: result.duration,
        size: result.bytes,
      });
    } catch (error: any) {
      setIsUploading(false);
      if (error.message === "Upload aborted") {
        Swal.fire("Upload cancelled", "", "info");
      } else {
        Swal.fire(
          "Error uploading video",
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
      open={!!openDialog}
      handleClose={() => {
        if (isUploading && abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        reset();
        setCreatorId(null);
        setOpenDialog(false);
        setUploadProgress(null);
        setIsUploading(false);
        setEnableCompression(false);
        if (watch("video")) {
          clearUploadState(watch("video")!);
        }
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

        {/* File Info */}
        {watch("video") && !isUploading && (
          <div className="mt-3 p-3 bg-gray-50 rounded-md">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">File size:</span>
              <span className="font-medium">{formatFileSize(watch("video")!.size)}</span>
            </div>
            {watch("video")!.size > 50 * 1024 * 1024 && (
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="enableCompression"
                  checked={enableCompression}
                  onChange={(e) => setEnableCompression(e.target.checked)}
                  className="cursor-pointer"
                />
                <label htmlFor="enableCompression" className="text-sm text-gray-600 cursor-pointer">
                  Enable compression (recommended for large files)
                </label>
              </div>
            )}
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

        <div className="flex gap-2 mt-4">
          <button
            className="submit__button flex-1"
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
              "Upload Video"
            )}
          </button>
        </div>
      </div>
    </Dialog>
  );
}

