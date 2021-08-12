import { RdfXmlParser } from "rdfxml-streaming-parser";
import { classVal, subClassVal, schemaMap, metaMap } from "./maps.js";
//current supported classes top level (topic, data, operation, format, deprecated)
var edamRe = new RegExp(
  "^((http|https)://edamontology.org/(data|format|operation|topic)|http://www.w3.org/2002/07/owl#DeprecatedClass)",
  "i"
);

let meta = {};
let classes = {};

/**
 * Parses an OWL EDAM file to a json format.
 * @param {string} text file as a string
 * @param {string} outputPath optional Output file path to write to
 */
const parseToJSON = (text, callback, outputPath) => {
  const myParser = new RdfXmlParser();
  meta = {};
  classes = {};

  var textByLine = text.split("\n");

  let parserObjs = [];
  myParser
    .on("data", (data) => {
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
};

/**
 * Constructs a json tree compliant with EDAM schema.
 * @param {object[]} parsedRDF array of parsed RDF objects
 *
 */
const constructJSON = (parsedRDF) => {
  //populating the classes array
  for (let i = 0; i < parsedRDF.length; i++) {
    //parsing the nodes
    if (
      parsedRDF[i].object.value == classVal &&
      edamRe.test(parsedRDF[i].subject.value)
    ) {
      //if the node doesn't exist, create it
      if (!(parsedRDF[i].subject.value in classes)) {
        createNode(parsedRDF[i].subject.value);
      }
    }

    //parsing subclasses+blank nodes e.g has_topic, is_identifier_of etc.
    else if (
      parsedRDF[i].predicate.value == subClassVal &&
      parsedRDF[i].object.termType == "BlankNode"
    ) {
      if (!(parsedRDF[i].subject.value in classes)) {
        createNode(parsedRDF[i].subject.value);
      }
      let nodeValue = classes[parsedRDF[i].subject.value];
      const relationName = parsedRDF[i + 1].object.value.split("/").pop();

      if (relationName in nodeValue)
        nodeValue[relationName].push(parsedRDF[i + 2].object.value);
      else nodeValue[relationName] = [parsedRDF[i + 2].object.value];
    }
    //parsing subclasses
    else if (
      parsedRDF[i].predicate.value == subClassVal &&
      edamRe.test(parsedRDF[i].object.value)
    ) {
      //updating the subclass
      if (!(parsedRDF[i].subject.value in classes)) {
        createNode(parsedRDF[i].subject.value);
      }
      let nodeValue = classes[parsedRDF[i].subject.value];
      nodeValue.superclasses.push(parsedRDF[i].object.value);
    }
    //parsing properties
    else if (
      parsedRDF[i].predicate.value != subClassVal &&
      parsedRDF[i].object.value != classVal &&
      edamRe.test(parsedRDF[i].subject.value)
    ) {
      let propName = parsedRDF[i].predicate.value;
      if (propName in schemaMap) {
        propName = schemaMap[propName];
      }
      const propValue = parsedRDF[i].object.value;
      if (!(parsedRDF[i].subject.value in classes)) {
        createNode(parsedRDF[i].subject.value);
      }
      let nodeValue = classes[parsedRDF[i].subject.value];
      if (!propName) continue;

      //create an array if the property has more than one value
      if (propName in nodeValue) {
        nodeValue[propName] = [nodeValue[propName]];
        nodeValue[propName].push(propValue);
        nodeValue[propName] = nodeValue[propName].flat();
      } else nodeValue[propName] = propValue;
    }

    //populating the ontology's meta data, add to metaMap for more meta data
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
  Object.entries(nodes).forEach(
    ([key, value]) => (hashTable[key] = { children: [], ...value })
  );
  let dataTree = [];

  Object.entries(nodes).forEach(([key, value]) => {
    //omitting superclasses and subclasses from the generated json file
    delete hashTable[key].superclasses;
    delete hashTable[key].subclasses;
    if (value.superclasses.length > 0) {
      value.superclasses.forEach((parent) => {
        hashTable[parent].children.push(hashTable[key]);
      });
    } else dataTree.push(hashTable[key]);
  });
  let treeRoot = {
    children: dataTree,
    data: { uri: "owl:Thing" },
    meta: meta,
  };
  return treeRoot;
};

/**
 *
 * @param {string} uri the uri of the node to be created
 */
const createNode = (uriVal) => {
  classes[uriVal] = {
    data: { uri: uriVal },
    subclasses: [],
    superclasses: [],
  };
};

export { parseToJSON };
