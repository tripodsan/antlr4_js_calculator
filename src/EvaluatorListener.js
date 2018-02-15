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
const MathListener = require('./parser/MathListener').MathListener;
const MathLexer = require('./parser/MathLexer').MathLexer;

/**
 * Simple listener that is invoked during the traversing of the tree. Each enter/exit method corresponds to a
 * rule defined in the grammar. Since the grammar follows the mathematical evaluation rules, we can calculate the
 * result during the tree walk.
 *
 * @type {module.EvaluatorListener}
 */
module.exports = class EvaluatorListener extends MathListener {

    constructor() {
        super();
        this.stack = [];
    }

    result() {
        return this.stack[0];
    }

    /**
     * Process the compileUnit rule. This is the entry rule and can be used to initialized the calculator.
     * @param ctx
     */
    enterCompileUnit(ctx) {
        // initialize the stack
        this.stack = [];
    }

    exitCompileUnit(ctx) {
        // do nothing
    }

    enterInfixExpr(ctx) {
        // wait for exit
    }

    /**
     * Process the infixExpr rule. eg: 4 * 7. since this is invoked _on exit_, the left and right branches of the
     * tree are already parsed and the values should be on the stack.
     * @param ctx
     */
    exitInfixExpr(ctx) {
        const right = this.stack.pop();
        const left = this.stack.pop();

        // based on the op code, we calculate the local result and push it back on the stack
        switch (ctx.op.type) {
            case MathLexer.OP_ADD:
                this.stack.push(left + right);
                break;
            case MathLexer.OP_SUB:
                this.stack.push(left - right);
                break;
            case MathLexer.OP_MUL:
                this.stack.push(left * right);
                break;
            case MathLexer.OP_DIV:
                this.stack.push(left / right);
                break;
            default:
                throw new Error('Unexpected opcode: ' + ctx.op.type);
        }
    }

    enterUnaryExpr(ctx) {
        // wait for exit
    }

    /**
     * Process the unaryExpr rule. eg: -1. since this is invoked _on exit_, the branch of the
     * tree is already parsed and the value should be on the stack.
     * @param ctx
     */
    exitUnaryExpr(ctx) {
        const value = this.stack.pop();

        // based on the op code, we calculate the result and push it back on the stack.
        // note that the OP_ADD is a no-operation, and could of course be handled more elegantly.
        switch (ctx.op.type) {
            case MathLexer.OP_ADD:
                this.stack.push(value);
                break;
            case MathLexer.OP_SUB:
                this.stack.push(-value);
                break;
            default:
                throw new Error('Unexpected opcode: ' + ctx.op.type);
        }

    }

    enterFuncExpr(ctx) {
        // not supported yet
    }

    exitFuncExpr(ctx) {
        // not supported yet
    }

    /**
     * Process the numberExpr rule. eg: 42. this is a terminal rule and we can push the value on the stack
     * @see http://www.antlr.org/api/Java/org/antlr/v4/runtime/tree/TerminalNodeImpl.html
     * @param ctx
     */
    enterNumberExpr(ctx) {
        // note, that the `NUM` here. corresponds to the name of the rule in the grammar.
        this.stack.push(Number.parseInt(ctx.NUM().getText()));
    }

    exitNumberExpr(ctx) {
        // nothing to do
    }

    enterParensExpr(ctx) {
        // nothing to do
    }

    exitParensExpr(ctx) {
        // nothing to do
    }

};