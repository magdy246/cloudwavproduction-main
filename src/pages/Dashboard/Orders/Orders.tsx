import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { TableOfContent } from "../../../components/DashboardComponents/Table/Table";
import { axiosServices } from "../../../utils/axios";
import { useTranslation } from "react-i18next";
import { RiDeleteBinLine, RiEyeLine } from "@remixicon/react";
import { AxiosError } from "axios";
import Swal from "sweetalert2";
import { Spinner2 } from "../../../components/Spinner/Spinner";
import Dialog from "../../../components/Dialog/Dialog";
import clsx from "clsx";
type Order = {
  id: number;
  user_id: number;
  video_creator_id: number;
  private_price: string;
  bussiness_price: string;
  phone: string;
  whatsapp: string;
  status: string;
  details: string | null;
  created_at: string;
  video_creator: {
    id: number;
    name: string;
  };
  user: {
    id: number;
    name: string;
    email: string;
  };
};

export default function Orders() {
  const { t, i18n } = useTranslation();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const {
    data: orders = [],
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: () => axiosServices.get("/orders"),
    select: (data) => data.data,
  });

  const { mutate: deleteOrder } = useMutation<
    any,
    AxiosError<Error>,
    number
  >({
    mutationFn: (id) => {
      setDeletingId(id);
      return axiosServices.delete(`/orders/${id}`);
    },
    onSuccess: (data) => {
      Swal.fire(data.data.message || "Order deleted successfully", "", "success");
      refetch();
      setDeletingId(null);
    },
    onError: (error) => {
      Swal.fire(error.response?.data.message || "Error deleting order", "", "error");
      setDeletingId(null);
    },
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language === "ar" ? "ar-SA" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const actionsList = [
    {
      color: "blue",
      Icon: <RiEyeLine />,
      label: "view",
      action: (id: number) => {
        const order = orders.find((o: Order) => o.id === id);
        if (order) {
          setSelectedOrder(order);
        }
      },
    },
    {
      color: "red",
      Icon: <RiDeleteBinLine />,
      label: "delete",
    },
  ];

  return (
    <>
      <TableOfContent
        dataBody={orders}
        refetch={refetch}
        dataHead={[
          {
            label: t("dashboard.requestACreatorPage.businessPrice"),
            name: "bussiness_price",
          },
          {
            label: t("dashboard.requestACreatorPage.privatePrice"),
            name: "private_price",
          },
          {
            label: t("dashboard.requestACreatorPage.video_creator"),
            name: "video_creator",
            select: (e) => e.name,
          },
          {
            label: t("dashboard.requestACreatorPage.user"),
            name: "user",
            select: (e) => e.name,
          },
          {
            label: t("dashboard.requestACreatorPage.number"),
            name: "phone",
          },
          {
            label: t("dashboard.requestACreatorPage.whatsapp"),
            name: "whatsapp",
          },
          {
            label: t("dashboard.requestACreatorPage.status"),
            name: "status",
          },
        ]}
        actions={actionsList.map((el) => ({
          action: (id) => {
            if (el.label === "view") {
              el.action?.(id);
            } else {
              deleteOrder(id);
            }
          },
          Icon: (rowId) => (
            <span
              className={clsx(
                "w-10 h-10 flex items-center justify-center rounded-full cursor-pointer transition-colors",
                el.color === "blue"
                  ? "bg-blue-200 text-blue-600 hover:bg-blue-300"
                  : "bg-red-200 text-red-600 hover:bg-red-300"
              )}
            >
              {deletingId === rowId && el.label === "delete" ? (
                <Spinner2 w={10} h={10} />
              ) : (
                el.Icon
              )}
            </span>
          ),
        }))}
        isFetching={isFetching}
        title={t("dashboard.navLinks.orders")}
        acceptRoute="service-update-status"
      />
      <Dialog
        open={!!selectedOrder}
        handleClose={() => setSelectedOrder(null)}
        title={t("dashboard.navLinks.orders")}
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Order ID */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Order ID</span>
                <span className="text-lg font-bold text-purple-600">#{selectedOrder.id}</span>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Status</span>
              <span
                className={clsx(
                  "px-3 py-1 rounded-full text-sm font-semibold capitalize",
                  selectedOrder.status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : selectedOrder.status === "completed"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                )}
              >
                {selectedOrder.status}
              </span>
            </div>

            {/* Pricing Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-600 mb-1">
                  {t("dashboard.requestACreatorPage.businessPrice")}
                </div>
                <div className="text-xl font-bold text-blue-700">
                  ${selectedOrder.bussiness_price}
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-600 mb-1">
                  {t("dashboard.requestACreatorPage.privatePrice")}
                </div>
                <div className="text-xl font-bold text-green-700">
                  ${selectedOrder.private_price}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-600 mb-1">
                    {t("dashboard.requestACreatorPage.number")}
                  </div>
                  <div className="text-base font-semibold text-gray-800">
                    {selectedOrder.phone}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-600 mb-1">
                    {t("dashboard.requestACreatorPage.whatsapp")}
                  </div>
                  <div className="text-base font-semibold text-gray-800">
                    {selectedOrder.whatsapp}
                  </div>
                </div>
              </div>
            </div>

            {/* User Information */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                {t("dashboard.requestACreatorPage.user")} Information
              </h3>
              <div className="bg-purple-50 rounded-lg p-4 space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-600">Name: </span>
                  <span className="text-base font-semibold text-gray-800">
                    {selectedOrder.user.name}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Email: </span>
                  <span className="text-base font-semibold text-gray-800">
                    {selectedOrder.user.email}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">User ID: </span>
                  <span className="text-base font-semibold text-gray-800">
                    {selectedOrder.user.id}
                  </span>
                </div>
              </div>
            </div>

            {/* Video Creator Information */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                {t("dashboard.requestACreatorPage.video_creator")} Information
              </h3>
              <div className="bg-indigo-50 rounded-lg p-4 space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-600">Name: </span>
                  <span className="text-base font-semibold text-gray-800">
                    {selectedOrder.video_creator.name}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Creator ID: </span>
                  <span className="text-base font-semibold text-gray-800">
                    {selectedOrder.video_creator.id}
                  </span>
                </div>
              </div>
            </div>

            {/* Additional Details */}
            {selectedOrder.details && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                  Additional Details
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-base text-gray-700 whitespace-pre-wrap">
                    {selectedOrder.details}
                  </p>
                </div>
              </div>
            )}

            {/* Order Date */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-600 mb-1">Created At</div>
              <div className="text-base font-semibold text-gray-800">
                {formatDate(selectedOrder.created_at)}
              </div>
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
}
