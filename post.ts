import path from "path";
import fs from "fs";
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
    path: string;
} & PostMatter;

export type Post = {
    markdown: string;
} & PostMeta;

export function isPostMatter(value: any): value is PostMatter {
    const { updated_at, tags, title } = value;
    return (
        (!updated_at || updated_at instanceof Date) &&
        (!tags || tags instanceof Array) &&
        title &&
        typeof title === "string"
    );
}

export const PostsDirectory = path.join(process.cwd(), "posts");

export const PostMetaGroupedByMonth: Record<string, PostMeta[]> =
    Enumerable.from(getPosts())
        .groupBy(
            (x) =>
                `${x.created_at.getFullYear()}-${(
                    "00" +
                    (x.created_at.getMonth() + 1)
                ).slice(-2)}`
        )
        .aggregate({}, (obj, group) => ({
            ...obj,
            [group.key()]: group.getSource(),
        }));

export const PostMetaGroupedByTag: Record<string, PostMeta[]> = (() => {
    let ret: Record<string, PostMeta[]> = {};
    getPosts().forEach((post) => {
        if (!post.tags) return;
        for (let tag of post.tags) {
            if (!ret[tag]) {
                ret[tag] = [post];
            } else {
                ret[tag].push(post);
            }
        }
    });
    return ret;
})();

export const AllPostMeta = getPosts();

function getMetaFromFileName(fileName: string) {
    const filePath = path.join(PostsDirectory, fileName);
    const file = fs.readFileSync(filePath);
    const { data } = matter(file);
    if (!isPostMatter(data))
        throw new Error(file + JSON.stringify(data) + " is not PostMatter");

    const hyphenSplit = fileName.split("-");
    const yearMonthDay = new Date(
        Date.parse(`${hyphenSplit[0]}-${hyphenSplit[1]}-${hyphenSplit[2]}`)
    );
    const id = hyphenSplit.slice(3).join("-").split(".")[0];
    const post: PostMeta = {
        ...data,
        id,
        created_at: yearMonthDay,
        path: filePath,
    };
    return post;
}

export function getPosts(): PostMeta[] {
    const paths = fs.readdirSync(PostsDirectory);
    let ids = new Set<string>();
    return paths.map((p) => {
        const ret = getMetaFromFileName(p);
        if (ids.has(ret.id)) {
            throw new Error(`${ret.id}のタイトルが衝突しています`);
        }
        ids.add(ret.id);
        return ret;
    });
}

export function getPost(id: string): Post {
    const meta =
        AllPostMeta.find((x) => x.id === id) ??
        getMetaFromFileName(
            fs.readdirSync(PostsDirectory).find((x) => x.includes(id))
        );
    const file = fs.readFileSync(meta.path);
    const { data, content: markdown } = matter(file);
    if (!isPostMatter(data))
        throw new Error(meta.id + JSON.stringify(data) + " is not PostMatter");

    const post: Post = {
        ...meta,
        markdown,
    };

    return post;
}
