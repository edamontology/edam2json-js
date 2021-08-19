# edam2json-js

Javascript library to convert EDAM to different formats JSON/TSV/CSV.
Used both as a cli and a browser-compatible package.

## Installation

```bash
$ yarn add edam2json-js
```

_or_

```bash
$ npm install edam2json-js
```

## Importing/Requiring

```javascript
import { jsonTreeFromURL } from "edam2json-js";
```

_or_

```javascript
const jsonTreeFromURL = require("edam2json-js").jsonTreeFromURL;
```

## Usage

</br>

### As a browser package

`jsonTreeFromURL` is a function that takes a url (with .owl extention) as a first argument and outputs the converted json tree to the `onSuccess` function passed as a second argument. The third argument is `onError` function to be excuted in case of error (e.g CORS errors)

```javascript
const url =
  "https://raw.githubusercontent.com/edamontology/edamontology/main/EDAM_dev.owl";

jsonTreeFromURL(
  url,
  (tree) => {
    console.log(tree);
  },
  (err) => {
    console.log(err);
  }
);
```

</br>

### As a cli

For converting OWL file to json tree of terms.

```
edam2json-js -jt EDAM_FILE_PATH [-o OUTPUT_FILE]
```

For converting OWL file to csv/tsv format.

```bash
edam2json-js -csv EDAM_FILE_PATH [-o OUTPUT_FILE]
```

```bash
edam2json-js -tsv EDAM_FILE_PATH [-o OUTPUT_FILE]
```

## License

[MIT license](http://opensource.org/licenses/MIT)
