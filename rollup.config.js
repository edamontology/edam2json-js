import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";
import terser from "@rollup/plugin-terser";
import polyfillNode from "rollup-plugin-polyfill-node";

// suppress rollup warnings we know are benign
const onwarn = (warning, defaultHandler) => {
  // polyfill-node circular deps
  if (
    warning.code === "CIRCULAR_DEPENDENCY" &&
    /polyfill-node/.test(warning.importer)
  ) {
    return;
  }
  if (
    warning.code === "THIS_IS_UNDEFINED" &&
    warning.message.includes("sax.js")
  ) {
    return;
  }
  // suppress empty chunk warning for d.ts rollup
  if (warning.code === "EMPTY_CHUNK") {
    return;
  }
  defaultHandler(warning);
};

const sharedPlugins = [
  resolve(),
  commonjs(),
  typescript({ tsconfig: "./tsconfig.json" }),
];

const browserPlugins = [
  polyfillNode(),
  resolve({ browser: true, preferBuiltins: false }),
  commonjs(),
  typescript({ tsconfig: "./tsconfig.json" }),
];

export default [
  // 1) Node/CJS + ESM build
  {
    input: "src/index.ts",
    onwarn,
    output: [
      { file: "dist/index.cjs.js", format: "cjs", sourcemap: true },
      { file: "dist/index.esm.js", format: "es", sourcemap: true },
    ],
    plugins: sharedPlugins,
  },
  // 2) Browser UMD build (with polyfills)
  {
    input: "src/browser.ts",
    onwarn,
    plugins: browserPlugins,
    context: "window", // Moved to the correct top-level position
    output: [
      {
        file: "dist/browser.umd.js",
        format: "umd",
        name: "Edam2JSON",
        sourcemap: true,
      },
      {
        file: "dist/browser.umd.min.js",
        format: "umd",
        name: "Edam2JSON",
        sourcemap: true,
        plugins: [terser()],
      },
    ],
  },
  // 3) Roll up d.ts
  {
    input: "dist/index.d.ts",
    onwarn, // Added onwarn here to suppress the empty chunk warning
    output: [{ file: "dist/index.d.ts", format: "es" }],
    plugins: [dts()],
  },
];
