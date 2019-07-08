import React from "react"
import Code from "./Code"

function preToCode(preProps) {
  if (
    preProps.children &&
    preProps.children.props &&
    preProps.children.props.mdxType === "code"
  ) {
    const { children, ...props } = preProps.children.props
    return {
      children,
      ...props,
    }
  }
}

export default {
  wrapper: props => props.children,
  pre: props => {
    const code = preToCode(props)
    if (code) return <Code {...code} />
    else return <pre {...props} />
  },
}
