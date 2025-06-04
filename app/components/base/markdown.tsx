import ReactMarkdown from 'react-markdown'
import 'katex/dist/katex.min.css'
import RemarkMath from 'remark-math'
import RemarkBreaks from 'remark-breaks'
import RehypeKatex from 'rehype-katex'
import RemarkGfm from 'remark-gfm'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { atelierHeathLight } from 'react-syntax-highlighter/dist/esm/styles/hljs'

export function Markdown(props: { content: string }) {
  return (
    <div className='markdown-body'>
      <ReactMarkdown
        remarkPlugins={[RemarkMath, RemarkGfm, RemarkBreaks]}
        rehypePlugins={[RehypeKatex]}
        components={{
          code({ className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '')
            const isInline = !match
            return !isInline ? (
              <SyntaxHighlighter
                children={String(children).replace(/\n$/, '')}
                style={atelierHeathLight}
                language={match[1]}
                showLineNumbers
                PreTag='div'
              />
            ) : (
              <code className={className}>
                {children}
              </code>
            )
          },
          a({ children, ...props }: any) {
            return (
              <a {...props} target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            )
          },
        }}
      >
        {props.content}
      </ReactMarkdown>
    </div>
  )
}
