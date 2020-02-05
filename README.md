# only-one

A simple CLI tool that checks you only have one version of a dependency in your
node_modules folder.

```bash
only-one react
```

or for multiple deps

```bash
only-one react react-dom
```

If none or more than one version of the deps are found the process will exit
with failure. The tool works by [globbing](https://en.wikipedia.org/wiki/Glob_(programming)) your
`node_modules`, it has nothing to do with yarn or npm lock files and therefore checks that yarn or npm
is also correctly installing into `node_modules`.

You may wish to add it to your test suite `"test":  "only-one react && mocha && eslint ."`.

I was motivated to build this because sometimes 3rd party libraries accidentally have
react as a dependency and this can break stuff.

Please be aware if you have a large `node_modules` it can be quite slow because it's a lot of file
paths to search through.

### To install

```bash
npm install only-one --save-dev
yarn add only-one --dev
```

### Options

`--warn` or `-w` to only warn about deps than are more than 1 and dont fail
