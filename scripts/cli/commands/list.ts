import { getAvailableDexes, readDex } from '../utils.js'
import inquirer from 'inquirer'

export async function listPokemon(dexName?: string) {
    try {
        const dexNames = getAvailableDexes()
        
        // Sort dexes by generation
        interface DexWithGen {
            name: string
            gen: [number, number]
        }
        const dexesWithGen: DexWithGen[] = dexNames.map((dexNameItem) => {
            const dexData = readDex(dexNameItem)
            const [major, minor] = dexData.gen.split('.').map(Number)
            return { name: dexNameItem, gen: [major, minor] }
        })

        dexesWithGen.sort((a, b) => {
            if (a.gen[0] !== b.gen[0]) return a.gen[0] - b.gen[0]
            return a.gen[1] - b.gen[1]
        })

        const sortedDexes = dexesWithGen.map((d) => d.name)
        
        // If dex not provided, ask user
        let selectedDex = dexName
        if (!selectedDex) {
            console.log('\n[INFO] Available regions:')
            sortedDexes.forEach((dex, index) => {
                console.log(`  ${index + 1}. ${dex}`)
            })
            console.log('')
            
            const { dex } = await inquirer.prompt([
                {
                    type: 'select',
                    name: 'dex',
                    message: 'Which Pokedex do you want to list?',
                    choices: sortedDexes
                }
            ])
            selectedDex = dex
        }

        const dex = readDex(selectedDex)
        
        if (dex.pokemons.length === 0) {
            console.log(`[INFO] No Pokemon found in "${selectedDex}"`)
            return
        }

        console.log(`\n[LIST] Pokemon in "${selectedDex}" (Gen ${dex.gen}, ${dex.pokemons.length} total):`)
        console.log('-'.repeat(60))
        
        dex.pokemons.forEach((pokemon) => {
            const forms = pokemon.forms ? ` [${Object.keys(pokemon.forms).join(', ')}]` : ''
            console.log(`  #${pokemon.number.toString().padStart(3, '0')} ${pokemon.name.padEnd(20, '.')} ${forms}`)
        })
        
        console.log('-'.repeat(60))
    } catch (error) {
        if (error instanceof Error && error.message.includes('User force closed')) {
            console.log('\n[CANCELLED] Operation cancelled by user')
        } else {
            console.error('[ERROR]', error instanceof Error ? error.message : error)
        }
        process.exit(1)
    }
}
