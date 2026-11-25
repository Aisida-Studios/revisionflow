// scripts/run-node-tests.mjs
// Runs every *.test.mjs in a folder with `node --test`. A tiny wrapper so the npm scripts work the same on Windows, macOS and
// Linux and on Node 20 and 22 (shell globs are not expanded by Windows, and `node --test <folder>` differs between versions).
import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'

const dir = process.argv[2]
if (!dir) { console.error('usage: node scripts/run-node-tests.mjs <folder>'); process.exit(2) }
const files = readdirSync(dir).filter((f) => f.endsWith('.test.mjs')).map((f) => join(dir, f)).sort()
if (!files.length) { console.error(`no *.test.mjs files in ${dir}`); process.exit(1) }
const result = spawnSync(process.execPath, ['--test', ...process.argv.slice(3), ...files], { stdio: 'inherit' })
process.exit(result.status === null ? 1 : result.status)
