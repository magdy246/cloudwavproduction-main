import React, { useState, useEffect } from 'react';
import { RiCloseLine, RiHeartFill, RiDownload2Line, RiArrowDownLine, RiArrowUpLine } from '@remixicon/react';
import { usePlayer } from '../../Context/PlayerContext';
import AudioPlayer from '../AudioPlayer/AudioPlayer';
import { ImageComponent } from '../ImageComponent/ImageComponent';
import { RiImageLine } from '@remixicon/react';
import { useMutation } from '@tanstack/react-query';
import { axiosServices } from '../../utils/axios';
import { AxiosError, AxiosResponse } from 'axios';
import { Spinner2 } from '../Spinner/Spinner';
import useSnackbar from '../Snackbar/Snackbar';

interface TDownload {
  signed_url: string;
}

interface TLiked {
  isLiked: boolean;
  count: number;
}

const BottomPlayer: React.FC = () => {
  const { currentSong, setCurrentSong, isPlayerVisible, setPlayerVisible } = usePlayer();
  const [likedSongId, setLikedSongId] = useState<number | null>(null);
  const [downloadSongId, setDownloadSongId] = useState<null | number>(null);
  const { Content, handleChange } = useSnackbar();
  
  // New state for expanded/collapsed view
  const [isExpanded, setIsExpanded] = useState(true);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // Set expanded on first load
  useEffect(() => {
    if (currentSong && isFirstLoad) {
      setIsExpanded(true);
      setIsFirstLoad(false);
    }
  }, [currentSong, isFirstLoad]);

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
    }
  });
  
  const { mutate: download, isPending: isDownloading } = useMutation<
    AxiosResponse<TDownload>,
    AxiosError<Error>,
    number
  >({
    mutationKey: ["download-song"],
    mutationFn: (id) => axiosServices.get(`/songs/download-url/${id}`),
    onSuccess: (data) => {
      setDownloadSongId(null);
      const url = data.data;
      const button = document.createElement("a");
      button.download = "song";
      button.href = url.signed_url;
      button.click();
      handleChange("Download started", "success");
    },
    onError: (error) => {
      setDownloadSongId(null);
      handleChange(`Download failed: ${error.message}`, "error");
    }
  });

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  if (!isPlayerVisible || !currentSong) {
    return null;
  }

  return (
    <div 
      className={`fixed left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-50 transition-all duration-300 ${
        isExpanded ? 'top-0 bottom-0' : 'bottom-0'
      }`}
    >
      {/* Toggle expand/collapse button */}
      <div className="absolute top-4 right-4 z-10">
        <button 
          onClick={toggleExpanded}
          className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-all"
        >
          {isExpanded ? <RiArrowDownLine size={24} /> : <RiArrowUpLine size={24} />}
        </button>
      </div>

      {/* Expanded View */}
      {isExpanded && (
        <div className="h-full pt-16 px-4 pb-24 overflow-y-auto">
          <div className="max-w-screen-xl mx-auto flex flex-col items-center">
            {/* Large cover image */}
            <div className="w-64 h-64 mb-8 mt-8 rounded-lg overflow-hidden shadow-lg">
              <ImageComponent 
                fallback={
                  <div className="bg-gray-200 w-full h-full flex items-center justify-center">
                    <RiImageLine size={48} />
                  </div>
                }
                path={currentSong.cover_url}
              >
                <img
                  src={currentSong.cover_url}
                  alt={currentSong.title}
                  className="w-full h-full object-cover"
                />
              </ImageComponent>
            </div>
            
            {/* Song details */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold">{currentSong.title}</h2>
              <p className="text-lg text-gray-600">{currentSong.artist}</p>
            </div>
            
            {/* Extra song info could be added here */}
            <div className="w-full max-w-md mb-8">
              {/* You can add additional song information here */}
            </div>
          </div>
        </div>
      )}

      {/* Player Controls (Always visible) */}
      <div className="absolute bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 p-4">
        <div className="max-w-screen-xl mx-auto flex items-center gap-4">
          {/* Song info */}
          <div className="flex items-center gap-4 w-1/4">
            <div className="w-16 h-16 rounded overflow-hidden">
              <ImageComponent 
                fallback={
                  <div className="bg-gray-200 w-full h-full flex items-center justify-center">
                    <RiImageLine size={24} />
                  </div>
                }
                path={currentSong.cover_url}
              >
                <img
                  src={currentSong.cover_url}
                  alt={currentSong.title}
                  className="w-16 h-16 object-cover"
                />
              </ImageComponent>
            </div>
            <div className="truncate">
              <h4 className="font-semibold text-sm truncate">{currentSong.title}</h4>
              <p className="text-sm text-gray-600 truncate">{currentSong.artist}</p>
            </div>
          </div>
          
          {/* Audio player */}
          <div className="flex-1">
            <AudioPlayer 
              src={`https://api.cloudwavproduction.com/api/songs/${currentSong.id}/stream`}
              id={currentSong.id}
            />
          </div>
          
          {/* Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setLikedSongId(currentSong.id);
                mutate(currentSong.id);
              }}
              disabled={likedSongId === currentSong.id && isLiking}
              className="transition-transform hover:scale-110"
            >
              {likedSongId === currentSong.id && isLiking ? (
                <Spinner2 w={6} h={6} b="red" />
              ) : (
                <RiHeartFill
                  size={24}
                  color={currentSong.likes_count ? "#FF5B89" : "black"}
                />
              )}
            </button>
            <button
              onClick={() => {
                setDownloadSongId(currentSong.id);
                download(currentSong.id);
              }}
              disabled={downloadSongId === currentSong.id && isDownloading}
              className="transition-transform hover:scale-110"
            >
              {downloadSongId === currentSong.id && isDownloading ? (
                <Spinner2 w={6} h={6} b="red" />
              ) : (
                <RiDownload2Line size={24} />
              )}
            </button>
            <button
              onClick={() => {
                setPlayerVisible(false);
                setCurrentSong(null);
              }}
              className="ml-2 transition-transform hover:scale-110"
            >
              <RiCloseLine size={24} />
            </button>
            <button 
          onClick={toggleExpanded}
          className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-all"
        >
          {isExpanded ? <RiArrowDownLine size={24} /> : <RiArrowUpLine size={24} />}
        </button>
          </div>
          <Content />
        </div>
      </div>
    </div>
  );
};

export default BottomPlayer;