navigator.sayswho= (function(){

	var N= navigator.appName, ua= navigator.userAgent, tem;
	var M= ua.match(/(opera|chrome|safari|firefox|msie)\/?\s*(\.?\d+(\.\d+)*)/i);
	if(M && (tem= ua.match(/version\/([\.\d]+)/i))!= null) M[2]= tem[1];
	M= M? [M[1], M[2]]: [N, navigator.appVersion,'-?'];
	return M;

 })();
 
feHelper = {
	getSelection : function(){
		if (window.getSelection) {  // all browsers, except IE before version 9
	        var range 	= window.getSelection().getRangeAt(0);
	        var content = range.cloneContents();
	        var paragraph = document.createElement('span');

	        paragraph.appendChild(content);
	        return range.toString().replace("\n", '<br/>');
	        //return paragraph.innerHTML;
	        //return range.toString ();
	    } 
	    else {
	        if (document.selection.createRange) { // Internet Explorer
	            var range = document.selection.createRange ();
	            var text = range.text.replace("\r\n", '<br/>');
	            return range.text.replace("\r\n", '<br/>');
	            //return range.htmlText;
	        }
	    }
	},
	getSelectionParent : function(){
		if (window.getSelection) {  // all browsers, except IE before version 9
	        var range = window.getSelection ();                                        
	        return range.anchorNode.parentNode;
	    } 
	    else {
	        if (document.selection.createRange) { // Internet Explorer
	            var range = document.selection.createRange ();
	            return range.parentElement();
	        }
	    }
	},
	parseBBCode: function(html) {
		search = new Array(
		      /\[b\](.*?)\[\/b\]/g,  
		      /\[i\](.*?)\[\/i\]/g,
		      /\[img\](.*?)\[\/img\]/g,
		      /\[url\="?(.*?)"?\](.*?)\[\/url\]/g,
		      /\[quote](.*?)\[\/quote\]/g,
		      /\[code](.*?)\[\/code\]/g,
		      /\[list\=(.*?)\](.*?)\[\/list\]/gi,
		      /\[list\]([\s\S]*?)\[\/list\]/gi,
		      /\[\*\]\s?(.*?)\n/g);

		replace = new Array(
		      "<strong>$1</strong>",
		      "<em>$1</em>",
		      "<img src=\"$1\" alt=\"An image\">",
		      "<a href=\"$1\">$2</a>",
		      "<blockquote>$1</blockquote>",
		      '<pre class="brush: php;">$1</pre>',
		      "<ol>$2</ol>",
		      "<ul>$1</ul>",
		      "<li>$1</li>");

		for (i = 0; i < search.length; i++) {
		    html = html.replace(search[i], replace[i]);
		}
		return html;
	},
	renderHtml: function(ed,e){
	    jQuery("#thread_preview div.text-detail").html(parseBBCode(ed.getContent()));
	}

};

/**
 * Default functions
 */
