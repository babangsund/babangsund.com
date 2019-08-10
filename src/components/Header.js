import React from "react"
import styled, { css } from "styled-components"
import { useStaticQuery, graphql, Link } from "gatsby"

import { rhythm } from "utils/typography"

const Container = styled.section`
  z-index: 2;
  width: 100%;
  display: flex;
  position: fixed;
  transition: padding 0.4s ease-in-out, background 0.4s ease-in-out;
  ${p =>
    !p.scrolling
      ? css`
          background: unset;
          padding: ${rhythm(2.5, 2)};
        `
      : css`
          padding: ${rhythm(1, 2)};
          background: ${p.theme.bg(9)};
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05),
            0 6px 12px rgba(0, 0, 0, 0.1);
        `}
  h1 {
    margin: 0;
    color: hsla(0, 0%, 100%, 0.95);
  }
`

function Header() {
  const { site } = useStaticQuery(graphql`
    query HeaderQuery {
      site {
        siteMetadata {
          title
        }
      }
    }
  `)

  const [scrolling, setScrolling] = React.useState(false)
  React.useEffect(() => {
    function scroll() {
      setScrolling(window.scrollY > 60 ? true : false)
    }
    window.addEventListener("scroll", scroll)
    return () => window.removeEventListener("scroll", scroll)
  }, [])

  return (
    <Container scrolling={scrolling ? "true" : undefined}>
      <header>
        <h1>
          <Link to="/">{site.siteMetadata.title}</Link>
        </h1>
      </header>
    </Container>
  )
}

export default Header
