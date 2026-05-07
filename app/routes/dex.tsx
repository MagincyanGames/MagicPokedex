import { useEffect, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { useNavigate, useSearchParams } from "react-router";
import Selector from "~/components/selector.js";
import Title from "~/components/title";
import { useCollection } from "~/providers/CollectionProvider";
import { Link } from "~/types/Link.js";
import { type ShowingPokemon } from "~/types/PokemonData.js";
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
        <div className="p-4 w-full max-w-350 flex flex-col items-center md:mt-10">
          <div className="flex flex-col items-center rounded-2xl p-6 gap-6 w-full"
            style={{ backgroundColor: "#BB0000" }}>
            <Title title="MagicDex"
              className="mt-2 text-white text-4xl"
              centered />
            <div className="flex flex-row items-center gap-2 rounded-3xl w-full max-w-200" >
              <input className="bg-red-800 p-3  w-full rounded-2xl text-center"
                value={query.name ?? ''}
                onChange={(ev) => navigate(`/dex${BuildQuery({ ...query, name: ev.target.value })}`)}
              />
              <FiSearch strokeWidth={3} size={30} />
            </div >
            <div className="flex flex-col items-center gap-4 w-fit rounded-2xl md:flex-row md:gap-8">
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
          <div className="mt-4 md:mt-8 w-full  max-w-350 flex-col gap-10 grid grid-cols-2 p-4 mx-auto rounded-2xl md:grid-cols-6 md:gap-20 md:p-8"
            style={{
              backgroundColor: "#BB0000"
            }}>
            {showingPokemons?.map(p => {
              const imageUrl = Link(p.link ?? '')

              return (
                <div
                  key={p.key}
                  className="flex flex-col items-center cursor-pointer w-full"
                  onClick={() => navigate(`/pokemon/${p.key}${BuildQuery({ author: query.author, form: p.form })}`)}
                >
                  <img
                    src={imageUrl}
                    alt={p.name}
                    className="hover:brightness-75 transition-all duration-200 w-full aspect-square"
                    fetchPriority="high"
                    style={{
                      backgroundColor: "white",
                      borderRadius: "10px",
                      objectFit: "contain",
                      objectPosition: "center"
                    }}>
                  </img>
                  <p className=" text-white text-sm font-semibold text-center">{p.name}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main >
  )
}
