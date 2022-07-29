(function($){

$(document).ready(function(){
	new ForumEngine.Views.CreatePass();
});

ForumEngine.Views.CreatePass = Backbone.View.extend({
	el: 'body',
	events: {
		'submit #reset_pass': 'onCreatePassword'
	},
	initialize: function(){
			this.resetpass_validator	= $('form#reset_pass').validate({
				rules	: {
					new_pass		: 'required',
					re_pass	: {
						required	: true,
						equalTo		: "#new_pass"
					}
				},
				messages: {
					new_pass: fe_front.form_login.error_msg,
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
	},
	onCreatePassword: function(event){
		event.preventDefault();
		var element 	= $(event.currentTarget),
			button 		= element.find("input.btn"),
			data 		= element.serializeObject();

		$.ajax({
			url: fe_globals.ajaxURL,
			type: 'POST',
			data: {
				action: 'et_user_sync',
				method: 'reset',
				content: data,
			},

			beforeSend: function(){
				//button.prop('disabled', true);
				button.button('loading');
			},	

			success: function(resp){
				if(resp.success){							
					pubsub.trigger('fe:showNotice', resp.msg , 'success');
					window.location.href = resp.data.redirect_url;				
				} else {
					pubsub.trigger('fe:showNotice', resp.msg , 'error');	
				}
			},

			complete: function(){
				//button.prop('disabled', false);
				button.button('reset');
			}			
		});
	}

});

})(jQuery);