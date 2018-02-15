<!--
   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
-->
# Antlr4 Javascript Calculator
Example project with [Tutorial](tutorial.md) that shows how to quickly build a command line calculator with antrl4 and nodejs.

The code here is based on the Java example provided by Lucas on [Stackoverflow](https://stackoverflow.com/a/29996191/3229985).
In particular, the grammar is copied as is.

## Quick Start

### Prerequisite: install antlr4

1. Follow the installation instructions on the [Antlr4 - Get Started](https://github.com/antlr/antlr4/blob/master/doc/getting-started.md#installation) or
the official [site](http://www.antlr.org/).

2. make sure that an antlr4 works:
```bash
$ antlr4
ANTLR Parser Generator  Version 4.7.1
...
```

### Build

The build process invokes antlr4 and generates the JavaScript _classes_ that are used
to parse the expressions.

Using Yarn:
```bash
$ yarn install
$ yarn build
```
Using npm:
```bash
$ npm install
$ npm run build
```

### Running

without arguments, the calculator runs as repl (read, execute, print, loop):

```
$ node src/main.js
Simple calculator.

> 10 * (3+4) / 10
: 10 * (3+4) / 10 = 7

> _
``` 

with arguments, the calculator just prints the result of the expression given:

```
$ node src/main.js "4*(3+7)+2"
42
```