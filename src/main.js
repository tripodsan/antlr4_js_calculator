/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const readline = require('readline');
const Evaluator = new require('./Evaluator');

const evaluator = new Evaluator();

// just evaluate if argument is given
if (process.argv.length > 2) {
    const result  = evaluator.evaluate(process.argv[2]);
    console.log(`${result}`);
    process.exit(0);
}

// create a readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// write greeting and set the prompt
rl.write('Simple calculator.\n\n');
rl.setPrompt('> ');
rl.prompt();

// _run_ the repl
rl.on('line', (input) => {
    if (input === '') {
        rl.close();
        return;
    }
    const result  = evaluator.evaluate(input);
    console.log(`: ${input.trim()} = ${result}\n`);
    rl.prompt();

}).on('close', () => {
    process.exit(0);
});

