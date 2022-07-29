(function ($) {
var Customizer = Backbone.View.extend({
	el : '#customizer',
	events : {
		'click #save_customizer' 	: 'saveCustomization',
		'change .fontchoose' 	 	: 'changeFont',
		'click .layout-item' 	 	: 'changeLayout',
		'click #reset_customizer' 	: 'resetCustomizer',
		'click .scheme-item' 		: 'chooseSchemes',
		'click .pattern-item' 		: 'choosePattern',
		'click .custom-head h3' 	: 'toggleSection'
	},

	schemes : [{ // scheme 1
		'background' 			: '#ffffff',
		'header' 				: '#37393a',
		'heading' 				: '#37393a',
		'text' 					: '#7b7b7b',
		'action_1'				: '#e74c3c',
		'action_2'				: '#1abc9c',
		'footer' 				: '#ecf0f1',
		'font-heading' 			: 'Open Sans, Arial, Helvetica, sans-serif',
		'font-heading-size' 	: '15px',
		'font-heading-style' 	: 'normal',
		'font-heading-weight' 	: 'normal',
		'font-text' 			: 'Open Sans, Arial, Helvetica, sans-serif',
		'font-text-size' 		: '15px',
		'font-text-style' 		: 'normal',
		'font-text-weight' 		: 'normal',
		'font-action' 			: 'Open Sans, Arial, Helvetica, sans-serif',
		'font-action-size' 		: '15px',
		'font-action-style'	 	: 'normal',
		'font-action-weight' 	: 'normal',
		'layout' 				: 'content-sidebar',
		'pattern' 				: fe_globals.imgURL + '/patterns/pattern.png'
	},{ // scheme 2
		'background' 			: '#FAF9F5',
		'header' 				: '#263E57',
		'heading' 				: '#4B4B4B',
		'text' 					: '#555555',
		'action_1'				: '#2980b9',
		'action_2'				: '#ec9e03',
		'footer' 				: '#F7F0E6',
		'font-heading' 			: 'Helvetica, san-serif',
		'font-heading-size' 	: '22px',
		'font-heading-style' 	: 'normal',
		'font-heading-weight' 	: 'normal',
		'font-text' 			: 'Helvetica, san-serif',
		'font-text-size' 		: '12px',
		'font-text-style' 		: 'normal',
		'font-text-weight' 		: 'normal',
		'font-action' 			: 'Helvetica, san-serif',
		'font-action-size' 		: '12px',
		'font-action-style'	 	: 'normal',
		'font-action-weight' 	: 'normal',
		'layout' 				: 'content-sidebar',
		'pattern' 				: fe_globals.imgURL + '/patterns/pattern.png'
	},{ // scheme 3
		'background' 			: '#ededed',
		'header' 				: '#46433A',
		'heading' 				: '#4B4B4B',
		'text' 					: '#555555',
		'action_1'				: '#1ba084',
		'action_2'				: '#eb5257',
		'footer' 				: '#a8abaa',
		'font-heading' 			: 'Helvetica, san-serif',
		'font-heading-size' 	: '22px',
		'font-heading-style' 	: 'normal',
		'font-heading-weight' 	: 'normal',
		'font-text' 			: 'Helvetica, san-serif',
		'font-text-size' 		: '12px',
		'font-text-style' 		: 'normal',
		'font-text-weight' 		: 'normal',
		'font-action' 			: 'Helvetica, san-serif',
		'font-action-size' 		: '12px',
		'font-action-style'	 	: 'normal',
		'font-action-weight' 	: 'normal',
		'layout' 				: 'content-sidebar',
		'pattern' 				: fe_globals.imgURL + '/patterns/pattern6.png'
	},{ // scheme 4
		'background' 			: '#f2f2f2',
		'header' 				: '#2980b9',
		'heading' 				: '#4B4B4B',
		'text' 					: '#555555',
		'action_1'				: '#904c09',
		'action_2'				: '#1abc9c',
		'footer' 				: '#274c70',
		'font-heading' 			: 'Helvetica, san-serif',
		'font-heading-size' 	: '22px',
		'font-heading-style' 	: 'normal',
		'font-heading-weight' 	: 'normal',
		'font-text' 			: 'Helvetica, san-serif',
		'font-text-size' 		: '12px',
		'font-text-style' 		: 'normal',
		'font-text-weight' 		: 'normal',
		'font-action' 			: 'Helvetica, san-serif',
		'font-action-size' 		: '12px',
		'font-action-style'	 	: 'normal',
		'font-action-weight' 	: 'normal',
		'layout' 				: 'content-sidebar',
		'pattern' 				: fe_globals.imgURL + '/patterns/pattern1.png'
	},{ // scheme 5
		'background' 			: '#EFF7F4',
		'header' 				: '#224743',
		'heading' 				: '#4B4B4B',
		'text' 					: '#555555',
		'action_1'				: '#e67e22',
		'action_2'				: '#CE534D',
		'footer' 				: '#f0f0f0',
		'font-heading' 			: 'Helvetica, san-serif',
		'font-heading-size' 	: '22px',
		'font-heading-style' 	: 'normal',
		'font-heading-weight' 	: 'normal',
		'font-text' 			: 'Helvetica, san-serif',
		'font-text-size' 		: '12px',
		'font-text-style' 		: 'normal',
		'font-text-weight' 		: 'normal',
		'font-action' 			: 'Helvetica, san-serif',
		'font-action-size' 		: '12px',
		'font-action-style'	 	: 'normal',
		'font-action-weight' 	: 'normal',
		'layout' 				: 'content-sidebar',
		'pattern' 				: fe_globals.imgURL + '/patterns/pattern4.png'
	},{ // scheme 6
		'background' 			: '#FFFFFF',
		'header' 				: '#aa3442',
		'heading' 				: '#4B4B4B',
		'text' 					: '#555555',
		'action_1'				: '#16a084',
		'action_2'				: '#2c3e50',
		'footer' 				: '#34495e',
		'font-heading' 			: 'Helvetica, san-serif',
		'font-heading-size' 	: '22px',
		'font-heading-style' 	: 'normal',
		'font-heading-weight' 	: 'normal',
		'font-text' 			: 'Helvetica, san-serif',
		'font-text-size' 		: '12px',
		'font-text-style' 		: 'normal',
		'font-text-weight' 		: 'normal',
		'font-action' 			: 'Helvetica, san-serif',
		'font-action-size' 		: '12px',
		'font-action-style'	 	: 'normal',
		'font-action-weight' 	: 'normal',
		'layout' 				: 'content-sidebar',
		'pattern' 				: fe_globals.imgURL + '/patterns/pattern4.png'
	},{ // scheme 7
		'background' 			: '#F2F4F7',
		'header' 				: '#252D3B',
		'heading' 				: '#4B4B4B',
		'text' 					: '#555555',
		'action_1'				: '#ad0a4b',
		'action_2'				: '#B5740B',
		'footer' 				: '#d6d6d6',
		'font-heading' 			: 'Helvetica, san-serif',
		'font-heading-size' 	: '22px',
		'font-heading-style' 	: 'normal',
		'font-heading-weight' 	: 'normal',
		'font-text' 			: 'Helvetica, san-serif',
		'font-text-size' 		: '12px',
		'font-text-style' 		: 'normal',
		'font-text-weight' 		: 'normal',
		'font-action' 			: 'Helvetica, san-serif',
		'font-action-size' 		: '12px',
		'font-action-style'	 	: 'normal',
		'font-action-weight' 	: 'normal',
		'layout' 				: 'content-sidebar',
		'pattern' 				: fe_globals.imgURL + '/patterns/pattern5.png'
	},{ // scheme 8
		'background' 			: '#FFFCFD',
		'header' 				: '#1abc9c',
		'heading' 				: '#4B4B4B',
		'text' 					: '#555555',
		'action_1'				: '#B5740B',
		'action_2'				: '#2980b9',
		'footer' 				: '#34495e',
		'font-heading' 			: 'Helvetica, san-serif',
		'font-heading-size' 	: '22px',
		'font-heading-style' 	: 'normal',
		'font-heading-weight' 	: 'normal',
		'font-text' 			: 'Helvetica, san-serif',
		'font-text-size' 		: '12px',
		'font-text-style' 		: 'normal',
		'font-text-weight' 		: 'normal',
		'font-action' 			: 'Helvetica, san-serif',
		'font-action-size' 		: '12px',
		'font-action-style'	 	: 'normal',
		'font-action-weight' 	: 'normal',
		'layout' 				: 'content-sidebar',
		'pattern' 				: fe_globals.imgURL + '/patterns/pattern7.png'
	}],

	initialize: function(){
		var view = this,
			timing = null;
		$('.picker-trigger').each(function(){
			var $this = $(this);
			$this.ColorPicker({
				color : $this.getHexBackgroundColor(),
				onBeforeShow: function(){
					openColorPicker = true;					
					$(this).ColorPickerSetColor( $(this).getHexBackgroundColor() );
				},
				onHide : function(){
					openColorPicker = false;
				},
				onChange : function(hsb, hex, rgb){
					$this.css('background-color', '#' + hex );

					// clear time out
					if ( timing != null)
						clearTimeout(timing);

					// auto apply customizer in 0.5 second after change color
					timing = setTimeout(function(){
						view.chooseColor($this.attr('data'), hex);	
					}, 100);
				},
				onSubmit: function(hsb, hex, rgb){
				}
			});	
		});

		// Apply styling slider for font size selector
		$('#customizer .slider').applySlider({ change : function(event, ui){
			view.changeFontSize(event, ui);
			view.refreshLess();
		} });

		this.$('.select-wrap').click(function(event){
			$(this).find('select').focus();
		});

		// clone customizer
		this.defaultCustomizer = _.clone(customizer);

		$('#customizer').hover(this.showPanel, this.hidePanel);
		$(window).scroll(this.scrollHandle);
		$('#customizer').css('max-height', $(window).height() - 100);
	},

	hidePanel : function(e){
		t = null;

		var isHidden 	= $('#customizer').offset().left < 0,
			insidePanel = $.contains($('#customizer')[0], e.target),
			isPanel 	= $(e.target).attr('id') == 'customizer',
			inColorpicker = $(e.target).parents('.colorpicker').length > 0;
			openColorPicker = typeof openColorPicker != 'undefined' ? openColorPicker : false ;

		// check if the clicked element is outside the panel or not
		if ( !isHidden && !openColorPicker ){
			if (t != null) clearTimeout(t);
			// make the panel invisible
			$('#customizer').css('opacity', '.5');

			// then make it hide to the left
			t = setTimeout(function(){
				$('#customizer').animate({left: '-205px'});
			}, 1000);
		} 
	},

	showPanel : function(e){
		var isHidden 	= $('#customizer').offset().left < 0,
			insidePanel = $.contains($('#customizer')[0], e.target),
			isPanel 	= $(e.target).attr('id') == 'customizer',
			inColorpicker = $(e.target).parents('.colorpicker').length > 0;
		$('#customizer').css('opacity', '1');

		// stop the animation that hide the panel in 1s
		if ( typeof t != 'undefined' && t != null ) {
			clearTimeout(t);
		}
		if ( isHidden ){
			$('#customizer').animate({left: '0px'});
		}
	},

	scrollHandle : function(e){
		var amount = 128 - $('html').offset().top;
		if ( typeof t != 'undefined' && t != null ){
			clearTimeout(t);
		}

		t = setTimeout(function(){
			$('#customizer').animate({'top' : amount + 'px'});	
		}, 100);
	},

	refreshLess : function(){
		localStorage.clear();
		less.refresh(true);

		// reload Cufon on IE8
		if(typeof Cufon!='undefined'){   		
   			Cufon.replace('.icon');
   		}
	},

	resetCustomizer : function(){
		customizer = _.clone(this.schemes[0]);
		this.refreshCustomizer();
		//this.deleteCustomizerMobile();
	},
	deleteCustomizerMobile: function(){
		var params = {
			url : fe_globals.ajaxURL,
			type: 'post',
			data: {
				action: 'delete-customization-mobile',
			}
		}
		$.ajax(params);
	},
	refreshCustomizer : function(){
		// reset color
		this.$('div.picker-trigger[data=header]').css('background-color', customizer['header']);
		this.$('div.picker-trigger[data=heading]').css('background-color', customizer['heading']);
		this.$('div.picker-trigger[data=footer]').css('background-color', customizer['footer']);
		this.$('div.picker-trigger[data=background]').css('background-color', customizer['background']);
		this.$('div.picker-trigger[data=action_1]').css('background-color', customizer['action_1']);
		this.$('div.picker-trigger[data=action_2]').css('background-color', customizer['action_2']);
		this.$('select[name=font-heading]').val(customizer['font-heading']);
		this.$('select[name=font-text]').val(customizer['font-text']);
		this.$('.heading-size').slider('value', customizer['font-heading-size'].replace(/([0-9]+)[a-zA-Z]+/,"$1") );
		this.$('.text-size').slider('value', customizer['font-text-size'].replace(/([0-9]+)[a-zA-Z]+/,"$1") );
		if ( customizer['layout'] == 'content' ){
			this.$('.no-sidebar').trigger('click');
		}else if ( customizer['layout'] == 'content-sidebar' ){
			this.$('.r-sidebar').trigger('click');
		}else if ( customizer['layout'] == 'sidebar-content' ){
			this.$('.l-sidebar').trigger('click');
		}

		this.refreshLess();
	},

	chooseColor : function(element, value){
		customizer[element] = '#'+value;
		this.refreshLess();
	},

	changeFontSize : function(event, ui){
		var slider 	= $(event.target),
			input 	= slider.find('input[type=hidden]')
			element = input.attr('name');

		input.val(ui.value + 'px');
		customizer[element] = input.val();

		if ( element == 'font-text-size' )
			customizer['font-action-size'] = input.val();
	},

	changeFont : function(e){
		var select 	= $(e.currentTarget),
			element = select.attr('name');

		customizer[element] = select.val();
		//if user change text font, apply action font aslo
		if ( element == 'font-text' ) 
			customizer['font-action'] = select.val();
		this.refreshLess();
	},

	// change column styles
	changeLayout : function(e){
		e.preventDefault();
		var $this = $(e.currentTarget),
			container = $this.parent();
		
		if ( !container.hasClass('current') ){
			$('.block-layout li').removeClass('current');
			container.addClass('current');
			customizer['layout'] = $this.attr('data');

			if ( $this.hasClass('l-sidebar') ){
				$('body').removeClass('one-column').removeClass('right-sidebar').addClass('two-column left-sidebar');
			}else if ( $this.hasClass('r-sidebar') ){
				$('body').removeClass('one-column').removeClass('left-sidebar').addClass('two-column right-sidebar');
			}else {
				$('body').removeClass('two-column').removeClass('left-sidebar').removeClass('right-sidebar').addClass('one-column');
			}
		}
	},

	chooseSchemes : function(e){
		var element 	= $(e.currentTarget);
			index 		= element.index();

		customizer = _.clone(this.schemes[index]);
		this.refreshCustomizer();
	},

	choosePattern : function(e){
		customizer['pattern'] 		= $(e.currentTarget).attr('data');
		$('.pattern-item').removeClass('current');
		$(e.currentTarget).addClass('current');
		this.refreshLess();
	},

	toggleSection : function(e){
		var containter 	= $(e.currentTarget).parents('.section');
		var content 	= containter.find('.section-content');
		if ( content.is(':not(:hidden)') ) return false;

		this.$('.section-content:not(:hidden)').slideToggle(function(){
			$('#customizer').pretty_scrollbar();
		});
		content.slideToggle();
	},

	saveCustomization : function(e){
		var view = this;
		if ( $(e.currentTarget).hasClass('loading') ) return false;
		var params = {
			url : fe_globals.ajaxURL,
			type: 'post',
			data: {
				action: 'save-customization',
				content: {
					customization: customizer
				}
			},
			beforeSend: function(){
				$(e.currentTarget).addClass('loading');
			},
			success: function(resp){

				if ( !resp.success ){
					pubsub.trigger('fe:showNotice', resp.msg , 'error');
				} else {
					//console.log(customizer);
					if(customizer.action_1 == "#e74c3c" && customizer.action_2 == "#1abc9c")
						view.deleteCustomizerMobile();					
					pubsub.trigger('fe:showNotice', resp.msg , 'success');
				}
			},
			complete: function(){
				$(e.currentTarget).removeClass('loading');
			}
		}
		$.ajax(params);		
	},
});

/**
 * Make replace default scrollbar with the pretty one
 */
$.fn.pretty_scrollbar = function(options){
	$(this).each(function(){

		var element 	= $(this),
			html 		= element.html(),
			scrollbar 	= $('<div class="scrollbar"><div class="track"><div class="thumb"><div class="end"></div></div></div></div>'),
			viewport 	= $('<div class="viewport"></div>').append( $('<div class="overview"></div>') ),
			height 		= $(element).outerHeight(true),
			width 		= $(element).width();

		if ( !$(this).hasClass('scrollable') ) {
			element.find('form').wrapInner( $('<div class="overview">') ).wrapInner( $('<div class="viewport">').css({
				'height' 	: $('#customizer').height() ,
				'width'		: width
			}) );

			element.prepend($('<div class="scrollbar"><div class="track"><div class="thumb"><div class="end"></div></div></div></div>'));
			element.addClass('scrollable').tinyscrollbar();
		}

		element.tinyscrollbar();
		if ( element.find('.viewport').height() >= element.find('.overview').height() )
			element.addClass('scroll-disable'); 
		else 
			element.removeClass('scroll-disable');

		$(window).resize(function(){
			$(element).find('.viewport').css('height', $('#customizer').height());
			$(element).tinyscrollbar();
		});
	});
}

$.fn.applySlider = function(options){
	var globalOptions = options || {};

	$(this).each(function(){
		var element = $(this);
		var options = globalOptions || {};

		options = _.extend({
			min : parseInt(element.attr('data-min')) || 12,
			max : parseInt(element.attr('data-max')) || 14,
			step: 1,
			range: "min",
			value : parseInt(element.attr('data-value')) || options.min
		}, options);

		options.create = function(event, ui){
			var slide 	= $(event.target),
				pos 	= (options.value - options.min) / (options.max - options.min) * 100,
				steps 	= (options.max - options.min) / options.step;

			slide.append( $('<div class="slide-bubble">').css({left: pos + '%' }).html(options.value));
			var rulers = $('<div class="rulers">');
			for( i = 0; i <= steps; i++ ){
				pos 	= i / (options.max - options.min) * 100;
				rulers.append($('<div class="ruler-item">').css({left: pos + '%'}));
			}
			slide.append(rulers);
		};

		options.slide = function(event, ui){
			var slide 	= $(event.target),
				pos 	= (ui.value - options.min) / (options.max - options.min) * 100;
			slide.find('.slide-bubble').css({left: pos + '%' }).html(ui.value);
		};

		var change = options.change || function(event, ui){};
		options.change = function(event, ui){
			var slide 	= $(event.target),
				pos 	= (ui.value - options.min) / (options.max - options.min) * 100;
			slide.find('.slide-bubble').css({left: pos + '%' }).html(ui.value);
			change(event, ui);
		}

		$(this).slider(options);
	});
};

$.fn.getHexBackgroundColor = function() {
	var rgb = $(this).css('background-color'),
		hex_rgb;

	if (!rgb) {
		return '#FFFFFF'; //default color
	}
	hex_rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
	function hex(x) {return ("0" + parseInt(x,10).toString(16)).slice(-2);}
	if (hex_rgb) {
		return "#" + hex(hex_rgb[1]) + hex(hex_rgb[2]) + hex(hex_rgb[3]);
	} else {
		return rgb; //ie8 returns background-color in hex format then it will make compatible, you can improve it checking if format is in hexadecimal
	}
};

$(document).ready(function(){
	var customizer = new Customizer();
});
})(jQuery);