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

var interpret = function(asts, log, err) {
    var root = envRoot();
    root['*title'] = 'Root';

    // Returns a closure, a data structure which stores the param names
    // (id objects), the body of the function, and the referencing
    // environment, in which it was initialized --- (for lexical scoping).
    function makeClosure(names, body, env) {
        //TODO: Use your own makeClosure here
        return {
            "names": names,
            "body": body,
            "type": 'closure',
            "*parent": env
        };
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

    function evalBlock(t, env) {
        var last = null;
        t.forEach(function(n) {
                last = evalStatement(n, env);
                });
        return last;
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
    

    function evalExpression(node, env) {
        //TODO: Use your own evalExpression here
        // keep the 'native' case below for using native JavaScript
        // introduce new cases as needed to implement dictionaries,
        // lists, and objects
        var op1,op2,bool;
        switch (node.type) {
		/*
            case 'native':
                var func = node.function.name;
                var args = node.arguments;

                var jsArgs = args.map(function(n) {
                        return toJSObject(evalExpression(n, env));
                        });
                var jsFunc = runtime[func];

                var ret = jsFunc.apply(null, jsArgs);
                return to164Object(ret);
		*/
            case '+':
                op1 = evalExpression(node.operand1, env);
                op2 = evalExpression(node.operand2, env);
                if((!isNumber(op1) && !isString(op1)) || (!isNumber(op2) && !isString(op2))){
                    printError("Operands to + must be numbers or strings.");
                }
                return op1 + op2;
            case '-':
                op1 = evalExpression(node.operand1, env);
                op2 = evalExpression(node.operand2, env);

                if(!isNumber(op1) || !isNumber(op2))
                {
                    printError("Operands to - must be numbers.");
                }
                return op1 - op2;
            case '*':
                op1 = evalExpression(node.operand1, env);
                op2 = evalExpression(node.operand2, env);

                if(!isNumber(op1) || !isNumber(op2))
                {
                    printError("Operands to * must be numbers.");
                }
                return op1*op2;
            case '/':
                op1 = evalExpression(node.operand1, env);
                op2 = evalExpression(node.operand2, env);

                if(!isNumber(op1) || !isNumber(op2))
                {
                    printError("Operands to / must be numbers.");
                }

                if(op2 == 0) {
                    printError("Division by zero");
                }
                return Math.floor(op1/op2);
            case '==':
                bool = evalExpression(node.operand1, env) === evalExpression(node.operand2, env);
                if(bool) {return 1;} else {return 0};
            case '!=':
                bool = evalExpression(node.operand1, env) !== evalExpression(node.operand2, env);
                if(bool) {return 1;} else {return 0};
            case '<=':
                op1 = evalExpression(node.operand1, env);
                op2 = evalExpression(node.operand2, env);
                if(!isNumber(op1) || !isNumber(op2)) {
                    printError("Operands to <= must be numbers.");
                }
                if(op1 <= op2) {return 1;} else {return 0};
            case '>=':
                op1 = evalExpression(node.operand1, env);
                op2 = evalExpression(node.operand2, env);
                if(!isNumber(op1) || !isNumber(op2)) {
                    printError("Operands to >= must be numbers.");
                }
                if(op1 >= op2) {return 1;} else {return 0};
            case '<':
                op1 = evalExpression(node.operand1, env);
                op2 = evalExpression(node.operand2, env);
                if(!isNumber(op1) || !isNumber(op2)) {
                    printError("Operands to < must be numbers.");
                }
                if(op1 < op2) {return 1;} else {return 0};
            case '>':
                op1 = evalExpression(node.operand1, env);
                op2 = evalExpression(node.operand2, env);
                if(!isNumber(op1) || !isNumber(op2)) {
                    printError("Operands to > must be numbers.");
                }
                if(op1 > op2) {return 1;} else {return 0};
            case "id":
                return envLookup(env, node.name,log);

	    case "type":
		var obj = evalExpression(node.body, env);
		if(obj instanceof Table){
		return "table";
		}
		return "other";
            case "get":
                var table = evalExpression(node.dict, env);
                var value;
                if(!(table instanceof Table)) {
                    printError("Trying to index non-table.");
                }
		var key = evalExpression(node.field,env);

		var has_key = table.has_key(key);
		if(has_key==0){
		if(typeof key==="object" && key!=null && key.type==="closure") key="Lambda";
		printError("Tried to get nonexistent key: "+key);
		}
		else if(has_key==-1){
		if(typeof key==="object" && key!=null && key.type==="closure") key="Lambda";
			printError("Tried to get nonexistent key: "+key+".  Non-table used as metatable.");
			}
		else if(has_key==-2){
		if(typeof key==="object" && key!=null && key.type==="closure") key="Lambda";
			printError("Tried to get nonexistent key: "+key+".  No __index in metatable.");
			}
		else if(has_key==-3){
		if(typeof key==="object" && key!=null && key.type==="closure") key="Lambda";
			printError("Tried to get nonexistent key: "+key+".  Non-table used as __index.");
			}
		return table.get(key);

            case "in":
                var op1; 
                var op2 = evalExpression(node.operand2, env);

                if(!(op2 instanceof Table)){
                    printError("Trying to find key in non-table.");
                }
                else {op1 = evalExpression(node.operand1, env);}
                if(op2.has_key(op1) <= 0) return 0;
                else return 1;
			
	    case "len": 
		var table = evalExpression(node.dict, env);
		if(!(table instanceof Table)) {
                    printError("Trying to call len on non-table.");
                }
		return table.get_length();

            case "int-lit":
                return node.value;
            case "string-lit":
                return node.value;
            case "empty-dict-lit":
                return new Table();
            case "null":
                return null;
 
            case "ite":
                var cond = evalExpression(node.condition, env);
                var ct = evalExpression(node.true,  env);
                var cf = evalExpression(node.false, env);
                if (cond == null) {
                    cond = false;
                }
                if ((typeof cond !== 'boolean') && (!isNumber(cond))) {
                    throw new ExecError('Condition not a boolean');
                }
                return cond ? ct : cf;
            case "lambda":
                return makeClosure(node.arguments, node.body, env);

                /* Added for project 3*/
            case "exp":
		/*special case for type*/
                return evalExpression(node.body,env);
            case "call":
		//special case for type
		
		if(node.function.type=='id' && node.function.name =='type'){
		//throw some ast over here
		   var ast = { body:  node.arguments[0], type: 'type' };
		   return evalExpression(ast, env);
		   }	
			
                var fn = evalExpression(node.function, env);
                if (fn != null && fn.type && fn.type === 'closure') {
                    // TODO: Perform a call. The code below will only work if there are
                    // no arguments, so you'll have to fix it.  The crucial steps are:
                    // 1. Extend the environment with a new frame --- see environment.js.

                    var newEnv = envExtend(fn['*parent']);

                    // 2. Add argument bindings to the new frame.
                    var fn_names_length = fn.names.length;
                    var node_args_length = node.arguments.length;
		    var evaluatedArgs = new Array();

                    for(var i = 0; i < node_args_length; i++)
                    {
                        evaluatedArgs[i]=evalExpression(node.arguments[i],env);
                    }
                    if(fn_names_length !== node_args_length) {
                        printError("Wrong number of arguments");
                    }
                    for(var i = 0; i < fn_names_length; i++)
                    {
                        envBind(newEnv,fn.names[i]['name'], evaluatedArgs[i],log);
                    }
                    return evalBlock(fn.body, newEnv);
                } else {
                    throw new ExecError('Trying to call non-lambda');
                }
                break;

        }
    }

    function evalStatement(node, env) {
        //TODO: Use your own evalStatement here
        // introduce new cases as needed to implement dictionaries,
        // lists, and objects
        var exp;
        switch (node.type) {
            // TODO: Complete for statements that aren't handled
            case "def":
                envBind(env, node.name.name, evalExpression(node.value, env),log);
                return null;
            case "print":
                exp = evalExpression(node.value, env);
                if((typeof exp)==="object" && exp != null){
                    if(exp.type==="closure"){
                        exp = "Lambda";
                    }
                }
                if (exp instanceof Table) {
                    var objstr = exp.toString();
		    console.log(objstr);
                } else {
		   log(exp);
                }
                return null;
            case "error":
                var err = evalExpression(node.message, env);
                if((typeof err)==="object" && err != null){
                    if(err.type==="closure"){
                        err = "Lambda"; 
                    }
                }
                throw new ExecError(err);
            case "exp":
                return evalExpression(node.body, env);

            case "asgn":
                envUpdate(env,node.name.name, evalExpression(node.value, env),log);
                return null;

            case "put":
		var val = evalExpression(node.value,env);
                var exp = (evalExpression(node.dict, env));
		if(!(exp instanceof Table)) {
		  printError("Trying to put into non-table.");
		}
                exp.put(evalExpression(node.field,env),val);
                return val;

            default:
                throw new Error(
                        "What's " + node.type + "? " + JSON.stringify(node)
                        );
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

    desugarAll(asts, [], function(desugaredAsts) {
            for (var i = 0, ii = desugaredAsts.length; i < ii; ++i) {
            try {
            evalBlock(desugaredAsts[i], root);
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
