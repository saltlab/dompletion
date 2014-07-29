define(function (require, exports, module) {
    "use strict";
    
    var AppInit         = brackets.getModule("utils/AppInit"),
        CodeHintManager = brackets.getModule("editor/CodeHintManager"),
        HTMLUtils       = brackets.getModule("language/HTMLUtils");
    
    var DOMAgent        = brackets.getModule("LiveDevelopment/Agents/DOMAgent"),
        Inspector       = brackets.getModule("LiveDevelopment/Inspector/Inspector"),
        LiveDevelopment = brackets.getModule("LiveDevelopment/LiveDevelopment"),
        RemoteAgent     = brackets.getModule("LiveDevelopment/Agents/RemoteAgent");
  
    //    CacheManager    = require("CacheManager");
  
    console.log(LiveDevelopment);
    //console.log(LiveDevelopment._getInitialDocFromCurrent());
    
    var _supports            = JSON.parse(require("text!support.json")).htmlAttrs;
    
    /**
     * @constructor
     */
    function ClassHints() {
        this.editor = null;
    }
    
    /**
     * @param {Editor} editor
     * @param {string} implicitChar
     * @return {boolean}
     */
    
    if (typeof String.prototype.startswith != 'function') {
  		// see below for better implementation!
  			String.prototype.startswith = function (str){
    		return this.toLowerCase().indexOf(str.toLowerCase()) == 0;
  		};
	}
    function getTargetLine(editor,pos) {
    	var textBefore = editor.document.getLine(pos.line).substr(0,pos.ch);
    	return textBefore;
    }
    function extractDOMCall(line) {
    	
    	var DOMAccessRegex = new RegExp("([a-zA-Z_0-9\$\-]+(\.getElementById\\(.*\\)|\.getElementsByTagName\\(.*\\)|\.getElementsByClassName\\(.*\\))*(\.getElementById\\(['\"]|\.getElementsByTagName\\(['\"]|\.getElementsByClassName\\(['\"]))[^'\"]*","g");
    	return line.match(DOMAccessRegex);
    }
    
    function removeLine(code, lineNumber) {
    
    	var arr = code.split("\n");
    	console.log(arr);
    	console.log(lineNumber-1);	
    	arr.splice(lineNumber-1,1);
    	console.log(arr);
    	return arr.join("\n");
    }
    
    ClassHints.prototype.hasHints = function (editor) {
        
        this.editor = editor;
        
        console.log(editor);
        
        var targetLine = getTargetLine(editor,editor.getCursorPos());
        console.log(targetLine);
        
        var incompleteCode = extractDOMCall(targetLine);
		
		if(strings.length == 0) {
			console.log("need crawling info");
			return false;
		}
		if( incompleteCode != null ) {
			console.log("i have hints");
        	return true;
        }	
        		
        console.log("i do not have hints");
        return false;
    };
    
    /**
     * @param {string} implicitChar
     * @return {Object.<string, Object>}
     */
    ClassHints.prototype.getHints = function () {
        var editor = this.editor;
        var targetLine = getTargetLine(editor,editor.getCursorPos());
        console.log(targetLine);
        var incompleteCode = extractDOMCall(targetLine);
        console.log(incompleteCode);
        var breakPoint = incompleteCode[0].lastIndexOf("'");
        
        if(breakPoint <= 0)
        	breakPoint = incompleteCode[0].lastIndexOf("\"");
        
        var match = incompleteCode[0].substring(breakPoint+1);
        
        console.log(match);
        this.match = match;
        
        var cursor = editor.getCursorPos();
        var code = editor.document.getText();
		console.log(code);
		code = removeLine(code, cursor.line+1);
		console.log(code);
		
		var words = {};
		
			var domplete = require("./domplete");
			var tries = 10;
			while(tries > 0 ) {
//				try {
					words = domplete.getEvaluations(code,cursor,incompleteCode,strings);
					break;
//				} catch (err) {
//					console.log(err);
//					if(err.lineNumber) {
//						code = removeLine(code, err.lineNumber);
//					} else {
//						throw err;
//					}
//				}
				tries--;
			}	
			
		var result = [];
		for(var key in words.wordScores) {
			if (key === "" || key === 'length' || !words.wordScores.hasOwnProperty(key)) continue;
				var tag = words.wordTags[key+words.wordScores[key]];
				var level = 1000 - words.wordScores[key];
				var path = key.split("|")[0];
				var suggestion = key.split("|")[1];
				if(suggestion.substr(0,3) != "###" && suggestion.startswith(match))
					result.push(suggestion + "<span style='text-align:right; float:right; color:#666666; width:300px; display:block;float:right'><b style='color:#666666'>Tag</b>: "+tag+" | <b style='color:#666666'>DOM Level</b>: "+level+" | <b style='color:#666666'>JS Path</b>: "+path+" </span>"); 
		}
		console.log(result);
        return {
            hints: result,
            match: "",
            selectInitial: true,
            handleWideResults: false
        };
		
        
    };
    
    
    
    
    /**
     * @param {string} completion
     */
    ClassHints.prototype.insertHint = function (completion) {
        var insert = completion.split("<span")[0].split("(")[0];
        var start = {line: -1, ch: -1},
            end = {line: -1, ch: -1},
            cursor = this.editor.getCursorPos(),
            charCount = 0;

        end.line = start.line = cursor.line;
        start.ch = cursor.ch - this.match.length;
        end.ch = cursor.ch;

        if (start.ch !== end.ch) {
            this.editor.document.replaceRange(insert, start, end);
        } else {
            this.editor.document.replaceRange(insert, start);
        }
        
        return false;
    };

    
    
    /*---------------------------Crawler UI Starts---------------------------*/
    var recorder = 0;
    var interval;
    var strings = [];
    
    function addButtons() {
        var colors              = ["#cccccc", "#e6861c"];
        console.log($("#main-toolbar").html());
        // Insert the reload button in the toolbar to the left of the first a element (life preview button)
        var manualRecordButton = $("<a>")
            .text("♂")
            .attr("id","manual-record")
            .attr("title", "Reload page in browser")
            .click(manualRecord)
            .css({
                "margin-right":     "10px",
                "font-weight":      "bold",
                "color":            colors[0]
            })
            .hover(function () {
                $(this).css({ "color": colors[1], "text-decoration": "none" });
            }, function () {
                $(this).css({ "color": colors[0] });
            });
            $("#main-toolbar .buttons").append(manualRecordButton); 
            
        var autoRecordButton = $("<a>")
            .text("♀")
            .attr("id","auto-record")
            .attr("title", "Reload page in browser")
            .click(autoRecord)
            .css({
                "margin-right":     "10px",
                "font-weight":      "bold",
                "color":            colors[0]
            })
            .hover(function () {
                $(this).css({ "color": colors[1], "text-decoration": "none" });
            }, function () {
                $(this).css({ "color": colors[0] });
            });
            $("#main-toolbar .buttons").append(autoRecordButton);
            
        var stopRecordButton = $("<a>")
            .text("◙")
            .attr("id","stop-record")
            .attr("title", "Reload page in browser")
            .click(stopRecord)
            .css({
                "margin-right":     "10px",
                "font-weight":      "bold",
                "color":            colors[0],
                "display":			"none"
            })
            .hover(function () {
                $(this).css({ "color": colors[1], "text-decoration": "none" });
            }, function () {
                $(this).css({ "color": colors[0] });
            });
            $("#main-toolbar .buttons").append(stopRecordButton);
            
        var clearRecordButton = $("<a>")
            .text("◘")
            .attr("id","clear-record")
            .attr("title", "Reload page in browser")
            .click(clearRecord)
            .css({
                "margin-right":     "10px",
                "font-weight":      "bold",
                "color":            colors[0],
                "display":			"none"
            })
            .hover(function () {
                $(this).css({ "color": colors[1], "text-decoration": "none" });
            }, function () {
                $(this).css({ "color": colors[0] });
            });
            $("#main-toolbar .buttons").append(clearRecordButton);
//          
    }
    
    function checkLiveDevelopment() {
    	if(LiveDevelopment.status != 3) {
    		alert("Please start live development first to record");
    		return 0;
    	}
    	return 1;
    }
    function manualRecord() {
    	if(checkLiveDevelopment()) {
    		if(recorder == 0) {
    			$("#manual-record").hide();
    			$("#auto-record").hide();
    			$("#stop-record").show();
    			$("#clear-record").hide();
    			recorder = 1; //manual 
    			interval = setInterval(manual,1000);
    		}
    	}
    }
    
    function autoRecord() {
    	if(checkLiveDevelopment()) {
    		if(recorder == 0) {
    			$("#manual-record").hide();
    			$("#auto-record").hide();
    			$("#stop-record").show();
    			$("#clear-record").hide();
    			recorder = 2; //auto 
    			interval = setInterval(auto,1000);
    		}	
    	}
    }
    function stopRecord() {
    	if(recorder != 0) {
    		$("#manual-record").show();
    		$("#auto-record").show();
    		$("#clear-record").show();
    		$("#stop-record").hide();
    		recorder = 0; //stopped 
	    	clearInterval(interval);
    	}
    }
    
    function clearRecord() {
    	strings = [];
    	$("#clear-record").hide();
    }
    
    function append(response) {
        var remoteDOM = response.result.value;
        var wasThrown = response.wasThrown;
            
        if (wasThrown) {
            console.error("INTERNAL ERROR: ", remoteObj);
            stopRecord();
        } else {
        	var html = create(remoteDOM);
    		parse(html, " ");
    		console.log(strings);
        }
    }
    
    function manual(){
    	var evalStr = "document.getElementsByTagName('body')[0].innerHTML;";
    	if(checkLiveDevelopment()) {
	        Inspector.Runtime.evaluate(evalStr, append);
    	} else {
    		stopRecord();
    	}
    }
    
    function auto() {
    }
    
    function create(htmlStr) {
    	var frag = document.createDocumentFragment(),
        temp = document.createElement('div');
    	temp.innerHTML = htmlStr;
    	while (temp.firstChild) {
        	frag.appendChild(temp.firstChild);
    	}
    	return frag;
	}

    
    function parse(html,string) {
    	
    	var id = html.id;
    	if(id == undefined)
    		id = "";
    	if(id != "")
    		id = "#" + id;
    	var css = html.className;
    	if(css == undefined)
    		css = "";
    	if(css != "") 
    		css = "." + css.split(" ").join(".");
   		var tag = html.tagName;
   		if(tag == undefined)
   			tag = "body";
   			
   		string += tag + id + css + " ";
   			
    	var childNodes = html.childNodes;
    	if(childNodes.length > 1) {
    		for(var i in childNodes) {
    			if(childNodes[i].nodeType == 1) {
    				parse(childNodes[i],string);
    			}
    		}
    	} else {
    		if(strings.indexOf(string) == -1)
    			strings.push(string);
    	}
    }
    /*---------------------------Crawler UI Ends---------------------------*/
    
    
    // Register code hinter
    AppInit.appReady(function () {
        var classHints = new ClassHints();
        addButtons();
        CodeHintManager.registerHintProvider(classHints, ["javascript"], 5);
    });
});