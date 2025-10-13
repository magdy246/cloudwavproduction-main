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
import { AxiosError } from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import SelectField from "../../components/Form/SelectField/SelectField";
import { Spinner2 } from "../../components/Spinner/Spinner";

// model

function Model({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (val: boolean) => void;
}) {
  const { t } = useTranslation();

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

  const { mutate, isPending } = useMutation<any, AxiosError<Error>, FormData>({
    mutationKey: ["upload-artist"],
    mutationFn: (data) =>
      axiosServices.post("/albums", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }),
    onSuccess: () => {
      toast.success("Uploaded successfully!");
      reset();
      setOpen(false);
    },
    onError: (err) => toast.error(err.response?.data.message),
  });

  const onSubmit: SubmitHandler<TFields> = (data) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("album_cover", data.album_cover);
    // formData.append("division", data.album_cover);
    mutate(formData);
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
              />
            )}
          />
          {!!errors.album_cover && (
            <span className="error__message block mt-1">
              {errors.album_cover.message}
            </span>
          )}

          {/* submit button */}
          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2 bg-gray-300 rounded"
              disabled={isPending}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isPending}
              className={clsx(
                "px-4 py-2 bg-green-600 text-white rounded flex items-center justify-center",
                isPending
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:bg-green-700"
              )}
            >
              {isPending ? "saving..." : "save"}
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
  const { mutate, isPending } = useMutation<
    any,
    AxiosError<{ error: string }>,
    FormData
  >({
    mutationKey: ["upload-song"],
    mutationFn: (data) =>
      axiosServices.post("/songs/upload", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }),
    onSuccess: () => {
      toast.success("Uploaded successfully!");
      setStep((prev) => prev - 1);
    },
    onError: (err) => Swal.fire("Error", err.response?.data.error, "error"),
  });

  const onSubmit: SubmitHandler<TField> = (data) => {
    const formData = new FormData();
    formData.append("song_path", uploadFile!);
    formData.append("cover_path", data.cover_path);
    formData.append("division", data.genre);
    formData.append("title", data.title);
    mutate(formData);
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
            <button
              onClick={handleSubmit(onSubmit)}
              className="bg-green-500 text-white w-35 rounded-full h-11 flex-center ml-auto mt-4 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isPending}
            >
              {isPending ? (
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
