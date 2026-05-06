import { createGenerator } from "ts-json-schema-generator";
import path from "path";

const basePath = process.cwd();
const typesFile = path.join(basePath, "app/types/PokemonData.ts");

const generator = createGenerator({
  tsconfig: path.join(basePath, "tsconfig.json"),
  type: "Pokemon",
  skipTypeCheck: true,
  sortProps: false,  // Desactivar ordenamiento
  strictTuples: false,
  exposeJsonSchema: true,
}, [typesFile]);

const schema = generator.createSchema("Pokemon");
console.log("Pokemon properties:", Object.keys(schema.definitions.Pokemon.properties));
console.log("\nFull schema:");
console.log(JSON.stringify(schema, null, 2));
