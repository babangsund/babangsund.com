import glob from "tiny-glob";

import { Card } from "../../components/Card";
import styles from "@/styles/Blog.module.scss";

interface Meta {
  title: string;
  date: string;
  description: string;
  published: boolean;
  url: string;
}

export async function getStaticProps() {
  const fileNames = await (
    await glob("./pages/blog/*.mdx")
  ).map((f) => f.replace(/.*\//g, ""));

  const allBlogPosts = await Promise.all(
    fileNames.map(async (fileName) => {
      const f = await import("./" + fileName);
      return { ...(f as any).meta, url: fileName.replace(/\..*/g, "") } as Meta;
    })
  );

  const sortedBlogPosts = allBlogPosts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return {
    props: {
      blogPosts: sortedBlogPosts,
    },
  };
}

interface BlogProps {
  blogPosts: Meta[];
}

export default function Blog({ blogPosts }: BlogProps) {
  return (
    <ul className={styles.ul}>
      {blogPosts.map((post) => (
        <Card href={`/blog/${post.url}`} key={post.title}>
          <div className={styles.div}>
            <h4>{post.title}</h4>
            <small>{post.date}</small>
          </div>
          <p>{post.description}</p>
        </Card>
      ))}
    </ul>
  );
}
