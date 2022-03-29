import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import fs from "fs/promises";
import path from 'path';
import matter from 'gray-matter';
import { AllPostMeta, isPostMatter, Post, PostMeta, PostMetaGroupedByMonth, PostMetaGroupedByTag } from "../post";
import Header from '../components/Header';
import PostSummary from '../components/PostSummary';
import CategoryBadge from '../components/CategoryBadge';
import Link from 'next/link';
import { useState } from 'react';


interface StaticProps {
  recentPosts: PostMeta[],
  monthGroups: Record<string, PostMeta[]>
  tagGroups: Record<string, PostMeta[]>
}

export const getStaticProps = (): { props: StaticProps } => {
  return {
    props: {
      recentPosts: AllPostMeta.concat().sort((a, b) => a.created_at === b.created_at ? 0 : a.created_at > b.created_at ? 1 : -1).slice(0, 10),
      monthGroups: PostMetaGroupedByMonth,
      tagGroups: PostMetaGroupedByTag
    }
  }
}

export default function Index({ recentPosts, monthGroups, tagGroups }: StaticProps) {
  const [selectedMonth, setSelectedMonth] = useState<string | undefined>();
  return (
    <>
      <Head>
        <title>Neuromancy</title>
      </Head>
      <Header />
      <h1 className='text-4xl text-bold text-gray-500 dark:text-gray-400 text-center font-bold'>
        ABOUT ME
      </h1>
      <div>
      </div>
      <div className='flex xs:flex-col justify-center xs:w-full lg:mx-12'>
        <div className='p-2 flex-initial w-2/3 xs:w-full'>

          <h1 className='text-3xl font-semibold text-gray-500 dark:text-gray-300 text-center mb-2'>
            {selectedMonth ?? "Recent Posts"}
          </h1>
          <div className='flex flex-wrap xs:block'>
            {(selectedMonth ? monthGroups[selectedMonth] : recentPosts).map(x => <PostSummary key={x.id} post={x} />)}
          </div>

          <div className='p-2 flex-initial w-4/5  mx-auto xs:w-full'>
            <h1 className='text-3xl font-semibold text-gray-500 dark:text-gray-300 text-center mb-2'>
              Tags
            </h1>
            <div className='p-4 inline'>
              {Object.entries(tagGroups).map(([tag, posts]) => <Tag key={tag} tag={tag} count={posts.length} />)}
            </div>
          </div>

        </div>
        <div className='p-2 flex-initial w-1/3 xs:w-full'>

          <h1 className='text-3xl font-semibold text-gray-500 dark:text-gray-300 text-center mb-2'>
            Archives
          </h1>
          <ul className='mt-4 neum p-4'>
            <li
              onClick={() => setSelectedMonth(undefined)}
              className={`flat p-3 text-lg border border-slate-200 dark:border-slate-800 ${!selectedMonth ? "neum-inset" : "neum interactive "}`}>
                Recent {recentPosts.length} posts
            </li>
            {Object.entries(monthGroups).map(([yearMonth, posts]) => (
              <li key={yearMonth}
                onClick={() => setSelectedMonth(yearMonth)}
                className={`flat p-3 text-lg border border-slate-200 dark:border-slate-800 ${selectedMonth === yearMonth ? "neum-inset" : "neum interactive "
                  }`}>
                {yearMonth} ({posts.length})
              </li>
            ))}
          </ul>

        </div>

      </div>
    </>
  )
}

function Tag({ tag, count }: { tag: string, count: number }) {
  return <Link href={`/categories/${tag}`}>
    <a
      className={`neum-sm interactive inline-block m-1 ${count >= 25 ? "text-2xl p-6" : count >= 10 ? "text-xl p-4" : "text-lg p-2"
        } rounded-xl text-gray-500 dark:text-gray-400`}>
      {tag} ({count})
    </a>
  </Link>
}
