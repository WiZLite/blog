import Enumerable from "linq";
import { AllPostMeta, PostMeta } from "../../post"
import { GetStaticPaths, GetStaticProps } from "next";
import Header from "../../components/Header";
import Head from "next/head";
import PostSummary from "../../components/PostSummary";

type Params = {
    category: string;
}

type Props = {
    category: string,
    posts: PostMeta[]
}

export const getStaticPaths: GetStaticPaths<Params> = () => {
    const posts = AllPostMeta;
    return {
        paths: Enumerable.from(posts.filter(x => x.tags).flatMap(x => x.tags)).distinct()
            .toArray().map(category => {
                return {
                    params: {
                        category
                    }
                }
            }),
        fallback: false
    }
}

interface StaticProps {
    category: string
    posts: PostMeta[]
}

export const getStaticProps = ({ params: { category } }: { params: StaticProps}) => {
    return {
        props: {
            category,
            posts: AllPostMeta.filter(x => x.tags?.includes(category) ?? false)
        }
    }
}
export default function CategoryPage({ category, posts }: StaticProps) {
    return <div>
        <Head>
            <title>Neuromancy ({category})</title>
            <meta key="og-type" property="og:type" content="website" />
            <meta key="og-url" property="og:url" content="https://wizlite.jp" />
            <meta key="og-image" property="og:image" content={"https://github.com/WiZLite/BlogStudio/issues/1#issue-1118175079"} />
            <meta key="og-site_name" property="og:site_name" content="Neuromancy" />
        </Head>
        <Header />
        <h1 className="text-4xl text-center text-gray-400 mb-6">Category: {category}</h1>
        <hr/>
        <div className="w-2/3 mx-auto flex flex-wrap">
            {posts.map(x => (
                <PostSummary post={x} key={x.id} />
            ))}
        </div>
    </div>
}