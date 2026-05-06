import ts from "typescript";
import fs from "fs";
import path from "path";

const source = fs.readFileSync("app/types/PokemonData.ts", "utf-8");
const sourceFile = ts.createSourceFile("PokemonData.ts", source, ts.ScriptTarget.Latest, true);

function visit(node, depth = 0) {
  const indent = "  ".repeat(depth);
  
  if (ts.isTypeAliasDeclaration(node)) {
    if (node.name.text === "Pokemon") {
      console.log(`${indent}Type: ${node.name.text}`);
      if (ts.isTypeLiteralNode(node.type)) {
        node.type.members.forEach(member => {
          console.log(`${indent}  - ${member.name.text}: ${member.type.kind}`);
        });
      }
    }
  }
  
  ts.forEachChild(node, child => visit(child, depth + 1));
}

visit(sourceFile);
