import { useEffect, useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router"
import { useKey } from "react-use"
import Title from "~/components/title"
import { useCollection } from "~/providers/CollectionProvider"
import { Link } from "~/types/Link"
import { type ShowingPokemon, type Author, type Pokemon } from "~/types/PokemonData"

export default function showcase() {

  const params = useParams()
  const authorParam = params.author
  const [searchParams] = useSearchParams()

  const query = {
    index: Number(searchParams.get('index'))
  }

  const [author, setAuthor] = useState<Author>()

  const [showingPokemonList, setShowingPokemonList] = useState<ShowingPokemon[]>()
  const [showingPokemon, setShowingPokemon] = useState<ShowingPokemon>()
  const [isSmallImage, setIsSmallImage] = useState<boolean>()

  const { Authors, GetAuthor, GetShowingPokemon } = useCollection()

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    setIsSmallImage(img.naturalWidth <= 250 || img.naturalHeight <= 250)
  }

  const navigate = useNavigate()

  useEffect(() => {
    async function load() {
      console.log(authorParam)
      setAuthor(GetAuthor(authorParam))
    }
    load()
  }, [Authors, params])

  useEffect(() => {
    if (author) {
      console.log(author)
      const pokes = GetShowingPokemon(author)
      console.log(pokes)
      setShowingPokemonList(pokes)
    }
  }, [author])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        if (!showingPokemonList?.length) return;
        const nextIndex = (query.index + 1) % showingPokemonList.length;
        navigate(`?index=${nextIndex}`);
      }

      if (event.key === 'ArrowLeft') {
        if (!showingPokemonList?.length) return;
        const prevIndex = (query.index - 1 + showingPokemonList.length) % showingPokemonList.length;
        navigate(`?index=${prevIndex}`);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    if (showingPokemonList)
      setShowingPokemon(showingPokemonList[query.index ?? 0])

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showingPokemonList, query.index, navigate]);

  return (
    <main className="h-screen w-full p-4">

      {author && <div className="flex flex-col items-center gap-8 h-full w-full p-10 rounded-2xl"
        style={{
          backgroundColor: "#BB0000"
        }}>
        <Title title={`${author.name}'s Pokedex`} className="text-6xl text-white" />
        <div className="h-full flex items-center">
          {showingPokemon && <img
            className="h-150 w-auto object-contain border-4 border-red-900 rounded-lg bg-white"
            style={{ imageRendering: isSmallImage ? 'pixelated' : 'auto' }}
            src={Link(showingPokemon.link ?? '')}
            alt={showingPokemon?.name}
            onLoad={handleImageLoad}
          />}
        </div>
        <div className="flex items-center justify-center h-35 min-w-150 bg-red-600 rounded-3xl ">
          <Title title={`${showingPokemon?.name} ${showingPokemon?.form}`} className="text-white text-5xl hover:cursor-default" />
        </div>
      </div>}
    </main>
  )
}
