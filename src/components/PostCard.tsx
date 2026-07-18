import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { categoryName } from "@/lib/categories";
import { pick, type Locale, type Post } from "@/lib/types";

const ALARM = new Set(["derechos-humanos", "injusticia"]);

export default function PostCard({
  post,
  locale,
  priority = false,
}: {
  post: Post;
  locale: Locale;
  priority?: boolean;
}) {
  const title = pick(post, "title", locale);
  const excerpt = pick(post, "excerpt", locale);
  const isAlarm = ALARM.has(post.category_slug);

  return (
    <Link
      href={`/post/${post.slug}`}
      className="paper group block transition-transform duration-200 hover:-translate-y-0.5"
    >
      {post.cover_image_url && (
        <div className={`duo aspect-4/3 w-full ${isAlarm ? "alarm" : ""}`}>
          <Image
            src={post.cover_image_url}
            alt={title}
            fill
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="kicker">[ {categoryName(post.category_slug, locale)} ]</span>
          <span className="stamp text-[0.6rem]">Revisado</span>
        </div>
        <h3 className="mt-3 font-display text-2xl font-bold leading-[1.05] text-ink">
          {title}
        </h3>
        {excerpt && (
          <p className="mt-2 line-clamp-3 font-serif text-[0.95rem] text-ink-muted">
            {excerpt}
          </p>
        )}
        {post.profiles?.display_name && (
          <p className="meta mt-4 text-ink-muted">— {post.profiles.display_name}</p>
        )}
      </div>
    </Link>
  );
}
