/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    // RiArrowLeftSLine,
    // RiArrowRightSLine,
    RiImageLine,
  } from "@remixicon/react";
  import clsx from "clsx";
  // import SimpleSlider from "../../../../components/SimpleSlider/SimpleSlider";
  // import { useRef } from "react";
  import SectionLoading from "../../../../components/SectionLoading/SectionLoading";
  import { useQuery } from "@tanstack/react-query";
  import { axiosServices } from "../../../../utils/axios";
  import AnimationLink from "../../../../components/AnimationLink/AnimationLink";
  import { ImageComponent } from "../../../../components/ImageComponent/ImageComponent";
  import { useTranslation } from "react-i18next";
  import  {SharedSections}  from "./SharedSections";
  
  export default function PopularArticles() {
    interface TPopularArtist {
      profile_image: string;
      name: string;
      id: number;
    }
    const { data: popularArtist = [], isFetching } = useQuery<
      any,
      any,
      TPopularArtist[]
    >({
      queryKey: ["popular-artist"],
      queryFn: () => axiosServices.get("/artists"),
      select: (data) => data?.data,
    });
    const { i18n } = useTranslation();
    const lang = i18n.language;
    const isAr = lang === "ar";
  
    return (
      <SharedSections title={isAr ? "فنان الأكثر شعبية" : "Popular Artist"}>
        {isFetching
          ? Array(8)
              .fill(0)
              .map((_, index) => (
                <div key={index}>
                  <SectionLoading className="w-40 h-40 rounded-full" />
                  <SectionLoading className="w-40 h-7 mt-3 rounded" />
                </div>
              ))
          : popularArtist.map((list) => (
              <AnimationLink
                to={"/artist/" + list.id}
                key={list.id}
                className="shrink-0"
              >
                <div className="w-40 h-40 rounded-full overflow-hidden flex-center">
                  <ImageComponent
                    path={list.profile_image}
                    fallback={
                      <div className="bg-gray-200 w-full h-full flex-center">
                        <RiImageLine size={50} />
                      </div>
                    }
                  >
                    <img
                      src={list.profile_image}
                      alt={list.name + "image"}
                      className="w-40 h-40 object-cover"
                    />
                  </ImageComponent>
                </div>
                <h6 className={clsx("text-2xl font-semibold text-center mt-2")}>
                  {list.name}
                </h6>
              </AnimationLink>
            ))}
      </SharedSections>
    );
  }