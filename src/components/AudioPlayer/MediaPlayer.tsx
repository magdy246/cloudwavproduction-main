import { useEffect, useRef, useState } from "react";  
import {
  RiArrowDownLine,
  RiCloseLine,
  RiLoopRightLine,
  RiPauseLine,
  RiPlayLine,
  RiSkipBackLine,
  RiSkipForwardLine,
  RiVolumeDownLine,
  RiVolumeMuteLine,
  RiVolumeUpLine,
  RiHeartLine,
  RiHeartFill,
} from "@remixicon/react";
import clsx from "clsx";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { formatTime } from "../../utils/functions";
import { usePlayer } from "../../Context/PlayerContext";
import { createPortal } from "react-dom";
import { Spinner2 } from "../Spinner/Spinner";
import { useMutation } from "@tanstack/react-query";
import { axiosServices } from "../../utils/axios";
import { AxiosError, AxiosResponse } from "axios";
import { toast } from "react-toastify";

export function MediaPlayerHome() {
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const circle = useRef<HTMLDivElement | null>(null);
  const { currentSong, setCurrentSong, nextSong, previousSong } = usePlayer();
  const [miniPlayer, setMiniPlayer] = useState(true);
  const container = useRef<HTMLDivElement | null>(null);
  
  useGSAP(
    () => {
      if (currentSong && miniPlayer) {
        gsap.to(container.current, {
          top: 0,
          ease: "power3.out",
          duration: 0.8,
        });
        return;
      }
      gsap.to(container.current, {
        top: "100%",
        ease: "power3.in",
        duration: 0.6,
      });
    },
    { scope: container, dependencies: [currentSong, miniPlayer] }
  );

  useEffect(() => {
    if (currentSong && miniPlayer) {
      document.body.style.overflow = "hidden";
      return;
    }
    document.body.style.overflow = "visible";
  }, [currentSong, miniPlayer]);
  
  return (
    currentSong && (
      <>
        {/* Enhanced Fullscreen Background */}
        <div
          className="w-full h-screen fixed top-full transition-all z-99"
          ref={container}
        >
          {/* Simple Black Overlay */}
          <div className="absolute inset-0 bg-black/10 z-10" />
          
          {/* Background Image */}
          <div className="absolute inset-0 overflow-hidden">
            <img
              src={currentSong.cover_url || currentSong.cover_path}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Floating Particles Effect */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white/30 rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 3}s`,
                }}
              />
            ))}
          </div>

          {/* Enhanced Album Art */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              {/* Outer Glow Ring */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#5626D5] via-[#30B797] to-[#5626D5] animate-spin" 
                   style={{ animationDuration: '20s', padding: '8px' }}>
                <div className="w-full h-full rounded-full bg-black/20 backdrop-blur-sm" />
              </div>
              
              {/* Main Album Art */}
              <div
                className="relative w-80 h-80 rounded-full overflow-hidden shadow-2xl border-4 border-white/20 backdrop-blur-sm z-20"
                ref={circle}
              >
                <img
                  src={currentSong.cover_url}
                  className="w-full h-full object-cover z-30"
                />
                {/* Inner Glow */}
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/10" />
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-[#5626D5] to-[#30B797] rounded-full animate-bounce" 
                   style={{ animationDelay: '0.5s' }} />
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-r from-[#30B797] to-[#5626D5] rounded-full animate-bounce" 
                   style={{ animationDelay: '1s' }} />
            </div>
          </div>

          {/* Enhanced Canvas */}
          <canvas ref={canvas} className="absolute bottom-0 left-0 w-full h-full opacity-60" />
          
          {/* Song Info Overlay */}
          <div className="absolute top-20 left-1/2 -translate-x-1/2 text-center z-10">
            <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
              {currentSong.title}
            </h1>
            <p className="text-xl text-white/80 drop-shadow-md">
              {currentSong.artist}
            </p>
          </div>
        </div>
        
        {/* Enhanced Player Controls */}
        {createPortal(
          <div className="fixed w-full bottom-0 ease-in-out transition-all z-99">
            <MediaPlayer
              name={currentSong.title}
              image={currentSong.cover_url}
              src={currentSong.audio_url || `https://api.cloudwavproduction.com/api/songs/${currentSong.id}/stream`}
              canvas={canvas}
              circle={circle}
              setMiniPlayer={setMiniPlayer}
              miniPlayer={miniPlayer}
              setCurrentSong={setCurrentSong}
              currentSong={currentSong}
              nextSong={nextSong}
              previousSong={previousSong}
            />
          </div>,
          document.body
        )}
      </>
    )
  );
}

