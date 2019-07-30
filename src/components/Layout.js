import React from "react"
import styled, { ThemeProvider, createGlobalStyle } from "styled-components"

import Main from "components/Main"
import Header from "components/Header"
import Footer from "components/Footer"

import code from "./code"

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
    background: ${p => p.theme.bg(13)};
  }
  a {
    text-decoration: none;
    color: ${p => p.theme.green};
    &:hover {
      color: ${p => p.theme.pink};
    }
  }
  img {
    width: 100%;
    height: auto;
    display: block;
    border-radius: 0.6em;
  }
  hr {
    background-color: ${p => p.theme.green};
  }
  blockquote {
    font-style: oblique;
    padding-left: 1.5rem;
    margin-left: -1.875rem;
    color: ${p => p.theme.purple};
    border-left: 0.275rem solid ${p => p.theme.green};
  }
  ${code};
`

function Layout({ children }) {
  return (
    <ThemeProvider theme={theme}>
      <Container>
        <GlobalStyle />
        <Header />
        <Main>{children}</Main>
        <Footer />
      </Container>
    </ThemeProvider>
  )
}

export default Layout
