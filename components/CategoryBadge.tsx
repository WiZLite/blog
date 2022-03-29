import Link from "next/link"

export default function CategoryBadge({ category }: { category: string }) {

    return (
        <Link href={`/categories/${encodeURIComponent(category)}`}>
            <a
                className="neum-convex interactive rounded p-1 px-2 m-1 dark:text-gray-400">
                {category}
            </a>
        </Link>
    )
}