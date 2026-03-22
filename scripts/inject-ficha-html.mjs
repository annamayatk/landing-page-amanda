/**
 * Gera `dist/ficha-inicial.html` a partir do `dist/index.html` já processado pelo Vite,
 * com meta/título específicos para pré-visualização (WhatsApp) ao partilhar /ficha-inicial.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const indexPath = join(root, 'dist', 'index.html')
const outPath = join(root, 'dist', 'ficha-inicial.html')

const TITLE = 'Consultoria Esportiva: Amanda Atkinson - Anamnese'
const DESC = 'Ficha de anamnese — Consultoria Esportiva: Amanda Atkinson.'
const URL = 'https://atkinsonpersonal.com/ficha-inicial'

let html = readFileSync(indexPath, 'utf8')

html = html.replace(/<title>[^<]*<\/title>/, `<title>${TITLE}</title>`)
html = html.replace(
  /(<meta\s+name="description"\s+content=")[^"]*(")/,
  `$1${DESC}$2`,
)
html = html.replace(
  /(<meta\s+property="og:title"\s+content=")[^"]*(")/,
  `$1${TITLE}$2`,
)
html = html.replace(
  /(<meta\s+property="og:description"\s+content=")[^"]*(")/,
  `$1${DESC}$2`,
)
html = html.replace(
  /(<meta\s+property="og:url"\s+content=")[^"]*(")/,
  `$1${URL}$2`,
)
html = html.replace(
  /(<meta\s+name="twitter:title"\s+content=")[^"]*(")/,
  `$1${TITLE}$2`,
)

writeFileSync(outPath, html, 'utf8')
console.log('scripts/inject-ficha-html.mjs: wrote dist/ficha-inicial.html')
