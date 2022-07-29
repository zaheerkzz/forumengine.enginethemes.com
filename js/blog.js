(function($){

	$(document).ready(function(){
		$(window).scroll(function()
		{	
		    if( ($(window).scrollTop() == $(document).height() - $(window).height()) && $("#post_loading").attr('data-fetch') == 1 )
		    {
		    	getPosts();
		    }
		});
	});

	function getPosts(){
		var loading 	= $('body').find('#post_loading'),
			paged 		= $('body').find('#current_page').val(),
			status  	= loading.attr('data-status'),
			query_default = {
				action		: 'et_post_sync',
				method 		: 'blog',
				content : {
					paged			: paged,
					status 			: status,
					}
			};

			if(loading.attr('data-cat')) {
				query_default.content.cat = loading.attr('data-cat');
			}  				

		$.ajax({
			url : fe_globals.ajaxURL,
			type : 'post',
			data : query_default,
			beforeSend : function(){
				loading.removeClass('hide');
				$('body').find('#post_loading').attr('data-fetch', 0);
			},
			error : function(request){
				loading.addClass('hide');
			},
			success : function(response){
				
				var current_page = response.data.paged,
					max_page_query = response.data.total_pages;

				if(response.success){

					$('body').find('#current_page').val(current_page);
					$('body').find('#post_loading').attr('data-fetch', current_page < max_page_query ? 1 : 0);
					loading.addClass('hide');

					renderLoadMore(response.data.posts);

				} else {

				}
			}
		});
	}

	function renderLoadMore(threads){
		var container = $('body').find('#main_list_post');
		for (key in threads){
			container.append( threads[key] );
		}
	}

})(jQuery);