import React from "react";
import { FaUserCircle, FaRobot } from "react-icons/fa";

export default function ChatMessage({ role, text, sources }) {
  const isUser = role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div className="flex-shrink-0 mt-1">
        {isUser ? (
          <FaUserCircle className="w-7 h-7 text-blue-500" />
        ) : (
          <FaRobot className="w-7 h-7 text-emerald-500" />
        )}
      </div>

      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "bg-blue-600 text-white rounded-tr-sm"
            : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-tl-sm shadow-sm border border-gray-100 dark:border-gray-700"
        }`}
      >
        <p>{text}</p>
        {!isUser && sources && sources.length > 0 && (
          <p className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
            Source: Page {sources.join(", ")}
          </p>
        )}
      </div>
    </div>
  );
}
