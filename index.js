import { parseToJSON } from "./src/parser.js";
import { program } from "commander";

program.option(
  "-jt,--jsontree [edam-owl-file]",
  "Generate a json representation of the EDAM hierarchy",
  jsonTree
);

//to be implemented
program.option(
  "-jld,--jsonld [edam-owl-file]",
  "Generate a json-ld formatted version of EDAM"
);

function jsonTree(fileExt, dummyPrevious) {
  parseToJSON(fileExt);
}

program.parse();
