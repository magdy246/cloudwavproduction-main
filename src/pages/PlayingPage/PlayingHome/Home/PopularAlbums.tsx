/* eslint-disable @typescript-eslint/no-explicit-any */
import { RiImageLine } from "@remixicon/react";
import clsx from "clsx";
import { useQuery } from "@tanstack/react-query";
import { axiosServices } from "../../../../utils/axios";
import AnimationLink from "../../../../components/AnimationLink/AnimationLink";
import { ImageComponent } from "../../../../components/ImageComponent/ImageComponent";
import { TAlbum } from "../../../../types";
import SectionLoading from "../../../../components/SectionLoading/SectionLoading";
import { useTranslation } from "react-i18next";
import { SharedSections } from "./SharedSections";

export default function PopularAlbums() {
  const imageBaseUrl = "https://api.cloudwavproduction.com/storage/";

  const { data: popularAlbum = [], isFetching } = useQuery<any, any, TAlbum[]>({
    queryKey: ["popular-album"],
    queryFn: () => axiosServices.get("/albums"),
    select: (data) => data?.data,
  });

  const { i18n } = useTranslation();
  const lang = i18n.language;
  const isAr = lang === "ar";

  return (
    <SharedSections title={isAr ? "الألبوم الأكثر شعبية" : "Popular Album"}>
      {isFetching
        ? Array(8)
            .fill(0)
            .map((_, index) => (
              <div key={index}>
                <SectionLoading className="w-40 h-40 rounded" />
                <SectionLoading className="w-40 h-7 mt-3 rounded" />
              </div>
            ))
        : popularAlbum.map((list) => (
            <AnimationLink
              to={"/album/" + list.id}
              key={list.id}
              className="shrink-0 pl-1"
            >
              <div className="w-full h-40 rounded overflow-hidden flex-center">
                <ImageComponent
                  path={imageBaseUrl + list.album_cover}
                  fallback={
                    <div className="bg-gray-200 w-full h-full flex-center">
                      <RiImageLine size={50} />
                    </div>
                  }
                >
                  <img
                    src={imageBaseUrl + list.album_cover}
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
          ))}
    </SharedSections>
  );
}
