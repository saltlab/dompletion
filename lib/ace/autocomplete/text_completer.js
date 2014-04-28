/* ***** BEGIN LICENSE BLOCK *****
 * Distributed under the BSD license:
 *
 * Copyright (c) 2012, Ajax.org B.V.
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of Ajax.org B.V. nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL AJAX.ORG B.V. BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * ***** END LICENSE BLOCK ***** */

define(function(require, exports, module) {
    var Range = require("ace/range").Range;
    
    var splitRegex = /[^a-zA-Z_0-9\$\-]+/;

	if (typeof String.prototype.startsWith != 'function') {
  		// see below for better implementation!
  		String.prototype.startsWith = function (str){
    		return this.indexOf(str) == 0;
  		};
	}
	
    function getWordIndex(doc, pos) {
        var textBefore = doc.getTextRange(Range.fromPoints({row: 0, column:0}, pos));
        return textBefore.split(splitRegex).length - 1;
    }
    
    
    //kbajaj: functions to process code
 	function getCursorPosition(doc,pos) {
    
    	var textBefore = doc.getTextRange(Range.fromPoints({row: 0, column:0}, pos));
    	return textBefore.length;
    }
    
    function getTargetLine(doc,pos) {
    
    	var textBefore = doc.getTextRange(Range.fromPoints({row: pos.row, column:0}, pos));
    	return textBefore;
    }
    function extractDOMCall(line) {
    	
    	var DOMAccessRegex = new RegExp("([a-zA-Z_0-9\$\-]+(\.getElementById\\(.*\\)|\.getElementsByTagName\\(.*\\)|\.getElementsByClassName\\(.*\\))*(\.getElementById\\(['\"]|\.getElementsByTagName\\(['\"]|\.getElementsByClassName\\(['\"]))|(dg\\(['\"])[a-zA-Z_0-9_\-]*$","g");
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
    
    	
    function getRank(scores, min, target,len) {
    
    	var chars = target.substring(0,len);
    	
    	var temp = new Array();
    	var rank = 0;
    	for (var word in scores) {
        	if (word === "" || word === 'length' || !scores.hasOwnProperty(word)) continue;
			var temp = word.substring(word.indexOf("|")+1);
		
			if(temp.startsWith(chars) && scores[word] > min) {
				rank++;
		
			}	
		}
    	for (var word in scores) {
        	if (word === "" || word === 'length' || !scores.hasOwnProperty(word)) continue;
			var temp = word.substring(word.indexOf("|")+1);
			if(temp.startsWith(chars) && scores[word] == min) {
		
				if(word == target)
					break;
				else
					rank++;
			}	
		}
		
		return rank;
    }
    
    function totalLength(scores){
    	var len = 0;
    	for (var word in scores) {
        	if (word === "" || word === 'length' || !scores.hasOwnProperty(word)) continue;
			len++;
		}
    	return len;
    }
     	
	function accuracy_phormer(code) {
		console.log("evaluating");
		
		reg = new RegExp(/\n.*dg\(\'.*\'\).*\n/g);   
		  
		
		var incompleteCode = new Array();
		incompleteCode[0] = "dg('";
		incompleteCode[0] = incompleteCode[0].replace("dg","document.getElementById");
		var result;
		var i = 0;
		var found = 0;
		var notFound = 0;
		var out = "";
		while((result = reg.exec(code)) !== null) {
    		console.log(result[0]);
    		var reg2 = new RegExp(/dg\('.*'\)/g);  
    		result2 = reg2.exec(result[0])
    		console.log(result2);
    		var val = result2[0].substring(4);
    		val = val.substring(0,val.indexOf("'"));
    		//console.log(i++);
//    		console.log(result);
    		var cursor = result.index;
    		var end = result.index + result[0].length;
//			console.log(end);
//			var c = code.substring(0,cursor) + "\nvar domplete = 'replaced statement';\n" + code.substring(end);    		
//    		console.log(c);
    		
    		var words = {};
		
			var domplete = require("./domplete");
			var tries = 10;
			while(tries > 0 ) {
//				try {
					words = domplete.getEvaluations(code,cursor,incompleteCode);
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
			var scores = words['wordScores'];

    		if(scores['0|'+val] != undefined) {
    			var min = scores['0|'+val];
    			var len = totalLength(scores);
    			var a = getRank(scores, min, val,0);
    			var b = getRank(scores, min, val,1);
    			var c = getRank(scores, min, val,2);
    			out += i + "\t"  + len + "\t" + a +  "\t" + b +  "\t" + c + "\n";
    			found++;
    		} else {
    			out += i + "\t"  + val + "\n";
    			notFound++;
    		}	
    		i++;
    	    console.log(words);
		}
    	console.log(out);
	}
	function accuracy_gallery3(code) {
		console.log("evaluating");
		
		reg = new RegExp(/\n.*\$\(".*"\).*\n/g);   
		  
		
		var incompleteCode = new Array();
		incompleteCode[0] = "document";
		var next = "document";
		var result;
		var i = 0;
		var found = 0;
		var notFound = 0;
		var out = "";
		while((result = reg.exec(code)) !== null) {
    		incompleteCode[0] = "document";
			var next = "document";
			console.log(result[0]);
    		var reg2 = new RegExp(/\$\(".*"\)/g);  
    		result2 = reg2.exec(result[0])
    		console.log(result2);
    		var val = result2[0].substring(3);
    		val = val.substring(0,val.indexOf('"'));
    		val = val.split(",");
    		for(k=0; k<val.length; k++) {
	    		vals = val[k].split(" ");
    		
	    		for(j=0; j<vals.length; j++) {
		    		//console.log(i++);
		//    		console.log(result);	
					var temp = vals[j];
					if(temp.startsWith("#")){
						incompleteCode[0] += ".getElementById('";
						temp = temp.substring(1);
						next += ".getElementById('" + temp + "')";
					} else if (temp.startsWith(".")){
						incompleteCode[0] += ".getElementsByClassName('";
						temp = temp.substring(1);
						next += ".getElementsByClassName('" + temp + "')";
					} else {
						incompleteCode[0] += ".getElementsByTagName('";
						next += ".getElementsByTagName('" + temp + "')";
					}	
					
					var cursor = result.index;
	    			var end = result.index + result[0].length;
		//			console.log(end);
		//			var c = code.substring(0,cursor) + "\nvar domplete = 'replaced statement';\n" + code.substring(end);    		
		//    		console.log(c);
		    		
			    		var words = {};
		
					var domplete = require("./domplete");
					var tries = 10;
					while(tries > 0 ) {
		//				try {
							words = domplete.getEvaluations(code,cursor,incompleteCode);
					
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
					var scores = words['wordScores'];	
	
    				if(scores['0|'+temp] != undefined) {
    					var min = scores['0|'+temp];
    					var len = totalLength(scores);
    					var a = getRank(scores, min, temp,0);
    					var b = getRank(scores, min, temp,1);
    					var c = getRank(scores, min, temp,2);
    					out += i + "\t"  + j + "\t"  + len + "\t" + a +  "\t" + b +  "\t" + c + "\n";
    					found++;
    				} else {
    					out += i + "\t"  + temp + "\n";
    					notFound++;
    				}	
    				i++;
    				incompleteCode[0] = next;
    	   		 	console.log(words);
    	    	}
			}
		}
    	console.log(out);
	}
	//kbajaj: function definitions end
    
    
    /**
     * Does a distance analysis of the word `prefix` at position `pos` in `doc`.
     * @return Map
     */
    function wordDistance(doc, pos) {
        var prefixPos = getWordIndex(doc, pos);
        var words = doc.getValue().split(splitRegex);
        var wordScores = Object.create(null);
        var code = doc.getValue();
//        accuracy_phormer(code);
//        accuracy_gallery3(code);
        
        var currentWord = words[prefixPos];
		
        words.forEach(function(word, idx) {
            if (!word || word === currentWord) return;

            var distance = Math.abs(prefixPos - idx);
            var score = words.length - distance;
            if (wordScores[word]) {
            //    wordScores[word]['score'] = Math.max(score, wordScores[word]['score']);
            } else {
            //    wordScores[word] = {'score' : score, 'meta' : 'local'};
            }
        });
        
        //kbajaj: code to include DOM based autocomplete
        
        var line = getTargetLine(doc,pos);
		var incompleteCode = extractDOMCall(line);
		incompleteCode[0] = incompleteCode[0].replace("dg","document.getElementById");
		var cursor = getCursorPosition(doc,{row:pos.row, column:0});
		
		
		console.log(code);
		code = removeLine(code, pos.row+1);
//		console.log(code);
		var words = {};
		if( incompleteCode != null ) {
//			console.log(incompleteCode);
			var domplete = require("./domplete");
			var tries = 10;
			while(tries > 0 ) {
//				try {
					words = domplete.getDompletions(code,cursor,incompleteCode);
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
        }
        console.log(words);
        var scores = words['wordScores'];
        var tag = words['wordTags'];
        for (var word in scores) {
        	if (word === "" || word === 'length' || !scores.hasOwnProperty(word)) continue;
			
			var temp = word.split("(");
			var info = "";
			var w = temp[0];
			
			if(temp.length > 1) {
				for(var i=1; i<temp.length; i++) {
					info += "(" + temp[i].replace(/\_/g," ");
					console.log(info);
				}
			}
        	var level = 1000 - scores[word];
        	
        	wordScores[w] = {'score' : scores[word], 'meta' : info + ' (' + tag[word+scores[word]] + ') DOM Level: ' + level}
        	console.log(wordScores);
        }
        
        //kbajaj: code ends
        return wordScores;
    }

    exports.getCompletions = function(editor, session, pos, prefix, callback) {
        var wordScore = wordDistance(session, pos, prefix);
        var wordList = Object.keys(wordScore);
        callback(null, wordList.map(function(word) {
            return {
                name: word,
                value: word,
                score: wordScore[word]['score'],
                meta: wordScore[word]['meta']
            };
        }));
    };
});