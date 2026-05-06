import type { SignatureHelpTriggerCharacter } from "typescript"
import { FetchLink, Link } from "./Link"

export type CollectionJSON = {
    authors: string[],
    dexes: string[],
}

export type Collection = {
    authors: Author[],
    dexes: Pokedex[],
}

export type Pokedex = {
    name: string,
    pokemons: Record<string, Pokemon>
}

export type ShowingPokemon = {
    key: string
    name: string
    form?: string
    link?: string
    author?: string
}

export type Pokemon = {
    number: number
    sprite?: string
    evolves?: Record<string, string>
    display?: string
    forms?: Record<string, PokemonForm>
}

export type PokemonForm = {
    name: string
    sprite?: string
}

export type Author = {
    name: string,
    base_url: string,
    pokemons: Record<string, AuthorEntry>
}

export type AuthorJSON = {
    name: string,
    base_url: string,
    pokemons: Record<string, AuthorEntryJSON>
}


export type AuthorEntry = {
    base?: string
    forms?: Record<string, string>
}

export type AuthorEntryJSON = string | AuthorEntry


export type ValidationError = {
    pokemon: string
    form?: string
}

export type CachedData = {
    authors: Author[],
    dexes: Pokedex[],
    date: number,
    expire: number
}