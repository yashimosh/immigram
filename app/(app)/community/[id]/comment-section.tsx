"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { CommunityComment } from "@/lib/types";
import {
  Send,
  Loader2,
  CheckCircle2,
  Reply,
  MessageCircle,
} from "lucide-react";
import { VoteButton } from "./vote-button";

interface CommentWithAuthor extends CommunityComment {
  profiles: { first_name: string; last_name: string; avatar_url: string | null } | null;
}

export function CommentSection({
  postId,
  comments,
  isAuthor,
  isQuestion,
  currentUserId,
  userCommentVotes,
}: {
  postId: string;
  comments: CommentWithAuthor[];
  isAuthor: boolean;
  isQuestion: boolean;
  currentUserId: string | null;
  userCommentVotes?: Record<string, "up" | "down">;
}) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const topLevel = comments.filter((c) => !c.parent_id);
  const replies = comments.filter((c) => c.parent_id);

  function getReplies(parentId: string) {
    return replies.filter((r) => r.parent_id === parentId);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || loading) return;

    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("imm_community_comments").insert({
        post_id: postId,
        user_id: currentUserId,
        parent_id: replyTo,
        content: content.trim(),
      });

      if (error) throw error;

      setContent("");
      setReplyTo(null);
      router.refresh();
    } catch {
      // silently fail
    }
    setLoading(false);
  }

  async function handleAcceptAnswer(commentId: string) {
    const supabase = createClient();
    await supabase
      .from("imm_community_comments")
      .update({ is_accepted_answer: true })
      .eq("id", commentId);

    await supabase
      .from("imm_community_posts")
      .update({ is_answered: true })
      .eq("id", postId);

    router.refresh();
  }

  function renderComment(comment: CommentWithAuthor, depth = 0) {
    const childReplies = getReplies(comment.id);

    return (
      <div key={comment.id} className={depth > 0 ? "ml-8" : ""}>
        <div
          className={`glass rounded-xl px-4 py-3 ${
            comment.is_accepted_answer
              ? "border border-green-400/30 bg-green-400/5"
              : ""
          }`}
        >
          {comment.is_accepted_answer && (
            <div className="flex items-center gap-1 text-[11px] text-green-400 font-medium mb-2">
              <CheckCircle2 className="h-3.5 w-3.5" /> Accepted Answer
            </div>
          )}

          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {comment.content}
          </p>

          <div className="flex items-center justify-between mt-3 pt-2 border-t border-border">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>
                {comment.profiles
                  ? `${comment.profiles.first_name} ${comment.profiles.last_name}`
                  : "Anonymous"}
              </span>
              <span>&middot;</span>
              <span>
                {new Date(comment.created_at).toLocaleDateString()}
              </span>
              <VoteButton
                commentId={comment.id}
                currentVote={userCommentVotes?.[comment.id] ?? null}
                upvotes={comment.upvotes_count}
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setReplyTo(replyTo === comment.id ? null : comment.id)
                }
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Reply className="h-3 w-3" /> Reply
              </button>

              {isAuthor &&
                isQuestion &&
                !comment.is_accepted_answer &&
                comment.user_id !== currentUserId && (
                  <button
                    onClick={() => handleAcceptAnswer(comment.id)}
                    className="flex items-center gap-1 text-xs text-green-400 hover:text-green-300 transition-colors"
                  >
                    <CheckCircle2 className="h-3 w-3" /> Accept
                  </button>
                )}
            </div>
          </div>
        </div>

        {/* Inline reply form */}
        {replyTo === comment.id && (
          <form
            onSubmit={handleSubmit}
            className="ml-8 mt-2 flex gap-2"
          >
            <input
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write a reply..."
              className="flex-1 rounded-lg bg-input border border-border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              autoFocus
            />
            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="rounded-lg bg-primary text-primary-foreground px-3 py-2 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </form>
        )}

        {/* Nested replies */}
        {childReplies.length > 0 && (
          <div className="mt-2 space-y-2">
            {childReplies.map((r) => renderComment(r, depth + 1))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <MessageCircle className="h-5 w-5" /> Comments
      </h2>

      {topLevel.length === 0 ? (
        <div className="glass rounded-xl p-6 text-center">
          <p className="text-sm text-muted-foreground">
            No comments yet. Be the first to respond!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {topLevel.map((c) => renderComment(c))}
        </div>
      )}

      {/* New top-level comment */}
      {!replyTo && (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 rounded-lg bg-input border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="rounded-lg bg-primary text-primary-foreground px-4 py-2.5 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </form>
      )}
    </div>
  );
}
