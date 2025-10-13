/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { axiosServices } from "../../utils/axios";
import { getImagePath } from "../../utils/functions";
import OrderNowButton from "../../components/OrderNowButton/OrderNowButton";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import NoResultFound from "../../components/NoResultFound/NoResultFound";
import { RiLoader2Fill, RiVideoLine } from "@remixicon/react";

const Single = () => {
  const { OrderName } = useParams<{ OrderName: string }>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [starInfo, setStarInfo] = useState<any>({});

  const getorder = async () => {
    const response = await axiosServices(`/video-creators/${OrderName}`);
    setStarInfo(response.data);
  };

  const { data: videos = [], isPending } = useQuery({
    queryKey: ["videos", OrderName],
    queryFn: () => axiosServices.get<{videos:{url:string;title:string}[]}>(`/video-creators/${OrderName}/videos`),
    select: (data) => data.data.videos,
  });

  console.log(videos, "videos");

  useEffect(() => {
    getorder();
  }, []);
  const { t } = useTranslation();

  return (
    <>
      <div className="container min-h-screen lg:flex">
        <div className="lg:w-1/3">
          <div className="flex flex-col justify-center items-center gap-4">
            <img
              src={getImagePath(starInfo.profile_image)}
              alt={starInfo.name}
              className="object-cover w-52 h-52 rounded-full"
            />
            <h2 className="text-2xl font-bold first-letter:uppercase">
              {starInfo.name}
            </h2>
            <OrderNowButton orderInfo={starInfo} />
          </div>
        </div>
        <div className="lg:w-2/3">
          <div className="flex flex-col gap-4">
            <h2 className="font-bold text-3xl">
              {t("star.about")} {starInfo.name}
            </h2>
            <p className="text-[#30B797] text-xl">{starInfo.description}</p>
            <div className="flex flex-row gap-4 items-center font-bold mt-6">
              <span className="text-[#4D39CF] px-4 py-2 rounded-2xl bg-[#cbc8da] text-lg">
                {starInfo.division}
              </span>
            </div>
            <div className="flex flex-col items-center justify-center mt-10 w-full space-y-8 px-4">
              {isPending ? <RiLoader2Fill size={50} className="text-purple-400 animate-spin"/>:videos.length === 0 ? (
                <NoResultFound><RiVideoLine size={40}/></NoResultFound>
              ) : (
                videos.map((video) => (
                  <div
                    key={video.url}
                    className="w-full max-w-3xl bg-white rounded-2xl shadow-md overflow-hidden transition-transform hover:scale-[1.01]"
                  >
                    <div className="p-4 border-b border-gray-100">
                      <h2 className="text-lg font-semibold text-gray-800">
                        {video.title}
                      </h2>
                    </div>
                    <video
                      src={video.url}
                      className="w-full aspect-video object-cover"
                      controls
                    ></video>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Single;
