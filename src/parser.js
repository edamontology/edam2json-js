import { RdfXmlParser } from "rdfxml-streaming-parser";
import { writeJSONFile } from "./utils.js";
const classVal = "http://www.w3.org/2002/07/owl#Class";
const subClassVal = "http://www.w3.org/2000/01/rdf-schema#subClassOf";

const schemMap = {
  hasDefinition: "definition",
  label: "text",
  hasExactSynonym: "exact_synonyms",
  hasNarrowSynonym: "narrow_synonyms",
};

//map for meta data for the whole ontology
const metaMap = {
  "http://purl.obolibrary.org/obo/date": "date",
  "http://usefulinc.com/ns/doap#Version": "version",
};

//current supported classes top level (topic, data, operation, format, deprecated)
var edamRe = new RegExp(
  "^((http|https)://edamontology.org/(data|format|operation|topic)|http://www.w3.org/2002/07/owl#DeprecatedClass)",
  "i"
);

let meta = {};
let classes = [];
const myParser = new RdfXmlParser();

/**
 * Parses an OWL EDAM file to a json format.
 * @param {string} text file as a string
 *
 */
const parseToJSON = (text, callback) => {
  var textByLine = text.split("\n");

  let parserObjs = [];
  myParser
    .on("data", (data) => {
      parserObjs.push(data);
    })
    .on("error", console.error)
    .on("end", () => {
      console.log("All triples were parsed!");
      constructJSON(parserObjs);
      const tree = makeTree(classes);
      callback(tree);
    });

  textByLine.forEach((textLine) => {
    myParser.write(textLine);
  });

  myParser.end();
};

/**
 * Constructs a json tree compliant with EDAM schema.
 * @param {object[]} parsedRDF array of parsed RDF objects
 *
 */
const constructJSON = (parsedRDF) => {
  //populating the classes array
  for (let i = 0; i < parsedRDF.length; i++) {
    const subclass =
      parsedRDF[i].predicate.value == subClassVal &&
      edamRe.test(parsedRDF[i].object.value);
    parsedRDF[i].object.value == classVal;

    const subclassRelation =
      parsedRDF[i].predicate.value == subClassVal &&
      parsedRDF[i].object.termType == "BlankNode";

    const property =
      parsedRDF[i].predicate.value != subClassVal &&
      parsedRDF[i].object.value != classVal &&
      edamRe.test(parsedRDF[i].subject.value);

    //parsing the nodes
    if (
      parsedRDF[i].object.value == classVal &&
      edamRe.test(parsedRDF[i].subject.value)
    ) {
      //if the node doesn't exist, create it
      findNode(parsedRDF[i].subject.value);
    }

    //parsing subclasses+blank nodes
    else if (subclassRelation) {
      let nodeValue = findNode(parsedRDF[i].subject.value);
      const relationName = parsedRDF[i + 1].object.value.split("/").pop();

      if (relationName in nodeValue)
        nodeValue[relationName].push(parsedRDF[i + 2].object.value);
      else nodeValue[relationName] = [parsedRDF[i + 2].object.value];
    }
    //parsing subclasses
    else if (subclass) {
      //updating the subclass
      let nodeValue = findNode(parsedRDF[i].subject.value);
      nodeValue.superclasses.push(parsedRDF[i].object.value);

      //updating the superclass
      nodeValue = findNode(parsedRDF[i].object.value);
      nodeValue.subclasses.push(parsedRDF[i].subject.value);
    }
    //parsing properties
    else if (property) {
      let propName = parsedRDF[i].predicate.value.split("#")[1];
      if (propName in schemMap) {
        propName = schemMap[propName];
      }
      const propValue = parsedRDF[i].object.value;
      const nodeValue = findNode(parsedRDF[i].subject.value);

      if (!propName) continue;

      //create an array if property has more than one value
      if (propName in nodeValue) {
        nodeValue[propName] = [nodeValue[propName]];
        nodeValue[propName].push(propValue);
        nodeValue[propName] = nodeValue[propName].flat();
      } else nodeValue[propName] = propValue;
    }

    //populating meta data
    else if (parsedRDF[i].predicate.value in metaMap) {
      meta[metaMap[parsedRDF[i].predicate.value]] = parsedRDF[i].object.value;
    }
  }
};

/**
 * Turns an array of json objects to a tree using superclasses and subclasses.
 * @param {object[]} nodes array of all nodes (flattened)
 */
const makeTree = (nodes) => {
  let hashTable = Object.create(null);
  nodes.forEach(
    (nodesCpy) => (hashTable[nodesCpy.data.uri] = { children: [], ...nodesCpy })
  );
  let dataTree = [];

  nodes.forEach((nodesCpy) => {
    //omitting superclasses and subclasses from the generated json file
    delete hashTable[nodesCpy.data.uri].superclasses;
    delete hashTable[nodesCpy.data.uri].subclasses;
    if (nodesCpy.superclasses.length > 0) {
      nodesCpy.superclasses.forEach((parent) => {
        hashTable[parent].children.push(hashTable[nodesCpy.data.uri]);
      });
    } else dataTree.push(hashTable[nodesCpy.data.uri]);
  });
  let treeRoot = {
    children: dataTree,
    data: { uri: "owl:Thing" },
    meta: meta,
  };
  writeJSONFile(treeRoot);

  return treeRoot;
};

/**
 *
 * @param {string} uri the uri of the node to be created
 */
const createNode = (uriVal) => {
  classes.push({
    data: { uri: uriVal },
    subclasses: [],
    superclasses: [],
  });
};

/**
 * Finds a node in the classes array. And if it doesn't exit, creates one.
 * @param {string} uri the uri of the node to be created
 * @returns the node value in the array
 *
 */
const findNode = (uri) => {
  let nodeValue = classes.find((x) => x.data.uri === uri);
  if (!nodeValue) {
    createNode(uri);
    return classes.find((x) => x.data.uri === uri);
  }
  return nodeValue;
};

export { parseToJSON };
