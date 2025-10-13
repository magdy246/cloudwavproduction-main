import musicbg from "../../assets/img/musicbg.png";
import AnimationLink from "../../components/AnimationLink/AnimationLink";
import { CgArrowUp } from "react-icons/cg";
import ProtectRoute from "../../utils/ProtectRoute";
import { useAuth } from "../../Providers/AuthContext";
const Card = ({
  // image,
  title,
  artist,
}: {
  image: string;
  title: string;
  artist: string;
}) => (
  <div className="w-28 sm:w-32 flex-shrink-0 rounded-lg overflow-hidden shadow-sm">
    <img src={musicbg} alt={title} className="rounded-lg" />
    <div className="p-2">
      <p className="text-sm font-semibold mt-1 truncate">{title}</p>
      <p className="text-xs text-gray-600 truncate">{artist}</p>
    </div>
  </div>
);

const Section = ({
  title,
  items,
}: {
  title: string;
  items: { image: string; title: string; artist: string }[];
}) => (
  <div className="my-6">
    <h2 className="text-lg font-semibold mb-3">{title}</h2>
    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
      {items.map((item, idx) => (
        <Card key={idx} {...item} />
      ))}
    </div>
  </div>
);

const ArtistUpload = () => {
  const auth = useAuth();
  const songs = Array(6).fill({
    image: musicbg,
    title: "Shoft alayam",
    artist: "Tamer hosny",
  });

  const albums = Array(6).fill({
    image: musicbg,
    title: "Shoft alayam Album",
    artist: "Tamer hosny",
  });

  return (
    <ProtectRoute
      condition={auth?.authData?.role == "artist"}
      redirect={() => history.back()}
    >
      <div className="min-h-screen bg-gray-100 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Search */}
          <input
            type="text"
            placeholder="🔍 Amr diab"
            className="w-full p-2 rounded-md border mb-4"
          />

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start mb-6">
            {/* User Info - col-span-3 */}
            <div className="md:col-span-2 flex flex-col items-center md:items-start text-center md:text-left">
              <img
                src={musicbg}
                alt="Profile"
                className="w-35 h-35 rounded-full object-cover border-4 border-white shadow-md mb-2"
              />
              <h1 className="text-xl font-bold">Tamr hosny</h1>
              <AnimationLink to="/artist/upload/play">
                <div className="bg-[#30B797] flex text-white w-[100%] px-6 h-10 content-center items-center flex-1 font-hero text-lg font-normal rounded-2xl">
                  <CgArrowUp />
                  Upload
                </div>
              </AnimationLink>
            </div>

            {/* Filters - col-span-9 */}
            <div className="md:col-span-10 flex flex-wrap items-center gap-2 justify-center md:justify-start">
              <button className="bg-gray-400 text-white px-3 py-1 rounded-md text-sm">
                Latest Song
              </button>
              <button className="bg-gray-400 text-white px-3 py-1 rounded-md text-sm">
                Trending Song
              </button>
              <button className="bg-gray-400 text-white px-3 py-1 rounded-md text-sm">
                Trending Albums
              </button>
              {/* Sections */}
              <Section title="Latest songs" items={songs} />
              <Section title="Trending songs" items={songs} />
              <Section title="Trending Albums" items={albums} />
            </div>
          </div>
        </div>
      </div>
    </ProtectRoute>
  );
};

export default ArtistUpload;
