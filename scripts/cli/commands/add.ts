import inquirer from 'inquirer'
import { getAvailableDexes, readDex, saveDex, addPokemonToDex, pokemonNumberExists, pokemonNameExists, getNextPokemonNumber, type Pokemon } from '../utils.js'

export async function addPokemon(dexName?: string, pokemonName?: string) {
    try {
        // 1. Get dex
        const dexNames = getAvailableDexes()
        if (dexNames.length === 0) {
            console.error('[ERROR] No dexes available')
            return
        }

        // Sort dexes by generation
        interface DexWithGen {
            name: string
            gen: [number, number]
        }
        const dexesWithGen: DexWithGen[] = dexNames.map((dexName) => {
            const dexData = readDex(dexName)
            const [major, minor] = dexData.gen.split('.').map(Number)
            return { name: dexName, gen: [major, minor] }
        })

        dexesWithGen.sort((a, b) => {
            if (a.gen[0] !== b.gen[0]) return a.gen[0] - b.gen[0]
            return a.gen[1] - b.gen[1]
        })

        const sortedDexes = dexesWithGen.map((d) => d.name)

        // Show available regions/dexes (only if needed to select)
        if (!dexName) {
            console.log('\n[INFO] Available regions:')
            sortedDexes.forEach((dex, index) => {
                console.log(`  ${index + 1}. ${dex}`)
            })
            console.log('')
        }

        // If only one dex, select it automatically
        let selectedDex: string
        if (dexName && sortedDexes.includes(dexName)) {
            selectedDex = dexName
            console.log(`[INFO] Using dex: ${selectedDex}`)
        } else if (sortedDexes.length === 1) {
            selectedDex = sortedDexes[0]
            console.log(`[INFO] Using dex: ${selectedDex}`)
        } else {
            const { dex } = await inquirer.prompt([
                {
                    type: 'select',
                    name: 'dex',
                    message: 'Which Pokedex do you want to add the Pokemon to?',
                    choices: sortedDexes
                }
            ])
            selectedDex = dex
        }

        const dex = readDex(selectedDex)

        // 2. Get name
        let inputName = pokemonName
        if (!inputName) {
            const { inputNamePrompt } = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'inputNamePrompt',
                    message: 'Pokemon name:',
                    validate: (value: any) => {
                        if (!value.trim()) return 'Name cannot be empty'
                        if (pokemonNameExists(dex, value)) return `Pokemon "${value}" already exists in this dex`
                        return true
                    }
                }
            ])
            inputName = inputNamePrompt.trim()
        } else {
            // Validate provided name
            if (pokemonNameExists(dex, inputName)) {
                console.error(`[ERROR] Pokemon "${inputName}" already exists in dex "${selectedDex}"`)
                return
            }
        }

        // 3. Get number
        const nextNumber = getNextPokemonNumber(dex)
        const { number } = await inquirer.prompt([
            {
                type: 'number',
                name: 'number',
                message: `Pokemon number (suggestion: ${nextNumber}):`,
                default: nextNumber,
                validate: (value: any) => {
                    if (!Number.isInteger(value) || value < 1) return 'Must be a positive integer'
                    if (pokemonNumberExists(dex, value)) return `Number ${value} already exists in this dex`
                    return true
                }
            }
        ])

        // 4. Get sprite (optional)
        const { sprite } = await inquirer.prompt([
            {
                type: 'input',
                name: 'sprite',
                message: 'Sprite URL (optional, press Enter to skip):',
                default: ''
            }
        ])

        // 4.5 Get display name (optional)
        const { display } = await inquirer.prompt([
            {
                type: 'input',
                name: 'display',
                message: 'Display name (optional, for showing in UI, press Enter to skip):',
                default: ''
            }
        ])

        // 5. Ask if it has alternative forms
        const { hasForms } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'hasForms',
                message: 'Does this Pokemon have alternative forms?',
                default: false
            }
        ])

        let forms: Record<string, { name: string; sprite?: string }> | undefined

        if (hasForms) {
            forms = {}
            let addingForms = true

            while (addingForms) {
                const { formKey } = await inquirer.prompt([
                    {
                        type: 'input',
                        name: 'formKey',
                        message: 'Form key (internal identifier):',
                        validate: (value: any) => {
                            if (!value.trim()) return 'Key cannot be empty'
                            if (forms && value in forms) return 'This form key already exists'
                            return true
                        }
                    }
                ])

                const { formName } = await inquirer.prompt([
                    {
                        type: 'input',
                        name: 'formName',
                        message: 'Form name (display name, can be same as key):',
                        default: formKey
                    }
                ])

                const { formSprite } = await inquirer.prompt([
                    {
                        type: 'input',
                        name: 'formSprite',
                        message: 'Sprite URL for this form (optional):',
                        default: ''
                    }
                ])

                forms[formKey] = {
                    name: formName,
                    ...(formSprite && { sprite: formSprite })
                }

                const { addMore } = await inquirer.prompt([
                    {
                        type: 'confirm',
                        name: 'addMore',
                        message: 'Add another form?',
                        default: false
                    }
                ])

                addingForms = addMore
            }
        }

        // 6. Create Pokemon object
        const newPokemon: Pokemon = {
            number,
            name: inputName?.toLowerCase(),
            ...(display && { display }),
            ...(sprite && { sprite }),
            ...(forms && Object.keys(forms).length > 0 && { forms })
        }

        // 7. Show summary
        console.log('\n[SUMMARY] Pokemon to add:')
        console.log('-'.repeat(40))
        console.log(`  Name: ${newPokemon.name}`)
        console.log(`  Number: ${newPokemon.number}`)
        if (newPokemon.display) console.log(`  Display: ${newPokemon.display}`)
        if (newPokemon.sprite) console.log(`  Sprite: ${newPokemon.sprite}`)
        if (newPokemon.forms) {
            console.log(`  Forms:`)
            Object.entries(newPokemon.forms).forEach(([key, form]) => {
                console.log(`    - ${key}: ${form.name}${form.sprite ? ` (sprite: ${form.sprite})` : ''}`)
            })
        }
        console.log('-'.repeat(40))

        // 8. Confirm
        const { confirm } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'confirm',
                message: 'Save this Pokemon?',
                default: true
            }
        ])

        if (!confirm) {
            console.log('[CANCELLED] Operation cancelled')
            return
        }

        // 9. Save
        addPokemonToDex(dex, newPokemon)
        saveDex(selectedDex, dex)

        console.log(`\n[SUCCESS] Pokemon added successfully to "${selectedDex}"!`)
        console.log(`[INFO] Total Pokemon in "${selectedDex}": ${dex.pokemons.length}`)
    } catch (error) {
        if (error instanceof Error && error.message.includes('User force closed')) {
            console.log('\n[CANCELLED] Operation cancelled by user')
        } else {
            console.error('[ERROR]', error instanceof Error ? error.message : error)
        }
        process.exit(1)
    }
}
