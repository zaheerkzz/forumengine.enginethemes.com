(function($){

$(document).ready(function(){
	new singleView();
});

addComment = {
	moveForm: function(element_id, comment_id, type, post_id){
		//console.log(this);
		//console.log(comment_id);

		var formContainer 	= $('#et_respond');
		var element 		= $('#' + element_id);

		element.append(formContainer);
		formContainer.find('input[name=comment_parent]').val(comment_id);
		$('#cancel-comment-reply-link').show();

		return false;
	}
}

var singleView = Backbone.View.extend({
	el		: 'body',
	events 	: {
		'click .comment-reply-link': 'reply',
		'click #cancel-comment-reply-link' : 'cancelReply'
	},
	initialize: function(){
	},
	reply: function(event){
		event.preventDefault();
	},
	cancelReply: function(event){
		event.preventDefault();
		var form 		= $('#et_respond');
		var comments 	= $('#comments');

		comments.after( form );
		form.find('input[name=comment_parent]').val('0');
		$('#cancel-comment-reply-link').hide();
	}
});

})(jQuery);