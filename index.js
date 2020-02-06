#!/usr/bin/env node
const path = require("path");
const glob = require("fast-glob");
const meow = require("meow");
const chalk = require("chalk");

const cli = meow(
  `
	Usage
	  $ only-one <input>

	Options
	  --warn, -w  Only warn about deps and dont fail

	Examples
	  $ only-one react
	  only-one failed for "react" because 2 deps found at:
  - node_modules/react/
  - node_modules/mochawesome-report-generator/node_modules/react/
`,
  {
    flags: {
      warn: {
        type: "boolean",
        alias: "w"
      }
    }
  }
);

const deps = cli.input;

if (!deps.length) {
  console.log(
    chalk.red(
      'No deps passed to only-one, must be a list of space separated deps, eg: "only-one react react-dom"!'
    )
  );
  process.exit(1);
}

// cwd defaults to process.cwd() in fast-glob
const globPattern = path.join(
  "node_modules",
  "**",
  `(${deps.join("|")})`,
  "package.json"
);
const foundPaths = glob.sync(globPattern);

const resultsMap = new Map();

deps.forEach(dep => {
  const foundLocations = foundPaths.filter(
    /* eslint-disable global-require, import/no-dynamic-require */
    packageJsonPath =>
      require(path.join(process.cwd(), packageJsonPath)).name === dep
  );
  resultsMap.set(dep, foundLocations);
});

let exitWithFailure = false;
Array.from(resultsMap.entries()).forEach(([dep, locations]) => {
  if (locations.length === 1) return;

  if (!exitWithFailure) exitWithFailure = true;

  const message = `only-one ${
    cli.flags.warn ? "warned" : "failed"
  } for "${dep}" because ${
    locations.length === 0
      ? "no dep found."
      : `${locations.length} deps found at:`
  }`;

  if (cli.flags.warn) {
    console.log(chalk.yellow(message));
  } else {
    console.log(chalk.red(message));
  }

  locations.forEach(location => {
    console.log(
      chalk.cyan(
        `  - ${location.split(process.cwd())[0].split("package.json")[0]}`
      )
    );
  });
  console.log(); // to cause new line
});

if (exitWithFailure) {
  const message = "To debug we suggest using `npm ls` or `yarn why`.";

  // dont exit 1 if its in warn mode
  if (cli.flags.warn) {
    console.log(chalk.yellow(message));
  } else {
    console.log(chalk.red(message));
    process.exit(1);
  }
}

console.log(
  chalk.green(
    `only-one check passed for ${
      deps.length === 1
        ? `"${deps[0]}"`
        : `"${deps.slice(0, -1).join('", "')}" and "${deps[deps.length - 1]}"`
    }.`
  )
);
process.exit(0);
