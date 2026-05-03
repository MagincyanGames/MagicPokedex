#!/usr/bin/env node

import { createGenerator } from "ts-json-schema-generator";
import fs from "fs";
import path from "path";

const basePath = process.cwd();
const typesFile = path.join(basePath, "app/types/PokemonData.ts");
const schemaDir = path.join(basePath, "public/data/schemas");

// Crear directorio si no existe
if (!fs.existsSync(schemaDir)) {
  fs.mkdirSync(schemaDir, { recursive: true });
}

// Función para agregar $schema como propiedad permitida
function addSchemaProperty(schema) {
  if (schema.$ref) {
    // Si hay un $ref, necesitamos modificar la definición
    const refName = schema.$ref.split("/").pop();
    if (schema.definitions && schema.definitions[refName]) {
      schema.definitions[refName].properties = schema.definitions[refName].properties || {};
      schema.definitions[refName].properties.$schema = {
        type: "string",
        description: "JSON Schema reference"
      };
      schema.definitions[refName].required = schema.definitions[refName].required || [];
      // $schema no es requerido
    }
  }
  // Permitir $schema como propiedad adicional
  schema.properties = schema.properties || {};
  schema.properties.$schema = {
    type: "string",
    description: "JSON Schema reference"
  };
  return schema;
}

try {
  console.log("📝 Generando schemas desde:", typesFile);

  // Generar schema para Author
  console.log("🔄 Generando schema para Author...");
  const authorGenerator = createGenerator({
    tsconfig: path.join(basePath, "tsconfig.json"),
    type: "Author",
    skipTypeCheck: true,
  }, [typesFile]);
  let authorSchema = authorGenerator.createSchema("Author");
  authorSchema = addSchemaProperty(authorSchema);
  console.log("✓ Schema de Author generado");

  // Generar schema para Pokedex
  console.log("🔄 Generando schema para Pokedex...");
  const pokedexGenerator = createGenerator({
    tsconfig: path.join(basePath, "tsconfig.json"),
    type: "Pokedex",
    skipTypeCheck: true,
  }, [typesFile]);
  let pokedexSchema = pokedexGenerator.createSchema("Pokedex");
  pokedexSchema = addSchemaProperty(pokedexSchema);
  console.log("✓ Schema de Pokedex generado");

  // Generar schema para Collection
  console.log("🔄 Generando schema para Collection...");
  const collectionGenerator = createGenerator({
    tsconfig: path.join(basePath, "tsconfig.json"),
    type: "Collection",
    skipTypeCheck: true,
  }, [typesFile]);
  let collectionSchema = collectionGenerator.createSchema("Collection");
  collectionSchema = addSchemaProperty(collectionSchema);
  console.log("✓ Schema de Collection generado");

  // Guardar los schemas
  const authorPath = path.join(schemaDir, "author.json");
  const pokedexPath = path.join(schemaDir, "pokedex.json");
  const collectionPath = path.join(schemaDir, "collection.json");

  const authorJson = JSON.stringify(authorSchema, null, 2);
  const pokedexJson = JSON.stringify(pokedexSchema, null, 2);
  const collectionJson = JSON.stringify(collectionSchema, null, 2);

  console.log(`📊 Escribiendo author.json (${authorJson.length} bytes)`);
  fs.writeFileSync(authorPath, authorJson);

  console.log(`📊 Escribiendo pokedex.json (${pokedexJson.length} bytes)`);
  fs.writeFileSync(pokedexPath, pokedexJson);

  console.log(`📊 Escribiendo collection.json (${collectionJson.length} bytes)`);
  fs.writeFileSync(collectionPath, collectionJson);

  console.log("✅ Schemas generados correctamente:");
  console.log(`   📄 ${authorPath}`);
  console.log(`   📄 ${pokedexPath}`);
  console.log(`   📄 ${collectionPath}`);
} catch (error) {
  console.error("❌ Error generando schemas:", error);
  process.exit(1);
}
