# Poke CLI - Updated Commands

## Comandos Disponibles

### 1. `poke version`
Muestra la versión actual de la CLI.

```bash
poke version
# Output: poke-cli v1.0.0
```

### 2. `poke help`
Muestra todos los comandos disponibles.

```bash
poke help
```

### 3. `poke add [dex] [name]`
Añade un nuevo Pokémon de forma interactiva.

```bash
poke add                           # Te pide dex y nombre interactivamente
poke add kanto                     # Te pide nombre, usa kanto
poke add teselia oshawott          # Añade oshawott a teselia directamente
```

**Características:**
- Selección de Pokédex (ordenadas por generación)
- Validación de nombres duplicados
- Sugerencia automática del siguiente número
- Opción para agregar sprites
- Soporte para formas alternativas

### 4. `poke list [dex]`
Lista todos los Pokémon en un Pokédex.

```bash
poke list                 # Te pide el dex interactivamente (ordenados por gen)
poke list kanto           # Lista todos los Pokémon de Kanto
```

**Salida:**
```
[LIST] Pokemon in "kanto" (Gen 1.0, 151 total):
------------------------------------------------------------
  #001 bulbasaur....................
  #002 ivysaur......................
  #003 venusaur.....................
```

### 5. `poke edit [dex] [pokemon]` ⭐ NUEVO
Edita un Pokémon existente.

```bash
poke edit                          # Te pide dex y pokemon interactivamente
poke edit kalos meowstic           # Edita meowstic en kalos
poke edit paldea 915              # Edita por número
```

**Opciones de edición:**
- Editar nombre
- Editar número
- Editar sprite
- Gestionar formas:
  - Agregar nueva forma
  - Ver formas existentes
  - Remover forma

**Ejemplo interactivo:**
```bash
$ poke edit paldea iron-thorns

[INFO] Editing Pokemon: #955 iron-thorns
✔ What do you want to edit? Manage forms
✔ What do you want to do with forms? Add new form
? Form name: terastallized
? Sprite URL for this form (optional): https://...
[SUCCESS] Form "terastallized" added
```
  ...
------------------------------------------------------------
```

## Ejemplos de Uso

### Flujo 1: Agregar un Pokémon sin formas
```bash
poke add
# Selecciona dex
# Ingresa nombre: squirtle
# Ingresa número: 7
# Omite sprite (Enter)
# Responde "No" a formas alternativas
# Confirma
```

### Flujo 2: Agregar un Pokémon CON formas
```bash
poke add
# Selecciona dex
# Ingresa nombre: eevee
# Ingresa número: 133
# Omite sprite (Enter)
# Responde "Yes" a formas alternativas
# Agrega: vaporeon, jolteon, flareon, etc.
# Confirma
```

### Flujo 3: Editar un Pokémon
```bash
poke edit                          # Te pide dex y nombre/número interactivamente
poke edit kanto                    # Te pide el nombre/número del pokemon
poke edit paldea iron-thorns       # Edita iron-thorns en paldea directamente
```

Opciones de edición:
- Editar sprite
- Gestionar formas (agregar, ver, remover)

### Flujo 4: Listado ordenado por generación
```bash
poke list                 # Te pide dex, muestra pokémon ordenados por número
poke list kalos           # Muestra todos los pokémon de Kalos

# Output:
# [LIST] Pokemon in "kalos" (Gen 6.0, 72 total):
# ----------------------------------------------------------
#   #001 chespin....................
#   #002 quilladin..................
```

## Comandos Disponibles

- `poke version` - Mostrar versión
- `poke help` - Mostrar ayuda
- `poke add [dex] [name]` - Agregar Pokémon
- `poke edit [dex] [pokemon]` - Editar Pokémon existente
- `poke list [dex]` - Listar Pokémon por región

## Características

- ✅ Regiones ordenadas por generación
- ✅ Soporte para formas (agregar, ver, remover)
- ✅ Edición de sprites
- ✅ Validación de datos
- ✅ Parámetros opcionales en línea de comandos

## Próximas Mejoras (Opcional)

- [ ] Filtrado en vivo mientras escribes (actualmente requiere flechas)
- [ ] Mostrar formas alternativas en búsqueda
- [ ] Exportar resultados a archivo
- [ ] Eliminar Pokémon
- [ ] Editar Pokémon existentes
