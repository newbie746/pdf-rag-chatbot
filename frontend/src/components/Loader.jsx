import React from "react";

export default function Loader({ label = "Thinking..." }) {
  return (
    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
      <span className="flex gap-1">
        <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
        <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
        <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
      </span>
      <span>{label}</span>
    </div>
  );
}
