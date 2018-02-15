# Tutorial

## Prerequisites

- antlr4 installed (see [readme](README.md]))
- nodejs
- npm or yarn

## Bootstrap the project

First we go and setup the directory structure and initialize the project.

Run yarn or npm init and add all the information or just skip through them.
```bash
$ yarn init
...
```

The only dependency we need is the javascript antlr4 package. so run:

```bash
$ yarn add antlr4 
```

or 
```bash
$ npm add antlr4 --save
```

## Create the entry script and create the repl

We start by creating the `main.js` in the `src` directory and add the minimal console loop.

```bash
$ mkdir src
$ touch src/main.js
```

main.js
```js
const readline = require('readline');

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
    const result  = '42';
    console.log(`: ${input.trim()} = ${result}\n`);
    rl.prompt();

}).on('close', () => {
    process.exit(0);
});
```

Now we should already be able to run this:

```
$ node src/main.js
Simple calculator.

> 42
: 42 = 42
```

## Create the grammar file and generate the sources

Antlr4 will generate some javascript source files based on the grammar. In oder to keep the project organized,
we create a separate directory for the generated files:

```bash
$ mkdir src/parser
```

next we add the grammar file:

```bash
$ touch src/parser/Math.g4
```

Math.g4
```antlrv4
/*
copied from https://stackoverflow.com/a/29996191/3229985
*/
grammar Math;

compileUnit
    :   expr EOF
    ;

expr
    :   '(' expr ')'                         # parensExpr
    |   op=('+'|'-') expr                    # unaryExpr
    |   left=expr op=('*'|'/') right=expr    # infixExpr
    |   left=expr op=('+'|'-') right=expr    # infixExpr
    |   func=ID '(' expr ')'                 # funcExpr
    |   value=NUM                            # numberExpr
    ;

OP_ADD: '+';
OP_SUB: '-';
OP_MUL: '*';
OP_DIV: '/';

NUM :   [0-9]+ ('.' [0-9]+)? ([eE] [+-]? [0-9]+)?;
ID  :   [a-zA-Z]+;
WS  :   [ \t\r\n] -> channel(HIDDEN);
```

And run antlr4 to generate the files:

```
$ antlr4 -Dlanguage=JavaScript -o src/parser/Math.g4
$ ls -1 src/parser/
  Math.g4
  Math.interp
  Math.tokens
  MathLexer.interp
  MathLexer.js
  MathLexer.tokens
  MathListener.js
  MathParser.js
```   

## Setup the parser and parse the expression

We create a new helper class `Evaluator` that will use the generated parse to parse the expression
and then use the parsed tree to calculate the result. But first, let's create the class:

```bash
$ touch src/Evaluator.js
```

Evaluator.js
```js
const antlr4 = require('antlr4');
const MathLexer = require('./parser/MathLexer').MathLexer;
const MathParser = require('./parser/MathParser').MathParser;

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

        // todo: use the tree to calculate the result
        return 42;
    }
};
```

This looks a bit complicated, but basically create a stream, feeds it into the lexer that creates
the tokens and then uses the parser that turn the tokens into a parse tree. 

We can now use the Evalator in our repl code:

main.js
```
 const readline = require('readline');
+const Evaluator = new require('./Evaluator');
+
+const evaluator = new Evaluator();
 // create a readline interface
 const rl = readline.createInterface({

...

         rl.close();
         return;
     }
-    const result  = 42;
+    const result  = evaluator.evaluate(input);
     console.log(`: ${input.trim()} = ${result}\n`);
     rl.prompt();
``` 

## Create a tree listener that evaluates the expression

All we now need is to travers the parse tree and calculate the result. For that we can create a `ParseTreeListener`.
Antlr4 generates one for us, based on our grammar. If you look at the generated `MathListener` you see that for each
grammar rule, there is a enter and exit method. 

The `ParseTreeWalker` will traverse the tree and invoke the listener for every node it encounters. Since the grammar 
follows the mathematical evaluation rules, we can calculate the result during the tree walk.

But since the `MathListener` is generated, we don't want to add our code there, but rather extend from it.

create a new class for it:

```bash
$ touch src/EvaluatorListener.js
```

EvaluatorListener.js
```js
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

    /**
     * Process the numberExpr rule. eg: 42. this is a terminal rule and we can push the value on the stack
     * @see http://www.antlr.org/api/Java/org/antlr/v4/runtime/tree/TerminalNodeImpl.html
     * @param ctx
     */
    enterNumberExpr(ctx) {
        // note, that the `NUM` here. corresponds to the name of the rule in the grammar.
        this.stack.push(Number.parseInt(ctx.NUM().getText()));
    }

};
```

_(I omitted some of the methods above, in order to keep it shorter. but you can find the complete file in the sources)_

## Use the listener to calculate the result

So now we can use the listener to our `Evaluator` to tally up the result:

Evaluator.js
```js
         // parse the input characters
         const tree = parser.compileUnit();

-        return 42;
+        // setup a listener that walks the tree and computes the result
+        const listener = new EvaluatorListener();
+        antlr4.tree.ParseTreeWalker.DEFAULT.walk(listener, tree);
+        return listener.result();
     }
 };
```

That's it! Try out:

```
$ node src/main.js
Simple calculator.

> 2 * (11 - 5) + 10
: 2 * (11 - 5) + 10 = 22

```


