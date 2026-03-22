"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ThumbsUp, ThumbsDown } from "lucide-react";

export function VoteButton({
  postId,
  commentId,
  currentVote,
  upvotes,
}: {
  postId?: string;
  commentId?: string;
  currentVote: "up" | "down" | null;
  upvotes: number;
}) {
  const router = useRouter();
  const [vote, setVote] = useState(currentVote);
  const [count, setCount] = useState(upvotes);
  const [loading, setLoading] = useState(false);

  async function handleVote(type: "up" | "down") {
    if (loading) return;
    setLoading(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    try {
      if (vote === type) {
        // Remove vote
        let query = supabase
          .from("imm_community_votes")
          .delete()
          .eq("user_id", user.id);

        if (postId) query = query.eq("post_id", postId);
        if (commentId) query = query.eq("comment_id", commentId);

        await query;

        setCount((prev) => prev + (type === "up" ? -1 : 1));
        setVote(null);
      } else {
        // Upsert vote — delete existing then insert
        let delQuery = supabase
          .from("imm_community_votes")
          .delete()
          .eq("user_id", user.id);

        if (postId) delQuery = delQuery.eq("post_id", postId);
        if (commentId) delQuery = delQuery.eq("comment_id", commentId);

        await delQuery;

        await supabase.from("imm_community_votes").insert({
          user_id: user.id,
          post_id: postId || null,
          comment_id: commentId || null,
          vote_type: type,
        });

        // Adjust count
        if (vote === null) {
          setCount((prev) => prev + (type === "up" ? 1 : -1));
        } else {
          // Switching vote
          setCount((prev) => prev + (type === "up" ? 2 : -2));
        }
        setVote(type);
      }

      // Update the denormalized count
      if (postId) {
        const { count: upCount } = await supabase
          .from("imm_community_votes")
          .select("*", { count: "exact", head: true })
          .eq("post_id", postId)
          .eq("vote_type", "up");

        const { count: downCount } = await supabase
          .from("imm_community_votes")
          .select("*", { count: "exact", head: true })
          .eq("post_id", postId)
          .eq("vote_type", "down");

        const netVotes = (upCount ?? 0) - (downCount ?? 0);
        await supabase
          .from("imm_community_posts")
          .update({ upvotes_count: netVotes })
          .eq("id", postId);

        setCount(netVotes);
      }

      if (commentId) {
        const { count: upCount } = await supabase
          .from("imm_community_votes")
          .select("*", { count: "exact", head: true })
          .eq("comment_id", commentId)
          .eq("vote_type", "up");

        const { count: downCount } = await supabase
          .from("imm_community_votes")
          .select("*", { count: "exact", head: true })
          .eq("comment_id", commentId)
          .eq("vote_type", "down");

        const netVotes = (upCount ?? 0) - (downCount ?? 0);
        await supabase
          .from("imm_community_comments")
          .update({ upvotes_count: netVotes })
          .eq("id", commentId);

        setCount(netVotes);
      }

      router.refresh();
    } catch {
      // revert optimistic update on error
      setVote(currentVote);
      setCount(upvotes);
    }
    setLoading(false);
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => handleVote("up")}
        disabled={loading}
        className={`p-1 rounded transition-colors ${
          vote === "up"
            ? "text-primary bg-primary/10"
            : "text-muted-foreground hover:text-foreground hover:bg-white/5"
        }`}
      >
        <ThumbsUp className="h-3.5 w-3.5" />
      </button>
      <span
        className={`text-xs font-medium min-w-[1.5ch] text-center ${
          count > 0 ? "text-primary" : count < 0 ? "text-destructive" : "text-muted-foreground"
        }`}
      >
        {count}
      </span>
      <button
        onClick={() => handleVote("down")}
        disabled={loading}
        className={`p-1 rounded transition-colors ${
          vote === "down"
            ? "text-destructive bg-destructive/10"
            : "text-muted-foreground hover:text-foreground hover:bg-white/5"
        }`}
      >
        <ThumbsDown className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
