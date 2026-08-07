import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import { getDocuments, deleteDocument } from "../services/api";

export default function Home() {
  const [documents, setDocuments] = useState([]);
  const [activeDocId, setActiveDocId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const refreshDocuments = async () => {
    try {
      const data = await getDocuments();
      if (data.success) setDocuments(data.documents);
    } catch {
      // backend may not be running yet; ignore silently
    }
  };

  useEffect(() => {
    refreshDocuments();
  }, []);

  const handleUploaded = (data) => {
    setDocuments((prev) => [
      ...prev,
      { docId: data.docId, fileName: data.fileName, uploadedAt: new Date().toISOString() },
    ]);
    setActiveDocId(data.docId);
    setMessages([]);
  };

  const handleSelectDoc = (docId) => {
    setActiveDocId(docId);
    setMessages([]);
  };

  const handleDeleteDoc = async (docId) => {
    await deleteDocument(docId);
    setDocuments((prev) => prev.filter((d) => d.docId !== docId));
    if (activeDocId === docId) {
      setActiveDocId(null);
      setMessages([]);
    }
  };

  const handleDownloadChat = () => {
    const content = messages
      .map((m) => `${m.role === "user" ? "User" : "AI"}: ${m.text}`)
      .join("\n\n");
    const blob = new Blob([content || "No messages yet."], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "chat-history.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden">
      <Sidebar
        documents={documents}
        activeDocId={activeDocId}
        onSelectDoc={handleSelectDoc}
        onUploaded={handleUploaded}
        onDeleteDoc={handleDeleteDoc}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((d) => !d)}
        onDownloadChat={handleDownloadChat}
      />
      <main className="flex-1 flex flex-col min-w-0">
        <ChatWindow
          messages={messages}
          setMessages={setMessages}
          activeDocId={activeDocId}
          hasDocuments={documents.length > 0}
        />
      </main>
    </div>
  );
}
