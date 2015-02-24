if (typeof(module) !== 'undefined') {
  var ExecError = require('./errors.js').ExecError;
  var desugarAST = require('./desugar.js').desugarAST;
  var env = require('./environment.js');
  var envRoot = env.root;
  var envExtend = env.extend;
  var envBind = env.bind;
  var envUpdate = env.update;
  var envLookup = env.lookup;
}

var interpret = function(asts, log, err) {

  var root = envRoot();
  root['*title'] = 'Root';

  // TODO: Complete the closure implementation. What's missing?
  function makeClosure(names, body, env) {
    return {
      "names": names,
	"body": body,
	"type": 'closure',
	"*parent": env
    };
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

  function evalExpression(node, env){
    var op1,op2,bool;
    switch (node.type) {
      case 'native':
        var func = node.function.name;
        var args = node.arguments;

        var jsArgs = args.map(function(n) {
          return toJSObject(evalExpression(n, env));
        });
        var jsFunc = runtime[func];

        var ret = jsFunc.apply(null, jsArgs);
        return to164Object(ret);
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
      case "int-lit":
		return node.value;
      case "string-lit":
		return node.value;
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
      case "call":

		var fn = evalExpression(node.function, env);
		if (fn != null && fn.type && fn.type === 'closure') {
	  // TODO: Perform a call. The code below will only work if there are
	  // no arguments, so you'll have to fix it.  The crucial steps are:
	  // 1. Extend the environment with a new frame --- see environment.js.

			var newEnv = envExtend(fn['*parent']);

	  // 2. Add argument bindings to the new frame.
			var fn_names_length = fn.names.length;
			var node_args_length = node.arguments.length;

			if(fn_names_length !== node_args_length) {
				printError("Wrong number of arguments");
			}
			for(var i = 0; i < fn_names_length; i++)
			{
				envBind(newEnv,fn.names[i]['name'], evalExpression(node.arguments[i],env),log);
			}
			return evalBlock(fn.body, newEnv);
		} else {
			throw new ExecError('Trying to call non-lambda');
		}
		break;
	

    }
  }

  function evalStatement(node, env) {
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
	log(exp);
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

      case "while":
	log(node)
	process.exit(1)
        return null
      default:
	throw new Error(
	    "What's " + node.type + "? " + JSON.stringify(node)
	    );
    }
  }

  var desugarOne = function(asts){
    var ast, remaining_asts;
    if (asts.length > 0){
      ast = asts.shift(); //pops first item
      remaining_asts = asts; //first item already popped
    }
    else{ return; } // no more ASTs to eval
    desugarAST(ast, function(ast) {
	try {
	evalBlock(ast, root);
	desugarOne(remaining_asts);
	} catch (e) {
	if (e.constructor === ExecError) {
	log('Error: ' + e.message);
	} else {
	throw e;
	}
	}
	});
  };
  desugarOne(asts);
};

// Makes the interpreter importable in Node.js
if (typeof(module) !== 'undefined') {
  module.exports = {
    'interpret': interpret
  };
}
