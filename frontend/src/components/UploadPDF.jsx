import React, { useRef, useState } from "react";
import { FaCloudUploadAlt, FaFilePdf } from "react-icons/fa";
import { uploadPDF } from "../services/api";

export default function UploadPDF({ onUploaded }) {
  const inputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const handleFile = async (file) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file.");
      return;
    }
    setError("");
    setUploading(true);
    setProgress(0);
    try {
      const data = await uploadPDF(file, setProgress);
      if (data.success) {
        onUploaded?.(data);
      } else {
        setError(data.message || "Upload failed.");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Upload failed. Is the backend running?");
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
          dragActive
            ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
            : "border-gray-300 dark:border-gray-700 hover:border-blue-400"
        }`}
      >
        <FaCloudUploadAlt className="w-8 h-8 mx-auto text-blue-500 mb-2" />
        <p className="text-sm font-medium">Drag & drop a PDF here</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">or click to browse</p>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>

      {uploading && (
        <div className="mt-3">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
            <FaFilePdf className="text-red-500" /> Uploading & processing... {progress}%
          </div>
          <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  );
}
