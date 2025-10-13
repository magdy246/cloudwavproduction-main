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
} from "@remixicon/react";
import clsx from "clsx";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { formatTime } from "../../utils/functions";
import { usePlayer } from "../../Context/PlayerContext";
import { createPortal } from "react-dom";
import { Spinner2 } from "../Spinner/Spinner";

export function MediaPlayerHome() {
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const circle = useRef<HTMLDivElement | null>(null);
  const { currentSong, setCurrentSong } = usePlayer();
  const [miniPlayer, setMiniPlayer] = useState(true);
  const container = useRef<HTMLDivElement | null>(null);
  useGSAP(
    () => {
      if (currentSong && miniPlayer) {
        gsap.to(container.current, {
          top: 0,
          ease: "circ.in",
        });
        return;
      }
      gsap.to(container.current, {
        top: "100%",
        ease: "circ.out",
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
        <div
          className="w-full h-screen fixed  top-full transition-all z-99 "
          ref={container}
        >
          {/* background */}
          <div className="absolute w-full h-full backdrop-blur-2xl" />
          <div className="w-full h-screen bg-[#362d55] opacity-70">
            <img
              src={currentSong.cover_url || currentSong.cover_path}
              className="w-full h-full object-cover"
            />
          </div>

          {/* image center */}
          <div
            className="absolute top-1/2 left-1/2 bg-green-500 -translate-x-1/2 -translate-y-1/2 w-90 h-90 rounded-full overflow-hidden z-99 transition-all"
            ref={circle}
          >
            <img
              src={currentSong.cover_url}
              className="w-full h-full object-cover"
            />
          </div>

          {/* canvas */}
          <canvas ref={canvas} className="absolute bottom-20" />
          {/* player */}
        </div>
        {createPortal(
          <div
            className={clsx(
              "fixed w-full -bottom-0 ease-in-out transition-all z-99"
            )}
          >
            <MediaPlayer
              name={currentSong.title}
              image={currentSong.cover_url}
              src={`https://api.cloudwavproduction.com/api/songs/${currentSong.id}/stream`}
              // src={music}
              canvas={canvas}
              circle={circle}
              setMiniPlayer={setMiniPlayer}
              miniPlayer={miniPlayer}
              setCurrentSong={setCurrentSong}
              currentSong={currentSong}
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
  const [target, setTarget] = useState({
    width: 0,
    offsetLeft: 0,
  });
  const dragElement = useRef<HTMLDivElement | null>(null);
  const container = useRef<HTMLDivElement | null>(null);

  const audioSource = useRef<MediaElementAudioSourceNode | null>(null);
  const audioAnalyzer = useRef<AnalyserNode | null>(null);

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

  // to loop the sound if end
  useEffect(() => {
    if (!loop) return;
    if (currentTime >= duration) {
      seekTo(0);
      togglePlay();
    }
  }, [loop, duration, currentTime]);

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
    // animation
    gsap.from(".forward-to .wrapper", {
      left: -24,
    });
    jumpTo(15);
  });

  const BackTo = contextSafe(() => {
    // animation
    gsap.from(".back-to .wrapper", {
      left: 0,
    });
    jumpTo(-15);
  });

  function seekTo(time: number) {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  }

  function jumpTo(time: number) {
    if (audioRef.current) {
      audioRef.current.currentTime += time;
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

      // Scale circle
      if (circle.current) {
        circle.current.style.scale = `${
          dataArray.reduce((a, c) => a + c, 0) / bufferLength / 118
        }`;
      }

      // Draw bars
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i];
        ctx.fillStyle = `#362d55`;
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
        color: miniPlayer ? "inherit" : "white",
      });
      setMiniPlayer((prev) => !prev);
    }
  );

  return (
    <>
      <div
        className="bg-[#362d55] h-20 flex-center py-5 text-[#aaa9bd] z-999 px-10 shadow-2xl"
        ref={container}
      >
        <div className="logo w-10 h-10 overflow-hidden rounded">
          <img src={image} className="object-cover aspect-square" />
        </div>

        {/* player */}
        <div className="flex-center gap-3 ml-5">
          <button onClick={BackTo} className="back-to">
            <span className="relative block w-6 h-6 overflow-hidden">
              <span className="wrapper flex relative -left-6">
                <span>
                  <RiSkipBackLine />
                </span>
                <span>
                  <RiSkipBackLine />
                </span>
              </span>
            </span>
          </button>

          <button onClick={togglePlay} className="relative w-6 h-6">
            {/* play */}
            {!loading ? (
              <>
                <span
                  className={clsx(
                    "block absolute inset-0 scale-0 transition-all ",
                    !isPlaying && "scale-100"
                  )}
                >
                  <RiPlayLine />
                </span>
                {/* paused */}
                <span
                  className={clsx(
                    "block absolute inset-0 scale-0 transition-all",
                    isPlaying && "scale-100"
                  )}
                >
                  <RiPauseLine />
                </span>
              </>
            ) : (
              <Spinner2 w={4} h={4} b="black" />
            )}
          </button>

          <button onClick={forwardTo} className="forward-to">
            <span className="relative block w-6 h-6 overflow-hidden">
              <span className="wrapper flex relative left-0">
                <span>
                  <RiSkipForwardLine />
                </span>
                <span>
                  <RiSkipForwardLine />
                </span>
              </span>
            </span>
          </button>
        </div>

        {/* time line */}
        <div className="time-line mx-5 flex-1 ">
          {/* name */}
          <p className="text-xs text-white">{name}</p>
          {/* line */}
          <div
            className="line relative before:z-10 w-full before:w-full before:h-[calc(100%+5px)] before:inset-0 before:absolute select-none group"
            onMouseDown={handleMouseDown}
          >
            <div className="path bg-[#6c658c] h-1 rounded-full my-2 relative group-hover:h-3 transition-all">
              <div
                style={{ width: `${(currentTime / duration) * 100}%` }}
                className={clsx(
                  "absolute bg-green-500 inset-0 rounded-full transition-all ease-out"
                )}
                ref={dragElement}
              >
                <div className="transition-all absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-green-500 border-3 border-white -right-3 group-hover:w-5 group-hover:h-5 " />
              </div>
            </div>
          </div>

          {/*  duration  */}
          <div className="flex items-center justify-between">
            {/* durationTime */}
            <p className=" text-xs">
              <span>{durationHour && durationHour + " :"}</span>
              <span>{durationMinute}</span> :<span>{durationSeconde}</span>
            </p>
            {/* currentTime */}
            <p className=" text-xs">
              <span>{currentHour && currentHour + " :"}</span>
              <span>{currentMinute}</span> :<span>{currentSeconde}</span>
            </p>
          </div>
        </div>

        {/* other action  */}

        <div className="flex-center gap-3 mt-4 flex-wrap">
          {/* repeat icon */}
          <button
            onClick={handleLoopMusic}
            className={clsx(
              "transition-colors cursor-pointer rotate-360",
              loop && "text-white"
            )}
          >
            <RiLoopRightLine size={17} />
          </button>

          {/* audio volume */}
          <button
            className={clsx(
              "flex-center cursor-pointer relative w-6 h-6 transition-colors",
              showVolumeBar && "text-white"
            )}
            onClick={handleShowVolumeBar}
          >
            <span
              className={clsx(
                "block absolute scale-0 transition-all",
                volumeLevel > 50 && "scale-100"
              )}
            >
              <RiVolumeUpLine />
            </span>
            <span
              className={clsx(
                "block absolute scale-0 transition-all",
                volumeLevel <= 50 && volumeLevel > 0 && "scale-100"
              )}
            >
              <RiVolumeDownLine />
            </span>
            <span
              className={clsx(
                "block absolute scale-0 transition-all",
                volumeLevel === 0 && "scale-100"
              )}
            >
              <RiVolumeMuteLine />
            </span>
          </button>

          {/* miniPlayer */}
          <button className="cursor-pointer" onClick={handleMiniPlayer}>
            <RiArrowDownLine />
          </button>

          {/* close player */}
          <button
            className="cursor-pointer"
            onClick={() => setCurrentSong(null)}
          >
            <RiCloseLine />
          </button>
          {/* volume Level */}
          <VolumeController
            setVolumeLevel={setVolumeLevel}
            showVolumeBar={showVolumeBar}
          />
        </div>
      </div>
      <audio
        src={src}
        ref={audioRef}
        controls={false}
        hidden={true}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        crossOrigin="anonymous"
      />
    </>
  );
}

function VolumeController({
  setVolumeLevel,
  showVolumeBar,
}: {
  setVolumeLevel: (val: number) => void;
  showVolumeBar: boolean;
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
  return (
    <div
      className={clsx(
        "w-1 rounded-full h-1 bg-[#6c658c] w-full relative before:w-full before:h-full before:absolute scale-75 opacity-0 transition-all hover:h-3 group",
        showVolumeBar && "scale-100 opacity-100"
      )}
      onMouseDown={handleMouseDown}
    >
      <div
        className="absolute h-full bottom-0 left-0 w-full bg-green-500 rounded-full "
        ref={element}
      >
        <div className="w-2 h-2 rounded-full absolute right-0 bg-green-500 top-1/2 -translate-y-1/2 border-2 border-white group-hover:w-3 group-hover:h-3 transition-all " />
      </div>
    </div>
  );
}
