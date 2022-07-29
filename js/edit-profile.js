(function($){
	$(document).ready(function(){
		var $user_logo = $('#user_logo_container');

		this.logo_uploader	= new ImagesUpload({
			el					: $user_logo,
			uploaderID			: 'user_logo',
			multipart_params	: {
				_ajax_nonce	: $user_logo.find('.et_ajaxnonce').attr('id'),
				action		: 'et_user_sync',
				author		: $user_logo.find('#user_id').attr('user-data'),
				method		: 'change_logo'
			},
			cbUploaded		: function(up,file,res){
				$user_logo.find('img.avatar').css('opacity', '1.0');
				if(res.success){
					pubsub.trigger('fe:showNotice', res.msg , 'success');
				} else {
					pubsub.trigger('fe:showNotice', res.msg , 'error');
				}				
			},
			beforeSend		: function(element){
				$user_logo.find('img.avatar').css('opacity', '0.3');
			},
			success : function(resp){

			}
		});

		$('.hide-info a').click(function(e){
			e.preventDefault();
			if($('.checkbox-hide').hasClass('checked'))
			{
				$('.checkbox-hide').removeClass('checked');			
				$("input#hide_info").val("0");
				//console.log('0');
			} else {
				$('.checkbox-hide').addClass('checked');			
				$("input#hide_info").val("1");
			}
		});

		$('.profile-input-url').focusin(function(e){
			var element 	= $(e.currentTarget);
			var val 		= element.val();
			var isProper 	= val.indexOf('http://') != 0 || val == '' || val == element.attr('placeholder');
			if ( isProper ){
				if ( val == element.attr('placeholder') ) val = '';
				element.val( 'http://' + val );
			}
		}).focusout(function(e){
			var element 	= $(e.currentTarget);
			var val 		= element.val();

			if ( val == 'http://' ){
				element.val('');
			}
		});

		edit_profile_validator	= $('form#edit_profile').validate({
			rules	: {
				display_name: 'required',
				user_facebook: {
					url		: true
				},
				user_twitter: {
					url		: true
				},
				user_gplus: {
					url		: true
				},
				user_email	: {
					required	: true,
					email		: true
				},
			},
			messages: {
			    user_facebook: {
					url		: fe_front.form_login.error_url						
				},
			    user_twitter: {
					url		: fe_front.form_login.error_url						
				},
			    user_gplus: {
					url		: fe_front.form_login.error_url						
				},
				user_email : {
					required	: fe_front.form_login.error_msg,
					email		: fe_front.form_login.error_email						
				},
				display_name: fe_front.form_login.error_msg	
			},
			highlight: function(element, errorClass) {
				$(element).parent().addClass('error');
				$(element).parent().find('span.icon').show();
			},
			unhighlight: function(element, errorClass) {
				$(element).parent().removeClass('error');
				$(element).parent().find('span.icon').hide();
			},				
		});	
		change_password_validator	= $('form#change_pass').validate({
			rules	: {
				old_pass : 'required',
				new_pass : 'required',
				re_pass: {
					required	: true,
					equalTo		: "#new_pass"
				},
			},
			messages: {

				old_pass : fe_front.form_login.error_msg,
				new_pass : fe_front.form_login.error_msg,
				re_pass: {
					required	: fe_front.form_login.error_msg,
					equalTo		: fe_front.form_login.error_repass
				}
			},
			highlight: function(element, errorClass) {
				$(element).parent().addClass('error');
				$(element).parent().find('span.icon').show();
			},
			unhighlight: function(element, errorClass) {
				$(element).parent().removeClass('error');
				$(element).parent().find('span.icon').hide();
			},				
		});

		$('form#change_pass').submit(function(event) {
			event.preventDefault();
			if(change_password_validator.form()){
				$.ajax({
					url: fe_globals.ajaxURL,
					type: 'POST',
					data: {
						action: 'et_user_sync',							
						method: 'change_pass',
						content: {
							old_pass: $('form#change_pass').find("input#old_pass").val(),
							new_pass: $('form#change_pass').find("input#new_pass").val(),
							re_pass: $('form#change_pass').find("input#re_pass").val(),
						}
					},
					beforeSend:function(){
						$('form#change_pass').find("input.btn").prop('disabled', true);
					},
					success:function(resp){
						if(resp.success){
							pubsub.trigger('fe:showNotice', resp.msg , 'success');
							window.location.href = resp.redirect_url;
						} else {
							pubsub.trigger('fe:showNotice', resp.msg , 'error');
						}
					},
					complete:function(){
						$('form#change_pass').find("input.btn").prop('disabled', false);
					},
				});
			}			
		});

	});
})(jQuery);