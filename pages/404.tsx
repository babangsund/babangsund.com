import styles from "@/styles/404.module.scss";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <div className={styles.div}>
        <h2>Page not found.</h2>
        <p>
          <Link href="/">Take me to the home page.</Link>
        </p>
      </div>
    </>
  );
}
