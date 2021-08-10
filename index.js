import { parseToJSON } from "./src/parser.js";
import { program } from "commander";
import { writeJSONFile } from "./src/utils.js";
import * as fs from "fs";

/**
 * Parses an OWL file provided in the command line to a json tree of nodes. Outputs the tree to the console.
 * @param {string} filePath The path of the OWL file to be parsed
 */
const jsonTreeFromFile = (filePath) => {
  var owlText = fs.readFileSync(filePath, "utf-8");
  parseToJSON(owlText, writeJSONFile);
};

program.option(
  "-jt,--jsontree [edam-owl-file]",
  "Generate a json representation of the EDAM hierarchy",
  jsonTreeFromFile
);

program.parse();
