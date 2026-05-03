import { FetchLink } from "./Link"

const CACHE_EXPIRE_SECONDS = import.meta.env.MODE === 'development' ? 1 : 100

export type Collection = {
    authors: string[],
    dexes: string[],
}

export type ComplexCollection = {
    authors: Author[],
    dexes: Pokedex[],
    pokemons?: Pokemon[]
}

export type Pokedex = {
    name: string,
    pokemons: Pokemon[]
}

export type ShowingPokemon = {
    link?: string,
    pokemon: Pokemon
}

export type Pokemon = {
    number: number
    name: string
    dex?: string
    sprite?: string

    forms?: Record<string, PokemonForm>
}

export type PokemonForm = {
    name: string
    sprite?: string
}

export type Author = {
    name: string,
    pokemons: Record<string, PokemonAuthorEntry>
}

type PokemonAuthorEntryBody = {
    base: string
    forms?: Record<string, string>
}

export type PokemonAuthorEntry = string | PokemonAuthorEntryBody

export type CachedData = {
    authors: Author[],
    dexes: Pokedex[],
    date: number,
    expire: number
}

function getSprite(pokemon: Pokemon, form?: string | undefined | null, author?: Author | undefined | null): string {

    const key = pokemon.name + (form ? "#" + form : '')

    if (!author) {
        if (!form)
            return pokemon.sprite ?? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.number}.png`

        return pokemon.forms![form].sprite ?? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.number}.png`
    }

    const pae = author.pokemons[pokemon.name]

    if (!form)
        return typeof pae === 'string' ? pae : pae.base

    if (form && key in author.pokemons)
        return author.pokemons[key] as string //* Para este formato el contenido debe ser un string

    console.log("pokemons" + JSON.stringify(author.pokemons))

    return (pae as PokemonAuthorEntryBody).forms![form]

}
const CACHE_KEY = 'pokemon_collections_cache'

function getCachedCollections(): CachedData | null {
    if (typeof window === 'undefined') {
        console.log('[CACHE] Window is undefined (SSR)')
        return null
    }

    try {
        console.log('[CACHE] Attempting to read cache from localStorage')
        const cached = localStorage.getItem(CACHE_KEY)
        if (!cached) {
            console.log('[CACHE] No cache found in localStorage')
            return null
        }

        console.log('[CACHE] Cache found, parsing data')
        const data = JSON.parse(cached) as CachedData
        const now = Date.now() / 1000 // segundos
        const elapsedSeconds = now - data.date

        console.log(`[CACHE] Cache date: ${data.date}, Current time: ${now}, Elapsed: ${elapsedSeconds}s, Expire: ${data.expire}s`)

        // Verificar si el caché ha expirado
        if (elapsedSeconds < data.expire) {
            console.log('[CACHE] Cache is still valid, returning cached data')
            return data
        }

        // Si expiró, eliminar del localStorage
        console.log('[CACHE] Cache has expired, removing from localStorage')
        localStorage.removeItem(CACHE_KEY)
        return null
    } catch (error) {
        console.error('[CACHE] Error reading cache:', error)
        return null
    }
}

function setCachedCollections(authors: Author[], dexes: Pokedex[], expireSeconds: number): void {
    if (typeof window === 'undefined') {
        console.log('[CACHE] Window is undefined (SSR), skipping cache save')
        return
    }

    try {
        const data: CachedData = {
            authors,
            dexes,
            date: Date.now() / 1000, // segundos
            expire: expireSeconds
        }
        console.log(`[CACHE] Saving cache with expiration: ${expireSeconds}s`)
        localStorage.setItem(CACHE_KEY, JSON.stringify(data))
        console.log(`[CACHE] Cache saved successfully. Key: ${CACHE_KEY}`)
    } catch (error) {
        console.error('[CACHE] Error setting cache:', error)
    }
}

async function getCollections(): Promise<ComplexCollection> {
    console.log('[COLLECTIONS] Getting collections...')

    // Intentar obtener del caché
    const cached = getCachedCollections()
    if (cached) {
        console.log('[COLLECTIONS] Using cached data')
        const pokemons = getPokemonList(cached.dexes)
        return {
            authors: cached.authors,
            dexes: cached.dexes,
            pokemons
        }
    }

    // Si no está en caché, hacer fetch
    const filePath = '/data/collections.json'

    const res = await FetchLink(filePath)
    if (!res.ok) {
        throw new Error()
    }

    const col = (await res.json()) as Collection

    try {
        const authorFetches = await Promise.all(col.authors.map(FetchLink))
        const authors = (await Promise.all(authorFetches.map(p => p.json()))).map(p => p as Author)

        const dexFetches = await Promise.all(col.dexes.map(FetchLink))
        const dexes = (await Promise.all(dexFetches.map(p => p.json()))).map(p => p as Pokedex)

        // Guardar en caché
        setCachedCollections(authors, dexes, CACHE_EXPIRE_SECONDS)

        const pokemons = getPokemonList(dexes)

        return {
            authors,
            dexes,
            pokemons
        }
    } catch (error) {
        console.error('[COLLECTIONS] Error fetching authors/dexes:', error)
        throw error
    }
}

function getPokemon(pokemon: string, col: ComplexCollection) {
    const filtered = col.pokemons!.filter(a => a.name.toLowerCase() === pokemon.toLowerCase())
    if (filtered?.length <= 0)
        throw new Error()

    return filtered[0]
}

function getAuthor(author: string, col: ComplexCollection) {
    const filtered = col.authors.filter(a => a.name.toLowerCase() === author.toLowerCase())

    if (filtered.length <= 0)
        throw new Error()

    return filtered[0]
}

function getPokemonList(pokedex: Pokedex[]) {
    return pokedex.map(dex => dex.pokemons.map(p => {
        return { ...p, dex: dex.name }
    })).flat()
}


export const Collections = {
    getCollections,
    getPokemonList,
    getAuthor,
    getPokemon,
    getSprite: getSprite
}
