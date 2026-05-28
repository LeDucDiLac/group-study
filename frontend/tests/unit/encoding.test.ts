import { describe, expect, it } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const sourceRoot = join(process.cwd(), 'src')
const scannedExtensions = new Set(['.ts', '.tsx', '.css'])
const mojibakePatterns = [
  /[\u00c2\u00c3\u00c4\u00c6]./,
  /\u00e1[\u00ba\u00bb]./,
  /\u00e2\u20ac./,
  /\u00c3[\u00a0-\u00bf]/,
]

function collectFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const filePath = join(dir, name)
    if (statSync(filePath).isDirectory()) return collectFiles(filePath)
    return scannedExtensions.has(filePath.slice(filePath.lastIndexOf('.'))) ? [filePath] : []
  })
}

describe('Vietnamese source text encoding', () => {
  it('does not contain mojibake sequences in source files', () => {
    const offenders = collectFiles(sourceRoot).flatMap((filePath) => {
      const content = readFileSync(filePath, 'utf8')
      const lines = content.split(/\r?\n/)
      return lines.flatMap((line, index) => {
        const matched = mojibakePatterns.some((pattern) => pattern.test(line))
        return matched ? [`${relative(process.cwd(), filePath)}:${index + 1}: ${line.trim()}`] : []
      })
    })

    expect(offenders, offenders.join('\n')).toEqual([])
  })
})
