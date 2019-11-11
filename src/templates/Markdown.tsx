import React from 'react';

// project
import Layout from '../components/Layout';

type Props = {
  children: React.ReactNode;
};

function Markdown({children}: Props): React.ReactElement {
  return <Layout>{children}</Layout>;
}

export default Markdown;
