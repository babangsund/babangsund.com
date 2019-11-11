import React from 'react';
import Helmet from 'react-helmet';
import * as bab_sm from '../../bab_sm.png';
import {useStaticQuery, graphql} from 'gatsby';

interface Props {
  url?: string;
  title?: string;
  description?: string;
}

function SEO({
  url = '',
  title = '',
  description = '',
}: Props): React.ReactElement {
  const {site} = useStaticQuery(
    graphql`
      query SeoQuery {
        site {
          siteMetadata {
            url
            lang
            title
            author
            description
          }
        }
      }
    `
  );

  const metaUrl = site.siteMetadata.url + url;
  const metaImage = site.siteMetadata.url + bab_sm;
  const metaTitle = title || site.siteMetadata.title;
  const metaDescription = description || site.siteMetadata.description;

  return (
    <Helmet
      htmlAttributes={{
        lang: site.siteMetadata.lang,
      }}
      titleTemplate={`${site.siteMetadata.title} | %s`}
    >
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta property="author" content={site.siteMetadata.author} />
      <meta property="og=url" content={metaUrl} />
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:type" content="website" />
      <meta name="twitter:site" content="@babangsund" />
      <meta name="twitter:image" content={metaImage} />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:creator" content={site.siteMetadata.twitter} />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="image" property="og:image" content={metaImage} />
    </Helmet>
  );
}

export default SEO;
