import clsx from "clsx";
import Link from "next/link";
import Image from "next/image";

import styles from "@/styles/Card.module.scss";

interface CardProps {
  href: string;
  backgroundImg?: string;
  backgroundImgPriority?: boolean;
  children: React.ReactNode;
}

const externalLinkProps = {
  target: "_blank",
};

export function Card({
  href,
  children,
  backgroundImg,
  backgroundImgPriority,
}: CardProps) {
  return (
    <li
      className={clsx({
        [styles.card]: true,
        [styles.bgImg]: Boolean(backgroundImg),
      })}
    >
      {backgroundImg && (
        <Image
          alt="Image"
          width={600}
          height={300}
          src={backgroundImg}
          className={styles.image}
          priority={backgroundImgPriority}
        />
      )}
      <Link href={href} {...(href.startsWith("/") ? {} : externalLinkProps)}>
        {children}
      </Link>
    </li>
  );
}
