/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState } from 'react';

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
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSong, setCurrentSong] = useState<TTrendingSong | null>(null);
  const [isPlayerVisible, setPlayerVisible] = useState<boolean>(false);

  return (
    <PlayerContext.Provider 
      value={{ currentSong, setCurrentSong, isPlayerVisible, setPlayerVisible }}
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