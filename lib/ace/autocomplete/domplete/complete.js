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
	   		calls = calls.split(".");
    		for (var j=0; j<calls.length;j++) {
    			var call = calls[j];
    			call = call.replace("getElementsByTagName('","");
    			call = call.replace("getElementById('","#");
    			call = call.replace("getElementsByClassName('",".");
    			call = call.replace("getElementsByTagName(\"","");
    			call = call.replace("getElementById(\"","#");
    			call = call.replace("getElementsByClassName(\"",".");
    			call = call.substring(0,call.length-2);
	    		DOMString += " " + call;	
    		}
    	}
    	return DOMString;
    		
    }
    
	function filterNodes(matches,call) {
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
		return matches;
	}
	
	function getSuggestions(DOMStrings, DOMString, incompleteCode) {
				
		var arrCalls = incompleteCode.split(".");
		
		var calls = "";
			
		for(var i=1;i<arrCalls.length-1;i++) {
			calls += "." + arrCalls[i];
		}
		if(calls.length > 1)
			calls = calls.substring(1);
		
		
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
						
					if(nodes[j].indexOf(".") == 0)
						var list = nodes[j].substring(1).split(".");
					else
						var list = nodes[j].split(".");
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