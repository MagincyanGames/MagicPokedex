import { useEffect, useState } from "react"
import { useParams } from "react-router"
import Title from "~/components/title"
import { Collections, type Author } from "~/types/PokemonData"

export default function showcase() {

    const params = useParams()
    const [author, setAuthor] = useState<Author>()

    useEffect(() => {
        async function load() {
            const authorParam = params.author

            const col = await Collections.getCollections()
            const newAuthor = authorParam ? Collections.getAuthor(authorParam, col) : undefined
            console.log(newAuthor)
            setAuthor(newAuthor)

        }
        load()
    }, [params])

    return (
        <main className="min-h-screen w-full p-8">

            {author && <div className="flex flex-col items-center gap-8 w-full p-8 rounded-2xl"
                style={{
                    backgroundColor: "#BB0000"
                }}>
                <Title title={`${author.name}'s Pokedex`} className="text-4xl text-white" />
            </div>}
        </main>)
}