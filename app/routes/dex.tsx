import { useEffect, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { MdSearch } from "react-icons/md";
import { useNavigate, useSearchParams } from "react-router";
import Selector from "~/components/selector.js";
import Title from "~/components/title";
import { useCollection } from "~/providers/CollectionProvider";
import { Link } from "~/types/Link.js";
import { type Author, type Pokedex, type Pokemon, type AuthorEntry, type ShowingPokemon } from "~/types/PokemonData.js";
import { capitalize } from "~/utiles/format.js";
import { BuildQuery } from "~/utiles/query.js";

export default function Dex() {
  const [showingPokemons, setShowingPokemons] = useState<ShowingPokemon[]>()
  const { Authors, Dexes, Pokemons, GetAuthor, GetShowingPokemon } = useCollection()

  const [searchParams] = useSearchParams();
  const query = {
    name: searchParams.get("name") ?? undefined,
    author: searchParams.get("author") ?? undefined,
    region: searchParams.get("region") ?? undefined,
  }

  const navigate = useNavigate();

  const selectedAuthor = GetAuthor(query.author)
  useEffect(() => {
    setShowingPokemons(
      GetShowingPokemon(selectedAuthor, {
        name: query.name,
        region: query.region,
        unique: true
      })
    )
  }, [Pokemons, selectedAuthor, query.name, query.region])

  return (
    <main className="min-h-screen w-full">
      <div className="flex flex-col min-h-[calc(100vh-3rem)] items-center gap-8 w-full">
        <div className="mt-10 w-full flex flex-col items-center">
          <div className="flex flex-col items-center rounded-2xl p-4 gap-4"
            style={{ backgroundColor: "#BB0000" }}>
            <Title title="MagicDex"
              className="mt-2 text-white text-4xl"
              centered />
            <div className="flex flex-row items-center gap-2 w-fit  rounded-3xl " >
              <input className="bg-red-800 p-3  w-100 rounded-2xl text-center"
                value={query.name ?? ''}
                onChange={(ev) => navigate(`/dex${BuildQuery({ ...query, name: ev.target.value })}`)}
              >
              </input>
              <FiSearch strokeWidth={3} size={30} />
            </div >
            <div className="flex flex-row items-center gap-8 w-fit rounded-2xl">
              <Selector
                title="Autor:"
                options={Authors}
                value={query.author}
                onChange={(authorP) => {
                  navigate(`/dex${BuildQuery({ ...query, author: authorP })}`)
                }}
              />
              <Selector
                title="Región:"
                options={Dexes?.map(d => ({ name: d.name, display: capitalize(d.name) }))}
                value={query.region}
                onChange={(regionP) => {
                  navigate(`/dex${BuildQuery({ ...query, region: regionP })}`)
                }}
              />
            </div>
          </div>
          <div className="m-8 w-fit flex-col gap-20 grid grid-cols-5  p-9 mx-auto rounded-2xl"
            style={{
              backgroundColor: "#BB0000"
            }}>
            {showingPokemons?.map(p => {
              const imageUrl = Link(p.link ?? '')

              return (
                <div
                  key={p.key}
                  className="flex flex-col items-center gap-2 cursor-pointer"
                  onClick={() => navigate(`/pokemon/${p.key}${BuildQuery({ author: query.author, form: p.form })}`)}
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
                    title={p.name}
                    className="hover:brightness-75 transition-all duration-200"
                  />
                  <p className="text-white text-sm font-semibold text-center">{p.name}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main >
  )
}