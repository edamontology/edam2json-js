import { RdfXmlParser } from "rdfxml-streaming-parser";
import * as fs from "fs";

const classVal = "http://www.w3.org/2002/07/owl#Class";
const subClassVal = "http://www.w3.org/2000/01/rdf-schema#subClassOf";

var edamRe = new RegExp("^(http|https)://edamontology.org/", "i");

let parserObjs = [];
let classes = [];

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
    });
}

function constructJSON(parsedRDF) {
  //populating the classes array
  for (let i = 0; i < parserObjs.length; i++) {
    const subclass =
      parserObjs[i].predicate.value == subClassVal &&
      edamRe.test(parserObjs[i].object.value);

    const subclassRelation =
      parserObjs[i].predicate.value == subClassVal &&
      parserObjs[i].object.termType == "BlankNode";

    const property =
      parserObjs[i].predicate.value != subClassVal &&
      parserObjs[i].object.value != classVal &&
      edamRe.test(parserObjs[i].subject.value);

    //parsing the nodes
    if (parserObjs[i].object.value == classVal) {
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

  var file = fs.createWriteStream("parsedRDF.json");
  file.on("error", function (err) {
    /* error handling */
  });
  parserObjs.forEach(function (v) {
    file.write(JSON.stringify(v) + "\n");
  });
  file.end();

  var file = fs.createWriteStream("parsedJSON.json");
  file.on("error", function (err) {
    /* error handling */
  });
  classes.forEach(function (v) {
    file.write(JSON.stringify(v) + "\n");
  });
  file.end();
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
