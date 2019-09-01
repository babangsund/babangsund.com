import React from "react"
import Helmet from "react-helmet"
import bab_image from "../../favicon.png"
import { useStaticQuery, graphql } from "gatsby"

function SEO({ url = "", title = "", description = "" }) {
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

  const metaUrl = site.siteMetadata.url + url
  const metaTitle = title || site.siteMetadata.title
  const metaDescription = description || site.siteMetadata.description

  return (
    <Helmet
      htmlAttributes={{
        lang: site.siteMetadata.lang,
      }}
      titleTemplate={`${site.siteMetadata.title} | %s`}
    >
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta property="og=url" content={metaUrl} />
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={site.siteMetadata.url + bab_image} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:creator" content={site.siteMetadata.twitter} />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={metaDescription} />
    </Helmet>
  )
}

export default SEO
