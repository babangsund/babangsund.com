import React from "react"
import { Link, graphql } from "gatsby"
import styled from "styled-components"

import SEO from "components/Seo"
import Layout from "components/Layout"

import { rhythm } from "utils/typography"

const H3 = styled.h3`
  margin: ${rhythm(2, 0, 0.5)};
`

function BlogPost({ blogPost }) {
  return (
    <article>
      <H3>
        <Link to={blogPost.fields.slug}>
          {blogPost.frontmatter.title.toUpperCase()}
        </Link>
      </H3>
      <small>
        {blogPost.frontmatter.date} • {blogPost.timeToRead} minute read
      </small>
      <p>{blogPost.frontmatter.excerpt}</p>
    </article>
  )
}

function Index({ data }) {
  const blogposts = data.blog.edges
  return (
    <Layout>
      <SEO title="Blog by Benjamin Bangsund" />
      {blogposts.map(({ node }) => (
        <BlogPost key={node.id} blogPost={node} />
      ))}
    </Layout>
  )
}

export const query = graphql`
  query IndexQuery {
    blog: allMdx(
      sort: { order: DESC, fields: [frontmatter___date] }
      filter: { fileAbsolutePath: { regex: "//src/blog//" } }
    ) {
      edges {
        node {
          id
          timeToRead
          frontmatter {
            title
            excerpt
            date(formatString: "MMMM DD, YYYY")
          }
          fields {
            slug
          }
        }
      }
    }
  }
`

export default Index
