define(function(require, exports, module) {
	"use strict";
	
	var notFound = '###';
	var dom = require('./dom');
	
	
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
    
    function getDOMNodes(DOMStrings,node,DOMAccess) {
    	
    	for(var variable in DOMStrings) {
    		var temp = DOMStrings[variable];
    		var DOMString = process(temp,'document',DOMAccess);
    		DOMAccess[variable] = DOMString;
    	
    	}
    	console.log(DOMAccess);
    	return DOMAccess;
    }
    
    function process(calls,DOMString) {
    	
    	if(calls.length != 0) {
	   		calls = calls.split("|||");
    		for (var j=0; j<calls.length;j++) {
    			var call = calls[j];
    			console.log(call);
    			call = call.replace("getElementsByTagName('","");
    			call = call.replace("getElementById('","#");
    			call = call.replace("getElementsByClassName('",".");
    			call = call.replace("getElementsByTagName(\"","");
    			call = call.replace("getElementById(\"","#");
    			call = call.replace("getElementsByClassName(\"",".");
    			call = call.replace("querySelector('","");
    			call = call.replace("querySelectorAll('","");
    			call = call.replace("querySelector(\"","");
    			call = call.replace("querySelectorAll(\"","");
    			call = call.replace(/\[\d*\]/g,"");
    			call = call.substring(0,call.length-2);
    			console.log(call);
	    		DOMString += " " + call;	
    		}
    	}
    	return DOMString;
    		
    }
    
	function filterNodes(matches,call) {
		if(call.indexOf('Selector') == -1){
			console.log("1");
			var target = "^[^#\\. ]+";
			var removeFirstChar = 0;
		
			if(call.indexOf("Id") != -1) {
				target = "#[^#\\. ]+";
				removeFirstChar = 1;
			}
			else if (call.indexOf("Class") != -1) {
				target = "(\\.[^\\.# ]+)+";
				removeFirstChar = 0;
			}
		
			var reg = new RegExp(target,"g");
		
			for(var i=0; i<matches.length; i++) {
				var nodes = matches[i].trim().split(" ");
				for(var j=0; j<nodes.length; j++) {
					var temp = "";
					if(nodes[j].indexOf("(") > 0) {
						temp = nodes[j].substring(nodes[j].indexOf("("));		
						nodes[j] = nodes[j].substring(0,nodes[j].indexOf("("));
					}
					var m = nodes[j].match(reg);
					if(m == null)
						m = notFound;
					else {
						m = m.join("");
						if(removeFirstChar)
							m = m.substring(1);
					}
					if(call == "Tag")
						nodes[j] = m;		
					else
						nodes[j] = m + temp;		
				}
				matches[i] = nodes.join(" ");
			} 
		} else {
			console.log("2");
			for(var i=0; i<matches.length; i++) {
				matches[i] = matches[i].replace(/[.]/g,'|.');
				matches[i] = matches[i].replace(/[#]/g,'|#');
			}
		}
		console.log(matches);
		return matches;
	}
	
	function getSuggestions(DOMStrings, DOMString, incompleteCode) {
				
		var temp = incompleteCode.substring(incompleteCode.indexOf('.')+1);
		
		var arrCalls = temp.split(").").join(")|||").split("|||");
		
		var calls = "";
			
		for(var i=0;i<arrCalls.length-1;i++) {
			calls += "|||" + arrCalls[i];
		}
		if(calls.length > 1)
			calls = calls.substring(3);
		
		
		DOMString = process(calls,DOMString);
		console.log(DOMString);
		
		var matches = dom.getMathces(DOMString,DOMStrings);
//		console.log(matches);
		
		var call = arrCalls[arrCalls.length-1];
		var matchedTags = filterNodes(matches.slice(),"Tag");	
		matches = filterNodes(matches,call);	
						
		var wordScores = new Array();
		var wordTags = new Array();
		for(var i=0; i<matches.length; i++) {
			var nodes = matches[i].split(" ");
			var tags = matchedTags[i].split(" ");
				
			for(var j=0; j<nodes.length; j++) {
				if(nodes[j] != notFound) {
						
					var list;
					if(nodes[j].indexOf("|") != -1)
						list = nodes[j].split('|');
					else if(nodes[j].indexOf(".") == 0)
						list = nodes[j].substring(1).split('.');
					else
						list = nodes[j].split('.');
//					console.log(list);
					var score = 999-j;
						
					for(var k=0; k<list.length; k++) {
						var word = list[k];
							
						if (wordScores[word]) {
							if(wordScores[word] < score) {
    					    	wordScores[word] = score;
    					    	wordTags[word+score] = tags[j];
      					    }
           				} else {
               				wordScores[word] = score;
               				wordTags[word+score] = tags[j];
           				}

           			}
				}
			}
		
		}	
		var ret = new Array();
		ret[0] = wordScores;
		ret[1] = wordTags;		
		return ret;
	}
		
	exports.getSuggestions = getSuggestions;
});