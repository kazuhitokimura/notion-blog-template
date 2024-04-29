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
        <h1 className="text-2xl font-bold">Next.js + Notion API ブログ</h1>
        <p className="text-slate-600">
          Notionと連携しているブログです。Notionに書き込めばそのままブログとして投稿できます。
        </p>
      </header>
      <main className="bg-slate-50 px-4 py-12">
        <h2 className="my-4 text-xl font-semibold uppercase tracking-wide">
          All Posts
        </h2>
        <ol>
          {posts.map((post) => {
            const date = new Date(post.last_edited_time).toLocaleString(
              "en-US",
              {
                month: "short",
                day: "2-digit",
                year: "numeric",
              },
            );
            return (
              <li key={post.id} className="mb-6">
                <h3 className="text-lg font-semibold">
                  <Link href={`/${post.id}`}>
                    <a className="text-blue-600 hover:text-blue-800">
                      <Text text={post.properties.Name.title} />
                    </a>
                  </Link>
                </h3>

                <p className="text-sm text-slate-500">{date}</p>
                <Link href={`/${post.id}`}>
                  <a className="text-blue-500 hover:underline">Read post →</a>
                </Link>
              </li>
            );
          })}
        </ol>
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
