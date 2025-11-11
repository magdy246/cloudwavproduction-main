import { useState, useRef, useEffect } from "react";
import clsx from "clsx";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

// Replace with your actual image paths
import songIcon from "../../assets/images/joinUsImage/karaokeFill.svg";
import albumIcon from "../../assets/images/joinUsImage/singingFill.png";
import { axiosServices } from "../../utils/axios";
import {
  uploadAudioToCloudinary,
  uploadImageToCloudinary,
  UploadProgress,
  clearUploadState,
} from "../../utils/cloudinaryUpload";
import { Spinner2 } from "../../components/Spinner/Spinner";

type UploadType = "song" | "album";

export default function UploadTypeSelector() {
  const [selectedType, setSelectedType] = useState<UploadType | "">("");
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    song_path: null as File | null,
    cover_path: null as File | null,
    album_cover: null as File | null,
  });

  const CLOUD_NAME = "dg0zyscka";
  const UPLOAD_PRESET = "cloudwav";

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
  };

  const handleSubmit = async () => {
    if (selectedType === "song" && !formData.song_path) {
      toast.error("Please select a song file");
      return;
    }

    try {
      setIsLoading(true);
      
      if (selectedType === "song") {
        // Upload song to Cloudinary
        setIsUploading(true);
        setUploadProgress({
          loaded: 0,
          total: formData.song_path!.size,
          percentage: 0,
          speed: 0,
          timeRemaining: 0,
          uploadedChunks: 0,
          totalChunks: 1,
        });

        abortControllerRef.current = new AbortController();

        const result = await uploadAudioToCloudinary(formData.song_path!, {
          cloudName: CLOUD_NAME,
          uploadPreset: UPLOAD_PRESET,
          folder: "cloudwav/songs",
          onProgress: (progress) => {
            setUploadProgress(progress);
          },
          signal: abortControllerRef.current.signal,
        });

        setIsUploading(false);
        setUploadProgress({
          loaded: result.bytes,
          total: result.bytes,
          percentage: 100,
          speed: 0,
          timeRemaining: 0,
          uploadedChunks: 1,
          totalChunks: 1,
        });

        // Upload cover image to Cloudinary if provided
        let coverUrl = "";
        if (formData.cover_path) {
          const coverResult = await uploadImageToCloudinary(formData.cover_path, {
            cloudName: CLOUD_NAME,
            uploadPreset: UPLOAD_PRESET,
            folder: "cloudwav/covers",
            signal: abortControllerRef.current.signal,
          });
          coverUrl = coverResult.secure_url;
        }

        // Send to backend
        const data = new FormData();
        data.append("title", formData.title);
        data.append("song_url", result.secure_url); // Cloudinary URL
        if (coverUrl) data.append("cover_url", coverUrl); // Cloudinary URL

        await axiosServices.post("/songs/upload", data, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        // Album upload (no audio file, just cover)
        const data = new FormData();
        data.append("title", formData.title);
        if (formData.album_cover)
          data.append("album_cover", formData.album_cover);

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
      setUploadProgress(null);
      setIsUploading(false);
      if (formData.song_path) {
        clearUploadState(formData.song_path);
      }
    } catch (error: any) {
      setIsUploading(false);
      setUploadProgress(null);
      if (error.message === "Upload aborted") {
        Swal.fire("Upload cancelled", "", "info");
      } else {
        toast.error(error.message || "Upload failed!");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsUploading(false);
    setUploadProgress(null);
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

              {/* Progress Bar for Song Upload */}
              {selectedType === "song" && uploadProgress && uploadProgress.percentage < 100 && (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      Uploading {uploadProgress.uploadedChunks}/{uploadProgress.totalChunks} chunks
                    </span>
                    <span className="text-sm font-bold text-purple-600">
                      {uploadProgress.percentage}%
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-300 flex items-center justify-end pr-2"
                      style={{ width: `${uploadProgress.percentage}%` }}
                    >
                      {uploadProgress.percentage > 10 && (
                        <span className="text-xs text-white font-medium">
                          {uploadProgress.percentage}%
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">Speed:</span>
                      <span className="ml-1 font-medium text-gray-700">
                        {uploadProgress.speed > 0
                          ? `${uploadProgress.speed.toFixed(2)} MB/s`
                          : "Calculating..."}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Uploaded:</span>
                      <span className="ml-1 font-medium text-gray-700">
                        {formatFileSize(uploadProgress.loaded)} / {formatFileSize(uploadProgress.total)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Time left:</span>
                      <span className="ml-1 font-medium text-gray-700">
                        {uploadProgress.timeRemaining > 0
                          ? formatTime(uploadProgress.timeRemaining)
                          : "Calculating..."}
                      </span>
                    </div>
                  </div>

                  {isUploading && (
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="mt-2 w-full py-2 text-sm text-red-600 hover:text-red-700 font-medium border border-red-300 rounded-md hover:bg-red-50 transition-colors"
                    >
                      Cancel Upload
                    </button>
                  )}
                </div>
              )}

              {/* Success State */}
              {selectedType === "song" && uploadProgress && uploadProgress.percentage === 100 && !isLoading && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center gap-2 text-green-700">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-medium">Upload complete! Saving to database...</span>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    if (isUploading && abortControllerRef.current) {
                      abortControllerRef.current.abort();
                    }
                    setShowModal(false);
                    setUploadProgress(null);
                    setIsUploading(false);
                    if (formData.song_path) {
                      clearUploadState(formData.song_path);
                    }
                  }}
                  className="px-4 py-2 bg-gray-300 rounded"
                  disabled={isLoading && !isUploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || isUploading}
                  className={clsx(
                    "px-4 py-2 bg-green-600 text-white rounded flex items-center justify-center",
                    (isLoading || isUploading) ? "opacity-70 cursor-not-allowed" : "hover:bg-green-700"
                  )}
                >
                  {isUploading ? (
                    <>
                      <Spinner2 w={4} h={4} />
                      <span className="ml-2">Uploading...</span>
                    </>
                  ) : isLoading ? (
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