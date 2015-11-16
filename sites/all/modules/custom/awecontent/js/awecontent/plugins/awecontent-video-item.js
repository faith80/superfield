/**
 * File: awecontent-video-item.js
 * Author: AWEThemes
 * Website: http://awethemes.com/
 */
(function($) {
    "use strict";

    /**
     * Define model for heder item
     */
    AWEContent.Models.VideoItem = AWEContent.Models.Item.extend({
        defaults: {
            machine_name: "video",
            linkVideo : '',
            linkProcessed : '',
            typeThumb : 'auto',
            indexThumbAuto: 0,
            srcThumbAuto: '',
            srcThumbCustom : '',
            thumbStyle: 'none',
            typePlay : 'inline',
            heightVideo: -1,
            backgroundColor : '',
            boxModelSettings: {},
            customID: '',
            customClass: '',
            customEnableAttributes: 0,
            customDataAttributes: '[] ', // Array Json
            customActionAttributes: '{"newAction": "", "newAttrName": "", "newAttrValue": ""}',
            customEnableAnimations: 0,
            customDataAnimations: '{"type" : "none"}', // Data Object
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
        createView: function() {
            this.view = new AWEContent.Views.VideoItem({model: this});
        },
        clone : function(){
            var cloneModel = {};
            $.each(this.toJSON(), function(key,value){
                cloneModel[key] = value;
            });
            cloneModel.boxModelSettings = new AWEContent.Models.BoxModelSettings(cloneModel.boxModelSettings);
            return new AWEContent.Models.VideoItem(cloneModel);
        }
    });

    AWEContent.Views.VideoItem = AWEContent.Views.Item.extend({
        additionalEvents: {
            'click .thumb-video' : 'showIframe'
        },
        showIframe : function(event){
            var $target = $(event.target).hasClass('thumb-video') ? $(event.target) : $(event.target).closest('.thumb-video'),
                $iframe = $target.nextAll('iframe'),
                $mgfVideo = $target.nextAll('a'),
                settings = this.model.toJSON();
            if (settings.typePlay == 'lightbox') {
                AWEContent.jqIframe($mgfVideo).trigger('click');
            }
            else if (settings.typePlay == 'inline'){
                $target.hide();
                $iframe.show().attr('src', this.model.toJSON().linkProcessed);
            }
        },
        initialize: function() {
            AWEContent.Views.Item.prototype.initialize.call(this);
            this.listenTo(this.model.get("boxModelSettings"), "change", this.applySettingsChanged);
        },
        renderItemContent: function() {
            var self = this,
                settings = self.model.toJSON(),
                $video = $('<div class="awe-item awe-video"><div class="thumb-video"><div class="image-content"><img src="" alt=""/></div><div class="play-control"><i class="ic ac-icon-play"></i></div></div><a href="" class="mfp-md-video"></a><iframe class="" src=""></iframe></div>'),
                $thumb = $('img', $video),
                $iframe = $('iframe', $video),
                $mgfVideo = $('a', $video);

            // add magnificPopup library
            AWEContent.Library.addLibrary('magnific', function () {
                setMagnificPopup();
            });

            $mgfVideo.attr('href', settings.linkVideo);
            if (settings.typeThumb == 'auto') {
                $thumb.attr('src', settings.srcThumbAuto);
            }
            else {
                $thumb.attr('src', settings.srcThumbCustom)
            }
            if (settings.typePlay == 'autoInline') {
                $thumb.closest('.thumb-video').hide();
                $iframe.attr('src', settings.linkProcessed).show();
            }
            $video.css({
                'height' : settings.heightVideo !=-1 ? settings.heightVideo + 'px' : ''
            });
            $thumb.css('background-color', settings.backgroundColor);
            $video.attr('id', settings.customID)
                .addClass(settings.customClass)
                .renderItemDefaultAttributes(settings.customEnableAttributes, settings.customDataAttributes);
            $video.renderItemDefaultBoxModel(settings.boxModelSettings);
            if (settings.customEnableAnimations) {
                var animation = settings.customDataAnimations;
                $video.processAnimations(animation)
            }
            self.$el.defaultResponsive(settings);

            function setMagnificPopup() {
                AWEContent.jqIframe($mgfVideo).magnificPopup({
                    disableOn: 700,
                    prependTo: '.awe-page-wrapper',
                    type: 'iframe',
                    mainClass: 'mfp-fade',
                    removalDelay: 160,
                    preloader: false,
                    fixedContentPos: false
                });
            }

            return $video;
        },
        applySettingsChanged: function(model) {
            var self = this,
                $video = $('.awe-video', self.el),
                $thumbContainer = $('.thumb-video', $video),
                $imgIframe = $('img, iframe', $video),
                $img = $('img', $video),
                $mgfVideo = $('a', $video),
                $iframe = $('iframe', $video),
                settings = model.toJSON(),
                animation, prevAnimation,
                heightBefore = self.$el.height();

            $.each(model.changedAttributes(), function(key, value) {
                self.$el.changeResponsive(key, value);
                $video.renderChangeSettingBoxModel(key, value, model);
                switch (key) {
                    case 'linkVideo':
                        $mgfVideo.attr('href', value);
                        break;
                    case 'linkProcessed':
                        if (settings.typePlay == 'autoInline')
                            $iframe.attr('src', value);
                        else {
                            $iframe.attr('src', '');
                            $thumbContainer.show();
                        }
                        break;
                    case 'typeThumb':
                        if (value == 'auto')
                            $img.attr('src', settings.srcThumbAuto);
                        else {
                            $img.attr('src', settings.srcThumbCustom);
                        }
                        break;
                    case 'srcThumbAuto':
                        if (settings.typeThumb == 'auto')
                            $img.attr('src', value);
                        break;

                    case 'thumbStyle':
                        var fid = settings.fidThumbCustom,
                            style = settings.thumbStyle;
                        if (fid) {
                            $.ajax({
                                type: "POST",
                                url : AWEContent.Path.imageStyleURL,
                                data : { fids : "" +fid, styles: style},
                                success: function (response) {
                                    self.model.set('srcThumbCustom', response[fid][style]);
                                    AWEContent.Panels.video.$el.find('#video-upload-thumbnail .image-content').attr('src', response[fid][style]);
                                }
                            });
                        }
                        break;
                    case 'srcThumbCustom':
                        if (settings.typeThumb == 'custom')
                            $img.attr('src', value);
                        break;
                    case 'typePlay':
                        if (value == 'autoInline'){
                            $thumbContainer.hide();
                            $iframe.show().attr('src', settings.linkProcessed);
                        }
                        else{
                            $thumbContainer.show();
                            $iframe.hide().attr('src', '');
                        }
                        break;
                    case 'heightVideo':
                        $video.css('height', value !=-1 ? value + 'px' : '');
                        break;
                    case 'backgroundColor' :
                        $thumbContainer.css("background", value);
                        break;
                    case 'customID':
                        $video.attr('id', value);
                        break;
                    case 'customClass':
                        var classPrev = self.model.previousAttributes().customClass;
                        $video.removeClass(classPrev).addClass(value);
                        break;
                    case 'customEnableAttributes':
                        $video.renderChangeSettingsAttributes(key, value, settings.customDataAttributes);
                        break;
                    case 'customActionAttributes':
                        $video.renderChangeSettingsAttributes(key, value);
                        break;
                    case 'customEnableAnimations':
                        var animation, prevAnimation;
                        if (value) {
                            animation = settings.customDataAnimations;
                            prevAnimation = null;
                            $video.processAnimations(animation);
                        }
                        else {
                            animation = null;
                            prevAnimation = settings.customDataAnimations;
                            $video.processAnimations(animation, prevAnimation);
                        }
                        break;

                    case 'customDataAnimations':
                        var animation, prevAnimation;
                        animation = settings.customDataAnimations;
                        prevAnimation = self.model.previousAttributes().customDataAnimations;
                        $video.processAnimations(animation, prevAnimation);
                        break;
                }
            });

            // Listen event change height of item
            setTimeout(function() {
                self.checkChangeHeight(heightBefore);
            }, 50);
        }
    });

    AWEContent.Views.VideoItemController = AWEContent.Views.ItemController.extend({
        machineName : 'video',
        controllerHtml : function() {
            return '<div class="title-icon">Video</div><i class="ic ac-icon-video"></i>';
        },
        createItemModel: function(templateData) {
            var boxModelSettings;
            if (templateData!= undefined) {

                boxModelSettings = new AWEContent.Models.BoxModelSettings(templateData.boxModelSettings);
                templateData.boxModelSettings = boxModelSettings;

                return new AWEContent.Models.VideoItem(templateData);
            }

            return new AWEContent.Models.VideoItem({'boxModelSettings' : new AWEContent.Models.BoxModelSettings()});
        }
    });

    AWEContent.Views.VideoPanel = AWEContent.Views.ItemPanel.extend({
        tagName: "div",
        className: "awe-obj-panel video-panel",
        panelName: "video",
        initPanel: function() {
            AWEContent.Views.ItemPanel.prototype.initPanel.call(this);
            var self = this;

            $('.thumb-container', self.el).attr('id', 'video-upload-thumbnail').aweUploadImageInit();
            $('.slide-image-container', self.el).attr('id', 'video-slide-thumbnail').aweSlideImageInit();

            $('.color-picker', self.el).append('<input type="hidden" name="changing-color">');
            $('#text-video-link-video', self.el).change(function(){
                var resultVideo = $.processVideo($(this).val()),
                    linkProcessed = resultVideo.attrVideo.replace('autoplay=0', 'autoplay=1');
                self.editingModel.set('linkVideo', $(this).val());
                self.editingModel.set('linkProcessed', linkProcessed);
                $('#video-slide-thumbnail input[name=custom_image]', self.el).val(0).trigger('change');
            });
            $('#video-select-thumb', self.el).change(function(event, values) {
                self.editingModel.set('typeThumb', values.value);
                if (values.value == 'auto'){
                    $('#video-slide-thumbnail', self.el).show();
                    $('#video-upload-thumbnail', self.el).hide();
                }
                else {
                    $('#video-slide-thumbnail', self.el).hide();
                    $('#video-upload-thumbnail', self.el).show();
                }
            });
            $('#video-slide-thumbnail input[name=custom_image]', self.el).change(function(event, isPanel){
                var indexActive = parseInt($(this).val()),
                    $slideThumb = $(this).closest('.slide-image-container'),
                    linkVideo = self.editingModel.get('linkVideo'),
                    resultVideo = $.processVideo(linkVideo),
                    id = resultVideo.id.trim(),
                    typeVideo = resultVideo.typeVideo,
                    $typeThumb = $(this).closest('.slide-image-container').prev('#video-select-thumb'),
                    typeThumb = $('input[name=selected_value]', $typeThumb).val(),
                    $navigation = $(this).prev('.slide-image-controls');
                $('img', $slideThumb).removeClass('active');

                if (typeVideo == 'youtube') {
                    $navigation.show();
                    $.each($('img', $slideThumb), function(){
                        var index = $(this).index();
                        if (id != '')
                            $(this).attr('src','http://img.youtube.com/vi/'+id +'/' + index +'.jpg');
                        else
                            $(this).attr('src','http://img.youtube.com/vi/' + index +'.jpg' )
                    });
                    var srcThumb = $('img', $slideThumb).eq(indexActive).addClass('active').attr('src');
                    $('img', $slideThumb).eq(indexActive).addClass('active');
                        self.editingModel.set('indexThumbAuto', indexActive);
                        self.editingModel.set('srcThumbAuto', srcThumb);
                }
                else if (typeVideo == 'vimeo'){
                    $.ajax({
                        type:'GET',
                        url: 'http://vimeo.com/api/v2/video/' + id + '.json',
                        jsonp: 'callback',
                        dataType: 'jsonp',
                        success: function(data){
                            $navigation.hide();
                            var thumbnail_src = data[0].thumbnail_large;
                            self.editingModel.set('indexThumbAuto', 0);
                            self.editingModel.set('srcThumbAuto', thumbnail_src);
                            $('img', $slideThumb).eq(0).attr('src', thumbnail_src).addClass('active');
                        }
                    });

                }
            });

            $('#video-upload-thumbnail input[name=selected_media]', self.el).change(function(event){
                var srcImage, $image = $(this).prev().find('img'),
                    data = $(this).val(),
                    styles = self.editingModel.get('thumbStyle');


                if (data != '') {
                    data = $.parseJSON(data);
                    if (AWEContent.Path.imageStyleURL != '') {
                        $.ajax({
                            type: 'POST',
                            url: AWEContent.Path.imageStyleURL,
                            data: {fids: ''+data.fid, styles: styles},
                            success: function (response) {
                                if ($.type(response) == 'string')
                                    response = JSON.parse(response.trim());

                                srcImage = response[data.fid][styles];

                                self.editingModel.set({
                                    srcThumbCustom: srcImage,
                                    fidThumbCustom : data.fid
                                });
                                $image.attr('src', srcImage)
                            }
                        });
                    }
                    else {
                        srcImage = data.file_url;
                        self.editingModel.set('srcThumbCustom', srcImage);
                        $image.attr('src', srcImage)
                    }

                }
            });

            $('#video-thumb-style', this.el).change(function(event, values) {
                self.editingModel.set('thumbStyle', values.value);
            });

            $('#video-play-video', self.el).change(function(event, values){
                self.editingModel.set('typePlay', values.value);
            });
            $('#video-height-video', self.el).change(function(event, values){
                self.editingModel.set('heightVideo', values.value);
                if (values.value == -1)
                    $('.display-font', $(this)).text('DF');
            });
            $("#video-background-color", self.el).change(function(event, color) {
                if (color)
                    color = color.toRgbString();
                else
                    color = '';
                self.editingModel.set("backgroundColor", color);
            });
            $('#video-layout-tab', self.el).initBoxModelPanel(self, 'boxModelSettings');
            $('#text-video-custom-id', this.el).change(function(){
                self.editingModel.set('customID', $(this).val());
            });
            $('#text-video-custom-classes', this.el).change(function() {
                self.editingModel.set('customClass', $(this).val());
            });
            $('#video-custom-attributes', this.el).initAttributesPanel(self);
            $('#video-animations input[name=enabled_custom_animation]', this.el).change(function(event, data) {
                self.editingModel.set('customEnableAnimations', parseInt($(this).val()));
                if (data){
                    self.editingModel.set('customDataAnimations', JSON.stringify(data.animations));
                }
            });
        },
        setPanelElementsValue: function() {
            var self = this,
                settings = this.editingModel.toJSON();

            $('#text-video-link-video', self.el).val(settings.linkVideo).trigger('change');
            $('#video-select-thumb', self.el).aweSelect('value', settings.typeThumb);
            $('#video-slide-thumbnail input[name=custom_image]', self.el).val(settings.indexThumbAuto).trigger('change', {isCustom : true});
            $('#video-upload-thumbnail .image-content', self.el).attr('src', settings.srcThumbCustom);
            if (AWEContent.Path.imageStyleURL != '') {
                $('#video-thumb-style', self.el).aweSelect('value', settings.thumbStyle);
            }
            else {
                $('#video-thumb-style', self.el).remove();
            }
            $('#video-play-video', self.el).aweSelect('value', settings.typePlay);
            $('#video-height-video', self.el).aweSlider('value', settings.heightVideo);
            $('#video-background-color', self.el).aweColorPicker('value', settings.backgroundColor);
            $('#video-layout-tab', self.el).initBoxModel(settings.boxModelSettings);
            $('#text-video-custom-id', self.el).val( settings.customID);
            $('#text-video-custom-classes', self.el).val( settings.customClass);
            $('#video-custom-attributes input[name=enabled_custom_attributes]', self.el).val(settings.customEnableAttributes).trigger('change');
            $('#video-custom-attributes input[name=attributes_data]', self.el).val(settings.customDataAttributes);
            $('#video-custom-attributes', this.el).initAttributes(settings.customEnableAttributes, settings.customDataAttributes);
            $('#video-animations input[name=enabled_custom_animation]', this.el).val(settings.customEnableAnimations).trigger('change');
            $('#video-animations input[name=enabled_custom_animation]', this.el).attr('data-animations', settings.customDataAnimations).data('view', this.editingModel.view);
        },
        buildPanel: function() {
            return {
                "title": {
                    "type": "markup",
                    "markup": "<div class=\"awe-title\"><h2>Video<\/h2><\/div>"
                },
                'information-video' : {
                    type: "section",
                    link_video: {
                        type: "text_field",
                        title: "Link",
                        placeholder : 'http://...',
                        default_value: ""
                    },
                    'select_thumb' : {
                        type: "select",
                        title: "Thumb",
                        options: {
                            'auto' : 'Auto',
                            "custom" : "Custom"
                        },
                        default_value: "custom"
                    },
                    slider_thumbnail : {
                        type: 'markup',
                        markup: '<div class="slide-image-container"><div class="list-image"><img src="" alt=""/><img src="" alt=""/><img src="" alt=""/><img src="" alt=""/></div><div class="slide-image-controls"><i class="nav-prev ic ac-icon-arrow-left"></i><i class="nav-next ic ac-icon-arrow-right"></i></div><input type="hidden" name="custom_image" value=""/></div>'
                    },
                    upload_thumbnail : {
                        type : 'markup',
                        'markup' : '<div class="thumb-container"><div class="controls-upload ic ac-icon-upload"></div><div class="image-container"><img class="image-content" src="" alt=""/><div class="remove-image ic ac-icon-clear"></div></div><input type="hidden" name="selected_media" value=""/></div>'
                    },
                    'thumb_style' : {
                        type: "image_style_list",
                        title: "Thumbnail Style",
                        default_value: "none",
                        attributes: {
                            'class': ['long-title']
                        }
                    },
                    play_video : {
                        type: "select",
                        title: "Play",
                        options: {
                            "autoInline" : "Auto play inline",
                            'inline' : 'Inline',
                            'lightbox' : 'Play in lightbox'
                        },
                        default_value: "inline"
                    },
                    'height_video' : {
                        'type' : 'slider',
                        'title' : 'Height',
                        'min_value' : -1,
                        'max_value' : 1000,
                        'unit' : 'px',
                        'default_value' : 20,
                        allow_type: true
                    },
                    "background_color" :{
                        "type": "colorpicker",
                        "title": "Background color",
                        "options": {
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
                                    video_border: {
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
                                    video_boder_radius: {
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
                                    video_padding: {
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
                                    video_margin: {
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
                        default_value: "ID"
                    },
                    custom_classes: {
                        type: "text_field",
                        title: "Classes",
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
        AWEContent.Controllers.video = new AWEContent.Views.VideoItemController();
        AWEContent.Panels.video = new AWEContent.Views.VideoPanel();
    });
})(jQuery);
