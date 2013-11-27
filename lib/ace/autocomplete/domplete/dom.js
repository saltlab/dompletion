define(function(require, exports, module) {
	"use strict";
	
	var constants = require('./constants');
	
	if (typeof String.prototype.startsWith != 'function') {
  		// see below for better implementation!
  		String.prototype.startsWith = function (str){
			return this.indexOf(str) == 0;
		};
	}
	
	function isDOMCall(value) {
		var DOMAccessRegex = new RegExp("^[a-zA-Z_0-9\$\-]+(\.getElementById\\(.*\\)|\.getElementsByTagName\\(.*\\)|\.getElementsByClassName\\(.*\\))+$","g");
    	
    	if(value.match(DOMAccessRegex))
    		return true;
    	else
    		return false;
	}
	
	function replaceParams(val, literals) {
		//TODO: add code to replace param values
		//	    return false if variables still present
		return val;
	}
	
	function filterScopeVars(vars, scopes) {
		
		var variables = vars['variables'];
		var dom = [];
		
		var literals = new Array();
		
		for(var scope in scopes) {
			var s = scopes[scope];
			
			if(variables[s] != null) {
				var variable = variables[s];
				
				if(variable['type'] == 'Literal') {
					literals[variable['varName']] = variable['value'].substring(1,variable['value'].length-1);
				} 
				
				else if(variable['type'] == 'Identifier') {
					if(literals[variable['value']] != null) {
						literals[variable['varName']] = literals[variable['value']];
					} 
				} 
				
				else if(variable['type'] == 'CallExpression') {
					var val = variable['value'];
					
					if(isDOMCall(val)) {
						
						val = replaceParams(val,literals);
						
						if(val) {
							if(!val.startsWith("document.")) {
								var valArr = val.split(".");
								var temp = valArr[0];
								if(dom[temp] != null) {
									valArr[0] = dom[temp];
								} else {
									valArr[0] = 'document';
								}
								val = valArr.join(".");
							}
							dom[variable['varName']] = val;
						}
					} 
					
					else {
						console.log("no DOM call: " + val);
						//TODO: process Non-DOM call expression
					}
				}
			}
				
		}
		return dom;
	}
	
	function generateDOMStrings(vars) {
		var targetScope = vars['targetScope'];
		
		var scope = targetScope.split(",");
		var prevScope = "";
		vars['DOM'] = [];
		
		vars['DOM']['document'] = 'body';
		var checks = new Array();
		
		for(var s in scope) {
			var limit = parseInt(scope[s]);
			for(var i=0;i<=limit;i++) {
				var check = prevScope + i;
				checks.push(check);	
			
			}
			prevScope += limit + ",";
		}
		
		return filterScopeVars(vars,checks);
		
	}
	
	
	exports.generateDOMStrings = generateDOMStrings;
});