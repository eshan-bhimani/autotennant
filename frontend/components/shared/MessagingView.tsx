"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Send } from "lucide-react";
import {
  useSendMessage,
  useThread,
  useThreads,
  type ThreadOut,
} from "@/hooks/useMessages";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

function getCurrentUserId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed.id ?? null;
  } catch {
    return null;
  }
}

function timeLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const diffDays = Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString();
}

function ThreadRow({
  thread,
  active,
  onClick,
}: {
  thread: ThreadOut;
  active: boolean;
  onClick: () => void;
}) {
  const initials = thread.counterparty_name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <button
      onClick={onClick}
      className={`flex w-full items-start gap-3 border-b border-border-light p-4 text-left transition ${
        active ? "bg-primary/5" : "hover:bg-card-light/50"
      }`}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-violet-600 text-xs font-semibold text-white">
        {initials || "?"}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-semibold text-text-primary">
            {thread.counterparty_name}
          </p>
          <span className="shrink-0 text-[11px] text-text-muted">
            {timeLabel(thread.last_message_at)}
          </span>
        </div>
        {thread.property_address && (
          <p className="truncate text-[11px] text-text-muted">{thread.property_address}</p>
        )}
        <p className="mt-1 truncate text-xs text-text-secondary">
          {thread.last_message_preview ?? "No messages yet"}
        </p>
      </div>
      {thread.unread_count > 0 && (
        <span className="ml-2 shrink-0 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-white">
          {thread.unread_count}
        </span>
      )}
    </button>
  );
}

export default function MessagingView() {
  const { data: threads, isLoading } = useThreads();
  const [activeId, setActiveId] = useState<string | null>(null);
  const currentUserId = useMemo(() => getCurrentUserId(), []);
  const { data: thread } = useThread(activeId);
  const send = useSendMessage(activeId ?? "");
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Auto-select first thread on load
  useEffect(() => {
    if (!activeId && threads && threads.length > 0) {
      setActiveId(threads[0].id);
    }
  }, [threads, activeId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [thread?.messages.length]);

  const handleSend = async () => {
    const body = draft.trim();
    if (!body || !activeId) return;
    setDraft("");
    try {
      await send.mutateAsync(body);
    } catch {
      setDraft(body);
    }
  };

  if (isLoading) return <LoadingSpinner className="mt-12" />;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease }}
      className="flex h-[calc(100vh-140px)] overflow-hidden rounded-[20px] border border-border-light bg-white"
    >
      {/* Thread list */}
      <div className="flex w-[320px] shrink-0 flex-col border-r border-border-light">
        <div className="border-b border-border-light px-5 py-4">
          <h2 className="text-base font-semibold text-text-primary">Messages</h2>
          <p className="mt-0.5 text-xs text-text-muted">{threads?.length ?? 0} conversations</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {threads && threads.length > 0 ? (
            threads.map((t) => (
              <ThreadRow
                key={t.id}
                thread={t}
                active={activeId === t.id}
                onClick={() => setActiveId(t.id)}
              />
            ))
          ) : (
            <div className="p-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <p className="mt-3 text-sm font-medium text-text-primary">No conversations yet</p>
              <p className="mt-1 text-xs text-text-secondary">
                Start a conversation from a property or application.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Thread view */}
      <div className="flex flex-1 flex-col">
        {thread ? (
          <>
            <div className="flex items-center justify-between border-b border-border-light px-6 py-4">
              <div>
                <p className="text-sm font-semibold text-text-primary">{thread.counterparty_name}</p>
                {thread.property_address && (
                  <p className="text-xs text-text-muted">{thread.property_address}</p>
                )}
              </div>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                {thread.counterparty_role}
              </span>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-card-light/30 p-6">
              {thread.messages.map((m) => {
                const isMine = m.sender_user_id === currentUserId;
                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${
                        isMine
                          ? "bg-primary text-white"
                          : "border border-border-light bg-white text-text-primary"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{m.body}</p>
                      <p
                        className={`mt-1 text-[10px] ${
                          isMine ? "text-white/70" : "text-text-muted"
                        }`}
                      >
                        {new Date(m.created_at).toLocaleTimeString([], {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
              {thread.messages.length === 0 && (
                <p className="py-12 text-center text-xs text-text-muted">
                  Start the conversation below.
                </p>
              )}
            </div>

            <div className="border-t border-border-light bg-white p-4">
              <div className="flex items-end gap-2">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  rows={2}
                  placeholder="Type a message…"
                  className="flex-1 resize-none rounded-btn border border-border-light px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/15"
                />
                <button
                  onClick={handleSend}
                  disabled={!draft.trim() || send.isPending}
                  className="rounded-btn bg-primary p-3 text-white transition-transform hover:scale-[1.04] active:scale-[0.97] disabled:opacity-50"
                >
                  <Send size={16} />
                </button>
              </div>
              <p className="mt-2 text-[10px] text-text-muted">Enter to send · Shift+Enter for new line</p>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <p className="mt-4 text-base font-medium text-text-primary">Select a conversation</p>
              <p className="mt-1 text-sm text-text-secondary">
                Choose a thread on the left to view messages.
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
