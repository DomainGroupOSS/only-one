#!/usr/bin/env node
const path = require('path');
const glob = require('fast-glob');

const deps = process.argv.slice(2);

if (!deps.length) {
  console.log('No deps passed to only-one, must be a list of space separated deps "only-one react react-dom"!');
  process.exit(1);
}

// cwd defaults to process.cwd() in fast-glob
const globPattern = path.join('node_modules', '**', `(${deps.join('|')})`, 'package.json');
const foundPaths = glob.sync(globPattern);

const resultsMap = new Map();

deps.forEach((dep) => {
  const foundLocations = foundPaths.filter(packageJsonPath => packageJsonPath.endsWith(path.join(dep, 'package.json')));
  resultsMap.set(dep, foundLocations);
});

let exitWithFailure = false;
Array.from(resultsMap.entries()).forEach(([dep, locations]) => {
  if (locations.length === 1) return;

  if (!exitWithFailure) exitWithFailure = true;

  console.log(
    `only-one failed for "${dep}" because ${
      locations.length === 0 ? 'no dep found.' : `${locations.length} deps found at:`
    }`,
  );
  locations.forEach((location) => {
    console.log(`  - ${location.split(process.cwd())[0].split('package.json')[0]}`);
  });
  console.log(); // to cause new line
});

if (exitWithFailure) {
  console.log('To debug we suggest using `npm ls` or `yarn why`.');
  process.exit(1);
}

console.log(
  `only-one check passed for ${
    deps.length === 1
      ? `"${deps[0]}"`
      : `"${deps.slice(0, -1).join('", "')}" and "${deps[deps.length - 1]}"`
  }.`,
);
process.exit(0);
