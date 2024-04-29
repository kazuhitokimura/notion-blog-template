import Head from "next/head";
import Link from "next/link";
import { getDatabase } from "../lib/notion";
import { Text } from "./[id].js";

export const databaseId = process.env.NOTION_DATABASE_ID;

export default function Home({ posts }) {
  return (
    <div className="mx-auto w-full">
      <Head>
        <title>Notion Next.js blog</title>
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href="/styles/output.css" />
      </Head>
      <header className="flex flex-row items-center gap-3 px-8 py-3">
        <div className="flex items-center space-x-4">
          {/* SVG icons remain unchanged */}
        </div>
        <h1 className="text-xl font-bold">Next.js + Notion API ブログ</h1>
        <p className="text-sm text-gray-600">
          Notionと連携しているブログです。Notionに書き込めばそのままブログとして投稿できます。
        </p>
      </header>
      <main className="flex flex-col items-center justify-center bg-gray-50">
        <ul className="mx-4 my-8 flex w-full max-w-2xl flex-col items-center gap-4">
          {posts.map((post) => {
            // 投稿の最終編集時間を 'MMM DD, YYYY' 形式でフォーマット
            const date = new Date(post.last_edited_time).toLocaleString(
              "en-US",
              {
                month: "short",
                day: "2-digit",
                year: "numeric",
              },
            );
            return (
              <li
                key={post.id}
                className="w-full cursor-pointer rounded-lg bg-white p-5"
              >
                <Link href={`/${post.id}`}>
                  <a className="block h-full w-full">
                    <h2 className="text-xl font-semibold">
                      <Text text={post.properties.Name.title} />
                    </h2>
                    <p className="text-sm text-gray-500">{date}</p>
                  </a>
                </Link>
              </li>
            );
          })}
        </ul>
      </main>
      <footer className="w-full px-8 py-3 text-center">
        <p>Copyright © 2024 Next.js + Notion API</p>
      </footer>
    </div>
  );
}

//ISR remains unchanged
export const getStaticProps = async () => {
  const database = await getDatabase(databaseId);
  return {
    props: { posts: database },
    revalidate: 1,
  };
};
