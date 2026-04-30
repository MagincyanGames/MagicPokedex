import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import Subtitle from "~/components/subtitle";
import { Link } from "~/types/Link";
import { Collections, type Author, type Pokemon, type ShowingPokemon } from "~/types/PokemonData";

export default function Dex() {
  const [pokemons, setPokemons] = useState<Pokemon[]>();
  const [showingPokemons, setShowingPokemons] = useState<ShowingPokemon[]>()

  const [authors, setAuthors] = useState<Author[]>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const authorParam = searchParams.get("author");
  const selectedAuthor = authors?.find(a => a.name === authorParam) || null;

  useEffect(() => {
    async function load() {
      const complexCol = await Collections.getCollections()
      setAuthors(complexCol.authors)

      setPokemons(complexCol.pokemons)
      setShowingPokemons(complexCol.pokemons?.map(p => {
        return {
          pokemon: p,
        }
      }))
    }

    load()
  }, []);

  useEffect(() => {
    if (selectedAuthor === null) {
      setShowingPokemons(pokemons?.map(p => {
        return {
          pokemon: p
        }
      }))

      return
    }

    setShowingPokemons(pokemons?.filter(p => p.name in selectedAuthor.pokemons).map(
      p => {
        return {
          link: Link(selectedAuthor.pokemons[p.name]),
          pokemon: p,
        }
      }
    ))
  }, [selectedAuthor, pokemons])

  return (
    <main className="min-h-screen w-full">
      <div className="flex flex-col min-h-[calc(100vh-3rem)] items-center gap-8 w-full">
        <div className="mt-20 w-full">
          <div className="flex justify-center mb-8 items-center gap-4">
            <label className="text-white text-lg font-semibold">Autor:</label>
            <select
              value={authorParam || ""}
              onChange={(e) => {
                if (e.target.value === "") {
                  navigate("/dex");
                } else {
                  navigate(`/dex?author=${encodeURIComponent(e.target.value)}`);
                }
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-lg font-semibold hover:cursor-pointer"
            >
              <option value="">Ninguno</option>
              {authors?.map(author => (
                <option key={author.name} value={author.name}>
                  {author.name}
                </option>
              ))}
            </select>
          </div>

          <div className="m-8 w-fit flex-col gap-20 grid grid-cols-5 bg-red-700 p-9 mx-auto rounded-2xl">
            {showingPokemons?.map(p => {
              const imageUrl = p.link

              return (
                <div
                  key={p.pokemon.number}
                  className="flex flex-col items-center gap-2 cursor-pointer"
                  onClick={() => navigate(`/pokemon/${p.pokemon.name}${authorParam ? `?author=${encodeURIComponent(authorParam)}` : ''}`)}
                >
                  <div
                    style={{
                      height: "120px",
                      width: "120px",
                      backgroundColor: "white",
                      borderRadius: "10px",
                      backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                    title={p.pokemon.name}
                    className="hover:brightness-75 transition-all duration-200"
                  />
                  <p className="text-white text-sm font-semibold text-center">{p.pokemon.name}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  )
}