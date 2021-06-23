import { RdfXmlParser } from "rdfxml-streaming-parser";
import * as fs from "fs";

const classVal = "http://www.w3.org/2002/07/owl#Class";
const subClassVal = "http://www.w3.org/2000/01/rdf-schema#subClassOf";

var edamRe = new RegExp("^(http|https)://edamontology.org/", "i");

let parserObjs = [];
let classes = [];

let classCount = 0;
const myParser = new RdfXmlParser();
fs.createReadStream("EDAM_1.25.owl")
  .pipe(myParser)
  .on("data", (data) => {
    parserObjs.push(data);
  })
  .on("error", console.error)
  .on("end", () => {
    console.log("All triples were parsed!");
    console.log(parserObjs.length);

    //populating classes
    for (let i = 0; i < parserObjs.length; i++) {
      if (parserObjs[i].object.value == classVal) {
        classCount++;
        classes.push({
          value: parserObjs[i].subject.value,
          subclasses: [],
          superclasses: [],
          properties: [{ name: "", value: [] }],
        });
      }
    }

    //populating the subclasses and properties
    for (let i = 0; i < parserObjs.length; i++) {
      if (
        parserObjs[i].predicate.value == subClassVal &&
        edamRe.test(parserObjs[i].object.value)
      ) {
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
      else if (
        (parserObjs[i].predicate.value != subClassVal) |
        (parserObjs[i].predicate.value != classVal)
      ) {
        const propName = parserObjs[i].predicate.value.split("#")[1];
        const classValue = classes.find(
          (x) => x.value === parserObjs[i].subject.value
        );

        if (!classValue) continue;

        const propValue = classValue.properties.find(
          (x) => x.name === propName
        );

        if (propValue) {
          propValue.value.push(parserObjs[i].object.value);
        } else
          classValue.properties.push({
            name: propName,
            value: [parserObjs[i].object.value],
          });
      }
    }
  });

/*exports.parseOWL = (file) => {
  fs.createReadStream(file)
    .pipe(myParser)
    .on("data", console.log)
    .on("error", console.error)
    .on("end", () => console.log("All triples were parsed!"));
};*/
