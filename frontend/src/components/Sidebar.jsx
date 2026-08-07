import React from "react";
import { FaFilePdf, FaTrash, FaMoon, FaSun, FaDownload } from "react-icons/fa";
import UploadPDF from "./UploadPDF";

export default function Sidebar({
  documents,
  activeDocId,
  onSelectDoc,
  onUploaded,
  onDeleteDoc,
  darkMode,
  onToggleDarkMode,
  onDownloadChat,
}) {
  return (
    <aside className="w-full md:w-72 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 flex flex-col gap-4 h-full overflow-y-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">📄 PDF Chat</h1>
        <button
          onClick={onToggleDarkMode}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          title="Toggle dark mode"
        >
          {darkMode ? <FaSun className="text-yellow-400" /> : <FaMoon />}
        </button>
      </div>

      <UploadPDF onUploaded={onUploaded} />

      <div className="flex-1 overflow-y-auto">
        <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Documents</p>
        <button
          onClick={() => onSelectDoc(null)}
          className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-1 ${
            !activeDocId
              ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
              : "hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          All documents
        </button>
        {documents.length === 0 && (
          <p className="text-xs text-gray-400 px-3 py-2">No PDFs uploaded yet.</p>
        )}
        {documents.map((doc) => (
          <div
            key={doc.docId}
            className={`group flex items-center justify-between px-3 py-2 rounded-lg text-sm mb-1 cursor-pointer ${
              activeDocId === doc.docId
                ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                : "hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
            onClick={() => onSelectDoc(doc.docId)}
          >
            <span className="flex items-center gap-2 truncate">
              <FaFilePdf className="text-red-500 flex-shrink-0" />
              <span className="truncate">{doc.fileName}</span>
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteDoc(doc.docId);
              }}
              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500"
              title="Delete PDF"
            >
              <FaTrash size={12} />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={onDownloadChat}
        className="flex items-center justify-center gap-2 text-sm px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <FaDownload /> Download Chat
      </button>
    </aside>
  );
}
