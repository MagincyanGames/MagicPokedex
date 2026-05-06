import { useEffect, useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router"
import Selector from "~/components/selector"
import Title from "~/components/title"
import { useCollection } from "~/providers/CollectionProvider"
import { Link } from "~/types/Link"
import type { Pokedex, Author, Pokemon, PokemonForm, ShowingPokemon } from "~/types/PokemonData"
import { capitalize } from "~/utiles/format"
import { BuildQuery } from "~/utiles/query"

export default function PokemonView() {
  const params = useParams()
  const { Pokemons, GetPokemon, GetShowingSinglePokemon, GetAllShowingOf, GetAuthor, GetDexOf } = useCollection()
  const [searchParams] = useSearchParams()
  const query = { author: searchParams.get('author'), form: searchParams.get('form') }

  const [author, setAuthor] = useState<Author>()

  const pokemonName = params.pokemon
  const [pokemon, setPokemon] = useState<Pokemon>()
  const [showingPokemon, setShowingPokemon] = useState<ShowingPokemon>()

  const [form, setForm] = useState<PokemonForm>()
  const [dex, setDex] = useState<Pokedex>()

  const [evolution, setEvolutions] = useState<[Pokemon, string][]>()
  const [image, setImage] = useState<string>()
  const [authorsWithPokemon, setAuthorsWithPokemon] = useState<Array<ShowingPokemon>>([])
  const [isSmallImage, setIsSmallImage] = useState(false)

  const navigate = useNavigate()

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    console.log(img.naturalWidth)
    setIsSmallImage(img.naturalWidth <= 250 || img.naturalHeight <= 250)
  }

  useEffect(() => {
    async function load() {
      if (!pokemonName) throw new Error('Pokemon name is required')

      const pokemon = GetPokemon(pokemonName)
      console.log(pokemon)
      setPokemon(pokemon)

      if (!pokemon) return

      if (pokemon.evolves)
        //! no se está comprobando en ningún momento que la evolución exista
        setEvolutions(Object.keys(pokemon.evolves).map(p => [GetPokemon(p)!, pokemon.evolves![p]]))
      else setEvolutions([])

      const form = query.form && pokemon.forms ? pokemon.forms[query.form] : undefined
      setForm(form)
      setDex(GetDexOf(pokemonName))

      //TODO Comprobar que el FORM exista

      const author = GetAuthor(query.author ?? undefined)
      setAuthor(author)
      setShowingPokemon(GetShowingSinglePokemon(pokemonName, query.form ?? undefined, author))
    }

    load()
  }, [Pokemons, query.author, pokemonName, query.form])

  useEffect(() => {
    setImage(Link(showingPokemon?.link ?? ''))

    if (!author && pokemonName) {
      setAuthorsWithPokemon(GetAllShowingOf(pokemonName) ?? [])
    }
  }, [author, showingPokemon])

  return <div className="flex flex-col items-center justify-center min-h-screen p-4">
    <div className="flex flex-col w-full max-w-400 gap-6">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 bg-white p-8 rounded-2xl border shadow-lg relative min-h-80">
        <div className="flex-1">
          <div className="flex flex-row gap-4 w-fit justify-center">
            <Title
              title={capitalize(pokemon?.display ?? pokemonName ?? '')}
              className={query.author ? 'hover:underline hover:cursor-pointer w-fit' : 'w-fit'}
              onClick={() => {
                if (query.author) {
                  navigate(`/pokemon/${pokemonName}${BuildQuery({
                    form: query.form
                  })}`)
                }
              }}
            />
            {pokemon?.forms && <div className="w-fit">
              <Selector
                nullOption="Base"
                value={query.form}
                options={Object.entries(pokemon.forms).map(f => {
                  return {
                    name: f[0],
                    display: f[1].name
                  }
                })}
                onChange={value => {
                  console.log(`Changing to form ${value}`)
                  navigate(`/pokemon/${pokemonName}${BuildQuery({ author: query.author, form: value })}`)
                }} />
            </div>}

          </div>
          <div className="mt-6 space-y-3">
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-600 font-bold">Pokédex #</p>
              <p className="text-3xl font-bold text-red-700">{pokemon?.number ?? 'Unkown'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-600 font-bold">Región</p>
              <p className="text-lg font-semibold text-red-600 hover:cursor-pointer hover:underline w-fit" onClick={() => navigate(`/dex?region=${dex?.name}`)}>{capitalize(dex?.name ?? 'unknown')}</p>
            </div>
            {query.author && (
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-600 font-bold">Artista</p>
                <p className="text-lg font-semibold text-red-600 hover:cursor-pointer hover:underline w-fit" onClick={() => navigate(`/dex?author=${query.author}`)}>{capitalize(query.author)}</p>
              </div>
            )}
          </div>
        </div>

        {/* {evolution && evolution?.length > 0 && <div className="flex-1 flex-col">
          <Title
            title="Evolution"
            className="mb-5"
          />
          {evolution?.map(([p, method]) => (<div className="text-black font-bold hover:cursor-pointer" onClick={() => {
            navigate(`/pokemon/${p.name}${BuildQuery({ ...query })}`)
          }}>
            {p.name}
          </div>))}
        </div>} */}
        {image ? (
          <div className="flex-1 flex justify-center items-center">
            <img
              className="h-96 w-auto object-contain border-4 border-red-600 rounded-lg"
              style={{ imageRendering: isSmallImage ? 'pixelated' : 'auto' }}
              src={image}
              alt={pokemonName}
              onLoad={handleImageLoad}
            />
          </div>
        ) : null}

        <button
          onClick={() => navigate('/dex' + BuildQuery({ ...query }))}
          className="absolute bottom-4 left-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl shadow-lg transition-colors text-2xl h-10 w-10 flex items-center justify-center hover:cursor-pointer"
          aria-label="Back to Dex"
        >
          ←
        </button>
      </div>

      {!query.author && authorsWithPokemon.length > 0 && (
        <div className="bg-red-700 p-8 rounded-2xl">
          <h2 className="text-white text-xl font-bold mb-6">Versiones de Artistas</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-8">
            {authorsWithPokemon.map(({ author, link }) => (
              <div
                key={author}
                className="flex flex-col items-center gap-3 cursor-pointer"
                onClick={() =>
                  navigate(`/pokemon/${pokemonName}${BuildQuery({ author, form: query.form })}`)
                }>
                <img
                  className="h-32 w-32 border-2 border-white rounded-lg object-cover hover:brightness-75 transition-all cursor-pointer"
                  src={Link(link ?? '')}
                  alt={`${pokemonName} by ${author}`}
                />
                <p className="text-xs font-semibold text-center text-white">{capitalize(author ?? 'Nobody')}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>

  </div>
}
