import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { FetchLink, Link } from "~/types/Link";
import * as Types from "~/types/PokemonData";

const CollectionContext = createContext<undefined | [Types.Collection | undefined, ((col: Types.Collection) => void)]>(undefined)

export function CollectionProvider({ children }: { children: ReactNode }) {
    const [collection, setCollection] = useState<Types.Collection>()

    return (
        <CollectionContext.Provider value={[collection, setCollection]}>
            {children}
        </CollectionContext.Provider>
    )
}

export function useCollection() {
    let CACHE_EXPIRE_SECONDS = 100
    try {
        CACHE_EXPIRE_SECONDS = import.meta.env.MODE === 'development' ? 1 : 100
    } catch (e) {
        // import.meta.env no disponible en Node.js (para scripts)
        CACHE_EXPIRE_SECONDS = 100
    }


    const ctx = useContext(CollectionContext)
    if (!ctx) throw new Error('Not CollectionProvider')

    const [collection, setCol] = ctx
    const [Pokemons, setPokemons] = useState<Record<string, Types.Pokemon>>()

    //* UTILES FUNCITONS

    const CACHE_KEY = 'pokemon_collections_cache'
    function getCachedCollection(): Types.CachedData | null {

        if (typeof window === 'undefined') return null

        try {
            const cached = localStorage.getItem(CACHE_KEY)
            if (!cached) return null

            const data = JSON.parse(cached) as Types.CachedData
            const now = Date.now() / 1000
            const elapsedSeconds = now - data.date

            if (elapsedSeconds < data.expire)
                return data

            localStorage.removeItem(CACHE_KEY)
            return null
        }
        catch {
            return null
        }
    }

    function setCachedCollections(authors: Types.Author[], dexes: Types.Pokedex[], expireSeconds: number) {
        if (typeof window === 'undefined') return

        try {
            const data: Types.CachedData = {
                authors,
                dexes,
                date: Date.now() / 1000,
                expire: expireSeconds
            }

            localStorage.setItem(CACHE_KEY, JSON.stringify(data))
        } catch { }
    }

    async function updateCachedCollections() {
        const cached = getCachedCollection()

        if (cached) {
            const newCol: Types.Collection = {
                authors: cached.authors,
                dexes: cached.dexes,
            }

            setCol(newCol)
            return
        }

        await updateCollections()
    }

    async function updateCollections() {
        const filePath = '/data/collections.json'
        const res = await FetchLink(filePath)

        if (!res.ok) throw new Error(`Error while reading ${filePath}`)

        const colJson = await res.json() as Types.CollectionJSON

        try {
            const authorFetches = await Promise.all(colJson.authors.map(FetchLink))
            let authors: Types.Author[] = []
            await Promise.all(authorFetches.map(async aj => {
                const authorJson = await aj.json() as Types.AuthorJSON
                let author: Types.Author = {
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
                        }
                        else {
                            target.base = v
                        }
                    }
                    else {
                        author.pokemons[k] = v
                    }
                })

                authors.push(author)
            }))


            const dexFetches = await Promise.all(colJson.dexes.map(FetchLink))
            const dexes = await Promise.all(dexFetches.map(p => p.json() as Promise<Types.Pokedex>))

            setCachedCollections(authors, dexes, CACHE_EXPIRE_SECONDS)
            const newCol: Types.Collection = {
                authors,
                dexes,
            }
            setCol(newCol)
        } catch { }
    }

    function getSprite(pokemon: Types.AuthorEntry, form: string | undefined, baseUrl: string | undefined): string {
        var res = (baseUrl ?? '') + (form ? pokemon.forms![form] : pokemon.base ?? '')
        return res
    }


    function validateList() {
        //TODO
    }

    useEffect(() => {
        if (!collection) {
            updateCachedCollections()
                .then(validateList)
        }
    }, [])

    useEffect(() => {
        //TODO: Tener en cuenta el campo dex
        if (collection) setPokemons(collection.dexes.map(dex => dex.pokemons).reduce((acc, curr) => ({
            ...acc,
            ...curr
        }), {}))
    }, [collection])

    //* EXPORT FUNCIONES

    function GetPokemon(name?: string): Types.Pokemon | undefined {
        return name && Pokemons ? Pokemons[name] : undefined
    }

    function GetAuthor(name?: string): Types.Author | undefined {
        return name ? collection?.authors?.find(p => p.name === name) : undefined
    }

    function GetAuthorSinglePokemon(author: Types.Author | undefined, key: string): Types.AuthorEntry | undefined {
        if (!Pokemons) throw new Error()

        const pokemon = author ? author.pokemons[key] : {
            base: Pokemons[key].sprite ?? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${Pokemons[key].number}.png`,
            forms: Pokemons[key].forms ? Object.fromEntries(Object.entries(Pokemons[key].forms).map(([key, val]) =>
                ([key, val.sprite ?? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${Pokemons[key].number}.png`])))
                : undefined
        }

        if (!pokemon)
            return undefined

        return {
            base: getSprite(pokemon!, undefined, author?.base_url),
            forms: pokemon!.forms && Pokemons[key].forms ?
                Object.fromEntries(
                    Object.entries(pokemon!.forms)
                        .filter(([fkey, _]) =>
                            fkey in Pokemons[key].forms!)
                        .map(([fkey, form]) =>
                            [fkey, getSprite(pokemon!, form, author?.base_url)]))
                : undefined
        }

    }

    function GetAuthorPokemons(author: Types.Author | undefined, filter?: { name?: string, region?: string }): Record<string, Types.AuthorEntry> | undefined {
        if (!Pokemons) return undefined

        const pl = Object.fromEntries(Object.entries(Pokemons).map(([key, p]) =>
            [key, {
                forms: p.forms ? Object.fromEntries(Object.entries(p.forms).map(([key, val]) =>
                    ([key, val.sprite ?? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.number}.png`])))
                    : undefined
            }]))
        return Object.fromEntries(Object.entries(author ? author.pokemons : Pokemons)
            .filter(([key, _]) =>
                Pokemons[key] &&
                (!filter?.name || key.startsWith(filter.name) || Pokemons[key].display?.startsWith(filter.name)) &&
                (!filter?.region ||
                    !collection?.dexes ||
                    !collection.dexes.find(d => d.name === filter.region) ||
                    !collection.dexes.find(d => d.name === filter.region)?.pokemons ||
                    key in collection.dexes.find(d => d.name === filter.region)!.pokemons))

            .map(([key, pokemon]) => [key, GetAuthorSinglePokemon(author, key)!]))
    }

    function GetShowingPokemon(author: Types.Author | undefined, filter?: { name?: string, region?: string, unique?: boolean }): Types.ShowingPokemon[] {
        const pkmns = GetAuthorPokemons(author, filter)

        if (!pkmns) return []

        if (filter?.unique) {
            return Object.entries(pkmns).map(([key, pokemon]) => ({
                key,
                name: Pokemons![key].display ?? key,
                form: !pokemon.base && pokemon.forms ? Object.keys(pokemon.forms)[0] : undefined,
                link: pokemon.base ?? Object.values(pokemon.forms!)[0],
                num: Pokemons![key].number,
                author: author?.name
            })).sort((a, b) => a.num - b.num)
        }

        return []
    }

    function GetShowingSinglePokemon(key: string, form?: string, author?: Types.Author): Types.ShowingPokemon | undefined {
        if (!Pokemons) return undefined

        const pkmn = GetAuthorSinglePokemon(author, key)
        const pokemon = Pokemons?.[key]
        if (!pkmn || !pokemon) return undefined

        return {
            key,
            name: pokemon.display ?? key,
            form,
            link: form ? pkmn.forms?.[form] : pkmn.base,
            author: author?.name
        }
    }

    function GetAllShowingOf(key: string, form?: string): Types.ShowingPokemon[] | undefined {
        return collection?.authors.map(a => GetShowingSinglePokemon(key, form, a)).filter(p => !!p)
    }

    function GetDexOf(pokemon: string): Types.Pokedex | undefined {
        return collection?.dexes.find(d => pokemon in d.pokemons)
    }

    return {
        Authors: collection?.authors,
        Dexes: collection?.dexes,
        Pokemons,
        GetPokemon,
        GetAuthor,
        GetAuthorPokemons,
        GetShowingPokemon,
        GetShowingSinglePokemon,
        GetAllShowingOf,
        GetDexOf
    }
}