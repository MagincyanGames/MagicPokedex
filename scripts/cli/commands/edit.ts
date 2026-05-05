import inquirer from 'inquirer'
import { getAvailableDexes, readDex, saveDex, type Pokemon, type Pokedex } from '../utils.js'

export async function editPokemon(dexName?: string, pokemonIdentifier?: string) {
    try {
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

        // 1. Get dex
        let selectedDex = dexName
        if (selectedDex && !sortedDexes.includes(selectedDex)) {
            console.error(`[ERROR] Dex "${selectedDex}" not found`)
            return
        }
        if (!selectedDex) {
            const { dex } = await inquirer.prompt([
                {
                    type: 'select',
                    name: 'dex',
                    message: 'Which Pokedex do you want to edit Pokemon in?',
                    choices: sortedDexes
                }
            ])
            selectedDex = dex
        }

        const dex = readDex(selectedDex)

        // 2. Get Pokemon
        let selectedPokemon: Pokemon | undefined
        if (pokemonIdentifier !== undefined) {
            // Try to find by number first, then by name
            const num = parseInt(pokemonIdentifier)
            selectedPokemon = dex.pokemons.find((p) => p.number === num) || 
                             dex.pokemons.find((p) => p.name.toLowerCase() === pokemonIdentifier.toLowerCase())
            if (!selectedPokemon) {
                console.error(`[ERROR] Pokemon "${pokemonIdentifier}" not found in dex "${selectedDex}"`)
                return
            }
        } else {
            const { pokemon } = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'pokemon',
                    message: 'Enter Pokemon number or name to edit:',
                    validate: (value: string) => {
                        const num = parseInt(value)
                        const byNumber = dex.pokemons.find((p) => p.number === num)
                        const byName = dex.pokemons.find((p) => p.name.toLowerCase() === value.toLowerCase())
                        if (byNumber || byName) return true
                        return 'Pokemon not found in this dex'
                    }
                }
            ])

            const num = parseInt(pokemon)
            selectedPokemon = dex.pokemons.find((p) => p.number === num) || 
                             dex.pokemons.find((p) => p.name.toLowerCase() === pokemon.toLowerCase())
        }

        if (!selectedPokemon) {
            console.error('[ERROR] Pokemon not found')
            return
        }

        console.log(`\n[INFO] Editing Pokemon: #${selectedPokemon.number} ${selectedPokemon.name}`)

        // 3. Show edit options
        const { editOption } = await inquirer.prompt([
            {
                type: 'select',
                name: 'editOption',
                message: 'What do you want to edit?',
                choices: [
                    { name: 'Edit name', value: 'name' },
                    { name: 'Edit number', value: 'number' },
                    { name: 'Edit display name', value: 'display' },
                    { name: 'Edit sprite', value: 'sprite' },
                    { name: 'Manage forms', value: 'forms' },
                    { name: '─────────────', disabled: true },
                    { name: 'Cancel', value: 'cancel' }
                ]
            }
        ])

        if (editOption === 'cancel') {
            console.log('[CANCELLED] Operation cancelled')
            return
        }

        // 4a. Edit name
        if (editOption === 'name') {
            const { newName } = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'newName',
                    message: 'New Pokemon name:',
                    default: selectedPokemon.name,
                    validate: (value: string) => {
                        if (!value.trim()) return 'Name cannot be empty'
                        // Check if name already exists (excluding current pokemon)
                        if (dex.pokemons.some((p) => p.name.toLowerCase() === value.toLowerCase() && p.number !== selectedPokemon!.number)) {
                            return `Pokemon "${value}" already exists in this dex`
                        }
                        return true
                    }
                }
            ])

            selectedPokemon.name = newName.toLowerCase()
            console.log('[SUCCESS] Name updated')
        }

        // 4b. Edit number
        if (editOption === 'number') {
            const { newNumber } = await inquirer.prompt([
                {
                    type: 'number',
                    name: 'newNumber',
                    message: 'New Pokemon number:',
                    default: selectedPokemon.number,
                    validate: (value: any) => {
                        if (!Number.isInteger(value) || value < 1) return 'Must be a positive integer'
                        // Check if number already exists (excluding current pokemon)
                        if (dex.pokemons.some((p) => p.number === value && p.number !== selectedPokemon!.number)) {
                            return `Number ${value} already exists in this dex`
                        }
                        return true
                    }
                }
            ])

            selectedPokemon.number = newNumber
            console.log('[SUCCESS] Number updated')
        }

        // 4c. Edit sprite
        if (editOption === 'sprite') {
            const { newSprite } = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'newSprite',
                    message: 'New sprite URL (or press Enter to clear):',
                    default: selectedPokemon.sprite || ''
                }
            ])

            if (newSprite) {
                selectedPokemon.sprite = newSprite
            } else {
                delete selectedPokemon.sprite
            }

            console.log('[SUCCESS] Sprite updated')
        }

        // 4d. Edit display name
        if (editOption === 'display') {
            const { newDisplay } = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'newDisplay',
                    message: 'New display name (or press Enter to clear):',
                    default: selectedPokemon.display || ''
                }
            ])

            if (newDisplay) {
                selectedPokemon.display = newDisplay
            } else {
                delete selectedPokemon.display
            }

            console.log('[SUCCESS] Display name updated')
        }

        // 4e. Manage forms
        if (editOption === 'forms') {
            const { formAction } = await inquirer.prompt([
                {
                    type: 'select',
                    name: 'formAction',
                    message: 'What do you want to do with forms?',
                    choices: [
                        { name: 'Add new form', value: 'add' },
                        { name: 'View forms', value: 'view' },
                        { name: 'Remove form', value: 'remove' },
                        { name: '─────────────', disabled: true },
                        { name: 'Cancel', value: 'cancel' }
                    ]
                }
            ])

            if (formAction === 'cancel') {
                console.log('[CANCELLED] Forms edit cancelled')
                dex.pokemons.sort((a, b) => a.number - b.number)
                return saveDex(selectedDex, dex)
            }

            if (formAction === 'view') {
                if (!selectedPokemon.forms || Object.keys(selectedPokemon.forms).length === 0) {
                    console.log('[INFO] This Pokemon has no forms')
                    dex.pokemons.sort((a, b) => a.number - b.number)
                    return saveDex(selectedDex, dex)
                }

                console.log('\n[INFO] Available forms:')
                Object.entries(selectedPokemon.forms).forEach(([key, form]) => {
                    console.log(`  - ${key}: ${form.name}${form.sprite ? ` (sprite: ${form.sprite})` : ''}`)
                })
                console.log('')
                dex.pokemons.sort((a, b) => a.number - b.number)
                return saveDex(selectedDex, dex)
            }

            if (formAction === 'add') {
                if (!selectedPokemon.forms) {
                    selectedPokemon.forms = {}
                }

                const { formKey } = await inquirer.prompt([
                    {
                        type: 'input',
                        name: 'formKey',
                        message: 'Form key (internal identifier):',
                        validate: (value: string) => {
                            if (!value.trim()) return 'Key cannot be empty'
                            if (selectedPokemon!.forms && value in selectedPokemon!.forms) {
                                return 'This form key already exists'
                            }
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

                selectedPokemon.forms[formKey] = {
                    name: formName,
                    ...(formSprite && { sprite: formSprite })
                }

                console.log(`[SUCCESS] Form "${formKey}: ${formName}" added`)
            }

            if (formAction === 'remove') {
                if (!selectedPokemon.forms || Object.keys(selectedPokemon.forms).length === 0) {
                    console.log('[INFO] This Pokemon has no forms to remove')
                    dex.pokemons.sort((a, b) => a.number - b.number)
                    return saveDex(selectedDex, dex)
                }

                const formChoices = Object.keys(selectedPokemon.forms)
                const { formToRemove } = await inquirer.prompt([
                    {
                        type: 'list',
                        name: 'formToRemove',
                        message: 'Which form do you want to remove?',
                        choices: formChoices
                    }
                ])

                delete selectedPokemon.forms[formToRemove]
                console.log(`[SUCCESS] Form "${formToRemove}" removed`)
            }
        }

        // 5. Show summary
        console.log('\n[SUMMARY] Pokemon updated:')
        console.log('-'.repeat(40))
        console.log(`  Name: ${selectedPokemon.name}`)
        console.log(`  Number: ${selectedPokemon.number}`)
        if (selectedPokemon.display) console.log(`  Display: ${selectedPokemon.display}`)
        if (selectedPokemon.sprite) console.log(`  Sprite: ${selectedPokemon.sprite}`)
        if (selectedPokemon.forms && Object.keys(selectedPokemon.forms).length > 0) {
            console.log(`  Forms:`)
            Object.entries(selectedPokemon.forms).forEach(([key, form]) => {
                console.log(`    - ${key}: ${form.name}${form.sprite ? ` (sprite: ${form.sprite})` : ''}`)
            })
        }
        console.log('-'.repeat(40))

        // 6. Confirm
        const { confirm } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'confirm',
                message: 'Save changes?',
                default: true
            }
        ])

        if (!confirm) {
            console.log('[CANCELLED] Changes not saved')
            return
        }

        // 7. Save
        // Re-sort pokemons by number before saving (in case number was changed)
        dex.pokemons.sort((a, b) => a.number - b.number)
        saveDex(selectedDex, dex)
        console.log(`\n[SUCCESS] Pokemon updated successfully in "${selectedDex}"!`)
    } catch (error) {
        if (error instanceof Error && error.message.includes('User force closed')) {
            console.log('\n[CANCELLED] Operation cancelled by user')
        } else {
            console.error('[ERROR]', error instanceof Error ? error.message : error)
        }
        process.exit(1)
    }
}
