/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { axiosServices } from '../utils/axios';

export interface TTrendingSong {
  artist: string;
  audio_url: string;
  cover_url: string;
  cover_path: string;
  debug_path: string;
  id: number;
  likes_count: null | number;
  title: string;
}

interface PlayerContextType {
  currentSong: TTrendingSong | null;
  setCurrentSong: (song: TTrendingSong | null) => void;
  isPlayerVisible: boolean;
  setPlayerVisible: (visible: boolean) => void;
  playlist: TTrendingSong[];
  currentIndex: number;
  nextSong: () => void;
  previousSong: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSong, setCurrentSong] = useState<TTrendingSong | null>(null);
  const [isPlayerVisible, setPlayerVisible] = useState<boolean>(false);
  const [playlist, setPlaylist] = useState<TTrendingSong[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);

  // Fetch all songs when currentSong changes to build playlist
  useEffect(() => {
    if (currentSong) {
      // Fetch all songs to build playlist
      axiosServices.get("/Songs")
        .then((response) => {
          const songs = response.data || [];
          // Normalize songs to TTrendingSong format
          const normalizedSongs: TTrendingSong[] = songs.map((song: any) => ({
            id: song.id,
            title: song.title,
            artist: song.artist_name || song.artist || 'Unknown Artist',
            cover_url: song.cover_url || song.cover_path || '',
            cover_path: song.cover_path || song.cover_url || '',
            audio_url: song.audio_url || '',
            debug_path: song.debug_path || '',
            likes_count: song.likes_count || null,
          }));
          
          setPlaylist(normalizedSongs);
          
          // Find current song index in playlist
          const index = normalizedSongs.findIndex(song => song.id === currentSong.id);
          setCurrentIndex(index >= 0 ? index : 0);
        })
        .catch((error) => {
          console.error('Failed to fetch songs for playlist:', error);
        });
    } else {
      setPlaylist([]);
      setCurrentIndex(-1);
    }
  }, [currentSong?.id]); // Only refetch if song ID changes

  const nextSong = () => {
    if (playlist.length > 0 && currentIndex >= 0 && currentIndex < playlist.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentSong(playlist[nextIndex]);
      setCurrentIndex(nextIndex);
    }
  };

  const previousSong = () => {
    if (playlist.length > 0 && currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentSong(playlist[prevIndex]);
      setCurrentIndex(prevIndex);
    }
  };

  return (
    <PlayerContext.Provider 
      value={{ 
        currentSong, 
        setCurrentSong, 
        isPlayerVisible, 
        setPlayerVisible,
        playlist,
        currentIndex,
        nextSong,
        previousSong,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = (): PlayerContextType => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};