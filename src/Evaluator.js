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
const antlr4 = require('antlr4');
const MathLexer = require('./parser/MathLexer').MathLexer;
const MathParser = require('./parser/MathParser').MathParser;
const EvaluatorListener = require('./EvaluatorListener');

/**
 * Evaluates the given expression and computes the result.
 * @type {module.Evaluator}
 */
module.exports = class Evaluator {

    /**
     * Evalutes the input and returns the result
     * @param {String} input the input string
     * @returns {Number} the result.
     */
    evaluate(input) {
        // setup the antlr lexer and parser
        const chars = new antlr4.InputStream(input);
        const lexer = new MathLexer(chars);
        const tokens = new antlr4.CommonTokenStream(lexer);
        const parser = new MathParser(tokens);

        // parse the input characters
        const tree = parser.compileUnit();

        // setup a listener that walks the tree and computes the result
        const listener = new EvaluatorListener();
        antlr4.tree.ParseTreeWalker.DEFAULT.walk(listener, tree);
        return listener.result();
    }
};

