import React from "react"
import styled from "styled-components"
import theme from "prism-react-renderer/themes/shadesOfPurple"
import Highlight, { defaultProps } from "prism-react-renderer"

import { rhythm } from "utils/typography"

const Wrapper = styled.div`
  overflow: auto;
`
const Pre = styled.pre`
  min-width: 100%;
  overflow: initial;
  border-radius: 12px;
  padding: ${rhythm(0.875)};
`

function Code({ children, className = "javascript" }) {
  const language = className.replace(/language-/, "")
  return (
    <Highlight
      {...defaultProps}
      theme={theme}
      code={children}
      language={language}
    >
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <Wrapper>
          <Pre className={className} style={style}>
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line, key: i })}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token, key })} />
                ))}
              </div>
            ))}
          </Pre>
        </Wrapper>
      )}
    </Highlight>
  )
}

export default Code
