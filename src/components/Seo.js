import React from "react"
import Helmet from "react-helmet"
import bab_image from "../../favicon.png"
import { useStaticQuery, graphql } from "gatsby"

function SEO({ url, title, description }) {
  const { site } = useStaticQuery(
    graphql`
      query SeoQuery {
        site {
          siteMetadata {
            url
            lang
            title
            author
            description
          }
        }
      }
    `
  )

  const metaUrl = url || site.siteMetadata.url
  const metaTitle = title || site.siteMetadata.title
  const metaDescription = description || site.siteMetadata.description

  return (
    <Helmet
      htmlAttributes={{
        lang: site.siteMetadata.lang,
      }}
      title={metaTitle}
      titleTemplate={`${site.siteMetadata.title} | %s`}
      meta={[
        {
          name: "description",
          content: metaDescription,
        },
        {
          property: "og:url",
          content: metaUrl,
        },
        {
          property: "og:title",
          content: metaTitle,
        },
        {
          property: "og:description",
          content: metaDescription,
        },
        {
          property: "og:type",
          content: "website",
        },
        {
          property: "og:image",
          content: bab_image,
        },
        {
          name: "twitter:card",
          content: "summary",
        },
        {
          name: "twitter:creator",
          content: site.siteMetadata.twitter,
        },
        {
          name: "twitter:title",
          content: metaTitle,
        },
        {
          name: "twitter:description",
          content: metaDescription,
        },
      ]}
    />
  )
}

export default SEO