(function($){
	$(document).ready(function(){
		$('[data-toggle=display]').click(function(event){
			event.preventDefault();
			var element = $(this);
			var target 	= $(element.attr('data-target'));

			if ( target.is(':hidden') )
				target.show();
			else 
				target.hide();
		});
		if( !(typeof(Modernizr) =="undefined") ){
			//Modernizr
			Modernizr.load([
			{
				test: Modernizr.input.placeholder,
				complete: function(){
					if ( !Modernizr.input.placeholder ){
						jQuery('[placeholder]')
							.each(function(){
								var $this = jQuery(this);
								if ($this.val() === ''){
									$this.val( $this.attr('placeholder') );
								}
							})
							.focus(function(){
								var $this = jQuery(this);
								if ($this.val() === $this.attr('placeholder')){
									$this.val('');
									$this.removeClass('placeholder');
								}
							})
							.blur(function(){
								var $this = jQuery(this);
								if ($this.val() === '' || $this.val() === $this.attr('placeholder')){
									$this.val($this.attr('placeholder'));
									$this.addClass('placeholder');
								}
							})
						
							.closest('form').submit(function(){ // remove placeholders on submit
								var $form = jQuery(this);
								$form.find('[placeholder]').each(function(){
									var $this = jQuery(this);
									if ($this.val() === $this.attr('placeholder')){
										$this.val('');
									}
								});
							});
					}
				}
			}
			]);
		}

	});

if ( typeof($.fn.loader) == 'undefined' ){
	$.fn.loader = function(style){
		var element = $(this);
		if ( style == 'load' ){
			element.animate({
				'opacity' : 0.5
			}).addClass('et-loading disabled');
		} else if ( style == 'unload'){
			element.animate({
				'opacity' : 1
			}).removeClass('et-loading disabled');	
		}
	}
} else {
	$.fn.fe_loader = function(style){
		var element = $(this);
		if ( style == 'load' ){
			element.animate({
				'opacity' : 0.5
			}).addClass('et-loading disabled');
		} else if ( style == 'unload'){
			element.animate({
				'opacity' : 1
			}).removeClass('et-loading disabled');	
		}
	}
}

$.fn.styleSelect = function(){
	$(this).each(function(){
		var element = $(this);
		var wrapper = $('<div class="et-button-select">');
		var label 	= $('<span class="select">');

		if ( element.hasClass('styled') )
			return false;

		element
			.addClass('styled')
			.css({'z-index': '10', 'opacity': '0'})
			.wrap(wrapper)
			.after(label);
		label.text( element.find('option:selected').text() );

		element.css( 'width', '100%' );

		element.on('change', function(){
			label.text( element.find('option:selected').text() );
		})
	});
}

$.fn.serializeObject = function(){

	var self = this,
	    json = {},
	    push_counters = {},
	    patterns = {
	        "validate": /^[a-zA-Z][a-zA-Z0-9_]*(?:\[(?:\d*|[a-zA-Z0-9_]+)\])*$/,
	        "key":      /[a-zA-Z0-9_]+|(?=\[\])/g,
	        "push":     /^$/,
	        "fixed":    /^\d+$/,
	        "named":    /^[a-zA-Z0-9_]+$/
	    };


	this.build = function(base, key, value){
	    base[key] = value;
	    return base;
	};

	this.push_counter = function(key){
	    if(push_counters[key] === undefined){
	        push_counters[key] = 0;
	    }
	    return push_counters[key]++;
	};

	$.each($(this).serializeArray(), function(){

	    // skip invalid keys
	    if(!patterns.validate.test(this.name)){
	        return;
	    }

	    var k,
	        keys = this.name.match(patterns.key),
	        merge = this.value,
	        reverse_key = this.name;

	    while((k = keys.pop()) !== undefined){

	        // adjust reverse_key
	        reverse_key = reverse_key.replace(new RegExp("\\[" + k + "\\]$"), '');

	        // push
	        if(k.match(patterns.push)){
	            merge = self.build([], self.push_counter(reverse_key), merge);
	        }

	        // fixed
	        else if(k.match(patterns.fixed)){
	            merge = self.build([], k, merge);
	        }

	        // named
	        else if(k.match(patterns.named)){
	            merge = self.build({}, k, merge);
	        }
	    }

	    json = $.extend(true, json, merge);
	});

	return json;
};

/**
 * Global Views, Models for entire site
 */

ForumEngine 			= {};
ForumEngine.Views 		= ForumEngine.Views || {};
ForumEngine.Models 		= ForumEngine.Models || {};
ForumEngine.Collections = ForumEngine.Collections || {};
App 					= {};
App.CurrentUser 		= App.CurrentUser || {};
App.Auth 				= App.Auth || {};

pubsub = {};
pubsub = _.extend(pubsub, Backbone.Events);

/**
 *
 */
ForumEngine.Models.User = Backbone.Model.extend({ 
	defaults    : {
		display_name    : '',
		user_url		: '',
		post_url		: '',
	},
	params	: {
		type		: 'POST',
		dataType	: 'json',
		url			: fe_globals.ajaxURL,
		contentType	: 'application/x-www-form-urlencoded;charset=UTF-8'
	},

	action  : 'et_user_sync',
	role	: 'subcriber',

	initalize	: function(){
	},

	login: function(username, pass, options){
		var options = _.extend(options || {}, { 
			data: {
			'user_name' : username,
			'user_pass' : pass
		}});
		var model = this;

		var success 	= options.success || function(){};
		var beforeSend 	= options.beforeSend || function(){};
		var complete 	= options.complete || function(){};

		options.beforeSend = function(){			
			beforeSend();
		}
		options.success = function(resp, model){
			if (resp.success){

				test = resp.data.user;
				model.set(resp.data.user);

				// trigger after login event
				//pubsub.trigger('fe:auth:afterLogin', model);
			}
			success(resp, model);
		}

		this.sync('login', this, options);
	},
	inbox: function(user_id, message, options){
		var options = _.extend(options || {}, { 
			data: {
			'user_id' 	: user_id,
			'message' 	: message
		}});
		this.sync('inbox', this, options);		
	},
	register: function(username, email, pass, options){
		var options = _.extend(options || {}, { 
			data: {
			'user_name' : username,
			'user_pass' : pass,
			'user_email' : email
		}});
		var model = this;

		var success 	= options.success || function(){};
		var beforeSend 	= options.beforeSend || function(){};
		var complete 	= options.complete || function(){};

		options.beforeSend = function(){			
			beforeSend();
		}
		
		options.success = function(resp, model){
			if (resp.success){				
				model.set(resp.data.user);
			}
			success(resp, model);
		}

		this.sync('register', this, options);
	},

	toggleFollow: function(post_id, options){
		if ( !this.get('id') ){			
			return false;
		}

		var options = _.extend(options || {}, {
			data: {
				'post_id' : post_id
			}
		});
		this.sync('follow', this, options);
	},

	logout: function(){

	},

	sync: function(method, model, options){
		var params = this.params;

		// build data
		params.data = {
			action: this.action,
			method: method, 
			content: {}
		}

		var success 		= options.success || function(){};
		var beforeSend 		= options.beforeSend || function(){};
		var complete 		= options.complete || function(){};

		params.beforeSend = function(){
			pubsub.trigger('fe:request:waiting');
			beforeSend();
		}

		params.success = function(resp){
			pubsub.trigger('fe:response:success');
			success(resp, model);
		}

		params.complete = function(){
			pubsub.trigger('fe:response:complete');
			complete();
		}

		if ( options.data ){
			params.data.content = options.data;
		} else {
			if ( typeof options.fields == 'object' ){
				_.each(options.fields, function(element){
					var data = {};
					data[element] = model.get(element);
				});
				params.data = data;
			} else {
				params.data = model.attributes;
			}
		}

		return $.ajax(params);
	}

});

ForumEngine.Models.Member = ForumEngine.Models.User.extend({
	initialize: function(){
		_.bindAll(this, 'confirm', 'updateRole', 'updateBan', 'unban');
		ForumEngine.Models.User.prototype.initialize.call();
	},
	confirm: function(options){
		var options = _.extend(options || {}, { 
			data: {
				'ID' 	: this.get('id'),
		}});		
		this.sync('confirm', this, options);
	},
	updateRole: function(newRole, options){

		var options = _.extend(options || {}, { 
			data: {
				'ID' 	: this.get('id'),
				'role' 	: newRole
		}});

		this.sync('update_role', this, options);
	},

	updateBan: function( expired, note, options){
		var options = _.extend(options || {}, { 
			data: {
				'ID' 		: this.get('id'),
				'expired' 	: expired,
				'note' 		: note
		}});		

		this.sync('update_role', this, options);
	},

	unban: function( options ){
		var options = _.extend(options || {}, { 
			data: {
				'ID' 		: this.get('id')
		}});

		this.sync( 'unban', this, options );
	}
})

/**
 * Model Post for thread and reply
 */
ForumEngine.Models.Post = Backbone.Model.extend({
	action : "et_post_sync",
	initialize: function(){
		if ( typeof this.get('id') == 'undefined' && typeof this.get('ID') != 'undefined' ){
			this.set('id', this.get('ID'));
		}
	},

	like: function(options){
		options = options || {};
		this.sync('like', this, options);
	},

	report: function(content, options){
		
		var options = _.extend({
			data : content
		}, options);

		this.sync('report', this, options);
	},

	reply: function( content, options){
		var att = this.attributes;
		var options = _.extend({
			data : {
				et_reply_parent: this.get('id'),
				post_content: content
			}
		}, options);

		this.sync('reply', this, options);
	},

	update: function(data, options){		
		var keys 	= [];
		var model 	= this;
		_.each( data, function(element, key){
			keys.push(key)
			model.set(key, element);
		});
		var options = _.extend({}, {data: data, fields: keys}, options);

		this.sync('update', this, options);
	},

	onDelete: function(options){
		this.sync('delete', this, options);
	},

	close: function(options){
		this.sync('close', this, options);
	},

	sticky: function(options){
		this.sync('sticky', this, options);
	},

	approve: function(options){
		this.sync('approve', this, options);
	},

	undoStatus: function(options){
		this.sync('undo', this, options);
	},

	sticky: function(options){
		this.sync('sticky', this, options)
	},

	stickyHome: function(options){
		this.sync('sticky-home', this, options)
	},

	parse: function(resp){
		if (!resp.success){
			return {};
		}	
		else {
			return resp.data.reply;
		}
	},

	sync: function(method, model, options){
		var params = {
			url 	: fe_globals.ajaxURL,
			type	: 'post',
			data 	: {
				action	: this.action,
				method 	: '',
				content : {}
			}
		};

		var sendData 	= _.clone(model.attributes);
		var options  	= options || {};

		// get changed options
		if ( options.fields){
			sendData = {};
			_.each( options.fields, function( field ){
				sendData[field] = model.attributes[field];
			} );
			sendData['id'] 		= model.attributes['id'];
			sendData['ID'] 		= model.attributes['ID'];
		}
		params.data.content = $.extend( sendData, options.data );

		// 
		params.data.method 	= method;

		// event
		params.beforeSend 	= options.beforeSend || function(){};
		//params.success 		= options.success || function(){};
		params.complete 	= options.complete || function(){};

		// event success
		var success = options.success || function(model, resp){};
		params.success = function(resp){
			success(resp, this);
		}

		$.ajax(params);
	},
});

ForumEngine.Collections.Posts 	= Backbone.Collection.extend({
	action: 'et_sync_post_collection',
	model : ForumEngine.Models.Post,
	parse: function(resp){
		if (resp.success){
			return resp.data.replies;
		} else {
			return {};
		}
	},
	sync: function(method, model, options){
		var params = {
			url: fe_globals.ajaxURL,
			type: 'post',
			data: {
				action: this.model,
				method: method,
				content: {}
			}
		};

		var data = params.data.content;
		params.data.content = $.extend(data, options.data || {});

		// callbacks
		var beforeSend 	= options.beforeSend || function(){};
		var success 	= options.success || function(resp, model){};
		var complete 	= options.complete || function(){};

		params.beforeSend = function(){
			beforeSend();
		}

		params.success = function(resp){
			success(resp, model);
		}

		params.complete = function(){
			complete();
		}

		$.ajax(params);
	}
});


//App.Validator = 

})(jQuery);