import "prism-themes/themes/prism-vsc-dark-plus.css";

import styles from "@/styles/BlogPost.module.scss";
import Seo from "./Seo";
import { useRouter } from "next/router";

interface Meta {
  url: string;
  date: string;
  title: string;
  description: string;
}

interface BlogPostLayoutProps {
  meta: Meta;
  children: React.ReactNode;
}

export default function BlogPostLayout({
  meta,
  children,
  ...other
}: BlogPostLayoutProps) {
  const route = useRouter();
  return (
    <>
      <Seo meta={{ ...meta, url: "https://babangsund.com" + route.pathname }} />
      <article className={styles.article}>
        <header>
          <h3>{meta.title.toUpperCase()}</h3>
          <p>{meta.date}</p>
        </header>
        {children}
      </article>
    </>
  );
}
