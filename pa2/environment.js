if (typeof(module) !== 'undefined') {
  var ExecError = require('./errors.js').ExecError;
}

/* Creates a root environment. */
function envRoot() {
  return {
    // The root doesn't have a parent. The `*parent` symbol is illegal in our
    // language, and thus safe to bind.
    '*parent': null
  };
}

/* Extends the environment. */
function envExtend(parent) {
  // TODO: Add a new frame to the environment
    return {'*parent':parent}
    
}


/* Binds a new value to the top frame. */
function envBind(frame, name, value,log) {
// TODO: Define "name", which must be bound to "value"
    if(frame.hasOwnProperty(name)){
        log("Error: "+name+" is already declared");
        process.exit(1);
    }
    else {
        frame[name] = value;
    }

}

/* Updates the value binding of a variable. */
function envUpdate(frame, name, value, log) {

  // TODO: Update the environment; variable "name" must be bound to "value"
    if(frame.hasOwnProperty(name)){
        frame[name] = value;
        }
    else{
        if(frame["*parent"]==null){
            log("Error: "+name+" is not declared");
            process.exit(1);
        }
        else envUpdate(frame["*parent"], name, value,log);
    
    }
}

/* Looks up the value of a variable. */
function envLookup(frame, name,log) {
  // TODO: Lookup the value of "name" in "env" in the current and previous frames
  if (frame.hasOwnProperty(name)) {
    return frame[name];
  } else {
    if(frame["*parent"]==null){
        log("Error: "+name+" is not declared");
        process.exit(1);
        }
    else return envLookup(frame["*parent"], name, log);
  }
}

if (typeof(module) !== 'undefined') {
  module.exports = {
    root: envRoot,
    extend: envExtend,
    bind: envBind,
    update: envUpdate,
    lookup: envLookup
  };
}
