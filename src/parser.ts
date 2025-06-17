import { RdfXmlParser } from "rdfxml-streaming-parser";
import { classVal, subClassVal, schemaMap, metaMap, tsvMap } from "./maps";

interface NodeData {
  uri: string;
  prefixID: string;
  subclasses: string[];
  superclasses: string[];
  [key: string]: any;
}

interface ParsedRdfObject {
  subject: { value: string; termType: string };
  predicate: { value: string; termType: string };
  object: { value: string; termType: string };
}

interface TreeConfig {
  children: TreeConfig[];
  data: { uri: string };
  meta?: { [key: string]: string };
  [key: string]: any;
}

//current supported classes top level (topic, data, operation, format, deprecated)
const edamRe = new RegExp(
  "^((http|https)://edamontology.org/(data|format|operation|topic)_|http://www.w3.org/2002/07/owl#DeprecatedClass|http://webprotege.stanford.edu/)",
  "i",
);

let meta: { [key: string]: string } = {};
let classes: { [key: string]: NodeData } = {};

/**
 * Parses an OWL EDAM file to a json format.
 * @param {string} text file as a string
 * @param {(tree: TreeConfig, outputPath?: string) => void} callback function to call in case of success
 * @param {string} [outputPath] optional Output file path to write to
 */
function parseToJSON(
  text: string,
  callback: (tree: TreeConfig, outputPath?: string) => void,
  outputPath?: string,
) {
  const myParser = new RdfXmlParser();
  meta = {};
  classes = {};

  const textByLine = text.split("\n");

  const parserObjs: ParsedRdfObject[] = [];
  myParser
    .on("data", (data: ParsedRdfObject) => {
      parserObjs.push(data);
    })
    .on("error", console.error)
    .on("end", () => {
      console.log("All triples were parsed!");
      console.timeEnd("parse");
      console.time("loop");
      constructJSON(parserObjs);
      console.timeEnd("loop");
      const tree = makeTree(classes);
      if (outputPath) callback(tree, outputPath);
      else callback(tree);
    });

  console.time("parse");
  textByLine.forEach((textLine) => {
    myParser.write(textLine);
  });

  myParser.end();
}

/**
 * Parses an OWL EDAM file to a tsv format or csv
 * @param {string} text file as a string
 * @param {(text: string, outputPath?: string) => void} callback function to call in case of success
 * @param {string} separator separator according to type of file needed either ',' or '/t'
 * @param {string} [outputPath] optional Output file path to write to
 */
function parseToTable(
  text: string,
  callback: (text: string, outputPath?: string) => void,
  separator: string,
  outputPath?: string,
) {
  const myParser = new RdfXmlParser();
  meta = {};
  classes = {};

  const textByLine = text.split("\n");

  const parserObjs: ParsedRdfObject[] = [];
  myParser
    .on("data", (data: ParsedRdfObject) => {
      parserObjs.push(data);
    })
    .on("error", console.error)
    .on("end", () => {
      console.log("All triples were parsed!");
      console.timeEnd("parse");
      console.time("loop");
      constructJSON(parserObjs);
      console.timeEnd("loop");
      const resultText = makeTSV(separator, classes);
      if (outputPath) callback(resultText, outputPath);
      else callback(resultText);
    });

  console.time("parse");
  textByLine.forEach((textLine) => {
    myParser.write(textLine);
  });

  myParser.end();
}

/**
 * Constructs a json tree compliant with EDAM schema.
 * @param {ParsedRdfObject[]} parsedRDF array of parsed RDF objects
 *
 */
