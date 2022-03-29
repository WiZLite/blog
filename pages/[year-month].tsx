import { GetStaticPathsResult } from "next";
import { AllPostMeta, PostMeta, PostMetaGroupedByMonth } from "../post";
import linq from "linq"
import Enumerable from "linq";

export function getStaticPaths(): GetStaticPathsResult {
    return {
        paths: Object.keys(PostMetaGroupedByMonth).map(ym => ({
            params: {
                "year-month": ym
            }
        })),
        fallback: false
    }
}

interface StaticProps {
    posts: PostMeta[]
}

export function getStaticProps({ params }): { props: StaticProps } {
    const yearMonth = params["year-month"];
    return {
        props: {
            posts: PostMetaGroupedByMonth[yearMonth]
        }
    }
}

export default function YearMonth({ posts } : StaticProps) {
    return (
        <ul>
            {posts.map(post => <li key={post.id}>{post.id}</li>)}
        </ul>
    )
} 