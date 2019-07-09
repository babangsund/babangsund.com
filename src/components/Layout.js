import React from "react"
import { MDXProvider } from "@mdx-js/react"
import styled, { ThemeProvider, createGlobalStyle } from "styled-components"

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
    background: ${p => p.theme.darkest};
  }
  a {
    color: inherit;
    text-decoration: none;
    &:hover {
      color: ${p => p.theme.pink};
    }
  }
  hr {
    background-color: ${p => p.theme.green};
  }
  blockquote {
    font-style: oblique;
    padding-left: 1.5rem;
    margin-left: -1.875rem;
    color: ${p => p.theme.purple};
    border-left: 0.375rem solid ${p => p.theme.green};
  }
`

function Layout({ children }) {
  return (
    <ThemeProvider theme={theme}>
      <Container>
        <GlobalStyle />
        <Header />
        <Main>
          <MDXProvider components={mdx}>{children}</MDXProvider>
        </Main>
        <Footer />
      </Container>
    </ThemeProvider>
  )
}

export default Layout
