import { RdfXmlParser } from "rdfxml-streaming-parser";
import * as fs from "fs";
import { writeJSONFile } from "./utils";

import { writeJSONFile } from "./utils.js";

const classVal = "http://www.w3.org/2002/07/owl#Class";
const subClassVal = "http://www.w3.org/2000/01/rdf-schema#subClassOf";

//current supported classes top level (topic, data, operation, format, deprecated)
var edamRe = new RegExp(
  "^((http|https)://edamontology.org/(data|format|operation|topic)|http://www.w3.org/2002/07/owl#DeprecatedClass)",
  "i"
);

let classes = [];
const myParser = new RdfXmlParser();

parseToJSON("EDAM_1.25.owl");

/**
 *
 * @param {string} fileExt relative path of the file to parse
 * parses an OWL EDAM file to a json format
 */
function parseToJSON(fileExt) {
  let parserObjs = [];
  fs.createReadStream(fileExt)
    .pipe(myParser)
    .on("data", (data) => {
      parserObjs.push(data);
    })
    .on("error", console.error)
    .on("end", () => {
      console.log("All triples were parsed!");
      constructJSON(parserObjs);
      let tree = makeTree(classes);
    });
}

/**
 *
 * @param {object[]} parsedRDF array of parsed RDF objects
 * construct a json tree compliant with EDAM schema
 */
function constructJSON(parsedRDF) {
  //populating the classes array
  for (let i = 0; i < parserObjs.length; i++) {
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
      parserObjs[i].object.value == classVal &&
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
      nodeValue.superclasses.push({ value: parsedRDF[i].object.value });

      //updating the superclass
      nodeValue = findNode(parsedRDF[i].object.value);
      nodeValue.subclasses.push({ value: parsedRDF[i].subject.value });
    }
    //parsing properties
    else if (property) {
      const propName = parsedRDF[i].predicate.value.split("#")[1];
      const propValue = parsedRDF[i].object.value;
      const nodeValue = findNode(parsedRDF[i].subject.value);

      if (!propName) continue;

      //create an array if property has more than one value
      if (propName in nodeValue) {
        nodeValue[propName] = [nodeValue[propName]];
        nodeValue[propName].push(propValue);
      } else nodeValue[propName] = propValue;
    }
  }
}

/**
 *
 * @param {object[]} nodes array of all nodes (flattened)
 */
function makeTree(nodes) {
  let hashTable = Object.create(null);
  nodes.forEach(
    (nodesCpy) => (hashTable[nodesCpy.value] = { children: [], ...nodesCpy })
  );
  let dataTree = [];

  nodes.forEach((nodesCpy) => {
    //omitting superclasses and subclasses from the generated json file
    delete hashTable[nodesCpy.value].superclasses;
    delete hashTable[nodesCpy.value].subclasses;
    if (nodesCpy.superclasses.length > 0) {
      nodesCpy.superclasses.forEach((parent) => {
        hashTable[parent.value].children.push(hashTable[nodesCpy.value]);
      });
    } else dataTree.push(hashTable[nodesCpy.value]);
  });
  let treeRoot = {
    children: dataTree,
    data: { uri: "owl:Thing" },
    meta: { date: "18.06.2020 09:15 UTC", version: "1.25" },
  };

  writeJSONFile(treeRoot);

  return dataTree;
}

/**
 *
 * @param {string} uri the uri of the node to be created
 */
function createNode(uri) {
  classes.push({
    value: uri,
    subclasses: [],
    superclasses: [],
  });
}

/**
 *
 * @param {string} uri the uri of the node to be created
 * @returns the node value in the array
 * finds a node in the classes array. And if it doesn't exit, creates one
 */
function findNode(uri) {
  let nodeValue = classes.find((x) => x.value === uri);
  if (!nodeValue) {
    createNode(uri);
    return classes.find((x) => x.value === uri);
  }
  return nodeValue;
}
