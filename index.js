import { parseToJSON } from "./src/parser.js";
import { program } from "commander";
import { writeJSONFile } from "./src/utils.js";
import * as fs from "fs";

/**
 * Parses an OWL file provided in the command line to a json tree of nodes. Outputs the tree to the console.
 * @param {string} filePath The path of the OWL file to be parsed
 */
const jsonTreeFromFile = (input, output) => {
  var owlText = fs.readFileSync(input, "utf-8");
  parseToJSON(
    owlText,
    (tree, output) => {
      if (output) writeJSONFile(tree, output);
      else console.log(tree);
    },
    output
  );
};

program
  .version("0.1.0")
  .description("Converts EDAM to different formats")
  .option(
    "-jt,--jsontree [input]",
    "Generate a json representation of the EDAM hierarchy"
  )
  .option("-o [output],", "optional output file");

program.parse();

const options = program.opts();
if (options.jsontree) jsonTreeFromFile(options.jsontree, options.o);
