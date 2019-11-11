import React from 'react';

// project
import Layout from 'components/Layout';

type Props = {
  children: React.ReactChild
}

function Markdown({ children }: Props): React.ReactNode {
  return <Layout>{children}</Layout>;
}

export default Markdown;
