/* eslint-disable @typescript-eslint/no-explicit-any */
// import musicbg from "../../assets/img/musicbg.png";
import AnimationLink from "../../components/AnimationLink/AnimationLink";
// import { CgArrowUp } from "react-icons/cg";
// import ProtectRoute from "../../utils/ProtectRoute";
// import { useAuth } from "../../Providers/AuthContext";
import { useMutation, useQuery } from "@tanstack/react-query";
import SimpleSlider from "../../components/SimpleSlider/SimpleSlider";
import { ReactNode, useRef } from "react";
import { axiosServices } from "../../utils/axios";
import { useParams } from "react-router-dom";
import { ImageComponent } from "../../components/ImageComponent/ImageComponent";
import {
  RiAlbumLine,
  RiDeleteBinLine,
  RiImageLine,
  RiLoader2Line,
  RiMusic2Line,
  RiUserLine,
} from "@remixicon/react";
// import { getImagePath } from "../../utils/functions";
import SectionLoading from "../../components/SectionLoading/SectionLoading";
import clsx from "clsx";
import { useAuth } from "../../Providers/AuthContext";
import { CgArrowUp } from "react-icons/cg";
import { usePlayer } from "../../Context/PlayerContext";
import { AxiosError } from "axios";
import NoResultFound from "../../components/NoResultFound/NoResultFound";
import Swal from "sweetalert2";

const Section = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => {
  const nextButton = useRef<HTMLButtonElement | null>(null);
  const prevButton = useRef<HTMLButtonElement | null>(null);
  return (
    <div className="my-6 overflow-hidden">
      <h2 className="text-2xl font-semibold mb-3 text-center capitalize">
        {title}
      </h2>
      <button ref={nextButton}></button>
      <button ref={prevButton}></button>
      <div className="overflow-hidden">
        <SimpleSlider
          nextButton={nextButton.current}
          perviousButton={prevButton.current}
        >
          {children}
        </SimpleSlider>
      </div>
    </div>
  );
};

const ArtistDetails = () => {
  const { id } = useParams();
  const auth = useAuth();
  const { setCurrentSong } = usePlayer();

  const {
    data: artist = [],
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["artist", id],
    queryFn: () => axiosServices.get("/Artists/" + id),
    select: (data) => data?.data,
  });

  const { mutate: deleteSong, isPending: isDeleting } = useMutation<
    any,
    AxiosError<{ error: string }>,
    number
  >({
    mutationFn: (id) => axiosServices.delete("/songs-delete/" + id),
    onSuccess: () => {
      Swal.fire("Song deleted successfully", "", "success");

      refetch();
    },
    onError: (error) => {
      Swal.fire(error.response?.data.error, "", "error");
    },
  });

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-10 flex-col md:flex-row">
          {/* User Info - col-span-3 */}
          <div className="md:col-span-2  md:items-start text-center md:text-left">
            <ImageComponent
              path={artist?.profile_image}
              fallback={
                <div className="w-45 h-45 rounded-full flex-center bg-gray-200">
                  <RiUserLine size={50} />
                </div>
              }
            >
              <img
                src={artist?.profile_image}
                alt="Profile"
                className="w-35 h-35 rounded-full object-cover border-4 border-white shadow-md mb-2 object-top"
              />
            </ImageComponent>
            <h4 className="text-xl font-bold text-center mt-4 capitalize">
              {artist?.name}
            </h4>
            {auth.authData?.artist_id == +id! && (
              <AnimationLink to="/artist/upload/play">
                <div className="bg-[#30B797] flex text-white w-[100%] px-6 h-10 content-center items-center flex-1 font-hero text-lg font-normal rounded-2xl">
                  <CgArrowUp />
                  Upload
                </div>
              </AnimationLink>
            )}
          </div>

          {/* Filters - col-span-9 */}
          <div className="flex-1 overflow-hidden">
            {/* Sections */}
            <Section title="All Songs">
              {isFetching ? (
                Array(8)
                  .fill(0)
                  .map(() => (
                    <div>
                      <SectionLoading className="w-40 h-40 rounded" />
                      <SectionLoading className="w-40 h-7 mt-3 rounded" />
                    </div>
                  ))
              ) : artist.songs?.length == 0 ? (
                <NoResultFound>
                  <RiMusic2Line size={50} />
                </NoResultFound>
              ) : (
                artist.songs?.map((song: any) => (
                  <div className="relative">
                    <div
                      role="button"
                      key={song.id}
                      className="shrink-0 pl-2 cursor-pointer relative z-0 "
                      onClick={() => setCurrentSong(song)}
                    >
                      <div className="w-full h-40 rounded overflow-hidden  flex-center">
                        <ImageComponent
                          path={song.cover_path}
                          fallback={
                            <div className="bg-gray-200 w-full h-full flex-center">
                              <RiImageLine size={50} />
                            </div>
                          }
                        >
                          <img
                            src={song.cover_path}
                            alt={song.title + "image"}
                            className="min-w-full min-h-full object-cover"
                          />
                        </ImageComponent>
                      </div>
                      <h6
                        className={clsx(
                          "text-2xl font-semibold capitalize mt-2 text-left"
                        )}
                      >
                        {song.title}
                      </h6>
                      <p className="font-normal text-start text-[18px]">
                        {artist.name}
                      </p>
                    </div>
                    {String(auth.authData?.artist_id) == String(id)! && (
                      <button
                        onClick={() => deleteSong(song.id)}
                        className="cursor-pointer hover:animate-pulse absolute top-2 right-2 z-10 bg-white rounded-full p-2"
                      >
                        {isDeleting ? (
                          <RiLoader2Line className="animate-spin text-blue-500" />
                        ) : (
                          <RiDeleteBinLine className="text-red-500 " />
                        )}
                      </button>
                    )}
                  </div>
                ))
              )}
            </Section>
            {/* <Section title="All Albums" items={albums} /> */}
            <Section title="All Albums">
              {isFetching ? (
                Array(8)
                  .fill(0)
                  .map(() => (
                    <div>
                      <SectionLoading className="w-40 h-40 rounded" />
                      <SectionLoading className="w-40 h-7 mt-3 rounded" />
                    </div>
                  ))
              ) : artist.albums?.length == 0 ? (
                <NoResultFound>
                  <RiAlbumLine size={50} />
                </NoResultFound>
              ) : (
                artist.albums?.map((song: any) => (
                  <AnimationLink
                    to={`/album/${song.id}`}
                    key={song.id}
                    className="shrink-0 pl-2 cursor-pointer"
                  >
                    <div className="w-full h-40 rounded overflow-hidden  flex-center">
                      <ImageComponent
                        path={song.album_cover}
                        fallback={
                          <div className="bg-gray-200 w-full h-full flex-center">
                            <RiImageLine size={50} />
                          </div>
                        }
                      >
                        <img
                          src={song.album_cover}
                          alt={song.title + "image"}
                          className="min-w-full min-h-full object-cover"
                        />
                      </ImageComponent>
                    </div>
                    <h6
                      className={clsx(
                        "text-2xl font-semibold capitalize mt-2 max-w-30 text-left min-h-16"
                      )}
                    >
                      {song.title}
                    </h6>
                    <p className="font-normal text-[18px]">{artist.name}</p>
                  </AnimationLink>
                ))
              )}
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistDetails;
