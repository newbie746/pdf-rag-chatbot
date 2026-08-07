import React, { useEffect, useRef, useState } from "react";
import { FaPaperPlane } from "react-icons/fa";
import ChatMessage from "./ChatMessage";
import Loader from "./Loader";
import { sendChatMessage } from "../services/api";

export default function ChatWindow({ messages, setMessages, activeDocId, hasDocuments }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async () => {
    const question = input.trim();
    if (!question || loading) return;

    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setInput("");
    setLoading(true);

    try {
      const data = await sendChatMessage(question, activeDocId, messages);
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: data.answer, sources: data.sources },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text:
            err?.response?.data?.message ||
            "Something went wrong reaching the server. Is the backend running?",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 gap-2">
            <p className="text-lg font-medium">👋 Ask me anything about your PDF</p>
            <p className="text-sm">
              {hasDocuments
                ? "Type a question below to get started."
                : "Upload a PDF from the sidebar first."}
            </p>
          </div>
        )}

        {messages.map((m, i) => (
          <ChatMessage key={i} role={m.role} text={m.text} sources={m.sources} />
        ))}

        {loading && (
          <div className="pl-10">
            <Loader label="Searching document & generating answer..." />
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-gray-200 dark:border-gray-800 p-3 md:p-4">
        <div className="flex items-end gap-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 px-3 py-2">
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={hasDocuments ? "Ask a question about your document..." : "Upload a PDF to start chatting..."}
            disabled={!hasDocuments}
            className="flex-1 resize-none bg-transparent outline-none text-sm py-2 max-h-32 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSend}
            disabled={!hasDocuments || loading || !input.trim()}
            className="p-2 rounded-full bg-blue-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
          >
            <FaPaperPlane size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
