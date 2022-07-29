(function($){

$(document).ready(function(){
	AuthorView = new ForumEngine.Views.Author();
});

ForumEngine.Views.Author = Backbone.View.extend({
	el: 'body',
	events: {
		'click #open_contact'  		: 'openContact',
		'submit form#contact_form'  : 'submitContact'
	},
	initialize: function(){
		pubsub.on('fe:auth:afterLogin', this.afterAuthorize);
		pubsub.on('fe:auth:afterRegister', this.afterAuthorize);
		new ForumEngine.Views.ListThread({el : '#main_list_post'});		
	},
	afterAuthorize: function(model){
		var name = model.get("display_name"),
			avatar = model.get("et_avatar");
		$("div.profile-account span.name a").text(name);
		$("div.profile-account span.img").html(avatar);
		$("div.login").hide();
		$("div.profile-account").fadeIn("slow");
		setTimeout(function(){$('#contactFormModal').modal('show');},3000);		
	},
	submitContact: function(event){
		event.preventDefault();
		var view 		= this,
			form        = $(event.currentTarget),
			button      = form.find('button.btn'),
			user_id		= form.find('input#author_id').val(),
			message     = form.find('textarea#txt_contact').val(),
			options 	= {
			beforeSend: function(){
				//button.prop('disabled', true);
				button.button('loading');
			},	

			success: function(resp, model){
				$('#contactFormModal').modal('hide');
				if(resp.success){
					pubsub.trigger('fe:showNotice', resp.msg , 'success');	
				} else {
					pubsub.trigger('fe:showNotice', resp.msg , 'error');						
				}
				$("form#contact_form")[0].reset();
			},

			complete: function(){
				//button.prop('disabled', false);
				button.button('reset');
			}
		}

		if(message == ""){
			pubsub.trigger('fe:showNotice', "Please enter a message." , 'error');
			$('#contactFormModal').modal('hide');
			return false;
		}

		ForumEngine.app.inbox(user_id,message,options);
	},
	openContact: function(event){
		event.preventDefault();
		var view = this;
		if(ForumEngine.app.currentUser.get('id')){

			$('#contactFormModal').modal('show');

		} else {
			event.preventDefault();
			var modal =ForumEngine.app.getLoginModal();
			modal.open(false);
			view.listenTo(pubsub, 'fe:auth:afterLogin');
			view.listenTo(pubsub, 'fe:auth:afterRegister');
		}
	},	
});

})(jQuery);