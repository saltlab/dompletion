String.prototype.trim=function(){return this.replace(/^\s+|\s+$/g, '');};
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
	console.log(innerHTML);	
	if(element.documentElement) { 
		element.documentElement.innerHTML += innerHTML; 
		element.documentElement.innerHTML = element.documentElement.innerHTML;
	} else { 
		element.innerHTML += innerHTML; 
		element.innerHTML = element.innerHTML;
	}
}

function addElement(element, tag, id, css) {
	var elem = doc._oldcreateElement(tag);
	elem.setAttribute("id", id);
	elem.className = css;
	try{
		return element._oldappendChild(elem);
	} catch(ex) {
		return element.body._oldappendChild(elem);
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


function readTag(node) {
    var tag = '';
    tag = node.split(".")[0].split("#")[0];
    if(tag == '')
    	tag = 'div';
    return tag;
}
function readID(node) {
    var id = '';
    if(node.indexOf("#") != -1) {
    	var indexHash = node.indexOf("#")+1;
    	id = node.substring(indexHash).split(".")[0];
    }
    return id;
}
function readClass(node) {
    var classes = new Array();
    if(node.indexOf(".") != -1) {
    	var indexDot = node.indexOf(".");
    	var temp = node.substring(indexDot);
    	temp = temp.replace(/\./g," ");
    	temp = temp.substring(1);
    	classes = temp.split(" ");
    }
    			
    return classes.join(" ");
}

function addProperties(document) {
	document.abbr='';
	document.accept='';
	document.accesskey='';
	document.action='';
	document.align='';
	document.alink='';
	document.alt='';
	document.archive='';
	document.axis='';
	document.background='';
	document.bgcolor='';
	document.border='';
	document.cellpadding='';
	document.char='';
	document.charoff='';
	document.charset='';
	document.checked='';
	document.cite='';
	document.classid='';
	document.clear='';
	document.code='';
	document.codebase='';
	document.codetype='';
	document.color='';
	document.cols='';
	document.colspan='';
	document.compact='';
	document.content='';
	document.coords='';
	document.data='';
	document.datetime='';
	document.declare='';
	document.defer='';
	document.dir='';
	document.disabled='';
	document.enctype='';
	document.face='';
	document.for='';
	document.frame='';
	document.frameborder='';
	document.headers='';
	document.height='';
	document.href='';
	document.hreflang='';
	document.hspace='';
	document.ismap='';
	document.label='';
	document.lang='';
	document.language='';
	document.link='';
	document.longdesc='';
	document.marginheight='';
	document.marginwidth='';
	document.maxlength='';
	document.media='';
	document.method='';
	document.multiple='';
	document.name='';
	document.nohref='';
	document.noresize='';
	document.noshade='';
	document.nowrap='';
	document.object='';
	document.onblur='';
	document.onchange='';
	document.onclick='';
	document.ondblclick='';
	document.onfocus='';
	document.onkeydown='';
	document.onkeypress='';
	document.onkeyup='';
	document.onload='';
	document.onmousedown='';
	document.onmousemove='';
	document.onmouseout='';
	document.onmouseover='';
	document.onmouseup='';
	document.onreset='';
	document.onselect='';
	document.onsubmit='';
	document.onunload='';
	document.profile='';
	document.prompt='';
	document.readonly='';
	document.rel='';
	document.rev='';
	document.rows='';
	document.rowspan='';
	document.rules='';
	document.scheme='';
	document.scope='';
	document.scrolling='';
	document.selected='';
	document.shape='';
	document.size='';
	document.src='';
	document.standby='';
	document.start='';
	document.style='';
	document.summary='';
	document.tabindex='';
	document.target='';
	document.text='';
	document.title='';
	document.type='';
	document.usemap='';
	document.valign='';
	document.value='';
	document.valuetype='';
	document.version='';
	document.vlink='';
	document.vspace='';
	document.width='';
	return document;
}
function createProxy(document,csspath) {
	csspath = csspath.trim();
	console.log(document);
	document = addProperties(document);
	if(typeof document.proxied === "undefined") {
	
		if(document.getElementById != undefined) { 
			document._oldGetElementById = document.getElementById; 
			
			document.getElementById = function(id) { 
				var result = document._oldGetElementById(id); 
				
				if (!result) { 
					addElement(document,"div",id,""); 
					result = document._oldGetElementById(id); 
					console.log(document);
					result = createProxy(result,document.csspath + " #" + id); 
				} 
				result.appended = true;
				result = createProxy(result,document.csspath + " #" + id);
				dompleteLog("create " + result.csspath,"");
				return result; 
			}; 
		} 
		
		if(document.querySelector != undefined) { 
			document._oldQuerySelector = document.querySelector; 
			
			document.querySelector = function(id) { 
//				alert("query selector: " + id);
				var arg = id;
				var result = document._oldQuerySelector(id); 
				
				if (!result) { 
					var sequence = id.trim().split(" ");
					var parent = document;
					for(var i=0; i<sequence.length; i++) {
						console.log(sequence[i]);
						var res = parent._oldQuerySelector(sequence[i]);
						if(res == null) {						
							var id = readID(sequence[i]);
							var tag = readTag(sequence[i]);
							var css = readClass(sequence[i]);
							temp = addElement(parent,tag,id,css); 
//							alert(temp); 
							temp = createProxy(temp,parent.csspath + " " + sequence[i]); 
							temp.appended = true;
							dompleteLog("create " + temp.csspath,"");
							parent = temp;
				
						} else {
							temp = res;
						}
					}
				} 
				result = temp;	
				return result; 
			}; 
		} 
		
		if(document.getElementsByTagName != undefined) {
			
			document._oldgetElementsByTagName = document.getElementsByTagName;
			
			document.getElementsByTagName = function(tag) {
				var result = document._oldgetElementsByTagName(tag);
    
    			if (!result || result.length == 0) {
    				addElement(document,tag,"",""); 
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
    				addElement(document,"div","",css); 
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
						prefix += " " + tag + id + css + "( )";
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

var doc = document.implementation.createHTMLDocument('');// ("http://www.w3.org/1999/xhtml", "html", null);
doc.open();
doc.write("<html><body></body></html>");
doc.close();
doc = createProxy(doc,"");
doc.body = createProxy(doc.body,"");
/*var html = doc.getElementsByTagName("html")[0]; 
html = createProxy(html,"");
var body = html.getElementsByTagName("body")[0]; 
body = createProxy(body,"");
doc.body = body;
*/


