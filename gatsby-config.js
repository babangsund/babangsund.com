module.exports = {
  siteMetadata: {
    lang: "en",
    title: "babangsund",
    author: "bbangsund",
    description: "Blog",
    url: "https://babangsund.com",
    github: "https://github.com/babangsund",
    twitter: "https://mobile.twitter.com/babangsund",
    stackoverflow: "https://stackoverflow.com/users/11754830/babangsund",
  },
  plugins: [
    "gatsby-plugin-catch-links",
    "gatsby-plugin-react-helmet",
    "gatsby-plugin-styled-components",
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: process.env.GATSBY_GA_ID,
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
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          "gatsby-remark-copy-linked-files",
          {
            resolve: "gatsby-remark-autolink-headers",
            options: {
              offsetY: 100,
              maintainCase: true,
            },
          },
          {
            resolve: "gatsby-remark-prismjs",
            options: {
              inlineCodeMarker: "`",
            },
          },
          {
            resolve: "gatsby-remark-external-links",
            options: {
              target: "_blank",
            },
          },
        ],
      },
    },
    {
      resolve: "gatsby-plugin-manifest",
      options: {
        icon: "./bab_lg.png",
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
