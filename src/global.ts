export interface Post {
  html: string;
  excerpt: string;
  timeToRead: string;
  fields: {
    slug: string;
  };
  frontmatter: {
    date: string;
    title: string;
  };
}
