import * as fs from "fs";

const writeJSONFile = (jsonObj) => {
  var file = fs.createWriteStream("tree.json");
  file.on("error", function (err) {
    /* error handling */
  });
  file.write(JSON.stringify(jsonObj));
  file.end();
};

export { writeJSONFile };