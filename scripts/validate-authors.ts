import type { CollectionJSON, Collection, Author, AuthorJSON, Pokedex, AuthorEntry, AuthorEntryJSON } from "../app/types/PokemonData.js"
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')

async function loadJsonFile(filePath: string): Promise<any> {
  // Si es una URL remota, fetchearla
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    const response = await fetch(filePath)
    if (!response.ok) {
      throw new Error(`Error fetching ${filePath}: ${response.statusText}`)
    }
    return response.json()
  }

  // Si es una ruta local
  const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath
  const fullPath = path.resolve(projectRoot, 'public', cleanPath)
  const content = fs.readFileSync(fullPath, 'utf-8')
  return JSON.parse(content)
}

function parseAuthorJson(authorJson: AuthorJSON): Author {
  const author: Author = {
    name: authorJson.name,
    base_url: authorJson.base_url,
    pokemons: {}
  }

  Object.entries(authorJson.pokemons).forEach(([k, v]) => {
    if (typeof v === 'string') {
      const stroke = k.split('#')
      const name = stroke[0]
      const form = stroke.length > 1 ? stroke[1] : undefined

      const target = (author.pokemons[name] ??= {
        base: undefined,
        forms: {}
      })

      if (form) {
        target.forms![form] = v
      } else {
        target.base = v
      }
    } else {
      author.pokemons[k] = v
    }
  })

  return author
}

async function loadCollection(): Promise<Collection> {
  const collectionJson = await loadJsonFile('/data/collections.json') as CollectionJSON

  const authors: Author[] = await Promise.all(
    collectionJson.authors.map(async (authorPath) => {
      const authorJson = await loadJsonFile(authorPath) as AuthorJSON
      return parseAuthorJson(authorJson)
    })
  )

  const dexes: Pokedex[] = await Promise.all(
    collectionJson.dexes.map(async (dexPath) => {
      return loadJsonFile(dexPath) as Promise<Pokedex>
    })
  )

  return { authors, dexes }
}

async function main() {
  try {
    const collection = await loadCollection()

    // Crear un set de todos los pokémon que existen en los dexes
    const allDexPokemons = new Set<string>()
    collection.dexes.forEach(dex => {
      Object.keys(dex.pokemons).forEach(pokemonName => {
        allDexPokemons.add(pokemonName)
      })
    })

    // Validar que todos los pokémon de los autores existan en los dexes
    const uniqueMissingPokemon = new Set<string>()

    collection.authors.forEach(author => {
      Object.entries(author.pokemons).forEach(([pokemonName, entry]) => {
        if (!allDexPokemons.has(pokemonName)) {
          uniqueMissingPokemon.add(pokemonName)
        } else if (entry.forms) {
          // Verificar que todas las formas del autor existan en el dex
          let dexPokemon: Pokedex['pokemons'][string] | undefined
          
          for (const dex of collection.dexes) {
            if (pokemonName in dex.pokemons) {
              dexPokemon = dex.pokemons[pokemonName]
              break
            }
          }
          
          if (dexPokemon) {
            Object.keys(entry.forms).forEach(formName => {
              if (!dexPokemon!.forms || !(formName in dexPokemon!.forms)) {
                uniqueMissingPokemon.add(`${pokemonName}#${formName}`)
              }
            })
          }
        }
      })
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
