(function($){
$(document).ready(function(){
	var select = $('#thread_category').val();
	if(currentUser.ID !=0 ){
		if(currentUser.captcha && currentUser.captcha_cat.length != 0){
		console.log('co');	
			if(currentUser.captcha_cat.indexOf(select)!=-1){
				$("#reCaptcha").show();
			}
			else{
				$("#reCaptcha").hide();
			}
		}
		else{
			$("#reCaptcha").hide();
		}
	}
	else{
		$("reCaptcha").show();
	}
	
	$("input.inp-title").on({
		keyUp: function(){
			hasChange = true;
		},
		change: function(){
			hasChange = true;
		}
	});	

	$('form').submit(function() {
	    $(window).unbind("beforeunload");
	});

	$(window).bind('beforeunload',function() {
		if ( typeof hasChange == "undefined" ) {
			hasChange = false;
		}			
		if(hasChange){
		    return fe_front.form_thread.close_tab;
		}
	});	

	/*
	==========================================================================================================
	Function fix position header
	========================================================================================================== */

	// available fixed windows
	var headertop 	= $('.header-top');
	var start 		= $(headertop).offset().top ? $(headertop).offset().top : 0;
	var filter 		= $('.header-breadcrumbs');
	var start_filter= 0;
	var padding_top = 0;
	if ( filter.length > 0 ) {
		start_filter = $(filter).offset().top;
		padding_top = 30;
	}

	// auto show thread form in 
	$('.auto-form .inp-title').bind('focus', function(event){
		var element 	= $(event.currentTarget);
		var container 	= element.closest('.auto-form');
		var select 		= container.find('.cat-dropdown');
		var bottom 		= container.find('.form-detail');
		var cancel 		= container.find('.cancel');

		if (!container.hasClass('opened')){
			container.addClass('opened');
			select.fadeIn().removeClass('hide');
			bottom.slideDown();
			tinymce.EditorManager.execCommand('mceAddEditor', false , 'post_content');
			//tinymce.activeEditor.execCommand('mceSetContent', false , '');			
			cancel.unbind('click').bind('click', function(event){
				event.preventDefault();
				container.removeClass('opened');				
				select.fadeOut();
				bottom.slideUp();
				//hide preview when cancel button clicked
				$('.skin-checkbox').removeClass('checked');			
				$("div#thread_preview").fadeOut();
				$("ul#main_list_post").fadeIn();
				$("#main_pagination").fadeIn();
				$('.show-preview a').text('Show Preview');				
			});
		}
	});

	$("a#create_first").bind('click', function(event){
		var element 	= $(event.currentTarget);
		var container 	= $('.auto-form');
		var select 		= container.find('.cat-dropdown');
		var bottom 		= container.find('.form-detail');
		var cancel 		= container.find('.cancel');
		var title 		= container.find('.inp-title');

		tinymce.EditorManager.execCommand('mceAddEditor', false , 'post_content');
		//tinymce.activeEditor.execCommand('mceSetContent', false , '');
		
		if (!container.hasClass('opened')){
			title.focus();
			container.addClass('opened');
			select.fadeIn().removeClass('hide');
			bottom.slideDown();
			cancel.unbind('click').bind('click', function(event){
				event.preventDefault();
				container.removeClass('opened');
				select.fadeOut();
				bottom.slideUp();
			});
		}
	});

	// auto render categories dropdown
	$('.thread-form .cat-dropdown').each(function(){
		var element 	= $(this);
		var selector 	= element.find('select');
		var listDropdown = $('<ul>').addClass('dropdown-menu category-select');
		var label 		= element.find('.text-select');
		var i = 0;

		// set default text
		label.html( selector.find('option:selected').text() );

		// build list
		selector.find('option').each(function(){
			var option 		= $(this);
			var listItem 	= $('<li>').text(option.text()).attr('data-value', option.attr('value'));
			// add event for listItem
			listItem.bind('click', function(){
				// $.ajax({
				// 	url: fe_globals.ajaxURL,
				// 	type: 'POST',
				// 	data: {
				// 		action 		: 'fe_check_google_captcha',
				// 		content 	: option.val()
				// 	},
				// 	beforeSend: function(){
				// 		// form.find('button#save').prop('disabled', true);
				// 		// form.find('button#save').css('opacity', '0.7');
				// 	},
				// 	success: function(resp){
				// 		if(resp.success){
				// 			if(ForumEngine.app.currentUser.get('captcha')){
				// 				//console.log('co');
				// 				$("#reCaptcha").show();
				// 			}
				// 			else{
				// 				$("#reCaptcha").hide();
				// 			}
				// 		}
				// 		else{
				// 			$("#reCaptcha").hide();
				// 		}		
				// 	},
				// });
				if(currentUser.ID != 0 && currentUser.captcha){
					if( option.val() == ''){
						$("#reCaptcha").hide();
					}
					else{
						if(currentUser.ID !=0){
							if(currentUser.captcha_cat.indexOf(option.val())!=-1){
								$("#reCaptcha").show();
							}
							else{
								$("#reCaptcha").hide();
							}
						}
					}
				}
				else{
					$("reCaptcha").hide();
				}
				selector.val($(this).attr('data-value'));
				label.text($(this).text());
				$("#thread_preview span.type-category").html('<span class="flags color-2"></span>'+ option.text());
			});
			if(i>0) {
				listDropdown.append(listItem);
			}
			i++;
		});

		// add list to 
		if ( !selector.next().is('ul') ){
			selector.after(listDropdown);
		}
	});
	/*tool tip */
	$('body').tooltip({
	      selector: "a[data-toggle=tooltip]"
	 });
	/*show drop profile */
	$(".profile-account").click(function(){
		if($(".profile-account .name").hasClass('active')){
			$(".profile-account .name").removeClass('active');

		}
		else{
			$(".profile-account .name").addClass('active');
		}
		var popup = $(".dropdown-profile");
		if ( !popup.hasClass('opened') ){
			popup.addClass('opened');
			popup.fadeIn('normal', function(){
				var $this = this;

				$('body').bind('click', function(e){
					if ( !$.contains($this, e.target) && popup.hasClass('opened') ){
						popup.fadeOut().removeClass('opened');
						$('body').unbind('click');
					}
				});
			});
		}
	});
	/* Handle Thread Preview */

	//Thread title
	$("input#thread_title").keyup(function(){
		$("span#preview_title a ").text($(this).val());
	});

	$('.skin-checkbox').click(function(){
		var id = document.getElementById('show_topic_item');		
		if($(this).hasClass('checked'))
		{
			$(this).removeClass('checked');			
			id.checked = 0;
		}
		else
		{
			$(this).addClass('checked');			
			id.checked = 1;
			
		}
	});

	$('.show-preview a').click(function(e){
		//alert('mmm');
		e.preventDefault();
		var id = document.getElementById('show_topic_item');		
		if($('.skin-checkbox').hasClass('checked'))
		{
			$('.skin-checkbox').removeClass('checked');			
			id.checked = 0;
			$("div#thread_preview").fadeOut();
			$("ul#main_list_post").fadeIn();
			$("#main_pagination").fadeIn();
			$(".notice-noresult").fadeIn();
			$(this).text(fe_front.texts.show_preview);
		}
		else
		{
			$('.skin-checkbox').addClass('checked');			
			id.checked = 1;
			$("div#thread_preview").fadeIn();
			$("ul#main_list_post").fadeOut();
			$("#main_pagination").fadeOut();
			$(".notice-noresult").fadeOut();
			$(this).text(fe_front.texts.hide_preview);
		}
	});

	$('.check-agree a').click(function(){
		//alert('mmm');
		var id = document.getElementById('agree_terms');		
		if($('.check-agree .skin-checkbox').hasClass('checked'))
		{
			$('.check-agree .skin-checkbox').removeClass('checked');			
			id.checked = 0;
		}
		else
		{
			$('.check-agree .skin-checkbox').addClass('checked');			
			id.checked = 1;
			
		}
	});


	$('input.input-script').change(function(){
		var file = $(this);
		var filename = file.val();

		filename = filename.replace("C:\\fakepath\\", "");

		file.css({'opacity':0}).next(".filename").html( filename );
	});

	$(".input-file .button").click(function(){

		$(".input-file input.input-script").trigger("click");

	});


	$("form#form_register").submit(function() {
		if($(this).find('input.form-control').hasClass('error')){
			$(this).find('div.col-lg-10').addClass('error');
		} else {
			$(this).find('div.col-lg-10').removeClass('error');
		}
	});

	/* Validate Form create new thread + form reply */
	$(".bnt_forget").click(function(event){		
		event.preventDefault();
		$(".login-modal").fadeOut(0);
		$(".forget-modal").fadeIn();
	});

	$(".forget-modal .modal-header button.close").click(function(){		
		$(".login-modal").fadeIn();
		$(".forget-modal").fadeOut(0);
	});	

	$(".search-header .btn-mobile").click(function(){
		$(".search-header input[type='text']").fadeIn("slow");
		$(this).css({"display":"none"});
	});
	// ==============  Hide element wplink form ============== //
	$('#wp-link-wrap input#link-target-checkbox').prop('checked', true);
	$('.link-target').hide();
	$('#wp-link-wrap p.howto').remove();
	$('#wp-link-wrap #search-panel').remove();
	
	if(!$('#wp-link-wrap').hasClass('search-panel-visible'))
		$('#wp-link-wrap').addClass('search-panel-visible');

	$('#wp-link-cancel a').prepend('<span class="icon" data-icon="D"></span>&nbsp;')
	// ==============  Hide element wplink form ============== //
	// ================== HEART BEAT ================== //
	function send_popup( title, text, popup_class, delay ) {
		
		// Initialize parameters
		title = title !== '' ? '<span class="title">' + title + '</span>' : '';
		text = text !== '' ? text : '';
		popup_class = popup_class !== '' ? popup_class : 'update';
		delay = typeof delay === 'number' ? delay : 10000;
		
		var object = $('<div/>', {
		    class: 'notification ' + popup_class,
		    html: title + text + '<span class="close"><i class="fa fa-times"></i></span>'
		});
		
		$('#popup_container').prepend(object);
		
		$(object).hide().fadeIn(500);
		//$('html, body').animate({ scrollTop: 60000 }, 'slow'); 
		
		setTimeout(function() {
			
			$(object).fadeOut(500);	

		}, delay);
	
	}
	
	$('<div/>', { id: 'popup_container' } ).appendTo('body');
	$('body').on('click', 'span.close', function () { $(this).parent().fadeOut(200); });	

	var check;
	
    $(document).on( 'heartbeat-tick', function( e, data ) {
        
		//console.log(data);
        
        if ( !data['message'] )
        	return;

		$.each( data['message'], function( index, notification ) {
			if ( index != check ){
				send_popup( notification['title'], notification['content'], notification['type'] );
			}
			check = index;
		});
        
    });
	// ================== HEART BEAT ================== //
});
})(jQuery);