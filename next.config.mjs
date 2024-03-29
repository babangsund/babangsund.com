import path from "path";
import nextMDX from "@next/mdx";
import remarkGfm from "remark-gfm";
import rehypePrismPlus from "rehype-prism-plus";

const withMDX = nextMDX({
  extension: /\.mdx?$/,
  options: {
    // If you use remark-gfm, you'll need to use next.config.mjs
    // as the package is ESM only
    // https://github.com/remarkjs/remark-gfm#install
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypePrismPlus],
    // If you use `MDXProvider`, uncomment the following line.
    // providerImportSource: "@mdx-js/react",
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure pageExtensions to include md and mdx
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
  // Optionally, add any other Next.js config below
  reactStrictMode: true,
  sassOptions: {
    includePaths: [path.join(process.cwd(), "styles")],
  },
  async redirects() {
    return [
      {
        source: "/((?!api|_next/static|_next/image|favicon.ico|blog)):slug",
        destination: "/blog/:slug",
        permanent: true,
      },
    ];
  },
};

// Merge MDX config with Next.js config
export default withMDX(nextConfig);
