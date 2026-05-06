#!/usr/bin/env node

import * as TJS from "typescript-json-schema";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const basePath = path.join(__dirname, "..");
const typesFile = path.join(basePath, "app/types/PokemonData.ts");
const schemaDir = path.join(basePath, "public/data/schemas");
const tsconfigPath = path.join(basePath, "tsconfig.schema.json");

// Crear directorio si no existe
if (!fs.existsSync(schemaDir)) {
  fs.mkdirSync(schemaDir, { recursive: true });
}

// Función para generar schema para un tipo específico
function generateSchemaForType(typeName: string): Record<string, any> {
  try {
    console.log(`🔄 Generando schema para ${typeName}...`);

    // Configurar las opciones del generador
    const settings: TJS.PartialArgs = {
      required: true,
      titles: true,
      defaultProps: false,
      noExtraProps: false,
      propOrder: false,
      typeOfKeyword: false,
      additionalProperties: true,
      ignoreErrors: true,
      topRef: true,
      exposedTypes: ["AuthorEntry", "PokemonForm", "Pokemon"],
      jsDoc: "extended",
    };

    // Crear el programa de TypeScript con opcionesPersonalizadas
    const compilerOptions: any = {
      target: "ES2022",
      module: "ES2022",
      moduleResolution: "node",
      lib: ["ES2022"],
      skipLibCheck: true,
      strict: false,
      esModuleInterop: true,
    };

    // Crear el programa de TypeScript
    const program = TJS.getProgramFromFiles(
      [typesFile],
      settings,
      tsconfigPath,
      undefined,
      undefined,
      compilerOptions
    );

    // Generar el schema
    let schema = TJS.generateSchema(program, typeName, settings);

    if (!schema) {
      throw new Error(`No se pudo generar schema para ${typeName}`);
    }

    // Post-procesamiento: agregar definiciones faltantes para Record types
    if (typeName === "AuthorJSON") {
      // Buscar y arreglar la definición del Record<string, AuthorEntryJSON>
      if (schema.definitions) {
        const recordKey = "Record<string,AuthorEntryJSON>";
        
        // Arreglar la definición del Record si existe
        if (schema.definitions[recordKey]) {
          schema.definitions[recordKey] = {
            title: recordKey,
            type: "object",
            additionalProperties: {
              $ref: "#/definitions/AuthorEntryJSON"
            }
          };
        }
      }
      
      // Agregar definición de AuthorEntryJSON (unión: string | AuthorEntry)
      if (!schema.definitions.AuthorEntryJSON) {
        schema.definitions.AuthorEntryJSON = {
          anyOf: [
            {
              type: "string"
            },
            {
              $ref: "#/definitions/AuthorEntry"
            }
          ],
          title: "AuthorEntryJSON"
        };
      }
      
      // Agregar definición de AuthorEntry
      if (!schema.definitions.AuthorEntry) {
        schema.definitions.AuthorEntry = {
          type: "object",
          properties: {
            base: {
              type: "string",
              title: "base"
            },
            forms: {
              $ref: "#/definitions/FormsRecord",
              title: "forms"
            }
          },
          title: "AuthorEntry"
        };
      }

      // Agregar definición de FormsRecord
      if (!schema.definitions.FormsRecord) {
        schema.definitions.FormsRecord = {
          title: "FormsRecord",
          type: "object",
          additionalProperties: {
            type: "string"
          }
        };
      }
    }

    // Post-procesamiento para Pokedex
    if (typeName === "Pokedex" && schema.definitions?.PokemonRecord) {
      schema.definitions.PokemonRecord = {
        title: "PokemonRecord",
        type: "object",
        additionalProperties: {
          $ref: "#/definitions/Pokemon"
        }
      };
    }

    console.log(`✓ Schema de ${typeName} generado`);
    return schema;
  } catch (error) {
    console.error(`❌ Error generando schema para ${typeName}:`, error);
    throw error;
  }
}

// Función para guardar un schema
function saveSchema(filename: string, schema: Record<string, any>): void {
  const filepath = path.join(schemaDir, filename);
  const json = JSON.stringify(schema, null, 2);
  fs.writeFileSync(filepath, json);
  console.log(`📊 Schema guardado en ${filename} (${json.length} bytes)`);
}

// Tipos a generar
const typesToGenerate = [
  { typeName: "AuthorJSON", filename: "author.json" },
  { typeName: "Pokedex", filename: "pokedex.json" },
  { typeName: "CollectionJSON", filename: "collection.json" },
];

try {
  console.log("📝 Iniciando generación de schemas...");
  console.log(`📂 Leyendo tipos desde: ${typesFile}`);
  console.log(`💾 Guardando schemas en: ${schemaDir}\n`);

  // Generar y guardar cada schema
  for (const { typeName, filename } of typesToGenerate) {
    const schema = generateSchemaForType(typeName);
    saveSchema(filename, schema);
  }

  console.log("\n✅ ¡Generación completada exitosamente!");
} catch (error) {
  console.error("\n❌ Error durante la generación de schemas:", error);
  process.exit(1);
}
