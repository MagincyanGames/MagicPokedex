import { useEffect, useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router"
import Selector from "~/components/selector"
import Title from "~/components/title"
import { Link } from "~/types/Link"
import { Collections, type Pokemon, type Author, type PokemonForm } from "~/types/PokemonData"
import { capitalize } from "~/utiles/format"
import { BuildQuery } from "~/utiles/query"

export default function PokemonView() {
  const params = useParams()
  const [searchParams] = useSearchParams()
  const authorParam = searchParams.get('author')
  const formParam = searchParams.get('form')

  const [pokemon, setPokemon] = useState<Pokemon>()
  const [form, setForm] = useState<PokemonForm>()
  const [dexes, setDexes] = useState<string[]>([])
  const [image, setImage] = useState<string>()
  const [authorsWithPokemon, setAuthorsWithPokemon] = useState<Array<{ author: Author, image: string }>>([])

  const navigate = useNavigate()

  useEffect(() => {
    async function load() {
      const pokemonName = params.pokemon
      if (!pokemonName) throw new Error('Pokemon name is required')

      const col = await Collections.getCollections()
      const pokemon = Collections.getPokemon(pokemonName, col)

      setPokemon(pokemon)

      console.log(formParam)
      console.log(pokemon.forms ? pokemon.forms[formParam ?? ''] : '')
      setForm(formParam && pokemon.forms ? pokemon.forms[formParam] : undefined)

      // Obtener el dex donde aparece este pokemon (solo la primera región)
      const pokemonList = Collections.getPokemonList(col.dexes)
      const pokemonFirstDex = pokemonList
        .find(p => p.name.toLowerCase() === pokemonName.toLowerCase())
        ?.dex
      if (pokemonFirstDex) setDexes([pokemonFirstDex])

      // Construir la clave para buscar en author.pokemons considerando la forma
      const pokemonKey = formParam ? `${pokemonName}#${formParam}` : pokemonName

      if (authorParam) {
        const author = await Collections.getAuthor(authorParam, col)
        setImage(Link(author.pokemons[pokemonKey]))
      } else {
        // Si no hay autor, mostrar dibujos de todos los autores que lo tengan
        const authorsWithThisPokemon = col.authors
          .filter(author => pokemonKey in author.pokemons)
          .map(author => ({
            author,
            image: Link(author.pokemons[pokemonKey])
          }))
        setAuthorsWithPokemon(authorsWithThisPokemon)
      }
    }

    load()
  }, [authorParam, params.pokemon, formParam])

  return <div className="flex flex-col items-center justify-center min-h-screen p-4">
    <div className="flex flex-col w-full max-w-400 gap-6">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 bg-white p-8 rounded-2xl border shadow-lg">
        <div className="flex-1">
          <div className="flex flex-row gap-4 w-fit justify-center">
            <Title
              title={capitalize(pokemon?.name ?? '')}
              className={authorParam ? 'hover:underline hover:cursor-pointer w-fit' : 'w-fit'}
              onClick={() => {
                if (authorParam) {
                  navigate(`/pokemon/${pokemon?.name}`)
                }
              }}
            />
            {pokemon?.forms && <div className="w-fit">
              <Selector
                value={formParam}
                options={Object.entries(pokemon.forms).map(f => {
                  return {
                    name: f[0],
                    display: f[1].name
                  }
                })}
                onChange={value => {
                  console.log(`Changing to form ${value}`)
                  navigate(`/pokemon/${pokemon.name}${BuildQuery({ author: authorParam, form: value })}`)
                }} />
            </div>}

          </div>
          <div className="mt-6 space-y-3">
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-600 font-bold">Pokédex #</p>
              <p className="text-3xl font-bold text-red-700">{pokemon?.number}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-600 font-bold">Región</p>
              <p className="text-lg font-semibold text-red-600">{dexes[0] ? capitalize(dexes[0]) : 'Unknown'}</p>
            </div>
            {authorParam && (
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-600 font-bold">Artista</p>
                <p className="text-lg font-semibold text-red-600 hover:cursor-pointer hover:underline w-fit" onClick={() => navigate(`/dex?author=${authorParam}`)}>{capitalize(authorParam)}</p>
              </div>
            )}
          </div>
        </div>

        {authorParam ? (
          <div className="flex-1 flex justify-center items-center">
            <img
              className="h-96 w-auto object-contain border-4 border-red-600 rounded-lg"
              src={image}
              alt={pokemon?.name}
            />
          </div>
        ) : null}
      </div>

      {!authorParam && authorsWithPokemon.length > 0 && (
        <div className="bg-red-700 p-8 rounded-2xl">
          <h2 className="text-white text-xl font-bold mb-6">Versiones de Artistas</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {authorsWithPokemon.map(({ author, image }) => (
              <div
                key={author.name}
                className="flex flex-col items-center gap-3 cursor-pointer"
                onClick={() => {
                  const url = formParam
                    ? `/pokemon/${params.pokemon}?author=${encodeURIComponent(author.name)}&form=${encodeURIComponent(formParam)}`
                    : `/pokemon/${params.pokemon}?author=${encodeURIComponent(author.name)}`
                  navigate(url)
                }}
              >
                <img
                  className="h-32 w-32 border-2 border-white rounded-lg object-cover hover:border-yellow-300 transition-colors"
                  src={image}
                  alt={`${pokemon?.name} by ${author.name}`}
                />
                <p className="text-xs font-semibold text-center text-white">{capitalize(author.name)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
}