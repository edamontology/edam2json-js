import { RdfXmlParser } from "rdfxml-streaming-parser";
import * as fs from "fs";

const classVal = "http://www.w3.org/2002/07/owl#Class";
const subClassVal = "http://www.w3.org/2000/01/rdf-schema#subClassOf";

//current supported classes top level (topic, data, operation, format, deprecated)
var edamRe = new RegExp(
  "^((http|https)://edamontology.org/(data|format|operation|topic)|http://www.w3.org/2002/07/owl#DeprecatedClass)",
  "i"
);

let parserObjs = [];
let classes = [];
let tree = [];
let classCount = 0;
const myParser = new RdfXmlParser();

parseOWL("EDAM_1.25.owl");

function parseOWL(fileExt) {
  fs.createReadStream(fileExt)
    .pipe(myParser)
    .on("data", (data) => {
      parserObjs.push(data);
    })
    .on("error", console.error)
    .on("end", () => {
      console.log("All triples were parsed!");
      constructJSON(parserObjs);
      tree = makeTree(classes);
    });
}

function constructJSON(parsedRDF) {
  //populating the classes array
  for (let i = 0; i < parserObjs.length; i++) {
    const subclass =
      parserObjs[i].predicate.value == subClassVal &&
      edamRe.test(parserObjs[i].object.value);
    parserObjs[i].object.value == classVal;

    const subclassRelation =
      parserObjs[i].predicate.value == subClassVal &&
      parserObjs[i].object.termType == "BlankNode";

    const property =
      parserObjs[i].predicate.value != subClassVal &&
      parserObjs[i].object.value != classVal &&
      edamRe.test(parserObjs[i].subject.value);

    //parsing the nodes
    if (
      parserObjs[i].object.value == classVal &&
      edamRe.test(parserObjs[i].subject.value)
    ) {
      //if the node doesn't exist, create it
      findNode(parserObjs[i].subject.value);
    }

    //parsing subclasses+blank nodes
    else if (subclassRelation) {
      let nodeValue = findNode(parserObjs[i].subject.value);
      const relationName = parserObjs[i + 1].object.value.split("/").pop();

      if (relationName in nodeValue)
        nodeValue[relationName].push(parserObjs[i + 2].object.value);
      else nodeValue[relationName] = [parserObjs[i + 2].object.value];
    }
    //parsing subclasses
    else if (subclass) {
      //updating the subclass
      let nodeValue = findNode(parserObjs[i].subject.value);
      nodeValue.superclasses.push({ value: parserObjs[i].object.value });

      //updating the superclass
      nodeValue = findNode(parserObjs[i].object.value);
      nodeValue.subclasses.push({ value: parserObjs[i].subject.value });
    }
    //parsing properties
    else if (property) {
      const propName = parserObjs[i].predicate.value.split("#")[1];
      const propValue = parserObjs[i].object.value;
      const nodeValue = findNode(parserObjs[i].subject.value);

      if (!propName) continue;

      if (propName in nodeValue.properties)
        nodeValue.properties[propName].push(propValue);
      else nodeValue.properties[propName] = [propValue];
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
    (nodesCpy) => (hashTable[nodesCpy.value] = { ...nodesCpy, children: [] })
  );
  let dataTree = [];

  nodes.forEach((nodesCpy) => {
    if (nodesCpy.superclasses.length > 0) {
      nodesCpy.superclasses.forEach((parent) => {
        hashTable[parent.value].children.push(hashTable[nodesCpy.value]);
      });
    } else dataTree.push(hashTable[nodesCpy.value]);
  });
  let treeRoot = { children: dataTree };

  var file = fs.createWriteStream("tree.json");
  file.on("error", function (err) {
    /* error handling */
  });
  file.write(JSON.stringify(treeRoot));
  file.end();

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
    properties: {},
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
