(function($){
	/*
	* Check login to view content
	*/
	$(document).on('click', '.thread-item', function(event) {
		var thread = $(this).attr('data-cat');//find("input").val();
		var role ='';

		if(currentUser['ID'] != 0 && currentUser['role'] != null){

			return true;

		} else {

			var ua = "075ae3d2fc31640504f814f60e5ef713";
			var authorize_to_view = authorizeToView;

			if(authorize_to_view.indexOf(ua) != -1){
				return true;
			}

			if(authorize_to_view.indexOf(thread) != -1){
				return true;
			} else {
				pubsub.trigger('fe:showNotice', fe_front.texts.login_2_view, 'warning');
				return false;
			}
		}
		return false;
	});

	$(document).ready(function(){

	    jQuery.validator.addMethod("username", function(username) {
	    	return username.match ('^([a-zA-Z0-9.]+@){0,1}([a-zA-Z0-9.])+$');
	    });

		ForumEngine.app = new ForumEngine.Views.App();

		// init new
		App.Auth = new ForumEngine.Models.User(currentUser);
	});

	$(window).resize(function(event) {
		$('.cnt-container').css('padding-bottom', $('footer').height() + 35 + 'px');
	});

	//========== Infinite Scoll ==========//
	$(window).scroll(function()
	{
	    if( ($(window).scrollTop() == $(document).height() - $(window).height()) && $("#loading").attr('data-fetch') == 1 )
	    {
	    	pubsub.trigger('loadMoreThreads');
		}

	});

	pubsub.on('loadMoreThreads', triggerLoadmoreThreads);
	function triggerLoadmoreThreads(){
		ForumEngine.app.getThreads();
	}
	//========== Infinite Scoll ==========//

	/**
	 * Site app view
	 */
	ForumEngine.Views.App 	= Backbone.View.extend({
		el: 'body',
		defaults: {
			currentUser: {},
			loginModal: false
		},
		events: {
			'click #open_login' 						: 'initModal',
			'change input[type=checkbox].fe-checkbox' 	: 'changeCheckbox',
			'keyup #search_field' 						: 'onSearch',
			//'blur #search_field' 						: 'hideSearchPreview',
			'focus #search_field' 						: 'showSearchPreview',
			'submit #fe_search_form' : 'checkSearch'
		},
		initialize: function(){
			this.currentUser 	= new ForumEngine.Models.User(currentUser);
			pubsub.on('fe:refreshPage', this.onRefreshPage);
			pubsub.on('fe:showNotice', this.onShowNotice);
			pubsub.on('fe:fillThreads',this.getThreads);

			// toggle right menu in tablet
			$('.mo-menu-toggle').bind('click', function(){
				var container = $('.site-container');
				var menu 		= $('.mobile-menu');
				if ( !container.hasClass('slided') ){
					menu.show();
					container.animate({ left: '-300' });
					container.addClass('slided');
				} else {
					container.animate({ left: '0' }, 'normal' , function(){ menu.hide(); });
					container.removeClass('slided');
				}
			});

			$('.modal input[type=text], .modal input[type=password], .modal input.form-control, #wp-link-wrap input[type=text]')
				.focusin(function(){
					var line = $(this).before('<span class="line-correct"></span>');
				})
				.focusout(function(){
					var line = $(this).prev('span.line-correct').remove();
				});
			this.initAppearance();

			this.searchDebounce = _.debounce(this.searchAjax, 500);
			//this.$('#search_field').keyup()
			//set padding for container
			$('.cnt-container').css('padding-bottom', $('footer').height() + 35 + 'px');

			//========== First Infinite Scoll ==========//
			var loop  = parseInt($("#loading").attr('data-check')),
				fetch = $("#loading").attr('data-fetch'),
				view  = this;
			if(loop > 1 && fetch == "1" && $("#main_list_post li").length < 10){
				pubsub.trigger('fe:fillThreads');
			}
			//========== First Infinite Scoll ==========//
		},
		checkSearch: function(event){
			var form = $(event.currentTarget),
			keyword  = form.find('#search_field');
			if(keyword.val())
				return true;
			else
				return false;
			keyword.focus();
		},
		getThreads:function(page){
			var extend = {};
			if ( typeof(forumengine_get_threads_data) != 'undefined' )
				extend = forumengine_get_threads_data;

			var loading 	= $('body').find('#loading'),
				paged 		= page != null ? page : $('body').find('#current_page').val(),
				status  	= loading.attr('data-status'),
				query_default = {
					action		: 'et_post_sync',
					method		: 'get',
					content : {
						paged			: paged,
						status 			: status,
						extend			: extend
					}
				},
				that = this;

				if(loading.attr('data-term')) {
					query_default.content.thread_category = loading.attr('data-term');
				}

				if(loading.attr('data-tag')) {
					query_default.content.fe_tag = loading.attr('data-tag');
				}

				if(loading.attr('data-s')) {
					query_default.content.s = loading.attr('data-s');
				}

				if(loading.attr('data-author')) {
					query_default.content.author = loading.attr('data-author');
				}

				if ( typeof(threads_exclude) != 'undefined'){
					query_default.content.exclude = threads_exclude;
				}

			$.ajax({
				url : fe_globals.ajaxURL,
				type : 'post',
				data : query_default,
				beforeSend : function(){
					loading.removeClass('hide');
					$('body').find('#loading').attr('data-fetch', 0);
				},
				error : function(request){
					loading.addClass('hide').removeClass('processing');
				},
				success : function(response){

					var current_page = response.data.paged,
						max_page_query = response.data.total_pages;
					if(response.success){
						$('body').find('input#current_page').val(current_page);
						$('body').find('#loading').attr('data-fetch', current_page < max_page_query ? 1 : 0);
						loading.addClass('hide');

						//that.renderLoadMore(response.data.threads);
						var container = $('body').find('#main_list_post'),
							that = this;

						for (key in response.data.threads){
							var itemView = new ForumEngine.Views.ListThreadItem({el : response.data.threads[key] });
							//console.log(itemView.render());
							container.append( itemView.$el );
							//container.append(itemView.render());
							pubsub.trigger( 'fe:getThreads', itemView.$el );
							//pubsub.trigger( 'fe:getThreads', itemView.render() );
						}

						if(current_page < max_page_query && $("#main_list_post li").length < 10)
							pubsub.trigger('fe:fillThreads');

					} else {

					}
				}
			});
		},

		renderLoadMore:function(threads){
			var container = $('body').find('#main_list_post'),
				that = this;

			for (key in threads){
				var itemView = new ForumEngine.Views.ListThreadItem({el : threads[key] });
				container.append( itemView.$el );
				pubsub.trigger( 'fe:getThreads', itemView.$el );
			}
		},

		initAppearance: function(){
			// calc min height for website
			if ( $('body').hasClass('admin-bar') ){
				$('.cnt-container').css('min-height', $(window).height() - 28);
			} else {
				$('.cnt-container').css('min-height', $(window).height());
			}
		},

		initModal : function(event){
			if ( typeof this.loginModal != 'object' ){
				this.loginModal 	= new ForumEngine.Views.LoginModal({el : $('#modal_login')});
			}
		},
		getLoginModal: function(){
			this.initModal();
			return this.loginModal;
		},
		getReportModal: function(model){
			if(typeof this.reportModal === 'undefined') {
				this.reportModal 	= new ForumEngine.Views.ReportModal({
					el : $('#reportFormModal')
				});
			}
			this.reportModal.setModel(model);
			return this.reportModal;
		},

		login: function(username, password, options){
			this.currentUser.login(username, password, options);
		},

		register: function(username, email, pass, options){
			this.currentUser.register(username, email, pass, options);
		},

		inbox: function(user_id, message, options){
			this.currentUser.inbox(user_id, message, options);
		},

		setRefreshPage: function(value){
			this.loginModal.enableRefresh = value ? true : false;
		},

		// events
		onRefreshPage: function(value){
			window.location.reload();
		},

		onShowNotice: function(msg, type){
			var pageOffset 	= $('body').scrollTop();
			var noticeBlock = $('<div class="fe-noti">')
					.addClass('fe-' + type)
					.html('<span class="icon"></span>&nbsp;&nbsp;<span class="text">' + msg + '</span>');

			if ( pageOffset > 70 ){
				noticeBlock
					.css('top', $('body').hasClass('admin-bar') ? '28px' : 0);
			}

			$('.fe-noti')
				.fadeOut('fast', function(){
					$(this).remove();
				})

			$('body')
				.append(noticeBlock
					.hide()
					.fadeIn()
					.delay(4000)
					.fadeOut('fast', function(){
						$(this).remove();
					})
				);
		},

		changeCheckbox: function(event){
			var element = $(event.currentTarget);
			if ( element.is(':checked') ){
				$(element.next('label')).addClass('checked');
				element.parent().addClass('checked');
			} else {
				$(element.next('label')).removeClass('checked');
			}
		},

		onSearch:function(event){
			var element = event.currentTarget;
			var keyCode	= event.which;

			this.searchDebounce();
		},

		hideSearchPreview: function(event){
			var outputContainer = $('#search_preview');

			if ( !$.contains(outputContainer.get(0), event.currentTarget) ){
				outputContainer.hide();
			}
		},

		onShowSearchPreview: function(e){
			var outputContainer = $('#search_preview');
			var input 			= $('#search_field').get(0);
			$('body').bind('click', function(e){
				if ( !$.contains( outputContainer.get(0), e.target) && e.target != input ){
					outputContainer.hide();
					$('body').unbind('click');
				}
			});
		},

		showSearchPreview: function(event){
			var outputContainer = $('#search_preview');
			var view = this;
			if ( !outputContainer.hasClass('empty') ){

				outputContainer.show();

				view.onShowSearchPreview();
			}
		},

		searchAjax: function(){
			var input 			= $('#search_field'),
				searchValue 	= input.val(),
				source 			= $('#search_preview_template').html(),
				template 		= _.template(source),
				outputContainer = $('#search_preview'),
				content 		= {
									's' : searchValue
								},
				view 			= this;

			if ( searchValue == '' ){
				$('#search_preview').addClass('empty');
				return false;
			}

			if ( $("#fe_search_form #thread_category").length > 0 ){
				content.thread_category = $("#fe_search_form #thread_category").val()
			}

			var params 	= {
				url 	: fe_globals.ajaxURL,
				type 	: 'post',
				data 	: {
					'action'   	: 'et_search',
					'content' 	: content
				},
				beforeSend: function(){

				},
				success: function(resp){
					if ( resp.success ){
						var data = resp.data;

						//data.title_highlight = data.post_title.replace( searchValue, '<strong>' + searchValue + "</strong>" );
						//console.log(data);

						var output = template(resp.data);
						outputContainer.html(output).removeClass('empty').fadeIn();

						view.onShowSearchPreview();
					}
				},
				complete: function(){

				}
			};
			$.ajax(params);
		}

	});

	ForumEngine.Views.PostListItem  = Backbone.View.extend({
		tagName: "div",
		className : "items-thread clearfix reply-item",
		events: {
			'click .like-post' 			 : 'onLike',
			'submit .ajax-reply' 		 : 'ajaxReply',
			'click .show-replies' 		 : 'showReplies',
			'click .btn-more-reply' 	 : 'moreReplies',
			'click .open-reply' 		 : 'onOpenReplyForm',
			'click .control-edit' 		 : 'onOpenEdit',
			'click .control-edit-cancel' : 'onCancelEdit',
			'submit .form-post-edit' 	 : 'onSubmitEdit',
			'click .control-quote'		 : 'onQuote',
			'click .control-report' 	 : 'openReport',
			'click span.btn-cancel' 	 : 'onCancelReplyForm'
		},

		initialize: function(){

			this.model 	= new ForumEngine.Models.Post(this.model);
			this.page 	= 1;

			// events
			this.subReplies 	= [];

			// add event login
			pubsub.on('fe:auth:afterLogin', this.afterAuthorize);
			pubsub.on('fe:auth:afterRegister', this.afterAuthorize);
			pubsub.on('fe:auth:afterReport', this.afterReport);
			//init quote function
			this.$('.reply-item .content').quote({
				selected: function(selection, dom){

					var author = dom.parent().find('> .name .post-author').text(),
						parent = dom.parent().parent().parent();

					if(parent.hasClass('topic-thread')){

						var	editor =  tinymce.activeEditor;
						var oldContent = editor.getContent();
						var newContent = oldContent + '[quote author="'+author+'"]' + selection + '[/quote]' + "<p></p>";
						var id = $('.thread-reply textarea[name=post_content]').attr('id');

						$('html, body').animate({ scrollTop: 60000 }, 'slow');

						$('.linke-by').show();
						$('.form-reply').hide();
						$("form#reply_thread").slideDown('fast', function() {
							$('.reply-overlay').hide();
						});

						if(typeof tinymce !== 'undefined') {
					    	tinymce.EditorManager.execCommand("mceAddEditor", false, id);
					    	tinymce.activeEditor.execCommand('mceInsertContent', false , newContent);
					    }

					} else {

						var	editor =  tinymce.activeEditor;
						var oldContent = editor.getContent();
						var newContent = oldContent + '[quote author="'+author+'"]' + selection + '[/quote]' + "<p></p>";

						$('.linke-by').show();
						$('.form-reply').hide();
						var id = $(parent).hasClass('child') ? $(parent).attr('data-parent'): $(parent).attr('data-id');

						$("form#reply_thread").slideUp('fast', function() {
							$('.reply-overlay').show();
						});

						$("#post_"+id).find('.linke-by').hide();
						$("#post_"+id).find('.form-reply').css({'display':'block'}).animate({'height':'277px','opacity':'1','filter':'alpha(opacity:100)'},500);

						var editorId = $("#post_"+id).find('.form-reply textarea[name=post_content]').attr('id');

						if(typeof tinymce !== 'undefined') {
					    	tinymce.EditorManager.execCommand("mceAddEditor", false, editorId);
					    	tinymce.activeEditor.execCommand('mceInsertContent', false , newContent);
					    }
						$('body').animate( { scrollTop: $( tinymce.activeEditor.getContainer() ).parent().offset().top } );
					}
				}
			});
		},

		render: function(){

			if( $("#reply_item_template").length > 0 )
				this.template = _.template( $("#reply_item_template").html(), this.model.toJSON() );

			return this.$el.html( this.template );
		},

		isAuth : function(){
			return ForumEngine.app.currentUser.get('id');
		},

		updateReplyCount: function(count){
			this.$('.name .comment .count').html(count);
		},

		// handle changes in event "after login"
		// change avatar after login
		afterAuthorize: function(model){
			var name = model.get("display_name"),
				avatar = model.get("et_avatar");
			if(fe_globals.isConfirm == "0"){
				$("div.profile-account span.name a").text(name);
				$("div.profile-account span.img").html(avatar);
				$("div.login").hide();
				$("div.profile-account").fadeIn("slow");
			}
		},
		afterReport: function(model){
		},
		afterRegister: function(model){
			var name = model.get("display_name"),
				avatar = model.get("et_avatar");
			if(fe_globals.isConfirm == "0"){
				$("div.profile-account span.name a").text(name);
				$("div.profile-account span.img").html(avatar);
				$("div.login").hide();
				$("div.profile-account").fadeIn("slow");
			}
		},

		like: function(){
			// check if is logged in
			// not logged in
			// logged in
			var element = this.$('.like-post').first();
			var view 	= this;
			var likeList = view.$el.find('.user-discuss'),
				likeDiv  = view.$el.find('.linke-by');

			this.model.like({
				beforeSend: function(){
					element.toggleClass('active');
				},
				success: function(resp, model){
					if (resp.success){
						if (resp.data.isLike){
							// update like count
							element.addClass('active');
							element.find('.count').text(resp.data.count);
							// add avatar
							var avatar 	= ForumEngine.app.currentUser.get('et_avatar');
							// var dom 	= $('<li class="me"><img src="' + avatar.thumbnail + '" class="avatar" alt="' + ForumEngine.app.currentUser.get('display_name') + '"/></li>');
							var dom 	= $('<li class="me">' + avatar + '</li>');
							likeList.find('li:first-child').after(dom.hide().fadeIn());
						}
						else {
							element.removeClass('active');
							element.find('.count').text(resp.data.count);
							likeList.find('li.me').fadeOut();
						}

						// if no one like, hide the list
						if ( resp.data.count > 0 ){
							likeList.show();
							likeDiv.show();
							likeDiv.css('visibility', 'visible');
						} else {
							likeList.hide();
							//likeDiv.hide();
						}
						// remove
						view.stopListening(pubsub, 'fe:auth:afterLogin', view.like);
						view.stopListening(pubsub, 'fe:auth:afterRegister', view.like);
					} else {
						//alert(resp.msg);
						pubsub.trigger('fe:showNotice', resp.msg , 'error');
						element.toggleClass('active');
					}
				}
			});
		},

		onLike: function(event){
			event.preventDefault();
			//event.stopPropagation();
			var element = $(event.currentTarget);

			///console.log(element.attr('data-id'));
			//console.log(this.model.get('id'));

			if ( element.attr('data-id') != this.model.get('id') ) return;

			// check if user logged in or not
			var view = this;

			// if user isn't logged in, open login modal
			if ( !this.isAuth() ){
				this.openLogin();

				// assign listening
				view.listenTo(pubsub, 'fe:auth:afterLogin', view.like);
				view.listenTo(pubsub, 'fe:auth:afterRegister', view.like);
				//console.log('start listening event after login');
			}  // perform like
			else {
				this.like();
			}
		},

		onQuote: function(event){
			event.stopPropagation();
			event.preventDefault();
			var quoteContent 	= this.model.get('post_content'), //this.$('.post-display .content').html(),
				element         = $(event.currentTarget),
				id 				= element.attr('data-id'),
				author          = this.$('.post-display > .name .post-author').first().text();

			var currentEditor 	= tinymce.activeEditor;
				if(typeof currentEditor !== "undefined" )
					currentEditor.setContent('');

			var trimQuote = quoteContent ? quoteContent : threadData.post_content;

			if(trimQuote.indexOf("[/quote]") >= 0) {
				trimQuote = trimQuote.split("[/quote]");
				newContent = trimQuote[1].replace(/(<br ?\/?>)*/g,"").replace(/[&]nbsp[;]/gi,"");;
			} else {
				newContent = quoteContent;
			}

			// return false;
			if(id) {
				$('.linke-by').show();
				$('.form-reply').hide();
				$("form#reply_thread").slideUp('fast', function() {
					$('.reply-overlay').show();
				});
				$("#post_"+id).find('.linke-by').hide();
				$("#post_"+id).find('.form-reply').css({'display':'block'}).animate({'height':'277px','opacity':'1','filter':'alpha(opacity:100)'},500);
				// change active editor for reply editor
				var editorId = $("#post_"+id).find('.form-reply textarea[name=post_content]').attr('id');

				if(typeof (tinymce.activeEditor) !== "undefined")
					tinymce.activeEditor.remove();

				if(typeof tinymce !== 'undefined') {
			    	tinymce.EditorManager.execCommand("mceAddEditor", false, editorId);
			    	tinymce.activeEditor.execCommand('mceInsertContent', false , '[quote author="'+author+'"]'+newContent+'[/quote]<p></p>');
			    }
				$('body').animate( { scrollTop: $( tinymce.activeEditor.getContainer() ).parent().offset().top } );

			} else {

				var newContent = '[quote author="'+author+'"]' + threadData.post_content + '[/quote]' + "<p></p>";
				var id = $('.thread-reply textarea[name=post_content]').attr('id');

				$('html, body').animate({ scrollTop: 60000 }, 'slow');

				$('.linke-by').show();
				$('.form-reply').hide();
				$("form#reply_thread").slideDown('fast', function() {
					$('.reply-overlay').hide();
				});

				if(typeof (tinymce.activeEditor) !== "undefined")
					tinymce.activeEditor.remove();

				if(typeof tinymce !== 'undefined') {
			    	tinymce.EditorManager.execCommand("mceAddEditor", false, id);
			    	tinymce.EditorManager.activeEditor.execCommand('mceInsertContent', false , newContent);
			    }
			}


		},
		openReport: function(event){
			event.preventDefault();
			var view = this;
			if( this.isAuth() ){

				var reportModal = ForumEngine.app.getReportModal(this.model);
				reportModal.open(false);

				view.listenTo(pubsub, 'fe:auth:afterReport', function(){
					view.$('.control-report').parent().remove();
				});

			} else {

				event.preventDefault();
				var modal = ForumEngine.app.getLoginModal();
				modal.open(false);

				view.listenTo(pubsub, 'fe:auth:afterLogin');
				view.listenTo(pubsub, 'fe:auth:afterRegister');
			}
		},

		openReplyForm: function(){
			$('.linke-by').show();
			$('.form-reply').hide('fast');

			if(typeof (tinymce.activeEditor) !== 'undefined')
				tinymce.activeEditor.remove();

			$("form#reply_thread").slideUp('fast', function() {
				$('.reply-overlay').show();
			});

			this.$('.linke-by').hide();
			this.$('.form-reply').fadeIn('slow');
			// change active editor for reply editor
			var editorId = this.$('.form-reply textarea[name=post_content]').attr('id');
			if(typeof tinymce !== 'undefined') {
		    	tinymce.EditorManager.execCommand("mceAddEditor", false, editorId);
		    	tinymce.activeEditor.execCommand('mceSetContent', false , '');
		    }
		},

		onOpenReplyForm: function(event){
			event.preventDefault ? event.preventDefault() : event.returnValue = false;
			// check if user logged in or not
			var view = this;

			// if user isn't logged in, open login modal
			if ( !this.isAuth() ){
				this.openLogin();

				// assign listening
				view.listenTo(pubsub, 'fe:auth:afterLogin', view.openReplyForm);
				view.listenTo(pubsub, 'fe:auth:afterRegister', view.openReplyForm);
			}  // perform like
			else {
				this.openReplyForm();
			}
		},

		onCancelReplyForm: function(event){
			event.preventDefault();
			var id = $(this).attr('data-target');
			var view = this;
			this.$('.form-reply').fadeOut('normal', function(){
				view.$('div.linke-by').show();
			});
		},

		// open modal login
		openLogin: function(){
			// get login modal
			var modal = ForumEngine.app.getLoginModal();
			// open modal
			modal.open(false);
		},
		ajaxReply: function(event){
			event.preventDefault();
			var element 	= $(event.currentTarget);
			var textarea 	= element.find('textarea[name=post_content]');
			var view 		= this;

			if(ForumEngine.app.currentUser.get('register_status') == "unconfirm"){
				pubsub.trigger('fe:showNotice', fe_front.texts.confirm_account , 'error');
				return false;
			}

			if (tinymce.get(textarea.attr('id'))){
				content = tinymce.get(textarea.attr('id')).getContent();
			} else {
				content = textarea.val();
			}

			if(($.trim(content)).length==0 || content == '' || /^(?:\s|<br *\/?>)*$/.test(content)) {
				pubsub.trigger('fe:showNotice', fe_front.form_login.error_msg , 'warning');
				return false;
				$(this).find(':submit').prop('disabled', false);
			} else {
				$(this).find(':submit').prop('disabled', true);
			}

			this.model.reply(content, {
				beforeSend: function(){
					element.find('input.btn').prop('disabled',true);
				},
				success: function(resp, model){
					if ( resp.success ){
						var container 	= view.$('.reply-children .replies-container');
						var subView 	= new ForumEngine.Views.PostListItem({ model: resp.data.reply, el: resp.data.reply.html });
						new listReplyItem({el: subView.$el});
						view.subReplies.push( subView  );

						container.append(subView.$el);
						SyntaxHighlighter.highlight();
						// open container
						if (container.is(':hidden'))
							container.parent().removeClass('collapse');

						//
						if ( !resp.data.load_more ){
							view.$('.btn-more-reply').hide();
						}

						//reset current active TinyMCE after reply
						tinymce.activeEditor.execCommand('mceSetContent', false , '');

						// update count
						var old = parseInt(view.$('.name .comment .count').html());
						view.$('.name .comment .count').html(old + 1);
					}
				},
				complete: function(){
					element.find('input.btn').prop('disabled',false);
				}
			});
			hasChange = false;
		},

		showReplies: function(event){
			var element 	= $(event.currentTarget);
			var target 		= $(element.attr('href'));
			var view 		= this;
			var id 			= this.model.get('id');

			event.preventDefault();
			if(!element.hasClass('clicked')){
				element.addClass('clicked');
				// if no replies in container yet, fetch some
				if ( target.find('.replies-container .items-thread').length == 0 ){
					var page 		= this.page ? this.page : 1 ;
					view.fetchReplies({paged: page}, {
						beforeSend: function(){
							element.parent().toggleClass('loading');
						},
						success: function(resp){
							if ( resp.data.total_pages > 0 ){
								// display container
								//target.toggleClass('collapse');
							}
						},
						complete: function(resp){
							element.parent().toggleClass('loading');
						}
					}); // end fetchreplies
				} else {
					target.find('.replies-container .items-thread').slideDown();
				}
			}else {
				target.find('.replies-container .items-thread').slideUp();
				element.toggleClass('clicked');
			}
		},

		moreReplies : function(event){
			event.preventDefault();
			var view = this;
			var buttonMore 	= view.$('.btn-more-reply');

			view.fetchReplies({paged: this.page + 1}, {
				beforeSend: function(){
					$(buttonMore).loader('load');
				},
				complete: function(){
					$(buttonMore).loader('unload');
				}
			}); // end fetchreplies
		},

		fetchReplies : function(data, options){
			var view 		= this;
			var container 	= view.$('.replies-container');
			var buttonMore 	= view.$('.btn-more-reply');
			var loading 	=  $('<div class="loading">Loading...</div>');

			options = options || {};

			var success 	= options.success	|| function(){};
			var beforeSend 	= options.beforeSend || function(){};
			var complete 	= options.complete 	|| function(){};

			var params = {
				url 	: fe_globals.ajaxURL,
				type 	: 'post',
				data 	:   {
					action : 'et_fetch_replies',
					content : {
						reply_parent 	: this.model.get('id'),
						paged 			: 1
					}
				},
				beforeSend: function (){
					beforeSend();
				},
				success: function(resp){
					if (resp.success){
						loading.remove();

						// add content
						_.each( resp.data.replies, function(element){
							//var subReplyModel 	= new ForumEngine.Models.Post(element);
							var subReplyView  	= new ForumEngine.Views.PostListItem({model: element, el: element.html});
							new listReplyItem({el: subReplyView.$el});
							view.subReplies.push( subReplyView );
							container.append(subReplyView.$el);
						} );

						// verify pagination
						if ( resp.data.current_page < resp.data.total_pages ){
							view.page = resp.data.current_page;

							if(buttonMore.hasClass('hide')) buttonMore.removeClass('hide');

							buttonMore.show();
						} else {
							buttonMore.hide();
						}
					} else {
						//console.log('fetch fail');
					}

					success(resp);
				},
				complete: function(){
					complete();
				}
			};
			var data 	= $.extend( params.data.content, data );

			return $.ajax(params);
		},

		onOpenEdit: function(event){
			event.stopPropagation();
			event.preventDefault();

			if( $("form#reply_thread").is(':visible') ){
				$("form#reply_thread").slideUp('fast', function() {
					$('.reply-overlay').show();
				});
			}

			$('.form-reply').hide();
			$('.post-edit').css('display', 'none');

			if(typeof (tinymce.activeEditor) !== "undefined")
				tinymce.activeEditor.remove();

			$('.post-display').show();
			$('.control-thread').removeClass('hide');
			var element 	= $(event.currentTarget),
				view  		= this,
				contentArea = view.$('.post-display'),
				target 		= view.$el.find('.post-edit').last(),
				control  	= this.$('.control-thread'),
				editorId 	= target.find("textarea").attr('id');
			var content_editor = target.find("textarea").val();
			if(typeof(view.model.get('post_content')) === 'undefined'){
				view.model.set('post_content', content_editor);
			}
			contentArea.fadeOut('normal', function(){
				if(typeof tinymce !== 'undefined' && !tinymce.EditorManager.get( editorId )) {
			    	tinymce.EditorManager.execCommand("mceAddEditor", false, editorId );
			    	tinymce.EditorManager.get( editorId ).setContent(view.model.get('post_content'));
					tinymce.activeEditor.selection.select(tinymce.activeEditor.getBody(), true);
					tinymce.activeEditor.selection.collapse(false);
			    }
				target.fadeIn();
		    	tinymce.activeEditor.execCommand('mceAutoResize');
				control.addClass('hide');
			});
		},

		onCancelEdit: function(event){
			event.stopPropagation();
			event.preventDefault();
			this.closeEdit();
			$('.linke-by').show();
		},

		closeEdit: function(){
			var view  		= this,
				contentArea = view.$('.post-display'),
				target 		= view.$('.post-edit'),
				control  	= view.$('.control-thread');

			target.fadeOut('normal', function(){
				contentArea.fadeIn(function(){
					if(typeof (tinymce.activeEditor) !== "undefined")
						tinymce.activeEditor.remove();
				});
				$('.control-thread').removeClass('hide');
			});
		},

		onSubmitEdit: function(event){
			event.stopPropagation();
			event.preventDefault();

			var view 		= this;
			var form 		= $(event.currentTarget);
			var data 		= form.serializeObject();
			var textareaId 	= form.find('textarea').attr('id');
			var button 		= form.find("input.btn");
			if (tinymce.get(textareaId)){
				data.post_content = tinymce.get(textareaId).getContent();
				view.model.set('post_content', data.post_content);
			}
			view.model.update( data, {
				beforeSend: function(){
					//console.log(data);
					//button.prop('disabled', true);
					button.button('loading');
				},
				success: function(resp, model){
					//button.prop('disabled', false);
					button.button('reset');
					if(resp.success){
						var contentView = view.$el.find('.post-display > .content').first();
						contentView.html(resp.data.posts.content_html);

						view.trigger('fe:post:afterEdit', resp.data.posts);

						$("div#thread_preview").fadeOut();
						SyntaxHighlighter.highlight();
						//render zoom image
						$('.fe-zoom').magnificPopup({type:'image'});
						new listReply();
						// fade cancel
						view.closeEdit();
						$('.linke-by').show();
						hasChange = false;
					} else {
						pubsub.trigger('fe:showNotice', resp.msg , 'error');
					}
				}
			});
			hasChange = false;
		}
	});

	/**
	 * Handle threads list in an archive page
	 */
	ForumEngine.Views.ListThread 	= Backbone.View.extend({
		initialize: function(){
			var elements 	= this.$el.children('li.thread-item');
			this.views 		= [];
			$(elements).each(function(){
				new ForumEngine.Views.ListThreadItem({el: this});
			});
		}
	});

	/**
	 * Handle thread list item in an archive page
	 */
	ForumEngine.Views.ListThreadItem = Backbone.View.extend({
		tagName: 'li',
		className: 'thread-item',
		events: {
			'click .delete-thread' 			: 'onDeleteThread',
			'click .close-thread' 			: 'onCloseThread',
			'click .unclose-thread' 		: 'onCloseThread',
			'click .approve-thread' 		: 'onApproveThread',
			'click .act-undo' 				: 'onUndoAction',
			'click .sticky-thread' 			: 'onSticky',
			'click .sticky-thread-home' 	: 'onStickyHome',
		},

		//template: _.template( $('#thread_loop_template').html() ),

		initialize: function(){

			// if( $('#thread_loop_template').length > 0 )
			// 	this.template = _.template( $('#thread_loop_template').html() );

			var id = $(this.$el).attr('data-id');
			if ( id ){
				this.thread = new ForumEngine.Models.Post({id : id});
			}
			//console.log(this.thread);
		},

		// render: function(){
		// 	this.$el.html(this.template(this.thread.toJSON()));
		// 	return this;
		// },

		syncingParams: function(){
			var view = this;
			return {
				beforeSend: function(){
					$(view.$el).loader('load');
				},
				complete: function(){
					$(view.$el).loader('unload');
				}
			};
		},

		onDeleteThread: function(event){
			event.preventDefault();
			var view = this;
			var params = $.extend( this.syncingParams(), {
				success: function(resp, model){
					if (resp.success){
						//$(view.$el).fadeOut('normal', function(){ view.remove() });
						view.showUndoAction()
						$("span#num_pending").text(parseInt($("span#num_pending").text())-1);
						pubsub.trigger('fe:showNotice', resp.msg , 'success');
					} else {
						pubsub.trigger('fe:showNotice', resp.msg , 'error');
					}
				}
			} );
			this.thread.onDelete(params);
		},

		onCloseThread: function(event){
			event.preventDefault();
			var view = this;
			var params = $.extend( this.syncingParams(), {
				success: function(resp, model){
					if ( resp.success ){
						if ( resp.data.new_status == 'closed' ){
							//alert('Closed successfully');
							pubsub.trigger('fe:showNotice', resp.msg , 'success');
							view.$('.title a').append('<span class="icon" data-icon="("></span>');
						}
						else {
							//alert('Unclosed successfully');
							pubsub.trigger('fe:showNotice', resp.msg , 'success');
							view.$('.title a .icon').remove();
						}
						view.$('.control-thread-group a.close-thread').toggleClass('collapse');
						view.$('.control-thread-group a.unclose-thread').toggleClass('collapse');
					}
				}
			} );
			this.thread.close(params);
		},

		// under construction
		onStickyThread: function(event){
			event.preventDefault();
			var params = $.extend( this.syncingParams(), {
				success: function(resp, model){
					if (resp.success){
						pubsub.trigger('fe:showNotice', resp.msg , 'success');
					} else {
						pubsub.trigger('fe:showNotice', resp.msg , 'error');
					}
				}
			} );
			this.thread.sticky(params);
		},

		// on approve thread
		onApproveThread: function(event){
			event.preventDefault();
			var view 	= this;
			var params 	= $.extend( this.syncingParams(), {
				success: function(resp, model){
					if (resp.success){
						//$(view.$el).fadeOut('normal', function(){ view.remove() });
						// display undo action
						view.showUndoAction();

						$("span#num_pending").text(parseInt($("span#num_pending").text())-1);
						pubsub.trigger('fe:showNotice', resp.msg , 'success');
					} else {
						pubsub.trigger('fe:showNotice', resp.msg , 'error');
					}
				}
			} );
			this.thread.approve(params);
		},

		onUndoAction: function(event){
			event.preventDefault();
			var view 	= this;
			var params 	= $.extend( this.syncingParams(), {
				success: function(resp, model){
					if (resp.success){
						//$(view.$el).fadeOut('normal', function(){ view.remove() });
						// display undo action
						view.hideUndoAction();

						$("span#num_pending").text(parseInt($("span#num_pending").text())+1);
						pubsub.trigger('fe:showNotice', resp.msg , 'success');
					} else {
						pubsub.trigger('fe:showNotice', resp.msg , 'error');
					}
				}
			} );
			this.thread.undoStatus(params);
		},

		showUndoAction: function(){
			var view = this;
			//this.$el.fadeOut('normal', function(){
				view.$('.user-action').hide();
				view.$('.control-thread-group').hide();
				view.$('.undo-action').removeClass('hide').show();
			//	view.$el.fadeIn();
			//});
		},

		hideUndoAction: function(){
			var view = this;
			//this.$el.fadeOut('normal', function(){
				view.$('.undo-action').hide();
				view.$('.control-thread-group').show();
				view.$('.user-action').removeClass('hide').show();
			//	view.$el.fadeIn();
			//});
		},

		onSticky: function(event){
			event.preventDefault();
			var view 			= this;
			var stickyBtn 		= view.$('.sticky-thread');
			var stickyHomeBtn 	= view.$('.sticky-thread-home');
			var params 	= $.extend( this.syncingParams(), {
				success: function(resp, model){
					if (resp.success){
						pubsub.trigger('fe:showNotice', resp.msg , 'success');

						if ( resp.data.sticky ){
						} else {
							stickyHomeBtn.removeClass('active');
						}
						stickyBtn.toggleClass('active');
						stickyHomeBtn.animate({width: 'toggle'});
					} else {
						pubsub.trigger('fe:showNotice', resp.msg , 'error');
					}
				}
			} );
			this.thread.sticky(params);
		},

		onStickyHome: function(event){
			event.preventDefault();
			var view 			= this;
			var stickyBtn 		= view.$('.sticky-thread');
			var stickyHomeBtn 	= view.$('.sticky-thread-home');
			var params 	= $.extend( this.syncingParams(), {
				success: function(resp, model){
					if (resp.success){
						pubsub.trigger('fe:showNotice', resp.msg , 'success');

						stickyHomeBtn.toggleClass('active');
					} else {
						pubsub.trigger('fe:showNotice', resp.msg , 'error');
					}
				}
			} );
			this.thread.stickyHome(params);
		},

	});

	/**
 	 * Present modal view
	 */
	if ( typeof(ForumEngine.Views.Modal) == 'undefined' ){
		ForumEngine.Views.Modal = Backbone.View.extend({
			initialize: function(){	},
			open: function(){ this.$el.modal('show'); },
			close: function(){ this.$el.modal('hide'); }
		});
	}

	if ( typeof( ForumEngine.Views.LoginModal ) == 'undefined' ){
		ForumEngine.Views.LoginModal = ForumEngine.Views.Modal.extend({
			options: {
				enableRefresh : true
			},
			events: {
				'submit #form_login' 	: 'onLogin',
				'submit #form_register' : 'onRegister',
				'submit #form_forget' 	: 'onForgotPass',
			},
			initialize: function(){
				//console.log('modal init');
				ForumEngine.Views.Modal.prototype.initialize.call();
			},
			onLogin: function(event){
				event.preventDefault();
				var element 	= $(event.currentTarget),
					button 		= element.find("button.btn");
				var data 		= element.serializeObject();
				var view 		= this;
				var options 	= {
					beforeSend: function(){
						//button.prop('disabled', true);
						button.button('loading');
					},
					success: function(resp, model){

						if(resp.success){
							view.trigger('response:login', resp);
							pubsub.trigger('fe:response:login', model);
							pubsub.trigger('fe:showNotice', resp.msg , 'success');

							view.$el.on('hidden.bs.modal', function(){
								pubsub.trigger('fe:auth:afterLogin', model);
								view.trigger('afterLogin', model);
								if ( view.options.enableRefresh == true){
									window.location.reload(true);
								} else {
									//console.log('dont refresh page')
								}

							});

							view.close();
						} else {
							if ( typeof resp.banned != 'undefined' && resp.banned == true ){
								//
								var errorMsg = $('<div class="msg msg-error">');

								errorMsg.html(resp.msg);
								view.$('.login-fr').prepend(errorMsg);

							} else {
								pubsub.trigger('fe:showNotice', resp.msg , 'error');
								view.close();
							}
						}
					},

					complete: function(){
						//button.prop('disabled', false);
						button.button('reset');
					}
				}
				this.login_validator	= $('form#form_login').validate({
					rules	: {
						user_name	: "required",
						user_pass	: "required"
					},
					messages	: {
						user_name	: fe_front.form_login.error_msg,
						user_pass	: fe_front.form_login.error_msg
					},
					highlight: function(element, errorClass) {
						$(element).parent().addClass('error');
						$(element).parent().find('span.icon').show();
					},
					unhighlight: function(element, errorClass) {
						$(element).parent().removeClass('error');
						$(element).parent().find('span.icon').hide();
						//$(element).parent().find('span.line-correct').show();
					},
				});

				if(this.login_validator.form()){
					ForumEngine.app.login(data.user_name, data.user_pass, options);
				}

			},
			open: function(enableRefresh){
				//var enableRefresh = enableRefresh || true;
				if ( typeof enableRefresh == 'undefined' )
					this.options.enableRefresh = true;
				else
					this.options.enableRefresh = enableRefresh;


				//console.log('Enable refresh: ' + this.options.enableRefresh);
				this.$el.modal('show');
			},
			onForgotPass: function(event){
				event.preventDefault();
				var element 	= $(event.currentTarget),
					button 		= element.find("button.btn"),
					data 		= element.serializeObject(),
					view 		= this,

					options 	= {
						dataType	: 'json',
						url			: fe_globals.ajaxURL,
						type: 'POST',
						data: {
							action: 'et_user_sync',
							method: 'forgot',
							user_login: data.user_login
						},

						beforeSend: function(){
							//button.prop('disabled', true);
							button.button('loading');
						},

						success: function(resp){
							if(resp.success){
								pubsub.trigger('fe:showNotice', resp.msg , 'success');

							} else {
								pubsub.trigger('fe:showNotice', resp.msg , 'error');
							}
							view.close();

							$(".login-modal").fadeIn();
							$(".forget-modal").hide();
							$("#form_forget")[0].reset();
						},

						complete: function(){
							//button.prop('disabled', false);
							button.button('reset');
						}
					};
				//validate forgot form
				this.forgotpass_validator	= $('form#form_forget').validate({
					rules	: {
						user_login :{
							required	: true,
							email	: true
						}
					},
					messages: {
					    user_login: {
							required	: fe_front.form_login.error_msg,
							email	: fe_front.form_login.error_email
						}
					},
					highlight: function(element, errorClass) {
						$(element).parent().addClass('error');
						$(element).parent().find('span.icon').show();
						//$(element).parent().find('span.line-correct').hide();
					},
					unhighlight: function(element, errorClass) {
						$(element).parent().removeClass('error');
						$(element).parent().find('span.icon').hide();
						//$(element).parent().find('span.line-correct').show();
					},
				});

				if(this.forgotpass_validator.form()){
					$.ajax(options);
				}

			},
			onRegister: function(event){
				event.preventDefault();
				var element 	= $(event.currentTarget),
					button 		= element.find("button.btn");
				var data 		= element.serializeObject();
				var view 		= this;
				var options 	= {
					beforeSend: function(){
						//button.prop('disabled', true);
						button.button('loading');
					},

					success: function(resp, model){
						if(resp.success){
								view.trigger('response:register', resp);
								pubsub.trigger('fe:showNotice', resp.msg , 'success');
							view.$el.on('hidden.bs.modal', function(){
								pubsub.trigger('fe:auth:afterRegister', model);
								if ( view.options.enableRefresh == true){
									if(fe_globals.isConfirm == "0")
										window.location.reload(true);
								} else {
									//console.log('dont refresh page')
								}

							});
						} else {
							pubsub.trigger('fe:showNotice', resp.msg , 'error');
						}

						view.close();
					},

					complete: function(){
						//button.prop('disabled', false);
						button.button('reset');
					}
				}

				//validate register form
				this.register_validator	= $('form#form_register').validate({
					rules	: {
						user_name :{
							required	: true,
							username	: true
						},
						email	: {
							required	: true,
							email		: true
						},
						user_pass		: 'required',
						re_pass	: {
							required	: true,
							equalTo		: "#user_pass_register"
						},
						agree_terms: {
							required	: function(element){
								return !$(element).is(':checked');
							}
						}
					},
					messages: {
					    user_name: {
							required	: fe_front.form_login.error_msg,
							username	: fe_front.form_login.error_username
						},
						email : {
							required	: fe_front.form_login.error_msg,
							email		: fe_front.form_login.error_email
						},
						user_pass: fe_front.form_login.error_msg,
						re_pass: {
							required	: fe_front.form_login.error_msg,
							equalTo		: fe_front.form_login.error_repass
						}
					},
					errorPlacement : function(error, element){
						if ( $(element).attr('type') != 'checkbox' ){
							error.insertAfter( element );
						}
					},
					highlight: function(element, errorClass) {
						if ( $(element).attr('type') == 'checkbox' ){
							$(element).next('label').addClass('error-checkbox');
						} else {
							$(element).parent().addClass('error');
							$(element).siblings('span.icon').show();
						}
						//$(element).parent().find('span.line-correct').hide();
					},
					unhighlight: function(element, errorClass) {
						if ( $(element).attr('type') == 'checkbox' ){
							$(element).next('label').removeClass('error-checkbox');
						} else {
							$(element).parent().removeClass('error');
							$(element).siblings('span.icon').hide();
						}
						//$(element).parent().find('span.line-correct').show();
					},
				});

				// var checkbox = $("div.check-agree").find("div.skin-checkbox");

				// if(!checkbox.hasClass('checked')){
				// 	checkbox.css("border","1px solid #e74c3c");
				// }

				if(this.register_validator.form()){
					ForumEngine.app.register(data.user_name, data.email ,data.user_pass, options);
				}

			}
		});
	}
	if ( typeof( ForumEngine.Views.ReportModal ) == 'undefined' ){
		ForumEngine.Views.ReportModal = ForumEngine.Views.Modal.extend({
			events: {
				'submit form#report_form'  : 'submitReport'
			},
			initialize: function(){
				ForumEngine.Views.Modal.prototype.initialize.call();
			},
			setModel : function (model) {
				this.model = model;
			},
			submitReport: function(event){
				event.preventDefault();
				var view 				= this,
					form        		= $(event.currentTarget),
					button      		= form.find('button.btn'),
					message     		= form.find('textarea#txt_report').val(),
					data 				= form.serializeObject(),
					options 	= {

					beforeSend: function(){
						button.button('loading');
					},

					success: function(resp, model){
						$('#reportFormModal').modal('hide');
						if(resp.success){
							pubsub.trigger('fe:showNotice', resp.msg , 'success');
							pubsub.trigger('fe:auth:afterReport');
							view.stopListening(pubsub, 'fe:auth:afterReport');
						} else {
							pubsub.trigger('fe:showNotice', resp.msg , 'error');
						}
						$("form#report_form")[0].reset();
					},

					complete: function(){
						button.button('reset');
					}
				}

				if(message == ""){
					pubsub.trigger('fe:showNotice', "Please enter a message." , 'error');
					$('#contactFormModal').modal('hide');
					return false;
				}
				//console.log(this.model);
				this.model.report(data, options);
				//this.model.reset();
			},

		});
	}

	ForumEngine.Views.UploadImagesModal = ForumEngine.Views.Modal.extend({
			events: {
				'click button.close'   : 'resetUploader',
				'click span.btn-cancel': 'resetUploader',
				'click button#insert'  : 'startUploadImg'
			},
			initialize: function() {
				ForumEngine.Views.Modal.prototype.initialize.call();
				//this.blockUi = new AE.Views.BlockUi();

				var $images_upload = $('#images_upload_container'),
					view = this;

				this.uploader = new ImagesUpload({
					el: $images_upload,
					uploaderID: 'images_upload',
					multi_selection: false,
					unique_names: false,
					upload_later: true,
					filters: [{
						title: "Image Files",
						extensions: 'gif,jpg,png'
					}, ],
					multipart_params: {
						_ajax_nonce: $images_upload.find('.et_ajaxnonce').attr('id'),
						action: 'et_upload_images'
					},

					cbAdded: function(up, files) {
						var i;

						if (up.files.length > 1) {
							while (up.files.length > 1) {
								up.removeFile(up.files[0]);
							}
						}

						for (i = 0; i < up.files.length; i++) {
							$("span.filename").text(up.files[i].name);
						}
					},

					cbUploaded: function(up, file, res) {
						if (res.success) {
							tinymce.activeEditor.execCommand('mceInsertContent', false, "[img]" + res.data + "[/img]");
							$('#uploadImgModal').modal('hide');
							$("span.filename").text(fe_front.texts.no_file_choose);
							up.splice();
							up.refresh();
							up.destroy();
						} else {
							pubsub.trigger('fe:showNotice', res.msg , 'error');
							$('#uploadImgModal').modal('hide');
							$("span.filename").text(fe_front.texts.no_file_choose);
							up.splice();
							up.refresh();
							up.destroy();
							$("button#insert").prop('disabled', false);
						}
					},
					beforeSend: function() {
						$("button#insert").prop('disabled', true);
					},
					success: function() {
						$("button#insert").prop('disabled', false);
					}
				});
			},
			resetUploader: function() {
				this.uploader.controller.splice();
				this.uploader.controller.refresh();
				this.uploader.controller.destroy();
				$("span.filename").text(fe_front.texts.no_file_choose);
			},
			startUploadImg: function(event) {
				event.preventDefault();

				var input = $("input#external_link");

				if (currentUser.ID === 0 && input.val() == "")
					return false;

				if (this.uploader.controller.files.length > 0) {

					hasUploadError = false;
					this.uploader.controller.start();

				} else if (input.val() != "") {

					tinymce.activeEditor.execCommand('mceInsertContent', false, "[img]" + input.val() + "[/img]");
					$('#uploadImgModal').modal('hide');

					this.uploader.controller.splice();
					this.uploader.controller.refresh();
					this.uploader.controller.destroy();

					$("input#external_link").val("");
					$("span.filename").text(fe_front.texts.no_file_choose);
				}
			}
		});

})(jQuery);