function constructJSON(parsedRDF: ParsedRdfObject[]) {
  //populating the classes array
  for (let i = 0; i < parsedRDF.length; i++) {
    const current = parsedRDF[i];

    //parsing the nodes
    if (
      current.object.value === classVal &&
      edamRe.test(current.subject.value)
    ) {
      //if the node doesn't exist, create it
      if (!(current.subject.value in classes)) {
        createNode(current.subject.value);
      }
    }
    //parsing subclasses+blank nodes e.g has_topic, is_identifier_of etc.
    else if (
      current.predicate.value === subClassVal &&
      current.object.termType === "BlankNode"
    ) {
      if (!(current.subject.value in classes)) {
        createNode(current.subject.value);
      }
      const nodeValue = classes[current.subject.value];
      const relationName = parsedRDF[i + 1].object.value.split("/").pop();

      if (relationName) {
        if (relationName in nodeValue) {
          (nodeValue[relationName] as string[]).push(
            parsedRDF[i + 2].object.value,
          );
        } else {
          nodeValue[relationName] = [parsedRDF[i + 2].object.value];
        }
      }
    }
    //parsing subclasses
    else if (
      current.predicate.value === subClassVal &&
      edamRe.test(current.object.value)
    ) {
      //updating the subclass
      if (!(current.subject.value in classes)) {
        createNode(current.subject.value);
      }
      const nodeValue = classes[current.subject.value];
      nodeValue.superclasses.push(current.object.value);
    }
    //parsing properties
    else if (
      current.predicate.value !== subClassVal &&
      current.object.value !== classVal &&
      edamRe.test(current.subject.value)
    ) {
      let propName = current.predicate.value;
      if (propName in schemaMap) {
        propName = schemaMap[propName];
      }
      const propValue = current.object.value;
      if (!(current.subject.value in classes)) {
        createNode(current.subject.value);
      }
      const nodeValue = classes[current.subject.value];
      if (!propName) continue;

      //create an array if the property has more than one value
      if (propName in nodeValue) {
        const existingValue = nodeValue[propName];
        if (Array.isArray(existingValue)) {
          existingValue.push(propValue);
        } else {
          nodeValue[propName] = [existingValue, propValue];
        }
      } else {
        nodeValue[propName] = propValue;
      }
    }
    //populating the ontology's meta data, add to metaMap for more meta data
    else if (current.predicate.value in metaMap) {
      meta[metaMap[current.predicate.value]] = current.object.value;
    }
  }
}

/**
 * Turns an array of json objects to a tree using superclasses and subclasses.
 * @param {object} nodes array of all nodes (flattened)
 * @returns {TreeConfig} The constructed tree.
 */
function makeTree(nodes: { [key: string]: NodeData }): TreeConfig {
  const hashTable: { [key: string]: TreeConfig } = Object.create(null);

  Object.entries(nodes).forEach(([key, value]) => {
    const { data: nodeData, ...rest } = value;
    hashTable[key] = {
      children: [],
      data: { uri: nodeData.uri },
      ...rest,
    };
  });

  const dataTree: TreeConfig[] = [];

  Object.entries(nodes).forEach(([key, value]) => {
    //omitting superclasses and subclasses from the generated json file
    delete (hashTable[key] as any).superclasses;
    delete (hashTable[key] as any).subclasses;

    if (value.superclasses.length > 0) {
      value.superclasses.forEach((parent) => {
        if (hashTable[parent]) {
          hashTable[parent].children.push(hashTable[key]);
        }
      });
    } else {
      dataTree.push(hashTable[key]);
    }
  });

  const treeRoot: TreeConfig = {
    children: dataTree,
    data: { uri: "owl:Thing" },
    meta: meta,
  };
  return treeRoot;
}

/**
 * Turns an array of json objects to a tsv/csv string.
 * @param {string}  separator type of separator either ',' or '/t'
 * @param {object} nodes array of all nodes (flattened)
 * @returns {string} The TSV/CSV string.
 */
function makeTSV(
  separator: string,
  nodes: { [key: string]: NodeData },
): string {
  let text = "";
  for (const prop in tsvMap) {
    text += prop + separator;
  }
  text += "\n";

  Object.entries(nodes).forEach(([, value]) => {
    for (const prop in tsvMap) {
      const mapProp = tsvMap[prop];
      if (mapProp !== "") {
        const propValue = value[mapProp];
        if (propValue) {
          text += Array.isArray(propValue)
            ? propValue.filter((item: string) => item).join("|") + separator
            : propValue + separator;
        } else {
          text += separator;
        }
      } else {
        text += separator;
      }
    }
    text += "\n";
  });
  return text;
}

/**
 * Creates a new node in the `classes` object.
 * @param {string} uriVal the uri of the node to be created
 */
function createNode(uriVal: string) {
  const prefixID = uriVal.split("/").pop() || "";
  classes[uriVal] = {
    data: { uri: uriVal },
    uri: uriVal,
    prefixID: prefixID,
    subclasses: [],
    superclasses: [],
  };
}

export { parseToJSON, parseToTable };
