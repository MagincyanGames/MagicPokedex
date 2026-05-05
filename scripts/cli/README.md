# 🎮 Poke CLI - Herramienta de Gestión de Pokémon

Una CLI interactiva para añadir Pokémon fácilmente a los Pokédex de MagicPokedex.

## 📋 Requisitos

- Node.js 16+
- npm o pnpm

## 🚀 Instalación

La CLI ya está instalada como parte del proyecto. Las dependencias necesarias son:
- `commander`: Para gestionar los comandos CLI
- `inquirer`: Para prompts interactivos

## 💻 Comandos Disponibles

### `poke version`
Muestra la versión actual de la CLI.

```bash
npm run poke -- version
```

**Salida:**
```
poke-cli v1.0.0
CLI para gestionar Pokémon en MagicPokedex
```

### `poke help`
Muestra la ayuda con todos los comandos disponibles.

```bash
npm run poke -- help
```

**Salida:**
```
╔════════════════════════════════════════════════════════════╗
║                    POKE CLI - Ayuda                         ║
╚════════════════════════════════════════════════════════════╝

Comandos disponibles:

  poke version              Muestra la versión de la CLI
  poke help                 Muestra esta ayuda
  poke add [nombre]         Añade un nuevo Pokémon de forma interactiva
  ...
```

### `poke add [nombre]`
Abre un asistente interactivo para añadir un nuevo Pokémon.

**Opciones:**
- Sin argumentos: `npm run poke -- add`
- Con nombre: `npm run poke -- add bulbasaur`

**Proceso Interactivo:**
1. Elige el Pokédex donde añadir el Pokémon (kanto, hoenn, alola, etc.)
2. Ingresa el nombre del Pokémon
3. Proporciona el número (se sugiere automáticamente el siguiente disponible)
4. Opcionalmente, proporciona una URL de sprite
5. Opcionalmente, añade formas alternativas del Pokémon
6. Confirma antes de guardar

**Ejemplo:**
```bash
npm run poke -- add pikachu
```

## 📝 Ejemplos de Uso

### Ejemplo 1: Añadir un Pokémon simple

```bash
npm run poke -- add squirtle
```

Seguirás estos pasos:
- Selecciona el Pokédex (p. ej., "kanto")
- Confirma el nombre "squirtle"
- Ingresa el número (p. ej., 7)
- Omite sprite y formas

### Ejemplo 2: Añadir un Pokémon con formas

```bash
npm run poke -- add eevee
```

Seguirás estos pasos:
- Selecciona el Pokédex (p. ej., "hoenn")
- Confirma el nombre "eevee"
- Ingresa el número (p. ej., 133)
- Opcionalmente proporciona un sprite
- Indica que sí tiene formas alternativas
- Añade formas como "vaporeon", "jolteon", "flareon", etc.

### Ejemplo 3: Modo interactivo puro

```bash
npm run poke -- add
```

Te pedirá todo interactivamente, incluyendo el nombre.

## 🗂️ Estructura del Proyecto

```
scripts/cli/
├── poke.ts           # Archivo principal - punto de entrada
├── utils.ts          # Utilidades para leer/escribir JSON
├── commands/
│   ├── version.ts    # Comando version
│   ├── help.ts       # Comando help
│   └── add.ts        # Comando add (interactivo)
└── README.md         # Esta documentación
```

## 📊 Estructura de Datos

### Pokédex JSON

```json
{
  "$schema": "../schemas/pokedex.json",
  "name": "kanto",
  "pokemons": [
    {
      "number": 1,
      "name": "bulbasaur",
      "sprite": "https://...",
      "forms": {
        "mega": {
          "name": "mega",
          "sprite": "https://..."
        }
      }
    }
  ]
}
```

### Campos de Pokémon

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `number` | number | ✅ | Número Pokédex del Pokémon |
| `name` | string | ✅ | Nombre del Pokémon (en minúsculas) |
| `sprite` | string | ❌ | URL de la imagen sprite del Pokémon |
| `forms` | object | ❌ | Objeto con formas alternativas |

## ✨ Características

- ✅ Validación de nombres duplicados
- ✅ Validación de números duplicados
- ✅ Sugerencia automática del siguiente número disponible
- ✅ Interfaz amigable con emojis
- ✅ Soporte para formas alternativas
- ✅ Confirmación antes de guardar
- ✅ Ordenamiento automático por número

## 🐛 Solución de Problemas

### Error: "No hay dexes disponibles"
Asegúrate de que existen archivos JSON en `public/data/dexes/`.

### Error: "El Pokémon ya existe"
Otro Pokémon con el mismo nombre o número ya existe en el dex seleccionado.

### Cambios no se guardan
Los archivos se guardan automáticamente en `public/data/dexes/`. Verifica los permisos de escritura.

## 🔧 Desarrollo

Para modificar o extender la CLI:

1. Edita los archivos en `scripts/cli/`
2. Los cambios se reflejarán automáticamente al ejecutar `npm run poke`
3. Para añadir nuevos comandos, crea un archivo en `scripts/cli/commands/` y regístralo en `poke.ts`

## 📦 Dependencias

- **commander** (^7.0.0): Marco de trabajo para CLI
- **inquirer** (^9.0.0): Prompts interactivos en terminal

## 📄 Licencia

Este proyecto es parte de MagicPokedex.
