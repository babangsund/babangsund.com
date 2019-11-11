export interface Post {
  id: string;
  html: string;
  excerpt: string;
  timeToRead: string;
  fields: {
    slug: string;
  };
  frontmatter: {
    date: string;
    title: string;
    excerpt: string;
  };
}
