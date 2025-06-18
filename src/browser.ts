import { parseToJSON } from "./parser";

/**
 * Parses an OWL file to a json tree of nodes
 * @param {string} url The URL of the owl file in raw format e.g "https://raw.githubusercontent.com/edamontology/edamontology/main/releases/EDAM_1.25.owl"
 * @param {function} onSuccess The callback function to be executed after the tree is ready e.g (tree) => {console.log(tree)}
 * @param {function} onError The callback function to be executed in case of an error
 */
async function jsonTreeFromURL(
  url: string,
  onSuccess: () => void,
  onError: (err: Error) => void,
) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Fetch call failed");

    const data = await response.json();
    parseToJSON(data, onSuccess);
  } catch (err) {
    onError(err);
  }
}

/**
 * Parses an OWL file to a json tree of nodes
 * @param {string} text the string containing the OWL file content
 * @param {function} onSuccess The callback function to be executed after the tree is ready e.g (tree) => {console.log(tree)}
 */
function jsonTreeFromString(text: string, onSuccess: () => void) {
  parseToJSON(text, onSuccess);
}

export { jsonTreeFromURL, jsonTreeFromString };
