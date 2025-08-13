"use client"

import { useMemo, useState } from "react"
import type { JSX } from "react"
import { Check, Copy } from "lucide-react"

interface MessageContentProps {
  content: string
  isUser: boolean
}

function CopyButton({ code, isUser }: { code: string; isUser: boolean }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy code:", err)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className={`p-1.5 rounded transition-colors ${
        isUser
          ? "hover:bg-purple-600 text-purple-200 hover:text-white"
          : "hover:bg-gray-300 text-gray-500 hover:text-gray-700"
      }`}
      title={copied ? "Copied!" : "Copy code"}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  )
}

export default function MessageContent({ content, isUser }: MessageContentProps) {
  const formattedContent = useMemo(() => {
    // Split content by code blocks first
    const parts = content.split(/(```[\s\S]*?```)/g)

    return parts.map((part, index) => {
      // Handle code blocks
      if (part.startsWith("```") && part.endsWith("```")) {
        const codeContent = part.slice(3, -3)
        const lines = codeContent.split("\n")
        const language = lines[0].trim()
        const code = lines.slice(1).join("\n")

        return (
          <div key={index} className={`my-3 rounded-lg overflow-hidden ${isUser ? "bg-purple-700" : "bg-gray-100"}`}>
            <div className={`px-3 py-2 flex items-center justify-between ${isUser ? "bg-purple-800" : "bg-gray-200"}`}>
              <span className={`text-xs font-medium ${isUser ? "text-purple-200" : "text-gray-600"}`}>
                {language || "code"}
              </span>
              <CopyButton code={code} isUser={isUser} />
            </div>
            <pre className={`p-3 overflow-x-auto text-sm ${isUser ? "text-purple-100" : "text-gray-800"}`}>
              <code>{code}</code>
            </pre>
          </div>
        )
      }

      const lines = part.split("\n")
      const processedLines: JSX.Element[] = []
      let tableRows: string[] = []
      let inTable = false

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]

        // Handle table rows
        if (line.includes("|") && line.split("|").length > 2) {
          // Skip separator lines with dashes
          if (line.match(/^[\s\-|:]+$/)) {
            continue
          }

          tableRows.push(line)
          inTable = true
          continue
        } else if (inTable && tableRows.length > 0) {
          // End of table, render it
          const tableElement = (
            <div key={`table-${processedLines.length}`} className="overflow-x-auto my-4">
              <table
                className={`min-w-full border-collapse border ${isUser ? "border-purple-400" : "border-gray-300"}`}
              >
                <tbody>
                  {tableRows.map((row, rowIndex) => {
                    const cells = row
                      .split("|")
                      .map((cell) => cell.trim())
                      .filter((cell) => cell)
                    const isHeader = rowIndex === 0

                    return (
                      <tr key={rowIndex}>
                        {cells.map((cell, cellIndex) => {
                          const Tag = isHeader ? "th" : "td"
                          const cleanCell = cell.replace(/\*\*/g, "")
                          return (
                            <Tag
                              key={cellIndex}
                              className={`border px-3 py-2 text-left ${
                                isUser
                                  ? "border-purple-400 " + (isHeader ? "bg-purple-700 font-semibold" : "bg-purple-600")
                                  : "border-gray-300 " +
                                    (isHeader ? "bg-gray-100 font-semibold text-gray-900" : "bg-white text-gray-800")
                              }`}
                            >
                              {cleanCell}
                            </Tag>
                          )
                        })}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )
          processedLines.push(tableElement)
          tableRows = []
          inTable = false
        }

        // Handle headers - fix the ### issue
        if (line.startsWith("### ")) {
          processedLines.push(
            <h3
              key={`h3-${processedLines.length}`}
              className={`text-base font-bold mt-3 mb-2 ${isUser ? "text-white" : "text-gray-900"}`}
            >
              {line.slice(4)}
            </h3>,
          )
          continue
        }

        if (line.startsWith("## ")) {
          processedLines.push(
            <h2
              key={`h2-${processedLines.length}`}
              className={`text-lg font-bold mt-3 mb-2 ${isUser ? "text-white" : "text-gray-900"}`}
            >
              {line.slice(3)}
            </h2>,
          )
          continue
        }

        if (line.startsWith("# ")) {
          processedLines.push(
            <h1
              key={`h1-${processedLines.length}`}
              className={`text-xl font-bold mt-4 mb-2 ${isUser ? "text-white" : "text-gray-900"}`}
            >
              {line.slice(2)}
            </h1>,
          )
          continue
        }

        // Handle lists
        if (line.match(/^\d+\.\s/) || line.startsWith("- ") || line.startsWith("* ")) {
          const listContent = line.replace(/^\d+\.\s|^[-*]\s/, "")
          const formattedContent = listContent.replace(/\*\*(.*?)\*\*/g, `<strong>$1</strong>`)

          processedLines.push(
            <div
              key={`list-${processedLines.length}`}
              className={`flex items-start space-x-2 my-1 ${isUser ? "text-white" : "text-gray-800"}`}
            >
              <span className="flex-shrink-0 mt-1">•</span>
              <span dangerouslySetInnerHTML={{ __html: formattedContent }} />
            </div>,
          )
          continue
        }

        // Handle regular paragraphs
        if (line.trim()) {
          const formattedLine = line
            .replace(/\*\*(.*?)\*\*/g, `<strong>$1</strong>`)
            .replace(/\*(.*?)\*/g, `<em>$1</em>`)

          processedLines.push(
            <p
              key={`p-${processedLines.length}`}
              className={`${isUser ? "text-white" : "text-gray-800"} leading-relaxed my-1`}
              dangerouslySetInnerHTML={{ __html: formattedLine }}
            />,
          )
        } else {
          processedLines.push(<br key={`br-${processedLines.length}`} />)
        }
      }

      // Handle any remaining table at the end
      if (inTable && tableRows.length > 0) {
        const tableElement = (
          <div key={`table-end-${processedLines.length}`} className="overflow-x-auto my-4">
            <table className={`min-w-full border-collapse border ${isUser ? "border-purple-400" : "border-gray-300"}`}>
              <tbody>
                {tableRows.map((row, rowIndex) => {
                  const cells = row
                    .split("|")
                    .map((cell) => cell.trim())
                    .filter((cell) => cell)
                  const isHeader = rowIndex === 0

                  return (
                    <tr key={rowIndex}>
                      {cells.map((cell, cellIndex) => {
                        const Tag = isHeader ? "th" : "td"
                        const cleanCell = cell.replace(/\*\*/g, "")
                        return (
                          <Tag
                            key={cellIndex}
                            className={`border px-3 py-2 text-left ${
                              isUser
                                ? "border-purple-400 " + (isHeader ? "bg-purple-700 font-semibold" : "bg-purple-600")
                                : "border-gray-300 " +
                                  (isHeader ? "bg-gray-100 font-semibold text-gray-900" : "bg-white text-gray-800")
                            }`}
                          >
                            {cleanCell}
                          </Tag>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )
        processedLines.push(tableElement)
      }

      return <div key={index}>{processedLines}</div>
    })
  }, [content, isUser])

  return <div className="space-y-1">{formattedContent}</div>
}
