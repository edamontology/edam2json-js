import { parseToJSON } from "./src/parser.js";
//import { program } from "commander";
import axios from "axios";

/**
 * Parses an OWL file to a json tree of nodes
 * @param {string} url The URL of the owl file in raw format e.g "https://raw.githubusercontent.com/edamontology/edamontology/main/releases/EDAM_1.25.owl"
 * @param {function} callback The callback function to be executed after the tree is ready e.g (tree) => {console.log(tree)}
 */
const jsonTreeFromURL = (url, callback) => {
  axios.get(url).then((resp) => {
    parseToJSON(resp.data, callback);
  });
};

/**
 * Parses an OWL file provided in the command line to a json tree of nodes. Outputs the tree to the console.
 * @param {string} filePath The path of the OWL file to be parsed
 */
const jsonTreeFromFile = (filePath) => {
  //to be implemented
};

/**
 * Parses an OWL file provided in the command line to a list of RDFs. Outputs the list to the console.
 * @param {string} filePath The path of the OWL file to be parsed
 */
const parseRDF = (filePath) => {};

/*program.option(
  "-jt,--jsontree [edam-owl-file]",
  "Generate a json representation of the EDAM hierarchy"
);

//to be implemented
program.option(
  "-jld,--jsonld [edam-owl-file]",
  "Generate a json-ld formatted version of EDAM"
);

program.parse();*/

jsonTreeFromURL(
  "https://raw.githubusercontent.com/edamontology/edamontology/main/EDAM_dev.owl",
  (tree) => {
    console.log(tree);
  }
);

export { jsonTreeFromURL, parseRDF };
