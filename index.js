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
  //populating classes
  for (let i = 0; i < parserObjs.length; i++) {
    if (parserObjs[i].object.value == classVal) {
      classCount++;
      classes.push({
        value: parserObjs[i].subject.value,
        subclasses: [],
        superclasses: [],
        properties: {},
      });
    }
  }

  //populating the subclasses and properties
  for (let i = 0; i < parserObjs.length; i++) {
    const subclasss =
      parserObjs[i].predicate.value == subClassVal &&
      edamRe.test(parserObjs[i].object.value);

    const subclassRelation =
      parserObjs[i].predicate.value == subClassVal &&
      parserObjs[i].object.termType == "BlankNode";

    const property =
      parserObjs[i].predicate.value != subClassVal &&
      parserObjs[i].object.value != classVal;

    //parsing subclasses+blank nodes
    if (subclassRelation) {
      const classValue = classes.find(
        (x) => x.value === parserObjs[i].subject.value
      );
      const relationName = parserObjs[i + 1].object.value.split("/").pop();

      if (relationName in classValue)
        classValue[relationName].push(parserObjs[i + 2].object.value);
      else classValue[relationName] = [parserObjs[i + 2].object.value];

      //parsing normal subclasses
    } else if (subclasss) {
      //updating the subclass
      /*classes
            .find((x) => x.value === parserObjs[i].subject.value)
            ?.superclasses.push({ value: parserObjs[i].object.value });*/

      //updating the superclass
      classes
        .find((x) => x.value === parserObjs[i].object.value)
        ?.subclasses.push({ value: parserObjs[i].subject.value });
    }

    //parsing properties
    else if (property) {
      const propName = parserObjs[i].predicate.value.split("#")[1];
      const classValue = classes.find(
        (x) => x.value === parserObjs[i].subject.value
      );

      if (!classValue | !propName) continue;

      if (propName in classValue.properties)
        classValue.properties[propName].push(parserObjs[i].object.value);
      else classValue.properties[propName] = [parserObjs[i].object.value];
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
/*exports.parseOWL = (file) => {
  fs.createReadStream(file)
    .pipe(myParser)
    .on("data", console.log)
    .on("error", console.error)
    .on("end", () => console.log("All triples were parsed!"));
};*/