function MediaPlayer({
  name,
  image,
  src,
  canvas,
  circle,
  setMiniPlayer,
  miniPlayer,
  setCurrentSong,
  currentSong,
  nextSong,
  previousSong,
}: {
  name: string;
  image: string;
  src: string;
  canvas: React.RefObject<HTMLCanvasElement | null>;
  circle: React.RefObject<HTMLDivElement | null>;
  setMiniPlayer: (val: boolean | ((prev: boolean) => boolean)) => void;
  miniPlayer: boolean;
  setCurrentSong: (val: null) => void;
  currentSong: any;
  nextSong: () => void;
  previousSong: () => void;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [startDragging, setStartDragging] = useState<boolean>(false);
  const [loop, setLoop] = useState<boolean>(false);
  const [volumeLevel, setVolumeLevel] = useState<number>(100);
  const [showVolumeBar, setShowVolumeBar] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [target, setTarget] = useState({
    width: 0,
    offsetLeft: 0,
  });
  const dragElement = useRef<HTMLDivElement | null>(null);
  const container = useRef<HTMLDivElement | null>(null);

  const audioSource = useRef<MediaElementAudioSourceNode | null>(null);
  const audioAnalyzer = useRef<AnalyserNode | null>(null);

  // Like mutation
  interface TLikeResponse {
    isLiked: boolean;
    likesCount: number;
  }

  const { mutate: toggleLike, isPending: isLiking } = useMutation<
    AxiosResponse<TLikeResponse>,
    AxiosError<Error>,
    number
  >({
    mutationKey: ["toggle-like", currentSong?.id],
    mutationFn: (songId) => axiosServices.post(`/songs/${songId}/like`),
    onSuccess: (data) => {
      setIsLiked(data.data.isLiked);
      // Update likes_count and isLiked in currentSong if available
      if (currentSong) {
        (currentSong as any).likes_count = data.data.likesCount;
        (currentSong as any).isLiked = data.data.isLiked;
      }
      toast.success(
        data.data.isLiked ? "Song liked!" : "Like removed"
      );
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update like");
    },
  });

  const { contextSafe } = useGSAP({ scope: container });

  const {
    hour: currentHour,
    minutes: currentMinute,
    seconde: currentSeconde,
  } = formatTime(currentTime);

  const {
    hour: durationHour,
    minutes: durationMinute,
    seconde: durationSeconde,
  } = formatTime(duration || 0);

  // hooks
  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      e.preventDefault();
      e.stopPropagation();
      if (!startDragging) return;
      const width = target.width;
      const left = e.pageX - target.offsetLeft;
      const positionMove = left / width;
      if (dragElement.current) {
        seekTo(duration * positionMove);
      }
    }
    function handleMouseUp() {
      if (startDragging) {
        setStartDragging(false);
      }
    }

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [startDragging, duration, seekTo]);

  // Set loop attribute on audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = loop;
    }
  }, [loop]);

  // volume update
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volumeLevel / 100;
    }
  }, [volumeLevel]);

  // animation of bars
  useEffect(() => {
    if (!audioRef.current?.paused && currentSong) {
      handleAudioPlay();
    }
  }, [audioRef.current?.paused, currentSong]);

  // when src change play sound
  useEffect(() => {
    audioRef.current?.play();
    setIsPlaying(true);
  }, [src]);

  // Update isLiked state when currentSong changes
  useEffect(() => {
    if (currentSong) {
      // Initialize like state from song data if available
      // Check if currentSong has isLiked property (from API response)
      const songWithLike = currentSong as any;
      setIsLiked(songWithLike.isLiked || false);
    } else {
      setIsLiked(false);
    }
  }, [currentSong?.id]);

  // loading if move to point not load
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handleWaiting = () => setLoading(true);
    const handlePlaying = () => setLoading(false);

    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("playing", handlePlaying);

    return () => {
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("playing", handlePlaying);
    };
  }, []);

  // functions
  function togglePlay() {
    if (audioRef.current?.paused) {
      setIsPlaying(true);
      audioRef.current.play();
      return;
    }
    setIsPlaying(false);
    audioRef.current?.pause();
  }

  const forwardTo = contextSafe(() => {
    // Enhanced animation
    gsap.from(".forward-to .wrapper", {
      left: -24,
      duration: 0.3,
      ease: "power2.out"
    });
    nextSong();
  });

  const BackTo = contextSafe(() => {
    // Enhanced animation
    gsap.from(".back-to .wrapper", {
      left: 0,
      duration: 0.3,
      ease: "power2.out"
    });
    previousSong();
  });

  function seekTo(time: number) {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  }

  function handleMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    setStartDragging(true);
    const width = e.currentTarget.clientWidth;
    const offsetLeft = e.currentTarget.offsetLeft;
    setTarget({ width, offsetLeft });
  }

  const handleLoopMusic = contextSafe(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      gsap.to(e.currentTarget, {
        rotate: loop ? 360 : 0,
        duration: 0.5,
        ease: "power2.out"
      });
      setLoop((prev) => !prev);
    }
  );

  function handleShowVolumeBar() {
    setShowVolumeBar((prev) => !prev);
  }

  const handleAudioPlay = () => {
    const ctx = new AudioContext();
    if (!audioRef.current) return;

    if (!audioSource.current) {
      audioSource.current = ctx.createMediaElementSource(audioRef.current);
      audioAnalyzer.current = ctx.createAnalyser();
      audioAnalyzer.current.fftSize = 64;
      audioSource.current.connect(audioAnalyzer.current);
      audioAnalyzer.current.connect(ctx.destination);
    }

    visualizeData();
  };
  
  const visualizeData = () => {
    if (!audioAnalyzer.current || !audioRef.current || !canvas.current) return;

    const bufferLength = audioAnalyzer.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const ctx = canvas.current.getContext("2d");

    if (!ctx) return;

    canvas.current.width = window.innerWidth;
    canvas.current.height = window.innerHeight;

    let animationId: number;

    const draw = () => {
      if (!audioAnalyzer.current || !canvas.current || !ctx) return;

      animationId = requestAnimationFrame(draw);

      if (audioRef.current?.paused) {
        cancelAnimationFrame(animationId);
        return;
      }

      audioAnalyzer.current.getByteFrequencyData(dataArray);
      ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);

      let x = 0;
      const barWidth = canvas.current.width / bufferLength;

      // Enhanced circle scaling with smooth animation
      if (circle.current) {
        const scale = 1 + (dataArray.reduce((a, c) => a + c, 0) / bufferLength / 200);
        circle.current.style.transform = `scale(${scale})`;
      }

      // Enhanced bars with custom gradient colors
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i];
        const gradient = ctx.createLinearGradient(0, canvas.current.height - barHeight, 0, canvas.current.height);
        
        // Create gradient from #5626D5 to #30B797
        const progress = i / bufferLength;
        const r1 = parseInt('#5626D5'.slice(1, 3), 16);
        const g1 = parseInt('#5626D5'.slice(3, 5), 16);
        const b1 = parseInt('#5626D5'.slice(5, 7), 16);
        
        const r2 = parseInt('#30B797'.slice(1, 3), 16);
        const g2 = parseInt('#30B797'.slice(3, 5), 16);
        const b2 = parseInt('#30B797'.slice(5, 7), 16);
        
        const r = Math.round(r1 + (r2 - r1) * progress);
        const g = Math.round(g1 + (g2 - g1) * progress);
        const b = Math.round(b1 + (b2 - b1) * progress);
        
        gradient.addColorStop(0, `rgb(${r}, ${g}, ${b})`);
        gradient.addColorStop(1, `rgb(${Math.round(r * 0.7)}, ${Math.round(g * 0.7)}, ${Math.round(b * 0.7)})`);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.current.height - barHeight, barWidth, barHeight);
        x += barWidth + 2;
      }
    };

    draw();

    return () => cancelAnimationFrame(animationId);
  };

  const handleMiniPlayer = contextSafe(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      gsap.to(e.currentTarget, {
        rotate: miniPlayer ? 180 : 0,
        duration: 0.5,
        ease: "power2.out"
      });
      setMiniPlayer((prev) => !prev);
    }
  );

  const handleLike = contextSafe((e: React.MouseEvent<HTMLButtonElement>) => {
    if (!currentSong?.id) return;
    
    gsap.to(e.currentTarget, {
      scale: 1.2,
      duration: 0.2,
      yoyo: true,
      repeat: 1,
      ease: "power2.out"
    });
    
    // Call the API to toggle like
    toggleLike(currentSong.id);
  });

  return (
    <>
      {/* Enhanced Player Container */}
      <div
        className="bg-gradient-to-r from-[#5626D5]/95 via-[#30B797]/95 to-[#5626D5]/95 backdrop-blur-xl h-28 flex items-center text-white z-999 px-4 md:px-8 shadow-2xl border-t border-white/10"
        ref={container}
      >
        {/* Left Section: Album Art & Song Info */}
        <div className="flex items-center gap-3 min-w-0 flex-shrink-0">
          {/* Album Art */}
          <div className="relative w-16 h-16 overflow-hidden rounded-xl shadow-lg border-2 border-white/20 flex-shrink-0">
            <img src={image} className="w-full h-full object-cover" alt={name} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>

          {/* Song Info */}
          <div className="min-w-0 flex-1 hidden sm:block">
            <h3 className="text-sm font-semibold text-white truncate">{name}</h3>
            <p className="text-xs text-white/70 truncate">{currentSong?.artist || 'Unknown Artist'}</p>
          </div>
        </div>

        {/* Center Section: Player Controls */}
        <div className="flex items-center justify-center gap-3 mx-4 flex-shrink-0">
          {/* Previous Button */}
          <button 
            onClick={BackTo} 
            className="back-to group relative w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 hover:scale-110 active:scale-95"
            aria-label="Previous song"
          >
            <span className="relative block w-5 h-5 overflow-hidden">
              <span className="wrapper flex relative -left-5">
                <span className="text-white/80 group-hover:text-white transition-colors">
                  <RiSkipBackLine size={18} />
                </span>
                <span className="text-white/80 group-hover:text-white transition-colors">
                  <RiSkipBackLine size={18} />
                </span>
              </span>
            </span>
          </button>

          {/* Play/Pause Button */}
          <button 
            onClick={togglePlay} 
            className="relative w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-r from-[#5626D5] to-[#30B797] hover:from-[#4A1FB8] hover:to-[#2A9B7F] transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg hover:shadow-xl"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {!loading ? (
              <>
                <span
                  className={clsx(
                    "absolute inset-0 scale-0 transition-all duration-300 flex items-center justify-center",
                    !isPlaying && "scale-100"
                  )}
                >
                  <RiPlayLine className="text-white text-xl ml-0.5" />
                </span>
                <span
                  className={clsx(
                    "absolute inset-0 scale-0 transition-all duration-300 flex items-center justify-center",
                    isPlaying && "scale-100"
                  )}
                >
                  <RiPauseLine className="text-white text-xl" />
                </span>
              </>
            ) : (
              <Spinner2 w={6} h={6} b="white" />
            )}
          </button>

          {/* Next Button */}
          <button 
            onClick={forwardTo} 
            className="forward-to group relative w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 hover:scale-110 active:scale-95"
            aria-label="Next song"
          >
            <span className="relative block w-5 h-5 overflow-hidden">
              <span className="wrapper flex relative left-0">
                <span className="text-white/80 group-hover:text-white transition-colors">
                  <RiSkipForwardLine size={18} />
                </span>
                <span className="text-white/80 group-hover:text-white transition-colors">
                  <RiSkipForwardLine size={18} />
                </span>
              </span>
            </span>
          </button>
        </div>

        {/* Progress Bar Section */}
        <div className="flex-1 mx-4 md:mx-6 min-w-0 hidden md:block">
          {/* Progress Line */}
          <div
            className="line relative before:z-10 w-full before:w-full before:h-[calc(100%+8px)] before:inset-0 before:absolute select-none group cursor-pointer"
            onMouseDown={handleMouseDown}
          >
            <div className="path bg-white/20 h-1.5 rounded-full my-2 relative group-hover:h-2 transition-all duration-300">
              <div
                style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                className="absolute bg-gradient-to-r from-[#5626D5] to-[#30B797] inset-0 rounded-full transition-all ease-out shadow-sm"
                ref={dragElement}
              >
                <div className="transition-all absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-[#5626D5] -right-3 group-hover:w-4 group-hover:h-4 shadow-lg" />
              </div>
            </div>
          </div>

          {/* Time Display */}
          <div className="flex items-center justify-between text-xs text-white/70 mt-1">
            <span className="font-mono">
              {currentHour && currentHour + ":"}
              {currentMinute}:{currentSeconde || "00"}
            </span>
            <span className="font-mono">
              {durationHour && durationHour + ":"}
              {durationMinute}:{durationSeconde || "00"}
            </span>
          </div>
        </div>

        {/* Right Section: Action Buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Like Button */}
          <button
            onClick={handleLike}
            disabled={isLiking || !currentSong?.id}
            className={clsx(
              "w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300 hover:scale-110 active:scale-95",
              isLiked 
                ? "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg" 
                : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white",
              (isLiking || !currentSong?.id) && "opacity-50 cursor-not-allowed"
            )}
            aria-label={isLiked ? "Unlike" : "Like"}
          >
            {isLiking ? (
              <Spinner2 w={4} h={4} b="white" />
            ) : isLiked ? (
              <RiHeartFill size={18} />
            ) : (
              <RiHeartLine size={18} />
            )}
          </button>

          {/* Loop Button */}
          <button
            onClick={handleLoopMusic}
            className={clsx(
              "w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300 hover:scale-110 active:scale-95 relative",
              loop 
                ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg" 
                : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
            )}
            aria-label={loop ? "Disable repeat" : "Enable repeat"}
            title={loop ? "Repeat: On" : "Repeat: Off"}
          >
            <RiLoopRightLine size={18} className={loop ? "opacity-100" : "opacity-70"} />
            {loop && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-pulse" />
            )}
          </button>

          {/* Volume Button with Controller */}
          <div className="flex items-center gap-2">
            <button
              className={clsx(
                "w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300 hover:scale-110 active:scale-95 relative",
                showVolumeBar 
                  ? "bg-gradient-to-r from-[#5626D5] to-[#30B797] text-white shadow-lg" 
                  : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
              )}
              onClick={handleShowVolumeBar}
              aria-label="Volume control"
            >
              <span
                className={clsx(
                  "block absolute scale-0 transition-all duration-300",
                  volumeLevel > 50 && "scale-100"
                )}
              >
                <RiVolumeUpLine size={18} />
              </span>
              <span
                className={clsx(
                  "block absolute scale-0 transition-all duration-300",
                  volumeLevel <= 50 && volumeLevel > 0 && "scale-100"
                )}
              >
                <RiVolumeDownLine size={18} />
              </span>
              <span
                className={clsx(
                  "block absolute scale-0 transition-all duration-300",
                  volumeLevel === 0 && "scale-100"
                )}
              >
                <RiVolumeMuteLine size={18} />
              </span>
            </button>
            <VolumeController
              setVolumeLevel={setVolumeLevel}
              showVolumeBar={showVolumeBar}
              volumeLevel={volumeLevel}
            />
          </div>

          {/* Mini Player Toggle */}
          <button 
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-all duration-300 hover:scale-110 active:scale-95" 
            onClick={handleMiniPlayer}
            aria-label="Toggle mini player"
          >
            <RiArrowDownLine size={18} />
          </button>

          {/* Close Player */}
          <button
            className="w-9 h-9 flex items-center justify-center rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-300 transition-all duration-300 hover:scale-110 active:scale-95"
            onClick={() => setCurrentSong(null)}
            aria-label="Close player"
          >
            <RiCloseLine size={18} />
          </button>
        </div>
      </div>
      
      <audio
        src={src}
        ref={audioRef}
        controls={false}
        hidden={true}
        loop={loop}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onEnded={() => {
          if (!loop) {
            nextSong();
          }
        }}
        crossOrigin="anonymous"
      />
    </>
  );
}

