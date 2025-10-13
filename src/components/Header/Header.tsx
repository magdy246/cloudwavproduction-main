/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useRef, Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import logo from "../../assets/images/logo.svg";
import AnimationLink from "../AnimationLink/AnimationLink";
import { useLocation, useNavigate } from "react-router-dom";
import clsx from "clsx";
import { useAuth } from "../../Providers/AuthContext";
import { RiEditLine, RiGlobalLine, RiUserLine, RiMailLine } from "@remixicon/react";
import ChangeEmailDialog from "../ChangeEmailDialog/ChangeEmailDialog";

import { FaFacebook, FaInstagram, FaTiktok } from "react-icons/fa";
import Spinner, { Spinner2 } from "../Spinner/Spinner";
import { createPortal } from "react-dom";
import Dialog from "../Dialog/Dialog";
import { z } from "zod";
import { SubmitHandler, Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import TextField from "../Form/TextField/TextField";
import { useMutation } from "@tanstack/react-query";
import { axiosServices } from "../../utils/axios";
import Swal from "sweetalert2";
import { AxiosError, AxiosResponse } from "axios";
// import i18n from "../../i18n";

interface TUpdate {
  setCreatorId: Dispatch<SetStateAction<number | null>>;
  creatorId: number | null;
}

function UpdatePrice({
  setCreatorId,
  creatorId,
  defaultValue,
}: TUpdate & {
  defaultValue: {
    private_price: number;
    bussiness_price: number;
  };
}) {
  const auth = useAuth();
  const { t } = useTranslation();
  const schema = z.object({
    private_price: z.coerce.number({ message: t("validation.required") }),
    bussiness_price: z.coerce.number({ message: t("validation.required") }),
  });

  const { mutate: updatePrice, isPending: updating } = useMutation<
    AxiosResponse<{ message: string }>,
    AxiosError<{ error: string }>,
    TFields
  >({
    mutationFn: (data) =>
      axiosServices.put(`/videoCreator-update/${creatorId}`, data),
    onSuccess: (data) => {
      Swal.fire(data.data.message, "", "success");
      reset();
      setCreatorId(null);
      auth.refetch();
    },
    onError: (error) => {
      Swal.fire(error.response?.data.error, "", "error");
    },
  });

  type TFields = z.infer<typeof schema>;
  const { control, setValue, reset, handleSubmit } = useForm<TFields>({
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<TFields> = (data) => {
    updatePrice(data);
  };

  useEffect(() => {
    if (!defaultValue) return;
    setValue("private_price", defaultValue.private_price);
    setValue("bussiness_price", defaultValue.bussiness_price);
  }, [defaultValue]);

  return (
    <Dialog
      open={!!creatorId}
      handleClose={() => {
        reset();
        setCreatorId(null);
      }}
      title="Update Price"
    >
      <div className="p-3">
        {/* private Price */}
        <Controller
          control={control}
          name="private_price"
          render={({ field, fieldState }) => (
            <TextField
              legend={t("dashboard.requestACreatorPage.privatePrice")}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
              {...field}
            />
          )}
        />

        {/* bussiness_price */}
        <Controller
          control={control}
          name="bussiness_price"
          render={({ field, fieldState }) => (
            <TextField
              legend={t("dashboard.requestACreatorPage.businessPrice")}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
              {...field}
            />
          )}
        />

        <button
          className="submit__button"
          disabled={updating}
          onClick={handleSubmit(onSubmit)}
        >
          {updating ? <Spinner2 w={6} h={6} /> : "Submit"}
        </button>
      </div>
    </Dialog>
  );
}

function UserProfile() {
  // UserProfile component remains unchanged
  const auth = useAuth();
  const [openMenu, setOpenMenu] = useState<boolean>(false);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [openChangeEmailDialog, setOpenChangeEmailDialog] = useState<boolean>(false);
  const [creatorId, setCreatorId] = useState<number | null>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [type, setType] = useState("user");
  // const isArabic = i18n.language === "ar";
  const schema = z
    .object({
      name: z.string({ message: t("validation.name") }),
      email: z
        .string({ message: t("validation.required") })
        .email({ message: t("validation.correctEmail") }),
      password: z
        .string({ message: t("validation.required") })
        .min(8, t("validation.password")),
      password_confirmation: z
        .string({ message: t("validation.required") })
        .min(8, t("validation.password")),
      profile_image: z.instanceof(File).nullish(),
    })
    .refine(
      ({ password, password_confirmation }) =>
        password == password_confirmation,
      {
        message: t("validation.confirmPassword"),
        path: ["password_confirmation"],
      }
    );
  const fields = [
    {
      name: "name",
      width: "50%",
      legend: t("enterYourName"),
      label: t("fullName"),
      type: "text",
    },
    {
      name: "email",
      width: "50%",
      legend: t("emailAddress"),
      label: t("emailAddress"),
      type: "text",
    },
    {
      name: "password",
      width: "50%",
      legend: t("password"),
      label: t("password"),
      type: "password",
    },
    {
      name: "password_confirmation",
      width: "50%",
      legend: t("confirmPassword"),
      label: t("confirmPassword"),
      type: "password",
    },
  ] as const;
  type TFields = z.infer<typeof schema>;
  const {
    control,
    setValue,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<TFields>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (!openDialog) return;
    setValue("name", auth?.authData?.name || "");
    setValue("email", auth?.authData?.email || "");
    setValue("password", "");
    setValue("password_confirmation", "");
  }, [auth?.authData, openDialog]);

  const { mutate, isPending: submitting } = useMutation<
    unknown,
    AxiosError<{ error: string }>,
    FormData
  >({
    mutationKey: ["update-user-data"],
    mutationFn: (data) =>
      axiosServices.post(
        auth.authData?.role === "user"
          ? "/update-name"
          : "/profile-update-request",
        data,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      ),
    onError: (err) =>
      Swal.fire({
        title: err.response?.data.error,
        icon: "error",
      }),
    onSuccess: () => {
      Swal.fire({
        title:
          auth.authData?.role == "user"
            ? "updated successfully"
            : "the update is in progress",
        icon: "success",
      });
      reset();
      setOpenDialog(false);
      auth.refetch();
    },
  });

  const onSubmit: SubmitHandler<TFields> = (data) => {
    const formData = new FormData();
    formData.append(
      auth.authData?.role == "user" ? "new_name" : "name",
      data.name
    );
    formData.append("email", data.email);

    formData.append("password", data.password);
    formData.append("password_confirmation", data.password_confirmation);
    formData.append("type", type);

    if (data.profile_image) {
      formData.append("profile_image", data.profile_image);
    }

    mutate(formData);
  };

  return (
    <>
      <div className="relative">
        <button
          className="image w-10 h-10 bg-green-500 text-white flex-center rounded-full uppercase text-xl cursor-pointer disabled:opacity-80 "
          onClick={() => setOpenMenu((prev) => !prev)}
          disabled={auth?.isLoadingData}
        >
          {auth?.isLoadingData ? (
            <Spinner2 w={6} h={6} />
          ) : (
            auth?.authData?.name?.[0]
          )}
        </button>
        {/* menu */}
        <div
          className={clsx(
            "absolute w-80 p-4 rounded-xl bg-white top-[calc(100%+10px)] transition-all end-0 ",
            openMenu
              ? "opacity-100 scale-100 visible"
              : "opacity-0 scale-[.9] invisible"
          )}
        >
          <button
            onClick={() => {
              if (auth?.authData?.artist_id) {
                navigate(`/artist/${auth?.authData.artist_id}`);
                return;
              }
            }}
            className="flex w-full justify-end gap-2 m-0 cursor-pointer"
          >
            <p className="text-[17px] capitalize">
              {auth?.authData?.name}
              <span className="text-xs block text-right text-gray-500  ">
                {auth?.authData?.role}
              </span>
            </p>
            <div className="flex-center border rounded-full w-8 h-8">
              <RiUserLine />
            </div>
          </button>
          <div className="flex flex-col items-center ">
            {auth.authData?.artist_id && (
              <button
                className="flex-center w-full gap-2 rounded mt-3 bg-green-500 py-2 px-5 text-white cursor-pointer"
                onClick={() => {
                  setType("artist");
                  setOpenDialog(true);
                }}
              >
                update artist
                <RiEditLine />
              </button>
            )}
            {auth.authData?.video_creator_id && (
              <button
                className="flex-center gap-2 w-full mt-2 rounded bg-green-500 py-2 px-5 text-white cursor-pointer"
                onClick={() => {
                  setType("videoCreator");
                  setOpenDialog(true);
                }}
              >
                update video creator
                <RiEditLine />
              </button>
            )}
            {auth.authData?.role == "user" && (
              <button
                className="flex-center gap-2 w-full mt-2 rounded bg-green-500 py-2 px-5 text-white cursor-pointer"
                onClick={() => {
                  setType("user");
                  setOpenDialog(true);
                }}
              >
                update user
                <RiEditLine />
              </button>
            )}
          </div>
          <hr className="mt-3 border-gray-200" />
          {auth?.authData?.role === "admin" && (
            <AnimationLink
              to="/dashboard"
              className="logout flex-center w-full border-1 bg-green-500 rounded mt-3 py-3 text-white  hover:text-green-500 hover:bg-white transition-colors cursor-pointer "
            >
              dashboard
            </AnimationLink>
          )}
          {auth.authData?.video_creator_id && (
            <button
              className="flex-center w-full border-1 bg-green-500 rounded mt-3 py-3 text-white  hover:text-green-500 hover:bg-white transition-colors cursor-pointer "
              onClick={() => setCreatorId(auth.authData?.video_creator_id!)}
            >
              Update price
            </button>
          )}
          <button
            className="flex-center w-full border-1 border-blue-500 rounded mt-3 py-3 bg-white text-blue-500 hover:bg-blue-500 hover:text-white transition-colors cursor-pointer "
            onClick={() => setOpenChangeEmailDialog(true)}
          >
            <RiMailLine className="mr-2" />
            Change Email
          </button>
          <button
            className="logout flex-center w-full border-1 border-green-500 rounded mt-3 py-3 bg-white text-green-500 hover:bg-green-500 hover:text-white transition-colors cursor-pointer "
            onClick={() => auth?.logout?.mutate()}
          >
            {auth?.logout?.isPending ? <Spinner2 w={6} h={6} /> : "logout"}
          </button>
        </div>
        {/* update form */}
        <Dialog
          open={openDialog}
          handleClose={() => {
            reset();
            setOpenDialog(false);
          }}
          title="update data"
        >
          <div className="px-5 py-3 flex flex-wrap relative">
            {/* album cover */}
            {auth.authData?.role !== "user" && (
              <>
                <label
                  className=" text-sm font-medium mb-1 mt-3 rounded-full   p-3 flex items-center justify-center border-purple-500 border-2 border-dashed size-50 mx-auto dashed text-center overflow-hidden "
                  htmlFor="profile_image"
                >
                  {watch("profile_image") ? (
                    <img
                      src={URL.createObjectURL(watch("profile_image")!)}
                      className="object-position-bottom object-cover min-w-50 min-h-50"
                    />
                  ) : (
                    "Profile image"
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
                      onChange={(e) => field.onChange(e.target.files?.[0])}
                    />
                  )}
                />
                {!!errors.profile_image && (
                  <span className="error__message block mt-1">
                    {errors.profile_image.message}
                  </span>
                )}
              </>
            )}
            {fields.map((iField) => (
              <Controller
                key={iField.name}
                control={control}
                name={iField.name as any}
                render={({ field, fieldState: { error } }) => {
                  return (
                    <div className={clsx("w-full md:w-[calc(100%-.15rem)]")}>
                      <TextField
                        legend={iField.legend}
                        label={iField.label}
                        type={iField.type}
                        {...field}
                        error={!!error}
                        value={field.value || ""}
                        helperText={error?.message}
                      />
                    </div>
                  );
                }}
              />
            ))}

            <button
              className="submit__button flex-1 sticky bottom-3"
              onClick={handleSubmit(onSubmit)}
              disabled={submitting}
            >
              {submitting ? <Spinner /> : "submit"}
            </button>
          </div>
        </Dialog>
        {openMenu &&
          createPortal(
            <div
              className="fixed w-full h-full top-0 left-0  "
              onClick={() => setOpenMenu(false)}
            />,
            document.body
          )}
      </div>

      {creatorId && (
        <UpdatePrice
          creatorId={creatorId}
          setCreatorId={setCreatorId}
          defaultValue={{
            bussiness_price: auth.authData!.bussiness_price,
            private_price: auth.authData!.private_price,
          }}
        />
      )}
      
      <ChangeEmailDialog
        open={openChangeEmailDialog}
        handleClose={() => setOpenChangeEmailDialog(false)}
      />
    </>
  );
}

// content creator update price

// MobileUserProfile component for the mobile menu
function MobileUserProfile() {
  // UserProfile component remains unchanged
  const auth = useAuth();
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [openChangeEmailDialog, setOpenChangeEmailDialog] = useState<boolean>(false);
  const [creatorId, setCreatorId] = useState<number | null>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [type, setType] = useState("user");
  // const isArabic = i18n.language === "ar";
  const schema = z
    .object({
      name: z.string({ message: t("validation.name") }),
      email: z
        .string({ message: t("validation.required") })
        .email({ message: t("validation.correctEmail") }),
      password: z
        .string({ message: t("validation.required") })
        .min(8, t("validation.password")),
      password_confirmation: z
        .string({ message: t("validation.required") })
        .min(8, t("validation.password")),
      profile_image: z.instanceof(File).nullish(),
    })
    .refine(
      ({ password, password_confirmation }) =>
        password == password_confirmation,
      {
        message: t("validation.confirmPassword"),
        path: ["password_confirmation"],
      }
    );
  const fields = [
    {
      name: "name",
      width: "50%",
      legend: t("enterYourName"),
      label: t("fullName"),
      type: "text",
    },
    {
      name: "email",
      width: "50%",
      legend: t("emailAddress"),
      label: t("emailAddress"),
      type: "text",
    },
    {
      name: "password",
      width: "50%",
      legend: t("password"),
      label: t("password"),
      type: "password",
    },
    {
      name: "password_confirmation",
      width: "50%",
      legend: t("confirmPassword"),
      label: t("confirmPassword"),
      type: "password",
    },
  ] as const;
  type TFields = z.infer<typeof schema>;
  const {
    control,
    setValue,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<TFields>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (!openDialog) return;
    setValue("name", auth?.authData?.name || "");
    setValue("email", auth?.authData?.email || "");
    setValue("password", "");
    setValue("password_confirmation", "");
  }, [auth?.authData, openDialog]);

  const { mutate, isPending: submitting } = useMutation<
    unknown,
    AxiosError<{ error: string }>,
    FormData
  >({
    mutationKey: ["update-user-data"],
    mutationFn: (data) =>
      axiosServices.post(
        auth.authData?.role === "user"
          ? "/update-name"
          : "/profile-update-request",
        data,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      ),
    onError: (err) =>
      Swal.fire({
        title: err.response?.data.error,
        icon: "error",
      }),
    onSuccess: () => {
      Swal.fire({
        title:
          auth.authData?.role == "user"
            ? "updated successfully"
            : "the update is in progress",
        icon: "success",
      });
      reset();
      setOpenDialog(false);
      auth.refetch();
    },
  });

  const onSubmit: SubmitHandler<TFields> = (data) => {
    const formData = new FormData();
    formData.append(
      auth.authData?.role == "user" ? "new_name" : "name",
      data.name
    );
    formData.append("email", data.email);

    formData.append("password", data.password);
    formData.append("password_confirmation", data.password_confirmation);
    formData.append("type", type);

    if (data.profile_image) {
      formData.append("profile_image", data.profile_image);
    }

    mutate(formData);
  };
  if (!auth?.isLogin) {
    return (
      <div className="flex flex-col gap-3 px-4 py-2">
        <AnimationLink
          className="bg-alt-color text-main-color h-10 grid-center font-hero text-lg font-normal rounded-[10px] border-main-color border-1"
          to="/login"
        >
          {t("login")}
        </AnimationLink>
        <AnimationLink
          className="text-alt-color bg-main-color h-10 grid-center font-hero text-lg font-normal rounded-[10px]"
          to="/sign-up"
        >
          {t("SignUp")}
        </AnimationLink>
      </div>
    );
  }

  return (
    <>
      <div className="px-4 py-3 border-t border-gray-200">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => {
              if (auth?.authData?.artist_id) {
                navigate(`/artist/${auth?.authData.artist_id}`);
                return;
              }
            }}
            className="flex w-full justify-end gap-2 m-0 cursor-pointer"
          >
            <p className="text-[17px] capitalize">
              {auth?.authData?.name}
              <span className="text-xs block text-right text-gray-500  ">
                {auth?.authData?.role}
              </span>
            </p>
            <div className="flex-center border rounded-full w-8 h-8">
              <RiUserLine />
            </div>
          </button>
        </div>
        <div className="flex gap-2 flex-wrap">
          {auth?.authData?.role === "admin" && (
            <AnimationLink
              to="/dashboard"
              className="logout flex-center w-full border-1 bg-green-500 rounded mt-3 py-3 text-white  hover:text-green-500 hover:bg-white transition-colors cursor-pointer "
            >
              dashboard
            </AnimationLink>
          )}
          <div className="flex flex-col items-center w-full ">
            {auth.authData?.artist_id && (
              <button
                className="flex-center w-full gap-2 rounded mt-3 bg-green-500 py-2 px-5 text-white cursor-pointer "
                onClick={() => {
                  setType("artist");
                  setOpenDialog(true);
                }}
              >
                update artist
                <RiEditLine />
              </button>
            )}
            {auth.authData?.video_creator_id && (
              <button
                className="flex-center gap-2 w-full mt-2 rounded bg-green-500 py-2 px-5 text-white cursor-pointer"
                onClick={() => {
                  setType("videoCreator");
                  setOpenDialog(true);
                }}
              >
                update video creator
                <RiEditLine />
              </button>
            )}
            {auth.authData?.role == "user" && (
              <button
                className="flex-center gap-2 w-full mt-2 rounded bg-green-500 py-2 px-5 text-white cursor-pointer"
                onClick={() => {
                  setType("user");
                  setOpenDialog(true);
                }}
              >
                update user
                <RiEditLine />
              </button>
            )}
          </div>
          <hr className="mt-3 border-gray-200" />
          {auth?.authData?.role === "admin" && (
            <AnimationLink
              to="/dashboard"
              className="logout flex-center w-full border-1 bg-green-500 rounded mt-3 py-3 text-white  hover:text-green-500 hover:bg-white transition-colors cursor-pointer "
            >
              dashboard
            </AnimationLink>
          )}
          {auth.authData?.video_creator_id && (
            <button
              className="flex-center w-full border-1 bg-green-500 rounded mt-3 py-3 text-white  hover:text-green-500 hover:bg-white transition-colors cursor-pointer "
              onClick={() => setCreatorId(auth.authData?.video_creator_id!)}
            >
              Update price
            </button>
          )}
          <button
            className="flex-center w-full border-1 border-blue-500 rounded mt-3 py-3 bg-white text-blue-500 hover:bg-blue-500 hover:text-white transition-colors cursor-pointer"
            onClick={() => setOpenChangeEmailDialog(true)}
          >
            <RiMailLine className="mr-2" />
            Change Email
          </button>
          <button
            className="flex-1 flex-center gap-2 rounded border border-green-500 py-2 px-3 text-green-500 hover:bg-green-500 hover:text-white transition-colors cursor-pointer"
            onClick={() => auth?.logout?.mutate()}
          >
            {auth?.logout?.isPending ? <Spinner2 w={6} h={6} /> : "logout"}
          </button>
        </div>
        <Dialog
          open={openDialog}
          handleClose={() => setOpenDialog(false)}
          title="update data"
        >
          <div className="px-5 py-3 flex flex-wrap relative">
            {/* album cover */}
            {auth.authData?.role !== "user" && (
              <>
                <label
                  className=" text-sm font-medium mb-1 mt-3 rounded-full   p-3 flex items-center justify-center border-purple-500 border-2 border-dashed size-50 mx-auto dashed text-center overflow-hidden "
                  htmlFor="profile_image"
                >
                  {watch("profile_image") ? (
                    <img
                      src={URL.createObjectURL(watch("profile_image")!)}
                      className="object-position-bottom object-cover min-w-50 min-h-50"
                    />
                  ) : (
                    "Profile image"
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
                      onChange={(e) => field.onChange(e.target.files?.[0])}
                    />
                  )}
                />
                {!!errors.profile_image && (
                  <span className="error__message block mt-1">
                    {errors.profile_image.message}
                  </span>
                )}
              </>
            )}
            {fields.map((iField) => (
              <Controller
                key={iField.name}
                control={control}
                name={iField.name as any}
                render={({ field, fieldState: { error } }) => {
                  return (
                    <div className="w-full">
                      <TextField
                        legend={iField.legend}
                        label={iField.label}
                        type={iField.type}
                        {...field}
                        value={field.value || ""}
                        error={!!error}
                        helperText={error?.message}
                      />
                    </div>
                  );
                }}
              />
            ))}
            <button
              className="submit__button flex-1 sticky bottom-3"
              onClick={handleSubmit(onSubmit)}
              disabled={submitting}
            >
              {submitting ? <Spinner /> : "submit"}
            </button>
          </div>
        </Dialog>
      </div>
      {creatorId && (
        <UpdatePrice
          creatorId={creatorId}
          setCreatorId={setCreatorId}
          defaultValue={{
            bussiness_price: auth.authData!.bussiness_price,
            private_price: auth.authData!.private_price,
          }}
        />
      )}
      
      <ChangeEmailDialog
        open={openChangeEmailDialog}
        handleClose={() => setOpenChangeEmailDialog(false)}
      />
    </>
  );
}

