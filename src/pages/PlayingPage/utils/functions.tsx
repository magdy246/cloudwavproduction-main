// utils/functions.ts

export function formatTime(seconds: number | undefined | null) {
    if (seconds === undefined || seconds === null) {
      return { hour: null, minutes: "00", seconde: "00" };
    }
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secondes = Math.floor(seconds % 60);
    
    return {
      hour: hours > 0 ? String(hours).padStart(2, "0") : null,
      minutes: String(minutes).padStart(2, "0"),
      seconde: String(secondes).padStart(2, "0"),
    };
  }