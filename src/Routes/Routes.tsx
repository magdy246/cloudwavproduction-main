import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Loading from "../components/Loading/Loading";
// import Dashboard from "../pages/DashboardPage";
import PlayingHome from "../pages/PlayingPage/PlayingHome/PlayingHome";
import Home from "../pages/PlayingPage/PlayingHome/Home/Home";
import TrendingSongs from "../pages/PlayingPage/PlayingHome/TrendingSongs/TrendingSongs";
import TrendingAlbums from "../pages/PlayingPage/PlayingHome/TrendingAlbums/TrendingAlbums";
import JoinUs from "../pages/JoinUs/JoinUs";
import VerifiedEmail from "../pages/auth/VerifiedEmail";
// import { useAuth } from "../Providers/AuthContext";
import MusicDistribution from "../pages/services/MusicDistribution";
import PlatformManagement from "../pages/services/PlatformManagement";
import SocialMedia from "../pages/services/SocialMedia";
import SingleOrder from "../pages/Orders/SingleOrder";
import Single from "../pages/Orders/Single";
import ArtistUpload from "../pages/artistupload/ArtistUpload";
// import UploadPlay from "../pages/artistupload/UploadPlay";
import AlbumDetails from "../pages/AlbumDetails/AblumDetails";
import ArtistDetails from "../pages/ArtistDetails/ArtistDetails";
import Policy from "../pages/PolicyPage/PolicyPage.";
import TermsOfUsePage from "../pages/TremsOfUse/TremsOfUse";
import Upload from "../pages/Upload/Upload";
import GoogleOAuthCallback from "../pages/auth/GoogleOAuthCallback";
import { MediaPlayerHome } from "../components/AudioPlayer/MediaPlayer";
import Dashboard from "../pages/Dashboard/Dashboard";
import RequestCreator from "../pages/Dashboard/RequestCreator/RequestCreator";
import RequestArtist from "../pages/Dashboard/RequestArtist/RequestArtist";
import { DashboardProvider } from "../Providers/DashboardContext";
import AccountCreation from "../pages/Dashboard/AccountCreation/AccountCreation";
import VerifySocialMedia from "../pages/Dashboard/VerifySocialMedia/VerifySocialMedia";
import RecoverSocialMedia from "../pages/Dashboard/RecoverSocialMedia/RecoverSocialMedia";
import SponsorAd from "../pages/Dashboard/SponsorAd/SponsorAd";
import PlatformManagementService from "../pages/Dashboard/PlatformManagementService/PlatformManagementService";
import ArtistSettings from "../pages/Dashboard/ArtistSettings/ArtistSettings";
import AlbumSettings from "../pages/Dashboard/AlbumSettings/AlbumSettings";
import SongSettings from "../pages/Dashboard/SongSettings/SongSettings";
import Users from "../pages/Dashboard/Users/Users";
import Messages from "../pages/Dashboard/Messages/Messages";
import CreatorSettings from "../pages/Dashboard/CreatorSettings/CreatorSettings";
import ProfileUpdate from "../pages/Dashboard/ProfileUpdate/ProfileUpdate";
import Orders from "../pages/Dashboard/Orders/Orders";
import RecentlyAdded from "../pages/PlayingPage/PlayingHome/RecentlyAdded/RecentlyAdded";
import TopSong from "../pages/PlayingPage/PlayingHome/TopSong/TopSong";
import SongDivision from "../pages/PlayingPage/PlayingHome/SongDivision/SongDivision";
import TopAlbum from "../pages/PlayingPage/PlayingHome/TopAlbum/TopAlbum";
import TopSupport from "../pages/PlayingPage/PlayingHome/TopSupport/TopSupport";
import AdminMusicDistribution from "../pages/Dashboard/AdminMusicDistribution/AdminMusicDistribution";
import AdminUploadVideo from "../pages/Dashboard/AdminUploadVideo/AdminUploadVideo";

// Lazy Load Pages
const ForgetPassword = lazy(() => import("../pages/auth/ForgetPassword"));
const Login = lazy(() => import("../pages/auth/Login"));
const SignUp = lazy(() => import("../pages/auth/SignUp"));
const LandingPage = lazy(() => import("../pages/LandingPage"));
const Pricing = lazy(() => import("../pages/Pricing/Pricing"));
const About = lazy(() => import("../pages/About/About"));
const Contact = lazy(() => import("../pages/Contact/Contact"));
const FAQs = lazy(() => import("../pages/FAQs/FAQs"));
const NotFound = lazy(() => import("../pages/NotFound/NotFound")); // 404 Page

