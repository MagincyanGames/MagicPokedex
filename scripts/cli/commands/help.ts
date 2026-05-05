export async function helpCommand() {
  console.log(`
Available Commands:

  poke version              Show the CLI version
  poke help                 Show this help message
  poke add [name]           Add a new Pokemon interactively
  poke list [dex]           List all Pokemon in a Pokedex
  poke search [dex] [name]  Search for Pokemon by name or number
  
Examples:

  $ poke version
  $ poke help
  $ poke add bulbasaur
  $ poke add                 (will ask for the name interactively)
  $ poke list                (shows all Pokemon interactively)
  $ poke list kanto          (shows all Pokemon in kanto dex)
  $ poke search              (search with interactive filtering)
  $ poke search kanto bulb   (search for "bulb" in kanto dex)

Note: By default, if you run 'poke' without commands, 
      the interactive assistant to add Pokemon will open.
`)
}