export default function Header({
  type,
}: {
  type: "dashboard" | "landingPage";
}) {
  const { t, i18n } = useTranslation();
  const auth = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const isArabic = i18n.language === "ar";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setServicesDropdownOpen(false);
      }
    };

    if (servicesDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [servicesDropdownOpen]);

  // Close mobile dropdown when clicking outside
  useEffect(() => {
    const handleMobileClickOutside = (event: MouseEvent) => {
      if (
        mobileDropdownRef.current &&
        !mobileDropdownRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest(".mobile-menu-button")
      ) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener("mousedown", handleMobileClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleMobileClickOutside);
    };
  }, [mobileMenuOpen]);

  // Services data structure
  const servicesData = {
    id: 2,
    title: t("service"),
    to: "",
    menu: [
      {
        id: 1,
        title: t("services_1"),
        to: "/services/Music_distribution",
      },
      {
        id: 2,
        title: t("services_2"),
        to: "/services/Platform_Management",
      },
      {
        id: 3,
        title: t("services_3"),
        to: "/services/Social_media",
      },
      {
        id: 4,
        title: t("services_4"),
        to: "/services/Clothes_Store",
        SocialLnks: [
          {
            icon: <FaFacebook />,
            title: "Facebook Page",
            iconLink: "https://m.facebook.com/61573739062609/",
          },
          {
            icon: <FaInstagram />,
            title: "Instagram Page",
            iconLink: "https://www.instagram.com/black_8_bear",
          },
          {
            icon: <FaTiktok />,
            title: "Tiktok Account",
            iconLink: "https://www.tiktok.com/@___blackbear",
          },
        ],
      },
      {
        id: 5,
        title: t("services_5"),
        to: "/Services/Programming_services",
        comingSoon: true,
      },
      {
        id: 6,
        title: t("services_6"),
        to: "/Services/TikTok agency",
        comingSoon: true,
      },
    ],
  };

  const links = [
    { name: t("Home"), path: "/" },
    {
      name: servicesData.title,
      path: servicesData.to,
      hasDropdown: true,
      isServices: true,
    },
    // { name: "Features", path: "/features" },
    { name: t("pricing"), path: "/pricing" },
    { name: t("faqs"), path: "/Faqs" },
    { name: t("contactus"), path: "/contact" },
  ];

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleServicesDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setServicesDropdownOpen(!servicesDropdownOpen);
  };

  const toggleMobileServices = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMobileServicesOpen(!mobileServicesOpen);
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  // Handler for navigation from mobile menu service links
  const handleServiceLinkClick = (_path: string) => {
    // Close both menus and perform navigation
    setMobileMenuOpen(false);
    setMobileServicesOpen(false);
    setServicesDropdownOpen(false);
  };

  return (
    <header
      className={clsx(
        type == "dashboard"
          ? "bg-white h-(--dashboard-header-height)"
          : "h-(--header-height) ",
        "py-2 z-10 relative"
      )}
    >
      <div
        className={clsx(
          "container flex items-center justify-between",
          type === "dashboard" ? "" : "justify-between"
        )}
      >
        {/* logo section */}
        <div className={clsx("logo")}>
          <AnimationLink to="/">
            <img src={logo} alt="logo-image" className="max-w-full" />
          </AnimationLink>
        </div>

        {/* Mobile menu button */}
        <button
          className="mobile-menu-button md:hidden flex flex-col justify-center items-center w-10 h-10"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <span
            className={`block w-6 h-0.5 mb-1.5 transition-transform ${
              mobileMenuOpen ? "rotate-45 translate-y-2" : ""
            } ${location.pathname === "/" ? "bg-white" : "bg-black"}`}
          ></span>
          <span
            className={`block w-6 h-0.5 mb-1.5 transition-opacity ${
              mobileMenuOpen ? "opacity-0" : ""
            } ${location.pathname === "/" ? "bg-white" : "bg-black"}`}
          ></span>
          <span
            className={`block w-6 h-0.5 transition-transform ${
              mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""
            } ${location.pathname === "/" ? "bg-white" : "bg-black"}`}
          ></span>
        </button>

        {/* Desktop Navigation */}
        <nav
          className={clsx(
            "hidden md:block",
            type === "dashboard" && "lg:ml-12 mr-0"
          )}
        >
          <ul className="flex items-center justify-between gap-5 max-lg:gap-2">
            {links.map((link, idx) => (
              <li
                key={idx}
                className={`font-header text-lg lg:text-[18px] max-xl:text-sm font-bold ${
                  location.pathname === "/" ? "text-white" : "text-black"
                } relative`}
              >
                {link.hasDropdown ? (
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={toggleServicesDropdown}
                      className="flex items-center"
                      aria-expanded={servicesDropdownOpen}
                    >
                      {link.name}
                      <svg
                        className={`ml-1 w-4 h-4 transition-transform ${
                          servicesDropdownOpen ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        ></path>
                      </svg>
                    </button>
                    {servicesDropdownOpen && link.isServices && (
                      <div className="absolute top-full left-0 mt-2 w-64 bg-white shadow-lg rounded-md py-2 z-20">
                        {servicesData.menu.map((service) => (
                          <div key={service.id} className="relative group">
                            {service.comingSoon ? (
                              <span
                                className="px-4 py-2 text-gray-400 cursor-not-allowed text-base font-normal flex items-center justify-between"
                                aria-disabled="true"
                              >
                                {service.title}
                                <span className="text-xs bg-yellow-500 text-white px-2 py-1 rounded ml-2">
                                  {t("Coming Soon")}
                                </span>
                              </span>
                            ) : (
                              <AnimationLink
                                to={service.to}
                                className="px-4 py-2 text-black hover:bg-gray-100 text-base font-normal flex items-center justify-between"
                                onClick={() => setServicesDropdownOpen(false)}
                              >
                                {service.title}
                                {service.SocialLnks && (
                                  <span className="text-gray-400">
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M9 5l7 7-7 7"
                                      ></path>
                                    </svg>
                                  </span>
                                )}
                              </AnimationLink>
                            )}
                            {service.SocialLnks && (
                              <div className="hidden group-hover:block absolute left-full top-0 w-48 bg-white shadow-lg rounded-md py-2 ml-1">
                                {service.SocialLnks.map((social, socialIdx) => (
                                  <a
                                    key={socialIdx}
                                    href={social.iconLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center px-4 py-2 text-black hover:bg-gray-100 text-sm"
                                  >
                                    <span className="mr-2">{social.icon}</span>
                                    {social.title}
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <AnimationLink to={link.path}>{link.name}</AnimationLink>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Desktop login/register buttons and language switcher */}
        <div
          className={clsx(
            "hidden md:flex items-center justify-between gap-4",
            type === "dashboard" && "ml-auto"
          )}
        >
          {!auth?.isLogin ? (
            <div className="flex gap-3">
              <AnimationLink
                className="bg-alt-color text-main-color w-24 lg:w-30 h-10 lg:h-11 grid-center font-hero text-lg lg:text-xl font-normal rounded-[10px] border-main-color border-1"
                to="/login"
              >
                {t("login")}
              </AnimationLink>
              <AnimationLink
                className="text-alt-color bg-main-color w-24 lg:w-30 h-10 lg:h-11 grid-center font-hero text-lg lg:text-xl font-normal rounded-[10px]"
                to="/sign-up"
              >
                {t("SignUp")}
              </AnimationLink>
            </div>
          ) : (
            <UserProfile />
          )}
          {/* Language Switcher */}
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={() => {
                changeLanguage(i18n.language == "en" ? "ar" : "en");
              }}
              className={clsx(
                "text-[#30B797] cursor-pointer px-2 py-1 rounded uppercase relative hover:before:opacity-100 hover:before:scale-100",
                "before:absolute before:-bottom-10 before:opacity-0 before:scale-90 before:w-10 before:rounded-full before:h-10 before:bg-gray-700 before:content-[attr(data-lang)] before:flex before:items-center before:justify-center before:left-1/2 before:-translate-x-1/2 before:transition-all"
              )}
              data-lang={i18n.language == "en" ? "ar" : "en"}
            >
              <RiGlobalLine />
            </button>
          </div>
        </div>

        {/* Mobile Menu (Overlay) */}
        {mobileMenuOpen && (
          <div
            ref={mobileDropdownRef}
            className={`fixed top-0 ${
              isArabic ? "left-0" : "right-0"
            } h-full w-full  bg-white shadow-lg z-50 transition-transform duration-300 transform ${
              mobileMenuOpen
                ? "translate-x-0"
                : isArabic
                ? "-translate-x-full"
                : "translate-x-full"
            } overflow-y-auto`}
          >
            <div className="p-4 flex justify-between items-center border-b border-gray-200">
              <div className="logo">
                <AnimationLink to="/" onClick={() => setMobileMenuOpen(false)}>
                  <img src={logo} alt="logo-image" className="h-8" />
                </AnimationLink>
              </div>
              <button
                className="text-gray-500"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>

            {/* Mobile Navigation Links */}
            <nav className="px-4 py-2">
              <ul className="space-y-1">
                {links.map((link, idx) => (
                  <li key={idx} className="py-2 border-b border-gray-100">
                    {link.hasDropdown ? (
                      <div>
                        <button
                          onClick={toggleMobileServices}
                          className="flex justify-between items-center w-full text-left py-2 text-lg font-semibold"
                        >
                          {link.name}
                          <svg
                            className={`ml-1 w-5 h-5 transition-transform ${
                              mobileServicesOpen ? "rotate-180" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 9l-7 7-7-7"
                            ></path>
                          </svg>
                        </button>
                        {mobileServicesOpen && (
                          <div className="pl-4 mt-2 space-y-2">
                            {servicesData.menu.map((service) => (
                              <div key={service.id} className="py-1">
                                {service.comingSoon ? (
                                  <div className="flex justify-between items-center text-gray-400">
                                    <span>{service.title}</span>
                                    <span className="text-xs bg-yellow-500 text-white px-2 py-1 rounded">
                                      {t("Coming Soon")}
                                    </span>
                                  </div>
                                ) : service.SocialLnks ? (
                                  <div className="space-y-2">
                                    <AnimationLink
                                      to={service.to}
                                      className="block"
                                      onClick={() =>
                                        handleServiceLinkClick(service.to)
                                      }
                                    >
                                      {service.title}
                                    </AnimationLink>
                                    <div className="pl-4 flex flex-col gap-2 mt-1">
                                      {service.SocialLnks.map(
                                        (social, socialIdx) => (
                                          <a
                                            key={socialIdx}
                                            href={social.iconLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center text-sm text-gray-600"
                                            onClick={() =>
                                              setMobileMenuOpen(false)
                                            }
                                          >
                                            <span className="mr-2">
                                              {social.icon}
                                            </span>
                                            {social.title}
                                          </a>
                                        )
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <AnimationLink
                                    to={service.to}
                                    className="block"
                                    onClick={() =>
                                      handleServiceLinkClick(service.to)
                                    }
                                  >
                                    {service.title}
                                  </AnimationLink>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <AnimationLink
                        to={link.path}
                        className="block py-2 text-lg font-semibold"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {link.name}
                      </AnimationLink>
                    )}
                  </li>
                ))}
              </ul>
            </nav>

            {/* Mobile User Profile or Login/Register */}
            <MobileUserProfile />

            {/* Mobile Language Switcher */}
            <div className="px-4 py-3 border-t border-gray-200">
              <button
                onClick={() => {
                  changeLanguage(i18n.language == "en" ? "ar" : "en");
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 text-[#30B797]"
              >
                <RiGlobalLine size={20} />
                <span>
                  {i18n.language == "en"
                    ? t("Switch to Arabic")
                    : t("Switch to English")}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Backdrop for mobile menu */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </div>
    </header>
  );
}
