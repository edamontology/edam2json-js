import * as fs from "fs";

const writeJSONFile = (jsonObj, filePath) => {
  var file = fs.createWriteStream(filePath);
  file.on("error", function (err) {
    console.log(err.message);
  });
  file.write(JSON.stringify(jsonObj));
  file.end();
};

export { writeJSONFile };
