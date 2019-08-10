import React from "react"
import styled from "styled-components"
import { useStaticQuery, graphql } from "gatsby"

import { rhythm } from "utils/typography"

const Container = styled.section`
  bottom: 0;
  z-index: 0;
  width: 100%;
  position: fixed;
  background: ${p => p.theme.bg(9)};
  footer {
    height: 230px;
    margin: 0 auto;
    max-width: 60rem;
    box-sizing: border-box;
    padding: ${rhythm(2.5, 2)};
  }
`

const A = styled.a`
  color: ${p => p.theme.purple};
`

function Footer() {
  const {
    site: {
      siteMetadata: { twitter, github, stackoverflow },
    },
  } = useStaticQuery(graphql`
    query FooterQuery {
      site {
        siteMetadata {
          github
          twitter
          stackoverflow
        }
      }
    }
  `)

  return (
    <Container>
      <footer>
        <A target="_blank" href={github} rel="noopener noreferrer">
          github
        </A>
        {" • "}
        <A target="_blank" href={twitter} rel="noopener noreferrer">
          twitter
        </A>
        {" • "}
        <A target="_blank" href={stackoverflow} rel="noopener noreferrer">
          stack overflow
        </A>
      </footer>
    </Container>
  )
}

export default Footer
