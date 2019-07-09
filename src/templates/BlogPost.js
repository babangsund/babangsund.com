import React from "react"
import { graphql, Link } from "gatsby"
import styled from "styled-components"

import Layout from "components/Layout"
import { rhythm } from "utils/typography"

const H3 = styled.h3`
  margin: ${rhythm(0, 0, 0.25)};
`

function BlogPost({ data, location, pageContext }) {
  const { post } = data,
    { prev, next } = pageContext

  return (
    <Layout location={location}>
      <article>
        <header>
          <H3>{post.frontmatter.title.toUpperCase()}</H3>
          <p>
            {post.frontmatter.date} • {post.timeToRead} minute read
          </p>
        </header>
        <div dangerouslySetInnerHTML={{ __html: post.html }} />
        <div style={{ display: "flex" }}>
          {prev && (
            <Link to={prev.fields.slug}>← {prev.frontmatter.title}</Link>
          )}
          <div style={{ flex: 1 }} />
          {next && (
            <Link to={next.fields.slug}>{next.frontmatter.title} →</Link>
          )}
        </div>
      </article>
    </Layout>
  )
}

export const query = graphql`
  fragment BlogPost on MarkdownRemark {
    html
    timeToRead
    frontmatter {
      title
      date(formatString: "MMMM DD, YYYY")
    }
  }
  query BlogPostQuery($slug: String!) {
    post: markdownRemark(fields: { slug: { eq: $slug } }) {
      ...BlogPost
    }
  }
`

export default BlogPost
