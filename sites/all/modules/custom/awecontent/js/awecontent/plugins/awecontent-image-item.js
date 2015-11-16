/**
 * File: awecontent-image-item.js
 * Author: AWEThemes
 * Website: http://awethemes.com/
 */
(function ($) {
    "use strict";

    AWEContent.Models.ImageItem = AWEContent.Models.Item.extend({
        imageURL: '',
        lighBoxImageURL: '',
        defaults: {
            fid: -1,
            machine_name: "image",
            styleImage: 'none',
            styleLightbox: 'none',
            lightBox: 1,
            caption: 1,
            captionColor: '',
            contentCaption: '',
            linkExtend: '',
            targetImage: 1,
            positionCaption: 'top',
            onHover: 1,
            imageBgOverlay: '',
            captionOnLightBox: 1,
            boxModelSettings: {},
            customID: '',
            customClass: '',
            customEnableAttributes: 1,
            customDataAttributes: '[]',// Array Json ex : [{"attrName":"autoPlay","attrValue":"true"}]
            customActionAttributes: '{"newAction": "", "newAttrName": "", "newAttrValue": ""}',
            customEnableAnimations: 0,
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
            }
        ],
        createView: function () {
            this.view = new AWEContent.Views.ImageItem({model: this});
        },
        clone: function () {
            var cloneModel = {};
            $.each(this.toJSON(), function (key, value) {
                cloneModel[key] = value;
            });

            cloneModel.boxModelSettings = new AWEContent.Models.BoxModelSettings(cloneModel.boxModelSettings);
            return new AWEContent.Models.ImageItem(cloneModel);
        }
    });

    AWEContent.Views.ImageItem = AWEContent.Views.Item.extend({
        imageContent: _.template(
            '<div class="awe-item awe-image">\
            <% if (link) { %>\
                <a href="<%= link %>" target="<%= target %>" class="mgf-md-popup">\
            <% } %>\
                <div class="awe-image-content">\
                    <div class="awe-image-caption"><%= caption %></div>\
                    <div class="awe-image-container"><img src="<%= imgSrc %>" alt="" /></div>\
                </div>\
            <% if (link) { %>\
            </a>\
            <% } %>\
                <div class="awe-image-control">\
                    <ul>\
                        <li class="edit-link">\
                            <i class="ic ac-icon-link"></i>\
                            <div class="awe-control-box">\
                                <div class="awe-box-header">Image link</div> \
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
                    </ul>\
                </div>\
            </div>'
        ),
        changeImageSrc: function (imageURL) {
            if (fid > 0) {
                // change item fid
                this.model.set('fid', fid);

                // reload image panel
                AWEContent.Panels.image.setPanelElementsValue();

                // Resize Item
                this.resizeItem();
            }
        },
        initialize: function () {
            AWEContent.Views.Item.prototype.initialize.call(this);
            this.listenTo(this.model.get("boxModelSettings"), "change", this.applySettingsChanged);
            var self = this;

            // Handle when item ready and column container change size
            this.$el.on('ready',function () {
                self.changeEmptyImageHeight();

                // init for drag image to view element
                $('.awe-image', $(this)).aweDragUpload({
                    multiUpload: false,
                    uploadSuccessCallback: function (response) {
                        if (response.status && response.file) {
                            var file = response.file;
                            self.changeImageSrc(file.file_url);
                        }
                    }
                });
            });
            self.$el.delegate('.awe-image-control li','click', function () {
                $(this).siblings('li').removeClass('active');
                $(this).toggleClass('active');
                if ($(this).hasClass('active')) {
                    var content,
                        $textArea = $('textarea', this);
                    if ($(this).hasClass('edit-link')) {
                        content = self.model.get('linkExtend');
                    }
                    else if ($(this).hasClass('edit-caption')) {
                        content = self.model.get('contentCaption');
                    }
                    $textArea.val(content);
                }
            });
            self.$el.delegate('.awe-control-box','click', function (event) {
                event.stopPropagation();
            });
            self.$el.delegate('.awe-image-control .awe-box-btn','click', function (event) {
                event.preventDefault();
                event.stopPropagation();

                var $target = $(event.target).is('li') ? $(event.target) : $(event.target).closest('li'),
                    $textArea = $target.find('textarea'),
                    content = $textArea.val();

                $target.removeClass('active');
                if ($(this).hasClass('js-ok')) {
                    if ($target.hasClass('edit-link')) {
                        var openNewWindow = $textArea.next().prop('checked') ? 1 : 0;
                        self.model.set('linkExtend', content);
                        self.model.set('targetImage', openNewWindow);
                    }
                    else if ($target.hasClass('edit-caption')) {
                        self.model.set('contentCaption', content);
                    }
                }
            });

            // handle event imageURL loaded success
            this.$el.bind('getImageURLSuccess', function(event, files) {
                
            });
        },
        changeEmptyImageHeight: function () {
            if (this.model.imageURL == '' && this.$img) {
               this.$img.css('min-height', this.$el.width() * 0.75);
            }
        },
        renderItemContent: function () {
            var self = this,
                settings = self.model.toJSON(),
                linkTarget = (!settings.lightBox && settings.linkExtend && settings.targetImage) ? '_blank' : '_self',
                link = (settings.lightBox) ? this.model.lighBoxImageURL : settings.linkExtend,
                $aweImage = $(this.imageContent({
                    link: link,
                    target: linkTarget,
                    imgSrc: this.model.imageURL,
                    caption: settings.contentCaption
                }));

            // get image URLs
            this.$el.aweImageURL({
                fid: [settings.fid],
                styles: [settings.styleImage, settings.styleLightbox],
                success: function(el, fid, styles, response) {
                    self.processImageURL(el, fid, styles, response);
                }
            });
            //AWEContent.getImageURL(settings.fid, [settings.styleImage, settings.styleLightbox].join(','), self.$el);

            // save image wrap element
            self.$imageWrap = $aweImage;
            if (link)
                self.$imageWrap = $('> a', $aweImage);

            // init magnific library
            AWEContent.Library.addLibrary('magnific', function () {
                 self.initMagnificPopup($aweImage);
            });

            // process caption settings
            if (settings.caption) {
                 // Settings Caption Position
                 if (settings.positionCaption == 'bottom')
                     $('.awe-image-content', $aweImage).append($('.awe-image-caption', $aweImage));
                 else if (settings.positionCaption == 'over') {
                     $aweImage.addClass('position-over');
                     if (settings.onHover)
                         $aweImage.addClass('caption-hover');

                     // add image overlay
                     $('.awe-image-content', self.$imageWrap).prepend($('<div class="awe-image-overlay"></div>').css('background-color', settings.imageBgOverlay));
                 }
            }
            else
                 $aweImage.addClass('disable-caption');

            // process setting for lightBox
            if (settings.lightBox)
                self.$imageWrap.addClass('open-lightbox');

            $('.awe-image-caption', $aweImage).attr('data-on-lightbox', settings.captionOnLightBox ? true : false);
            $aweImage.attr('id', settings.customID).addClass(settings.customClass).renderItemDefaultBoxModel(settings.boxModelSettings);
            $aweImage.renderItemDefaultAttributes(settings.customEnableAttributes, settings.customDataAttributes);
            if (settings.customEnableAnimations)
                 $aweImage.processAnimations(settings.customDataAnimations);
            self.$el.defaultResponsive(settings);

            self.$img = $('.awe-image-container > img', $aweImage);

            // render caption color
            $('.awe-image-caption', $aweImage).css('color', settings.captionColor);

            // Trigger Event Resize Section
            var interval = setInterval(function () {
                if (self.$el.find('img').length != 0) {
                    clearInterval(interval);

                    // Resize Element
                    self.resizeItem();
                }
            }, 100);

            return $aweImage;
        },
        applySettingsChanged: function (model) {
            var self = this,
                settings = self.model.toJSON(),
                $aweImage = $('.awe-image', self.el),
                $imageContent = $('.awe-image-content', $aweImage),
                $caption = $('.awe-image-caption', $aweImage),
                heightBefore = self.$el.height();

            $.each(model.changedAttributes(), function (key, value) {
                self.$el.changeResponsive(key, value);
                $aweImage.renderChangeSettingBoxModel(key, value, model);
                switch (key) {
                    case 'fid' :
                        var prevFid = model.previousAttributes().fid;

                        if (prevFid == -1)
                            self.$img.css({'min-height' : '', background : ''});

                        self.$el.aweImageURL({
                            fid: [settings.fid],
                            styles: [settings.styleImage, settings.styleLightbox],
                            success: function(el, fid, styles, response) {
                                self.processImageURL(el, fid, styles, response);
                            }
                        });
                        break;

                    case 'styleImage':
                    case 'styleLightbox':
                        var fid = self.model.get('fid');
                        if (fid > 0)
                            //AWEContent.getImageURL(fid, value, self.$el);
                            self.$el.aweImageURL({
                                fid: [settings.fid],
                                styles: [settings.styleImage, settings.styleLightbox],
                                success: function(el, fid, styles, response) {
                                    self.processImageURL(el, fid, styles, response);
                                }
                            });
                        break;

                    case 'lightBox':
                        if (value) {
                            // add a tag if not exist
                            if (settings.linkExtend == '') {
                                self.$imageWrap.prepend('<a href="mgf-md-popup"></a>');
                                self.$imageWrap = $('> a', self.$imageWrap);
                                self.$imageWrap.append($('.awe-image-content', $aweImage));
                            }

                            // set light box source
                            self.$imageWrap.attr('href', self.model.lighBoxImageURL).addClass('open-lightbox');

                            // disable image link settings
                            $('li.edit-link', $aweImage).hide();
                        }
                        else {
                            // remove a tag if image link not set
                            if (settings.linkExtend == '') {
                                self.$imageWrap = $aweImage;
                                self.$imageWrap.append($('.awe-image-content', $aweImage));
                                $('> a', $aweImage).remove();
                            }
                            else {
                                // remove class to define image open in lightbox
                                self.$imageWrap.removeClass('open-lightbox').attr('href', settings.linkExtend);
                            }

                            // enable image link settings
                            $('li.edit-link', $aweImage).show();
                            if (!settings.caption)
                                $('li.edit-caption', $aweImage).hide();
                        }
                        break;

                    case 'linkExtend':
                        if (!settings.lightBox) {
                            if (value) {
                                // create a tag for image content
                                $aweImage.prepend('<a class="mgf-md-popup" href=""></a>');
                                self.$imageWrap = $('> a', $aweImage).attr('href', value);

                                // move image content to item wrap
                                self.$imageWrap.append($('.awe-image-content', $aweImage));
                            }
                            else {
                                // move image content to item wrap
                                $aweImage.prepend($('.awe-image-content', $aweImage));
                                $('> a.mgf-md-popup', $aweImage).remove();
                                self.$imageWrap = $('.awe-image-content', $aweImage);
                            }
                        }
                        break;

                    case 'targetImage' :
                        if (settings.linkExtend)
                            self.$imageWrap.attr('target', value ? '_blank' : '_blank');
                        break;

                    case 'caption':
                        if (value) {
                            $('.edit-caption', $aweImage).show();
                            if (settings.contentCaption != '')
                                $aweImage.removeClass('disable-caption');
                        }
                        else {
                            $aweImage.addClass('disable-caption');
                            if (!settings.captionOnLightBox || !settings.lightBox)
                                $('.edit-caption', $aweImage).hide();
                        }
                        break;

                    case 'contentCaption':
                        if (settings.caption && value != '') {
                            $aweImage.removeClass('disable-caption');
                            $('.awe-image-caption', $aweImage).html(value);
                        }
                        else
                            $aweImage.addClass('disable-caption');
                        break;

                    case 'positionCaption':
                        $aweImage.removeClass('position-over').removeClass('caption-hover');
                        switch (value) {
                            case 'top':
                                $imageContent.prepend($caption);
                                $('.awe-image-overlay', $aweImage).remove();
                                break;

                            case 'bottom':
                                $imageContent.append($caption);
                                $('.awe-image-overlay', $aweImage).remove();
                                break;

                            case 'over':
                                $aweImage.addClass('position-over');
                                if (settings.onHover)
                                    $aweImage.addClass('caption-hover');

                                // add image overlay
                                $('.awe-image-content', self.$imageWrap).prepend($('<div class="awe-image-overlay"></div>').css('background-color', settings.imageBgOverlay));
                                break;
                        }
                        break;

                    case 'onHover' :
                        value && settings.positionCaption == 'over'? $aweImage.addClass('caption-hover') : $aweImage.removeClass('caption-hover');
                        break;

                    case 'captionOnLightBox':
                        if (value) {
                            $('.edit-caption', $aweImage).show();
                            $caption.attr('data-on-lightbox', true)
                        }
                        else {
                            $caption.attr('data-on-lightbox', false);
                            if (!settings.caption)
                                $('.edit-caption', $aweImage).hide();
                        }
                        break;

                    case 'captionColor':
                        $('.awe-image-caption', $aweImage).css('color', value);
                        break;

                    case 'imageBgOverlay':
                        $('.awe-image-overlay', $aweImage).css('background-color', value);
                        break;

                    case 'customID':
                        $aweImage.attr('id', value);
                        break;

                    case 'customClass':
                        var prevClass = self.model.previousAttributes().customClass;
                        $aweImage.removeClass(prevClass).addClass(value);
                        break;

                    case 'customEnableAttributes':
                        $aweImage.renderChangeSettingsAttributes(key, value, settings.customDataAttributes);
                        break;

                    case 'customActionAttributes':
                        $aweImage.renderChangeSettingsAttributes(key, value);
                        break;

                    case 'customEnableAnimations':
                        var animation, prevAnimation;
                        if (value) {
                            animation = settings.customDataAnimations;
                            prevAnimation = null;
                            $aweImage.processAnimations(animation);
                        }
                        else {
                            animation = null;
                            prevAnimation = settings.customDataAnimations;
                            $aweImage.processAnimations(animation, prevAnimation);
                        }

                        break;
                    case 'customDataAnimations':
                        var animation, prevAnimation;
                        animation = settings.customDataAnimations;
                        prevAnimation = self.model.previousAttributes().customDataAnimations;
                        $aweImage.processAnimations(animation, prevAnimation);
                        break;
                }
            });

            // Listen event change height of item
            setTimeout(function() {
                self.checkChangeHeight(heightBefore);
            }, 100);
        },
        initMagnificPopup: function ($aweImage) {
            AWEContent.jqIframe($aweImage).magnificPopup({
                delegate: '.open-lightbox',
                type: 'image',
                removalDelay: 300,
                mainClass: 'mfp-fade',
                prependTo: '.awe-page-wrapper',
                callbacks: {
                    markupParse: function (template, values, item) {

                        var $caption = item.el.closest('.awe-item').find('.awe-image-caption');
                        if ($caption.attr('data-on-lightbox') == 'true')
                            values.title = $('<div />').html($caption.text()).css('color', $caption.css('color'));
                        else
                            values.title = '';
                    }
                },
                image: {
                    headerFit: true,
                    captionFit: true,
                    preserveHeaderAndCaptionWidth: false
                }
            });
        },
        processImageURL: function(el, fid, styles, files) {
            var fid = this.model.get('fid'),
                style = this.model.get('styleImage'),
                lightBoxStyle = this.model.get('styleLightbox'),
                fileURLs = files && files[fid]? files[fid]: null;

            if (fileURLs && fileURLs[style] !== undefined) {
                // assign image URL
                this.model.imageURL = fileURLs[style];

                // change image url src
                $('img', this.$el).attr('src', fileURLs[style]);
            }

            if (fileURLs && fileURLs[lightBoxStyle] !== undefined) {
                this.model.lighBoxImageURL = fileURLs[lightBoxStyle];

                // apply change lightbox image URL
                if (this.model.get('lightBox')) {
                    var $aweImage = $('.awe-image', this.el);

                    if ($('> a', $aweImage).length == 0) {
                        $aweImage.prepend('<a class="mgf-md-popup" href=""></a>');
                        $('> a', $aweImage).append($('.awe-image-content', $aweImage));
                    }
                    this.$imageWrap = $('> a', $aweImage);
                    this.$imageWrap.addClass('open-lightbox').attr('href', fileURLs[lightBoxStyle]);
                }
            }
        }
    });

    AWEContent.Views.ImageItemController = AWEContent.Views.ItemController.extend({
        machineName: 'image',
        controllerHtml: function () {
            return '<div class="title-icon">Image</div><i class="ic ac-icon-image2"></i>';
        },
        createItemModel: function (templateData) {
            var boxModelSettings,
                item;
            if (templateData != undefined) {

                boxModelSettings = new AWEContent.Models.BoxModelSettings(templateData.boxModelSettings);
                templateData.boxModelSettings = boxModelSettings;

                item = new AWEContent.Models.ImageItem(templateData);
            }
            else {
                item = new AWEContent.Models.ImageItem({'boxModelSettings': new AWEContent.Models.BoxModelSettings({enabledCustomBorder: 1})});
                item.imageURL = item.lighBoxImageURL = AWEContent.Path.defaultImage;
            }

            return item;
        }
    });

    AWEContent.Views.ImagePanel = AWEContent.Views.ItemPanel.extend({
        tagName: "div",
        className: "awe-obj-panel image-panel",
        panelName: "image",
        initPanel: function () {
            AWEContent.Views.ItemPanel.prototype.initPanel.call(this);
            var self = this;
            self.$el.mousedown( function () {
                if (AWEContent.jqIframe('.mfp-close-btn-in').length) {
                    AWEContent.jqIframe('.mfp-close-btn-in').trigger('click');
                }
            });
            $('.color-picker', self.el).append('<input type="hidden" name="changing-color">');
            $('#image-select-image input[name=selected_media]', self.el).change(function () {
                var strFileData = $(this).val().trim(),
                    file = strFileData ? JSON.parse(strFileData) : false,
                    fileURL = file && file.file_url ? file.file_url : '',
                    fid = file && file.fid > 0 ? file.fid : -1;

                // set panel thumbnail by chose image
                $('.image-content > img', self.$el).attr('src', fileURL);

                // set model fid
                self.editingModel.set('fid', fid);
            });
            $('#image-thumb-style', this.el).change(function (event, values) {
                self.editingModel.set('styleImage', values.value);
            });
            $("#image-enable-lightbox input[name=toggle_value]", this.el).change(function (event, isInitPanel) {
                var value = parseInt($(this).val());

                if (!isInitPanel)
                    self.editingModel.set("lightBox", value);
                if (value) {
                    $('#image-on-lightbox , #image-lightbox-style, .image-lb-title', self.el).show();
                }
                else
                    $('#image-on-lightbox, #image-lightbox-style, .image-lb-title', self.el).hide();

                $('#image-caption-color', self.el).show();
                if (!self.editingModel.get('caption') && (!value || !self.editingModel.get('captionOnLightBox')))
                    $('#image-caption-color', self.el).hide();
            });
            $('#image-lightbox-style', this.el).change(function (event, values) {
                self.editingModel.set('styleLightbox', values.value);
            });
            $("#image-enable-caption input[name=toggle_value]", this.el).change(function (event, isInitPanel) {
                var value = parseInt($(this).val());

                if (!isInitPanel)
                    self.editingModel.set("caption", value);

                $('#image-position, #image-on-hover, #image-image-bg-overlay', self.el).hide();
                if (value) {
                    $('#image-position', self.el).show();
                    if (self.editingModel.get('positionCaption') == 'over')
                        $('#image-on-hover, #image-image-bg-overlay', self.el).show();
                }

                $('#image-caption-color', self.el).show();
                if (!value && (!self.editingModel.get('lightBox') || !self.editingModel.get('captionOnLightBox')))
                    $('#image-caption-color', self.el).hide();
            });
            $('#image-position', this.el).change(function (event, values) {
                self.editingModel.set('positionCaption', values.value);

                // process display for hover and bgImageOverlay
                $('#image-on-hover, #image-image-bg-overlay', self.el).hide();
                if (values.value == 'over' && self.editingModel.get('caption'))
                    $('#image-on-hover, #image-image-bg-overlay', self.el).show();
            });
            $("#image-on-hover input[name=toggle_value]", this.el).change(function (event, isInitPanel) {
                if (!isInitPanel)
                    self.editingModel.set("onHover", parseInt($(this).val()));
            });
            $('#image-image-bg-overlay', self.el).change(function(event, color) {
                color = color ? color.toRgbString() : '';
                self.editingModel.set('imageBgOverlay', color);
            });
            $('#image-caption-color', self.el).change(function(event, color) {
                color = color ? color.toRgbString() : '';
                self.editingModel.set('captionColor', color);
            });
            $("#image-on-lightbox input[name=toggle_value]", this.el).change(function (event, isInitPanel) {
                var value = parseInt($(this).val());
                if (!isInitPanel)
                    self.editingModel.set("captionOnLightBox", value);

                $('#image-caption-color', self.el).show();
                if ((!value || !self.editingModel.get('lightBox')) && !self.editingModel.get('caption'))
                    $('#image-caption-color', self.el).hide();
            });
            $("#image-layout-tab", this.el).initBoxModelPanel(this, "boxModelSettings");
            $('#text-image-custom-id', this.el).change(function () {
                self.editingModel.set('customID', $(this).val());
            });
            $('#text-image-custom-classes', this.el).change(function () {
                self.editingModel.set('customClass', $(this).val());
            });
            $('#image-custom-attributes', this.el).initAttributesPanel(self);
            $('#image-animations input[name=enabled_custom_animation]', this.el).change(function (event, data) {
                self.editingModel.set('customEnableAnimations', parseInt($(this).val()));
                if (data) {
                    self.editingModel.set('customDataAnimations', JSON.stringify(data.animations));
                }
            });
        },
        setPanelElementsValue: function () {
            var self = this,
                settings = this.editingModel.toJSON();

            $('#image-select-image img', self.el).attr('src', self.editingModel.imageURL);

            if (AWEContent.Path.imageStyleURL != '') {
                $('#image-thumb-style', self.el).aweSelect('value', settings.styleImage);
                $('#image-lightbox-style', self.el).aweSelect('value', settings.styleLightbox);
            }
            else {
                $('#image-thumb-style, #image-lightbox-style', self.el).remove();
            }

            $("#image-enable-lightbox input[name=toggle_value]", self.el).val(settings.lightBox).trigger("change", true);
            $("#image-enable-caption input[name=toggle_value]", self.el).val(settings.caption).trigger("change", true);
            $('#image-position', self.el).aweSelect('value', settings.positionCaption);
            $("#image-on-hover input[name=toggle_value]", self.el).val(settings.onHover).trigger("change", true);
            $("#image-image-bg-overlay", self.el).aweColorPicker('value', settings.imageBgOverlay);
            $("#image-caption-color", self.el).aweColorPicker('value', settings.captionColor);
            $("#image-on-lightbox input[name=toggle_value]", self.el).val(settings.captionOnLightBox).trigger("change", true);
            $('#image-layout-tab', self.el).initBoxModel(settings.boxModelSettings);
            $('#text-image-custom-id', self.el).val(settings.customID);
            $('#text-image-custom-classes', self.el).val(settings.customClass);
            $('#image-custom-attributes', this.el).initAttributes(settings.customEnableAttributes, settings.customDataAttributes);
            $('#image-animations input[name=enabled_custom_animation]', this.el).val(settings.customEnableAnimations).trigger('change');
            $('#image-animations input[name=enabled_custom_animation]', this.el).attr('data-animations', settings.customDataAnimations).data('view', this.editingModel.view);
        },
        buildPanel: function () {
            return {
                "title": {
                    "type": "markup",
                    "markup": "<div class=\"awe-title\"><h2>Image<\/h2><\/div>"
                },
                custom_style: {
                    'type': 'section',
                    'select_image': {
                        'type': 'button',
                        'title': 'Select Image'
                    },
                    'thumb_style': {
                        type: "image_style_list",
                        title: 'Image Style',
                        attributes: {
                            'class': ['long-title']
                        }
                    },
                    "enable_lightbox": {
                        "type": "toggle",
                        "title": "Enable Lightbox",
                        "default_value": 0
                    },
                    'lightbox_style' : {
                        type: 'image_style_list',
                        title: "LightBox Image Style",
                        attributes: {
                            'class': ['long-title']
                        }
                    }
                },
                custom_caption: {
                    'type': 'section',
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
                    'position': {
                        type: "select",
                        title: "Position",
                        options: {
                            "top": "Top",
                            "bottom": "Bottom",
                            "over": "Over"
                        },
                        default_value: "top"
                    },
                    'on_hover': {
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
                    },
                    'on_lightbox': {
                        "type": "toggle",
                        "title": "Caption on lightbox",
                        "default_value": 0
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
        AWEContent.Controllers.image = new AWEContent.Views.ImageItemController();
        AWEContent.Panels.image = new AWEContent.Views.ImagePanel();
    });
})(jQuery);
