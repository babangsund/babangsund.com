import React from "react"
import styled from "styled-components"
import { useStaticQuery, graphql } from "gatsby"

import { rhythm } from "utils/typography"

const Container = styled.section`
  width: 100%;
  footer {
    margin: 0 auto;
    max-width: 60rem;
    box-sizing: border-box;
    padding: ${rhythm(2.5, 2)};
  }
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
        <a target="_blank" href={github} rel="noopener noreferrer">
          github
        </a>
        {" • "}
        <a target="_blank" href={twitter} rel="noopener noreferrer">
          twitter
        </a>
        {" • "}
        <a target="_blank" href={stackoverflow} rel="noopener noreferrer">
          stack overflow
        </a>
      </footer>
    </Container>
  )
}

export default Footer
