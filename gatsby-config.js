module.exports = {
  siteMetadata: {
    lang: "en",
    title: "babangsund",
    author: "bbangsund",
    description: "Blog, lab",
    url: "https://babangsund.com",
    github: "https://github.com/babangsund",
    twitter: "https://mobile.twitter.com/babangsund",
    stackoverflow: "https://stackoverflow.com/users/11754830/babangsund",
  },
  plugins: [
    "gatsby-plugin-react-helmet",
    "gatsby-plugin-styled-components",
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: process.env.GA_ID,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `posts`,
        path: `${__dirname}/src/blog`,
      },
    },
    {
      resolve: `gatsby-plugin-typography`,
      options: {
        pathToConfigModule: `src/utils/typography`,
      },
    },
    {
      resolve: "gatsby-mdx",
      options: {
        extensions: [".md", ".mdx", ".markdown"],
        defaultLayouts: {
          default: `${__dirname}/src/templates/Markdown.js`,
        },
      },
    },
    {
      resolve: "gatsby-plugin-manifest",
      options: {
        name: "babangsund",
        short_name: "babangsund",
        start_url: "/",
        background_color: "#1C0046",
        theme_color: "#1C0046",
        display: "standalone",
      },
    },
  ],
}
