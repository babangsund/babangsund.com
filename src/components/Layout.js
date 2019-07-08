import React from "react"
import { MDXProvider } from "@mdx-js/react"
import styled, { createGlobalStyle } from "styled-components"

import mdx from "components/mdx"
import Main from "components/Main"
import Header from "components/Header"
import Footer from "components/Footer"

import theme from "utils/theme"

const Container = styled.section`
  display: flex;
  flex-direction: column;
`

const GlobalStyle = createGlobalStyle`
  html,
  body,
  #___gatsby,
  ${Container},
  div[role="group"][tabindex] {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    background: ${theme.background};
  }
  a {
    color: inherit;
    text-decoration: none;
    &:hover {
      color: ${theme.pink};
    }
  }
`

function Layout({ children }) {
  return (
    <Container>
      <GlobalStyle />
      <Header />
      <Main>
        <MDXProvider components={mdx}>{children}</MDXProvider>
      </Main>
      <Footer />
    </Container>
  )
}

export default Layout
