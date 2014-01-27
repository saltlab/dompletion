define(function(require, exports, module) {
	//"use strict";
	
	Array.prototype.compare = function (array) {
        // if the other array is a falsy value, return
        if (!array)
            return false;

        // compare lengths - can save a lot of time
        if (this.length != array.length)
            return false;

        for (var i = 0, l=this.length; i < l; i++) {
            // Check if we have nested arrays
            if (this[i] instanceof Array && array[i] instanceof Array) {
                // recurse into the nested arrays
                if (!this[i].compare(array[i]))
                    return false;
            }
            else if (this[i] != array[i]) {
                // Warning - two different object instances will never be equal: {x:20} != {x:20}
                return false;
            }
        }
        return true;
    }
    
    if (typeof String.prototype.startsWith != 'function') {
        // see below for better implementation!
        String.prototype.startsWith = function (str){
            return this.indexOf(str) == 0;
        };
    }
    
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
    
	//courtesy: http://stackoverflow.com/questions/543533/restricting-eval-to-a-narrow-scope
	function maskedEval(scr) {
	    
	    var mask = {};
        
        
        for (p in this) 
            mask[p] = undefined;
        
        var jsCode = readFile("lib/ace/autocomplete/domplete/document.js");
        
        //var start = 'try { function addInnerHTML(element,innerHTML) { if(element.documentElement) { element.documentElement.innerHTML += innerHTML; } else { element.innerHTML += innerHTML; }}function createProxy(document,csspath) { if(document.getElementById != undefined) { document._oldGetElementById = document.getElementById; document.getElementById = function(id) { var result = document._oldGetElementById(id); if (!result) { addInnerHTML(document,"<div id=\'" + id + "\'></div>"); result = document._oldGetElementById(id); result = createProxy(result,document.csspath + "#" + id); } return result; }; } document.csspath = csspath; return document;}var doc = document.implementation.createDocument ("http://www.w3.org/1999/xhtml", "html", null);doc.documentElement.innerHTML = "<body><span>Hello</span></body>";doc = createProxy(doc,"");function domplete(document) { ';
        
        var start = 'function domplete(document) { ';
        
        //var end = 'return out;}return domplete(doc);} catch(err) {return "";}' ;
        var end = 'return out;}return domplete(doc);' ;
        
        var out = (new Function("with(document) { " + jsCode + start + scr + end + "}")).call(mask);
    
        return out;
    }
    
    var func = function(string) {
        return (new Function( 'return (' + string + ')' )());
    }


	function process(functions,prefix) {
	    var temp = functions.slice(0);
	    var func = temp.shift()['code'];
	    var ret = new Array();
	    
	    for(var i = 0; i < func.length; i++) {
	        if(temp.length > 0) {
	         
	            ret = ret.concat(process(temp, prefix + func[i]['code']));
	        } else {
	         
	            ret = ret.concat(prefix + func[i]['code']);
	        }
	    }
	    return ret;
	    
	}
	
	function getDOMNodes(out) {
	    
	    var ret = [];
	    var unique = new Array();
	    
	    for(var i=0; i<out.length;i++) {
	        
	        var vars = new Array();
	        var sequence = new Array();
	        var actions = new Array();
	    
	    
	        var temp = out[i].split(", ");
	        
	        for(var j=0; j<temp.length;j++) {
	            var current = temp[j];
	            
	            if(current.startsWith('global') || current.startsWith('local')) {
	                var xpath = current.split("|");
	                if(xpath.length == 2) {
	                    var variable = xpath[0].split(" ")[1];
	                    var path = xpath[1];
	                    vars.push(variable + ">" + path); 
	                }
	            }
	            
	            if(current.startsWith('remove') || current.startsWith('create') || current.startsWith('move')) {
	                actions.push(current);   
	            }
	            
	            if(current.startsWith('exit') || current.startsWith('path')) {
	                sequence.push(current.substring(5));
	            }
	            
	        }
	        
	        var check = sequence.join(" ");
	        
	        if(unique.indexOf(check) < 0) {
    	        unique.push(check);
	            
	            var insert = {
	                "vars" : vars,
	                "sequence" : sequence,
	                "actions" : actions
	            }
	            
	            ret.push(insert); 
	            
	        } 
	    }
	    return ret;
	}
	function evaluate(functions) {
	    
	    var ret = process(functions,"");
	    var out = new Array();
	    
	    for(var i = 0; i < ret.length; i++) {
	        var code = ret[i];
	        var temp = maskedEval(code);
	        if(temp != '' && out.indexOf(temp) < 0)
	            out.push(temp);
	    }
	    
	    return getDOMNodes(out);
	
	}
	    
	exports.evaluate = evaluate;
});