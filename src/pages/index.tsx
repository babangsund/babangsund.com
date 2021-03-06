import React from 'react';
import styled from 'styled-components';
import {Link, graphql} from 'gatsby';

// project
import {Post} from '../global';
import Seo from '../components/Seo';
import Layout from '../components/Layout';
import {rhythm} from '../utils/typography';

const Article = styled.article`
  &:not(:first-of-type) {
    margin-top: ${rhythm(2)};
  }
  h3 {
    margin-bottom: ${rhythm(0.5)};
  }
`;

interface Edge {
  node: Post;
}

interface BlogPostProps {
  blogPost: Post;
}

interface IndexProps {
  data: {
    blog: {
      edges: Edge[];
    };
  };
}

function BlogPost({blogPost}: BlogPostProps): React.ReactElement {
  return (
    <Article>
      <h3>
        <Link to={blogPost.fields.slug}>
          {blogPost.frontmatter.title.toUpperCase()}
        </Link>
      </h3>
      <small>
        {blogPost.frontmatter.date} • {blogPost.timeToRead} minute read
      </small>
      <p>{blogPost.frontmatter.excerpt}</p>
    </Article>
  );
}

function Index({data}: IndexProps): React.ReactElement {
  const blogposts = data.blog.edges;
  return (
    <Layout>
      <Seo title="Blog by Benjamin Bangsund" />
      {blogposts.map(({node}) => (
        <BlogPost key={node.id} blogPost={node} />
      ))}
    </Layout>
  );
}

export const query = graphql`
  query IndexQuery {
    blog: allMarkdownRemark(
      sort: {order: DESC, fields: [frontmatter___date]}
      filter: {
        frontmatter: {published: {eq: true}}
        fileAbsolutePath: {regex: "//src/blog//"}
      }
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
`;

export default Index;
