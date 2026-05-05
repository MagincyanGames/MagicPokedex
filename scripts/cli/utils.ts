import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = join(fileURLToPath(import.meta.url), '..')
const PUBLIC_DIR = join(__dirname, '../../public/data')
const DEXES_DIR = join(PUBLIC_DIR, 'dexes')

export interface Pokemon {
  number: number
  name: string
  display?: string
  dex?: string
  sprite?: string
  forms?: Record<string, PokemonForm>
}

export interface PokemonForm {
  name: string
  sprite?: string
}

export interface Pokedex {
  $schema: string
  name: string
  gen: string
  pokemons: Pokemon[]
}

/**
 * Gets the list of available dexes
 */
export function getAvailableDexes(): string[] {
  const files = readdirSync(DEXES_DIR)
  return files
    .filter((f: string) => f.endsWith('.json'))
    .map((f: string) => f.replace('.json', ''))
}

/**
 * Lee un dex JSON
 */
export function readDex(dexName: string): Pokedex {
  const path = join(DEXES_DIR, `${dexName}.json`)
  const content = readFileSync(path, 'utf-8')
  return JSON.parse(content)
}

/**
 * Guarda un dex JSON
 */
export function saveDex(dexName: string, data: Pokedex): void {
  const path = join(DEXES_DIR, `${dexName}.json`)
  writeFileSync(path, JSON.stringify(data, null, 4) + '\n', 'utf-8')
}

/**
 * Validates that a Pokémon number doesn't already exist in the dex
 */
export function pokemonNumberExists(dex: Pokedex, number: number): boolean {
  return dex.pokemons.some((p) => p.number === number)
}

/**
 * Validates that a Pokémon name doesn't already exist in the dex
 */
export function pokemonNameExists(dex: Pokedex, name: string): boolean {
  return dex.pokemons.some((p) => p.name.toLowerCase() === name.toLowerCase())
}

/**
 * Gets the next available Pokémon number
 */
export function getNextPokemonNumber(dex: Pokedex): number {
  if (dex.pokemons.length === 0) return 1
  const numbers = dex.pokemons.map((p) => p.number)
  return Math.max(...numbers) + 1
}

/**
 * Adds a Pokémon to the dex, maintaining order by number
 */
export function addPokemonToDex(dex: Pokedex, pokemon: Pokemon): void {
  dex.pokemons.push(pokemon)
  dex.pokemons.sort((a, b) => a.number - b.number)
}
