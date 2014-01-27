var out = ""; 

function dompleteLog(append,element) {
	if(out != "")
		out += ", ";
	out += append; 
	if(element != undefined && element.csspath != undefined) { 
		out = out + "|"+element.csspath;
	} 
}

function addInnerHTML(element,innerHTML) { 
	
	if(element.documentElement) { 
		element.documentElement.innerHTML += innerHTML; 
		element.documentElement.innerHTML = element.documentElement.innerHTML;
	} else { 
		element.innerHTML += innerHTML; 
		element.innerHTML = element.innerHTML;
	}
}

function getId(element) {
	
	if(typeof element.id === "undefined" || element.id == "") {
		return "";
	}
	return "#"+element.id;
}

function getClass(element) {
	if(typeof element.className === "undefined" || element.className == "") {
		return "";
	}
	return "." + element.className.replace(/\s/g,".");
}

function getTag(element) {
	if(typeof element.tagName === "undefined") {
		return "";
	}
	return element.tagName;
}
function createProxy(document,csspath) {
	
	if(typeof document.proxied === "undefined") {
	
		if(document.getElementById != undefined) { 
			document._oldGetElementById = document.getElementById; 
			
			document.getElementById = function(id) { 
				var result = document._oldGetElementById(id); 
				
				if (!result) { 
					addInnerHTML(document,"<div id=\'" + id + "\'></div>"); 
					result = document._oldGetElementById(id); 
					result = createProxy(result,document.csspath + "#" + id); 
				} 
				result.appended = true;
				result = createProxy(result,document.csspath + "#" + id);
				dompleteLog("create " + result.csspath,"");
				return result; 
			}; 
		} 
		
		if(document.getElementsByTagName != undefined) {
			
			document._oldgetElementsByTagName = document.getElementsByTagName;
			
			document.getElementsByTagName = function(tag) {
				var result = document._oldgetElementsByTagName(tag);
    
    			if (!result || result.length == 0) {
    				addInnerHTML(document,"<" + tag + "></" + tag + ">");
    				result = document._oldgetElementsByTagName(tag);
				}
				for(var i=0; i<result.length; i++) {
					result[i] = createProxy(result[i],document.csspath + " " + tag);
					result[i].appended = true;
				}
				
    			return result;
			}
		}
		
		if(document.getElementsByClassName != undefined) {
			
			document._oldgetElementsByClassName = document.getElementsByClassName;
			
			document.getElementsByClassName = function(css) {
				
				console.log("here");
				var result = document._oldgetElementsByClassName(css);
    
    			if (!result || result.length == 0) {
    				addInnerHTML(document,'<div class="' + css + '">test</div>');
    				result = document._oldgetElementsByClassName(css);
					console.log(document);
					console.log(result);
					
				}
				for(var i=0; i<result.length; i++) {
					result[i] = createProxy(result[i],document.csspath + " ." + css);
					result[i].appended = true;
				}
				console.log(result);
    			return result;
			}
		}
		
		if(document.removeChild != undefined) { 
			document._oldremoveChild = document.removeChild;
			
			document.removeChild = function(node) {
				result = document._oldremoveChild(node);
				dompleteLog("remove " + result.csspath, "");
				return result;	
			};
			
			function remove(result) {
				
				result.appended = false;
					
				if(result.children.length > 0) {
					for(var i=0; i<result.children.length; i++) {
						var elem = result.children[i];
						remove(elem);
					}
				} 
				
			}
		} 
		
		if(document.appendChild != undefined) { 
			
			document._oldappendChild = document.appendChild;
			
			document.appendChild = function(node) {

				
				var oldpath = node.csspath;
				if(typeof oldpath === "undefined")
					oldpath = "";
				
				var path = getTag(node) + getId(node) + getClass(node);
				
				result = document._oldappendChild(node);
				
				result = createProxy(result,document.csspath + " " + path);
				
				if(result.parentNode.appended) {
					
					var appendPaths = new Array();
					appendPaths = append(result,appendPaths,result.csspath+"(added)");
					
					for(var i=0; i<appendPaths.length; i++) {
						dompleteLog("create " + appendPaths[i], "");	
					}
				}
				return result;	
			};
			
			function append(result,appendPaths,prefix) {
				
				result.appended = true;
					
				if(result.children.length > 0) {
					for(var i=0; i<result.children.length; i++) {
						var elem = result.children[i];
						var id = getId(elem);
						var css = getClass(elem);
						var tag = getTag(elem);
						prefix += " " + tag + id + css + "(added)";
						appendPaths = append(elem,appendPaths,prefix);
					}
				} else {
					appendPaths.push(prefix);
				}
				return appendPaths;
			}
		} 
		
		if(document.createElement != undefined) { 
			
			document._oldcreateElement = document.createElement;
			
			document.createElement = function(tag) {

				result = document._oldcreateElement(tag);
				result.appended = false;
				var random = "domplete_" + Math.floor(Math.random()*100000);
				result.id = random;
				
				result = createProxy(result,tag+"#"+random);
				
				//dompleteLog("create " + result.csspath, "");
				return result;	
			};
		} 
		
		document.proxied = 1;
	}	
	document.csspath = csspath; 
	return document;
}

var doc = document.implementation.createDocument ("http://www.w3.org/1999/xhtml", "html", null);
doc = createProxy(doc,""); 
var html = doc.getElementsByTagName("html")[0]; 
html = createProxy(html,"");

