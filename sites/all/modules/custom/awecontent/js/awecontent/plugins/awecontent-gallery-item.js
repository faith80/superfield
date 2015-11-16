/**
 * File: awecontent-gallery-item.js
 * Author: AWEThemes
 * Website: http://awethemes.com/
 */
(function ($) {
    "use strict";

    /**
     * Define model for header item
     */
    AWEContent.Models.Image = Backbone.RelationalModel.extend({
        defaults: {
            fid: -1,
            srcThumbStyle: '',
            srcImageStyle: '',
            linkImage: '',
            captionImage: '',
            targetImage: 1,
            enableCaption: 0,
            enableLightBox: 1,
            captionPosition: 'top',
            boxModelSettings: {}
        },
        relations: [
            {
                type: Backbone.HasOne,
                key: "boxModelSettings",
                relatedModel: AWEContent.Models.BoxModelSettings
            }
        ],
        createView: function () {
            this.view = new AWEContent.Views.Image({model: this});
        },
        getView: function () {
            return this.view;
        },
        clone: function () {
            var cloneModel = {};
            $.each(this.toJSON(), function (key, value) {
                cloneModel[key] = value;
            });
            cloneModel.boxModelSettings = new AWEContent.Models.BoxModelSettings(cloneModel.boxModelSettings);
            return new AWEContent.Models.Image(cloneModel);
        }
    });

    AWEContent.Views.Image = Backbone.View.extend({
        tagName: 'li',
        className: 'md-item-image',
        events: {
            'click .awe-box-btn': 'changeContent',
            'click .edit-link': 'editLink',
            'click .edit-caption': 'editCaption',
            'click .remove-image': 'destroyImage'
        },
        template: _.template(
            '<div class="awe-image-item">\
                <a class="mgf-md-popup <%= enableLightBox %>" target="<%= targetImage %>" href="<%= extendImage %>">\
                    <div class="awe-image-content">\
                        <% if (captionPos == "over" || captionPos == "top") { %>\
                        <div class="awe-image-caption"><%= captionImage %></div>\
                        <% } %>\
                        <div class="awe-image-container"><img src="<%= srcImage %>" alt=""></div>\
                        <% if (captionPos == "bottom") { %>\
                        <div class="awe-image-caption"><%= captionImage %></div>\
                        <% } %>\
                    </div>\
                </a>\
                <div class="awe-image-control">\
                    <ul>\
                        <li class="edit-link"<% if (enableLightBox) { %> style="display: none;" <% } %>>\
                            <i class="ic ac-icon-link"></i>\
                            <div class="awe-control-box">\
                                <div class="awe-box-header">Image link</div>\
                                <div class="awe-box-content">\
                                    <div class="awe-box-item">\
                                        <textarea></textarea>\
                                    </div>\
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
                        <li class="edit-caption"<% if (!enableCaption) { %> style="display: none;" <% } %>>\
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
        initialize: function () {
            this.listenTo(this.model, 'change', this.changeSettings);
            this.listenTo(this.model.get('boxModelSettings'), 'change', this.changeSettings);
            this.render();

            this.$el.delegate('.awe-control-box', 'click', function (event) {
                event.stopPropagation();
            });
        },
        render: function () {
            var self = this,
                settings = self.model.toJSON(),
                srcThumbStyle = settings.srcThumbStyle,
                srcImageStyle = settings.srcImageStyle,
                linkImage = settings.linkImage ? settings.linkImage : 'javascript:void(0)',
                captionImage = settings.captionImage,
                targetImage = settings.targetImage ? '_blank' : '_self',
                enableLightBox = settings.enableLightBox ? 'open-lightbox' : '',
                extendImage = settings.enableLightBox ? srcImageStyle : linkImage;

            if (settings.linkImage == '')
                targetImage = '_self';

            self.$el.append(self.template({
                srcImage: srcThumbStyle,
                captionImage: captionImage,
                enableLightBox: enableLightBox,
                enableCaption: settings.enableCaption,
                targetImage: targetImage,
                extendImage: extendImage,
                captionPos: settings.captionPosition
            }));
            self.$img = $('img', self.el);
            self.$mgfPopup = $('.mgf-md-popup', self.el);

            if (settings.captionPosition == 'over')
                self.$el.addClass('position-over');

            $('.awe-image-content', self.el).renderItemDefaultBoxModel(settings.boxModelSettings);

            setTimeout(function () {
                self.resizeImage()
            }, 50);

            return self.$el;
        },
        resizeImage: function () {
            this.$img.css({width: '', height: ''});
            var width = this.$img.width(),
                height = this.$img.height(),
                ratio = 0.75;

            if ((height / width) > ratio) {
                width = '100%';
                height = 'auto';
            }
            else {
                width = 'auto';
                height = '100%'
            }
            this.$img.css({width: width, height: height});
        },
        changeSettings: function (model) {
            var self = this,
                settings = self.model.toJSON(),
                $imagePopup = $('.mgf-md-popup', self.el),
                $caption = $('.awe-image-caption', self.el),
                $imageContent = $('.awe-image-content', self.el);

            $.each(model.changedAttributes(), function (key, value) {
                switch (key) {
                    case 'srcThumbStyle':
                        self.$img.attr('src', value);
                        self.$img.load(function () {
                            self.resizeImage();
                        });
                        break;

                    case 'srcImageStyle':
                        if (settings.enableLightBox) {
                            self.$mgfPopup.attr('href', value);
                        }
                        break;

                    case 'linkImage':
                        if (!settings.enableLightBox) {
                            self.$mgfPopup.attr('href', value);
                        }
                        break;

                    case 'captionImage':
                        $caption.html(value);
                        self.setMaxHeight(self.$el.index());
                        break;

                    case 'targetImage':
                        var target = value ? '_blank' : '_self';
                        $imagePopup.attr('target', target);
                        break;

                    case 'enableLightBox':
                        if (value)
                            self.$mgfPopup.addClass('open-lightbox').attr('href', settings.srcImageStyle);
                        else {
                            var imageLink = settings.linkImage ? settings.linkImage : 'javascript:void(0)';
                            self.$mgfPopup.removeClass('open-lightbox').attr('href', imageLink).attr('target', '_self');
                        }
                        break;

                    case 'captionPosition' :
                        self.$el.removeClass('position-over');
                        switch (value) {
                            case 'top':
                                $imageContent.prepend($caption);
                                break;

                            case 'bottom':
                                $imageContent.append($caption);
                                break;

                            case 'over':
                                self.$el.addClass('position-over');
                                break;
                        }
                        break;

                    default :
                        $('.awe-image-content', self.el).renderChangeSettingBoxModel(key, value, model);
                }
            });
        },
        changeContent: function (event) {
            event.preventDefault();
            event.stopPropagation();
            var self = this,
                $target = $(event.target),
                $closestLi = $target.closest('li.active'),
                content = $('textarea', $closestLi).val();

            $closestLi.removeClass('active');
            if ($target.hasClass('js-ok')) {
                if ($closestLi.hasClass('edit-link')) {
                    var isTarget = $('.ckb-target', $closestLi).prop('checked');

                    self.model.set('linkImage', content);
                    self.model.set('targetImage', isTarget ? 1 : 0);
                }
                else if ($closestLi.hasClass('edit-caption')) {
                    self.model.set('captionImage', content);
                }
            }
        },
        editLink: function (event) {
            var self = this,
                linkImage = self.model.get('linkImage'),
                $target = $(event.target).hasClass('edit-link') ? $(event.target) : $(event.target).closest('.edit-link'),
                $textArea = $('textarea', $target);

            $target.siblings('li').removeClass('active');
            $target.toggleClass('active');
            $textArea.val(linkImage).parent().css('z-index', 999);
        },
        editCaption: function (event) {
            var self = this,
                captionImage = self.model.get('captionImage'),
                $target = $(event.target).hasClass('edit-caption') ? $(event.target) : $(event.target).closest('.edit-caption'),
                $textArea = $('textarea', $target);

            $target.siblings('li').removeClass('active');
            $target.toggleClass('active');
            $textArea.val(captionImage).parent().css('z-index', 999);
        },
        destroyImage: function () {
            this.model.destroy();
            this.$el.remove();
        },
        setMaxHeight: function (itemIndex) {
            if (itemIndex != undefined) {
                var columns = this.model.get('columns'),
                    startIndex = Math.floor(itemIndex / columns-1),
                    $images = $('li.md-item-image', this.$el.parent()).slice(startIndex, columns),
                    maxHeight = 0;

                $('.awe-image-caption', $images).css('height', '');

                $images.each(function () {
                    var height = $('.awe-image-caption', this).height()
                    if (height > maxHeight)
                        maxHeight = height;
                });
                if (maxHeight > 0)
                    $('.awe-image-caption', $images).height(maxHeight);
            }
        }
    });

    AWEContent.Collections.ListImage = Backbone.Collection.extend({
        model: AWEContent.Models.Image
    });
    AWEContent.Views.ListImage = Backbone.View.extend({
        tagName: 'ul',
        className: 'list-gallery clearfix',
        events: {},
        initialize: function () {
            this.listenTo(this.collection, 'add', this.addImage);
            this.listenTo(this.collection, 'destroy', this.removeImage);
            this.render();
        },
        render: function () {
            var self = this;

            self.collection.each(function (image, idImage) {
                image.createView();
                self.$el.append(image.getView().$el);
            });
        },
        addImage: function (model, collection) {
            model.createView();
            this.$el.append(model.getView().$el);
        }
    });

    AWEContent.Models.GalleryItem = AWEContent.Models.Item.extend({
        defaults: {
            machine_name: "gallery",
            images: [],
            columns: 5,
            customColumnsResponsive: 0,
            smallDesktopColumns: 4,
            tabletColumns: 3,
            mobileColumns: 1,
            styleImage: 'none',
            enableLightBox: 1,
            enableThumbnail: 1,
            styleThumb: 'none',
            enableCaption: 1,
            captionColor: '',
            captionPosition: 'over',
            captionOnHover: 0,
            imageBgOverlay: '',
            captionOnLightBox: 1,
            boxModelSettings: {},
            imageBoxModelSettings: {},
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
            smResponsive: true,
            itemsThumb: 5
        },
        relations: [
            {
                type: Backbone.HasOne,
                key: "boxModelSettings",
                relatedModel: AWEContent.Models.BoxModelSettings
            },
            {
                type: Backbone.HasOne,
                key: "imageBoxModelSettings",
                relatedModel: AWEContent.Models.BoxModelSettings
            },
            {
                type: Backbone.HasMany,
                key: 'images',
                relatedModel: AWEContent.Models.Image,
                relatedCollection: AWEContent.Collections.ListImage
            }
        ],
        createView: function () {
            this.view = new AWEContent.Views.GalleryItem({model: this});
        },
        clone: function () {
            var cloneModel = {},
                listImageModel = new AWEContent.Collections.ListImage();
            this.get('images').each(function (image, idImg) {

                listImageModel.add(image.clone());
            });
            $.each(this.toJSON(), function (key, value) {
                if (key != 'images') {
                    cloneModel[key] = value;
                }
            });
            cloneModel.images = listImageModel;
            cloneModel.boxModelSettings = new AWEContent.Models.BoxModelSettings(cloneModel.boxModelSettings);
            cloneModel.imageBoxModelSettings = new AWEContent.Models.BoxModelSettings(cloneModel.imageBoxModelSettings);
            return new AWEContent.Models.GalleryItem(cloneModel);
        }
    });

    /**
     * Define View for GalleryItem
     */
    AWEContent.Views.GalleryItem = AWEContent.Views.Item.extend({
        refreshGidImage: function () {
            if (AWEContent.Panels.gallery.isOpenned)
                AWEContent.Panels.gallery.setPanelElementsValue(true);
        },
        initialize: function () {
            AWEContent.Views.Item.prototype.initialize.call(this);
            this.listenTo(this.model.get("boxModelSettings"), "change", this.applySettingsChanged);
            this.listenTo(this.model.get("imageBoxModelSettings"), "change", this.applySettingsChangedImageStyle);
            this.listenTo(this.model.get('images'), 'remove', this.refreshGidImage);
            this.listenTo(this.model.get('images'), 'add', this.addImage);
        },
        applySettingsChangedImageStyle: function (model) {
            var self = this;
            $.each(model.changedAttributes(), function (key, value) {
                self.model.get('images').each(function (image, id) {
                    image.get('boxModelSettings').set(key, value);
                });
            });
        },
        renderItemContent: function () {
            var self = this,
                settings = self.model.toJSON(),
                images = self.model.get('images'),
                $gallery = $('<div class="awe-item awe-gallery"></div>'),
                listImageView = new AWEContent.Views.ListImage({collection: images});

            // add magnificPopup library
            AWEContent.Library.addLibrary('magnific', function () {
                setMagnificPopup();
            });

            $gallery.append(listImageView.$el);
            $gallery.addClass('image-col-' + settings.columns);
            if (settings.customColumnsResponsive)
                $gallery.addClass('image-col-md-' + settings.smallDesktopColumns + ' image-col-sm-' + settings.tabletColumns + ' image-col-xs-' + settings.mobileColumns);

            images.each(function (image) {
                settings.enableLightBox ? image.set('enableLightBox', 1) : image.set('enableLightBox', 0);
                (settings.enableCaption || (settings.enableLightBox && settings.captionOnLightBox)) ? image.set('enableCaption', 1) : image.set('enableCaption', 0);
                image.set('captionPosition', settings.captionPosition);
            });

            $gallery.attr('data-enable-thumb', settings.enableThumbnail ? true : false);
            $gallery.attr('data-caption-on-lightbox', settings.captionOnLightBox ? true : false);
            if (!settings.enableCaption)
                $gallery.addClass('disable-caption');
            if (settings.captionPosition == 'over') {
                // Render image overlay background
                $('li .awe-image-content', $gallery).prepend('<div class="awe-image-overlay"></div>');
                $('li .awe-image-content > .awe-image-overlay', $gallery).css('background-color', settings.imageBgOverlay);

                // render setting for hover to show caption
                if (settings.captionOnHover)
                    $gallery.addClass('caption-hover');
            }
            $gallery.attr('id', settings.customID).addClass(settings.customClass).renderItemDefaultBoxModel(settings.boxModelSettings);
            $gallery.renderItemDefaultAttributes(settings.customEnableAttributes, settings.customDataAttributes);
            if (settings.customEnableAnimations)
                $gallery.processAnimations(settings.customDataAnimations);
            self.$el.defaultResponsive(settings);

            // render caption color
            $('.awe-image-caption', $gallery).css('color', settings.captionColor);

            var _$ = AWEContent.jqIframe;
            self.isOpenThumb = false;

            var interval = setInterval(function () {
                if (AWEContent.contentIframe.find('.md-item-image').length > 0) {
                    clearInterval(interval);
                    var indexStart = 0,
                        indexStop = 0;

                    AWEContent.jqIframe('.list-gallery').sortable({
                        items: ' > li',
                        revert: true,
                        forcePlaceholderSize: true,
                        start: function (event, ui) {
                            $('.js-edit-item', self.$el).trigger('click');
                            indexStart = ui.item.index();
                        },
                        stop: function (event, ui) {
                            indexStop = ui.item.index();
                            if (indexStop != indexStart) {
                                var imageModel = self.model.get('images').remove(self.model.get('images').at(indexStart), {silent: true});
                                self.model.get('images').add(imageModel, {at: indexStop, silent: true});
                                AWEContent.Panels.gallery.setPanelElementsValue(true);
                                self.refreshGidImage();
                                self.setItemHeight();
                            }
                        }
                    });
                    setTimeout(function () {
                        self.resizeItem();
                        self.setItemHeight();
                    }, 50);
                }
            }, 50);
            $gallery.aweDragUpload({
                multiUpload: true,
                uploadSuccessCallback: function (response, id) {
                    if (response.status && response.file) {
                        var listImage = self.model.get('images'),
                            styleImage = self.model.get('styleImage'),
                            styleThumb = self.model.get('styleThumb'),
                            styles = styleImage + ',' + styleThumb,
                            image = response.file;

                        $.post(AWEContent.Path.imageStyleURL, {fids: '' + image.fid, styles: styles}, function (data) {
                            if ($.type(data) == 'string')
                                data = JSON.parse(data.trim());

                            if (self.model.get('createFromDefault') == true) {
                                self.model.get('images').at(0).set({
                                    fid: image.fid,
                                    srcThumbStyle: data[image.fid][self.model.get('styleThumb')],
                                    srcImageStyle: data[image.fid][self.model.get('styleImage')],
                                    enableCaption: self.model.get('enableCaption') || (self.model.get('enableLightBox') && self.model.get('captionOnLightBox'))
                                });
                                self.model.set('createFromDefault', false);
                            }
                            else {
                                var modelImage = new AWEContent.Models.Image({
                                    fid: image.fid,
                                    srcThumbStyle: data[image.fid][self.model.get('styleThumb')],
                                    srcImageStyle: data[image.fid][self.model.get('styleImage')],
                                    captionPosition: self.model.get('captionPosition'),
                                    enableLightBox: self.model.get('enableLightBox'),
                                    enableCaption: self.model.get('enableCaption') || (self.model.get('enableLightBox') && self.model.get('captionOnLightBox')),
                                    boxModelSettings: new AWEContent.Models.BoxModelSettings(self.model.get('imageBoxModelSettings').toJSON())
                                });
                                listImage.add(modelImage);
                                self.refreshGidImage();
                            }
                        });
                    }
                },
                uploadFinishedCallback: function () {
                    self.resizeItem();
                }
            });

            function setMagnificPopup() {
                AWEContent.jqIframe($gallery).magnificPopup({
                    delegate: '.open-lightbox',
                    type: 'image',
                    removalDelay: 300,
                    prependTo: '.awe-page-wrapper',
                    mainClass: 'mfp-fade',
                    callbacks: {
                        open: function (item, data) {
                            var $container = _$('.mfp-container'),
                                $content = _$('.mfp-content', $container),
                                $listThumb = _$('<div class="mdf-list-thumb"><div class="thumb-content"><div class="thumb-control"></div></div></div>'),
                                $thumbContent = _$('.thumb-content', $listThumb),
                                $thumbControl = _$('.thumb-control', $listThumb),
                                $listImage = _$('.mgf-md-popup img', self.el),
                                itemThumb = self.model.get('itemsThumb'),
                                openListThumb = this.ev.attr('data-enable-thumb');

                            // Add Navigation for list thumbnail
                            $thumbControl.append('<i class="ic ac-icon-arrow-left gallery-prev"></i><i class="ic ac-icon-arrow-right gallery-next"></i><input type="hidden" class="gallery-trigger"/>');
                            if (!$container.next('.mdf-list-thumb').length && openListThumb == 'true') {
                                _$.each($listImage, function (index, img) {
                                    var temp = $('<img src=""/>').attr('src', $(img).attr('src'));
                                    _$('.thumb-content', $listThumb).append(temp);
                                });
                                $content.after($listThumb);

                                // Event for thumbnail
                                $thumbContent.click(function (event) {
                                    event.stopPropagation();
                                });
                                $thumbContent.change(function (event, data) {
                                    if (data != undefined && typeof data.index == 'number') {
                                        var indexStart = data.index;

                                        _$('img', $thumbContent).removeClass('img-show');
                                        _$('img', $thumbContent).eq(indexStart).addClass('active');
                                        for (var i = 0; i < itemThumb; i++) {
                                            var tempIndex = indexStart + i;
                                            _$('img', $thumbContent).eq(tempIndex).addClass('img-show');
                                        }

                                        var countShow = _$('img.img-show', $thumbContent).length;
                                        if (countShow < itemThumb) {
                                            for (i = 0; i < itemThumb - countShow; i++) {
                                                tempIndex = indexStart - 1 - i;
                                                _$('img', $thumbContent).eq(tempIndex).addClass('img-show');
                                            }
                                        }
                                    }
                                });

                                // Click image thumbnail
                                _$('img', $thumbContent).click(function () {
                                    var index = _$(this).index() - 1;

                                    _$(this).addClass('active');
                                    _$(this).siblings('img').removeClass('active');
                                    _$.magnificPopup.instance.goTo(index);
                                });
                                _$('.gallery-trigger', $container).change(function (event, data) {
                                    event.stopPropagation();
                                    if (data != undefined && typeof data.index == 'number') {
                                        var index = data.index,
                                            $target = _$('img', $thumbContent).eq(index);

                                        $target.addClass('active');
                                        $target.siblings('img').removeClass('active');
                                        if (!$target.hasClass('img-show')) {
                                            $thumbContent.trigger('change', {index: index});
                                        }
                                    }
                                });

                                // Navigation next event image
                                _$('.gallery-next', $thumbControl).click(function () {
                                    if (_$('.img-show:last', $thumbContent).index() == _$('img', $thumbContent).length) {
                                        _$('.gallery-trigger', $container).trigger('change', {index: 0, isNav: true});
                                        _$('img.active', $thumbContent).removeClass('active');
                                    }
                                    else {
                                        var indexStart = _$('img.img-show:last', $thumbContent).index();

                                        _$('img.img-show', $thumbContent).removeClass('img-show');
                                        for (var i = 0; i < itemThumb; i++) {
                                            var tempIndex = indexStart + i;

                                            _$('img', $thumbContent).eq(tempIndex).addClass('img-show');
                                        }
                                        if (_$('.img-show', $thumbContent).length < itemThumb) {
                                            var count = _$('.img-show', $thumbContent).length,
                                                indexFirst = _$('.img-show:first', $thumbContent).index() - 1;
                                            for (i = 0; i < (itemThumb - count); i++) {
                                                var index = indexFirst - i - 1;
                                                _$('img', $thumbContent).eq(index).addClass('img-show');
                                            }
                                        }
                                    }
                                });

                                // Navigation previous event image
                                _$('.gallery-prev', $thumbControl).click(function () {
                                    if (_$('.img-show:first', $thumbContent).index() == 1) {
                                        var indexNew = $('img', $thumbContent).length - itemThumb;
                                        _$('.gallery-trigger', $container).trigger('change', {
                                            index: indexNew,
                                            isNav: true
                                        });
                                        _$('img.active', $thumbContent).removeClass('active');
                                    }
                                    else {
                                        var indexEnd = _$('img.img-show:first', $thumbContent).index() - 2;
                                        _$('img.img-show', $thumbContent).removeClass('img-show');
                                        for (var i = 0; i < itemThumb; i++) {
                                            var tempIndex = indexEnd - i;
                                            if (tempIndex >= 0 || tempIndex <= _$('img', $thumbContent) - 1)
                                                _$('img', $thumbContent).eq(tempIndex).addClass('img-show');
                                        }
                                        if (_$('.img-show', $thumbContent).length < itemThumb) {
                                            var count = _$('.img-show', $thumbContent).length,
                                                indexLast = _$('.img-show:last', $thumbContent).index() - 1;
                                            for (i = 0; i < (itemThumb - count); i++) {
                                                var index = indexLast + i + 1;
                                                _$('img', $thumbContent).eq(index).addClass('img-show');
                                            }
                                        }
                                    }
                                });
                            }
                        },
                        change: function (item) {
                            setTimeout(function () {
                                var $container = _$('.mfp-container'),
                                    $content = _$('.thumb-content', $container);

                                if (!self.isOpenThumb) {
                                    self.isOpenThumb = true;
                                    $content.trigger('change', {index: item.index})
                                }
                                _$('.gallery-trigger', $container).trigger('change', {index: item.index});
                            }, 50);
                        },
                        markupParse: function (template, values, item) {
                            var caption = $('.awe-image-caption', item.el).html(),
                                color = $('.awe-image-caption', item.el).css('color'),
                                isEnableCaption = this.ev.attr('data-caption-on-lightbox');

                            if (isEnableCaption && isEnableCaption == 'true')
                                values.description = $('<div />').html(caption).css('color', color);
                            else
                                values.description = '';
                        },
                        close: function () {
                            self.isOpenThumb = false;
                        }
                    },
                    gallery: {enabled: true},
                    image: {
                        headerFit: true,
                        captionFit: true,
                        preserveHeaderAndCaptionWidth: false,
                        markup:
                            '<div class="mfp-figure">\
                                <div class="mfp-img"></div>\
                                <div class="mfp-description"></div>\
                                <div class="mfp-counter"></div>\
                            </div>'
                    }
                });
            }

            return $gallery;
        },
        setItemHeight: function() {
            var $images = $('li.md-item-image', this.$el),
                columns = this.model.get('columns'),
                start = 0,
                length = $images.length;

            $('.awe-image-caption', $images).css('height', '');

            do {
                var $rowImages = $images.slice(start, columns),
                    maxHeight = 0;

                start = start + columns;

                $rowImages.each(function() {
                    var height = $('.awe-image-caption', this).height();
                    if (height > maxHeight) {
                        maxHeight = height;
                    }
                });
                $('.awe-image-caption', $rowImages).height(maxHeight);
            }
            while (start < length-1);
        },
        applySettingsChanged: function (model) {
            var self = this,
                settings = self.model.toJSON(),
                imagesModel = self.model.get('images'),
                $aweGallery = $('.awe-gallery', self.el),
                heightBefore = self.$el.height();

            $.each(model.changedAttributes(), function (key, value) {
                self.$el.changeResponsive(key, value);
                $aweGallery.renderChangeSettingBoxModel(key, value, model);

                switch (key) {
                    case 'columns' :
                        var prevColumns = 'image-col-' + self.model.previousAttributes().columns,
                            currentColumns = 'image-col-' + value;

                        $aweGallery.removeClass(prevColumns).addClass(currentColumns);

                        // Resize Item
                        self.resizeItem();
                        break;

                    case 'customColumnsResponsive':
                        var mdClass = 'image-col-md-' + settings.smallDesktopColumns,
                            tabletClass = 'image-col-sm-' + settings.tabletColumns,
                            mobileClass = 'image-col-xs-' + settings.mobileColumns;

                        if (value)
                            $aweGallery.addClass(mdClass + ' ' + tabletClass + ' ' + mobileClass);
                        else
                            $aweGallery.removeClass(mdClass + ' ' + tabletClass + ' ' + mobileClass);
                        break;

                    case 'smallDesktopColumns':
                        var previousClass = 'image-col-md-' + self.model.previousAttributes()[key];

                        $aweGallery.removeClass(previousClass).addClass('image-col-md-' + value);
                        break;

                    case 'tabletColumns':
                        var previousClass = 'image-col-sm-' + self.model.previousAttributes()[key];

                        $aweGallery.removeClass(previousClass).addClass('image-col-sm-' + value);
                        break;

                    case 'mobileColumns':
                        var previousClass = 'image-col-xs-' + self.model.previousAttributes()[key];

                        $aweGallery.removeClass(previousClass).addClass('image-col-xs-' + value);
                        break;

                    case 'styleImage':
                    case 'styleThumb':
                        var imageStyle = settings.styleImage,
                            thumbStyle = settings.styleThumb,
                            styles = imageStyle + ',' + thumbStyle,
                            fids = [];

                        // get current list images
                        $.each(imagesModel.toJSON(), function () {
                            fids.push(this.fid);
                        });

                        // get list style url
                        if (fids.length) {
                            $.post(AWEContent.Path.imageStyleURL, {
                                fids: fids.join(','),
                                styles: styles
                            }, function (response) {
                                if ($.type(response) == 'string')
                                    response = JSON.parse(response.trim());

                                // update new image source for list images
                                imagesModel.each(function (image) {

                                    if (response[image.get('fid')]) {
                                        image.set({
                                            srcThumbStyle: response[image.get('fid')][settings.styleThumb],
                                            srcImageStyle: response[image.get('fid')][settings.styleImage]
                                        });
                                    }
                                });
                            });
                        }
                        break;

                    case 'enableLightBox':
                        imagesModel.each(function (image) {
                            image.set('enableLightBox', value);
                        });

                        if ((value && settings.captionOnLightBox) || settings.enableCaption)
                            $('.edit-caption', $aweGallery).show();
                        else
                            $('.edit-caption', $aweGallery).hide();
                        break;

                    case 'enableThumbnail':
                        $aweGallery.attr('data-enable-thumb', value ? true : false);
                        break;

                    case 'enableCaption':
                        if (value) {
                            $aweGallery.removeClass('disable-caption');
                            $('.edit-caption', $aweGallery).show();
                        }
                        else {
                            $aweGallery.addClass('disable-caption');
                            if (!settings.enableLightBox || !settings.captionOnLightBox)
                                $('.edit-caption', $aweGallery).hide();
                        }
                        break;

                    case 'captionPosition':
                        imagesModel.each(function (image) {
                            image.set('captionPosition', value);
                        });
                        if (value != 'over') {
                            $aweGallery.removeClass('caption-hover');
                            $('li .awe-image-content > .awe-image-overlay', $aweGallery).remove();
                        }
                        else {
                            if (settings.captionOnHover)
                                $aweGallery.addClass('caption-hover');

                            // create background overlay for images
                            $('li .awe-image-content', $aweGallery).prepend('<div class="awe-image-overlay"></div>');
                            $('li .awe-image-content > .awe-image-overlay', $aweGallery).css('background-color', settings.imageBgOverlay);
                            $('li .awe-image-content > .awe-image-overlay', $aweGallery).click(function () {
                                $('.mgf-md-popup', $(this).parent()).trigger('click');
                            });
                        }
                        break;

                    case 'captionColor':
                        $('.awe-image-caption', $aweGallery).css('color', value);
                        break;

                    case 'captionOnHover':
                        if (value && settings.captionPosition == 'over')
                            $aweGallery.addClass('caption-hover');
                        else
                            $aweGallery.removeClass('caption-hover');
                        break;

                    case 'imageBgOverlay':
                        $('li .awe-image-content > .awe-image-overlay', $aweGallery).css('background-color', value);
                        break;

                    case 'captionOnLightBox':
                        $aweGallery.attr('data-caption-on-lightbox', value ? true : false);
                        if (!value && !settings.enableCaption)
                            $('.edit-caption', $aweGallery).hide();
                        else
                            $('.edit-caption', $aweGallery).show();

                        break;

                    case 'customID':
                        $aweGallery.attr('id', value);
                        break;

                    case 'customClass':
                        var prevClass = self.model.previousAttributes().customClass;
                        $aweGallery.removeClass(prevClass).addClass(value);
                        break;

                    case 'customEnableAttributes':
                        $aweGallery.renderChangeSettingsAttributes(key, value, settings.customDataAttributes);
                        break;

                    case 'customActionAttributes':
                        $aweGallery.renderChangeSettingsAttributes(key, value);
                        break;

                    case 'customEnableAnimations':
                        var animation, prevAnimation;
                        if (value) {
                            animation = settings.customDataAnimations;
                            prevAnimation = null;
                            $aweGallery.processAnimations(animation);
                        }
                        else {
                            animation = null;
                            prevAnimation = settings.customDataAnimations;
                            $aweGallery.processAnimations(animation, prevAnimation);
                        }
                        break;

                    case 'customDataAnimations':
                        var animation = settings.customDataAnimations,
                            prevAnimation = self.model.previousAttributes().customDataAnimations;

                        $aweGallery.processAnimations(animation, prevAnimation);
                        break;
                }
            });

            // Listen event change height of item
            setTimeout(function () {
                self.checkChangeHeight(heightBefore);
            }, 100);
        },
        addImage: function () {
            var self = this,
                $aweGallery = $('.awe-gallery', this.el);

            if (this.model.get('captionPosition') == 'over') {
                $('.md-item-image', $aweGallery).each(function () {
                    if ($('.awe-image-overlay', $(this)).length == 0) {
                        $('.awe-image-content', $(this)).prepend('<div class="awe-image-overlay"></div>');
                        $('.awe-image-overlay', $(this)).css('background-color', self.model.get('imageBgOverlay'));
                    }
                });
            }
        }
    });

    AWEContent.Views.GalleryItemController = AWEContent.Views.ItemController.extend({
        machineName: 'gallery',
        controllerHtml: function () {
            return '<div class="title-icon">Gallery</div><i class="ic ac-icon-gallery"></i>';
        },
        createItemModel: function (templateData) {
            var boxModelSettings, images, imageBoxModelSettings;

            if (templateData != undefined) {
                boxModelSettings = new AWEContent.Models.BoxModelSettings(templateData.boxModelSettings);
                images = new AWEContent.Collections.ListImage(templateData.images);
                templateData.boxModelSettings = boxModelSettings;
                templateData.images = images;
                templateData.createFromDefault = false;

                return new AWEContent.Models.GalleryItem(templateData);
            }
            else {
                boxModelSettings = new AWEContent.Models.BoxModelSettings();
                imageBoxModelSettings = new AWEContent.Models.BoxModelSettings();

                var listImage = new AWEContent.Collections.ListImage(),
                    gallery = new AWEContent.Models.GalleryItem({
                        boxModelSettings: boxModelSettings,
                        images: listImage,
                        imageBoxModelSettings: imageBoxModelSettings,
                        createFromDefault: true
                    }),
                    defaultImage = new AWEContent.Models.Image({
                        srcImageStyle: AWEContent.Path.defaultImage,
                        srcThumbStyle: AWEContent.Path.defaultImage,
                        enableLightBox: gallery.get('enableLightBox'),
                        enableCaption: (gallery.get('enableCaption') || (gallery.get('enableLightBox') && gallery.get('captionOnLightBox')))
                    });

                gallery.get('images').add(defaultImage);

                return gallery;
            }

        }
    });

    AWEContent.Views.GalleryPanel = AWEContent.Views.ItemPanel.extend({
        tagName: "div",
        className: "awe-obj-panel gallery-panel",
        panelName: "gallery",
        initPanel: function () {
            AWEContent.Views.ItemPanel.prototype.initPanel.call(this);
            var self = this;
            self.$el.mousedown(function () {
                if (AWEContent.jqIframe('.mfp-close-btn-in').length) {
                    AWEContent.jqIframe('.mfp-close-btn-in').trigger('click');
                }
            });
            $('#gallery-select-image .control-gallery input[name=selected_media]', self.el).change(function () {
                var images = $.parseJSON($(this).val().trim()),
                    template = '<div class="book-lib"><i class="ic ac-icon-done"></i><img src="" alt="book"><input type="hidden" name="selected_media"/></div>';

                if (typeof images == 'object') {
                    var $library = $('#gallery-select-image .library', self.el),
                        imageStyle = self.editingModel.get('styleImage'),
                        thumbStyle = self.editingModel.get('styleThumb'),
                        styles = imageStyle + ',' + thumbStyle,
                        images_fid = [];

                    // get fid of images which is used in gallery
                    $.each(images, function () {
                        images_fid.push(this.fid);
                    });

                    // get images style url
                    if (AWEContent.Path.imageStyleURL != '') {
                        $.post(AWEContent.Path.imageStyleURL, {
                            fids: images_fid.join(','),
                            styles: styles
                        }, function (response) {

                            if ($.type(response) == 'string') {
                                try {
                                    response = JSON.parse(response);
                                }
                                catch (e) {
                                }
                            }

                            // update image style url to gallery image view
                            if (typeof (response) == 'object') {

                                $.each(images, function () {
                                    var image = this;
                                    if (!self.editingModel.get('images').length && self.editingModel.get('createFromDefault')) {
                                        self.editingModel.set('createFromDefault', false);
                                    }
                                    if (self.editingModel.get('createFromDefault')) {
                                        self.editingModel.set('createFromDefault', false);
                                        self.editingModel.get('images').at(0).set({
                                            fid: image.fid,
                                            srcThumbStyle: response[image.fid][self.editingModel.get('styleThumb')],
                                            srcImageStyle: response[image.fid][self.editingModel.get('styleImage')]
                                        });
                                        $('img', $library).eq(0).attr('src', image.file_url);
                                    }
                                    else {
                                        var modelImage = new AWEContent.Models.Image({
                                                fid: image.fid,
                                                srcThumbStyle: response[image.fid][self.editingModel.get('styleThumb')],
                                                srcImageStyle: response[image.fid][self.editingModel.get('styleImage')],
                                                captionPosition: self.editingModel.get('captionPosition'),
                                                enableLightBox: self.editingModel.get('enableLightBox'),
                                                enableCaption: (self.editingModel.get('enableLightBox') && self.editingModel.get('captionOnLightBox')) || self.editingModel.get('enableCaption'),
                                                boxModelSettings: new AWEContent.Models.BoxModelSettings(self.editingModel.get('imageBoxModelSettings').toJSON())
                                            }),
                                            $thumbnail = $(template);

                                        // add chose images to list in gallery
                                        $('img', $thumbnail).attr('src', image.file_url);
                                        $library.append($thumbnail);

                                        self.editingModel.get('images').add(modelImage);
                                    }
                                });
                            }
                        });
                    }
                    else {
                        $.each(images, function () {
                            var image = this;
                            if (!self.editingModel.get('images').length && self.editingModel.get('createFromDefault')) {
                                self.editingModel.set('createFromDefault', false);
                            }
                            if (self.editingModel.get('createFromDefault')) {
                                self.editingModel.set('createFromDefault', false);
                                self.editingModel.get('images').at(0).set({
                                    srcThumbStyle: image.file_url,
                                    srcImageStyle: image.file_url,
                                    fid: image.fid
                                });
                                $('img', $library).eq(0).attr('src', image.file_url);
                            }
                            else {
                                var modelImage = new AWEContent.Models.Image({
                                        fid: image.fid,
                                        srcThumbStyle: image.file_url,
                                        srcImageStyle: image.file_url,
                                        enableCaption: (self.editingModel.get('enableLightBox') && self.editingModel.get('captionOnLightBox')) || self.editingModel.get('enableCaption'),
                                        enableLightBox: self.editingModel.get('enableLightBox'),
                                        boxModelSettings: new AWEContent.Models.BoxModelSettings(self.editingModel.get('imageBoxModelSettings').toJSON())
                                    }),
                                    $thumbnail = $(template);

                                // add chose images to list in gallery
                                $('img', $thumbnail).attr('src', image.file_url);
                                $library.append($thumbnail);

                                self.editingModel.get('images').add(modelImage);
                                modelImage.set('captionPosition', self.editingModel.get('captionPosition'));
                                modelImage.set('enableLightBox', self.editingModel.get('enableLightBox'));
                            }
                        });
                    }
                }
            });
            $('#gallery-select-image', self.el).delegate('.book-lib input[name=selected_media]', 'change', function () {
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
                        $.post(AWEContent.Path.imageStyleURL, {
                            fids: '' + imageData.fid,
                            styles: styles
                        }, function (response) {
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
            $('#gallery-column', this.el).change(function (event, values) {
                self.editingModel.set('columns', values.value);
            });
            if (AWEContent.Path.imageStyleURL != '') {
                $('#gallery-style-image', this.el).change(function (event, values) {
                    self.editingModel.set('styleImage', values.value);
                });
                $('#gallery-style-thumbnail', this.el).change(function (event, values) {
                    self.editingModel.set('styleThumb', values.value);
                });
            }

            $("#gallery-custom-column-responsive input[name=toggle_value]", this.el).change(function (event, isInitPanel) {
                var value = parseInt($(this).val());

                if (!isInitPanel)
                    self.editingModel.set("customColumnsResponsive", value);

                $('#gallery-columns-desktop-small, #gallery-columns-tablet, #gallery-columns-mobile', self.el).hide();
                if (value)
                    $('#gallery-columns-desktop-small, #gallery-columns-tablet, #gallery-columns-mobile', self.el).show();
            });

            $('#gallery-columns-desktop-small', self.$el).change(function (event, values) {
                self.editingModel.set('smallDesktopColumns', values.value);
            });
            $('#gallery-columns-tablet', self.$el).change(function (event, values) {
                self.editingModel.set('tabletColumns', values.value);
            });
            $('#gallery-columns-mobile', self.$el).change(function (event, values) {
                self.editingModel.set('mobileColumns', values.value);
            });

            $("#gallery-enable-lightbox input[name=toggle_value]", this.el).change(function (event, isInitPanel) {
                var value = parseInt($(this).val());

                if (!isInitPanel)
                    self.editingModel.set("enableLightBox", value);

                $('#gallery-enable-thumbnail, #gallery-number-thumbnail, #gallery-on-lightbox, #gallery-style-image, .lightbox-style-title', self.el).hide();
                if (value) {
                    $('#gallery-enable-thumbnail, #gallery-style-image, #gallery-on-lightbox, .lightbox-style-title', self.el).show();
                    $("#gallery-enable-thumbnail input[name=toggle_value]", self.el).trigger('change', {isPanel: true});
                }

                $('#gallery-caption-color', self.el).hide();
                if ((value && self.editingModel.get('captionOnLightBox')) || self.editingModel.get('enableCaption'))
                    $('#gallery-caption-color', self.el).show();
            });
            $("#gallery-enable-thumbnail input[name=toggle_value]", this.el).change(function (event, isInitPanel) {
                if (parseInt($(this).val()))
                    $('#gallery-number-thumbnail', self.el).show();
                else
                    $('#gallery-number-thumbnail', self.el).hide();
                if (!isInitPanel)
                    self.editingModel.set("enableThumbnail", parseInt($(this).val()));

            });
            $('#gallery-number-thumbnail', this.el).change(function (event, values) {
                self.editingModel.set('itemsThumb', values.value);
            });
            $("#gallery-enable-caption input[name=toggle_value]", this.el).change(function (event, isInitPanel) {
                var value = parseInt($(this).val());
                if (!isInitPanel)
                    self.editingModel.set("enableCaption", value);

                $('#gallery-position, #gallery-on-hover, #gallery-image-bg-overlay', self.el).hide();
                $('#gallery-caption-color', self.$el).show();
                if (value) {
                    $('#gallery-position', self.el).show();
                    if (self.editingModel.get('captionPosition') == 'over') {
                        $('#gallery-on-hover, #gallery-image-bg-overlay', self.$el).show();
                    }
                }
                else {
                    if (!self.editingModel.get('enableLightBox') || !self.editingModel.get('captionOnLightBox'))
                        $('#gallery-caption-color', self.$el).hide();
                }
            });
            $('#gallery-position', this.el).change(function (event, values) {
                self.editingModel.set('captionPosition', values.value);
                $('#gallery-on-hover, #gallery-image-bg-overlay').hide();
                if (values.value == 'over' && self.editingModel.get('enableCaption')) {
                    $('#gallery-on-hover, #gallery-image-bg-overlay').show();
                }
            });

            $('#gallery-caption-color', this.el).change(function (event, color) {
                color = color ? color.toRgbString() : '';
                self.editingModel.set('captionColor', color);
            });

            $("#gallery-on-hover input[name=toggle_value]", this.el).change(function (event, isInitPanel) {
                if (!isInitPanel)
                    self.editingModel.set("captionOnHover", parseInt($(this).val()));
            });

            $('#gallery-image-bg-overlay', this.el).change(function (event, color) {
                color = color ? color.toRgbString() : '';
                self.editingModel.set('imageBgOverlay', color);
            });
            $("#gallery-on-lightbox input[name=toggle_value]", this.el).change(function (event, isInitPanel) {
                var value = parseInt($(this).val());
                if (!isInitPanel)
                    self.editingModel.set("captionOnLightBox", value);

                $('#gallery-caption-color', self.$el).show();
                if (!value && !self.editingModel.get('enableCaption'))
                    $('#gallery-caption-color', self.$el).hide();
            });
            $("#gallery-layout-tab", this.el).initBoxModelPanel(this, "boxModelSettings");
            $("#gallery-image-layout-tab", this.el).initBoxModelPanel(this, "imageBoxModelSettings");
            $('#text-gallery-custom-id', this.el).change(function () {
                self.editingModel.set('customID', $(this).val());
            });
            $('#text-gallery-custom-classes', this.el).change(function () {
                self.editingModel.set('customClass', $(this).val());
            });
            $('#gallery-custom-attributes', this.el).initAttributesPanel(self);
            $('#gallery-animations input[name=enabled_custom_animation]', this.el).change(function (event, data) {
                self.editingModel.set('customEnableAnimations', parseInt($(this).val()));
                if (data) {
                    self.editingModel.set('customDataAnimations', JSON.stringify(data.animations));
                }
            });
        },
        setPanelElementsValue: function (isExtend) {
            var self = this,
                settings = this.editingModel.toJSON(),
                template = '<div class="book-lib"><i class="ic ac-icon-done"></i><img src="" alt="book"><input type="hidden" name="selected_media"/></div>',
                $library = $('#gallery-select-image .library', self.el);

            $library.empty();
            $.each(settings.images, function (idImage, image) {
                var $bookLib = $(template);
                $('img', $bookLib).attr('src', image.srcThumbStyle);
                $library.append($bookLib);
            });
            if (!isExtend) {
                $('#gallery-column', this.el).aweSlider('value', settings.columns);

                $("#gallery-custom-column-responsive input[name=toggle_value]", self.el).val(settings.customColumnsResponsive).trigger("change", true);
                $('#gallery-columns-desktop-small', this.el).aweSlider('value', settings.smallDesktopColumns);
                $('#gallery-columns-tablet', this.el).aweSlider('value', settings.tabletColumns);
                $('#gallery-columns-mobile', this.el).aweSlider('value', settings.mobileColumns);

                if (AWEContent.Path.imageStyleURL != '') {
                    $('#gallery-style-image', self.el).aweSelect('value', settings.styleImage);
                    $('#gallery-style-thumbnail', self.el).aweSelect('value', settings.styleThumb);
                }
                else {
                    $('#gallery-style-image, #gallery-style-thumbnail', self.el).hide();
                }
                $("#gallery-enable-thumbnail input[name=toggle_value]", self.el).val(settings.enableThumbnail).trigger("change", true);
                $("#gallery-enable-lightbox input[name=toggle_value]", self.el).val(settings.enableLightBox).trigger("change", true);
                //$('#gallery-number-thumbnail', this.el).aweSlider('value', settings.itemsThumb);
                $("#gallery-enable-caption input[name=toggle_value]", self.el).val(settings.enableCaption).trigger("change", true);
                $('#gallery-position', self.el).aweSelect('value', settings.captionPosition);
                $("#gallery-caption-color", self.el).aweColorPicker('value', settings.captionColor);
                $("#gallery-on-hover input[name=toggle_value]", self.el).val(settings.captionOnHover).trigger("change", true);
                $("#gallery-image-bg-overlay", self.el).aweColorPicker('value', settings.imageBgOverlay);
                $("#gallery-on-lightbox input[name=toggle_value]", self.el).val(settings.captionOnLightBox).trigger("change", true);
                $('#gallery-layout-tab', self.el).initBoxModel(settings.boxModelSettings);
                $('#gallery-image-layout-tab', self.el).initBoxModel(settings.imageBoxModelSettings);
                $('#text-gallery-custom-id', self.el).val(settings.customID);
                $('#text-gallery-custom-classes', self.el).val(settings.customClass);
                $('#gallery-custom-attributes', self.el).initAttributes(settings.customEnableAttributes, settings.customDataAttributes);
                $('#gallery-animations input[name=enabled_custom_animation]', self.el).val(settings.customEnableAnimations).trigger('change');
                $('#gallery-animations input[name=enabled_custom_animation]', self.el).attr('data-animations', settings.customDataAnimations).data('view', this.editingModel.view);
            }
        },
        buildPanel: function () {
            return {
                title: {
                    type: "markup",
                    markup: "<div class=\"awe-title\"><h2>Gallery<\/h2><\/div>"
                },
                custom_style: {
                    type: 'section',
                    select_image: {
                        type: 'gallery',
                        title: 'Add Images',
                        columns: 4
                    },
                    column: {
                        type: "slider",
                        title: "Column",
                        values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
                        default_value: 4,
                        allow_type: true
                    },
                    custom_column_responsive: {
                        type: "toggle",
                        title: "Custom Responsive",
                        default_value: 0
                    },
                    columns_desktop_small: {
                        type: "slider",
                        title: "Desktop Small",
                        values: [1, 2, 3, 4, 5, 6],
                        default_value: 4,
                        allow_type: true
                    },
                    columns_tablet: {
                        type: "slider",
                        title: "Tablet",
                        values: [1, 2, 3, 4, 5, 6],
                        default_value: 4,
                        allow_type: true
                    },
                    columns_mobile: {
                        type: "slider",
                        title: "Mobile",
                        values: [1, 2, 3, 4, 5, 6],
                        default_value: 4,
                        allow_type: true
                    },
                    'style_thumbnail': {
                        title: 'Thumbnail Image Style',
                        type: "image_style_list",
                        default_value: "image-style",
                        attributes: {
                            'class': ['long-title']
                        }
                    },
                    enable_lightbox: {
                        type: "toggle",
                        title: "Enable Lightbox",
                        default_value: 0
                    },
                    'style_image': {
                        title: 'LightBox Image Style',
                        type: "image_style_list",
                        default_value: "image-style",
                        attributes: {
                            'class': ['long-title']
                        }
                    }
                    //"enable_thumbnail": {
                    //    "type": "toggle",
                    //    "title": "Enable Thumbnail",
                    //    "default_value": 0
                    //},
                    //'number_thumbnail' : {
                    //    "type": "slider",
                    //    "title": "Thumbnail",
                    //    "values": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                    //    "default_value": 4,
                    //    "allow_type": true
                    //}
                },
                custom_caption: {
                    type: 'section',
                    enable_caption: {
                        type: "toggle",
                        title: "Caption",
                        default_value: 0
                    },
                    caption_color: {
                        type: 'colorpicker',
                        title: "Caption Text Color",
                        options: {
                            "preferredFormat": "rgb",
                            "AlphaVerticle": true,
                            "showAlpha": true,
                            "allowEmpty": true,
                            "showInput": true
                        }
                    },
                    position: {
                        type: "select",
                        title: "Position",
                        options: {
                            "top": "Top",
                            "bottom": "Bottom",
                            "over": "Over"
                        },
                        default_value: "top"
                    },
                    on_hover: {
                        type: "toggle",
                        title: "Display on hover",
                        default_value: 0
                    },
                    image_bg_overlay: {
                        type: 'colorpicker',
                        title: "ImageBgOverlay",
                        options: {
                            "preferredFormat": "rgb",
                            "AlphaVerticle": true,
                            "showAlpha": true,
                            "allowEmpty": true,
                            "showInput": true
                        }
                    },
                    'on_lightbox': {
                        "type": "toggle",
                        "title": "Caption on lightbox",
                        "default_value": 0
                    }
                },
                "image_title": {
                    "type": "markup",
                    "markup": "<div class=\"awe-title\"><h4>Image Settings<\/h4><\/div>"
                },
                'image_box_settings': {
                    type: "section",
                    image_layout_tab: {
                        type: "tabs",
                        tabs: [
                            {
                                tab_title: "Border",
                                contents: {
                                    image_border: {
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
                                    image_boder_radius: {
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
                                    image_padding: {
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
                                    image_margin: {
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
                'box_settings': {
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
                'definitions': {
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

    $(document).ready(function () {
        AWEContent.Controllers.gallery = new AWEContent.Views.GalleryItemController();
        AWEContent.Panels.gallery = new AWEContent.Views.GalleryPanel();
    });
})(jQuery);