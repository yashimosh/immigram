import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ThumbsUp,
  Eye,
  MessageCircle,
  CheckCircle2,
  Pin,
} from "lucide-react";
import { CommentSection } from "./comment-section";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("imm_community_posts")
    .select("title")
    .eq("id", id)
    .single();
  return { title: data?.title ?? "Post" };
}

export default async function CommunityPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: post, error } = await supabase
    .from("imm_community_posts")
    .select(
      "*, profiles:user_id(first_name, last_name, avatar_url)",
    )
    .eq("id", id)
    .single();

  if (error || !post) notFound();

  const { data: comments } = await supabase
    .from("imm_community_comments")
    .select(
      "*, profiles:user_id(first_name, last_name, avatar_url)",
    )
    .eq("post_id", id)
    .order("created_at", { ascending: true });

  const categoryColors: Record<string, string> = {
    question: "bg-blue-400/10 text-blue-400",
    success_story: "bg-green-400/10 text-green-400",
    discussion: "bg-purple-400/10 text-purple-400",
    tip: "bg-amber-400/10 text-amber-400",
    news: "bg-rose-400/10 text-rose-400",
  };

  const isAuthor = user?.id === post.user_id;
  const isQuestion = post.category === "question";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/community"
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Community
      </Link>

      {/* Post */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {post.is_pinned && (
            <Pin className="h-3.5 w-3.5 text-amber-400" />
          )}
          <span
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
              categoryColors[post.category] ?? "bg-white/10 text-muted-foreground"
            }`}
          >
            {post.category.replace(/_/g, " ")}
          </span>
          {post.is_answered && (
            <span className="flex items-center gap-1 text-[11px] text-green-400">
              <CheckCircle2 className="h-3 w-3" /> Answered
            </span>
          )}
        </div>

        <h1 className="text-xl font-bold mb-2">{post.title}</h1>

        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-6">
          <span>
            {post.profiles
              ? `${post.profiles.first_name} ${post.profiles.last_name}`
              : "Anonymous"}
          </span>
          <span>&middot;</span>
          <span>{new Date(post.created_at).toLocaleDateString()}</span>
        </div>

        <div className="prose prose-sm prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap">
          {post.content}
        </div>

        {/* Tags */}
        {(post.country_tags?.length > 0 || post.visa_tags?.length > 0) && (
          <div className="flex flex-wrap gap-1.5 mt-6 pt-4 border-t border-border">
            {post.country_tags?.map((tag: string) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-full bg-white/5 text-[11px] text-muted-foreground"
              >
                {tag}
              </span>
            ))}
            {post.visa_tags?.map((tag: string) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-full bg-primary/10 text-[11px] text-primary"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <ThumbsUp className="h-3.5 w-3.5" /> {post.upvotes_count} upvotes
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="h-3.5 w-3.5" /> {post.comments_count}{" "}
            comments
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" /> {post.views_count} views
          </span>
        </div>
      </div>

      {/* Comments */}
      <CommentSection
        postId={id}
        comments={comments ?? []}
        isAuthor={isAuthor}
        isQuestion={isQuestion}
        currentUserId={user?.id ?? null}
      />
    </div>
  );
}
