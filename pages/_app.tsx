import Head from "next/head";
import type { AppProps } from "next/app";
import { Analytics } from "@vercel/analytics/react";
import { Nunito, Fira_Code } from "next/font/google";

import styles from "@/styles/App.module.scss";

import "@/styles/globals.scss";
import { Navigation } from "../components/Navigation";
import clsx from "clsx";
import Seo from "../components/Seo";

const mainFont = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  style: ["normal", "italic"],
});

const monoFont = Fira_Code({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal"],
  variable: "--font-mono",
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Analytics />
      <Seo
        meta={{
          url: "https://babangsund.com/",
          title: "Benjamin Bangsund's website",
          description: "Benjamin Bangsund's blog and projects",
        }}
      />
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className={clsx(mainFont.className, monoFont.variable, styles.div)}>
        <Navigation />
        <main>
          <Component {...pageProps} />
        </main>
      </div>
    </>
  );
}
