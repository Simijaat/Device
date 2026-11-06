import React, { useEffect, useState } from "react";
import { apiClient } from "../services/apiClient";
import type { Message } from "../types";

export const Messages: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getMessages();
      setMessages(data);
    } catch (err: any) {
      console.error("Failed to fetch messages", err);
      setError(err.response?.data?.error || err.message || "Failed to load messages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await apiClient.deleteMessage(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to delete message.");
    }
  };

  const filtered = messages.filter((m) => {
    const matchesSearch =
      m.sender.toLowerCase().includes(search.toLowerCase()) ||
      m.content.toLowerCase().includes(search.toLowerCase());
    if (filterType === "all") return matchesSearch;
    return matchesSearch && m.type === filterType;
  });

  return (
    <div className="p-4 sm:p-8 h-full overflow-y-auto">
      <header className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between sm:items-end gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-800 to-purple-800 tracking-tight">
            Messages & SMS
          </h1>
          <p className="text-indigo-900/60 font-medium text-xs sm:text-sm mt-0.5">
            Authorized text communications synchronized from verified devices
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <input
            type="text"
            placeholder="Search messages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-white/70 border border-white/80 focus:border-indigo-400 focus:outline-none shadow-sm text-xs sm:text-sm"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-white/70 border border-white/80 text-xs sm:text-sm focus:outline-none shadow-sm font-medium"
          >
            <option value="all">All Messages</option>
            <option value="inbox">Inbox</option>
            <option value="sent">Sent</option>
          </select>
        </div>
      </header>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50/90 border border-red-200 text-red-700 text-xs sm:text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="liquid-card flex flex-col items-center justify-center p-8 sm:p-14 text-center">
          <div className="text-5xl mb-4 opacity-50">💬</div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">No Messages Available</h3>
          <p className="text-gray-500 text-xs sm:text-sm max-w-sm">
            {messages.length === 0
              ? "No SMS records have been synchronized from paired devices."
              : "No messages match your search criteria."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((msg) => (
            <div
              key={msg.id}
              className="liquid-card !p-4 sm:!p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-3 transition-all hover:bg-white/60"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-gray-900 text-sm">{msg.sender}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                      msg.type === "sent"
                        ? "bg-purple-100/70 border-purple-200 text-purple-700"
                        : "bg-blue-100/70 border-blue-200 text-blue-700"
                    }`}
                  >
                    {msg.type === "sent" ? "Sent" : "Inbox"}
                  </span>
                  <span className="text-[11px] text-gray-400 ml-auto sm:ml-2">
                    {new Date(msg.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-700 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
                  {msg.content}
                </p>
              </div>
              <div className="flex items-center sm:self-center">
                <button
                  onClick={() => handleDelete(msg.id)}
                  className="text-xs px-2.5 py-1 rounded-lg text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
