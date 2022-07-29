window.fbAsyncInit = function() {
	// init the FB JS SDK
	FB.init({
		appId      : facebook_auth.appID,
		status     : true,
		cookie     : true,
		xfbml      : true
	});
};

// Load the SDK asynchronously
(function(d, s, id){
	var js, fjs = d.getElementsByTagName(s)[0];
	if (d.getElementById(id)) {return;}
	js = d.createElement(s); js.id = id;
	js.src = "//connect.facebook.net/en_US/all.js";
	fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

(function($){
	$('#facebook_auth_btn').bind('click', function(event){
		// loading facebook immediately
	//	$('#facebook_auth_btn').loader('load');
		event.preventDefault();
		if ( FB ){
			FB.login(function(response) {
				if (response.authResponse) {
					access_token = response.authResponse.accessToken; //get access token
					user_id      = response.authResponse.userID; //get FB UID

					FB.api('/me', function(response) {
						user_email = response.email; //get user email

						var params = {
							url 	: fe_globals.ajaxURL,
							type 	: 'post',
							data 	: {
								action: 'et_facebook_auth',
								content: response,
								fb_token: access_token
							},
							beforeSend: function(){
							},
							success: function(resp){
								if ( resp.success && typeof resp.data.redirect_url != 'undefined' ){
									window.location = resp.data.redirect_url;
								}
								else if ( resp.success && typeof resp.data.user != 'undefined' ){
									// assign current user
									var model = new ForumEngine.Models.User(resp.data.user);
									if(fe_globals.is_mobile){
										ForumMobile.app.currentUser = model;
										window.location.reload(true);
									}
									else{
										ForumEngine.app.currentUser = model;

										// trigger events
										var view 	= ForumEngine.app.loginModal;
										view.trigger('response:login', resp);
										pubsub.trigger('fe:response:login', model);
										pubsub.trigger('fe:showNotice', resp.msg , 'success');

										view.$el.on('hidden.bs.modal', function(){
											pubsub.trigger('fe:auth:afterLogin', model);
											view.trigger('afterLogin', model);

											if ( view.options.enableRefresh == true){
												window.location.reload(true);
											} else {
											}
										});

										view.close();
									}
								} else if ( resp.msg ) {
									pubsub.trigger('fe:showNotice', resp.msg , 'error');
								}
							},
							complete: function(){
								if(!fe_globals.is_mobile){
									$('#facebook_auth_btn').loader('unload');
								}
							}
						}
						jQuery.ajax(params);

					});

				} else {
					pubsub.trigger('fe:showNotice', 'User cancelled login or did not fully authorize.' , 'warning');
				}
			}, {
				scope: 'email,user_about_me'
			});
		}
	});
})(jQuery);