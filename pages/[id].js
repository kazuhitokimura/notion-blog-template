import { Fragment } from "react";
import Head from "next/head";
import { getDatabase, getPage, getBlocks } from "../lib/notion";
import Link from "next/link";
import { databaseId } from "./index.js";

export const Text = ({ text }) => {
  if (!text) {
    return null;
  }
  return text.map((value) => {
    const {
      annotations: { bold, code, color, italic, strikethrough, underline },
      text,
    } = value;
    return (
      <span
        className={[
          bold ? "font-bold" : "",
          code ? "rounded bg-gray-100 p-1 font-mono" : "",
          italic ? "italic" : "",
          strikethrough ? "line-through" : "",
          underline ? "underline" : "",
        ].join(" ")}
        style={color !== "default" ? { color } : {}}
      >
        {text.link ? (
          <a href={text.link.url} className="text-blue-500 hover:text-blue-700">
            {text.content}
          </a>
        ) : (
          text.content
        )}
      </span>
    );
  });
};

const renderNestedList = (block) => {
  const { type } = block;
  const value = block[type];
  if (!value) return null;

  const isNumberedList = value.children[0].type === "numbered_list_item";

  return isNumberedList ? (
    <ol className="list-inside list-decimal">
      {value.children.map((childBlock) => (
        <li key={childBlock.id}>{renderBlock(childBlock)}</li>
      ))}
    </ol>
  ) : (
    <ul className="list-inside list-disc">
      {value.children.map((childBlock) => (
        <li key={childBlock.id}>{renderBlock(childBlock)}</li>
      ))}
    </ul>
  );
};

const renderBlock = (block) => {
  const { type, id } = block;
  const value = block[type];

  switch (type) {
    case "paragraph":
      return (
        <p className="mb-4">
          <Text text={value.text} />
        </p>
      );
    case "heading_1":
      return (
        <h1 className="my-4 text-3xl font-bold">
          <Text text={value.text} />
        </h1>
      );
    case "heading_2":
      return (
        <h2 className="my-3 text-2xl font-semibold">
          <Text text={value.text} />
        </h2>
      );
    case "heading_3":
      return (
        <h3 className="my-2 text-xl font-medium">
          <Text text={value.text} />
        </h3>
      );
    case "bulleted_list_item":
    case "numbered_list_item":
      return (
        <li className="ml-4 list-disc">
          <Text text={value.text} />
          {!!value.children && renderNestedList(block)}
        </li>
      );
    case "to_do":
      return (
        <div className="mb-2 flex items-center">
          <input
            type="checkbox"
            id={id}
            defaultChecked={value.checked}
            className="mr-2"
          />
          <label htmlFor={id} className="flex-1">
            <Text text={value.text} />
          </label>
        </div>
      );
    case "toggle":
      return (
        <details className="mb-2">
          <summary>
            <Text text={value.text} />
          </summary>
          {value.children?.map((block) => (
            <Fragment key={block.id}>{renderBlock(block)}</Fragment>
          ))}
        </details>
      );
    case "child_page":
      return <p className="mb-2">{value.title}</p>;
    case "image":
      const src =
        value.type === "external" ? value.external.url : value.file.url;
      const caption = value.caption ? value.caption[0]?.plain_text : "";
      return (
        <figure className="my-4">
          <img src={src} alt={caption} className="w-full" />
          {caption && (
            <figcaption className="text-sm text-gray-500">{caption}</figcaption>
          )}
        </figure>
      );
    case "divider":
      return <hr className="my-4" />;
    case "quote":
      return (
        <blockquote className="my-4 border-l-4 border-gray-500 pl-4 italic">
          {value.text[0].plain_text}
        </blockquote>
      );
    case "code":
      return (
        <pre className="my-4 rounded-lg bg-gray-100 p-4">
          <code className="block whitespace-pre-wrap">
            {value.text[0].plain_text}
          </code>
        </pre>
      );
    case "file":
      const src_file =
        value.type === "external" ? value.external.url : value.file.url;
      const splitSourceArray = src_file.split("/");
      const lastElementInArray = splitSourceArray[splitSourceArray.length - 1];
      const caption_file = value.caption ? value.caption[0]?.plain_text : "";
      return (
        <figure className="my-4">
          <div className="flex items-center">
            📎{" "}
            <Link href={src_file} passHref>
              <a className="ml-2 text-blue-600 underline hover:text-blue-800">
                {lastElementInArray.split("?")[0]}
              </a>
            </Link>
          </div>
          {caption_file && (
            <figcaption className="text-sm text-gray-500">
              {caption_file}
            </figcaption>
          )}
        </figure>
      );
    case "bookmark":
      const href = value.url;
      return (
        <a
          href={href}
          target="_blank"
          className="my-2 block text-blue-600 underline hover:text-blue-800"
        >
          {href}
        </a>
      );
    default:
      return `❌ Unsupported block (${type === "unsupported" ? "unsupported by Notion API" : type})`;
  }
};

export default function Post({ page, blocks }) {
  if (!page || !blocks || !page.properties.Name.title[0]) {
    return <div />;
  }
  return (
    <div>
      <Head>
        <title>{page.properties.Name.title[0].plain_text}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <article className="container mx-auto px-4">
        <h1 className="my-4 text-3xl font-bold">
          <Text text={page.properties.Name.title} />
        </h1>
        <section>
          {blocks.map((block) => (
            <Fragment key={block.id}>{renderBlock(block)}</Fragment>
          ))}
          <Link href="/">
            <a className="text-blue-600 hover:text-blue-800">← Go home</a>
          </Link>
        </section>
      </article>
    </div>
  );
}

export const getStaticPaths = async () => {
  const database = await getDatabase(databaseId);
  return {
    paths: database.map((page) => ({ params: { id: page.id } })),
    fallback: true,
  };
};

export const getStaticProps = async (context) => {
  const { id } = context.params;
  const page = await getPage(id);
  const blocks = await getBlocks(id);

  // Retrieve block children for nested blocks (one level deep), for example toggle blocks
  // https://developers.notion.com/docs/working-with-page-content#reading-nested-blocks
  const childBlocks = await Promise.all(
    blocks
      .filter((block) => block.has_children)
      .map(async (block) => {
        return {
          id: block.id,
          children: await getBlocks(block.id),
        };
      }),
  );
  const blocksWithChildren = blocks.map((block) => {
    // Add child blocks if the block should contain children but none exists
    if (block.has_children && !block[block.type].children) {
      block[block.type]["children"] = childBlocks.find(
        (x) => x.id === block.id,
      )?.children;
    }
    return block;
  });

  return {
    props: {
      page,
      blocks: blocksWithChildren,
    },
    revalidate: 1, //ISR...前回から何秒以内のアクセスを無視するか指定します。
  };
};
