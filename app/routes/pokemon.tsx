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
  const [isSmallImage, setIsSmallImage] = useState(false)

  const navigate = useNavigate()

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    console.log(img.naturalWidth)
    setIsSmallImage(img.naturalWidth <= 250 || img.naturalHeight <= 250)
  }

  useEffect(() => {
    async function load() {
      const pokemonName = params.pokemon
      if (!pokemonName) throw new Error('Pokemon name is required')

      const col = await Collections.getCollections()
      const pokemon = Collections.getPokemon(pokemonName, col)

      setPokemon(pokemon)

      console.log(formParam)
      console.log(pokemon.forms ? pokemon.forms[formParam ?? ''] : '')
      const form = formParam && pokemon.forms ? pokemon.forms[formParam] : undefined
      setForm(form)

      // Obtener el dex donde aparece este pokemon (solo la primera región)
      const pokemonList = Collections.getPokemonList(col.dexes)
      const pokemonFirstDex = pokemonList
        .find(p => p.name.toLowerCase() === pokemonName.toLowerCase())
        ?.dex
      if (pokemonFirstDex) setDexes([pokemonFirstDex])

      // Construir la clave para buscar en author.pokemons considerando la forma

      //TODO Comprobar que el FORM exista

      if (authorParam) {
        const author = await Collections.getAuthor(authorParam, col)

        setImage(Link(Collections.getSprite(pokemon, formParam, author)))
      } else {
        // Si no hay autor, mostrar dibujos de todos los autores que lo tengan

        setImage(Link(Collections.getSprite(pokemon, formParam, null)))

        const authorsWithThisPokemon = col.authors
          .filter(author => pokemonName in author.pokemons || pokemonName + "#" + formParam in author.pokemons)
          .map(author => ({
            author,
            image: Link(Collections.getSprite(pokemon, formParam, author))
          }))
        setAuthorsWithPokemon(authorsWithThisPokemon)
      }
    }

    load()
  }, [authorParam, params.pokemon, formParam])

  return <div className="flex flex-col items-center justify-center min-h-screen p-4">
    <div className="flex flex-col w-full max-w-400 gap-6">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 bg-white p-8 rounded-2xl border shadow-lg relative">
        <div className="flex-1">
          <div className="flex flex-row gap-4 w-fit justify-center">
            <Title
              title={capitalize(pokemon?.display ?? pokemon?.name ?? '')}
              className={authorParam ? 'hover:underline hover:cursor-pointer w-fit' : 'w-fit'}
              onClick={() => {
                if (authorParam) {
                  navigate(`/pokemon/${pokemon?.name}${BuildQuery({
                    form: formParam
                  })}`)
                }
              }}
            />
            {pokemon?.forms && <div className="w-fit">
              <Selector
                nullOption="Base"
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
              <p className="text-lg font-semibold text-red-600 hover:cursor-pointer hover:underline w-fit" onClick={() => navigate(`/dex?region=${dexes[0]}`)}>{dexes[0] ? capitalize(dexes[0]) : 'Unknown'}</p>
            </div>
            {authorParam && (
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-600 font-bold">Artista</p>
                <p className="text-lg font-semibold text-red-600 hover:cursor-pointer hover:underline w-fit" onClick={() => navigate(`/dex?author=${authorParam}`)}>{capitalize(authorParam)}</p>
              </div>
            )}
          </div>
        </div>

        {image ? (
          <div className="flex-1 flex justify-center items-center">
            <img
              className="h-96 w-auto object-contain border-4 border-red-600 rounded-lg"
              style={{ imageRendering: isSmallImage ? 'pixelated' : 'auto' }}
              src={image}
              alt={pokemon?.name}
              onLoad={handleImageLoad}
            />
          </div>
        ) : null}

        <button
          onClick={() => navigate('/dex' + BuildQuery({ author: authorParam }))}
          className="absolute bottom-4 left-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl shadow-lg transition-colors text-2xl h-10 w-10 flex items-center justify-center hover:cursor-pointer"
          aria-label="Back to Dex"
        >
          ←
        </button>
      </div>

      {!authorParam && authorsWithPokemon.length > 0 && (
        <div className="bg-red-700 p-8 rounded-2xl">
          <h2 className="text-white text-xl font-bold mb-6">Versiones de Artistas</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-8">
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
                  className="h-32 w-32 border-2 border-white rounded-lg object-cover hover:brightness-75 transition-all cursor-pointer"
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