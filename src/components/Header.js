import React from "react"
import styled from "styled-components"
import { useStaticQuery, graphql, Link } from "gatsby"

import { rhythm } from "utils/typography"

const Container = styled.section`
  z-index: 1;
  width: 100%;
  display: flex;
  position: fixed;
  padding: ${p => (p.scrolling ? rhythm(1, 2) : rhythm(2.5, 2))};
  background: ${p => (p.scrolling ? p.theme.darker : "unset")};
  transition: padding 0.4s ease-in-out, background 0.4s ease-in-out;
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
    <Container scrolling={scrolling || undefined}>
      <header>
        <h1>
          <Link to="/">{site.siteMetadata.title}</Link>
        </h1>
      </header>
    </Container>
  )
}

export default Header
