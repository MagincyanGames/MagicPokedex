# Script de Generación de Schemas JSON

Este script genera automáticamente schemas JSON basados en los tipos TypeScript definidos en `app/types/PokemonData.ts`.

## ¿Por qué?

En lugar de escribir manualmente los schemas JSON cada vez que modifiques los tipos TypeScript, este script lo hace automáticamente utilizando la librería `ts-json-schema-generator`.

## Tipos Soportados

El script genera schemas para:

- **Author**: Autor de custom Pokémons con la estructura de `PokemonAuthorEntry` que soporta:
  - `string`: Referencia simple a un sprite
  - `{ base: string; forms?: Record<string, string> }`: Referencia con soporte para formas alternativas

- **Pokedex**: Colección de Pokémons con su información

## Cómo Usar

### Generar los Schemas

```bash
npm run generate-schemas
```

Esto generará dos archivos JSON en `public/data/schemas/`:
- `author.json` - Schema para validar estructuras de Author
- `pokedex.json` - Schema para validar estructuras de Pokedex

### Integración Automática

Si quieres que los schemas se regeneren automáticamente cada vez que cambies los tipos:

```bash
# Generar schemas y luego compilar
npm run generate-schemas && npm run typecheck
```

O en el build:

```bash
# Para agregar a build workflow
npm run generate-schemas && npm run build
```

## Características del Script

✅ Genera tipos union correctamente (ej: `PokemonAuthorEntry = string | {...}`)  
✅ Incluye tipos anidados automáticamente  
✅ Soporta tipos complejos como `Record<string, T>` y arrays  
✅ Genera válido JSON Schema (draft-07)  
✅ Output bien formateado con indentación

## Archivos Generados

- `public/data/schemas/author.json` - 1KB aproximadamente
- `public/data/schemas/pokedex.json` - 1.3KB aproximadamente

## Notas Técnicas

- Usa `ts-json-schema-generator` v2.9.0
- Los schemas se validan contra el estándar JSON Schema Draft-07
- Los tipos opcionales se marcan correctamente con `required`
- Las propiedades adicionales están deshabilitadas (`additionalProperties: false`)

## Solución de Problemas

Si el script falla:

1. Verifica que `tsconfig.json` existe en la raíz del proyecto
2. Asegúrate de que `app/types/PokemonData.ts` existe
3. Ejecuta `npm install` para asegurar todas las dependencias
4. Revisa los warnings de TypeScript (pueden no ser críticos)

## Próximas Mejoras

Posibles mejoras futuras:
- [ ] Generar schemas adicionales (Pokemon, PokemonForm)
- [ ] Validación de datos JSON contra los schemas
- [ ] CLI para generar schemas individuales
- [ ] Integración con watch mode
