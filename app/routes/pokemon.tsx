import { useEffect, useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router"
import Title from "~/components/title"
import { Link } from "~/types/Link"
import { Collections, type Pokemon, type Author } from "~/types/PokemonData"

export default function PokemonView() {
    const params = useParams()
    const [searchParams] = useSearchParams()
    const authorParam = searchParams.get('author')

    const [pokemon, setPokemon] = useState<Pokemon>()
    const [dexes, setDexes] = useState<string[]>([])
    const [image, setImage] = useState<string>()
    const [authorsWithPokemon, setAuthorsWithPokemon] = useState<Array<{ author: Author, image: string }>>([])
    
    const navigate = useNavigate()

    useEffect(() => {
        async function load() {
            const pokemonName = params.pokemon
            if (!pokemonName) throw new Error('Pokemon name is required')

            const col = await Collections.getCollections()
            setPokemon(Collections.getPokemon(pokemonName, col))

            // Obtener el dex donde aparece este pokemon (solo la primera región)
            const pokemonList = Collections.getPokemonList(col.dexes)
            const pokemonFirstDex = pokemonList
                .find(p => p.name.toLowerCase() === pokemonName.toLowerCase())
                ?.dex
            if (pokemonFirstDex) setDexes([pokemonFirstDex])

            if (authorParam) {
                const author = await Collections.getAuthor(authorParam, col)
                setImage(Link(author.pokemons[pokemonName]))
            } else {
                // Si no hay autor, mostrar dibujos de todos los autores que lo tengan
                const authorsWithThisPokemon = col.authors
                    .filter(author => pokemonName in author.pokemons)
                    .map(author => ({
                        author,
                        image: Link(author.pokemons[pokemonName])
                    }))
                setAuthorsWithPokemon(authorsWithThisPokemon)
            }
        }

        load()
    }, [authorParam, params.pokemon])

    return <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="flex flex-col w-full max-w-4xl gap-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 bg-white p-8 rounded-2xl border shadow-lg">
                <div className="flex-1">
                    <Title
                        title={pokemon?.name ?? ''}
                    />
                    <div className="mt-6 space-y-3">
                        <div>
                            <p className="text-xs uppercase tracking-widest text-gray-600 font-bold">Pokédex #</p>
                            <p className="text-3xl font-bold text-red-700">{pokemon?.number}</p>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-widest text-gray-600 font-bold">Región</p>
                            <p className="text-lg font-semibold text-red-600">{dexes[0] || 'Unknown'}</p>
                        </div>
                        {authorParam && (
                            <div>
                                <p className="text-xs uppercase tracking-widest text-gray-600 font-bold">Artista</p>
                                <p className="text-lg font-semibold text-red-600">{authorParam}</p>
                            </div>
                        )}
                    </div>
                </div>

                {authorParam ? (
                    <div className="flex-1 flex justify-center">
                        <img
                            className="h-64 object-contain border-4 border-red-600 rounded-lg"
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
                                onClick={() => navigate(`/pokemon/${params.pokemon}?author=${encodeURIComponent(author.name)}`)}
                            >
                                <img
                                    className="h-32 w-32 border-2 border-white rounded-lg object-cover hover:border-yellow-300 transition-colors"
                                    src={image}
                                    alt={`${pokemon?.name} by ${author.name}`}
                                />
                                <p className="text-xs font-semibold text-center text-white">{author.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    </div>
}