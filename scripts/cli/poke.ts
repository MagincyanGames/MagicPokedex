#!/usr/bin/env node

import { program } from 'commander'
import { addPokemon } from './commands/add.js'
import { helpCommand } from './commands/help.js'
import { versionCommand } from './commands/version.js'
import { listPokemon } from './commands/list.js'
import { editPokemon } from './commands/edit.js'

const packageJson = {
  version: '1.0.0',
  name: 'poke-cli',
  description: 'CLI tool for managing Pokemon in MagicPokedex'
}

program
  .name('poke')
  .description(packageJson.description)
  .version(packageJson.version, '-v, --version')

// version command
program
  .command('version')
  .description('Show the CLI version')
  .action(versionCommand)

// help command
program
  .command('help')
  .description('Show the help for available commands')
  .action(helpCommand)

// add command (default when no command specified)
program
  .command('add [dex] [name]')
  .description('Add a new Pokemon interactively')
  .action(addPokemon)

// list command
program
  .command('list [dex]')
  .description('List all Pokemon in a Pokedex')
  .action(listPokemon)

// edit command
program
  .command('edit [dex] [pokemon]')
  .description('Edit an existing Pokemon (add/edit forms, sprite, etc.)')
  .action(editPokemon)



// If no arguments, show help
if (!process.argv.slice(2).length) {
  program.outputHelp()
}

program.parse(process.argv)
