import React, { useEffect, useState } from "react";
import { Send, Trash2, Search } from "lucide-react";
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
    <div className="py-2 sm:py-4">
      <header className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between sm:items-end gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Messages &amp; SMS
          </h1>
          <p className="text-slate-700 font-semibold text-xs sm:text-sm mt-0.5">
            Authorized text communications synchronized from verified Android devices
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-700 absolute left-3.5 top-1/2 -translate-y-1/2 stroke-[2.3] z-10 pointer-events-none" />
            <input
              type="text"
              placeholder="Search messages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-full liquid-glass-input text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-500 focus:outline-none"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 rounded-full liquid-glass-input text-xs sm:text-sm font-bold text-slate-900 focus:outline-none"
          >
            <option value="all">All Messages</option>
            <option value="inbox">Inbox</option>
            <option value="sent">Sent</option>
          </select>
        </div>
      </header>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-red-500/15 border border-red-400/60 text-red-950 font-bold text-xs sm:text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-white/60 border-t-slate-900 rounded-full animate-spin"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="liquid-card flex flex-col items-center justify-center p-10 sm:p-14 text-center">
          <div className="w-16 h-16 rounded-full liquid-glass-droplet flex items-center justify-center mb-4">
            <Send className="w-7 h-7 text-slate-900 stroke-[2.2]" />
          </div>
          <h3 className="text-lg font-black text-slate-950 mb-1">No Messages Available</h3>
          <p className="text-slate-700 font-medium text-xs sm:text-sm max-w-sm">
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
              className="liquid-card !p-4 sm:!p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-3"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-black text-slate-950 text-sm">{msg.sender}</span>
                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-extrabold border ${
                      msg.type === "sent"
                        ? "bg-purple-500/20 border-purple-400/60 text-purple-950"
                        : "bg-sky-500/20 border-sky-400/60 text-sky-950"
                    }`}
                  >
                    {msg.type === "sent" ? "Sent" : "Inbox"}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-600 ml-auto sm:ml-2">
                    {new Date(msg.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-slate-800 font-medium text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
                  {msg.content}
                </p>
              </div>
              <div className="flex items-center sm:self-center">
                <button
                  onClick={() => handleDelete(msg.id)}
                  className="text-xs px-3 py-1.5 rounded-full text-red-800 bg-red-500/15 hover:bg-red-500/25 border border-red-400/50 font-extrabold inline-flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
