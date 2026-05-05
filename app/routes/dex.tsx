import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import Selector from "~/components/selector";
import { Link } from "~/types/Link";
import { Collections, type Author, type Pokedex, type Pokemon, type PokemonAuthorEntryBody, type ShowingPokemon } from "~/types/PokemonData";
import { capitalize } from "~/utiles/format";
import { BuildQuery } from "~/utiles/query";

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

    if (selectedAuthor) {
      Collections.validateList(selectedAuthor, pokemons)
    }

    const unformPokemonList = selectedAuthor ? new Set(Object.entries(selectedAuthor.pokemons).map(p =>
      p[0].split('#')[0]
    )) : null

    setShowingPokemons(pokemons?.filter(p => (!unformPokemonList || unformPokemonList.has(p.name)) && (!regionParam || p.dex?.toLocaleLowerCase() === regionParam.toLocaleLowerCase())).map(
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
  }, [selectedAuthor, pokemons, regionParam])

  return (
    <main className="min-h-screen w-full">
      <div className="flex flex-col min-h-[calc(100vh-3rem)] items-center gap-8 w-full">
        <div className="mt-20 w-full flex flex-col items-center">
          <div className="flex flex-row items-center gap-8 w-fit p-4 rounded-2xl" style={{ backgroundColor: "#BB0000" }}>
            <Selector
              title="Autor:"
              options={authors}
              value={authorParam}
              onChange={(authorP) => {
                navigate(`/dex${BuildQuery({ author: authorP, region: regionParam })}`)
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