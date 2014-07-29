jQuery1 = function(id) {
	try{ 
		var result = doc.querySelector(id); 
	}catch(ex) {
		return interceptJqueryObject(jQuery(result));
	}
	console.log(result);
	return interceptJqueryObject(jQuery(result));
}
jQuery1.fn = [];

function interceptJqueryObject(obj) {
	
	
	if(obj.children != undefined) { 
		obj._oldchildren = obj.children; 
		
		obj.children = function(selector) {
			if(selector == '')
				selector = 'span';
			
			var result = obj[0].querySelector(selector);
			
			return interceptJqueryObject(jQuery(result));
		}
	
	}
	if(obj.add != undefined) { 
		obj._oldadd = obj.add; 
		
		obj.add = function(selector) {
			dompleteLog("create " + obj[0].csspath + " " + selector + "(added)","");
			var result = obj[0].querySelector(selector);
			
			return interceptJqueryObject(jQuery(result));
			
		}
	}
	if(obj.addClass != undefined) { 
		obj._oldaddClass = obj.addClass; 
		obj.addClass = function(css) {
			dompleteLog("create " + obj[0].csspath + "." + css,"");
			obj._oldaddClass(css);
			return obj;
		}
	}
	if(obj.removeClass != undefined) { 
		obj._oldremoveClass = obj.addClass; 
		obj.removeClass = function(css) {
			dompleteLog("removeclass " + obj[0].csspath + "," + css,"");
			obj._oldaddClass(css);
			return obj;
		}
	}
	if(obj.hide != undefined) { 
		obj._hide = obj.hide; 
		obj.hide = function(css) {
			return obj;
		}
	}
	if(obj.show != undefined) { 
		obj._show = obj.show; 
		obj.show = function(css) {
			return obj;
		}
	}
	return obj;
}