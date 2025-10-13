import { HTMLElementType, createElement } from "react";
import { axiosServices } from "../axios";

export function splitText(
  text: string,
  htmlElement: HTMLElementType,
  style?: string,
  from: "letter" | "words" = "letter"
) {
  return text.split(from == "letter" ? "" : " ").map((t, i) =>
    createElement(
      htmlElement,
      {
        key: i,
        className: style,
      },
      t === " " ? "\u00A0" : t
    )
  );
}

export function getAccessToken() {
  const access = localStorage.getItem("access");
  return access;
}

export async function getNewAccessToken() {
  const res = await axiosServices.post("/RefreshToken");
  const access = res.data.accessToke;
  return access;
}
interface TFormatTime {
  minutes: string;
  seconde: string | undefined;
  hour: string;
}

export function formatTime(time: number | undefined): TFormatTime {
  let seconde: number | undefined = time;
  let minutes: number = 0;
  let hour: number = 0;
  const oneMinute: number = 60;
  const oneHour: number = 60 * 60;
  while (time) {
    if (time >= oneHour) {
      hour += 1;
      time -= oneHour;
    } else if (time >= oneMinute) {
      minutes += 1;
      time -= oneMinute;
    } else {
      seconde = time;
      break;
    }
  }
  return {
    hour: hour == 0 ? "" : Math.floor(hour).toString().padStart(2, "0"),
    minutes: Math.floor(minutes).toString().padStart(2, "0"),
    seconde: Math.floor(seconde || 0)
      .toString()
      ?.padStart(2, "0"),
  };
}

export function getImagePath(pathname: string) {
  const baseUrl = "https://api.cloudwavproduction.com/storage/";
  return baseUrl + pathname;
}
