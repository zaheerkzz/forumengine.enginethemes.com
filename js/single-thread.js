(function($){

	listReply 	= Backbone.View.extend({
		initialize: function(){
			var elements 	= $('div.reply-item');
			this.views 		= [];
			$(elements).each(function(){
				new listReplyItem({el: this});
			});
		}
	});

	listReplyItem = Backbone.View.extend({

		events: {
			'click .control-delete' 	: 'onDeleteReply',
		},

		initialize: function(){
			var id = $(this.$el).attr('data-id');
			if ( id ){
				this.reply = new ForumEngine.Models.Post({id : id});
			}
		},

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

		onDeleteReply: function(event){
			event.stopPropagation();
			event.preventDefault();
			var view = this;
			var params = $.extend( this.syncingParams(), {
				success: function(resp, model){
					if (resp.success){

						var parent = $("#post_"+$(view.$el).attr('data-parent')),
							old = parseInt(parent.find('.name .comment .count').html());
						//console.log("#post_"+$(view.$el).attr('data-parent'));
						parent.find('.name .comment .count').html(old - 1);

						$(view.$el).fadeOut('normal', function(){ view.remove() });
						pubsub.trigger('fe:showNotice', resp.msg , 'success');
					} else {
						pubsub.trigger('fe:showNotice', resp.msg , 'error');
					}
				}
			} );
			this.reply.onDelete(params);
		},
	});

	singleView = Backbone.View.extend({
		el : 'body.single-thread',
		events: {
			// 'mouseup .art-content' 		: 'highlightText',
			// 'click #popover_quote a' 	: 'quote',
			// 'mouseup' 					: 'releasePopover',
			//'click .like-post'			: 'likePost',
			//'click .show-replies' 			: 'showReplies',
			//'click .btn-more-reply' 		: 'moreReplies'
			//'click .fetch-reply' 		: 'fetchReplies'
			'click .goto-reply' 				: 'gotoReply',
			//'click a.reply-overlay' 			: 'openReplyForm',
			'click a.cancel-reply' 				: 'hideReplyForm',
			'click a.delete-thread' 			: 'beforeDoAction',
			'click .thread-infor .tog-follow' 	: 'toggleFollow',
			'submit #reply_thread' 				: 'onReply',
		},

		initialize: function(){
			//render zoom image
			$('.fe-zoom').magnificPopup({type:'image'});
			SyntaxHighlighter.all();
			// reply when click on overlay
			$('.reply-overlay').bind('click', this.openReplyForm );

			//$('.art-content').quote();
			$('.reply-item .content, .item-thread .content').quote({
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

						if(typeof tinyMCE !== 'undefined') {
					    	tinyMCE.execCommand("mceAddEditor", false, id);
					    	tinyMCE.activeEditor.execCommand('mceInsertContent', false , newContent);
					    }
					    //console.log(newContent);
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

						if(typeof tinyMCE !== 'undefined') {
					    	tinyMCE.execCommand("mceAddEditor", false, editorId);
					    	tinyMCE.activeEditor.execCommand('mceInsertContent', false , newContent);
					    }
						$('body').animate( { scrollTop: $( tinyMCE.activeEditor.getContainer() ).parent().offset().top } );
						//console.log(parent);
					}
				}
			});

			// this is how we store replies pages number
			this.replyPages = [];

			// init view
			this.initViews();

			pubsub.on('fe:auth:afterLogin', this.afterLogin);

			this.thread 	= new ForumEngine.Models.Post(currentThread);

			//========== First Infinite Scoll ==========//
			// var loop = parseInt($("#reply_loading").attr('data-check'));
			// if(loop > 1 && $("#reply_loading").attr('data-fetch') != 0){
		 //    	for (var i = 1; i <= loop; i++) {
		 //    		this.getReplies(i);
		 //    	};
			// }
			//========== First Infinite Scoll ==========//

		},
		getReplies:function(page){
			//console.log('test');
			var loading 	= $('body').find('#reply_loading'),
				paged 		= page != null ? page : $('body').find('#current_page').val(),
				parent  	= loading.attr('data-parent'),
				query_default = {
					action		: 'et_post_sync',
					method		: 'scroll',
					content : {
						paged			: paged,
						post_parent		: parent,
						}
				},
				that = this;
			$.ajax({
				url : fe_globals.ajaxURL,
				type : 'post',
				data : query_default,
				beforeSend : function(){
					loading.removeClass('hide');
					$('body').find('#reply_loading').attr('data-fetch', 0);
				},
				error : function(request){
					loading.addClass('hide');
				},
				success : function(response){

					var current_page = response.data.paged,
						max_page_query = response.data.total_pages;
					var container = $('body').find('#replies_list');

					if(response.success){

						$('body').find('#current_page').val(current_page);
						$('body').find('#reply_loading').attr('data-fetch', current_page < max_page_query ? 1 : 0);
						loading.addClass('hide');

						// create new parent reply view and append to list
						_.each( response.data.replies, function(element){
							var subReplyView  	= new ForumEngine.Views.PostListItem({model: element, el: element.html});
							container.append(subReplyView.$el);

							//create new child reply view
							if($(subReplyView.$el).find('.reply-item.child').length > 0){
								$(subReplyView.$el).find('.reply-item.child').each(function(index, el) {
									var child = {id : $(this).attr('data-id'),post_content: $(this).find('.content').html()};
									var child_reply = new ForumEngine.Views.PostListItem({model: child, el: el});
									new listReplyItem({el: el});
								});
							}
							new listReplyItem({el: subReplyView.$el});
						});

						SyntaxHighlighter.highlight();
						//render zoom image
						$('.fe-zoom').magnificPopup({type:'image'});
					} else {

					}
				}
			});
		},

		openReplyForm: function(event){
			var element = $(event.currentTarget);
			element.hide('fast', function() {
				$('.form-reply').css({'display':'none'});
				//console.log($('.form-reply'));
				$('.linke-by').show();
				$("form#reply_thread").slideDown();
				var textareaid = $("form#reply_thread").find('textarea').attr('id');
				if(typeof tinyMCE !== 'undefined') {
			    	tinyMCE.execCommand("mceAddEditor", false, textareaid);
			    	tinyMCE.activeEditor.execCommand('mceSetContent', false , '');
			    }
			});
		},

		hideReplyForm:function(event){
			$("form#reply_thread").slideUp('fast', function() {
				$('.reply-overlay').show();
			});
		},

		beforeDoAction: function(){
			var del = confirm(fe_front.form_thread.delete_thread);
			if(del) return true;
			else return false;
		},
		initViews: function(){
			this.replyViews = [];
			var that = this;

			$('.item-thread').each(function(index){
				var element = $(this);
				var postID 	= element.attr('data-id');
				var model 	= {ID: element.attr('data-id'), id: element.attr('data-id')};

				viewThread = new ForumEngine.Views.PostListItem({
					el: element,
					model: model
				});
				viewThread.on('fe:post:afterEdit', that.afterEdit);
			});

			$('.reply-item').each(function(index){
				var element = $(this);
				var postID 	= element.attr('data-id');
				var model 	= {ID: element.attr('data-id'), id: element.attr('data-id')};
				//console.log(model);

				if ( repliesData )
					model	= repliesData[index];

				view = new ForumEngine.Views.PostListItem({
					el: element,
					model: model
				});
				view.on('fe:post:afterEdit', that.afterEdit);
			});
		},

		/**
		 * Update thread information after
		 */
		afterEdit: function(data){
			// update
			if ( data.post_type == 'thread' ){
				$('.title-thread').text(data.post_title);
				if ( typeof data.thread_category[0] != 'undefined' ){
					$('.thread-information .thread-cat-name').text(data.thread_category[0].name);
					$('.thread-information .times-create').text(data.thread_category[0].update_time_string);
					$('.thread-information .flags')
						.attr('class', '')
						.addClass('flags')
						.addClass('color-' + data.thread_category[0].color);
				}
			}
		},

		afterLogin: function(){
		},

		toggleFollow: function(event){
			event.preventDefault();
			var element = $(event.currentTarget);
			if(ForumEngine.app.currentUser.get('id')){
				ForumEngine.app.currentUser.toggleFollow(this.thread.get('ID'), {
					success: function(resp, model){
						if(resp.success){
							var parent = element.parent();
							if (resp.data.isFollow){
								parent.find('.tog-follow.follow').addClass('collapse');
								parent.find('.tog-follow.unfollow').removeClass('collapse');
							}
							else {
								parent.find('.tog-follow.unfollow').addClass('collapse');
								parent.find('.tog-follow.follow').removeClass('collapse');
							}
							pubsub.trigger('fe:showNotice', resp.msg , 'success');
						} else {
							pubsub.trigger('fe:showNotice', resp.msg , 'error');
						}

					}
				});
			} else {
				pubsub.trigger('fe:showNotice', fe_front.form_thread.login_2_follow , 'warning');
			}
		},

		gotoReply: function(event){
			event.preventDefault();
			var textarea_id = $(event.currentTarget).attr('data-id');
			$('.form-reply').hide('fast',function(){
				$('.linke-by').show('fast');
			});
			if(typeof(tinyMCE.activeEditor) !== "undefined")
				tinyMCE.activeEditor.remove();
			//scroll to form reply
			$('html, body').animate({ scrollTop: $("#reply_thread_container").offset().top }, 'slow');
			//open from reply
			$('.reply-overlay').hide('fast', function() {
				$("form#reply_thread").slideDown();
				tinyMCE.execCommand('mceAddEditor',false , 'post_content'+textarea_id);
				tinyMCE.activeEditor.execCommand('mceSetContent',false,'');
			});
		},

		onReply: function(event){

			var view = this,
				form = $(event.currentTarget),
				button = form.find("input[type='submit']");

			if ( !ForumEngine.app.currentUser.get('id') ){
				event.preventDefault();

				// add modal
				var modalLogin = ForumEngine.app.getLoginModal();
				modalLogin.open(false);

				view.listenTo(pubsub, 'fe:auth:afterLogin', view.replyThread);
				view.listenTo(pubsub, 'fe:auth:afterRegister', view.replyThread);
				view.listenTo(modalLogin, 'response:login', view.updateNonce);
				view.listenTo(modalLogin, 'response:register', view.updateNonce);

			} else {

				if(ForumEngine.app.currentUser.get('register_status') == "unconfirm"){
					pubsub.trigger('fe:showNotice', fe_front.texts.confirm_account , 'error');
					return false;
				}

				// validate
				var content = tinyMCE.activeEditor.getContent();

				if(($.trim(content)).length==0 || content == '' || /^(?:\s|<br *\/?>)*$/.test(content)) {

					pubsub.trigger('fe:showNotice', fe_front.form_login.error_msg , 'warning');
					return false;
					button.prop('disabled', false);

				} else {

					event.preventDefault();
					//=========== ajax insert reply ===========//
					this.thread.reply(content, {
						beforeSend: function(){
							button.button('loading');
						},
						success: function(resp, model){
							if ( resp.success ){
								var container = $('#replies_list');
								var reply     = new ForumEngine.Views.PostListItem({ model: resp.data.reply });

								reply.$el.attr('id', "post_"+ resp.data.reply.ID);
								reply.$el.attr('data-id', resp.data.reply.ID);

								container.append(reply.render());
								SyntaxHighlighter.highlight();
								//render zoom image
								$('.fe-zoom').magnificPopup({type:'image'});

								tinymce.activeEditor.execCommand('mceSetContent', false , '');
							}
						},
						complete: function(){
							button.button('reset');
						}
					});
					hasChange = false;
					//=========== ajax insert reply ===========//
				}
			}
		},

		updateNonce: function(resp){
			$('form#reply_thread input[name=fe_nonce]').val(resp.data.nonce['reply_thread']);
			$("#uploadImgModal").find('span.et_ajaxnonce').attr('id', resp.data.nonce['upload_img']);
			//$("#uploadImgModal").find('span.bg-button-file').attr('id', 'images_upload_browse_button');
			/* update layout form upload img */
			$("#images_upload_container").removeClass('disabled').css('opacity', '1.0');
			$("#images_upload_browse_button").prop('disabled', false);
			$("p.text-danger").addClass('hide');
			/* update layout form upload img */
		},

		replyThread: function(){
			$('form#reply_thread').submit();
		},

		likePost: function(event){
			event.preventDefault();

			var element = $(event.currentTarget);

			var params = {
				url 	: fe_globals.ajaxURL,
				type 	: 'post',
				data: {
					action 	: 'et_toggle_like',
					content : {
						parent_id: element.attr('data-id')
					}
				},
				beforeSend: function(){},
				success: function(resp){
					if ( !resp.success ){
						//alert(resp.msg);
						pubsub.trigger('fe:showNotice', resp.msg , 'error');
					} else {
						element.html(resp.data.label);
					}
				}
			}

			$.ajax(params);
		},

		showReplies: function(event){
			var element 	= $(event.currentTarget);
			var target 		= $(element.attr('href'));
			var view 		= this;
			var container 	= target.find('.replies-container');
			var buttonMore 	= target.find('.btn-more-reply');

			event.preventDefault();

			// display container
			target.toggleClass('collapse');

			// if no replies in container yet, fetch some
			if ( target.find('.replies-container .items-thread').length == 0 ){
				var parentId 	= target.attr('data-id');
				var page 		= target.attr('data-page');
				view.fetchReplies(parentId, page, {
					beforeSend: function (){
						container.html('Loading...');
						buttonMore.hide();
					},
					success: function(resp){
						if (resp.success){
							container.html('');

							// add content
							_.each( resp.data.replies, function(element){
								container.append(element.html);
							} );

							// verify pagination
							if ( resp.data.current_page < resp.data.total_pages ){
								view.replyPages[parentId] = page;
								buttonMore.show();
							} else {
								buttonMore.hide();
							}
						} else {
							//console.log('fetch fail');
						}
					}
				}); // end fetchreplies
			}
		},

		moreReplies: function(event){
			var element 	= $(event.currentTarget);
			var buttonMore 	= element;
			var parentId 	= element.attr('data-id');
			var page 		= this.replyPages[parentId] ? this.replyPages[parentId] : 1;
			var view 		= this;

			if (element.hasClass('disabled')) return false;

			page++;
			this.fetchReplies(parentId, page, {
				beforeSend: function(){
					element.addClass('disabled');
				},
				success: function(resp){
					var container = element.siblings('.replies-container');

					// add content
					_.each( resp.data.replies, function(element){
						container.append(element.html);
					} );

					// verify pagination
					if ( resp.data.current_page < resp.data.total_pages ){
						view.replyPages[parentId] = page;
						buttonMore.show();
					} else {
						buttonMore.hide();
					}
				},
				complete: function(){
					element.removeClass('disabled');
				}
			})
		},

		fetchReplies : function(parentId, page, params){
			var def = {
				url 	: fe_globals.ajaxURL,
				type 	: 'post',
				data 	:   {
					action : 'et_fetch_replies',
					content : {
						reply_parent 	: parentId,
						paged 			: page ? parseInt(page) : 1
					}
				},
			};
			params = $.extend( def, params );
			return $.ajax(params);
		},

		replyTemplate: function(data){
			var template = _.template('<li class="art-content">{{= post_content }}</li>');

			return template(data);
		},

		/**
		 * Quote
		 */
		highlightText: function(event){
			// get selected text
			var selection 		= feHelper.getSelection();

			// find out if selected text is inside proper container
			var insideContainer = $.contains( event.currentTarget, feHelper.getSelectionParent() );

			// if nothing is wrong, display quote popover
			if ( $.trim(selection) && insideContainer ){
				// stop another event
				event.stopPropagation();
				var popup 	= $('<div id="popover_quote><a>'+fe_single.texts.quote+'</a></div>');
				var left  	= event.pageX;
				var top  	= event.pageY;
				var width 	= popup.width();
				var height 	= popup.height();

				$('body').append(popup);

				// show popover
				popup.show().css('left', left - (width/2) ).css('top', top - height - 10);
			}
		},

		quote: function(event){
			event.preventDefault();
			event.stopPropagation();
			var selection = feHelper.getSelection();
			if ($.trim(selection)){
				//alert('you highlight: ' + selection);
				tinymce.get('post_content').setContent('');
				tinymce.get('post_content').selection.setContent(selection);
				tinymce.get('post_content').focus();
			}
		},

		releasePopover: function(event){
			if ( $('#popover_quote').is(':visible') ){
				$('#popover_quote').hide();
			}
		}
	});

	$.fn.quote = function(args){
		var args 		= $.extend({
			selected : function(){}
		}, args);
		var triggerElement = null;


		$(this).each(function(){
			var element = $(this);
			//triggerElement = element;

			element.bind('mouseup', function(event){
				var current = $(event.currentTarget);
				if (event.which == 1) {
					// get selected text
					var selection 		= feHelper.getSelection();

					// find out if selected text is inside proper container
					var insideContainer = $.contains( event.currentTarget, feHelper.getSelectionParent() );

					// if nothing is wrong, display quote popover
					if ( $.trim(selection) && insideContainer ){
						// stop another event
						event.stopPropagation();
						var popup 	= $('<div id="popover_quote" class="quote-pop"><a href="#">'+fe_single.texts.quote+'</a></div>');
						var left  	= event.pageX;
						var top  	= event.pageY;
						var width 	= popup.width();
						var height 	= popup.height();

						$('#popover_quote').remove();
						$('body').prepend(popup);

						triggerElement = current;

						// show popover
						popup.click(function(e){
							e.preventDefault();
							e.stopPropagation();
							var selection = feHelper.getSelection();
							if ($.trim(selection)){
								args.selected(selection, triggerElement);
								$('#popover_quote').remove();
							}
						});
						//default 0 ; - 10
						popup.show().css({
							'position' 	: 'absolute',
							'z-index' 	: '999',
						}).css('left', left - (width/2) - 95 ).css('top', top - height - 40)
					}
				}
			});
		});

		$('body').bind('mouseup', function(event){
			target = event.target;
			if ( $('#popover_quote').is(':visible') && event.which == 1 && !$.contains($('#popover_quote').get(0), target)){
				$('#popover_quote').remove();
			}
		});
	}

	$(document).ready(function(){
		ForumEngine.single = new singleView();
		//========== Infinite Scoll ==========//
		$(window).scroll(function()
		{
		    if( ($(window).scrollTop() == $(document).height() - $(window).height()) && $("#reply_loading").attr('data-fetch') == 1 )
		    {
			    ForumEngine.single.getReplies();
			}

		});
		//========== Infinite Scoll ==========//
		new listReply();
	});

})(jQuery);