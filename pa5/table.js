if (typeof(module) !== 'undefined') {
  var ExecError = require('./errors.js').ExecError;
}

var seenObj = [];
// TODO: Use Table to implement dictionaries, lists, and objects
// Complete all the requisite methods below
function Table() { 
	this.int_tab = {};
	this.string_tab = {};
	this.object_key = new Array();
	this.object_value = new Array();
	this.order = new Array();
}

Table.prototype.put = function(key, value) {
	if (typeof key === 'number') {
		if (!this.int_tab.hasOwnProperty(key)) {
		this.order.push(key);
		} 
		this.int_tab[key] = value
	} 
	else if(typeof key === 'string'){
		if (!this.string_tab.hasOwnProperty(key)) {
		this.order.push(key);
		} 
		this.string_tab[key] = value
	}	
	else {
		var keyIndex = this.object_key.indexOf(key);
		if(keyIndex===-1){
			this.object_key.push(key);
			this.object_value.push(value);
			this.order.push(key)
		}
		else{
			this.object_value[keyIndex]=value;
		}	
	}
};

Table.prototype.has_key = function(key) {
	var retval;

	if (typeof key === 'number') {
		retval = this.int_tab.hasOwnProperty(key);
	} 
	else if(typeof key === 'string'){
		retval =  this.string_tab.hasOwnProperty(key);
	}
	else {
		var keyIndex = this.object_key.indexOf(key);
		if(keyIndex === -1) retval = 0;
		else retval = 1;	
	}
	if(retval) return 1;
	else{
		var mt = this.get("__mt");
		if(mt !== null && !mt) return 0;
		else if(mt === null || !(mt instanceof Table)) return -1;
		else if(!mt.get("__index") && mt.get("__index")!==null) return -2;
		else if(!(mt.get("__index") instanceof Table)) return -3;
		var nextTable = mt.get("__index");
		return nextTable.has_key(key);
	}
};

Table.prototype.get = function(key) {
	var retval;
	if(key==="__mt" || key==="__index") return this.string_tab[key];
	
	if (typeof key === 'number') {
		retval = this.int_tab[key];
	} 
	else if(typeof key === 'string'){
		retval = this.string_tab[key];
	}
	else{
		var keyIndex = this.object_key.indexOf(key);
		if(keyIndex === -1) retval = undefined;
		else retval = this.object_value[keyIndex];
	}
	if(retval!==undefined) return retval;
	else{
		var mt = this.get("__mt");
		if(!mt || !(mt instanceof Table) || !mt.get("__index") || !(mt.get("__index") instanceof Table)) return 0;
		var nextTable = mt.get("__index");
		return nextTable.get(key);
	}
};

Table.prototype.toString = function() {
	var str = "{";
	var i = 0;
	var tab;
	for (var index in this.order) {
		var k = this.order[index];
		if (typeof k === 'number') {
			tab = this.int_tab;
		} 
		else if(typeof k === 'string'){
			tab = this.string_tab;
		}
		else tab = "object";
		if (tab == "object" || tab.hasOwnProperty(k)) {
			if(i != 0) {
			str += ", ";
			}
			i++;

			var keyIndex = this.object_key.indexOf(k);
			if(tab === "object") tabk = this.object_value[keyIndex];
			else tabk = tab[k];

			if(typeof k==="object" && k!==null  && k.type==="closure") str+= "Lambda"+ ": ";
			else if(typeof k==="object" && k!==null  && k.type==="coroutine") str+= "Coroutine: "+k.body.state+": ";
			else str += k + ": ";
			if(tabk===null) str+=null;
			else if(tabk===this) str+="self";	
			else if(tabk.type==="closure") str+="Lambda";
			else if(tabk.type==="coroutine") str+="Coroutine: "+tabk.body.state;
			else if(typeof tabk === "object")
				{

				if(seenObj.indexOf(tabk)!==-1) str+="Table";
				else
					{
					seenObj.push(tabk);
					str+=tabk;
					seenObj.pop();	
					}
				}
			else str+=tabk;
		}
	}
	str += "}";
	return str;
};
/* Relies on the fact that the dictionary sorts the keys in the integer table */
Table.prototype.get_length = function() {
	var len = 0;
        while(this.has_key(len) > 0) {len++;}
	return len;
};

if (typeof(module) !== 'undefined') {
  module.exports = {
    Table: Table
  };
}
