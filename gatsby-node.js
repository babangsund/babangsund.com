const path = require(`path`);
const {createFilePath} = require(`gatsby-source-filesystem`);

exports.onCreateWebpackConfig = ({actions}) => {
  actions.setWebpackConfig({
    resolve: {
      modules: [path.resolve(__dirname, 'src'), 'node_modules'],
      alias: {
        $utils: path.resolve(__dirname, 'src/utils'),
        $components: path.resolve(__dirname, 'src/components'),
      },
    },
  });
};

exports.onCreateNode = ({node, actions, getNode}) => {
  if (node.internal.type === 'MarkdownRemark') {
    const {createNodeField} = actions;
    const slug = createFilePath({node, getNode});

    createNodeField({
      node,
      value: slug,
      name: 'slug',
    });
  }
};

exports.createPages = async ({actions, graphql}) => {
  const {data, errors} = await graphql(`
    query GatsbyNodeQuery {
      blog: allMarkdownRemark(
        sort: {order: ASC, fields: [frontmatter___date]}
        filter: {
          frontmatter: {published: {eq: true}}
          fileAbsolutePath: {regex: "//src/blog//"}
        }
      ) {
        edges {
          node {
            id
            frontmatter {
              title
            }
            fields {
              slug
            }
          }
        }
      }
    }
  `);

  if (errors) return Promise.reject(errors);

  const blogposts = data.blog.edges;
  blogposts.forEach(({node}, index) => {
    const {createPage} = actions,
      slug = node.fields.slug,
      prev = blogposts[index - 1] && blogposts[index - 1].node,
      next = blogposts[index + 1] && blogposts[index + 1].node,
      component = path.resolve(__dirname, 'src/templates/BlogPost.tsx');

    createPage({
      component,
      path: slug,
      context: {
        slug,
        next,
        prev,
      },
    });
  });
};
