/* eslint-disable @typescript-eslint/no-explicit-any */
import { DragEvent, useEffect, useRef, useState } from "react";
import songImage from "../../assets/images/song.svg";
import albumImage from "../../assets/images/album.svg";
import clsx from "clsx";
import {
  RiAddLine,
  // RiArrowLeftLine,
  RiArrowRightLine,
  RiCameraLine,
} from "@remixicon/react";
import AnimationLink from "../../components/AnimationLink/AnimationLink";
import Swal from "sweetalert2";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { axiosServices } from "../../utils/axios";
import { AxiosError, AxiosResponse } from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import SelectField from "../../components/Form/SelectField/SelectField";
import { Spinner2 } from "../../components/Spinner/Spinner";
import {
  uploadAudioToCloudinary,
  uploadImageToCloudinary,
  UploadProgress,
  clearUploadState,
} from "../../utils/cloudinaryUpload";

// model

function Model({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (val: boolean) => void;
}) {
  const { t } = useTranslation();
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const CLOUD_NAME = "dg0zyscka";
  const UPLOAD_PRESET = "cloudwav";

  const schema = z.object({
    title: z.string({ message: t("validation.required") }).min(1),
    album_cover: z.instanceof(File, { message: t("validation.required") }),
    // song_path: z.instanceof(File, { message: t("validation.required") }),
  });

  type TFields = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = useForm<TFields>({
    resolver: zodResolver(schema),
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const { mutate: saveAlbumToBackend, isPending: saving } = useMutation<
    AxiosResponse<{ message: string }>,
    AxiosError<{ error: string }>,
    { title: string; coverUrl: string }
  >({
    mutationKey: ["upload-album"],
    mutationFn: ({ title, coverUrl }) => {
      const formData = new FormData();
      formData.append("album_cover", coverUrl); // Cloudinary URL
      formData.append("title", title);
      
      return axiosServices.post("/albums", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: () => {
      toast.success("Uploaded successfully!");
      reset();
      setOpen(false);
      setUploadProgress(null);
      setIsUploading(false);
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || "Error uploading album");
      setUploadProgress(null);
      setIsUploading(false);
    },
  });

  const onSubmit: SubmitHandler<TFields> = async (data) => {
    try {
      setIsUploading(true);
      setUploadProgress({
        loaded: 0,
        total: data.album_cover.size,
        percentage: 0,
        speed: 0,
        timeRemaining: 0,
        uploadedChunks: 0,
        totalChunks: 1,
      });

      abortControllerRef.current = new AbortController();

      // Upload album cover image to Cloudinary
      const coverResult = await uploadImageToCloudinary(data.album_cover, {
        cloudName: CLOUD_NAME,
        uploadPreset: UPLOAD_PRESET,
        folder: "cloudwav/covers",
        onProgress: (progress) => {
          setUploadProgress({
            ...progress,
            uploadedChunks: 1,
            totalChunks: 1,
          });
        },
        signal: abortControllerRef.current.signal,
      });

      setIsUploading(false);
      setUploadProgress({
        loaded: data.album_cover.size,
        total: data.album_cover.size,
        percentage: 100,
        speed: 0,
        timeRemaining: 0,
        uploadedChunks: 1,
        totalChunks: 1,
      });

      // Save album to backend with Cloudinary URL
      saveAlbumToBackend({
        title: data.title,
        coverUrl: coverResult.secure_url,
      });
    } catch (error: any) {
      setIsUploading(false);
      if (error.message === "Upload aborted") {
        Swal.fire("Upload cancelled", "", "info");
      } else {
        Swal.fire(
          "Error uploading album cover",
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

  return (
    <div
      className={clsx(
        "fixed inset-0 backdrop-blur-none bg-black/25 -z-50 flex items-center justify-center opacity-0  transition-all ",
        open && "opacity-100 z-999 backdrop-blur-sm"
      )}
    >
      <div
        className={clsx(
          "bg-white rounded-lg p-6 w-full max-w-md scale-90 transition-all",
          open && "scale-100"
        )}
      >
        <h3 className="text-xl font-semibold mb-4">upload Album</h3>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* album cover */}
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            {...register("title")}
            className="w-full border rounded px-3 py-2"
            disabled={isUploading || saving}
          />
          {!!errors.title && (
            <span className="error__message block mt-1  ">
              {errors.title.message}
            </span>
          )}

          {/* album cover */}
          <label className="block text-sm font-medium mb-1 mt-3">
            Album Cover
          </label>
          <Controller
            name="album_cover"
            control={control}
            render={({ field }) => (
              <input
                type="file"
                accept="image/*"
                onChange={(e) => field.onChange(e.target.files?.[0])}
                disabled={isUploading || saving}
              />
            )}
          />
          {!!errors.album_cover && (
            <span className="error__message block mt-1">
              {errors.album_cover.message}
            </span>
          )}

          {/* Progress Bar */}
          {uploadProgress && uploadProgress.percentage < 100 && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  Uploading cover image...
                </span>
                <span className="text-sm font-bold text-green-500">
                  {uploadProgress.percentage}%
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-300 flex items-center justify-end pr-2"
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
                  <span className="ml-1 font-medium">
                    {uploadProgress.speed > 0
                      ? `${uploadProgress.speed.toFixed(2)} MB/s`
                      : "Calculating..."}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Uploaded:</span>
                  <span className="ml-1 font-medium">
                    {formatFileSize(uploadProgress.loaded)} / {formatFileSize(uploadProgress.total)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Time left:</span>
                  <span className="ml-1 font-medium">
                    {uploadProgress.timeRemaining > 0
                      ? formatTime(uploadProgress.timeRemaining)
                      : "Calculating..."}
                  </span>
                </div>
              </div>

              {isUploading && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="mt-2 w-full py-2 text-sm text-red-400 hover:text-red-300 font-medium border border-red-500 rounded-md hover:bg-red-50 transition-colors"
                >
                  Cancel Upload
                </button>
              )}
            </div>
          )}

          {/* Success State */}
          {uploadProgress && uploadProgress.percentage === 100 && !saving && (
            <div className="mt-4 p-3 bg-green-50 border border-green-500 rounded-md">
              <div className="flex items-center gap-2 text-green-600">
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

          {/* submit button */}
          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={() => {
                if (isUploading && abortControllerRef.current) {
                  abortControllerRef.current.abort();
                }
                setOpen(false);
                setIsUploading(false);
                setUploadProgress(null);
              }}
              className="px-4 py-2 bg-gray-300 rounded"
              disabled={isUploading && !saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isUploading || saving}
              className={clsx(
                "px-4 py-2 bg-green-600 text-white rounded flex items-center justify-center gap-2",
                (isUploading || saving)
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:bg-green-700"
              )}
            >
              {isUploading ? (
                <>
                  <Spinner2 w={4} h={4} b={"white"} />
                  <span>Uploading...</span>
                </>
              ) : saving ? (
                <>
                  <Spinner2 w={4} h={4} b={"white"} />
                  <span>Saving...</span>
                </>
              ) : (
                "Save"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// upload music
function UploadFile({
  setUploadFile,
  setSteps,
}: {
  setUploadFile: (value: File | undefined) => void;
  setSteps: (val: number) => void;
}) {
  const handleDropFile = (e: DragEvent<HTMLDivElement>) => {
    const acceptedFile = ["mp3", "flac", "wav", "aiff", "ogg", "m4a"];
    e.preventDefault();
    const files = e.dataTransfer.files;

    // filter the files to sound file
    const filteredData = [...files].filter((file) => {
      const name = file.name,
        extension = name.slice(name.lastIndexOf(".") + 1);
      return acceptedFile.includes(extension);
    });

    //
    Swal.fire({
      icon: filteredData.length >= 1 ? "success" : "warning",
      title:
        filteredData.length >= 1 ? "the file uploaded" : "no sound file found",
      timer: 2000,
    });
    //
    setUploadFile(filteredData[0]);

    e.currentTarget.style.scale = "1";
    if (filteredData.length >= 1) {
      setSteps(2);
    }
  };

  return (
    <div>
      <div>
        <h3 className="font-extrabold text-4xl text-center mb-3 font-header">
          Upload your music to Cloud. Wave
        </h3>
        <p className="text-center font-header font-medium text-xl">
          Cloud. Wave gives you unlimited storage.
        </p>
      </div>
      <div
        draggable={false}
        onDragOver={(e) => {
          e.preventDefault();
          e.currentTarget.style.scale = "1.2";
        }}
        onDrop={handleDropFile}
        className="bg-[#1D212E] border-dashed border-green-500 border-2 p-10 mt-5 rounded-2xl transition-all"
      >
        <p className="font-bold text-white text-2xl text-center">
          Browse for files or drag and drop them here
        </p>
        <label
          className=" flex-center bg-green-500 text-white rounded-full w-51 h-12 gap-3 cursor-pointer mx-auto mt-5 "
          htmlFor="uploadFile"
        >
          {/* button  */}
          <span className="rounded-full flex-center bg-white w-6 h-6">
            <RiAddLine className="text-green-500" />
          </span>
          Upload your file
          {/* upload file */}
          <input
            type="file"
            onChange={(e) => {
              setUploadFile(e.target.files?.[0]);
              setSteps(2);
            }}
            className="hidden"
            id="uploadFile"
            accept="audio/*"
          />
        </label>
        {/* terms  */}
        <p className="text-[15px] font-header text-center text-white mt-5">
          Accepted file types are MP3, FLAC, WAV, AIFF, OGG, & M4A. Limit of
          500MB per file.{" "}
        </p>
        <p className="text-center text-white font-[18px] font-header mt-5">
          By uploading, you agree to our{" "}
          <AnimationLink to="/terms" className="text-green-500">
            Terms
          </AnimationLink>{" "}
          of Service and{" "}
          <AnimationLink to="/privacy" className="text-green-500">
            Privacy Policy
          </AnimationLink>
          . Cloud. Wave is for Artists, DJs, and Labels only. Uploading
          third-party content will result in an immediate ban
        </p>
      </div>
    </div>
  );
}

// final step
function FinalStep({
  uploadFile,
  setStep,
}: {
  uploadFile: File | undefined;
  setStep: (val: number | ((prev: number) => number)) => void;
}) {
  const { t } = useTranslation();
  const [image, setImage] = useState<{
    state: string;
    path: undefined | string;
  }>({ state: "", path: "" });
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const CLOUD_NAME = "dg0zyscka";
  const UPLOAD_PRESET = "cloudwav";

  const schema = z.object({
    cover_path: z.instanceof(File, { message: t("validation.required") }),
    title: z.string({ message: t("validation.required") }).min(1),
    description: z.string().optional(),
    genre: z.string({ message: t("validation.required") }),
  });

  type TField = z.infer<typeof schema>;
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<TField>({
    resolver: zodResolver(schema),
  });

  // Cleanup on unmount
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

  const { mutate: saveSongToBackend, isPending: saving } = useMutation<
    AxiosResponse<{ message: string }>,
    AxiosError<{ error: string }>,
    { title: string; songUrl: string; coverUrl: string; division: string }
  >({
    mutationKey: ["upload-song"],
    mutationFn: ({ title, songUrl, coverUrl, division }) => {
      const formData = new FormData();
      formData.append("song_url", songUrl); // Cloudinary URL
      formData.append("cover_url", coverUrl); // Cloudinary URL
      formData.append("division", division);
      formData.append("title", title);
      
      return axiosServices.post("/songs/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: () => {
      toast.success("Uploaded successfully!");
      setStep((prev) => prev - 1);
      setUploadProgress(null);
      setIsUploading(false);
      if (uploadFile) {
        clearUploadState(uploadFile);
      }
    },
    onError: (err) => {
      Swal.fire("Error", err.response?.data.error || "Error saving song", "error");
      setUploadProgress(null);
      setIsUploading(false);
    },
  });

  const onSubmit: SubmitHandler<TField> = async (data) => {
    if (!uploadFile) {
      toast.error("Please select a song file");
      return;
    }

    try {
      setIsUploading(true);
      const totalSize = uploadFile.size + data.cover_path.size;
      setUploadProgress({
        loaded: 0,
        total: totalSize,
        percentage: 0,
        speed: 0,
        timeRemaining: 0,
        uploadedChunks: 0,
        totalChunks: 2,
      });

      abortControllerRef.current = new AbortController();

      // Upload song to Cloudinary
      const songResult = await uploadAudioToCloudinary(uploadFile, {
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
      const coverResult = await uploadImageToCloudinary(data.cover_path, {
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

      setIsUploading(false);
      setUploadProgress({
        loaded: totalSize,
        total: totalSize,
        percentage: 100,
        speed: 0,
        timeRemaining: 0,
        uploadedChunks: 2,
        totalChunks: 2,
      });

      saveSongToBackend({
        title: data.title,
        songUrl: songResult.secure_url,
        coverUrl: coverResult.secure_url,
        division: data.genre,
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
  const image_cover = watch("cover_path");
  useEffect(() => {
    if (!image_cover) return;
    const file = new FileReader();
    file.addEventListener("progress", function () {
      setImage({ state: "loading", path: "" });
    });
    file.addEventListener("loadend", function (e) {
      setImage({ state: "done", path: String(e.target?.result) });
    });
    file.addEventListener("error", function () {
      toast.error("something happed");
    });
    file.readAsDataURL(image_cover);
    return () => {
      file.removeEventListener("progress", function () {
        setImage({ state: "loading", path: "" });
      });
      file.removeEventListener("loadend", function (e) {
        setImage({ state: "done", path: String(e.target?.result) });
      });
      file.addEventListener("error", function () {
        toast.error("try again");
      });
    };
  }, [image_cover]);
  type TOption = {
    id: number;
    name: string;
    label: string;
  };
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
  return (
    <div className="mx-auto w-full shrink-0 ">
      {/* header */}
      <div className="font-header">
        <h3 className="text-center font-bold text-[40px]">
          Your Album has uploaded!
        </h3>
        <p className="text-center text-xl font-medium">
          Follow these steps to complete your upload
        </p>
      </div>
      {/* song details */}
      <div className=" bg-[#1D212E] py-20 px-10 mt-10">
        <h4 className="text-white text-2xl font-semibold">Basic Information</h4>
        <div className="flex items-start justify-between gap-5 mt-8 flex-col md:flex-row">
          <div className="images flex bg-[#3B3B3B] w-full md:w-90 h-90 flex-center flex-col">
            <label className="relative" htmlFor="cover_upload">
              {image.state === "loading" ? (
                <Spinner2 w={10} h={10} b={"black"} />
              ) : image.state === "done" ? (
                <img
                  src={image.path}
                  className="aspect-square
                  object-cover"
                />
              ) : (
                <>
                  <img src={albumImage} className="opacity-20" />
                  <p className="bg-green-500 flex-center gap-3 text-white rounded-full w-43 cursor-pointer h-12 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <RiCameraLine />
                    Add ArtWork
                  </p>
                </>
              )}
            </label>
            <Controller
              control={control}
              name="cover_path"
              render={({ field }) => (
                <input
                  type="file"
                  id="cover_upload"
                  className="hidden"
                  onChange={(e) => field.onChange(e.target.files?.[0])}
                  accept="image/jpeg"
                />
              )}
            />
            {!!errors.cover_path && (
              <span className="error__message block mt-1  ">
                {errors.cover_path.message}
              </span>
            )}
          </div>
          <div className="info flex-1">
            <div>
              <label className="text-white block mb-1">Title</label>
              <input
                {...register("title")}
                type="text"
                className="bg-[#E0E0E0] w-full outline-none p-2"
                placeholder="write a song title ....."
              />
              {!!errors.title && (
                <span className="error__message block mt-1  ">
                  {errors.title.message}
                </span>
              )}
              <label className="text-white block mb-1 mt-3">Genre</label>

              <Controller
                control={control}
                name={"genre"}
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                }) => (
                  <SelectField
                    options={options}
                    getOptionLabel={(option: TOption) => option.name}
                    onChange={(newValue) => onChange(newValue.name)}
                    value={options.find((el) => el.name == value)}
                    variant="contained"
                    helperText={error?.message}
                    error={!!error}
                    className="bg-[#E0E0E0] -mt-3 rounded-0"
                  />
                )}
              />
              <label className="text-white block mt-3 mb-1">caption</label>
              <textarea
                className="bg-[#E0E0E0] w-full outline-none p-2 h-34"
                placeholder="Enter a Caption"
                {...register("description")}
              />
              {!!errors.description && (
                <span className="error__message block mt-1  ">
                  {errors.description.message}
                </span>
              )}
            </div>

            {/* Progress Bar */}
            {uploadProgress && uploadProgress.percentage < 100 && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-white">
                    Uploading {uploadProgress.uploadedChunks}/{uploadProgress.totalChunks} chunks
                  </span>
                  <span className="text-sm font-bold text-green-500">
                    {uploadProgress.percentage}%
                  </span>
                </div>
                
                <div className="w-full bg-gray-600 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-300 flex items-center justify-end pr-2"
                    style={{ width: `${uploadProgress.percentage}%` }}
                  >
                    {uploadProgress.percentage > 10 && (
                      <span className="text-xs text-white font-medium">
                        {uploadProgress.percentage}%
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs text-white">
                  <div>
                    <span className="text-gray-300">Speed:</span>
                    <span className="ml-1 font-medium">
                      {uploadProgress.speed > 0
                        ? `${uploadProgress.speed.toFixed(2)} MB/s`
                        : "Calculating..."}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-300">Uploaded:</span>
                    <span className="ml-1 font-medium">
                      {formatFileSize(uploadProgress.loaded)} / {formatFileSize(uploadProgress.total)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-300">Time left:</span>
                    <span className="ml-1 font-medium">
                      {uploadProgress.timeRemaining > 0
                        ? formatTime(uploadProgress.timeRemaining)
                        : "Calculating..."}
                    </span>
                  </div>
                </div>

                {isUploading && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="mt-2 w-full py-2 text-sm text-red-400 hover:text-red-300 font-medium border border-red-500 rounded-md hover:bg-red-900/20 transition-colors"
                  >
                    Cancel Upload
                  </button>
                )}
              </div>
            )}

            {/* Success State */}
            {uploadProgress && uploadProgress.percentage === 100 && !saving && (
              <div className="mt-4 p-3 bg-green-900/30 border border-green-500 rounded-md">
                <div className="flex items-center gap-2 text-green-400">
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
              onClick={handleSubmit(onSubmit)}
              className="bg-green-500 text-white w-35 rounded-full h-11 flex-center ml-auto mt-4 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isUploading || saving}
            >
              {isUploading ? (
                <div className="flex items-center gap-2">
                  <Spinner2 w={6} h={6} b={"black"} />
                  <span>Uploading...</span>
                </div>
              ) : saving ? (
                <Spinner2 w={6} h={6} b={"black"} />
              ) : (
                <>
                  Next step <RiArrowRightLine />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Upload() {
  const [uploadType, setUploadType] = useState<"song" | "album" | "">("");
  const [uploadFile, setUploadFile] = useState<File | undefined>(undefined);
  const [showModel, setShowModel] = useState<boolean>(false);
  const [steps, setSteps] = useState<number>(0);
  const container = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      gsap.to(".carousel", {
        left: steps * -100 + "%",
        ease: "circ.out",
      });
    },
    { scope: container, dependencies: [steps] }
  );
  const uploadTypes = [
    {
      value: "song",
      title: "Upload Song",
      image: songImage,
    },
    {
      value: "album",
      title: "Upload Album",
      image: albumImage,
    },
  ];
  return (
    <div
      className="wrapper overflow-hidden relative md:w-[740px] w-[400px] mx-auto my-8"
      ref={container}
    >
      <div className="carousel flex relative 0">
        {/* div 1 */}
        <div className=" shrink-0 w-full">
          <h3 className="font-extrabold text-4xl text-center mb-7 font-header">
            Please select your upload type:
          </h3>
          <div className="flex-center flex-col md:flex-row gap-14">
            {uploadTypes.map((type, i) => {
              const isChecked = type.value == uploadType;
              return (
                <label
                  key={i}
                  className={clsx(
                    "bg-white shadow-[0px_22.34px_17.87px_0px_#0000000B] flex-center flex-col rounded-xl w-85 h-85 mb-6",
                    isChecked && "border-green-500 border"
                  )}
                  htmlFor={type.value}
                >
                  <div className="images w-[184px] h-[184px] relative flex-center">
                    <img src={type.image} alt={`${type.title}-image-outline`} />
                  </div>
                  <p className="font-bold text-2xl tracking-tight mb-2 font-header">
                    {type.title}
                  </p>
                  <div className="w-7  h-7 border rounded-full p-1 has-checked:bg-green-500 bg-[#303030] transition-color has-checked:border-transparent flex-center relative">
                    <input
                      type="radio"
                      name="uploadType"
                      value={type.value}
                      checked={isChecked}
                      className="appearance-none"
                      id={type.value}
                      onChange={(e) => setUploadType(e.target.value as "")}
                    />
                    <svg
                      fill="none"
                      viewBox="0 0 24 24"
                      className={clsx(
                        "text-white checkIcon transition-all duration-700",
                        isChecked && "show__checkIcon"
                      )}
                    >
                      <path
                        stroke-linejoin="round"
                        stroke-linecap="round"
                        stroke-width="2"
                        stroke="currentColor"
                        d="M4 12L10 18L20 6"
                      ></path>
                    </svg>
                  </div>
                </label>
              );
            })}
          </div>
          <button
            onClick={
              uploadType === "album"
                ? () => setShowModel(true)
                : () => setSteps(1)
            }
            disabled={!uploadType}
            className=" cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 h-16 text-[28px] font- bg-green-500 p-2 flex-center rounded-3xl w-48 mx-auto text-white"
          >
            Next
          </button>
        </div>
        {/* div 2 */}
        <div className="shrink-0 w-full">
          <UploadFile setUploadFile={setUploadFile} setSteps={setSteps} />
        </div>
        {/* div 3 */}
        <FinalStep uploadFile={uploadFile} setStep={setSteps} />
        {/* div */}
        {/* model */}
        {<Model open={showModel} setOpen={setShowModel} />}
      </div>
    </div>
  );
}
