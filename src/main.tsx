import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./i18n"; // Import the i18n configuration

import "slick-carousel/slick/slick.css"; // for carousel
import "slick-carousel/slick/slick-theme.css"; // for carousel
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { routers } from "./Routes/Routes.tsx";
import AuthProvider from "./Providers/AuthContext.tsx";
import { PlayerProvider } from "./Context/PlayerContext.tsx";
// import BottomPlayer from "./components/BottomPlayer/BottomPlayer.tsx";
import { MediaPlayerHome } from "./components/AudioPlayer/MediaPlayer.tsx";
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 0,
      gcTime: 0,
      retry: false,
      refetchOnMount: true,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PlayerProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={routers} />
          {/* <BottomPlayer /> */}
          <MediaPlayerHome/>
        </AuthProvider>
      </QueryClientProvider>
    </PlayerProvider>
  </StrictMode>
);
