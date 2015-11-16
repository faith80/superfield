
/**
 * File: awecontent-slideshow-item.js
 * Author: AWEThemes
 * Website: http://awethemes.com/
 */
(function($) {
    "use strict";

    AWEContent.Models.ImageSlide = Backbone.RelationalModel.extend({
        defaults : {
            fid: -1,
            srcImageStyle : '',
            srcThumbStyle : '',
            linkImage : '',
            captionImage : '',
            enableCaption: 0,
            captionPosition : 'top',
            targetImage: 1
        },
        createView: function() {
            this.view = new AWEContent.Views.ImageSlide({model: this});
        },
        getView: function(){
            return this.view;
        }
    });
    AWEContent.Views.ImageSlide = Backbone.View.extend({
        tagName: 'div',
        className : 'md-item-image',
        events: {
            'click .awe-box-btn' : 'changeContent',
            'click .edit-link' : 'editLink',
            'click .edit-caption' : 'editCaption',
            'click .remove-image' : 'destroyImage'
        },
        template: _.template(
            '<div class="awe-image-item">\
                <% if (linkImage) { %>\
                <a class="mgf-md-popup" target="<%= targetImage %>" href="<%= linkImage %>">\
                <% } %>\
                <div class="awe-image-content">\
                    <div class="awe-image-container"><img src="<%= srcImage %>" alt=""></div>\
                    <div class="awe-image-caption"><%= captionImage %></div>\
                </div>\
                <% if (linkImage) { %>\
                </a>\
                <% } %>\
                <div class="awe-image-control">\
                    <ul>\
                        <li class="edit-link">\
                            <i class="ic ac-icon-link"></i>\
                            <div class="awe-control-box">\
                                <div class="awe-box-header">Image link</div>\
                                <div class="awe-box-content">\
                                    <div class="awe-box-item"><textarea></textarea></div>\
                                    <div class="awe-box-item">\
                                        <input type="checkbox" name="target" id="ckb-target" class="ckb-target">\
                                        <label for="ckb-target" class="label-checkbox">Open new window</label>\
                                    </div>\
                                </div>\
                                <div class="awe-box-footer">\
                                    <a href="#" class="awe-box-btn js-ok">Save</a>\
                                    <a href="#" class="awe-box-btn js-cancel">Cancel</a>\
                                </div>\
                            </div>\
                        </li>\
                        <li class="edit-caption">\
                            <i class="ic ac-icon-caption"></i>\
                            <div class="awe-control-box">\
                                <div class="awe-box-header">Image caption</div> \
                                <div class="awe-box-content">\
                                    <div class="awe-box-item">\
                                        <textarea></textarea>\
                                    </div>\
                                </div>\
                                <div class="awe-box-footer">\
                                    <a href="#" class="awe-box-btn js-ok">Save</a>\
                                    <a href="#" class="awe-box-btn js-cancel">Cancel</a>\
                                </div>\
                            </div>\
                        </li>\
                        <li class="remove-image"><i class="ic ac-icon-trash"></i></li>\
                    </ul>\
                </div>\
            </div>'
        ),
        initialize: function() {
            this.render();
            this.$el.delegate('.awe-control-box','click', function (event) {
                event.stopPropagation();
            });
            this.listenTo(this.model, 'change', this.changeSettings);
        },
        render : function(){
            var self = this,
                settings = self.model.toJSON(),
                srcThumbStyle = settings.srcThumbStyle;

            self.$el.append(self.template({captionImage: settings.captionImage, targetImage : '_blank',  linkImage : settings.linkImage, srcImage: settings.srcImageStyle}));
            self.$img = $('img', self.el);
            self.$img.data('srcThumbStyle', srcThumbStyle);

            // render image caption settings
            if (settings.enableCaption == 0)
                $('li.edit-caption', self.$el).hide();

            if (settings.captionPosition == 'top')
                $('.awe-image-content',self.$el).prepend($('.awe-image-caption',self.el));
            else if (settings.captionPosition =='over') {
                self.$el.addClass('position-over');
                self.addImageOverlay();
            }

            return self.$el;
        },
        changeSettings : function(model) {
            var self = this,
                $imagePopup = $('.mgf-md-popup', self.el),
                $caption = $('.awe-image-caption', self.el),
                $imageContent = $('.awe-image-content', self.el);

            $.each(model.changedAttributes(), function(key, value){
                switch (key) {
                    case 'srcImageStyle':
                        self.$img.attr('src', value);
                        break;

                    case 'srcThumbStyle':
                        self.$img.data('srcThumbStyle', value).trigger('change', {action: 'changeThumbnail'});
                        break;

                    case 'linkImage':
                        if (value != '') {
                            $('.awe-image-item', self.$el).prepend($('<a target="_blank"></a>').attr('href', value));
                            $('.awe-image-item > a', self.$el).append($('.awe-image-content', self.$el));
                        }
                        else {
                            if (model.previousAttributes().linkImage != '') {
                                $('.awe-image-item', self.$el).prepend($('.awe-image-content', self.$el));
                                $('.awe-image-item > a', self.$el).remove();
                            }
                        }
                        break;

                    case 'targetImage':
                        if (self.model.get('linkImage')) {
                            var target = '_blank';
                            $imagePopup.attr('target', target);
                        }
                        break;

                    case 'enableCaption':
                        value ? $('.awe-image-caption', self.$el).show() : $('.awe-image-caption', self.$el).hide();

                        self.removeImageOverlay();
                        if (value && self.model.get('captionImage') && self.model.get('captionPosition') == 'over')
                            self.addImageOverlay();
                        break;

                    case 'captionImage':
                        $('.awe-image-caption', self.$el).html(value);
                        break;

                    case 'captionPosition' :
                        self.$el.removeClass('position-over');
                        switch (value) {
                            case 'top':
                                self.removeImageOverlay();
                                $imageContent.prepend($caption);
                                break;

                            case 'bottom' :
                                self.removeImageOverlay();
                                $imageContent.append($caption);
                                break;

                            case 'over' :
                                self.addImageOverlay();
                                self.$el.addClass('position-over');
                                break;
                        }
                        break;
                }
            });
        },
        addCaption: function() {
            var self = this,
                captionContent = self.model.get('captionImage'),
                captionPosition = self.model.get('captionPosition'),
                $caption = $('<div class="awe-image-caption"></div>').html(captionContent);

            if (captionPosition == 'bottom')
                $('.awe-image-content', self.$el).append($caption);
            else {
                $('.awe-image-content', self.$el).prepend($caption);
                if (captionPosition == 'over') {
                    self.$el.addClass('position-over');
                    self.addImageOverlay();
                }
            }
        },
        changeContent: function(event){
            event.preventDefault();
            event.stopPropagation();
            var self = this,
                $target = $(event.target),
                $closestLi = $target.closest('li.active'),
                content = $('textarea', $closestLi).val();

            $closestLi.removeClass('active');
            if ($target.hasClass('js-ok')) {
                if ($closestLi.hasClass('edit-link')){
                    var isTarget  = $('.ckb-target', $closestLi).prop('checked');
                    self.model.set('linkImage', content);
                    self.model.set('targetImage', isTarget ? 1 : 0);
                }
                else if ($closestLi.hasClass('edit-caption')) {
                    self.model.set('captionImage', content);
                }
            }
        },
        editLink : function(event){
            event.stopPropagation();
            event.preventDefault();
            var self = this,
                linkImage = self.model.get('linkImage'),
                $target = $(event.target).hasClass('edit-link') ? $(event.target) : $(event.target).closest('.edit-link'),
                $textArea = $('textarea', $target);

            $target.siblings('li').removeClass('active');
            $target.toggleClass('active');
            $textArea.val(linkImage);
        },
        editCaption: function(event){
            event.stopPropagation();
            event.preventDefault();
            var self = this,
                captionImage = self.model.get('captionImage'),
                $target = $(event.target).hasClass('edit-caption') ? $(event.target) : $(event.target).closest('.edit-caption'),
                $textArea = $('textarea', $target);

            $target.siblings('li').removeClass('active');
            $target.toggleClass('active');
            $textArea.val(captionImage);
        },
        destroyImage : function(){
            if (this.$el.closest('.owl-wrapper').children().length >1) {
                this.model.destroy();
                this.$el.remove();
            }
        },
        addImageOverlay: function() {
            $('.awe-image-content', this.$el).prepend('<div class="awe-image-overlay"></div>');
        },
        removeImageOverlay: function() {
            $('.awe-image-overlay', this.$el).remove();
        }
    });

    AWEContent.Collections.ListImageSlide = Backbone.Collection.extend({
        model: AWEContent.Models.ImageSlide
    });

    AWEContent.Views.ListImageSlide = Backbone.View.extend({
        tagName: 'div',
        className: '',
        events: {
        },
        initialize: function(){
            this.listenTo(this.collection, 'add', this.addImage);
            this.listenTo(this.collection, 'destroy', this.removeImage);
            this.render();
        },
        render : function(){
            var self = this;
            self.collection.each(function(image, idImage){
                image.createView();
                self.$el.append(image.getView().$el);
            })
        },
        addImage : function(model, collection) {
            model.createView();
            this.$el.append(model.getView().$el);
        }
    });

    AWEContent.Models.SlideShowItem = AWEContent.Models.Item.extend({
        defaults: {
            machine_name: "slideshow",
            images: [],
            styleImage: 'none',
            effectSlide: 'fade', // backSlide, goDown, fadeUp captionPosition
            nav: 'none', // one of [none, button, thumbnail, number]
            styleThumb: 'ac_slide_thumb_default',
            positionThumb: 'bottom',
            showControls: 0,
            stopOnHoverSlide: 0,
            autoPlay: 0,
            speedImage: 4000,
            transSpeed: 400,
            caption: 0,
            captionColor: '',
            captionPosition: 'top',
            captionOnHover: 0,
            imageBgOverlay: '',
            boxModelSettings : {},
            customID: '',
            customClass: '',
            customEnableAttributes: 0,
            customDataAttributes: '[]',// Array Json ex : [{"attrName":"autoPlay","attrValue":"true"}]
            customActionAttributes: '{"newAction": "", "newAttrName": "", "newAttrValue": ""}',
            customEnableAnimations: 1,
            customDataAnimations: '{"type" : "none"}', // Data Object {"type":"spinin","duration":"5000","delay":"0","advance":{"direction":"clockwise","numberOfSpin":"3"}}
            lgResponsive: true,
            xsResponsive: true,
            mediumResponsive: true,
            smResponsive: true
        },
        relations: [
            {
                type: Backbone.HasOne,
                key: "boxModelSettings",
                relatedModel: AWEContent.Models.BoxModelSettings
            },
            {
                type: Backbone.HasMany,
                key: 'images',
                relatedModel: AWEContent.Models.ImageSlide,
                relatedCollection: AWEContent.Collections.ListImageSlide
            }
        ],
        createView: function() {
            this.view = new AWEContent.Views.SlideShowItem({model: this});
        },
        clone : function(){
            var cloneModel = {},
                listImageModel = new AWEContent.Collections.ListImageSlide();
            this.get('images').each( function(image, idImg){
                listImageModel.add(image.clone());
            });
            $.each(this.toJSON(), function(key,value){
                if (key != 'images') {
                    cloneModel[key] = value;
                }
            });
            cloneModel.images = listImageModel;
            cloneModel.boxModelSettings = new AWEContent.Models.BoxModelSettings(cloneModel.boxModelSettings);
            return new AWEContent.Models.SlideShowItem(cloneModel);
        }
    });

    AWEContent.Views.SlideShowItem = AWEContent.Views.Item.extend({
        additionalEvents: {
        },
        refreshGidImage : function(){
            if (AWEContent.Panels.slideshow.isOpenned) {
                AWEContent.Panels.slideshow.setPanelElementsValue();
            }
        },
        initialize: function() {
            AWEContent.Views.Item.prototype.initialize.call(this);
            var self = this;

            this.listenTo(this.model.get("boxModelSettings"), "change", this.applySettingsChanged);
            this.listenTo(this.model.get("images"), "add", this.addImage);
            this.listenTo(this.model.get("images"), "remove", this.removeImage);
            this.listenTo(this.model.get("images"), "change:srcImage", this.changeThumbImage);

            // Create Event resize view
            this.$el.resize(function(){
                self.owlSlide.data('owlCarousel').reinit(self.settingsOwl);
                self.owlThumb.data('owlCarousel').reinit(self.stOwlThumb);
            });

            self.iframeJQuery(this.el).delegate('.awe-slideshow', "itemReady", function() {
                self.$el.delegate('.mgf-md-popup img', 'change', function (event, opts) {
                    if (opts.action == 'changeThumbnail') {
                        var $image = $(this),
                            src = $image.data('srcThumbStyle'),
                            $item = $image.closest('.owl-item').length ? $image.closest('.owl-item') : $image.closest('.md-item-image'),
                            index = $item.index(),
                            $thumb = self.$listThumb.find('.image-thumb img').eq(index);

                        $thumb.attr('src', src);
                        $.imageLoaded({src  : src}, function () {
                            if(status.err) {
                                return;
                            }
                            //self.resizeImage($thumb);
                        });
                    }

                });
                if (self.model.toJSON().nav == 'thumbnail')  {
                    self.$el.find('.mgf-md-popup img').each(function() {
                        $(this).trigger('change', {action: 'changeThumbnail'});
                    });
                }

            });

            // listen event images style get success
            this.$el.bind('getImagesStyleSuccess', function(event, attribute, response) {
                var imageAttr = (attribute == 'styleImage') ? 'srcImageStyle' : 'srcThumbStyle',
                    style = self.model.get(attribute),
                    $thumbList = AWEContent.jqIframe('<div class="owl-list-thumb"><div class="list-thumb-content"></div></div>');

                // set image style url to slideshow's image
                self.model.get('images').each(function(image) {
                    var fid = image.get('fid'),
                        imageURL = response[fid][style];

                    image.set(imageAttr, imageURL);

                    // re-render thumbnail list
                    if (attribute == 'styleThumb') {
                        var $thumbItem = $('<div class="image-thumb"><img src="" alt=""/></div>');

                        $('img', $thumbItem).attr('src', imageURL);
                        $('.list-thumb-content', $thumbList).append($thumbItem);
                    }
                });

                if (attribute == 'styleThumb') {
                    self.$listThumb = $thumbList;

                    // calculate new thumbnail image width
                    self.thumbWidthLoaded = false;
                    self.getThumbImageSize();

                    var waitCalculateThumb = setInterval(function() {
                        if (self.thumbWidthLoaded) {
                            clearInterval(waitCalculateThumb);

                            self.initThumbList();

                            if (self.model.get('nav') == 'thumbnail') {
                                $('.owl-list-thumb', self.$el).remove();
                                if (self.model.get('positionThumb') == 'bottom')
                                    $('.awe-slideshow', self.$el).append(self.$listThumb);
                                else
                                    $('.awe-slideshow', self.$el).prepend(self.$listThumb);
                            }
                        }
                    }, 100);
                }
            });

            // Handle window resize to calculate thumbnail list
            var resizeTimeout;
            $(window).resize(function(event) {
                if (resizeTimeout)
                    clearInterval(resizeTimeout);

                // create interval to wait stop resize window
                resizeTimeout = setTimeout(function() {
                    self.initThumbList();
                }, 100);
            })
        },
        resizeImage : function($element) {
            var timeOut = 0,
                interval = setInterval(function () {
                    timeOut ++ ;
                    if (timeOut > 20) {
                        clearInterval(interval);
                    }
                    else if ($element.width() > 0) {
                        clearInterval(interval);
                        setTimeout( function () {
                            $element.css({width: '',height: ''});
                            var width = $element.width(),
                                height = $element.height(),
                                ratio = 0.5;

                            if ((height/width) >= ratio) {
                                width = '100%';
                                height = 'auto';
                            }
                            else {
                                width = 'auto';
                                height = '100%'
                            }
                            $element.css({width: width,height: height});
                        }, 100)
                    }
                }, 50);
        },
        changeThumbImage: function(model, attribute) {
            var index = model.view.$el.parent().index(),
                $listThumb = this.$listThumb,
                $image = $('img', $listThumb).eq(index);

            $image.attr('src', attribute);
        },
        renderItemContent: function() {
            var self = this,
                settings = self.model.toJSON(),
                images = self.model.get('images'),
                $slideShow = $('<div class="awe-item awe-slideshow"></div>'),
                listImageView = new AWEContent.Views.ListImageSlide({collection: images});

            $slideShow.append(listImageView.$el.addClass('image-slide-show'));
            images.each(function(img) {
                img.set('captionPosition', settings.captionPosition);
            });

            // render list thumbnail
            self.renderThumbList();

            // get natureWidth of thumbnail image
            self.getThumbImageSize();

            // Add owlCarousel library
            AWEContent.Library.addLibrary('owlCarousel', function() {
                if (images.length) {
                    var interval = setInterval(function() {
                        if ($('.awe-slideshow', self.el).length && self.thumbWidthLoaded) {
                            clearInterval(interval);
                            if ($('.awe-image-content', self.el).length)
                                self.readyOwlCarousel();
                        }
                    }, 50);
                }
                else
                    $slideShow.append("<div class='alert alert-danger'>Please drag image for here!</div>");
            });

            // render caption settings
            if (!settings.caption)
                $slideShow.addClass('disable-caption');
            if (settings.captionPosition == 'top') {
                $('.owl-item .awe-image-content', $slideShow).each(function() {
                    $(this).prepend($('.awe-image-caption', $(this)));
                });
            }
            else if (settings.captionPosition == 'over') {
                $('.awe-image-content', $slideShow).prepend($('<div class="awe-image-overlay" />').css('background-color', settings.imageBgOverlay));
                // render image overlay
                $('.awe-image-overlay', $slideShow).css('background-color', settings.imageBgOverlay);

                // render show caption when hover image
                if (settings.onHover)
                    $slideShow.addClass('caption-hover');
            }

            // render other settings
            $slideShow.attr('id', settings.customID).addClass(settings.customClass).renderItemDefaultBoxModel(settings.boxModelSettings);
            $slideShow.renderItemDefaultAttributes(settings.customEnableAttributes, settings.customDataAttributes);

            // render caption color setting
            $('.awe-image-caption', $slideShow).css('color', settings.captionColor);
            if (settings.captionOnHover)
                $slideShow.addClass('caption-hover');

            if (settings.customEnableAnimations)
                $slideShow.processAnimations(settings.customDataAnimations);
            self.$el.defaultResponsive(settings);

            // Settings data default for $slideShow
            $slideShow.aweDragUpload({
                multiUpload: true,
                uploadSuccessCallback: function (response, id) {
                    if (response.status && response.file) {
                        var listImage = self.model.get('images'),
                            fid = response.file.fid,
                            imageStyle = self.model.toJSON().styleThumb,
                            thumbStyle = self.model.toJSON().styleImage,
                            styles = imageStyle + ',' + thumbStyle,
                            srcImage = response.file.file_url;

                        if (AWEContent.Path.imageStyleURL != '') {
                            $.post(AWEContent.Path.imageStyleURL, {fids: '' + fid, styles: styles}, function(image){
                                if ($.type(image) == 'string')
                                    image = JSON.parse(image.trim());

                                var options = {
                                    fid: fid,
                                    srcThumbStyle: image[fid][self.model.get('styleThumb')],
                                    srcImageStyle: image[fid][self.model.get('styleImage')],
                                    captionPosition :  self.model.get('captionPosition'),
                                    enableLightBox : self.model.get('enableLightBox')
                                };
                                if (self.model.get('createFromDefault') == true ){
                                    self.model.get('images').at(0).set(options);
                                    self.model.set('createFromDefault', false);

                                    self.model.view.getImageStyleURL('styleThumb');
                                }
                                else {
                                    var modelImage = new AWEContent.Models.ImageSlide(options);

                                    listImage.add(modelImage);
                                    self.refreshGidImage();
                                }
                            });
                        }
                        else {
                            var options = {
                                fid: fid,
                                srcThumbStyle: srcImage,
                                srcImageStyle: srcImage,
                                captionPosition :  self.model.get('captionPosition'),
                                enableLightBox : self.model.get('enableLightBox')
                            };
                            if (self.model.get('createFromDefault') == true ){
                                self.model.get('images').at(0).set(options);
                                self.model.set('createFromDefault', false);
                            }
                            else {
                                var modelImage = new AWEContent.Models.ImageSlide(options);

                                listImage.add(modelImage);
                                self.refreshGidImage();
                            }
                        }
                    }
                }
            });
            return $slideShow;
        },
        readyOwlCarousel : function(settingsOwl) {
            var self = this,
                settings = self.model.toJSON();

            if (settingsOwl)
                self.settingsOwl = settingsOwl;
            else {
                var pagination = false, paginationNumbers = false, autoPlay = false;

                if (settings.nav == 'none' || settings.nav== 'thumbnail')
                    pagination = false;
                else {
                    if (settings.nav == 'button'){
                        pagination = true;
                        paginationNumbers = false;
                    }
                    else {
                        pagination = true;
                        paginationNumbers = true;
                    }
                }
                if (settings.autoPlay)
                    autoPlay = settings.speedImage;
                else
                    autoPlay = false;

                self.settingsOwl = {
                    singleItem: true,
                    autoPlay: false,
                    stopOnHover: false,
                    pagination : pagination,
                    paginationNumbers: paginationNumbers,
                    navigation : settings.showControls ? true : false,
                    addClassActive : true,
                    transitionStyle : settings.effectSlide,
                    beforeMove: function() {
                        self.owlSlide.find('.active').css({duration: ''});
                    },
                    afterMove: function(){
                        var duration = self.model.get('transSpeed');

                        self.owlSlide.find('.active').css({
                            'animation-duration': duration + 'ms'
                        });
                    },
                    afterAction : syncPosition
                };
            }

            // init for list thumb
            self.initThumbList();

            // add list thumb if type of navigation is thumbnail
            if (settings.nav == 'thumbnail') {
                if (settings.positionThumb == 'top')
                    $('.awe-slideshow', self.el).prepend(self.$listThumb);
                else
                    $('.awe-slideshow', self.el).append(self.$listThumb);
            }

            // init for slide show
            self.owlSlide = AWEContent.jqIframe('.image-slide-show', self.el);
            self.owlSlide.owlCarousel(self.settingsOwl);

            function syncPosition(el) {
                var current = this.currentItem;

                self.owlThumb.find(".owl-item").removeClass("synced").eq(current).addClass("synced");
                if(self.owlThumb.data("owlCarousel") !== undefined)
                    center(current)
            }
            self.$el.delegate(".owl-item", "click", function(e){
                e.preventDefault();
                var number = AWEContent.jqIframe(this).data("owlItem");
                self.owlSlide.data('owlCarousel').goTo(number);
            });
            function center(number) {
                var sync2visible = self.owlThumb.data("owlCarousel").owl.visibleItems, num = number, found = false;
                for(var i in sync2visible){
                    if(num === sync2visible[i])
                        found = true;
                }
                if(found===false){
                    if(num>sync2visible[sync2visible.length-1]){
                        self.owlThumb.trigger("owl.goTo", num - sync2visible.length+2)
                    }else{
                        if(num - 1 === -1){
                            num = 0;
                        }
                        self.owlThumb.trigger("owl.goTo", num);
                    }
                } else if(num === sync2visible[sync2visible.length-1]){
                    self.owlThumb.trigger("owl.goTo", sync2visible[1]);
                } else if(num === sync2visible[0]){
                    self.owlThumb.trigger("owl.goTo", num-1);
                }
            }
            setTimeout(function() {
                self.resizeItem();
            },100);
        },
        renderThumbList: function() {
            var $listThumb = AWEContent.jqIframe('<div class="owl-list-thumb"><div class="list-thumb-content"></div></div>');

            this.model.get('images').each(function(image) {
                var thumbURL = image.get('srcThumbStyle'),
                    $thumbItem = $('<div class="image-thumb"><img src="" alt=""/></div>');

                $('img', $thumbItem).attr('src', thumbURL);
                $('.list-thumb-content', $listThumb).append($thumbItem);
            });

            this.$listThumb = $listThumb;
        },
        initThumbList: function() {
            var numberThumbItems = Math.floor(this.$el.width()/this.thumbWidth),
                thumbListWidth, thumbListMargin, owl;

            if (numberThumbItems > this.model.get('images').length)
                numberThumbItems = this.model.get('images').length;

            if (numberThumbItems < 2) {
                numberThumbItems = 2;
                thumbListWidth = '';
                thumbListMargin = '';
            }
            else {
                thumbListWidth = numberThumbItems*this.thumbWidth;
                thumbListMargin = (this.$el.width() - thumbListWidth)/2;
            }

            this.stOwlThumb =  {
                pagination: false,
                items: numberThumbItems,
                itemsDesktop: false,
                itemsDesktopSmall: false,
                itemsTablet: false,
                itemsMobile: false,
                responsiveRefreshRate : 100,
                afterInit : function($el) {
                    $el.find(".owl-item").eq(0).addClass("synced");
                }
            }

            if (this.owlThumb) {
                owl = this.owlThumb.data('owlCarousel');
                if (owl)
                    owl.destroy();
            }
            this.owlThumb = AWEContent.jqIframe('.list-thumb-content', this.$listThumb).width(thumbListWidth).css('margin-left', thumbListMargin);
            this.owlThumb.owlCarousel(this.stOwlThumb);
        },
        getImageStyleURL: function(styleAttribute) {
            var self = this,
                fids = [],
                styles = this.model.get(styleAttribute);

            this.model.get('images').each(function(image) {
                fids.push(image.get('fid'));
            });

            // get images url from server
            if (fids.length) {
                $.post(AWEContent.Path.imageStyleURL, {fids: fids.join(','), styles: styles}, function(response) {
                    if ($.type(response) == 'string')
                        response = JSON.parse(response.trim());

                    // create event images get success
                    self.$el.trigger('getImagesStyleSuccess', [styleAttribute, response]);
                });
            }
        },
        applySettingsChanged: function(model) {
            var self = this,
                settings = model.toJSON(),
                images = self.model.get('images'),
                $slideShow = $('.awe-slideshow', self.el),
                heightBefore = self.$el.height();

            $.each(model.changedAttributes(), function(key, value){
                self.$el.changeResponsive(key, value);
                $slideShow.renderChangeSettingBoxModel(key, value, model);

                switch (key) {
                    case 'styleImage':
                    case 'styleThumb':
                        self.getImageStyleURL(key);
                        break;

                    case 'effectSlide':
                        self.settingsOwl.transitionStyle = value;
                        self.owlSlide.data('owlCarousel').reinit(self.settingsOwl);
                        break;

                    case 'nav':
                        if (value == 'thumbnail') {
                            self.getThumbImageSize()
                            var waitCalculateThumb = setInterval(function() {
                                if (self.thumbWidthLoaded) {
                                    // clear interval
                                    clearInterval(waitCalculateThumb);

                                    // Re-render thumb list
                                    self.renderThumbList();
                                    self.initThumbList();

                                    if (settings.positionThumb == 'top')
                                        $slideShow.prepend(self.$listThumb);
                                    else
                                        $slideShow.append(self.$listThumb);
                                }
                            }, 100);

                            self.settingsOwl.pagination = false;
                            self.settingsOwl.paginationNumbers = false;
                        }
                        else {
                            if ($('.owl-list-thumb', self.el).length)
                                $('.owl-list-thumb', self.el).remove();
                            if (value == 'none'){
                                self.settingsOwl.pagination = false;
                                self.settingsOwl.paginationNumbers = false;
                            }
                            else if (value == 'number'){
                                self.settingsOwl.pagination = true;
                                self.settingsOwl.paginationNumbers = true;
                            }
                            else if (value == 'button') {
                                self.settingsOwl.pagination = true;
                                self.settingsOwl.paginationNumbers = false;
                            }
                        }
                        self.owlSlide.data('owlCarousel').reinit(self.settingsOwl);
                        break;

                    case 'positionThumb':
                        if (value == 'top') {
                            $slideShow.prepend(self.$listThumb);
                        }
                        else if (value == 'bottom') {
                            $slideShow.append(self.$listThumb);
                        }
                        break;

                    case 'showControls':
                        var showControl = value ? true : false;
                        self.settingsOwl.navigation  = showControl;
                        self.owlSlide.data('owlCarousel').reinit(self.settingsOwl);
                        break;

                    case 'autoPlay':
                        break
                    case 'stopOnHoverSlide' :
                        break;

                    case 'speedImage':
                        break;

                    case 'transSpeed':
                        break;

                    case 'caption':
                        // set caption flag for all image in slideshow
                        images.each(function(image) {
                            image.set('enableCaption', value);
                        });

                        // implements change view
                        if (value) {
                            $slideShow.removeClass('disable-caption');
                            $('.edit-caption', $slideShow).show();

                            if (settings.captionPosition == 'over')
                                $('.awe-image-overlay', self.$el).css('background-color', settings.imageBgOverlay);
                        }
                        else {
                            $slideShow.addClass('disable-caption');
                            $('.edit-caption', $slideShow).hide();
                        }
                        break;

                    case 'captionColor':
                        $('.awe-image-caption', $slideShow).css('color', value);
                        break;

                    case 'captionPosition':
                        images.each(function(image) {
                            image.set('captionPosition', value);
                        });
                        if (value != 'over')
                            $slideShow.removeClass('caption-hover');
                        else {
                            $('.awe-image-overlay', self.$el).css('background-color', settings.imageBgOverlay);
                            if (settings.captionOnHover)
                                $slideShow.addClass('caption-hover')
                        }
                        break;

                    case 'captionOnHover':
                        if (value && settings.captionPosition == 'over')
                            $slideShow.addClass('caption-hover');
                        else
                            $slideShow.removeClass('caption-hover');
                        break;

                    case 'imageBgOverlay':
                        $('.owl-item .awe-image-content > .awe-image-overlay', self.$el).css('background-color', value);
                        break;

                    case 'customID':
                        $slideShow.attr('id', value);
                        break;

                    case 'customClass':
                        var prevClass = self.model.previousAttributes().classGallery;
                        $slideShow.removeClass(prevClass).addClass(value);
                        break;

                    case 'customEnableAttributes':
                        $slideShow.renderChangeSettingsAttributes(key, value, settings.customDataAttributes);
                        break;

                    case 'customActionAttributes':
                        $slideShow.renderChangeSettingsAttributes(key, value);
                        break;

                    case 'customEnableAnimations':
                        var animation, prevAnimation;
                        if (value) {
                            animation = settings.customDataAnimations;
                            prevAnimation = null;
                            $slideShow.processAnimations(animation);
                        }
                        else {
                            animation = null;
                            prevAnimation = settings.customDataAnimations;
                            $slideShow.processAnimations(animation, prevAnimation);
                        }
                        break;

                    case 'customDataAnimations':
                        var animation, prevAnimation;
                        animation = settings.customDataAnimations;
                        prevAnimation = self.model.previousAttributes().customDataAnimations;
                        $slideShow.processAnimations(animation, prevAnimation);
                        break;
                }
            });

            // Listen event change height of item
            setTimeout(function() {
                self.checkChangeHeight(heightBefore);
            }, 100);
        },
        addImage : function(model, collection, options){
            var self = this,
                $item = $('<div class="image-thumb"><img src="" alt=""></div>');

            $('img', $item).attr('src', model.get('srcThumbStyle'));
            if (this.model.toJSON().images.length < 2) {
                self.$listThumb.append($item);
                $('.alert.alert-danger', self.el).remove();
                this.readyOwlCarousel();
            }
            else {
                self.owlSlide.data('owlCarousel').addItem(model.view.$el);
                self.owlThumb.data('owlCarousel').addItem($item);
                self.$el.find('.mgf-md-popup img').eq(collection.length -1).trigger('change', {action: 'changeThumbnail'});
            }

            self.initThumbList();

            // Resize Item
            self.resizeItem();
        },
        removeImage : function(model, collection){
            var self = this,
                indexImage = model.view.$el.parent('.owl-item').index();

            self.owlSlide.data('owlCarousel').removeItem(indexImage);
            self.owlThumb.data('owlCarousel').removeItem(indexImage);
            AWEContent.Panels.slideshow.setPanelElementsValue();

            // Resize Item
            self.resizeItem();
        },
        getThumbImageSize: function() {
            var self = this,
                thumbStyle = this.model.get('styleThumb') != 'none',
                imageURL = this.model.get('images').at(0).get('srcThumbStyle'),
                $image = $('<img class="awe-test-image" src="" alt="" />').attr('src', imageURL).css({opacity: 0, visibility: 'hidden'});

            self.thumbWidthLoaded = false;

            if (thumbStyle && thumbStyle != 'none') {
                $image.load(function() {
                    self.thumbWidth = this.naturalWidth;
                    $('.awe-test-image').remove();
                    self.thumbWidthLoaded = true;
                });

                $('body').append($image);
            }
            else {
                self.thumbWidth = 150;
                self.thumbWidthLoaded = true;
            }
        }
    });

    AWEContent.Views.SlideShowController = AWEContent.Views.ItemController.extend({
        machineName: 'slideshow',
        controllerHtml: function() {
            return '<div class="title-icon">Slideshow</div><i class="ic ac-icon-slideshow"></i>';
        },
        createItemModel: function(templateData) {
            var boxModelSettings;

            if (templateData!= undefined) {
                var images ;
                boxModelSettings = new AWEContent.Models.BoxModelSettings(templateData.boxModelSettings);
                images =  new  AWEContent.Collections.ListImageSlide(templateData.images);
                templateData.boxModelSettings = boxModelSettings;
                templateData.images = images;
                templateData.createFromDefault = false;
                return new AWEContent.Models.SlideShowItem(templateData);
            }
            else {
                boxModelSettings = new AWEContent.Models.BoxModelSettings();
                var image = new AWEContent.Models.ImageSlide({
                        srcImageStyle : AWEContent.Path.defaultImage,
                        srcThumbStyle : AWEContent.Path.defaultImage
                    }),
                    listImage = new AWEContent.Collections.ListImageSlide([image]);
                return new AWEContent.Models.SlideShowItem({boxModelSettings : boxModelSettings, images: listImage, createFromDefault: true});
            }

        }
    });

    AWEContent.Views.SlideShowPanel = AWEContent.Views.ItemPanel.extend({
        tagName: "div",
        className: "awe-obj-panel slideshow-panel",
        panelName: "slideshow",
        initPanel: function() {
            AWEContent.Views.ItemPanel.prototype.initPanel.call(this);
            var self = this;

            $('#slideshow-select-image .control-gallery input[name=selected_media]', self.el).change( function(){
                var data = $(this).val(),
                    template = '<div class="book-lib"><i class="ic ac-icon-done"></i><img src="" alt="book"><input type="hidden" name="selected_media"/></div>',
                    images = '',
                    hasDefaultImage = false;

                try {
                    images = $.parseJSON(data);
                } catch (e) {}

                if (typeof images == 'object') {
                    var $library = $('#slideshow-select-image .library', self.el),
                        imageStyle = self.editingModel.get('styleImage'),
                        thumbStyle = self.editingModel.get('styleThumb'),
                        styles = imageStyle + ',' + thumbStyle,
                        images_fid = [];

                    // get fid of images which is used in gallery
                    $.each(images, function() {
                        images_fid.push(this.fid);
                    });

                    // get images style url
                    if (AWEContent.Path.imageStyleURL != '') {
                        $.post(AWEContent.Path.imageStyleURL, {fids: images_fid.join(','), styles: styles}, function(response) {

                            if ($.type(response) == 'string') {
                                try {
                                    response = JSON.parse(response);
                                }
                                catch(e){}
                            }

                            // update image style url to gallery image view
                            if (typeof (response)  == 'object') {
                                $.each(images, function() {
                                    var image = this,
                                        options = {
                                            fid: image.fid,
                                            srcThumbStyle: response[image.fid][self.editingModel.get('styleThumb')],
                                            srcImageStyle: response[image.fid][self.editingModel.get('styleImage')],
                                            captionPosition : self.editingModel.get('captionPosition'),
                                            enableLightBox: self.editingModel.get('enableLightBox')
                                        };

                                    if (!self.editingModel.get('images').length && self.editingModel.get('createFromDefault')) {
                                        self.editingModel.set('createFromDefault', false);
                                    }
                                    if (self.editingModel.get('createFromDefault')) {
                                        self.editingModel.set('createFromDefault', false);
                                        self.editingModel.get('images').at(0).set(options);
                                        $('img', $library).eq(0).attr('src', image.file_url);
                                        hasDefaultImage = true;
                                    }
                                    else {
                                        var modelImage = new AWEContent.Models.ImageSlide(options),
                                            $thumbnail = $(template);

                                        // add chose images to list in gallery
                                        $('img', $thumbnail).attr('src', image.file_url);
                                        $library.append($thumbnail);

                                        self.editingModel.get('images').add(modelImage);
                                    }
                                });

                                // Change image thumbnail for first add image
                                if (hasDefaultImage)
                                    self.editingModel.view.getImageStyleURL('styleThumb');
                            }
                        });
                    }
                    else {
                        $.each(images, function() {
                            var image = this,
                                options = {
                                    fid: image.fid,
                                    srcThumbStyle: image.file_url,
                                    srcImageStyle: image.file_url,
                                    captionPosition :  self.editingModel.get('captionPosition'),
                                    enableLightBox : self.editingModel.get('enableLightBox')
                                };
                            if (!self.editingModel.get('images').length && self.editingModel.get('createFromDefault')) {
                                self.editingModel.set('createFromDefault', false);
                            }
                            if (self.editingModel.get('createFromDefault')) {
                                self.editingModel.set('createFromDefault', false);
                                self.editingModel.get('images').at(0).set(options);
                                $('img', $library).eq(0).attr('src', image.file_url);
                            }
                            else {
                                var modelImage = new AWEContent.Models.ImageSlide(options),
                                    $thumbnail = $(template);

                                // add chose images to list in gallery
                                $('img', $thumbnail).attr('src', image.file_url);
                                $library.append($thumbnail);

                                self.editingModel.get('images').add(modelImage);
                            }
                        });
                    }
                }
            });
            $('#slideshow-select-image', self.el).delegate('.book-lib input[name=selected_media]', 'change', function(){
                var $booklib = $(this).closest('.book-lib'),
                    index = $booklib.index(),
                    modelImage = self.editingModel.get('images').at(index),
                    imageStyle = self.editingModel.get('styleImage'),
                    thumbStyle = self.editingModel.get('styleThumb'),
                    styles = imageStyle + ',' + thumbStyle,
                    imageData = $.parseJSON($(this).val().trim());

                if (imageData) {
                    // change gallery image thumbnail and item image source
                    if (AWEContent.Path.imageStyleURL != '') {
                        $.post(AWEContent.Path.imageStyleURL, {fids: '' + imageData.fid, styles: styles}, function(response) {
                            modelImage.set({
                                fid: imageData.fid,
                                srcThumbStyle: response[imageData.fid][self.editingModel.get('styleThumb')],
                                srcImageStyle: response[imageData.fid][self.editingModel.get('styleImage')]
                            });
                        });
                    }
                    else {
                        modelImage.set({
                            fid: imageData.fid,
                            srcThumbStyle: imageData.file_url,
                            srcImageStyle: imageData.file_url
                        });
                    }
                    $('img', $booklib).attr('src', imageData.file_url);
                    // change flag for first change images
                    if (self.editingModel.get('createFromDefault'))
                        self.editingModel.set('createFromDefault', false);
                }
            });

            // remove style none in thumbnail style
            $('li[data-value=none]', $('#slideshow-style-thumbnail', this.el)).remove();
            $('#slideshow-style-thumbnail', this.el).change(function(event, values) {
                self.editingModel.set('styleThumb', values.value);
            });
            $('#slideshow-style-image', this.el).change(function(event, values) {
                self.editingModel.set('styleImage', values.value);
            });
            $('#slideshow-effect', this.el).change(function(event, values) {
                self.editingModel.set('effectSlide', values.value);
            });
            $('#slideshow-navigation', this.el).change(function(event, values) {
                self.editingModel.set('nav', values.value);
                if (values.value == 'thumbnail')
                    $('#slideshow-style-thumbnail, #slideshow-position-thumbnail, .slideshow-thumb-style-title', self.el).show();
                else
                    $('#slideshow-style-thumbnail, #slideshow-position-thumbnail, .slideshow-thumb-style-title', self.el).hide()
            });
            $('#slideshow-position-thumbnail', this.el).change(function(event, values) {
                self.editingModel.set('positionThumb', values.value);
            });
            $("#slideshow-show-control input[name=toggle_value]", this.el).change(function(event, isInitPanel) {
                if (!isInitPanel)
                    self.editingModel.set("showControls", parseInt($(this).val()));
            });
            $("#slideshow-stop-on-hover input[name=toggle_value]", this.el).change(function(event, isInitPanel) {
                if (!isInitPanel)
                    self.editingModel.set("stopOnHoverSlide", parseInt($(this).val()));
            });
            $("#slideshow-autoplay input[name=toggle_value]", this.el).change(function(event, isInitPanel) {
                if (!isInitPanel)
                    self.editingModel.set("autoPlay", parseInt($(this).val()));
                if(parseInt($(this).val())){
                    $('#slideshow-stop-on-hover, #slideshow-speed, #slideshow-trans-speed', self.el).show();
                }
                else {
                    $('#slideshow-stop-on-hover, #slideshow-speed, #slideshow-trans-speed', self.el).hide();
                }
            });
            $('#slideshow-speed', this.el).change(function(event, values) {
                self.editingModel.set('speedImage', values.value);
            });
            $('#slideshow-trans-speed', this.el).change(function(event, values) {
                self.editingModel.set('transSpeed', values.value);
            });
            $("#slideshow-enable-caption input[name=toggle_value]", this.el).change(function(event, isInitPanel) {
                if (!isInitPanel)
                    self.editingModel.set("caption", parseInt($(this).val()));

                $('#slideshow-image-bg-overlay, #slideshow-position-caption, #slideshow-on-hover, #slideshow-caption-color', self.el).hide();
                if (parseInt($(this).val())) {
                    $('#slideshow-position-caption, #slideshow-caption-color', self.el).show();
                    if (self.editingModel.get('captionPosition') == 'over')
                        $('#slideshow-image-bg-overlay, #slideshow-on-hover', self.el).show();
                }
            });
            $('#slideshow-caption-color', self.el).change(function(event, color) {
                color = color ? color.toRgbString() : '';
                self.editingModel.set('captionColor', color);
            });

            $('#slideshow-position-caption', this.el).change(function(event, values) {
                self.editingModel.set('captionPosition', values.value);

                $('#slideshow-on-hover, #slideshow-image-bg-overlay', self.el).hide();
                if (self.editingModel.get('captionPosition') == 'over')
                    $('#slideshow-on-hover, #slideshow-image-bg-overlay', self.el).show();
            });
            $("#slideshow-on-hover input[name=toggle_value]", this.el).change(function(event, isInitPanel) {
                if (!isInitPanel)
                    self.editingModel.set("captionOnHover", parseInt($(this).val()));
            });
            $('#slideshow-image-bg-overlay', self.el).change(function(event, color) {
                color = color ? color.toRgbString() : '';
                self.editingModel.set('imageBgOverlay', color);
            });
            $('#slideshow-layout-tab', self.el).initBoxModelPanel(self, "boxModelSettings");
            $('#text-slideshow-custom-id', this.el).change(function(){
                self.editingModel.set('customID', $(this).val());
            });
            $('#text-slideshow-custom-classes', this.el).change(function(){
                self.editingModel.set('customClass', $(this).val());
            });
            $('#slideshow-custom-attributes', this.el).initAttributesPanel(self);
            $('#slideshow-animations input[name=enabled_custom_animation]', this.el).change(function(event, data) {
                self.editingModel.set('customEnableAnimations', parseInt($(this).val()));
                if (data){
                    self.editingModel.set('customDataAnimations', JSON.stringify(data.animations));
                }
            });
        },
        setPanelElementsValue: function() {
            var self = this,
                settings = this.editingModel.toJSON(),
                template = '<div class="book-lib"><i class="ic ac-icon-done"></i><img src="" alt="book"><input type="hidden" name="selected_media"/></div>',
                $library = $('#slideshow-select-image .library', self.el);

            $library.empty();
            $.each(settings.images, function(idImage, image){
                var $bookLib = $(template);
                $('img', $bookLib).attr('src', image.srcImageStyle);
                $library.append($bookLib);
            });
            if (AWEContent.Path.imageStyleURL != '') {
                $('#slideshow-style-image', self.el).aweSelect('value', settings.styleImage);
                $('#slideshow-style-thumbnail', self.el).aweSelect('value', settings.styleThumb);
            }
            else {
                $('#slideshow-style-image, #slideshow-style-thumbnail', self.el).remove();
            }

            $('#slideshow-effect', self.el).aweSelect('value', settings.effectSlide);
            $('#slideshow-navigation', self.el).aweSelect('value', settings.nav);
            $('#slideshow-position-thumbnail', self.el).aweSelect('value', settings.positionThumb);
            $("#slideshow-show-control input[name=toggle_value]", self.el).val(settings.showControls).trigger("change", true);
            $("#slideshow-stop-on-hover input[name=toggle_value]", self.el).val(settings.stopOnHoverSlide).trigger("change", true);
            $("#slideshow-autoplay input[name=toggle_value]", self.el).val(settings.autoPlay).trigger("change", true);
            $('#slideshow-speed', this.el).aweSlider('value', settings.speedImage);
            $('#slideshow-trans-speed', this.el).aweSlider('value', settings.transSpeed);
            $("#slideshow-enable-caption input[name=toggle_value]", self.el).val(settings.caption).trigger("change", true);
            $("#slideshow-caption-color", self.el).aweColorPicker('value', settings.captionColor);
            $('#slideshow-position-caption', self.el).aweSelect('value', settings.captionPosition);
            $("#slideshow-on-hover input[name=toggle_value]", self.el).val(settings.captionOnHover).trigger("change", true);
            $("#slideshow-image-bg-overlay", self.el).aweColorPicker('value', settings.imageBgOverlay);
            $('#slideshow-layout-tab', self.el).initBoxModel(settings.boxModelSettings);
            $('#text-slideshow-custom-id', self.el).val(settings.customID);
            $('#text-slideshow-custom-classes', self.el).val(settings.customClass);
            $('#slideshow-custom-attributes', self.el).initAttributes(settings.customEnableAttributes, settings.customDataAttributes);
            $('#slideshow-animations input[name=enabled_custom_animation]', self.el).val(settings.customEnableAnimations).trigger('change');
            $('#slideshow-animations input[name=enabled_custom_animation]', self.el).attr('data-animations', settings.customDataAnimations).data('view', this.editingModel.view);
        },
        buildPanel: function() {
            return {
                "title": {
                    "type": "markup",
                    "markup": "<div class=\"awe-title\"><h2>Slide Show<\/h2><\/div>"
                },
                custom_style : {
                    'type' : 'section',
                    'select_image' : {
                        'type' : 'gallery',
                        'title' : 'Add Images',
                        'columns' : 4
                    },
                    'style_image' : {
                        type: "image_style_list",
                        title: 'Image Style',
                        attributes: {
                            'class': ['long-title']
                        }
                    },
                    'effect' : {
                        type: "select",
                        title: "Effect",
                        options: {
                            "fade" : "Fade",
                             'backSlide': 'Back Slide',
                             'goDown' : 'Go Down',
                             'fadeUp' : 'Fade Up'
                        },
                        default_value: "fade"
                    },
                    'navigation' : {
                        type: "select",
                        title: "Nav",
                        options: {
                            "none" : "None",
                            'button' : 'Button',
                            "thumbnail" : "Thumbnail",
                            "number" : "Number"
                        },
                        default_value: "none"
                    },
                    'style_thumbnail' : {
                        type: "image_style_list",
                        title: 'Thumbnail Image Style',
                        attributes: {
                            'class': ['long-title']
                        }
                    },
                    'position_thumbnail' : {
                        type: "select",
                        title: "Position",
                        options: {
                            "top" : "Top",
                            "bottom" : "Bottom"
                        },
                        default_value: "bottom"
                    },
                    show_control: {
                        'type' : 'toggle',
                        'title' : 'Show controls',
                        'default_value': 0
                    }
                },
                custom_easing : {
                    type: 'section',
                    'autoplay' : {
                        'type' : 'toggle',
                        'title' : 'AutoPlay',
                        'default_value': 0
                    },
                    stop_on_hover: {
                        'type' : 'toggle',
                        'title' : 'Stop On Hover',
                        'default_value': 1
                    },
                    "speed": {
                        "type": "slider",
                        "title": "Speed",
                        "min_value": 0,
                        "max_value": 10000,
                        "default_value": 4000,
                        'unit': 'ms',
                        "allow_type": true
                    },
                    "trans-speed": {
                        "type": "slider",
                        "title": "Trans Speed",
                        "min_value": 0,
                        "max_value": 10000,
                        "default_value": 500,
                        'unit': 'ms',
                        "allow_type": true
                    }
                },
                custom_control : {
                    type: 'section',
                    "enable_caption": {
                        "type": "toggle",
                        "title": "Caption",
                        "default_value": 0
                    },
                    caption_color: {
                        type: 'colorpicker',
                        title: "Caption Color",
                        options: {
                            "preferredFormat"  : "rgb",
                            "AlphaVerticle"  : true,
                            "showAlpha"  : true,
                            "allowEmpty" : true,
                            "showInput" : true
                        }
                    },
                    'position_caption' : {
                        type: "select",
                        title: "Position",
                        options: {
                            "top" : "Top",
                            "bottom" : "Bottom",
                            "over" : "Over"
                        },
                        default_value: "top"
                    },
                    'on_hover' : {
                        "type": "toggle",
                        "title": "Display on hover",
                        "default_value": 0
                    },
                    image_bg_overlay: {
                        type: 'colorpicker',
                        title: "BgOverlay",
                        options: {
                            "preferredFormat"  : "rgb",
                            "AlphaVerticle"  : true,
                            "showAlpha"  : true,
                            "allowEmpty" : true,
                            "showInput" : true
                        }
                    }
                },
                'box_settings' : {
                    type: "section",
                    layout_tab: {
                        type: "tabs",
                        tabs: [
                            {
                                tab_title: "Border",
                                contents: {
                                    header_border: {
                                        type: "box_border",
                                        min_value: 0,
                                        max_value: 100,
                                        default_value: 0
                                    }
                                }
                            },
                            {
                                tab_title: "Radius",
                                contents: {
                                    header_boder_radius: {
                                        type: "box_model",
                                        model_type: "border_radius",
                                        min_value: 0,
                                        max_value: 100,
                                        allow_type: true
                                    }
                                }
                            },
                            {
                                tab_title: "Padding",
                                contents: {
                                    header_padding: {
                                        type: "box_model",
                                        model_type: "padding",
                                        allow_type: true,
                                        min_value: 0,
                                        max_value: 100
                                    }
                                }
                            },
                            {
                                tab_title: "Margin",
                                contents: {
                                    header_margin: {
                                        type: "box_model",
                                        model_type: "margin",
                                        allow_type: true,
                                        min_value: 0,
                                        max_value: 100
                                    }
                                }
                            }
                        ]
                    }
                },
                'definitions' : {
                    type: "section",
                    custom_id: {
                        type: "text_field",
                        title: "ID",
                        default_value: ""
                    },
                    custom_classes: {
                        type: "text_field",
                        title: "Class",
                        default_value: ""
                    },
                    custom_attributes: {
                        type: "custom_attributes"
                    },
                    animations: {
                        type: "animations"
                    }
                }
            };
        }
    });

    $(document).ready(function() {
        AWEContent.Controllers.slideshow = new AWEContent.Views.SlideShowController();
        AWEContent.Panels.slideshow = new AWEContent.Views.SlideShowPanel();
    });
})(jQuery);
