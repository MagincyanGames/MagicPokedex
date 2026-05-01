import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import Subtitle from "~/components/subtitle";
import { Link } from "~/types/Link";
import { Collections, type Author, type Pokedex, type Pokemon, type ShowingPokemon } from "~/types/PokemonData";
import { capitalize } from "~/utiles/format";

export default function Dex() {
  const [pokemons, setPokemons] = useState<Pokemon[]>();
  const [showingPokemons, setShowingPokemons] = useState<ShowingPokemon[]>()

  const [authors, setAuthors] = useState<Author[]>();
  const [dexes, setDexes] = useState<Pokedex[]>()

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const authorParam = searchParams.get("author");
  const regionParam = searchParams.get("region");

  const selectedAuthor = authors?.find(a => a.name === authorParam) || null;

  useEffect(() => {
    async function load() {
      const complexCol = await Collections.getCollections()
      setAuthors(complexCol.authors)
      setDexes(complexCol.dexes)

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
    setShowingPokemons(pokemons?.filter(p => (!selectedAuthor || p.name in selectedAuthor.pokemons) && (!regionParam || p.dex?.toLocaleLowerCase() === regionParam.toLocaleLowerCase())).map(
      p => {
        return {
          link: selectedAuthor ? Link(selectedAuthor.pokemons[p.name]) : p.sprite,
          pokemon: p,
        }
      }
    ))
  }, [selectedAuthor, pokemons, regionParam])

  return (
    <main className="min-h-screen w-full">
      <div className="flex flex-col min-h-[calc(100vh-3rem)] items-center gap-8 w-full">
        <div className="mt-20 w-full flex flex-col items-center">
          <div className="flex flex-row items-center gap-8 w-fit p-4 rounded-2xl" style={{ backgroundColor: "#BB0000" }}>
            <div className="flex justify-center items-center gap-4">
              <label className="text-white text-lg font-semibold">Autor:</label>
              <select
                value={authorParam || ""}
                onChange={(e) => {
                  const authorP = e.target.value ? encodeURIComponent(e.target.value) : undefined;
                  let p = '?'

                  if (authorP && regionParam)
                    p += `author=${authorP}&region=${regionParam}`
                  else if (authorP && !regionParam)
                    p += `author=${authorP}`
                  else if (!authorP && regionParam)
                    p += `region=${regionParam}`

                  navigate(`/dex${p}`)
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-lg font-semibold hover:cursor-pointer text-black bg-white appearance-none"
              >
                <option value="">Ninguno</option>
                {authors?.map(author => (
                  <option key={author.name} value={author.name}>
                    {author.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-center items-center gap-4">
              <label className="text-white text-lg font-semibold">Región:</label>
              <select
                value={regionParam || ""}
                onChange={(e) => {
                  const regionP = e.target.value ? encodeURIComponent(e.target.value) : undefined;
                  let p = '?'

                  if (authorParam && regionP)
                    p += `author=${authorParam}&region=${regionP}`
                  else if (authorParam && !regionP)
                    p += `author=${authorParam}`
                  else if (!authorParam && regionP)
                    p += `region=${regionP}`

                  navigate(`/dex${p}`)
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-lg font-semibold hover:cursor-pointer text-black bg-white appearance-none"
              >
                <option value="">Ninguno</option>
                {dexes?.map(d => (
                  <option key={d.name} value={d.name}>
                    {capitalize(d.name)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="m-8 w-fit flex-col gap-20 grid grid-cols-5  p-9 mx-auto rounded-2xl"
            style={{
              backgroundColor: "#BB0000"
            }}>
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
    </main >
  )
}