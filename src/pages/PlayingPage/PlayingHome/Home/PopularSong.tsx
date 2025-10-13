/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  // RiDownload2Line,
  RiImageLine,
  RiPlayLine,
  // RiReplay10Line,
} from "@remixicon/react";

import {  useQuery } from "@tanstack/react-query";
import { axiosServices } from "../../../../utils/axios";
import { ImageComponent } from "../../../../components/ImageComponent/ImageComponent";
import SectionLoading from "../../../../components/SectionLoading/SectionLoading";
import useSnackbar from "../../../../components/Snackbar/Snackbar";
import { useAuth } from "../../../../Providers/AuthContext";
import { usePlayer } from "../../../../Context/PlayerContext";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/swiper-bundle.css";

interface TPopularSong {
  id: number;
  title: string;
  cover_url: string;
  artist_name: string;
  audio_url: string;
  likes_count: null | number;
}

// interface TDownload {
//   signed_url: string;
// }



export default function PopularSong() {
  // const [likedSongId, setLikedSongId] = useState<number | null>(null);
  // const [downloadSongId, setDownloadSongId] = useState<null | number>(null);
  const { Content } = useSnackbar();
  const auth = useAuth();
  const { setCurrentSong, setPlayerVisible } = usePlayer();
  const { i18n } = useTranslation();
  const lang = i18n.language;
  const isAr = lang === "ar";
  // const [searchParams] = useSearchParams();


  const {
    data: popularSong = [],
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery<any, any, TPopularSong[]>({
    queryKey: ["popular-song"],
    queryFn: () => axiosServices.get("/Songs"),
    select: (data) => data?.data,
  });

  // const { mutate, isPending: isLiking } = useMutation<
  //   AxiosResponse<TLiked>,
  //   AxiosError<Error>,
  //   number
  // >({
  //   mutationKey: ["add-like"],
  //   mutationFn: (id) => axiosServices.post(`/songs/${id}/like`),
  //   onSuccess: (data) => {
  //     setLikedSongId(null);
  //     handleChange(
  //       data.data.isLiked ? "Like added successfully" : "Like removed",
  //       "success"
  //     );
  //   },
  //   onError: (error) => {
  //     setLikedSongId(null);
  //     handleChange(`Error: ${error.message}`, "error");
  //   },
  // });

  // const { mutate: download, isPending: isDownloading } = useMutation<
  //   AxiosResponse<TDownload>,
  //   AxiosError<Error>,
  //   number
  // >({
  //   mutationKey: ["download-song"],
  //   mutationFn: (id) => axiosServices.get(`/songs/download-url/${id}`),
  //   onSuccess: (data) => {
  //     setDownloadSongId(null);
  //     const url = data.data;
  //     const button = document.createElement("a");
  //     button.download = "song";
  //     button.href = url.signed_url;
  //     button.click();
  //     handleChange("Download started", "success");
  //   },
  //   onError: (error) => {
  //     setDownloadSongId(null);
  //     handleChange(`Download failed: ${error.message}`, "error");
  //   },
  // });

  const playSongInBottomPlayer = (song: TPopularSong) => {
    setCurrentSong({
      cover_path: song.cover_url,
      id: song.id,
      title: song.title,
      artist: song.artist_name,
      cover_url: song.cover_url,
      audio_url: song.audio_url,
      likes_count: song.likes_count,
      debug_path: "", // Provide a default or meaningful value for debug_path
    });
    setPlayerVisible(true);
  };

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-red-500 mb-4">
          Failed to load popular songs: {error?.message}
        </p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  const SongCard = (song: TPopularSong) => (
    <div className="mb-6">
      <div className="flex flex-col items-center">
        <div
          className="w-40 h-40 rounded overflow-hidden cursor-pointer"
          onClick={() => playSongInBottomPlayer(song)}
        >
          <ImageComponent
            fallback={
              <div className="bg-gray-200 w-full h-full flex-center">
                <RiImageLine size={50} />
              </div>
            }
            path={song.cover_url}
          >
            <div className="relative group">
              <img
                src={song.cover_url}
                alt={song.title}
                className="w-40 h-40 object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <RiPlayLine size={50} color="white" />
              </div>
            </div>
          </ImageComponent>
        </div>
        <div className="details flex flex-col items-center mt-3 w-full">
          <h3
            className="text-lg font-semibold cursor-pointer hover:text-blue-500 text-center truncate w-40"
            onClick={() => playSongInBottomPlayer(song)}
          >
            {song.title}
          </h3>
          <p className="text-sm font-normal mb-3 text-center truncate w-40">
            {song.artist_name}
          </p>

          {auth?.isLogin && (
            <div className="actions-buttons flex items-center gap-3 mt-2 justify-center">
              {/* <button
                onClick={() => {
                  setLikedSongId(song.id);
                  mutate(song.id);
                }}
                disabled={likedSongId === song.id && isLiking}
                className="transition-transform hover:scale-110"
              >
                {likedSongId === song.id && isLiking ? (
                  <Spinner2 w={6} h={6} b="red" />
                ) : (
                  <RiHeartFill
                    size={24}
                    color={song.likes_count ? "#FF5B89" : "black"}
                  />
                )}
              </button> */}
              {/* <button
                onClick={() => {
                  setDownloadSongId(song.id);
                  download(song.id);
                }}
                disabled={downloadSongId === song.id && isDownloading}
                className="transition-transform hover:scale-110"
              >
                {downloadSongId === song.id && isDownloading ? (
                  <Spinner2 w={6} h={6} b="red" />
                ) : (
                  <RiDownload2Line size={24} />
                )}
              </button> */}
              <button
                onClick={() => playSongInBottomPlayer(song)}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
              >
                {isAr ? "تشغيل" : "Play"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="mt-8 mx-7">
      <h4 className="dashboard__main__title mb-6">
        {isAr ? "الأغاني الأكثر شعبية" : "Popular Song"}
      </h4>

      {isFetching ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {Array(4)
            .fill(0)
            .map((_, index) => (
              <div key={index} className="flex flex-col items-center">
                <SectionLoading className="w-40 h-40 rounded" />
                <SectionLoading className="w-32 h-5 mt-3 rounded" />
                <SectionLoading className="w-24 h-4 mt-2 rounded" />
              </div>
            ))}
        </div>
      ) : popularSong.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-gray-500">No popular songs available</p>
        </div>
      ) : (
        <>
          {/* Mobile view with swiper */}
          <div className="md:hidden">
            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={10}
              slidesPerView={1.5}
              centeredSlides={false}
              pagination={{ clickable: true }}
              className="popular-songs-swiper"
            >
              {popularSong.map((song, i) => (
                <SwiperSlide key={i}>{SongCard(song)}</SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* Desktop view with swiper */}
          <div className="hidden md:block">
            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={20}
              slidesPerView={4}
              // navigation={true}
              // pagination={{ clickable: true, dynamicBullets: true }}
              breakpoints={{
                640: { slidesPerView: 2, spaceBetween: 15 },
                768: { slidesPerView: 3, spaceBetween: 15 },
                1024: { slidesPerView: 4, spaceBetween: 20 },
                1280: { slidesPerView: 5, spaceBetween: 20 },
              }}
              className="popular-songs-swiper"
            >
              {popularSong.map((song, i) => (
                <SwiperSlide key={i}>{SongCard(song)}</SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* List view for older browsers or fallback */}
          <div className="hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {popularSong.map((song, i) => (
                <div key={i} className="m-4">
                  <div className="flex gap-6 mb-6">
                    <div
                      className="w-40 h-40 rounded overflow-hidden cursor-pointer"
                      onClick={() => playSongInBottomPlayer(song)}
                    >
                      <ImageComponent
                        fallback={
                          <div className="bg-gray-200 w-full h-full flex-center">
                            <RiImageLine size={50} />
                          </div>
                        }
                        path={song.cover_url}
                      >
                        <div className="relative group">
                          <img
                            src={song.cover_url}
                            alt={song.title}
                            className="w-40 h-40 object-cover"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <RiPlayLine size={50} color="white" />
                          </div>
                        </div>
                      </ImageComponent>
                    </div>
                    <div className="details flex flex-col">
                      <h3
                        className={clsx(
                          "text-2xl font-semibold cursor-pointer hover:text-blue-500",
                          isAr ? "text-right" : "text-left"
                        )}
                        onClick={() => playSongInBottomPlayer(song)}
                      >
                        {song.title}
                      </h3>
                      <p className="text-2xl font-normal mb-3">
                        {song.artist_name}
                      </p>

                      {/* {auth?.isLogin && (
                        <div
                          className={clsx(
                            "actions-buttons flex items-center gap-3 mt-auto",
                            isAr ? "justify-end" : "justify-start"
                          )}
                        >
                          <button
                            onClick={() => {
                              setLikedSongId(song.id);
                              mutate(song.id);
                            }}
                            disabled={likedSongId === song.id && isLiking}
                            className="transition-transform hover:scale-110"
                          >
                            {likedSongId === song.id && isLiking ? (
                              <Spinner2 w={6} h={6} b="red" />
                            ) : (
                              <RiHeartFill
                                size={30}
                                color={song.likes_count ? "#FF5B89" : "black"}
                              />
                            )}
                          </button>
                          <button className="transition-transform hover:scale-110">
                            <RiReplay10Line size={30} />
                          </button>
                          <button
                            onClick={() => {
                              setDownloadSongId(song.id);
                              download(song.id);
                            }}
                            disabled={
                              downloadSongId === song.id && isDownloading
                            }
                            className="transition-transform hover:scale-110"
                          >
                            {downloadSongId === song.id && isDownloading ? (
                              <Spinner2 w={6} h={6} b="red" />
                            ) : (
                              <RiDownload2Line size={30} />
                            )}
                          </button>
                          <button
                            onClick={() => playSongInBottomPlayer(song)}
                            className="ml-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                          >
                            {isAr ? "تشغيل" : "Play"}
                          </button>
                        </div>
                      )} */}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      <Content />
    </div>
  );
}
