/* eslint-disable react-hooks/exhaustive-deps */
import { 
  RiPauseLine, 
  RiPlayLine, 
  RiLoader4Line, 
  RiVolumeMuteLine, 
  RiVolumeUpLine,
  RiSpeedLine
} from "@remixicon/react";
import { useRef, useCallback, useState, useEffect } from "react";
import { useWavesurfer } from "@wavesurfer/react";
import { formatTime } from "../../utils/functions";

// Create a global event system for audio control
const AUDIO_EVENTS = {
  PLAY_STARTED: "AUDIO_PLAY_STARTED",
};

// Global map to track all audio player instances
const globalAudioPlayers = new Map();

export default function AudioPlayer({
  src,
  id,
  type = "audio",
}: {
  src: string;
  id: string | number; // Unique ID for this player
  type?: "audio" | "video";
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const instanceId = useRef(`audio-player-${id}`);
  
  // New state for controls
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedControls, setShowSpeedControls] = useState(false);
  
  // Audio visualization state
  const [peaks, setPeaks] = useState<number[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const { currentTime, wavesurfer, isPlaying } = useWavesurfer({
    container: containerRef,
    height: 100,
    waveColor: "rgba(173, 173, 173, 0.5)", // More transparent
    progressColor: "#EEB440",
    [type === "audio" ? "url" : "media"]: type === "audio" ? src : video.current,
    barGap: 4, // Smaller gap for more bars
    barRadius: 5, // Rounder bars
    barWidth: 2, // Thinner bars for more dynamic look
    cursorWidth: 2,
    cursorColor: "#ffffff", // White cursor
    dragToSeek: true,
    backend: "MediaElement",
    normalize: true, // Normalize the waveform
  });

  // Handle loading states and register this player in the global registry
  useEffect(() => {
    if (!wavesurfer) return;
    
    const handleReady = () => {
      setIsLoading(false);
      setLoadError(null);
      
      // Extract waveform data for visualization
     // Extract waveform data for visualization
if (wavesurfer.getDecodedData()) {
  const decodedData = wavesurfer.getDecodedData();
  if (decodedData) { // Add this null check
    const channelData = decodedData.getChannelData(0);
    // Sample the data for visualization
    const sampleStep = Math.floor(channelData.length / 100);
    const sampledPeaks = [];
    
    for (let i = 0; i < 100; i++) {
      const start = i * sampleStep;
      const end = start + sampleStep;
      let max = 0;
      
      for (let j = start; j < end; j++) {
        const abs = Math.abs(channelData[j]);
        if (abs > max) max = abs;
      }
      
      sampledPeaks.push(max);
    }
    
    setPeaks(sampledPeaks);
  }
}
    };
    
    const handleError = (err: Error) => {
      console.error("WaveSurfer error:", err);
      setIsLoading(false);
      setLoadError("Failed to load audio. Please try again.");
    };
    
    const handleLoading = (progress: number) => {
      if (progress === 100) {
        setIsLoading(false);
      }
    };
    
    const handlePlay = () => {
      // Notify other players that this one is playing
      document.dispatchEvent(
        new CustomEvent(AUDIO_EVENTS.PLAY_STARTED, {
          detail: { id: instanceId.current }
        })
      );
    };

    // Update visualization during playback
    const handleAudioProcess = () => {
      if (!wavesurfer) return;
      const currentPosition = wavesurfer.getCurrentTime() / wavesurfer.getDuration();
      const index = Math.floor(currentPosition * peaks.length);
      setActiveIndex(index);
    };

    // Register this player in global registry
    globalAudioPlayers.set(instanceId.current, {
      pause: () => {
        if (wavesurfer && wavesurfer.isPlaying()) {
          wavesurfer.pause();
        }
      }
    });
    
    // Listen for play events from other players
    const handleOtherPlayerStarted = (event: CustomEvent) => {
      const { id: playingId } = event.detail;
      // If another player started, pause this one
      if (playingId !== instanceId.current && wavesurfer.isPlaying()) {
        wavesurfer.pause();
      }
    };
    
    wavesurfer.on('ready', handleReady);
    wavesurfer.on('error', handleError);
    wavesurfer.on('loading', handleLoading);
    wavesurfer.on('play', handlePlay);
    wavesurfer.on('audioprocess', handleAudioProcess);
    
    document.addEventListener(
      AUDIO_EVENTS.PLAY_STARTED,
      handleOtherPlayerStarted as EventListener
    );
    
    return () => {
      wavesurfer.un('ready', handleReady);
      wavesurfer.un('error', handleError);
      wavesurfer.un('loading', handleLoading);
      wavesurfer.un('play', handlePlay);
      wavesurfer.un('audioprocess', handleAudioProcess);
      
      document.removeEventListener(
        AUDIO_EVENTS.PLAY_STARTED,
        handleOtherPlayerStarted as EventListener
      );
      
      // Remove from global registry on unmount
      globalAudioPlayers.delete(instanceId.current);
    };
  }, [wavesurfer, peaks.length]);

  // Apply volume changes
  useEffect(() => {
    if (!wavesurfer) return;
    wavesurfer.setVolume(isMuted ? 0 : volume);
  }, [volume, isMuted, wavesurfer]);

  // Apply playback rate changes
  useEffect(() => {
    if (!wavesurfer) return;
    wavesurfer.setPlaybackRate(playbackRate);
  }, [playbackRate, wavesurfer]);

  // Animation effect for visual peaks
  useEffect(() => {
    if (!isPlaying) return;
    
    let animFrame: number;
    let currentIdx = activeIndex;
    
    const animatePeaks = () => {
      if (!isPlaying) return;
      
      // Move through peaks array when playing
      currentIdx = (currentIdx + 1) % peaks.length;
      setActiveIndex(currentIdx);
      
      animFrame = requestAnimationFrame(animatePeaks);
    };
    
    animFrame = requestAnimationFrame(animatePeaks);
    
    return () => {
      cancelAnimationFrame(animFrame);
    };
  }, [isPlaying, peaks.length, activeIndex]);

  const {
    hour: currentHour,
    minutes: currentMinute,
    seconde: currentSeconde,
  } = formatTime(currentTime);
  
  const {
    hour: durationHour,
    minutes: durationMinute,
    seconde: durationSeconde,
  } = formatTime(wavesurfer?.getDuration() || 0);
  
  const togglePlay = useCallback(() => {
    wavesurfer?.playPause();
  }, [wavesurfer]);
  
  const retryLoading = useCallback(() => {
    if (wavesurfer) {
      setIsLoading(true);
      setLoadError(null);
      wavesurfer.load(src);
    }
  }, [wavesurfer, src]);

  // New control handlers
  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    
    // Automatically unmute when volume is adjusted
    if (isMuted && newVolume > 0) {
      setIsMuted(false);
    }
  }, [isMuted]);

  const handlePlaybackRateChange = useCallback((rate: number) => {
    setPlaybackRate(rate);
    setShowSpeedControls(false);
  }, []);

  // Enhanced visualization component
  const Visualizer = () => (
    <div className={`flex items-end justify-center h-20 gap-1 absolute bottom-0 left-0 right-0 z-0 ${isPlaying ? 'opacity-100' : 'opacity-50'}`}>
      {peaks.map((peak, index) => {
        // Calculate distance from active index (cyclical)
        const distance = Math.min(
          Math.abs(index - activeIndex),
          Math.abs(index - activeIndex + peaks.length),
          Math.abs(index - activeIndex - peaks.length)
        );
        
        // Scale height based on peak value and distance from active index
        const height = isPlaying 
          ? Math.max(5, peak * 100 * (1 - distance / (peaks.length / 3)))
          : peak * 70;
          
        // Color gradient from active to distant bars
        const isActive = index === activeIndex;
        const color = isPlaying
          ? isActive 
            ? 'bg-yellow-400' 
            : distance < 5 
              ? 'bg-yellow-300' 
              : 'bg-gray-400'
          : index <= (currentTime / (wavesurfer?.getDuration() || 1)) * peaks.length
            ? 'bg-yellow-400'
            : 'bg-gray-400';
            
        return (
          <div
            key={index}
            className={`w-1 rounded-t transition-all duration-75 ${color}`}
            style={{ 
              height: `${Math.min(100, height)}%`,
              transform: isActive && isPlaying ? 'scaleY(1.2)' : 'scaleY(1)'
            }}
          />
        );
      })}
    </div>
  );

  return (
    <div className="flex flex-col gap-2 relative">
      <div className="flex items-center justify-between gap-6">
        <button
          onClick={togglePlay}
          className={`w-16 h-16 border-2 text-white border-white rounded-full flex items-center justify-center ${
            isPlaying ? "border-yellow-500 bg-yellow-500 bg-opacity-20" : ""
          } transition-all duration-300 hover:bg-opacity-30`}
          disabled={isLoading || !!loadError}
          data-player-id={instanceId.current}
        >
          {isLoading ? (
            <RiLoader4Line size={35} className="animate-spin" />
          ) : isPlaying ? (
            <RiPauseLine size={35} />
          ) : (
            <RiPlayLine size={35} />
          )}
        </button>
        <div className="flex-1 flex items-center justify-center relative">
          {/* Loading state */}
          {isLoading && (
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-opacity-50 z-10">
              <div className="flex flex-col items-center gap-2">
                <RiLoader4Line size={30} className="animate-spin text-gray-600" />
                <span className="text-sm text-gray-600">Loading audio...</span>
              </div>
            </div>
          )}
          
          {/* Error state */}
          {loadError && (
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-white bg-opacity-50 z-10">
              <div className="flex flex-col items-center gap-2">
                <span className="text-sm text-red-500">{loadError}</span>
                <button 
                  onClick={retryLoading}
                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* currentTime */}
          <p className="min-w-15 text-white">
            <span>{currentHour && currentHour + " :"}</span>
            <span>{currentMinute}</span> :<span>{currentSeconde}</span>
          </p>
          
          {/* timeline and visualizer */}
          <div className="flex-1 relative group">
            {/* Custom visualizer that responds to music */}
            <Visualizer />
            
            {/* Main wavesurfer component */}
            <div 
              ref={containerRef} 
              className={`${isLoading ? "opacity-50" : "opacity-100"} relative z-10 group-hover:opacity-100 ${!isPlaying ? "opacity-100" : "opacity-80"} transition-opacity duration-300`}
            ></div>
            
            {/* Custom styled seek handle */}
            <div 
              className={`absolute top-1/2 w-4 h-8 bg-yellow-400 rounded-full transform -translate-y-1/2 z-20 transition-opacity ${isPlaying ? 'opacity-100' : 'opacity-80'}`}
              style={{ 
                left: `${((currentTime / (wavesurfer?.getDuration() || 1)) * 100)}%`,
                marginLeft: "-8px", // Center the handle
                boxShadow: "0 0 8px rgba(238, 180, 64, 0.8)"
              }}
            ></div>
          </div>
          
          {type === "video" && (
            <video src={src} ref={video} hidden={true} controls />
          )}
          
          {/* durationTime */}
          <p className="min-w-15 text-white">
            <span>{durationHour && durationHour + " :"}</span>
            <span>{durationMinute}</span> :<span>{durationSeconde}</span>
          </p>
        </div>
      </div>

      {/* Controls Row */}
      <div className="flex items-center gap-4 px-4">
        {/* Volume Control */}
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleMute}
            className="p-2 text-white hover:bg-gray-600 rounded-full transition-colors"
          >
            {isMuted ? (
              <RiVolumeMuteLine size={20} />
            ) : (
              <RiVolumeUpLine size={20} />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="w-24 accent-yellow-400"
          />
        </div>

        {/* Playback Speed Control */}
        <div className="relative">
          <button 
            onClick={() => setShowSpeedControls(prev => !prev)}
            className="flex items-center gap-1 p-2 text-white hover:bg-gray-600 rounded-full transition-colors"
          >
            <RiSpeedLine size={20} />
            <span className="text-sm">{playbackRate}x</span>
          </button>
          
          {/* Speed Options Dropdown */}
          {showSpeedControls && (
            <div className="absolute bottom-full mb-2 bg-gray-800 shadow-lg rounded-md p-2 z-20">
              {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                <button
                  key={rate}
                  onClick={() => handlePlaybackRateChange(rate)}
                  className={`block w-full text-left px-3 py-1 rounded text-white ${playbackRate === rate ? 'bg-yellow-500 bg-opacity-50' : 'hover:bg-gray-700'}`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}