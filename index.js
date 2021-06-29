import { parseToJSON } from "./src/parser.js";
import { program } from "commander";
import * as fs from "fs";

const jsonTreeFromFile = (fileExt) => {
  //string, not file will be passed
  var text = fs.readFileSync(fileExt, "utf-8");
  parseToJSON(text);
};

const parseRDF = (fileExt) => {};

program.option(
  "-jt,--jsontree [edam-owl-file]",
  "Generate a json representation of the EDAM hierarchy",
  jsonTreeFromFile
);

//to be implemented
program.option(
  "-jld,--jsonld [edam-owl-file]",
  "Generate a json-ld formatted version of EDAM"
);

program.parse();

jsonTreeFromFile("EDAM_1.25.owl");

export { jsonTreeFromFile, parseRDF };
