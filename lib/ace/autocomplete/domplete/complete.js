define(function(require, exports, module) {
	"use strict";
	
	var notFound = '###';
	
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
    
    function process(calls,node,DOMAccess) {
    
    	if(DOMAccess[node] == null)
    		node = 'document';
    		
    	var calls =  calls.substring(node.length+1);
	   	var DOMString = " ";
   	 	
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
	    		DOMString += call + " ";	
    		}
    		DOMString = DOMString.substring(0,DOMString.length-1);
    	} else {
    		DOMString = "";
    	}
    	DOMString = DOMAccess[node] + DOMString;
    	return DOMString;		
    }
    
	function getMathces(DOMString,partialDOM) {
    
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
    			
    			var dot = "(\\.[^\\.# ]+)*(?=[ ])", hash="(#[^#\\. ]+)*(?=[ \\.])", tagName = "[^#\\. ]*(?=[ \\.#])";
    			
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
    			var regex = " " + tagName + hash + dot + "(\\.[^\\.# ]+)*(?=[ ])";
    			regex = regex.replace(/\d+/,"\\d+");
    			var reg = new RegExp(regex,"");
    			var res = path.match(reg);
    			
    			if(res != null) {
    				path = path.substring(res.index);
    				path = path.replace(reg,"");
    			} else {
    				check = 0;
    				break;
    			}
    		}
    		if(check == 1)
    			matches.push(path);
    	}
    	return matches;
    
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
				var m = nodes[j].match(reg);
				if(m == null)
					m = notFound;
				else {
					m = m.join("");
					if(removeFirstChar)
						m = m.substring(1);
				}
				nodes[j] = m;		
			}
			matches[i] = nodes.join(" ");
		} 
		return matches;
	}
    function getSuggestions(DOMStrings,incompleteCode,DOMFile){
		
		var partialDOM = readFile(DOMFile);
		partialDOM = partialDOM.split("\n");
        
        
		var DOMAccess = new Array();
        DOMAccess['document'] = " body";
        DOMAccess = getDOMNodes(DOMStrings,"document",DOMAccess);
        
		
		var arrCalls = incompleteCode.split(".");
		var node = arrCalls[0];
		var calls = "";
			
		for(var i=1;i<arrCalls.length-1;i++) {
			calls += arrCalls[i] + ".";
		}
		calls = calls.substring(0,calls.length-1);
		calls = node + "." + calls;
		
		var DOMString = process(calls,node,DOMAccess);
		
		var matches = getMathces(DOMString,partialDOM);
		var call = arrCalls[arrCalls.length-1];
		var matchedTags = filterNodes(matches.slice(),"Tag");	
		matches = filterNodes(matches,call);	
		console.log(matches);
		console.log(matchedTags);
		
		
		
		var wordScores = new Array();
		var wordTags = new Array();
		for(var i=0; i<matches.length; i++) {
			var nodes = matches[i].split(" ");
			var tags = matchedTags[i].split(" ");
				
			for(var j=0; j<nodes.length; j++) {
				if(nodes[j] != notFound) {
						
					var list = nodes[j].split(".");
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
		return {wordScores : wordScores, wordTags : wordTags};
	}
		
	exports.getSuggestions = getSuggestions;
});