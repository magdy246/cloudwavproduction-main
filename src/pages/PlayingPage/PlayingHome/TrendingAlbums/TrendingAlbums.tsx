import {
  // RiDownload2Line,
  // RiHeartFill,
  RiImageLine,
  // RiPauseFill,
  // RiPlayFill,
  // RiReplay10Line,
} from "@remixicon/react";
// import image9 from "../../../../assets/images/dashboard/dashboardHomeImage/HomeImage/image9.svg";
// import image16 from "../../../../assets/images/dashboard/dashboardHomeImage/HomeImage/image16.svg";
// import image17 from "../../../../assets/images/dashboard/dashboardHomeImage/HomeImage/image17.svg";
// import image18 from "../../../../assets/images/dashboard/dashboardHomeImage/HomeImage/image18.svg";
// import audioTest from "../../../../assets/audios/test.wav";
import AnimationLink from "../../../../components/AnimationLink/AnimationLink";
// import { MouseEvent, useRef, useState } from "react";
// import { useGSAP } from "@gsap/react";
// import { formatTime } from "../../../../utils/functions";
// import { gsap } from "gsap";
import {
  //  useQueries,
  useQuery,
} from "@tanstack/react-query";
import { axiosServices } from "../../../../utils/axios";
import { TAlbum } from "../../../../types";
import SectionLoading from "../../../../components/SectionLoading/SectionLoading";
import { ImageComponent } from "../../../../components/ImageComponent/ImageComponent";
import clsx from "clsx";
import { getImagePath } from "../../../../utils/functions";

export default function TrendingAlbums() {
  const { data: trendingAlbum = [], isFetching } = useQuery<any, any, TAlbum[]>(
    {
      queryKey: ["trending-album"],
      queryFn: () => axiosServices.get("/trending-albums"),
      select: (data) => {
        return data.data;
      },
    }
  );
  return (
    <div className="m-8 grid grid-cols-1 md:grid-col-2 lg:grid-cols-4 gap-3">
      {isFetching ? (
        Array(8)
          .fill(0)
          .map(() => (
            <div>
              <SectionLoading className="h-40 w-full  rounded" />
              <SectionLoading className="w-40 h-10  mt-3 rounded" />
              <SectionLoading className="w-40 h-5  mt-3 rounded" />
            </div>
          ))
      ) : trendingAlbum.length == 0 ? (
        <p className="place-items-center">No Album Found</p>
      ) : (
        trendingAlbum.map((list) => (
          <AnimationLink
            to={"/album/" + list.id}
            key={list.id}
            className="shrink-0 pl-1"
          >
            <div className="w-full h-40 rounded overflow-hidden  flex-center">
              <ImageComponent
                path={getImagePath(list.album_cover)}
                fallback={
                  <div className="bg-gray-200 w-full h-full flex-center">
                    <RiImageLine size={50} />
                  </div>
                }
              >
                <img
                  src={getImagePath(list.album_cover)}
                  alt={list.title + "image"}
                  className="w-40 h-40 object-cover"
                />
              </ImageComponent>
            </div>
            <h6
              className={clsx(
                "text-2xl font-semibold capitalize mt-2 max-w-30 text-left min-h-16"
              )}
            >
              {list.title}
            </h6>
            <p className="font-normal text-[18px]">{list.artist.name}</p>
          </AnimationLink>
        ))
      )}
    </div>
  );
}
