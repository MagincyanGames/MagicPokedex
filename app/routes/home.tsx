import type { Route } from "./+types/home";
import { useNavigate } from "react-router";
import Title from "~/components/title";
import Subtitle from "~/components/subtitle";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "MagicPokedex" },
    { name: "description", content: "The best pokedex ever!!!" },
  ];
}

export default function Home() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen">
      <div className="mx-auto flex flex-col min-h-[calc(100vh-3rem)] max-w-4xl items-center justify-center gap-8">
        <div className="max-w-2xl w-full bg-white border rounded-xl p-5">
          <Title
            title="Nuestra Pokedex"
            centered
          />
          <br />
          <Subtitle
            subtitle={
              `Esta es una Pokédex hecha con dibujos de diferentes "Artistas"`}
            centered
          />
          <br />
          <Subtitle
            subtitle={
              `Puedes filtrar tanto por Pokémon como por Artista`}
            centered
          />
        </div>
        <button
          className="bg-red-700 p-4 rounded-3xl hover:cursor-pointer"
          onClick={() => navigate("/dex")}>
          Ver
        </button>
      </div>
    </main >
  );
}