#!/usr/bin/env node
// find_emoji.mjs — lists every line in src/ that contains a pictographic emoji.
//
//   node tools/illustration-swaps/find_emoji.mjs            # per-file counts, then every line
//   node tools/illustration-swaps/find_emoji.mjs --counts   # per-file counts only
//   node tools/illustration-swaps/find_emoji.mjs path/to/src
//
// "Pictographic emoji" here means the coloured pictures (🚀 📄 🔥 ⚡ ✅ ⭐ ⏱ …). Plain text symbols that
// happen to live in the same Unicode blocks (✓ ✗ ★ ☆ ✦ → •) are NOT reported: they are typography, not pictures.
// Used by INTEGRATION_GUIDE.md §8 and Appendix A. Needs only Node (already required by the app).
import fs from 'node:fs'
import path from 'node:path'

const args = process.argv.slice(2)
const countsOnly = args.includes('--counts')
const root = args.find((a) => !a.startsWith('--')) || 'src'

const PICTOGRAPHIC = /\p{Extended_Pictographic}/u
const TEXT_SYMBOLS = /^[©®™‼⁉ℹ←-⇿✓-✘★☆✦✧▪▫◻-◾♀♂♠-♨♻♾-♿✂-✒✳✴❄❇❣❤➡⤴⤵⬅-⬇〰〽㊗㊙️]$/u
// ...but keep the ones that are clearly pictures when used on their own:
const KEEP = new Set(['❄', '❤', '✂', '✈', '✉', '✏', '✒'])

const isPicture = (ch) => PICTOGRAPHIC.test(ch) && (!TEXT_SYMBOLS.test(ch) || KEEP.has(ch))

function* files(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name)
    if (e.isDirectory()) yield* files(f)
    else if (/\.(jsx?|css)$/.test(e.name)) yield f
  }
}

const perFile = new Map()
const hits = []
let total = 0
for (const f of files(root)) {
  const lines = fs.readFileSync(f, 'utf8').split('\n')
  lines.forEach((line, i) => {
    const found = [...line].filter(isPicture)
    if (found.length) {
      perFile.set(f, (perFile.get(f) || 0) + 1)
      total += 1
      hits.push(`${f}:${i + 1}: ${[...new Set(found)].join('')}   ${line.trim().slice(0, 90)}`)
    }
  })
}
for (const [f, n] of [...perFile].sort((a, b) => b[1] - a[1])) console.log(String(n).padStart(4), f)
console.log(`\n${total} line(s) in ${perFile.size} file(s)`)
if (!countsOnly) { console.log(''); hits.forEach((h) => console.log(h)) }
