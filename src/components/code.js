import { css } from "styled-components"

export default css`
  code[class*="language-"],
  pre[class*="language-"] {
    color: white;
    background: none;
    font-family: Fira Code, Consolas, Menlo, Monaco, source-code-pro,
      Courier New, monospace;
    font-feature-settings: normal;
    text-align: left;
    white-space: pre;
    word-spacing: normal;
    word-break: normal;
    word-wrap: normal;
    line-height: 1.5;
    margin-bottom: 0;

    -moz-tab-size: 4;
    -o-tab-size: 4;
    tab-size: 4;

    -webkit-hyphens: none;
    -moz-hyphens: none;
    -ms-hyphens: none;
    hyphens: none;
    color: #9effff;
  }

  /* Code blocks */
  pre[class*="language-"] {
    overflow: auto;
    padding: 1.3125rem;
  }

  pre[class*="language-"]::-moz-selection {
    /* Firefox */
    background: hsl(207, 4%, 16%);
  }

  pre[class*="language-"]::selection {
    /* Safari */
    background: hsl(207, 4%, 16%);
  }

  /* Text Selection colour */
  pre[class*="language-"]::-moz-selection,
  pre[class*="language-"] ::-moz-selection {
    text-shadow: none;
    background: hsla(0, 0%, 100%, 0.15);
  }

  pre[class*="language-"]::selection,
  pre[class*="language-"] ::selection {
    text-shadow: none;
    background: hsla(0, 0%, 100%, 0.15);
  }

  /* Inline code */
  :not(pre) > code[class*="language-"] {
    background-color: hsla(0, 0%, 100%, 0.15);
    border-radius: 0.3em;
    color: var(--inlineCode-text);
    padding: 0.2em 0.4em;
    white-space: normal;
  }

  .token.attr-name {
    color: #fad000;
    font-style: italic;
  }

  .token.comment {
    color: rgb(128, 147, 147);
  }

  .token.string,
  .token.url {
    color: #a5ff90;
  }

  .token.variable {
    color: rgb(214, 222, 235);
  }

  .token.number {
    color: rgb(247, 140, 108);
  }

  .token.builtin,
  .token.char,
  .token.constant,
  .token.function {
    color: #fb94ff;
  }

  .token.punctuation {
    color: #fff;
  }

  .token.selector,
  .token.doctype {
    color: rgb(199, 146, 234);
    font-style: "italic";
  }

  .token.class-name {
    color: #fad000;
  }

  .token.operator,
  .token.keyword {
    color: #ff9d00;
  }

  .token.operator + .token.keyword {
    color: #ff7200;
  }

  .token.tag {
    color: #9effff;
    & .token.function {
      color: #fad000;
    }
    & .token.class-name {
      color: #9effff;
    }
  }

  .token.boolean {
    color: #ff628c;
  }

  .token.template-string,
  .token.template-string > .token.string {
    color: #3ad900;
  }

  .token.interpolation {
    color: #9effff;
  }

  .token.punctuation + .token.function {
    color: #fad000;
  }

  .token.property {
    color: rgb(128, 203, 196);
  }

  .token.namespace {
    color: rgb(178, 204, 214);
  }

  pre[data-line] {
    padding: 1em 0 1em 3em;
    position: relative;
  }

  .gatsby-highlight-code-line {
    background-color: #3d0099;
    display: block;
    margin-right: -1.3125rem;
    margin-left: -1.3125rem;
    padding-right: 1em;
    padding-left: 1.25em;
    border-left: 0.25em solid #00ffaa;
  }

  .gatsby-highlight {
    margin-bottom: 1.75rem;
    border-radius: 10px;
    background: ${p => p.theme.bg(20)};
    -webkit-overflow-scrolling: touch;
    overflow: auto;
  }

  @media (max-width: 672px) {
    .gatsby-highlight {
      border-radius: 0;
    }
  }

  .gatsby-highlight pre[class*="language-"] {
    float: left;
    min-width: 100%;
  }
`
