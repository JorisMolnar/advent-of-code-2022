// @ts-check
import { AocClient } from 'advent-of-code-client'
import { config } from 'dotenv'
import fs from 'fs-extra'
import _ from 'lodash'

// Load .env
config()

if (!process.env.TOKEN) {
  console.error('ERROR: TOKEN env var must be defined.')
  process.exit(1)
}
const token = process.env.TOKEN

if (process.argv.length !== 3) {
  const scriptName = _.last(process.argv[1].split(/[/\\]/))
  console.error(`ERROR: Must be called with exactly one argument: ${scriptName} <day>`)
  process.exit(1)
}
const day = _.toNumber(process.argv[2])

/**
 * Gets input from adventofcode.com
 * @param {number} day
 * @returns {Promise<string>}
 */
async function getInput (day) {
  const client = new AocClient({
    year: 2022,
    day,
    token
  })

  const input = await client.getInput()
  return String(input)
}

/**
 * Create dir if it doesn't exist and grabs the input from adventofcode.com
 * @param {string} part
 */
async function initPart (part) {
  const dir = `day${part}`

  if (!fs.existsSync(dir)) {
    fs.copySync('template', dir)

    let appTs = fs.readFileSync(`${dir}/app.ts`, { encoding: 'utf-8' })
    appTs = appTs.replace('<<part>>', part)
    fs.writeFileSync(`${dir}/app.ts`, appTs, { encoding: 'utf-8' })
  } else {
    console.log(`Directory ${dir} already exists`)
  }

  if (!fs.existsSync(`${dir}/input.txt`)) {
    const input = await getInput(day)
    fs.writeFileSync(`${dir}/input.txt`, input, { encoding: 'utf-8' })
  } else {
    console.log(`File ${dir}/input.txt already exists`)
  }
}

function initDay () {
  initPart(`${day}a`)
    .then(() => initPart(`${day}b`))
    .then(() => {
      console.log('success')
      process.exit(0) // necessary because AocClient keeps process alive
    })
}

initDay()
