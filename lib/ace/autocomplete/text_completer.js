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
    	
    	var DOMAccessRegex = new RegExp("[a-zA-Z_0-9\$\-]+(\.getElementById\\(.*\\)|\.getElementsByTagName\\(.*\\)|\.getElementsByClassName\\(.*\\))*(\.getElementById\\(['\"]|\.getElementsByTagName\\(['\"]|\.getElementsByClassName\\(['\"])[a-zA-Z_0-9_\-]*$","g");
    	return line.match(DOMAccessRegex);
    }
    function removeLine(code, lineNumber) {
    	var arr = code.split("\n");
    	arr.splice(lineNumber-1,1);
    	return arr.join("\n");
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
        
        var currentWord = words[prefixPos];
		
        words.forEach(function(word, idx) {
            if (!word || word === currentWord) return;

            var distance = Math.abs(prefixPos - idx);
            var score = words.length - distance;
            if (wordScores[word]) {
                wordScores[word]['score'] = Math.max(score, wordScores[word]['score']);
            } else {
                wordScores[word] = {'score' : score, 'meta' : 'local'};
            }
        });
        
        //kbajaj: code to include DOM based autocomplete
        
        var line = getTargetLine(doc,pos);
		var incompleteCode = extractDOMCall(line);
		var cursor = getCursorPosition(doc,{row:pos.row, column:0});
		
		var code = doc.getValue();
		code = removeLine(code, pos.row+1);
		
		var words = {};
		if( incompleteCode != null ) {
			console.log(incompleteCode);
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
        	var level = 1000 - scores[word];
        	wordScores[word] = {'score' : scores[word], 'meta' : '(' + tag[word+scores[word]] + ') DOM Level: ' + level}
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