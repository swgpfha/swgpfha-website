import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, MessageSquare } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Message } from "../_types";

export default function MessageDetailDialog({
  message,
  open,
  onClose,
  onReplied,
}: {
  message: Message | null;
  open: boolean;
  onClose: () => void;
  onReplied: (msgId: string) => Promise<void> | void;
}) {
  const [reply, setReply] = useState("");

  // Reset composer when switching messages
  useEffect(() => {
    if (open) setReply("");
  }, [open, message?.id]);

  const variant =
    message?.status === "NEW"
      ? "destructive"
      : message?.status === "READ"
      ? "secondary"
      : message?.status === "REPLIED"
      ? "default"
      : "outline";

  const initials = useMemo(() => {
    if (!message) return "??";
    const f = (message.firstName || "").trim();
    const l = (message.lastName || "").trim();
    const fromEmail = (message.email || "").split("@")[0];
    if (!f && !l && fromEmail) return fromEmail.slice(0, 2).toUpperCase();
    return `${f?.[0] ?? ""}${l?.[0] ?? ""}`.toUpperCase() || "??";
  }, [message]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && reply.trim()) {
      e.preventDefault();
      void doSend();
    }
  }

  async function doSend() {
    if (!message?.id || !reply.trim()) return;
    await onReplied(message.id);
    setReply("");
    onClose();
  }

  const created = message ? new Date(message.createdAt) : null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden">
        {/* Header bar */}
        <div className="border-b px-6 py-4">
          <DialogHeader className="p-0">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="w-5 h-5" />
              {message ? "Message" : "Message"}
            </DialogTitle>
          </DialogHeader>
        </div>

        {message && (
          <div className="grid md:grid-cols-[260px,1fr] gap-0">
            {/* Left: Sender / meta */}
            <aside className="px-6 py-5 border-r md:min-h-[56vh]">
              {/* Subject (prominent) */}
              <h2 className="text-base font-semibold leading-tight text-foreground mb-2">
                {message.subject || "(No subject)"}
              </h2>

              {/* Byline */}
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3">
                {`${message.firstName || ""} ${message.lastName || ""}`.trim() || message.email || "Unknown sender"}
              </div>

              {/* Avatar + contact */}
              <div className="flex items-center gap-3 mb-4">
                <div className="h-9 w-9 rounded-full bg-muted/70 flex items-center justify-center text-xs font-semibold">
                  {initials}
                </div>
                <div className="text-sm text-muted-foreground">
                  <div className="truncate">{message.email}</div>
                  {message.phone && <div className="truncate">{message.phone}</div>}
                </div>
              </div>

              {/* Status / time */}
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <Badge variant={variant as any}>{message.status}</Badge>
                {created && (
                  <span className="text-xs text-muted-foreground">{created.toLocaleString()}</span>
                )}
              </div>
            </aside>

            {/* Right: Message body + reply */}
            <section className="flex flex-col">
              {/* Body */}
              <div className="px-6 py-5">
                <div className="rounded-lg bg-muted/30 p-4">
                  <p className="text-[15px] leading-7 whitespace-pre-wrap break-words">
                    {message.message}
                  </p>
                </div>
              </div>

              {/* Composer (sticky within dialog section) */}
              <div className="mt-auto border-t px-6 py-4">
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="text-sm font-medium">Reply</h4>
                  <span className="text-xs text-muted-foreground">{reply.trim().length} chars</span>
                </div>
                <Textarea
                  rows={5}
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your reply…  (Press ⌘/Ctrl + Enter to send)"
                  className="resize-y"
                />
                <div className="mt-3 flex items-center justify-end gap-2">
                  <Button variant="outline" onClick={onClose}>
                    Close
                  </Button>
                  <Button onClick={doSend} disabled={!reply.trim()}>
                    <Send className="w-4 h-4 mr-2" />
                    Send Reply
                  </Button>
                </div>
              </div>
            </section>
          </div>
        )}

        {!message && (
          <div className="px-6 py-10 text-sm text-muted-foreground">
            No message selected.
          </div>
        )}

        {/* Fallback footer for mobile (kept empty—actions live near composer) */}
        <DialogFooter className="hidden" />
      </DialogContent>
    </Dialog>
  );
}
