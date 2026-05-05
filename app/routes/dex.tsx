import { useEffect, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { MdSearch } from "react-icons/md";
import { useNavigate, useSearchParams } from "react-router";
import Selector from "~/components/selector.js";
import Title from "~/components/title";
import { Link } from "~/types/Link.js";
import { Collections, type Author, type Pokedex, type Pokemon, type PokemonAuthorEntryBody, type ShowingPokemon } from "~/types/PokemonData.js";
import { capitalize } from "~/utiles/format.js";
import { BuildQuery } from "~/utiles/query.js";

export default function Dex() {
  const [pokemons, setPokemons] = useState<Pokemon[]>();
  const [showingPokemons, setShowingPokemons] = useState<ShowingPokemon[]>()

  const [authors, setAuthors] = useState<Author[]>();
  const [dexes, setDexes] = useState<Pokedex[]>()

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const nameParam = searchParams.get("name");
  const authorParam = searchParams.get("author");
  const regionParam = searchParams.get("region");

  const selectedAuthor = authors?.find(a => a.name === authorParam) || null;

  useEffect(() => {
    async function load() {
      const complexCol = await Collections.getCollections()
      setAuthors(complexCol.authors)
      setDexes(complexCol.dexes)

      setPokemons(complexCol.pokemons)
    }

    load()
  }, []);

  useEffect(() => {

    if (selectedAuthor) {
      Collections.validateList(selectedAuthor, pokemons)
    }

    const unformPokemonList = selectedAuthor ? new Set(Object.entries(selectedAuthor.pokemons).map(p =>
      p[0].split('#')[0]
    )) : null

    setShowingPokemons(pokemons?.filter(p =>
      (!nameParam || p.name.startsWith(nameParam) || p.display?.startsWith(nameParam)) &&
      (!unformPokemonList || unformPokemonList.has(p.name)) &&
      (!regionParam || p.dex?.toLocaleLowerCase() === regionParam.toLocaleLowerCase())
    ).map(
      p => {
        let form: string | undefined = undefined

        if (selectedAuthor && !(p.name in selectedAuthor.pokemons) && p.forms) {
          const keys = Object.keys(p.forms!).map(k => p.name + '#' + k)
          form = Object.keys(selectedAuthor.pokemons).find(p => keys.includes(p))?.split('#')[1]
        }

        return {
          link: Link(Collections.getSprite(p, form, selectedAuthor)),
          pokemon: p,
          form
        }
      }
    ))
  }, [selectedAuthor, pokemons, regionParam, nameParam])

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
                value={nameParam ?? ''}
                onChange={(ev) => navigate(`/dex${BuildQuery({ author: authorParam, region: regionParam, name: ev.target.value })}`)}
              >
              </input>
              <FiSearch strokeWidth={3} size={30} />
            </div >
            <div className="flex flex-row items-center gap-8 w-fit rounded-2xl">
              <Selector
                title="Autor:"
                options={authors}
                value={authorParam}
                onChange={(authorP) => {
                  navigate(`/dex${BuildQuery({ author: authorP, region: regionParam, name: nameParam })}`)
                }}
              />
              <Selector
                title="Región:"
                options={dexes?.map(d => ({ name: d.name, display: capitalize(d.name) }))}
                value={regionParam}
                onChange={(regionP) => {
                  navigate(`/dex${BuildQuery({ author: authorParam, region: regionP })}`)
                }}
              />
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
                  onClick={() => navigate(`/pokemon/${p.pokemon.name}${BuildQuery({ author: authorParam, form: p.form })}`)}
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
                  <p className="text-white text-sm font-semibold text-center">{p.pokemon.display ?? p.pokemon.name}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main >
  )
}