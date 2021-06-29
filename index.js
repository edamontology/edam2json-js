import { parseToJSON } from "./src/parser.js";
import { program } from "commander";
import axios from "axios";

const jsonTreeFromURL = (url) => {
  axios.get(url).then((resp) => {
    parseToJSON(resp.data);
  });
};

const jsonTreeFromFile = (fileExt) => {
  parseToJSON(resp.data);
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

jsonTreeFromURL(
  "https://raw.githubusercontent.com/edamontology/edamontology/main/releases/EDAM_1.25.owl"
);

export { jsonTreeFromFile, jsonTreeFromURL, parseRDF };
