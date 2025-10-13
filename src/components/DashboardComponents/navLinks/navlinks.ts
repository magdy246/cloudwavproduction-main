  import {
  RiAdvertisementLine,
  RiAlbumLine,
  RiDeviceRecoverLine,
  RiMessageLine,
  RiMusic2Line,
  RiNeteaseCloudMusicLine,
  RiOrderPlayLine,
  RiProfileLine,
  RiServiceLine,
  RiSettingsLine,
  RiStarSLine,
  RiUser2Line,
  RiUser3Line,
  RiUser4Line,
  RiUser5Line,
  RiUserLine,
  RiVerifiedBadgeLine,
  RiVideoChatLine,
} from "@remixicon/react";
// import { RiVideoAddLine } from "react-icons/ri";

function generateId() {
  let id = 0;
  return function () {
    return id++;
  };
}

const getId = generateId();

export const navLinks = [
  {
    id: getId(),
    title: "dashboard.navLinks.videoCreator",
    Icon: RiVideoChatLine,
    children: [
      {
        id: getId(),
        title: "dashboard.navLinks.requestACreator",
        href: "request-creator",
        Icon: RiUser2Line,
      },
      {
        id: getId(),
        title: "dashboard.navLinks.requestAArtist",
        href: "request-artist",
        Icon: RiUser5Line,
      },
    ],
  },
  {
    id: getId(),
    title: "dashboard.navLinks.services",
    Icon: RiServiceLine,
    children: [
      {
        id: getId(),
        title: "dashboard.navLinks.musicDistribution",
        href: "music-distribution",
        Icon: RiNeteaseCloudMusicLine,
      },
      {
        id: getId(),
        title: "dashboard.navLinks.accountCreation",
        href: "account-creation",
        Icon: RiUser3Line,
      },
      {
        id: getId(),
        title: "dashboard.navLinks.verifySocialMediaAccounts",
        href: "verify-social-media",
        Icon: RiVerifiedBadgeLine,
      },
      {
        id: getId(),
        title: "dashboard.navLinks.recoverSocialMediaAccount",
        href: "recover-social-media",
        Icon: RiDeviceRecoverLine,
      },
      {
        id: getId(),
        title: "dashboard.navLinks.SponsoredAds",
        href: "sponsor-ad",
        Icon: RiAdvertisementLine,
      },
      {
        id: getId(),
        title: "dashboard.navLinks.platformManagement",
        href: "platform-management-service",
        Icon: RiStarSLine,
      },
      {
        id: getId(),
        title: "dashboard.navLinks.orders",
        href: "orders",
        Icon: RiOrderPlayLine,
      },
    ],
  },
  {
    id: getId(),
    title: "dashboard.navLinks.settings",
    Icon: RiSettingsLine,
    children: [
      {
        id: getId(),
        title: "dashboard.navLinks.artistSettings",
        href: "artist-settings",
        Icon: RiUserLine,
      },
      {
        id: getId(),
        title: "dashboard.navLinks.creatorSettings",
        href: "creator-settings",
        Icon: RiUser2Line,
      },
      {
        id: getId(),
        title: "dashboard.navLinks.albumSettings",
        href: "album-settings",
        Icon: RiAlbumLine,
      },
      {
        id: getId(),
        title: "dashboard.navLinks.songSettings",
        href: "song-settings",
        Icon: RiMusic2Line,
      },
      // {
      //   id: getId(),
      //   title: "dashboard.navLinks.uploadVideo",
      //   href: "admin-upload-video",
      //   Icon: RiVideoAddLine,
      // },
      {
        id: getId(),
        title: "dashboard.navLinks.users",
        href: "users",
        Icon: RiUser4Line,
      },
      {
        id: getId(),
        title: "dashboard.navLinks.messages",
        href: "messages",
        Icon: RiMessageLine,
      },
      {
        id: getId(),
        title: "dashboard.navLinks.profile-update",
        href: "profile-update",
        Icon: RiProfileLine,
      },
    ],
  },
];
