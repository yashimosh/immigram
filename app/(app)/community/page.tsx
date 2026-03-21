import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  Users,
  Plus,
  ThumbsUp,
  MessageCircle,
  Eye,
  Pin,
  CheckCircle2,
} from "lucide-react";
import { COMMUNITY_CATEGORIES } from "@/lib/constants";

export const metadata = { title: "Community" };

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("imm_community_posts")
    .select(
      "id, category, title, content, country_tags, visa_tags, upvotes_count, comments_count, views_count, is_pinned, is_answered, created_at, user_id, profiles:user_id(first_name, last_name, avatar_url)",
    )
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(30);

  if (category) {
    query = query.eq("category", category);
  }

  const { data: posts } = await query as { data: { id: string; category: string; title: string; content: string; country_tags: string[]; visa_tags: string[]; upvotes_count: number; comments_count: number; views_count: number; is_pinned: boolean; is_answered: boolean; created_at: string; user_id: string; profiles: { first_name: string; last_name: string; avatar_url: string | null } | null }[] | null };

  const categoryColors: Record<string, string> = {
    question: "bg-blue-400/10 text-blue-400",
    success_story: "bg-green-400/10 text-green-400",
    discussion: "bg-purple-400/10 text-purple-400",
    tip: "bg-amber-400/10 text-amber-400",
    news: "bg-rose-400/10 text-rose-400",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Community</h1>
          <p className="text-muted-foreground mt-1">
            Connect with fellow immigrants and share experiences
          </p>
        </div>
        <Link
          href="/community/new"
          className="flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" />
          New Post
        </Link>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap">
        <Link
          href="/community"
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            !category
              ? "bg-primary/10 text-primary border border-primary/30"
              : "glass text-muted-foreground hover:text-foreground"
          }`}
        >
          All
        </Link>
        {COMMUNITY_CATEGORIES.map((cat) => (
          <Link
            key={cat.value}
            href={`/community?category=${cat.value}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              category === cat.value
                ? "bg-primary/10 text-primary border border-primary/30"
                : "glass text-muted-foreground hover:text-foreground"
            }`}
          >
            {cat.label}
          </Link>
        ))}
      </div>

      {/* Posts list */}
      {!posts?.length ? (
        <div className="glass rounded-xl p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
            <Users className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mb-3">
            No posts yet. Be the first to share!
          </p>
          <Link
            href="/community/new"
            className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" /> Create Post
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {posts.map(
            (post) => (
              <Link
                key={post.id}
                href={`/community/${post.id}`}
                className="glass rounded-xl px-5 py-4 flex items-start gap-4 hover:bg-white/[0.06] transition-colors block"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    {post.is_pinned && (
                      <Pin className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                    )}
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
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

                  <h3 className="font-medium truncate">{post.title}</h3>

                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span>
                      {post.profiles
                        ? `${post.profiles.first_name} ${post.profiles.last_name}`
                        : "Anonymous"}
                    </span>
                    <span>&middot;</span>
                    <span>
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0 pt-1">
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="h-3.5 w-3.5" />
                    {post.upvotes_count}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-3.5 w-3.5" />
                    {post.comments_count}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" />
                    {post.views_count}
                  </span>
                </div>
              </Link>
            ),
          )}
        </div>
      )}
    </div>
  );
}
