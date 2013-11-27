define(function(require, exports, module) {
	"use strict";
	
	var constants = require('./domplete/constants');
	var esprima = require('./domplete/esprima');
	var dom = require('./domplete/dom');
	var complete = require('./domplete/complete');
	
	if (typeof String.prototype.startsWith != 'function') {
		String.prototype.startsWith = function (str){
    		return this.indexOf(str) == 0;
  		};
	}
	
	function isStringProperty(property) {
	
		if (String.prototype.hasOwnProperty(property) ) 
			return true;
		else
			return false;
	}

	
	//check if variable is found in current scope or any of the parent scope
	function inScope(varName, vars, prevScope, curScope) {
		if(vars['debug'])
			console.log("checking inScope " + prevScope + curScope + " " + varName);
		var ret = false;
	
		var limit = parseInt(curScope);
		
		for(var i=0;i<=limit;i++) {
			var check = prevScope + i;
			if(vars['variables'][check] != null && vars['variables'][check]['varName'] == varName)
				ret = true;	
		}
		
		return ret;
	}

	//check if it is a global variable
	function inGlobal(varName,funcName,vars) {
		if(vars['debug'])
			console.log("checking inGlobal " + varName);
		var ret = false;
	
		for(var variable in vars['globals']) {
			if(vars['globals'][funcName] != null && vars['globals'][funcName][varName])
				ret = true;
		}
		return ret;
	}

	function getValueFromScope(variable,vars,scope) {
		
		if(vars['debug'])
			console.log("getting value from scope " + variable);
		
		scope = scope.split(",");
		var prevScope = '';
		var ret = '';
		var checks = new Array();
			
		for(var s in scope) {
			var limit = parseInt(scope[s]);
			for(var i=0;i<=limit;i++) {
				check = prevScope + i;
				checks.push(check);
			}
			prevScope += limit + ",";
		}
	
		checks = checks.reverse();
		if(vars['debug']) {
			console.log(checks);
			console.log(vars);
		}
		for(var i=0;i<=checks.length;i++) {
			var check = checks[i];
			if(vars['variables'][check] != null && vars['variables'][check] != "" && vars['variables'][check]['varName'] == variable) {
				ret = vars['variables'][check]['value'];
				break;		
			}
		}
		return ret;	
	}
	function getLiteralValueFromScope(variable,vars,scope) {
		
		if(vars['debug'])
			console.log("getting literal value from scope " + variable);
		
		scope = scope.split(",");
		var prevScope = '';
		var ret = '';
		var checks = new Array();
			
		for(var s in scope) {
			var limit = parseInt(scope[s]);
			for(var i=0;i<=limit;i++) {
				check = prevScope + i;
				checks.push(check);
			}
			prevScope += limit + ",";
		}
	
		checks = checks.reverse();
		if(vars['debug']) {
			console.log(checks);
			console.log(vars);
		}
		for(var i=0;i<=checks.length;i++) {
			var check = checks[i];
			if(vars['variables'][check] != null && vars['variables'][check] != "" && vars['variables'][check]['varName'] == variable && vars['variables'][check]['type'] == 'Literal') {
				ret = vars['variables'][check]['value'];
				break;		
			}
		}
		return ret;	
	}

	function processMemberExpression(data,vars,scope) {
		var value = "";
		if(data['object']['type'] == 'Identifier')
			value += "." + data['object']['name'];
		
		else if(data['object']['type'] == 'MemberExpression')
			value += "." + processMemberExpression(data['object'],vars,scope);
		
		else if(data['object']['type'] == 'CallExpression')
			value += "." + processCallExpression(data['object'],vars,scope)['value'];
			
		if(data['property']['type'] == 'Identifier')
			value += "." + data['property']['name'];
	
		value = value.substring(1);
		return value;
	}

	function processCallExpression(data,vars,scope) {
	
		var value = "";
		var evaluate = true;
		
		if(data['callee']['name'] != null && data['callee']['type'] == 'Identifier')
			value += "." + data['callee']['name'];
		
		else if(data['callee']['object']['type'] != null && data['callee']['object']['type'] == 'Identifier') {
			value += "." + data['callee']['object']['name'];			
		}
	
		else if(data['callee']['object']['type'] == 'MemberExpression')
			value += "." + processMemberExpression(data['callee']['object'],vars,scope);
	
		else if(data['callee']['object']['type'] == 'CallExpression') {
			var tempRet = processCallExpression(data['callee']['object'],vars,scope);
			value += "." + tempRet['value'];
			
			if(tempRet['evaluate'] == false)
				evaluate = false;
		}
		
		if(data['callee']['property'] != null && data['callee']['property']['type'] == 'Identifier') {
			value += "." + data['callee']['property']['name'];
		}
		
		value = value.substring(1);
		var args = data['arguments'];
		var a = "";
		for(var arg in args) {
			var s = args[arg];
			var val = getValueFromTree(s,vars,scope);
			if(val == '') {
				val = s['name'];
				evaluate = false;
			}
			a += "," + val;//getParamValueFromTree(s,vars,scope);
		}
		a = a.substring(1);
		
		value += "(" + a + ")";

	
		return {'value' : value, 'evaluate' : evaluate};
	}
	
	function evaluateCallExpression(value,vars,scope) {
		var valueArr = value.split(".");
		var ret = '';
		var evaluate = true;
	
		if(valueArr[1] != null) {
	
			var temp = getLiteralValueFromScope(valueArr[0],vars,scope);
			if(temp != '') {
				//if is string then process string functions
				if(temp.startsWith("'")) {
					for(var i=1; i<valueArr.length; i++) {
						if(evaluate == true) {
							var call = valueArr[i];
							call = call.split("(");
							var prop = call[0];
							if(isStringProperty(prop)) {
								//try evaluating string property
								try{
									var r = "'" + eval(temp + "." + valueArr[i]) + "'";
									
									if(r != null && r != undefined) {
										temp = r;
										ret = temp;	
									}
								} catch(ex) {
									console.log(ex);
									ret = temp  + "." + valueArr[i];
									evaluate = false;
								}
							} else {
								//if not a string property, just append it to evaluated value and stop evaluating
								ret = temp  + "." + valueArr[i];
								evaluate = false;
							}
							
						} else {
							//once evaluate is false, just start appending the values
							ret += "." + valueArr[i];
						}
					}
					return ret; 
				}
				else {
					return value;
				}
			} else {
				//if variable not found, do not evaluate it
				return value;
			}
					
		} else {
			//TODO: try to evaluate single function call here
			return value;
		}
	}

	function getValueFromTree(data, vars, scope) {
		var value = "";
		
		if(data['type'] == 'Literal') {
			value = data['raw'];
			if(value.startsWith("\"")){
				value = "'" + value.substring(1,value.length-1) + "'";
			}
		} 
		
		else if	(data['type'] == 'Identifier') {
			value = getValueFromScope(data['name'],vars,scope);
		} 
		
		else if(data['type'] == 'MemberExpression') {
			value = processMemberExpression(data,vars,scope);
		} 
		
		else if(data['type'] == 'CallExpression') {
			var temp = processCallExpression(data,vars,scope);
			var value = temp['value'];
			if(temp['evaluate']) {
				value = evaluateCallExpression(value,vars,scope);
			}
		} 
		
		else if(data['type'] == 'BinaryExpression') {
			var left = getValueFromTree(data['left'],vars,scope);
			var right = getValueFromTree(data['right'],vars,scope);
			var operator = data['operator'];
			
			if(left != '' && right != '') {
				try{
					value = eval(left + operator + right);
					value = "'" + value + "'";
				} catch (ex) {
					console.log(ex);
				}
				
			}
		}
		return value;
	}
	
	function getParamValueFromTree(data, vars, scope) {
		var value = "";
		
		if(data['type'] == 'Literal') {
			value = "'" + data['value'] + "'";
		} 
		
		else if	(data['type'] == 'Identifier') {
			value = data['name'];
		} 

		return value;
	}

	function updateValue(value, type, varName, vars, prevScope, curScope) {

		if(vars['debug'])
			console.log("updating value: " + varName + "=" + value + " " + prevScope + curScope);
		var checks = new Array();
		
		var limit = parseInt(curScope);
		for(var i=0;i<=limit;i++) {
			check = prevScope + i;
			checks.push(check);
		}
		
		checks = checks.reverse();
		for(i=0;i<=checks.length;i++) {
			var check = checks[i];
			if(vars['variables'][check] != null && vars['variables'][check]['varName'] == varName) {
				vars['variables'][check]['value'] = value;
				vars['variables'][check]['type'] = type;
				break;		
			}
		}
	}

	function parse(parseTree,funcName, vars, curScope, prevScope,cursor,scoped) {
		
		for (var body in parseTree) {
			var code = parseTree[body];
			
			if(code['range'][1] > cursor && scoped == 1) {
				vars['targetScope'] += "," + curScope;
				scoped = 0;
			}
			
			if(code['type'] == 'FunctionDeclaration') {
				var params = code['params'];
				var parami = 0;
				for(parami in params) {
					var variable = {
						"varName" : params[parami]['name'],
						"value" : ""
					}
					vars['variables'][prevScope + curScope + ',' + parami] = variable;
				}
				parami++;
				var s = 0;
				if(code['range'][1] > cursor)
					s = 1;
				vars = parse(code['body']['body'],code['id']['name'], vars, parami, prevScope + curScope + ',',cursor,s);
				curScope++;
			} else if(code['type'] == 'VariableDeclaration') {
				var declarations = code['declarations'];
				for (var declaration in declarations) {
			
					var value = "";
					var type = "";
					if(declarations[declaration]['init'] != null) {
						value = getValueFromTree(declarations[declaration]['init'],vars,prevScope + curScope);
						type = declarations[declaration]['init']['type'];
					}
					var variable = {
						"varName" : declarations[declaration]['id']['name'],
						"value" : value,
						"type" : type
					}
					vars['variables'][prevScope + curScope] = variable;
					curScope++;
				}
			} else if(code['type'] == 'ExpressionStatement') {
				var expression = code['expression'];
			
				if(expression['type'] == 'AssignmentExpression') {
					if(expression['left'] != null) {
						var varName = expression['left']['name'];
						var value = "";
						var type = "";
						if(expression['right'] != null) {
							value = getValueFromTree(expression['right'],vars,prevScope + curScope);
							if(value != '' && expression['right']['type'] == 'Identifier')
								type = 'Literal';
							else if(value != '' && value.startsWith("'"))
								type = 'Literal';
							else
								type = expression['right']['type'];
						}
						if(!inScope(varName, vars, prevScope, curScope) && !inGlobal(varName,funcName,vars)) {
							if(vars['globals'][funcName] == null)
								vars['globals'][funcName] = [];
							vars['globals'][funcName][varName] = value;
							var variable = {
							"varName" : varName,
							"value" : value,
							"type" : type
							}
							vars['variables'][prevScope + curScope] = variable;
							curScope++;
						} else if(inScope(varName, vars, prevScope, curScope)){
							updateValue(value,type,varName, vars, prevScope,curScope);
						}
						if(inGlobal(varName,funcName,vars)){
							vars['globals'][funcName][varName] = value;
						}
					}
				} else if (expression['type'] == 'SequenceExpression') {
				
				} else if(expression['type'] == 'CallExpression') {
				
				}
			}
		}
		
		if(scoped == 1)
			vars['targetScope'] += "," + curScope;
		
		if(funcName == 'function')
			vars['targetScope'] = vars['targetScope'].substring(1);
			
		return vars;
	}

	//BinaryExpression
	//CallExpression , NewExpression
	//MemberExpression

	//Literal
	//Identifier

	function getDompletions(code,cursor,incompleteCode) {
		
		var options = [];
		options.tolerant = true;
		options.range = true;
		
		var tree = esprima.parse(code,options);
		console.log(tree);
		
		var vars = [];
		vars['debug'] = 0;
		vars['variables'] = [];
		vars['globals'] = [];
		vars['targetScope'] = '';
		
		var funcName = 'function';
		var curScope = 1;
		var prevScope = '';
		var DOMFile = '';
		var DOMFile = "lib/ace/autocomplete/domplete/reduced.txt";		
		
		vars = parse(tree['body'],funcName, vars,curScope,prevScope,cursor,1);
		console.log(vars);
		var DOMStrings = dom.generateDOMStrings(vars);
				
		var suggestions = complete.getSuggestions(DOMStrings,incompleteCode[0],DOMFile);
		if(vars['debug'])
			console.log(suggestions);
		return suggestions;
	}
	
	exports.getDompletions = getDompletions;
	
	
});