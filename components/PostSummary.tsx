import Link from "next/link";
import { memo } from "react";
import { PostMeta } from "../post";
import CategoryBadge from "./CategoryBadge";

interface Props {
    post: PostMeta
}

function PostSummaryInternal({ post }: Props) {
    return (
        <article
            className=" p-3 m-2 w-76 sm:w-full xs:w-full neum hover:neum-concave active:neum-inset 
            rounded-lg flex flex-col justify-between">
            <Link href={`/posts/${post.id}`} >
                <a className="text-lg text-gray-700 dark:text-gray-300 font-medium">{post.title}</a>
            </Link>
            <hr className="xs:hidden"/>
            <span>
                <span className="ml-2 text-gray-500 text-sm">
                    Created: {post.created_at.toLocaleDateString()}
                </span>
                <span className="ml-2 text-gray-500 text-sm">
                    Updated: {post.updated_at.toLocaleDateString()}
                </span>
                <br className="xs:hidden"/>
                <span className="text-gray-800 justify-self-end">
                    {post.tags?.map(tag => <CategoryBadge category={tag} key={tag} />)}
                </span>
            </span>
        </article>
    )
}

const PostSummary = memo(PostSummaryInternal);
PostSummary.displayName = "PostSummary";
export default PostSummary;