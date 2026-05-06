import { createGenerator } from "ts-json-schema-generator";
import path from "path";

const basePath = process.cwd();
const typesFile = path.join(basePath, "app/types/PokemonData.ts");

const generator = createGenerator({
  tsconfig: path.join(basePath, "tsconfig.json"),
  type: "Pokemon",
  skipTypeCheck: true,
}, [typesFile]);

const schema = generator.createSchema("Pokemon");
console.log(JSON.stringify(schema, null, 2));
