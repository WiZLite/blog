import { AllPostMeta, getPost, Post, PostMeta } from "../../post";
import { marked } from "marked"
import Markdown from "../../components/Markdown";
import TwitterIcon from "../../components/icons/TwitterIcon";
import FacebookIcon from "../../components/icons/FacebookIcon";
import TableOfContents from "../../components/TableOfContents";
import PostSummary from "../../components/PostSummary";
import TwitterWidget from "../../components/TwitterWidget";
import Head from "next/head";
import Header from "../../components/Header";
import { extractDescription } from "../../helpers";
import CategoryBadge from "../../components/CategoryBadge";
import Footer from "../../components/Footer";

export function getStaticPaths() {
    return {
        paths: AllPostMeta.map(x => ({
            params: {
                id: x.id
            }
        })),
        fallback: false
    }
}

export interface StaticProps {
    post: Post
    readNexts: PostMeta[] | null
    recentPosts: PostMeta[]
}

export function getStaticProps({ params: { id } }): { props: StaticProps } {
    const post = getPost(id);
    return {
        props: {
            post,
            readNexts: post.tags ? AllPostMeta
                .filter(x => x.id !== post.id && x.tags && post.tags
                    .find(t => x.tags.includes(t))).slice(0, 5) : null,
            recentPosts: AllPostMeta.filter(x => x.id !== post.id)
                .sort((a, b) => a.created_at > b.created_at ? -1 : 1) // desc
                .slice(0, 5)
        }
    }
}

export default function PostPage({ post, readNexts, recentPosts }: StaticProps) {
    return <>
        <Head>
            <title>{post.title}</title>
            <meta key="og-title" property="og:title" content={post.title} />
            <meta key="og-type" property="og:type" content="article" />
            <meta key="og-url" property="og:url" content="https://wizlite.jp" />
            <meta key="og-image" property="og:image" content="https://user-images.githubusercontent.com/7351910/151657931-4470d45d-ed5b-48b2-a610-55429ad871ad.png" />
            <meta key="og-site_name" property="og:site_name" content="Neuromancy" />
            <meta key="og-description" property="og:description" content={extractDescription(post.markdown)} />
        </Head>
        <Header />
        <main className="flex flex-row justify-center">
            <aside className="hidden lg:flex flex-1 flex-col justify-center items-end max-w-xs sticky top-0 h-full">
                <a className="block mt-8 mr-6 rounded-full neum-sm interactive"
                    onClick={() => {
                        window.open(`http://twitter.com/share?url=${encodeURIComponent(location.href)
                            }&text=${encodeURIComponent(post.title)}&via=wizlightyear&related=wizlightyear${post.tags?.map(x => "&hashtags=" + encodeURIComponent(x)).join("") ?? ""}`,
                            "", "width=560, height=440")
                    }}>
                    <TwitterIcon width={50} height={50}
                        className="fill-gray-400 p-3" />
                </a>
                <a className="block mt-4 mr-6 rounded-full neum-sm interactive"
                    onClick={() => {
                        window.open(`https://www.facebook.com/share.php?u=${encodeURIComponent(location.href)}`, "", "width=560,height=440")
                    }}
                >
                    <FacebookIcon width={50} height={50}
                        className="fill-gray-400 p-3" />
                </a>
            </aside>
            <article className="p-6 lg:p-8 max-w-4xl xs:w-full sm:w-full neum rounded-lg mb-2">
                <div className="mb-4">
                    <h1 className="text-3xl text-bold text-center mb-4"><a href="#">{post.title}</a></h1>
                    <p className="text-center text-sm text-gray-500 pb-4">
                        <span className="pr-2">
                            Created: {post.created_at.toLocaleDateString()}
                        </span>
                        {post.updated_at && <span className="pr-2">
                            Updated: {post.updated_at.toLocaleDateString()}
                        </span>}
                        {post.tags && <span>
                            Tags:
                        </span>}
                        {post.tags?.map(tag => (<CategoryBadge key={tag} category={tag} />))}
                    </p>
                </div>
                <hr/>
                <Markdown markdown={post.markdown} />
            </article>
            <aside className="hidden lg:block flex-1 sticky h-full top-0 p-8 max-w-xs">
                <TableOfContents />
                <TwitterWidget />
            </aside>
        </main>
        <hr/>
        <div role="read-next" style={{ minHeight: "600px" }} className="mt-4">
            <div className="w-2/3  mx-auto sm:w-full flex xs:block">
                <div className="w-1/2 xs:w-full p-4">
                    <h2 className="text-lg text-gray-500">関連記事</h2>
                    {readNexts && readNexts.map(x => (
                        <PostSummary key={x.id} post={x} />
                    ))}
                </div>
                <div className="w-1/2 xs:w-full p-4">
                    <h2 className="text-lg text-gray-500">最近の記事</h2>
                    {recentPosts.map(x => (
                        <PostSummary key={x.id} post={x} />
                    ))}
                </div>
            </div>
        </div>
        <Footer/>
    </>
}