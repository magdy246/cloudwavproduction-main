import PopularArticles from "./PopularArticles";
import PopularAlbums from "./PopularAlbums";
import PopularSong from "./PopularSong";

export default function Home() {
  return (
    <div className="pb-8"> {/* Added padding at bottom for player */}
      {/* popular article */}
      <PopularArticles />
      {/* popular Albums */}
      <PopularAlbums />
      {/* popular Song */}
      <PopularSong />
    </div>
  );
}