export const routers = createBrowserRouter([
  {
    path: "/",
    element: <App />, // Layout for website routes
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<Loading />}>
            <LandingPage />
          </Suspense>
        ),
      },
      {
        path: "services/Music_distribution",
        element: (
          <Suspense fallback={<Loading />}>
            <MusicDistribution />
          </Suspense>
        ),
      },
      {
        path: "services/Platform_Management",
        element: (
          <Suspense fallback={<Loading />}>
            <PlatformManagement />
          </Suspense>
        ),
      },
      {
        path: "services/Social_media",
        element: (
          <Suspense fallback={<Loading />}>
            <SocialMedia />
          </Suspense>
        ),
      },
      {
        path: "pricing",
        element: (
          <Suspense fallback={<Loading />}>
            <Pricing />
          </Suspense>
        ),
      },
      {
        path: "about",
        element: (
          <Suspense fallback={<Loading />}>
            <About />
          </Suspense>
        ),
      },
      {
        path: "contact",
        element: (
          <Suspense fallback={<Loading />}>
            <Contact />
          </Suspense>
        ),
      },
      {
        path: "faqs",
        element: (
          <Suspense fallback={<Loading />}>
            <FAQs />
          </Suspense>
        ),
      },

      {
        path: "SingleOrder/:OrderName",
        element: (
          <Suspense fallback={<Loading />}>
            <SingleOrder />
          </Suspense>
        ),
      },
      {
        path: "orders/:OrderName",
        element: (
          <Suspense fallback={<Loading />}>
            <Single />
          </Suspense>
        ),
      },
      {
        path: "artist/upload",
        element: (
          <Suspense fallback={<Loading />}>
            <ArtistUpload />
          </Suspense>
        ),
      },
      {
        path: "artist/upload/play",
        element: (
          <Suspense fallback={<Loading />}>
            <Upload />
          </Suspense>
        ),
      },
      {
        path: "Policy",
        element: (
          <Suspense fallback={<Loading />}>
            <Policy />
          </Suspense>
        ),
      },
      {
        path: "terms-of-use",
        element: (
          <Suspense fallback={<Loading />}>
            <TermsOfUsePage />
          </Suspense>
        ),
      },
      {
        path: "join-us",
        element: <Suspense children={<JoinUs />} fallback={<Loading />} />,
      },
      {
        path: "upload",
        element: <Suspense children={<Upload />} fallback={<Loading />} />,
      },
      {
        path: "album/:id",
        element: <AlbumDetails />,
      },
      {
        path: "artist/:id",
        element: <ArtistDetails />,
      },
      {
        path: "song/:id",
        element: <AlbumDetails />,
      },
      {
        path: "*", // Catch-all route for undefined paths
        element: (
          <Suspense fallback={<Loading />}>
            <NotFound />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: "media-player",
    element: (
      <Suspense fallback={<Loading />}>
        <MediaPlayerHome />
      </Suspense>
    ),
  },
  {
    path: "/playing",
    element: <PlayingHome />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "trending-songs",
        element: <TrendingSongs />,
      },
      {
        path: "trending-albums",
        element: <TrendingAlbums />,
      },
      {
        path: "recently-added",
        element: <RecentlyAdded />,
      },
      {
        path: "top-songs",
        element: <TopSong />,
      },
      {
        path: "top-albums",
        element: <TopAlbum />,
      },
      {
        path: "top-supported",
        element: <TopSupport />,
      },
      {
        path: "division/:genre",
        element: <SongDivision />,
      },
    ],
  },
  {
    path: "/login",
    element: (
      <Suspense fallback={<Loading />}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: "/auth/google/callback",
    element: (
      <Suspense fallback={<Loading />}>
        <GoogleOAuthCallback />{" "}
      </Suspense>
    ),
  },
  {
    path: "/sign-up",
    element: (
      <Suspense fallback={<Loading />}>
        <SignUp />
      </Suspense>
    ),
  },
  {
    path: "/forget-password",
    element: (
      <Suspense fallback={<Loading />}>
        <ForgetPassword />
      </Suspense>
    ),
  },
  {
    path: "/verified-email",
    element: <Suspense children={<VerifiedEmail />} fallback={<Loading />} />,
  },
  {
    path: "dashboard",
    element: (
      <DashboardProvider>
        <Dashboard />
      </DashboardProvider>
    ),
    children: [
      {
        // index: true,
        path: "request-creator",
        element: <RequestCreator />,
      },
      {
        path: "request-artist",
        element: <RequestArtist />,
      },
      {
        path: "account-creation",
        element: <AccountCreation />,
      },
      {
        path: "verify-social-media",
        element: <VerifySocialMedia />,
      },
      {
        path: "recover-social-media",
        element: <RecoverSocialMedia />,
      },
      {
        path: "sponsor-ad",
        element: <SponsorAd />,
      },
      {
        path: "platform-management-service",
        element: <PlatformManagementService />,
      },
      {
        path: "artist-settings",
        element: <ArtistSettings />,
      },
      {
        path: "album-settings",
        element: <AlbumSettings />,
      },
      {
        path: "song-settings",
        element: <SongSettings />,
      },
      {
        path: "creator-settings",
        element: <CreatorSettings />,
      },
      {
        path: "users",
        element: <Users />,
      },
      {
        path: "messages",
        element: <Messages />,
      },
      {
        path: "profile-update",
        element: <ProfileUpdate />,
      },
      {
        path: "orders",
        element: <Orders />,
      },
      {
        path: "music-distribution",
        element: <AdminMusicDistribution />,
      },
      {
        path: "creators-video/:id",
        element: <AdminUploadVideo />,
      },
    ],
  },
]);
