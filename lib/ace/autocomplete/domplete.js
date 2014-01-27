define(function(require, exports, module) {
	//"use strict";
	
	var constants = require('./domplete/constants');
	var esprima = require('./domplete/esprima');
	var dom = require('./domplete/dom');
	var complete = require('./domplete/complete');
	var evaluate = require('./domplete/evaluate');
	
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


	

	//BinaryExpression
	//CallExpression , NewExpression
	//MemberExpression

	//Literal
	//Identifier
	
	function containsIf(tree) {
		
		for(var i in tree) { 
			if(tree[i]['type'] == 'IfStatement')
			return true;
		}
		return false;
	}
	
	function instrumentFunctionCode(code,param,func) {
		
		var options = [];
		options.tolerant = true;
		options.range = true;
		options.loc = true;
		
		if(func)
			var tree = esprima.parse(code,options)['body'][0]['body']['body'];
		else
			var tree = esprima.parse(code,options)['body'];
		
		var globals = Array();
		var locals = new Array();
		for(var i in param) {
			locals.push(param[i]);
		}
		var length = 0;
		
		for(var i in tree) {
			if(tree[i]['type'] == "ExpressionStatement" && tree[i]['expression']['left'] != undefined) {
		
				if(locals.indexOf(tree[i]['expression']['left']['name']) < 0) {
					globals.push(tree[i]['expression']['left']['name']);
					locals.push(tree[i]['expression']['left']['name']);
					var ins = "dompleteLog('global "+ tree[i]['expression']['left']['name'] +"', " + tree[i]['expression']['left']['name'] +");";
					code = code.substring(0,tree[i]['expression']['range'][1]+length+1) + ins + code.substring(tree[i]['expression']['range'][1]+length+1);
					length += ins.length;
				}
			} else if(tree[i]['type'] == "VariableDeclaration") {
				
				var declarations = tree[i]['declarations']; 
				
				for(var j = 0; j < declarations.length;j++) {
					
					if(locals.indexOf(declarations[j]['id']['name']) < 0) {
						locals.push(declarations[j]['id']['name']);
						if(!func) {
							var ins = "dompleteLog('local "+ declarations[j]['id']['name'] +"', " + declarations[j]['id']['name'] +");";
							code = code.substring(0,tree[i]['range'][1]+length+1) + ins + code.substring(tree[i]['range'][1]+length+1);
							length += ins.length;
						}
					}
				}
			}
		}
		
		return code;
	}
	
	function removeIf(candidateFunction,tree,funcName,param) {
		var code = candidateFunction['code'];
		for(var i in tree) { 
			if(tree[i]['type'] == 'IfStatement') {
				
				var ret = new Array();
				
				var start = code.substring(0,tree[i]['range'][0]);
				var end = code.substring(tree[i]['range'][1],code.length);
				
				var consequent = code.substring(tree[i]['consequent']['range'][0]+1, tree[i]['consequent']['range'][1]-1);
				if(funcName == "function") {
					consequent = 'dompleteLog("path T","");' + consequent;
				}
				//var calert = "\n console.log('exit "+funcName+" "+candidateFunction['path']+"T'); \n }";
				var cfT = {
					"code" : start + consequent + end,
					"path" : candidateFunction['path'] + 'T' 
				}
				ret.push(cfT);
				
				var alternate = "";
				if(tree[i]['alternate'] != null)
					alternate = code.substring(tree[i]['alternate']['range'][0]+1, tree[i]['alternate']['range'][1]-1);
				
				if(funcName == "function") {
					alternate = 'dompleteLog("path F","");' + alternate;
				}
				
				//var aalert = "\n console.log('exit "+funcName+" "+candidateFunction['path']+"F'); \n }";
				
				var cfF = {
					"code" : start + alternate + end,
					"path" : candidateFunction['path'] + 'F'
				}
				ret.push(cfF);
				
				return ret;
				
			}
		}
	}
	
	function replaceIfs(codeSubStr,funcName,param,func) {
		var arr = new Array();
		var candidateFunction = {
			"code" : codeSubStr,
			"path" : ""
		}
		arr.push(candidateFunction);
		
		var i = 0;
		while(i < arr.length) {
		
			var options = [];
			options.tolerant = true;
			options.range = true;
			options.loc = true;
			
			if(func)
				var tree = esprima.parse(arr[i]['code'],options)['body'][0]['body']['body'];
			else
				var tree = esprima.parse(arr[i]['code'],options)['body'];
			
			if(containsIf(tree)) {
				
				var substitue = removeIf(arr[i],tree,funcName,param);
				
				arr.splice(i,1);
				arr.push(substitue[0]);
				arr.push(substitue[1]);
			} else {
				i++;
			}
		
		}
		for(var i = 0; i < arr.length; i++) {
			var cF = arr[i];
			if(func)
				cF['code'] = instrumentFunctionCode(cF['code'].substring(0,cF['code'].length-1) + "\n dompleteLog('exit "+funcName+" "+cF['path']+"',''); \n }",param,true);
			else
				cF['code'] = instrumentFunctionCode(cF['code'].substring(0,cF['code'].length-1) + "\n ",param,false);
			arr[i] = cF;
		}
		
		return arr;
	}
	
	function pass1(parseTree,codeStr) {
		var functions = [];
		var i = 0;
		for(var body in parseTree) {
			var code = parseTree[body];
			
			if(code['type'] == "FunctionDeclaration") {
				
				var params = code['params'];
				var param = new Array();
				for(var parami in params) {
					param.push(params[parami]['name']);					
				}
				var codeSubStr = codeStr.substring(code['range'][0],code['range'][1]);
				
				
				var funcName = code['id']['name'];
				
				var detail = {
					"funcName" : funcName,
					"params" : param,
					"code" : replaceIfs(codeSubStr,funcName,param,true)
				}
				functions[i] = detail;
				i++;
			}
		}
		return functions;
	}
	
	
	function pass2(parseTree, codeStr, cursor) {
		var ret = 0;
		var reduced = 0;
		for(var body in parseTree) {
			var code = parseTree[body];
			
			if(code['type'] == "FunctionDeclaration") {
				var min = code['range'][0] - reduced;
				var max = code['range'][1] - reduced;
				var len = max - min;
				
				if(cursor > max) {
					codeStr = codeStr.substring(0,min) + codeStr.substring(max);					
					cursor = cursor - len;
					reduced += len;	
				} else {
					codeStr = codeStr.substring(0,min) + codeStr.substring(code['body']['range'][0]-reduced+1, cursor);
					break;
				}
			}
			
		}
		var param = new Array();
		var ret = {
			"funcName" : "function",
			"params" : param,
			"code" : replaceIfs(codeStr,"function",param,false)
		}
		return ret;
	}
	
	function getInitialVal(domObject, vars) {
		
		for(var i=0; i<vars.length; i++) {
			var a = vars[i].split(">");
			if(a[0] == domObject)
				return " " + a[1];
		}
		
		return ' body';
	}
	
	function getDompletions(code,cursor,incompleteCode) {
		
		var options = [];
		options.tolerant = true;
		options.range = true;
		options.loc = true;
		
		var tree = esprima.parse(code,options);
		
		var functions = pass1(tree['body'],code);
		
		functions.push(pass2(tree['body'],code,cursor));
		
		window.evals = evaluate.evaluate(functions);
		console.log(evals);
		window.incompleteCode = incompleteCode[0];
		
		document.getElementById("domSelector").style.visibility = "visible";
		
		var DOMFile = "lib/ace/autocomplete/domplete/reduced.txt";		
		
		var wordScores = [];
		var wordTags = [];
		initialVals = [];
		
		for(var i=0; i<evals.length; i++) {
			var DOMStrings = dom.getPartialDOM(evals,DOMFile,i);
			console.log(DOMStrings);	
			var DOMString = getInitialVal(incompleteCode[0].split(".")[0],evals[i]['vars']);
			console.log(DOMString);
			initialVals[i] = DOMString;
			var temp = complete.getSuggestions(DOMStrings,DOMString,incompleteCode[0]);
		
			console.log(temp[0]);
			
			for(var key in temp[0]) {
				if (key === "" || key === 'length' || !temp[0].hasOwnProperty(key)) continue;
				wordScores[i+"|"+key] = temp[0][key]; 
			}
			
			for(var key in temp[1]) {
				if (key === "" || key === 'length' || !temp[1].hasOwnProperty(key)) continue;
				wordTags[i+"|"+key] = temp[1][key]; 
			}
			
			console.log(wordScores);
			console.log(wordTags);
		
		}
		
		var suggestions = {wordScores : wordScores, wordTags : wordTags};
		
		console.log(suggestions);
		return suggestions;
	}	
	
	exports.getDompletions = getDompletions;
	
	
});