import { useState } from "react";
import clsx from "clsx";
import { toast } from "react-toastify";

// Replace with your actual image paths
import songIcon from "../../assets/images/joinUsImage/karaokeFill.svg";
import albumIcon from "../../assets/images/joinUsImage/singingFill.png";
import { axiosServices } from "../../utils/axios";

type UploadType = "song" | "album";

export default function UploadTypeSelector() {
  const [selectedType, setSelectedType] = useState<UploadType | "">("");
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    song_path: null as File | null,
    cover_path: null as File | null,
    album_cover: null as File | null,
  });

  const handleSubmit = async () => {
    setIsLoading(true);
    const data = new FormData();
    data.append("title", formData.title);
    
    if (selectedType === "song") {
      if (formData.song_path) data.append("song_path", formData.song_path);
      if (formData.cover_path) data.append("cover_path", formData.cover_path);
    } else {
      if (formData.album_cover)
        data.append("album_cover", formData.album_cover);
    }

    try {
      if (selectedType === "song") {
        await axiosServices.post("/songs/upload", data, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        console.log("data", data);
      } else {
        await axiosServices.post("/albums", data, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }
      toast.success("Uploaded successfully!");
      setShowModal(false);
      setFormData({
        title: "",
        song_path: null,
        cover_path: null,
        album_cover: null,
      });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Upload failed!");
    } finally {
      setIsLoading(false);
    }
  };

  const options = [
    {
      label: "Upload Song",
      value: "song",
      icon: songIcon,
    },
    {
      label: "Upload Album",
      value: "album",
      icon: albumIcon,
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4 py-10">
      
      <h2 className="text-2xl md:text-3xl font-bold mb-10 text-center">
        Please select your upload type
      </h2>

      <div className="flex flex-col md:flex-row gap-6 mb-12">
        {options.map((option) => {
          const isActive = selectedType === option.value;
          return (
            <label
              key={option.value}
              onClick={() => setSelectedType(option.value as UploadType)}
              className={clsx(
                "w-72 cursor-pointer p-6 rounded-2xl border transition-all duration-300 flex flex-col items-center text-center shadow-md",
                isActive
                  ? "border-green-500 bg-green-50"
                  : "border-gray-300 bg-white hover:shadow-lg"
              )}
            >
              <img
                src={option.icon}
                alt={option.label}
                className="w-20 h-20 object-contain mb-4"
              />
              <p className="font-semibold text-lg mb-4">{option.label}</p>
              <div
                className={clsx(
                  "w-5 h-5 rounded-full border-2",
                  isActive ? "bg-green-500 border-green-500" : "border-gray-400"
                )}
              />
            </label>
          );
        })}
      </div>

      <button
        onClick={() => selectedType && setShowModal(true)}
        disabled={!selectedType}
        className={clsx(
          "h-12 w-48 rounded-full font-semibold text-white text-lg transition-all",
          selectedType
            ? "bg-green-600 hover:bg-green-700"
            : "bg-gray-400 cursor-not-allowed"
        )}
      >
        Next
      </button>

      {showModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/25 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">
              {selectedType === "song" ? "Upload Song" : "Upload Album"}
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              {selectedType === "song" ? (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Song (MP3)
                    </label>
                    <input
                      type="file"
                      accept="audio/mp3"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          song_path: e.target.files?.[0] || null,
                        })
                      }
                      className="w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Cover Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cover_path: e.target.files?.[0] || null,
                        })
                      }
                      className="w-full"
                      required
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Album Cover
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        album_cover: e.target.files?.[0] || null,
                      })
                    }
                    className="w-full"
                    required
                  />
                </div>
              )}
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={clsx(
                    "px-4 py-2 bg-green-600 text-white rounded flex items-center justify-center",
                    isLoading ? "opacity-70 cursor-not-allowed" : "hover:bg-green-700"
                  )}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}