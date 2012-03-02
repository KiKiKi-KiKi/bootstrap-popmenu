/* ====================================================================
 * bootstrap-popmenu.js v0.0.1
 * extends bootstrap-tooltip.js v2.0.1 - Copyright 2012 Twitter, Inc.
 * ==================================================================== */

!function($) {
	//var isIE = (document.uniqueID)? true : false;
	var is_liIE8 = (typeof window.addEventListener == "undefined" && typeof document.getElementsByClassName == "undefined")? true : false;

	$.fn.extend({
		'popmenu' : function(option) {
			var settings = jQuery.extend({}, $.fn.tooltip.defaults, $.fn.popmenu.defaults, option);
            return this.each(function(){
                var $this = $(this), data = $this.data('popmenu'), options = typeof settings == 'object' && settings;
                if(!data) $this.data('popmenu', (data = new Popmenu(this, options)));
                if(typeof options == 'string') data[options]()
				
			});
		}
	});
	
	var Popmenu = function(element, options){
		this.init('popmenu', element, options);
	}
    
    Popmenu.prototype = jQuery.extend({}, $.fn.tooltip.Constructor.prototype, {
        constructor: Popmenu,
        
        // ovverride tooltip
        init: function(type, element, options){
            this.type = type;
            this.enabled = true;
            this.timer = null;
            this.hoverFlg = false;
            var $e = this.$element = $(element), $c, o = this.options = this.getOptions(options), eventIn, eventOut;

            if($e.attr('data-content')){
                
                $c = jQuery($e.attr('data-content')).hide();
            }
            if($c && $c.length){
                this.content = $c[0].innerHTML;
            } else {
                this.content = typeof o.content == 'function' ? o.content.call($e[0]) :  o.content;
            }
            
            this.title = $e.attr('data-original-title') || (typeof o.title == 'function' ? o.title.call($e[0]) :  o.title);
            
            if (this.options.trigger != 'manual') {
                eventIn  = this.options.trigger == 'hover' ? 'mouseenter' : 'focus';
                eventOut = this.options.trigger == 'hover' ? 'mouseleave' : 'blur';
                this.$element.on(eventIn, this.options.selector, $.proxy(this.enter, this));
                this.$element.on(eventOut, this.options.selector, $.proxy(this.leave, this));
            }

            this.options.selector ? (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' })) : this.fixTitle();
        },

        enter: function(e){
            var self = $(e.currentTarget)[this.type](this._options).data(this.type);
            if(self.hoverFlg == false) {
                if(!self.options.delay || !self.options.delay.show){
                    self.show();
                } else {
                    self.hoverState = 'in';
                    clearTimeout(self.timer);
                    setTimeout(function(){
                        if(self.hoverState == 'in'){
                            self.show();
                        }
                    }, self.options.delay.show);
                }
            } else {
                clearTimeout(self.timer);
                self.hoverFlg = false;
                self.show();
            }
        },
        
        leave: function(e){
            var self = $(e.currentTarget)[this.type](this._options).data(this.type), $tip = self.tip();
            if(self.hoverFlg == true) {
                self._hideTip();
            } else if($tip.is(':visible')){
                self.hoverState = 'out';
                self.timer = setTimeout(function(){
                    self._hideTip();
                }, self.options.delayTimer);
            }
        },

        show: function(){
            var $tip, inside, pos, actualWidth, actualHeight, placement, tp;

            if(this.hasContent() && this.enabled){
                
                $tip = this.tip();
                this.setContent();
                
                if(this.options.animation){
                    $tip.addClass('fade');
                }

                placement = typeof this.options.placement == 'function' ? this.options.placement.call(this, $tip[0], this.$element[0]) : this.options.placement;

                inside = /in/.test(placement);

                $tip.remove().css({top:0, left:0, display:'block'}).appendTo(inside ? this.$element : document.body).bind('mouseover',{self:this}, this._onTipHover);

                pos = this.getPosition(inside);
                
                actualWidth = $tip[0].offsetWidth;
                actualHeight = $tip[0].offsetHeight;
        
                switch(inside ? placement.split(' ')[1] : placement){
                    case 'bottom':
                        tp = {top: pos.top + pos.height, left: pos.left + pos.width / 2 - actualWidth / 2};
                    break;
                    case 'top':
                        tp = {top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2};
                    break;
                    case 'left':
                        tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth};
                    break;
                    case 'right':
                        tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width};
                    break;
                }
                
                $tip.css(tp).addClass(placement).addClass('in').bind('mouseleave',{self:this}, this._onTipOut);
                
            }
        },
        
        hide: function(){
            var that = this, $tip = this.tip()
            $tip.removeClass('in')
            
            function removeWithAnimation() {
                that.timer = setTimeout(function(){
                        $tip.off($.support.transition.end).remove();
                    }, 500);
                
                $tip.one($.support.transition.end, function() {
                    clearTimeout(that.timer);
                    $tip.remove();
                    that.hoverFlg = false;
                });
            }
            if($.support.transition && this.$tip.hasClass('fade')) {
                removeWithAnimation();
            } else {
                $tip.remove();
                that.hoverFlg = false;
            }
        },
    
        _hideTip : function() {
            var self = this, $tip = self.tip();
            $tip.unbind('mouseover', self._onTipHover);
            $tip.unbind('mouseleave', self._onTipOut);
            
			if(!self.options.delay || !self.options.delay.hide){
                self.hide();
            } else {
                self.timer = setTimeout(function(){
                    self.hoverState == 'out'
                    self.hide();
                }, self.options.delay.hide);
            }
        },
        _onTipHover: function(evt) {
            evt.data.self.hoverFlg = true;
            clearTimeout(evt.data.self.timer);			
        },
        _onTipOut: function(evt){
			clearTimeout(evt.data.self.timer);
			evt.data.self._hideTip();
		},
    
        setContent: function () {
            var $tip = this.tip(), title = this.getTitle(), content = this.getContent();
            if(this.options.width) {
                $tip.find('.popover-inner').css({width: parseInt(this.options.width) + 'px'});
            }
            if(title) {
                $tip.find('.popover-title')[ $.type(title) == 'object' ? 'append' : 'html' ](title);
            } else {
                $tip.find('.popover-title').addClass('notitle')[0].style.display = 'none';
            }
            $tip.find('.popover-content > *')[ $.type(content) == 'object' ? 'append' : 'html' ](content);
            
            $tip.removeClass('fade top bottom left right in');
        },

        hasContent: function() {
            return this.getTitle() || this.getContent();
        },

        getContent: function() {
            return this.content.toString().replace(/(^\s*|\s*$)/, "");
        },
        
        getTitle: function () {
            return this.title.toString().replace(/(^\s*|\s*$)/, "");
        },
        
        tip: function() {
            if (!this.$tip) {
                this.$tip = $(this.options.template);
            }
            return this.$tip;
        }
    });
	$.fn.popmenu.defaults = {
        placement: 'right',
        content: '',
        template: '<div class="popover"><div class="arrow"></div><div class="popover-inner"><h3 class="popover-title"></h3><div class="popover-content"><p></p></div></div></div>',
        delayTimer : 300
	};
}(jQuery)