import clsx from "clsx";
import Link from "next/link";
import { useRouter } from "next/router";

import { Social } from "./Social/Social";
import styles from "@/styles/Navigation.module.scss";

export function Navigation() {
  const route = useRouter();
  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <ul className={styles.ul}>
          <li className={styles.li}>
            <h4>babangsund</h4>
          </li>
          <li
            className={clsx({
              [styles.li]: true,
              [styles.active]: route.pathname === "/",
            })}
          >
            <Link href="/">Projects</Link>
          </li>
          <li
            className={clsx({
              [styles.li]: true,
              [styles.active]: route.pathname.startsWith("/blog"),
            })}
          >
            <Link href="/blog">Blog</Link>
          </li>
          <li className={styles.li}>
            <Social />
          </li>
        </ul>
      </nav>
    </header>
  );
}
