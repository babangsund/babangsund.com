import React from "react"
import { graphql, Link } from "gatsby"
import styled from "styled-components"
import MDXRenderer from "gatsby-mdx/mdx-renderer"

import Layout from "components/Layout"
import { rhythm } from "utils/typography"

const H3 = styled.h3`
  margin: ${rhythm(0, 0, 0.25)};
`

function BlogPost({ data, location, pageContext }) {
  const { mdx } = data,
    { prev, next } = pageContext

  return (
    <Layout location={location}>
      <H3>{mdx.frontmatter.title.toUpperCase()}</H3>
      <p>
        {mdx.frontmatter.date} • {mdx.timeToRead} minute read
      </p>
      <MDXRenderer>{mdx.code.body}</MDXRenderer>
      <div style={{ display: "flex" }}>
        {prev && <Link to={prev.fields.slug}>{prev.frontmatter.title}</Link>}
        <div style={{ flex: 1 }} />
        {next && <Link to={next.fields.slug}>{next.frontmatter.title}</Link>}
      </div>
    </Layout>
  )
}

export const query = graphql`
  fragment BlogPost on Mdx {
    timeToRead
    frontmatter {
      title
      date(formatString: "MMMM DD, YYYY")
    }
    code {
      body
    }
  }
  query BlogPostQuery($slug: String!) {
    mdx(fields: { slug: { eq: $slug } }) {
      ...BlogPost
    }
  }
`

export default BlogPost
