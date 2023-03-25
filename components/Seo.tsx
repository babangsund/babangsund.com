import Head from "next/head";

interface Meta {
  url: string;
  title: string;
  description: string;
}

interface SeoProps {
  meta: Meta;
}

export default function Seo({ meta }: SeoProps) {
  return (
    <Head>
      <title>{meta.title}</title>
      <meta name="description" content={meta.title} />
      <meta property="author" content="Benjamin Bangsund" />
      <meta property="og:url" content={meta.url} />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:type" content="website" />
      <meta name="twitter:site" content="@babangsund" />
      {/* <meta name="twitter:image" content={meta.image} /> */}
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:creator" content="@babangsund" />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      {/* <meta name="image" property="og:image" content={metaImage} /> */}
    </Head>
  );
}
