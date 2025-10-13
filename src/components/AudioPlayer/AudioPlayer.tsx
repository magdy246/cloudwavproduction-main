/* eslint-disable react-hooks/exhaustive-deps */
import { RiPauseLine, RiPlayLine, RiLoader4Line } from "@remixicon/react";
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

  const { currentTime, wavesurfer, isPlaying } = useWavesurfer({
    container: containerRef,
    height: 100,
    waveColor: "#ADADAD",
    progressColor: "#EEB440",
    [type === "audio" ? "url" : "media"]:
      type === "audio" ? src : video.current,
    barGap: 16,
    barRadius: 22,
    barWidth: 4,
    cursorWidth: 2,
    dragToSeek: true,
    backend: "MediaElement",
  });

  // Handle loading states and register this player in the global registry
  useEffect(() => {
    if (!wavesurfer) return;

    const handleReady = () => {
      setIsLoading(false);
      setLoadError(null);
      wavesurfer.play();
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
          detail: { id: instanceId.current },
        })
      );
    };

    // Register this player in global registry
    globalAudioPlayers.set(instanceId.current, {
      pause: () => {
        if (wavesurfer && wavesurfer.isPlaying()) {
          wavesurfer.pause();
        }
      },
    });

    // Listen for play events from other players
    const handleOtherPlayerStarted = (event: CustomEvent) => {
      const { id: playingId } = event.detail;
      // If another player started, pause this one
      if (playingId !== instanceId.current && wavesurfer.isPlaying()) {
        wavesurfer.pause();
      }
    };

    wavesurfer.on("ready", handleReady);
    wavesurfer.on("error", handleError);
    wavesurfer.on("loading", handleLoading);
    wavesurfer.on("play", handlePlay);

    document.addEventListener(
      AUDIO_EVENTS.PLAY_STARTED,
      handleOtherPlayerStarted as EventListener
    );

    return () => {
      wavesurfer.un("ready", handleReady);
      wavesurfer.un("error", handleError);
      wavesurfer.un("loading", handleLoading);
      wavesurfer.un("play", handlePlay);

      document.removeEventListener(
        AUDIO_EVENTS.PLAY_STARTED,
        handleOtherPlayerStarted as EventListener
      );

      // Remove from global registry on unmount
      globalAudioPlayers.delete(instanceId.current);
    };
  }, [wavesurfer]);

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

  return (
    <div className="flex items-center justify-between gap-6">
      <button
        onClick={togglePlay}
        className={`w-16 h-16 border-2 rounded-full flex-center ${
          isPlaying ? "border-blue-500" : ""
        }`}
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
      <div className="flex-1 flex-center relative">
        {/* Loading state */}
        {isLoading && (
          <div className="absolute top-0 left-0 w-full h-full flex-center bg-opacity-50 z-10">
            <div className="flex flex-col items-center gap-2">
              <RiLoader4Line size={30} className="animate-spin text-gray-600" />
              <span className="text-sm text-gray-600">Loading audio...</span>
            </div>
          </div>
        )}

        {/* Error state */}
        {loadError && (
          <div className="absolute top-0 left-0 w-full h-full flex-center bg-white bg-opacity-50 z-10">
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
        <p className="min-w-15">
          <span>{currentHour && currentHour + " :"}</span>
          <span>{currentMinute}</span> :<span>{currentSeconde}</span>
        </p>

        {/* timeline */}
        <div className="flex-1 relative">
          <div
            ref={containerRef}
            className={`${isLoading ? "opacity-50" : "opacity-100"} ${
              isPlaying ? "" : ""
            }`}
          ></div>
        </div>

        {type === "video" && (
          <video src={src} ref={video} hidden={true} controls />
        )}

        {/* durationTime */}
        <p className="min-w-15">
          <span>{durationHour && durationHour + " :"}</span>
          <span>{durationMinute}</span> :<span>{durationSeconde}</span>
        </p>
      </div>
    </div>
  );
}
