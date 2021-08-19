import { parseToJSON, parseToTable } from "./src/parser.js";
import { program } from "commander";
import { writeJSONFile, writeFile } from "./src/utils.js";
import * as fs from "fs";

/**
 * Parses an OWL file provided in the command line to a json tree of nodes. Outputs the tree to the console or to a file.
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

/**
 * Parses an OWL file provided in the command line to a tsv file. Outputs the tsv string to the console or to a file.
 * @param {string} filePath The path of the OWL file to be parsed
 */
const TSVFromFile = (input, output) => {
  var owlText = fs.readFileSync(input, "utf-8");
  parseToTable(
    owlText,
    (tsv, output) => {
      if (output) writeFile(tsv, output);
      else console.log(tsv);
    },
    "\t",
    output
  );
};

/**
 * Parses an OWL file provided in the command line to a csv file. Outputs the csv string to the console or to a file.
 * @param {string} filePath The path of the OWL file to be parsed
 */
const CSVFromFile = (input, output) => {
  var owlText = fs.readFileSync(input, "utf-8");
  parseToTable(
    owlText,
    (csv, output) => {
      if (output) writeFile(csv, output);
      else console.log(csv);
    },
    ",",
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
  .option("-t,--tsv [input]", "Generate a tsv representation of EDAM")
  .option("-c,--csv [input]", "Generate a csv representation of EDAM")
  .option("-o [output],", "optional output file");

program.parse();

const options = program.opts();
if (options.jsontree) jsonTreeFromFile(options.jsontree, options.o);
else if (options.tsv) TSVFromFile(options.tsv, options.o);
else if (options.csv) CSVFromFile(options.csv, options.o);
