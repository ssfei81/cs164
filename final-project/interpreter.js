'use strict';

if (typeof(module) !== 'undefined') {
    var ExecError = require('./errors.js').ExecError;
    var desugarAST = require('./desugar.js').desugarAST;
    var env = require('./environment.js');
    var Table = require('./table.js').Table;
    var envRoot = env.root;
    var envExtend = env.extend;
    var envBind = env.bind;
    var envUpdate = env.update;
    var envLookup = env.lookup;
}

var interpret = function(asts, log, err, display) {
    // PA4: Bytecode interpreter.  Motivation: stackful interpreter
    // cannot implement coroutines.

    function compileToBytecode(ast) {
        // TODO step 2: Complete this function, which takes an AST as input
        // and produces bytecode as its output

        // This helper function generates a unique register name
        function uniquegen() {
            return '#btc-reg-' + uniquegen.counter++;
        }
        uniquegen.counter = 1;

        function btcnode(node, target, btc) {
            switch (node.type) {
                //TODO step 2: Handle every type of AST node you might receive!
                case '+':
                    var reg1 = uniquegen();
                    btcnode(node.operand1, reg1, btc);
                    var reg2 = uniquegen();
                    btcnode(node.operand2, reg2, btc);
                    btc.push({'type': '+', 'operand1': reg1, 'operand2': reg2, "target": target});
                    break;
                case '-':
                    var reg1 = uniquegen();
                    btcnode(node.operand1, reg1, btc);
                    var reg2 = uniquegen();
                    btcnode(node.operand2, reg2, btc);
                    btc.push({'type': '-', 'operand1': reg1, 'operand2': reg2, "target": target});
                    break;
                case '*':
                    var reg1 = uniquegen();
                    btcnode(node.operand1, reg1, btc);
                    var reg2 = uniquegen();
                    btcnode(node.operand2, reg2, btc);
                    btc.push({'type': '*', 'operand1': reg1, 'operand2': reg2, "target": target});
                    break;
                case '/':
                    var reg1 = uniquegen();
                    btcnode(node.operand1, reg1, btc);
                    var reg2 = uniquegen();
                    btcnode(node.operand2, reg2, btc);
                    btc.push({'type': '/', 'operand1': reg1, 'operand2': reg2, "target": target});
                    break;
                case '==':
                    var reg1 = uniquegen();
                    btcnode(node.operand1, reg1, btc);
                    var reg2 = uniquegen();
                    btcnode(node.operand2, reg2, btc);
                    btc.push({'type': '==', 'operand1': reg1, 'operand2': reg2, "target": target});
                    break;
                case '!=':
                    var reg1 = uniquegen();
                    btcnode(node.operand1, reg1, btc);
                    var reg2 = uniquegen();
                    btcnode(node.operand2, reg2, btc);
                    btc.push({'type': '!=', 'operand1': reg1, 'operand2': reg2, "target": target});
                    break;
                case '<=':
                    var reg1 = uniquegen();
                    btcnode(node.operand1, reg1, btc);
                    var reg2 = uniquegen();
                    btcnode(node.operand2, reg2, btc);
                    btc.push({'type': '<=', 'operand1': reg1, 'operand2': reg2, "target": target});
                    break;
                case '>=':
                    var reg1 = uniquegen();
                    btcnode(node.operand1, reg1, btc);
                    var reg2 = uniquegen();
                    btcnode(node.operand2, reg2, btc);
                    btc.push({'type': '>=', 'operand1': reg1, 'operand2': reg2, "target": target});
                    break;
                case '<':
                    var reg1 = uniquegen();
                    btcnode(node.operand1, reg1, btc);
                    var reg2 = uniquegen();
                    btcnode(node.operand2, reg2, btc);
                    btc.push({'type': '<', 'operand1': reg1, 'operand2': reg2, "target": target});
                    break;
                case '>':
                    var reg1 = uniquegen();
                    btcnode(node.operand1, reg1, btc);
                    var reg2 = uniquegen();
                    btcnode(node.operand2, reg2, btc);
                    btc.push({'type': '>', 'operand1': reg1, 'operand2': reg2, "target": target});
                    break;
                case 'id':
                    btc.push({'type': 'id', 'name': node.name, 'target': target});
                    break;
                case 'type': 
                    var reg1 = uniquegen();
                    btcnode(node.body, reg1, btc);
                    btc.push({'type': 'type', 'body': reg1, 'target': target});
                    break;
                case 'get': 
                    var reg1 = uniquegen();
                    btcnode(node.dict, reg1, btc);
                    var reg2 = uniquegen();
                    btcnode(node.field, reg2, btc);
                    btc.push({'type': 'get', 'dict': reg1, 'field': reg2, 'target': target});
                    break;
                case 'put': 
                    var reg1 = uniquegen();
                    btcnode(node.dict, reg1, btc);
                    var reg2 = uniquegen();
                    btcnode(node.field, reg2, btc);
                    var reg3 = uniquegen();
                    btcnode(node.value, reg3, btc);
                    btc.push({'type': 'put', 'dict': reg1, 'field': reg2, 'value': reg3, 'target': target});
                    break;

                case 'in':
                    var reg1 = uniquegen();
                    btcnode(node.operand1, reg1, btc);
                    var reg2 = uniquegen();
                    btcnode(node.operand2, reg2, btc);
                    btc.push({'type': 'in', 'dict': reg2, 'key': reg1, 'target': target});
                    break;

                case 'len':
                    var reg1 = uniquegen();
                    btcnode(node.dict, reg1, btc);
                    btc.push({'type': 'len', 'dict': reg1, 'target': target});
                    break;
                case 'int-lit': 
                    btc.push({'type': 'int-lit', 'value': node.value, 'target': target});
                    break;
                case 'string-lit': 
                    btc.push({'type': 'string-lit', 'value': node.value, 'target': target});
                    break;
                case 'empty-dict-lit': 
                    btc.push({'type': 'empty-dict-lit', 'value': new Table(), 'target': target});
                    break;
                case 'null':
                    btc.push({'type': 'null', 'target': target});
                    break;
                case 'ite': 
                    var reg1 = uniquegen();
                    btcnode(node.condition, reg1, btc);
                    var reg2 = uniquegen();
                    btcnode(node.true, reg2, btc);
                    var reg3 = uniquegen();
                    btcnode(node.false, reg3, btc);
                    btc.push({'type': 'ite', 'condition': reg1, 'true': reg2, 
                            'false': reg3, 'target': target});
                    break;
                case 'exp': 
                    btcnode(node.body, target, btc);

                    break;
                case 'lambda':
                    btc.push({'type': 'lambda', 'arguments': node.arguments, 'target': target, 
                            'body': btcblock(node.body)});
                    break;
                case 'call':
                    if(node.function.type=='id' && node.function.name=='type'){
                        var reg1 = uniquegen();
                        btcnode(node.arguments[0], reg1,btc);
                        btc.push({'type': 'type', 'argument': reg1, 'target': target});
                    }
                    else{
                        var reg1 = uniquegen(), argreg, args = [];
                        btcnode(node.function, reg1, btc);
                        for(var i = 0; i < node.arguments.length; i++) {
                            argreg = uniquegen();
                            btcnode(node.arguments[i], argreg, btc);
                            args.push(argreg);
                        }
                        btc.push({'type': 'call', 'function': reg1, 'arguments': args, 'target': target });
                    }
                    break;

                case 'def':
                    var reg1 = uniquegen();
                    btcnode(node.value, reg1, btc);

                    btc.push({'type': 'def', 'name': node.name.name, 'value': reg1, 'target': target });
                    break;

                case 'print':
                    var reg1 = uniquegen();
                    btcnode(node.value, reg1, btc);
                    btc.push({'type': 'print', 'value': reg1, 'target': target });
                    break;
                case 'error':
                    var reg1 = uniquegen();
                    btcnode(node.message, reg1, btc);
                    btc.push({'type': 'error', 'value': reg1, 'target': target });
                    break;
                case 'asgn':
                    var reg1 = uniquegen();
                    btcnode(node.value, reg1, btc);
                    btc.push({'type': 'asgn', 'name': node.name.name, 'value': reg1, 'target': target});
                    break;
                case 'coroutine':
                    var reg1 = uniquegen();
                    btcnode(node.body, reg1, btc);
                    btc.push({'type': 'coroutine', 'body': reg1, 'target': target});
                    break;
                case 'resume':
                    var reg1 = uniquegen();
                    btcnode(node.coroutine, reg1, btc);
                    var reg2 = uniquegen();
                    btcnode(node.arg, reg2, btc);
                    btc.push({'type': 'resume', 'coroutine': reg1, 'arg': reg2, 'target': target});
                    break;

                case 'yield':
                    var reg1 = uniquegen();
                    btcnode(node.arg, reg1, btc);
                    btc.push({'type': 'yield', 'arg': reg1, 'target': target});
                    break;

                default:
                    throw new Error("What's " + node.type + "? " + JSON.stringify(node));
            }
        }

        function btcblock(statements) {
            // TODO step 2: Complete this function so that functions have
            // explicit return statements
            var btc = [];
            var target;
            statements.forEach(function(statement, index) {
                    target = uniquegen();
                    btcnode(statement, target, btc, index === statements.length - 1);
                    });
            if (!target) {
                // If the body of the lambda is empty, return val is null
                target = uniquegen();
                btc.push({'type': 'null', 'target': target});
            }
            btc.push({'type': 'return', 'value': target});

            return btc;
        }

        return btcblock(ast);
    }

    function to164Object(o) {
        // convert a Python object to a suitable 164 object
        var type = typeof o;
        if (type === 'number') {
            return o;
        } else if (type === 'string') {
            return o;
        } else {
            // throw new ExecError('converting unknown type')
            console.log('converting unknown type');
            return null;
        }
    }

    function toJSObject(o) {
        // convert a JS object to a suitable 164 object
        var type = typeof o;
        if (type === 'number') {
            return o;
        } else if (type === 'string') {
            return o;
        } else {
            // throw new ExecError('converting unknown type')
            console.log('converting unknown type');
            return null;
        }
    }

    // Returns a closure, a data structure which stores the param names
    // (id objects), the body of the function, and the referencing
    // environment, in which it was initialized --- (for lexical scoping).
    function makeClosure(names, body, env) {
        // TODO step 1: use your own makeClosure here
        return {
            "names": names,
                "body": body,
                "type": 'closure',
                "*parent": env
        };
    }

    function printError(msg)
    {
        log("Error: "+msg);
        process.exit(1);
    }

    function isNumber(n){
        return (typeof n) === "number" && !isNaN(n);
    }

    function isString(s){
        return (typeof s) === "string";
    }

    // Returns a stack frame, a data structure which stores 
    // information about the state of a function
    function makeStackFrame(bytecode, env, retReg) {
        // TODO step 3: decide what you need to store in a stack frame
        // based on what your bytecode interpreter needs.
        // Decide whether the arguments above are sufficient.
        return {"bytecode": bytecode, "env": env, "retReg": retReg}
    }

    // Returns a new program state object, a data structure which stores
    // information about a particular stack
    function makeProgramState(bytecode, env, state) {
        // TODO step 3: decide what you need to store in a program state
        // object based on what your bytecode interpreter needs.
        // Decide whether the arguments above are sufficient.
        var programState =  {"pc": 0, "callstack": [], "state": state, "resumed": 0}
        var stackFrame = makeStackFrame(bytecode, env, null) 
            programState["callstack"].push(stackFrame)
            return programState
    }

    function resumeProgram(programState) {
        // TODO step 3: implement this function, which executes
        // bytecode.  See how it's called in the execBytecode function.
        var size = programState["callstack"].length;
        var bytecode = programState["callstack"][size-1]["bytecode"]
            var env = programState["callstack"][size-1]["env"]

            //read next bytecode
            var nextByteCode
            while(nextByteCode = bytecode[programState["pc"]])
            {
		if(display){
	    log(JSON.stringify(nextByteCode)+"\n");}

                switch(nextByteCode.type)
                {
                    case "return":
                        var callStackSize = programState["callstack"].length;
                        var retReg = programState["callstack"][callStackSize-1]["retReg"]
                            var retVal = env[nextByteCode.value];

                        //pop current frame
                        programState["callstack"].pop()
                            //restore pc
                            programState["pc"] = programState["callstack"].pop();

                        //restore env and bytecode
                        if(programState["pc"] !== undefined){
                            callStackSize = programState["callstack"].length;
                            env = programState["callstack"][callStackSize-1]["env"];
                            bytecode = programState["callstack"][callStackSize-1]["bytecode"];
                            env[retReg] = retVal;
                        }else{
                            if(programState.state === "Running"){
                                //return from coroutine
                                programState.state = "Dead";

                                var size = programState.prevProgramState.callstack.length;
				var retreg = programState.prevProgramState.retReg
                                programState.prevProgramState.callstack[size-1].env[retreg] = env[nextByteCode.value];
                                return resumeProgram(programState.prevProgramState);
                            }
                        }
                        break;

                    case "int-lit":
                        env[nextByteCode.target] = nextByteCode.value
                            break;

                    case "string-lit":
                        env[nextByteCode.target] = nextByteCode.value
                            break;

                    case "empty-dict-lit":
                        env[nextByteCode.target] = new Table();
                        break;

                    case "null":
                        env[nextByteCode.target] = null
                            break;

                    case "+":
                        var op1 = env[nextByteCode.operand1];
                        var op2 = env[nextByteCode.operand2];
                        if((!isNumber(op1) && !isString(op1)) || (!isNumber(op2) && !isString(op2))){
                            printError("Operands to + must be numbers or strings.");
                        }
                        env[nextByteCode.target] = op1 + op2;
                        break;
                    case "-":
                        var op1 = env[nextByteCode.operand1];
                        var op2 = env[nextByteCode.operand2];
                        if((!isNumber(op1)) || (!isNumber(op2))){
                            printError("Operands to - must be numbers.");
                        }
                        env[nextByteCode.target] = op1 - op2;
                        break;
                    case "*":
                        var op1 = env[nextByteCode.operand1];
                        var op2 = env[nextByteCode.operand2];
                        if((!isNumber(op1)) || (!isNumber(op2))){
                            printError("Operands to * must be numbers.");
                        }
                        env[nextByteCode.target] = op1 * op2;
                        break;
                    case "/": 
                        var op1 = env[nextByteCode.operand1];
                        var op2 = env[nextByteCode.operand2];
                        if(!isNumber(op1) || !isNumber(op2))
                        {
                            printError("Operands to / must be numbers.");
                        }

                        if(op2 === 0) {
                            printError("Division by zero");
                        }
                        env[nextByteCode.target] = Math.floor(op1/op2);
                        break;
                    case '==':
                        var bool = env[nextByteCode.operand1] === env[nextByteCode.operand2];
                        if(bool) {env[nextByteCode.target] = 1} else {env[nextByteCode.target] = 0};
                        break;
                    case '!=':
                        var bool = env[nextByteCode.operand1] !== env[nextByteCode.operand2];
                        if(bool) {env[nextByteCode.target] = 1} else {env[nextByteCode.target] = 0};
                        break;
                    case '<=':
                        var op1 = env[nextByteCode.operand1];
                        var op2 = env[nextByteCode.operand2];
                        if(!isNumber(op1) || !isNumber(op2)) {
                            printError("Operands to <= must be numbers.");
                        }
                        if(op1 <= op2) {env[nextByteCode.target] = 1} else {env[nextByteCode.target] = 0};
                        break;
                    case '>=':
                        var op1 = env[nextByteCode.operand1];
                        var op2 = env[nextByteCode.operand2];
                        if(!isNumber(op1) || !isNumber(op2)) {
                            printError("Operands to >= must be numbers.");
                        }
                        if(op1 >= op2) {env[nextByteCode.target] = 1} else {env[nextByteCode.target] = 0};
                        break;
                    case '<':
                        var op1 = env[nextByteCode.operand1];
                        var op2 = env[nextByteCode.operand2];
                        if(!isNumber(op1) || !isNumber(op2)) {
                            printError("Operands to < must be numbers.");
                        }
                        if(op1 < op2) {env[nextByteCode.target] = 1} else {env[nextByteCode.target] = 0};
                        break;
                    case '>':
                        var op1 = env[nextByteCode.operand1];
                        var op2 = env[nextByteCode.operand2];
                        if(!isNumber(op1) || !isNumber(op2)) {
                            printError("Operands to > must be numbers.");
                        }
                        if(op1 > op2) {env[nextByteCode.target] = 1} else {env[nextByteCode.target] = 0};
                        break;

                    case "get":
                        var table = env[nextByteCode.dict];
                        var value;
                        if(!(table instanceof Table)) {
                            printError("Trying to index non-table.");
                        }
                        var key = env[nextByteCode.field];

                        var has_key = table.has_key(key);

                        if(has_key==0){
                            if(typeof key==="object" && key!=null && key.type==="closure") key="Lambda";
			    else if(typeof key==="object" && key!=null && key.type==="coroutine") key="Coroutine: "+key.body.state;
                            printError("Tried to get nonexistent key: "+key);
                        }
                        else if(has_key==-1){
                            if(typeof key==="object" && key!=null && key.type==="closure") key="Lambda";
			    else if(typeof key==="object" && key!=null && key.type==="coroutine") key="Coroutine: "+key.body.state;

                            printError("Tried to get nonexistent key: "+key+".  Non-table used as metatable.");
                        }
                        else if(has_key==-2){
                            if(typeof key==="object" && key!=null && key.type==="closure") key="Lambda";
			    else if(typeof key==="object" && key!=null && key.type==="coroutine") key="Coroutine: "+key.body.state;

                            printError("Tried to get nonexistent key: "+key+".  No __index in metatable.");
                        }
                        else if(has_key==-3){
                            if(typeof key==="object" && key!=null && key.type==="closure") key="Lambda";
			    else if(typeof key==="object" && key!=null && key.type==="coroutine") key="Coroutine: "+key.body.state;

                            printError("Tried to get nonexistent key: "+key+".  Non-table used as __index.");
                        }
                        env[nextByteCode.target] = table.get(key);
                        break;
                    case 'in':
                        var dict = env[nextByteCode.dict];
                        if (dict && dict instanceof Table){
                            env[nextByteCode.target] = dict.has_key(env[nextByteCode.key]);
                        }
                        else {throw new ExecError('Trying to find key in non-table.');}
                        break;

                    case "lambda":
                        env[nextByteCode.target] = makeClosure(nextByteCode.arguments, nextByteCode.body,env)
                            break;

                    case "call":
                        var fn = env[nextByteCode.function];

                        if(fn != null && fn.type && fn.type === 'closure'){
                            var newEnv = envExtend(fn['*parent']);

                            var fn_names_length = fn.names.length;
                            var node_args_length = nextByteCode.arguments.length;
                            var evaluatedArgs = new Array();

                            for(var i = 0; i < node_args_length; i++){
                                evaluatedArgs[i] = env[nextByteCode.arguments[i]];
                            }

                            if(fn_names_length !== node_args_length){
                                printError("Wrong number of arguments");	
                            }

                            for(var i = 0; i < fn_names_length; i++){
                                envBind(newEnv, fn.names[i]['name'], evaluatedArgs[i], log);
                            }
                            //push current pc and new stackframe
                            programState["callstack"].push(programState["pc"]);
                            var newStackFrame = makeStackFrame(fn.body, newEnv, nextByteCode.target);
                            programState["callstack"].push(newStackFrame);

                            //reset pc, bytecode and env
                            programState["pc"] = -1; 
                            bytecode = fn.body;
                            env = newStackFrame['env']
                        }
                        else
                        {
                            printError("Trying to call non-lambda");
                        }

                        break;

                    case "id":
                        env[nextByteCode.target] = envLookup(env, nextByteCode.name, log);
                        break;

                    case "type":
                        var obj = env[nextByteCode.argument];
                        if(obj instanceof Table){
                            env[nextByteCode.target] = "table";
                        }
                        else env[nextByteCode.target] = "other";
                        break;

                    case "def":
                        envBind(env, nextByteCode.name, env[nextByteCode.value], log);
                        env[nextByteCode.target] = null;
                            break;

                    case "exp":
                        env[nextByteCode.target] = env[nextByteCode.body];
                        break;
                    case "len": 
                        var table = env[nextByteCode.dict];
                        if(!(table instanceof Table)) {
                            printError("Trying to call len on non-table.");
                        }
                        env[nextByteCode.target] = table.get_length();
                        break;
                    case "put":
                        var val = env[nextByteCode.value];
                        var exp = env[nextByteCode.dict];
                        if(!(exp instanceof Table)) {
                            printError("Trying to put into non-table.");
                        }
                        exp.put(env[nextByteCode.field],val);
                        env[nextByteCode.target] = null;
                        break;  
                    case "ite":
                        var cond = env[nextByteCode.condition];
                        var ct = env[nextByteCode.true];
                        var cf = env[nextByteCode.false];
                        if (cond == null) {
                            cond = false;
                        }
                        if ((typeof cond !== 'boolean') && (!isNumber(cond))) {
                            throw new ExecError('Condition not a boolean');
                        }
                        env[nextByteCode.target] = cond ? ct : cf;
                        break;
                    case "error":
                        var err = env[nextByteCode.value];
                        if((typeof err)==="object" && err != null){
                            if(err.type==="closure"){
                                err = "Lambda"; 
                            }
                        }
                        if(err instanceof Table){
                            var objstr = err.toString();
			    throw new ExecError(objstr);          
                        } else if(err != null && err.type === "coroutine") {
                            throw new ExecError("Coroutine: "+err.body.state);
                        } else {
                            throw new ExecError(err);
                        }
                        break;
                    case "print":
                        var exp = env[nextByteCode.value];
                        if((typeof exp)==="object" && exp != null){
                            if(exp.type==="closure") exp="Lambda";
                        }
                        if(exp instanceof Table){
                            var objstr = exp.toString();
                            log(objstr);
                        } else if(exp != null && exp.type === "coroutine") {
                            console.log("Coroutine: "+exp.body.state);
                        } else {
                            log(exp);
                        }
                        env[nextByteCode.target] = null;
                        break;

                    case "asgn":
                        envUpdate(env, nextByteCode.name, env[nextByteCode.value], log);
                        env[nextByteCode.target] = null;
                        break;
                    case "coroutine":
                        var f = env[nextByteCode.body];
                        if(!f || f.type !== "closure") {
                            printError("Tried to create coroutine with non-lambda.");
                        }
                        if(f.names.length !== 1) {
                            printError("Coroutine lambdas must accept exactly one argument.");
                        }
                        env[nextByteCode.target] = {'type': 'coroutine', 'body': makeProgramState(f.body, env, "Suspended"), 'argName': f.names[0].name}
                        break;
                    case "resume":
                        var co = env[nextByteCode.coroutine], 
                            arg = env[nextByteCode.arg];
                        if(!co || co.type !== "coroutine") {
                            printError("Tried to call resume on non-coroutine.");
                        } else if(co.body.state !== "Suspended") {
                            printError("Coroutine not resumable.");
                        }
                        co.body.state = "Running";
                        programState["pc"]++;
                        co.body.prevProgramState = programState;
                        if(!co.body.resumed){
                            co.body.resumed = 1;
                            var argName = env[nextByteCode.coroutine].argName;
                            var argVal = env[nextByteCode.arg]
                                var oldEnv = env[nextByteCode.coroutine].body.callstack[0].env

                                //make a new environment for the coroutine lambda 
                                var newEnv = envExtend(oldEnv)
                                env[nextByteCode.coroutine].body.callstack[0].env = newEnv;
                            envBind(newEnv, argName, argVal, log);
                        }
                        else
                        {
                            var size = co.body.callstack.length;
                            co.body.callstack[size-1].env[co.body.retReg] = env[nextByteCode.arg]
                        }

                        //store return register
                        programState.retReg = nextByteCode.target
                        return resumeProgram(co.body);
                        break;
                    case "yield":
                        if(programState.state === null) printError("Tried to yield from non-coroutine.")
                            programState.state = "Suspended";
                        programState["pc"]++;
                        var size = programState.prevProgramState.callstack.length;
			var retreg = programState.prevProgramState.retReg;
                        programState.prevProgramState.callstack[size-1].env[retreg] = env[nextByteCode.arg];
                        //store return register in previous programState
                        programState.retReg = nextByteCode.target; 
                        return resumeProgram(programState.prevProgramState)
                            break;
                    case "tcall":
                        var fn = env[nextByteCode.function];

                        if(fn != null && fn.type && fn.type === 'closure'){
                            var newEnv = envExtend(fn['*parent']);

                            var fn_names_length = fn.names.length;
                            var node_args_length = nextByteCode.arguments.length;
                            var evaluatedArgs = new Array();

                            for(var i = 0; i < node_args_length; i++){
                                evaluatedArgs[i] = env[nextByteCode.arguments[i]];
                            }

                            if(fn_names_length !== node_args_length){
                                printError("Wrong number of arguments");	
                            }

                            for(var i = 0; i < fn_names_length; i++){
                                envBind(newEnv, fn.names[i]['name'], evaluatedArgs[i], log);
                            }
                            //push current pc and new stackframe
                            var retReg = programState["callstack"].pop()["retReg"];
                            var newStackFrame = makeStackFrame(fn.body, newEnv, retReg);
                            programState["callstack"].push(newStackFrame);

                            //reset pc, bytecode and env
                            programState["pc"] = -1; 
                            bytecode = fn.body;
                            env = newStackFrame['env']


                        }
                        else
                        {
                            printError("Trying to call non-lambda");
                        }

                        break;
                }
                programState["pc"]++;
            }
    }

    function execBytecode(bytecode, env) {
        // TODO step 3: based on how you decide to implement
        // makeProgramState, make sure the makeProgramState call below
        // suits your purposes.
        return resumeProgram(makeProgramState(bytecode, env, null));
    }

    function tailCallOptimization(insts){
        // TODO step 5: implement this function, (which is called below).
        // It should take bytecode as input and transform call instructions
        // into tcall instructions if they can be optimized with the
        // tail call optimization.
        var inst, len, body;
        for (var i = 0; i < insts.length; i++) {
            inst = insts[i];
            if (inst.type == 'lambda') {
                body = inst.body;
                tailCallOptimization(body);
                len = body.length;
                if (body[len - 2].type == "call" && body[len - 1].type == "return") {
                    body[len - 2].type = "tcall";
                }
            }
        }
    }

    function desugarAll(remaining, desugared, callback) {
        if (remaining.length == 0) {
            setTimeout(function () {
                    callback(desugared);
                    }, 0);
            return;
        }

        var head = remaining.shift();
        desugarAST(head, function(desugaredAst) {
                desugared.push(desugaredAst);
                desugarAll(remaining, desugared, callback);
                });
    }

    var root = envRoot();
    root['*title'] = 'Root';


    desugarAll(asts, [], function(desugaredAsts) {
            for (var i = 0, ii = desugaredAsts.length; i < ii; ++i) {
            try {
            var bytecode = compileToBytecode(desugaredAsts[i]);
            //console.log(JSON.stringify(bytecode));
            tailCallOptimization(bytecode);
            execBytecode(bytecode, root);
            } catch (e) {
            if (e instanceof ExecError) {
            log('Error: ' + e.message);
            } else {
            throw e;
            }
            }
            }
            });
};

if (typeof(module) !== 'undefined') {
    module.exports = {
        'interpret': interpret
    };
}
