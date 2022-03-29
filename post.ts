import path from "path";
import fs from "fs"
import matter from "gray-matter";
import Enumerable from "linq";

export type PostMatter = {
    created_at: Date;
    title: string;
    updated_at?: Date;
    tags?: string[];
    image?: string;
};

export type PostMeta = {
    id: string;
} & PostMatter

export type Post = {
    markdown: string;
} & PostMeta;

export function isPostMatter(value: any): value is PostMatter {
    const { created_at, updated_at, tags, title } = value;
    console.log(typeof created_at)
    return (
        created_at instanceof Date &&
        (!updated_at || updated_at instanceof Date) &&
        (!tags || tags instanceof Array) &&
        title && typeof title === "string"
    )
}

export const PostsDirectory = path.join(process.cwd(), "posts");

export const AllPostMeta = getPosts();

export const PostMetaGroupedByMonth: Record<string, PostMeta[]> = Enumerable.from(AllPostMeta)
    .groupBy(x => `${x.created_at.getFullYear()}-${("00" + (x.created_at.getMonth() + 1)).slice(-2)}`)
    .aggregate({}, (obj, group) => ({...obj, [group.key()]: group.getSource()}));

export const PostMetaGroupedByTag: Record<string, PostMeta[]> = (() => {
    let ret: Record<string, PostMeta[]> = {};
    AllPostMeta.forEach(post => {
        if(!post.tags) return;
        for(let tag of post.tags) {
            if(!ret[tag]) {
                ret[tag] = [post]
            } else {
                ret[tag].push(post);
            }
        }
    });
    return ret;
})()

function getPosts(): PostMeta[] {
    const paths = fs.readdirSync(PostsDirectory);
    return paths.map(p => {
        const file = fs.readFileSync(path.join(PostsDirectory, p));
        const { data } = matter(file);
        if (!isPostMatter(data)) throw new Error(file + JSON.stringify(data) + " is not PostMatter");

        const post: PostMeta = {
            ...data,
            id: p.split(".")[0],
        }

        return post;
    });
}

export function getPost(id: string): Post {
    const file = fs.readFileSync(path.join(PostsDirectory, id + ".md"));
    const { data, content: markdown } = matter(file);
    if (!isPostMatter(data)) throw new Error(file + JSON.stringify(data) + " is not PostMatter");

    const post: Post = {
        ...data,
        id,
        markdown
    }

    return post;
}