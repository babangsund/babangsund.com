import React from "react"
import styled from "styled-components"

import { rhythm } from "utils/typography"

const Container = styled.section`
  flex: 1;
  width: 100%;
  main {
    margin: 0 auto;
    max-width: 60rem;
    padding: ${rhythm(10, 2, 2.5)};
  }
`

function Main({ children }) {
  return (
    <Container>
      <main>{children}</main>
    </Container>
  )
}

export default Main
