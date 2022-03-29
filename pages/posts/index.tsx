import { AllPostMeta } from "../../post";

export function getStaticProps() {
    return {
        props: {
            posts: AllPostMeta
        }
    }
}

export default function Post({posts}) {
    return <div>
        {posts.map(x => (
            <li key={x.title}>
                <a href={`/posts/${x.title}`}>{x.title}</a>
            </li>
        ))}
    </div>
}