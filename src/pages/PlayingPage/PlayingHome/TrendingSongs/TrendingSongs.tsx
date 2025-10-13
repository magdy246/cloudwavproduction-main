import {
  // RiDownload2Line,
  RiHeartFill,
  RiImageLine,
  RiPlayLine,
  RiReplay10Line,
} from "@remixicon/react";
import { useState } from "react";

import { useMutation, useQuery } from "@tanstack/react-query";
import { axiosServices } from "../../../../utils/axios";
import { ImageComponent } from "../../../../components/ImageComponent/ImageComponent";
import SectionLoading from "../../../../components/SectionLoading/SectionLoading";
import { AxiosError, AxiosResponse } from "axios";
import { Spinner2 } from "../../../../components/Spinner/Spinner";
import useSnackbar from "../../../../components/Snackbar/Snackbar";
import { useAuth } from "../../../../Providers/AuthContext";
// Import the player context
import { usePlayer } from "../../../../Context/PlayerContext";

interface TTrendingSong {
  artist: string;
  audio_url: string;
  cover_url: string;
  debug_path: string;
  id: number;
  likes_count: null | number;
  title: string;
  cover_path: string;
}

// interface TDownload {
//   signed_url: string;
// }

interface TLiked {
  isLiked: boolean;
  count: number;
}

export default function TrendingSongs({ filter }: { filter?: "top" }) {
  const [likedSongId, setLikedSongId] = useState<number | null>(null);
  // const [, setDownloadSongId] = useState<null | number>(null);
  const { Content, handleChange } = useSnackbar();
  const auth = useAuth();
  // Use the player context
  const { setCurrentSong, setPlayerVisible } = usePlayer();

  const {
    data: trendingSong = [],
    isFetching,
    isError,
    error,
    refetch,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useQuery<any, any, TTrendingSong[]>({
    queryKey: ["trending-songs"],
    queryFn: () => axiosServices.get("/trendingSongs"),
    select: (data) => {
      const finalData = data?.data;
      if (filter == "top") {
        return finalData?.sort(
          (a: any, c: any) => c.likes_count - a.likes_counts
        );
      }
      return data?.data;
    },
  });

  const { mutate, isPending: isLiking } = useMutation<
    AxiosResponse<TLiked>,
    AxiosError<Error>,
    number
  >({
    mutationKey: ["add-like"],
    mutationFn: (id) => axiosServices.post(`/songs/${id}/like`),
    onSuccess: (data) => {
      setLikedSongId(null);
      handleChange(
        data.data.isLiked ? "Like added successfully" : "Like removed",
        "success"
      );
    },
    onError: (error) => {
      setLikedSongId(null);
      handleChange(`Error: ${error.message}`, "error");
    },
  });

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

  // Add function to play song in the bottom player
  const playSongInBottomPlayer = (song: TTrendingSong) => {
    setCurrentSong(song);
    setPlayerVisible(true);
  };

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-red-500 mb-4">
          Failed to load trending songs: {error?.message}
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

  return (
    <div className="pb-24">
      {/* Add padding bottom to make room for the player */}
      {isFetching ? (
        Array(4)
          .fill(0)
          .map((_, index) => (
            <div key={index} className="flex gap-5 m-5">
              <SectionLoading className="w-40 h-40 rounded" />
              <div className="flex-1 pr-2">
                <SectionLoading className="w-35 h-7 rounded" />
                <SectionLoading className="w-25 mt-2 h-7 rounded" />
                <SectionLoading className="w-full mt-4 h-20 rounded" />
              </div>
            </div>
          ))
      ) : trendingSong.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-gray-500">No trending songs available</p>
        </div>
      ) : (
        trendingSong.map((list, i) => (
          <div key={i} className="m-8">
            <div className="flex gap-6 mb-6">
              <div
                className="w-40 h-40 rounded overflow-hidden cursor-pointer"
                onClick={() => playSongInBottomPlayer(list)}
              >
                <ImageComponent
                  fallback={
                    <div className="bg-gray-200 w-full h-full flex-center">
                      <RiImageLine size={50} />
                    </div>
                  }
                  path={list.cover_url}
                >
                  <div className="relative group">
                    <img
                      src={list.cover_url}
                      alt={list.title}
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
                  className="text-2xl font-semibold cursor-pointer hover:text-blue-500"
                  onClick={() => playSongInBottomPlayer(list)}
                >
                  {list.title}
                </h3>
                <p className="text-2xl font-normal mb-3">{list.artist}</p>

                {auth?.isLogin && (
                  <div className="actions-buttons flex items-center gap-3 mt-auto">
                    <button
                      onClick={() => {
                        setLikedSongId(list.id);
                        mutate(list.id);
                      }}
                      disabled={likedSongId === list.id && isLiking}
                      className="transition-transform hover:scale-110"
                    >
                      {likedSongId === list.id && isLiking ? (
                        <Spinner2 w={6} h={6} b="red" />
                      ) : (
                        <RiHeartFill
                          size={30}
                          color={list.likes_count ? "#FF5B89" : "black"}
                        />
                      )}
                    </button>
                    <button className="transition-transform hover:scale-110">
                      <RiReplay10Line size={30} />
                    </button>
                    {/* <button
                      onClick={() => {
                        setDownloadSongId(list.id);
                        download(list.id);
                      }}
                      disabled={downloadSongId === list.id && isDownloading}
                      className="transition-transform hover:scale-110"
                    >
                      {downloadSongId === list.id && isDownloading ? (
                        <Spinner2 w={6} h={6} b="red" />
                      ) : (
                        <RiDownload2Line size={30} />
                      )}
                    </button> */}
                    <button
                      onClick={() => playSongInBottomPlayer(list)}
                      className="ml-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                      Play
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))
      )}
      <Content />
    </div>
  );
}