function VolumeController({
  setVolumeLevel,
  showVolumeBar,
  volumeLevel,
}: {
  setVolumeLevel: (val: number) => void;
  showVolumeBar: boolean;
  volumeLevel: number;
}) {
  const [dragging, setDragging] = useState<boolean>(false);
  const [target, setTarget] = useState({
    width: 0,
    offsetLeft: 0,
  });
  const element = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (!dragging) return;
      const left = e.pageX - target.offsetLeft;
      const movement = (left / target.width) * 100;
      if (element.current) {
        if (movement > 100 || movement < 0) return;
        setVolumeLevel(movement);
        element.current.style.width = `${movement}%`;
      }
    }
    function handleMouseUp() {
      if (dragging) {
        setDragging(false);
      }
    }
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, target]);

  function handleMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    setTarget({
      width: e.currentTarget.clientWidth,
      offsetLeft: e.currentTarget.offsetLeft,
    });
    setDragging(true);
  }
  
  useEffect(() => {
    if (element.current) {
      element.current.style.width = `${volumeLevel}%`;
    }
  }, [volumeLevel, showVolumeBar]);

  return (
    <div
      className={clsx(
        "w-20 h-1.5 rounded-full bg-white/20 relative transition-all duration-300 group cursor-pointer",
        showVolumeBar && "opacity-100 scale-100",
        !showVolumeBar && "opacity-0 scale-75 pointer-events-none w-0"
      )}
      onMouseDown={handleMouseDown}
    >
      <div
        className="absolute h-full bottom-0 left-0 bg-gradient-to-r from-[#5626D5] to-[#30B797] rounded-full transition-all duration-200"
        ref={element}
        style={{ width: `${volumeLevel}%` }}
      >
        <div className="w-3 h-3 rounded-full absolute right-0 bg-white top-1/2 -translate-y-1/2 border-2 border-[#5626D5] group-hover:w-4 group-hover:h-4 transition-all duration-200 shadow-lg" />
      </div>
    </div>
  );
}