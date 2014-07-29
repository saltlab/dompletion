define(function(require, exports, module) {
	"use strict";
	
	
	String.prototype.trim=function(){return this.replace(/^\s+|\s+$/g, '');};
	
	if (typeof String.prototype.startsWith != 'function') {
  		// see below for better implementation!
  		String.prototype.startsWith = function (str){
    		return this.indexOf(str) == 0;
  		};
	}
	
	Array.prototype.pop = function() {
    	var n = this.length >>> 0, value;
    	if (n) {
			value = this[--n];
			delete this[n];
    	}
    	this.length = n;
    	return value;
	};
	
	function checkXML(file) {
		var req = $.ajax({
  			type: "GET",
  			url: file,
			async: false,
  			success: function() { 
				return true;
			},
  			error: function(xhr, status, error) {
    			if(xhr.status==404) { 
					return false;
				}
			}
  		});
  		
		return req;
	}

    function readFile(DOMFile) {
    	
    	var xmlHttp = checkXML(DOMFile);
		return xmlHttp.responseText;
    
    }
    
    
	
	function getMathces(DOMString,partialDOM,trim) {
    	
//    	console.log(DOMString);
//    	console.log(partialDOM);
    	
    	trim = typeof trim !== 'undefined' ? trim : true;
    	
    	var matches = new Array();
    	var inputs = DOMString.split(" ");
    	
    	for(var i=0;i<partialDOM.length;i++) {
    		
    		var path = partialDOM[i];
    		var check = 1; 
    		
    		//first and last are empty spaces
    		for(var j=1; j<inputs.length; j++) {
    			
    			var term = inputs[j];
    			var indexDot = -1;
    			var indexHash = -1;
    			
    			var dot = "(\\.[^\\.# ]+)*(\\([^\\)]+\\))*(?=[ ])", hash="(#[^#\\. ]+)*(?=[ \\.])", tagName = "[^#\\. ]*(?=[ \\.#])";
    			
    			if(term.charAt(0) == '.') {
    				indexDot = 0;
    			} else if(term.charAt(0) == '#') {
    				indexHash = 0;
    			} else {
    				tagName = term.split("#")[0].split(".")[0];
    			}
    			if(term.indexOf("#") != -1) {
    				indexHash = term.indexOf("#");
    				hash = term.substring(indexHash).split(".")[0];
    			}
    			if(term.indexOf(".") != -1) {
    				indexDot = term.indexOf(".");
    				dot = term.substring(indexDot).split("#")[0];
    				dot = dot.replace(".",")(?=(\\.[^\\.# ]+)*\\.");
    				dot = dot + ")";
    				dot = dot.substring(1);
    			}
    			var regex = " " + tagName + hash + dot + "(\\.[^\\.# ]+)*(\\([^\\)]+\\))*(?=[ ])";
    			//regex = regex.replace(/\d+/,"\\d+");
    			var reg = new RegExp(regex,"");
    			var res = path.match(reg);
    			
    			if(res != null) {
    				path = path.substring(res.index);
    				if(trim)
    					path = path.replace(reg,"");
    			} else {
    				check = 0;
    				break;
    			}
    		}
    		if(check == 1) {
    			if(path != " ")
	    			matches.push(path);
    		}
    	}
//    	console.log(matches);
    	return matches;
    
    }
    
    function match(DOMString, partialDOM) {
		
		console.log(DOMString);
		console.log(partialDOM);
		
    	var matches = new Array();
    	
    	var inputs = DOMString.trim().split(" ");
    	var finder = new Array();
    	var add = new Array();
    	var find, t;
    	for(var i=0; i<inputs.length; i++) {
    		if(inputs[i].indexOf("(") > 0) {
    			add.push(inputs[i]);
			} else {
    			finder.push(inputs[i]);
    		}
    	}
    	var prefix = "";
    	if(finder.length > 0) {
    	for(var i=0;i<partialDOM.length;i++) {
    		find = finder.slice(0);
    		var path = partialDOM[i];
    		var check = 1; 
    		prefix = "";
    		//first and last are empty spaces
    		while(find.length > 0) {
    			
    			t = find.shift();
    			var term = t.replace(/\(added\)/g,"").replace(/\(expected\)/g,"");
    			//console.log(term);
    			var indexDot = -1;
    			var indexHash = -1;
    			
    			var dot = "(\\.[^\\.# ]+)*(\\([^\\)]+\\))*(?=[ ])", hash="(#[^#\\. ]+)*(?=[ \\.])", tagName = "[^#\\. ]*(?=[ \\.#])";
    			
    			if(term.charAt(0) == '.') {
    				indexDot = 0;
    			} else if(term.charAt(0) == '#') {
    				indexHash = 0;
    			} else {
    				tagName = term.split("#")[0].split(".")[0];
    			}
    			if(term.indexOf("#") != -1) {
    				indexHash = term.indexOf("#");
    				hash = term.substring(indexHash).split(".")[0];
    			}
    			if(term.indexOf(".") != -1) {
    				indexDot = term.indexOf(".");
    				dot = term.substring(indexDot).split("#")[0];
    				dot = dot.replace(".",")(?=(\\.[^\\.# ]+)*\\.");
    				dot = dot + ")";
    				dot = dot.substring(1);
    			}
    			var regex = " " + tagName + hash + dot + "(\\.[^\\.# ]+)*(\\([^\\)]+\\))*(?=[ ])";
    			//regex = regex.replace(/\d+/,"\\d+");
    			var reg = new RegExp(regex,"");
    			var res = path.match(reg);
//    			console.log(path);
//    			console.log(reg);
//    			console.log(res);
    			if(res != null) {
    				prefix += path.substring(0,res.index);
    		//		console.log(prefix);
    				
    				path = path.substring(res.index);
    		//		console.log(path);
    				
    				prefix += " " + path.substring(1).substring(0,path.substring(1).indexOf(" "));
    		//		console.log(prefix);
    				path = path.replace(reg,"");
    				
    		//		console.log(path);
    			} else {
    				check = 0;
    				console.log("breaking 1");
    				break;
    			}
    		}
    		//break if while succeeds element found
    		if(check == 1)
	    		break;
    	}
    	}
    	if(check == 1) {
    		return prefix + " " + add.join(" ") + " ";	
    	}
    	if(finder.length > 1) {
    		return match(finder.join(" ") + "(expected) " + add.join(" ") + " ", partialDOM);
    	} else {
    		return find[0] + "(expected) " + prefix + " " + add.join(" ") + " ";
    	}
   	
    }
    
    function getHierarchy(matches) {
    	console.log(matches);
    	var fn = [];
    	for(var i in matches) {
    		var split = matches[i].trim().split(" ");
    		for(i in split) {
	    		var temp = split[i].split("(");
	    		var append = "";
	    		if(temp.length > 1) {
	    			for(k=1; k<temp.length; k++)
	    				append += "(" + temp[k];
				}
	    		temp = temp[0];
	    		var temp2 = temp.split(".");
	    		var temp3 = temp2[0];
	    		//sorting classes alphabetically
	    		temp2.splice(0,1);
	    		temp2.sort();
	    		temp2.splice(0,0,temp3);
	    		var ins = temp2.join(".").replace("..",".") + append;
    			if(fn[i] == undefined)
	    			fn[i] = [];
	    		if(fn[i].indexOf(ins) < 0 && ins != "")
		    		fn[i].push(ins);
	    		
    		}
    	}
    	return fn;
    }
        
    
    function getTag(node) {
    	var tag = '';
    	tag = node.split(".")[0].split("#")[0];
    	return tag;
    }
    function getID(node) {
    	var id = '';
    	if(node.indexOf("#") != -1) {
    		var indexHash = node.indexOf("#");
    		id = node.substring(indexHash).split(".")[0];
    	}
    	return id;
    }
    function getClasses(node) {
    	var classes = new Array();
    	if(node.indexOf(".") != -1) {
    		var indexDot = node.indexOf(".");
    		var temp = node.substring(indexDot);
    		temp = temp.replace(/\./g," ");
    		temp = temp.substring(1);
    		classes = temp.split(" ");
    	}
    			
    	return classes;
    }
        
    function removeElement(pD, path, counter) {
    
    	console.log("removing " + path);
    	path = path.trim();
    	var inputs = path.split(" ");
    	console.log(inputs);
    	for(var i=0;i<pD.length;i++) {
    		
    		var path = pD[i];
    		var check = 1; 
    		var prefix = "";
    		for(var j=0; j<inputs.length; j++) {
    			
    			var term = inputs[j];
    			var indexDot = -1;
    			var indexHash = -1;
    			
    			var dot = "(\\.[^\\.# ]+)*(\\([^\\)]+\\))*(?=[ ])", hash="(#[^#\\. ]+)*(?=[ \\.])", tagName = "[^#\\. ]*(?=[ \\.#])";
    			
    			if(term.charAt(0) == '.') {
    				indexDot = 0;
    			} else if(term.charAt(0) == '#') {
    				indexHash = 0;
    			} else {
    				tagName = term.split("#")[0].split(".")[0];
    			}
    			if(term.indexOf("#") != -1) {
    				indexHash = term.indexOf("#");
    				hash = term.substring(indexHash).split(".")[0];
    			}
    			if(term.indexOf(".") != -1) {
    				indexDot = term.indexOf(".");
    				dot = term.substring(indexDot).split("#")[0];
    				dot = dot.replace(".",")(?=(\\.[^\\.# ]+)*\\.");
    				dot = dot + ")";
    				dot = dot.substring(1);
    			}
    			var regex = " " + tagName + hash + dot + "(\\.[^\\.# ]+)*(\\([^\\)]+\\))*(?=[ $])";
    			//regex = regex.replace(/\d+/,"\\d+");
    			var reg = new RegExp(regex,"");
    			var res = path.match(reg);
    			
    			if(res != null) {
    				prefix += path.substring(0,res.index);
    				path = path.substring(res.index);

    			} else {
    				check = 0;
    				break;
    			}
    		}
    		if(check == 1) {
    			prefix += " ";
    			path = path.substring(1).replace(/\s+/g,"(Removed_in_Path_" + counter + ") ");
    			pD[i] = prefix + path;		
    		}
    	}
    	return pD;
    }
    
    function getPartialDOM(evals,strings,i) {

//		var pDTemp = readFile(DOMFile);
//		pDTemp = pDTemp.split("\n");
		var pDTemp = strings;
		console.log(pDTemp);
  		
  		
  		var pD = new Array();
  		for(var j=0; j<pDTemp.length; j++) {
  			if(pDTemp[j].length != 0)
  				pD.push(pDTemp[j]);
  		}

  		var actions = evals[i]['actions'];
				
		for(var j=0; j<actions.length; j++) {
			var action = actions[j];
					
			if(action.startsWith('create')) {
				//console.log(match(" body " + action.substring(7),pD));
				pD.push(match(" body " + action.substring(7),pD).replace(/\(added\)/g,"(Added_in_Path_"+i+")").replace(/\(expected\)/g,"(Expected_in_Path_"+i+")"));
				//pD.push(" body " + action.substring(7).replace(/\(added\)/g,"(Added_in_Path_"+i+")"));
  			}
  					
  			if(action.startsWith('remove')) {
				pD = removeElement(pD,action.substring(7),i);
  			}
		}
		return pD;
    	
    	
    	
    }
    
	
	
	exports.getPartialDOM = getPartialDOM;
	exports.removeElement = removeElement;
	exports.match = match;
	exports.getMathces = getMathces;
});