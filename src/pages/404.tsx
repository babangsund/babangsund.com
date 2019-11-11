import React from 'react';

// project
import SEO from '../components/Seo';
import Layout from '../components/Layout';

function NotFoundPage(): React.ReactNode {
  return (
    <Layout>
      <SEO title="404: Not found" />
      <h1>NOT FOUND</h1>
    </Layout>
  )
};

export default NotFoundPage;
