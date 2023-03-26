import Link from "next/link";
import Image from "next/image";

import github from "./github.svg";
import twitter from "./twitter.svg";
import linkedIn from "./linkedIn.svg";
import styles from "@/styles/Social.module.scss";

const socials = [
  {
    src: linkedIn,
    label: "LinkedIn",
    className: styles.linkedIn,
    href: "https://linkedin.com/in/babangsund",
  },
  {
    src: twitter,
    label: "Twitter",
    className: styles.twitter,
    href: "https://twitter.com/babangsund",
  },
  {
    src: github,
    label: "Github",
    className: styles.github,
    href: "https://github.com/babangsund",
  },
];

export function Social() {
  return (
    <ul className={styles.social}>
      {socials.map(({ src, href, label, className }) => (
        <li key={label}>
          <Link
            href={href}
            target="_blank"
            rel="noreferrer"
            className={styles.link}
          >
            <Image
              priority
              src={src}
              width={24}
              height={24}
              alt={label}
              className={className}
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}
