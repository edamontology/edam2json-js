import { parseToJSON } from "./src/parser.js";
import axios from "axios";

/**
 * Parses an OWL file to a json tree of nodes
 * @param {string} url The URL of the owl file in raw format e.g "https://raw.githubusercontent.com/edamontology/edamontology/main/releases/EDAM_1.25.owl"
 * @param {function} onSuccess The callback function to be executed after the tree is ready e.g (tree) => {console.log(tree)}
 * @param {function} onError The callback function to be executed in case of an error
 */
const jsonTreeFromURL = (url, onSuccess, onError) => {
  axios
    .get(url)
    .then((resp) => {
      parseToJSON(resp.data, onSuccess);
    })
    .catch((err) => {
      onError(err);
    });
};

/**
 * Parses an OWL file to a json tree of nodes
 * @param {string} text the string containing the OWL file content
 * @param {function} onSuccess The callback function to be executed after the tree is ready e.g (tree) => {console.log(tree)}
 */
const jsonTreeFromString = (text, onSuccess) => {
  parseToJSON(text, onSuccess);
};

export { jsonTreeFromURL, jsonTreeFromString };
