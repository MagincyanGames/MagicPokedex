import { Collections, type ValidationError } from "../app/types/PokemonData.js"
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')

const originalFetch = global.fetch as typeof fetch
global.fetch = async (resource: any, init?: any) => {
  let url = resource
  if (typeof resource === 'string') {
    if (resource.startsWith('/')) {
      url = `file://${path.resolve(projectRoot, 'public', resource)}`
    } else if (!resource.startsWith('http')) {
      url = `file://${path.resolve(projectRoot, 'public', resource)}`
    }
  }
  
  if (typeof url === 'string' && url.startsWith('file://')) {
    const filePath = url.replace('file://', '')
    try {
      const content = fs.readFileSync(filePath, 'utf-8')
      return new Response(content, {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    } catch (error) {
      return new Response('Not Found', { status: 404 })
    }
  }
  
  return originalFetch(url, init)
}

async function main() {
  try {
    const complexCol = await Collections.getCollections()

    const allErrors: ValidationError[] = []

    for (const author of complexCol.authors) {
      const errors = Collections.validateList(author, complexCol.pokemons)
      allErrors.push(...errors)
    }

    const uniqueMissingPokemon = new Set<string>()
    
    allErrors.forEach(error => {
      if (error.form) {
        uniqueMissingPokemon.add(`${error.pokemon}#${error.form}`)
      } else {
        uniqueMissingPokemon.add(error.pokemon)
      }
    })

    const sortedMissing = Array.from(uniqueMissingPokemon).sort((a, b) => {
      const nameA = a.split('#')[0].toLowerCase()
      const nameB = b.split('#')[0].toLowerCase()
      
      if (nameA !== nameB) {
        return nameA.localeCompare(nameB)
      }
      
      return a.localeCompare(b)
    })

    sortedMissing.forEach(pokemon => {
      console.log(pokemon)
    })

  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

main()
