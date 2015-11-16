/**
 * File: awecontent-facebook-item.js
 * Author: AWEThemes
 * Website: http://awethemes.com/
 */
(function($) {
    "use strict";

    /**
     * Define model for heder item
     */
    AWEContent.Models.FacebookItem = AWEContent.Models.Item.extend({
        defaults: {
            machine_name: "facebook",
            facebookUrl: 'https://www.facebook.com/megadrupal?fref=ts',
            width: '300',
            height : '300',
            colorScheme : 'dark',
            friendsFaces: 0,
            header: 0,
            posts: 0,
            border: 0,
            boxModelSettings : {},
            customID : '',
            customClass : '',
            customEnableAttributes: 0,
            customDataAttributes: '[] ', // Array Json ex : [{"attrName":"autoPlay","attrValue":"true"}]
            customActionAttributes : '{"newAction": "", "newAttrName": "", "newAttrValue": ""}',
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
            this.view = new AWEContent.Views.FacebookItem({model: this});
        },
        clone : function(){
            var cloneModel = {};
            $.each(this.toJSON(), function(key,value){
                cloneModel[key] = value;
            });
            cloneModel.boxModelSettings = new AWEContent.Models.BoxModelSettings(cloneModel.boxModelSettings);
            return new AWEContent.Models.FacebookItem(cloneModel);
        }
    });

    /**
     * Define View for HeaderItem
     */
    AWEContent.Views.FacebookItem = AWEContent.Views.Item.extend({
        additionalEvents: {},
        initialize: function() {
            AWEContent.Views.Item.prototype.initialize.call(this);
            this.listenTo(this.model.get("boxModelSettings"), "change", this.applySettingsChanged);
        },
        renderItemContent: function() {
            var self = this,
                settings = self.model.toJSON(),
                $facebook = $('<iframe class="awe-item awe-facebook" src=""></iframe>');
            $facebook.attr('src', self.processFacebook())
                .css({
                    width: settings.width == -1 ? '' : (settings.width + 'px'),
                    height: settings.height == -1 ? '' : (settings.height + 'px')
                })
                .attr('id', settings.customID)
                .addClass(settings.customClass);
            $facebook.renderItemDefaultBoxModel(settings.boxModelSettings);
            $facebook.renderItemDefaultAttributes(settings.customEnableAttributes, settings.customDataAttributes);
            if (settings.customEnableAnimations) {
                var animation = settings.customDataAnimations;
                $facebook.processAnimations(animation)
            }
            self.$el.defaultResponsive(settings);
            return $facebook;
        },
        applySettingsChanged: function(model) {
            var self = this,
                $facebook = $('.awe-facebook', self.el),
                settings = self.model.toJSON(),
                heightBefore = self.$el.height();

            $.each(model.changedAttributes(), function(key, value){
                self.$el.changeResponsive(key, value);
                $facebook.renderChangeSettingBoxModel(key, value, model);
                switch (key) {
                    case 'facebookUrl':
                    case 'colorScheme':
                    case 'friendsFaces':
                    case 'header':
                    case 'posts':
                    case 'border':
                        $facebook.attr('src', self.processFacebook());
                        break;

                    case 'width':
                        value == -1 ? $facebook.css('width', '') : $facebook.css('width', value + 'px');
                        $facebook.attr('src', self.processFacebook());
                        break;

                    case 'height':
                        value == -1 ? $facebook.css('height', '') : $facebook.css('height', value +'px');
                        $facebook.attr('src', self.processFacebook());
                        break;

                    case 'customID' :
                        $facebook.attr('id', value);
                        break;

                    case 'customClass':
                        var prevClass = self.model.previousAttributes().customClass;
                        $facebook.removeClass(prevClass).addClass(value);
                        break;

                    case 'customEnableAttributes':
                        $facebook.renderChangeSettingsAttributes(key, value, settings.customDataAttributes);
                        break;

                    case 'customActionAttributes':
                        $facebook.renderChangeSettingsAttributes(key, value);
                        break;

                    case 'customEnableAnimations':
                        var animation, prevAnimation;
                        if (value) {
                            animation = settings.customDataAnimations;
                            prevAnimation = null;
                            $facebook.processAnimations(animation);
                        }
                        else {
                            animation = null;
                            prevAnimation = settings.customDataAnimations;
                            $facebook.processAnimations(animation, prevAnimation);
                        }

                        break;
                    case 'customDataAnimations':
                        var animation, prevAnimation;
                        animation = settings.customDataAnimations;
                        prevAnimation = self.model.previousAttributes().customDataAnimations;
                        $facebook.processAnimations(animation, prevAnimation);
                        break;
                }
            });

            // Listen event change height of item
            setTimeout(function() {
                self.checkChangeHeight(heightBefore);
            }, 50);
        },
        processFacebook: function(){
            var self = this,
                settings = self.model.toJSON(),
                srcIframe = '';

            if ( settings.facebookUrl !='') {
                srcIframe += '//www.facebook.com/plugins/likebox.php?href=';
                srcIframe += settings.facebookUrl;
                srcIframe += '&colorscheme=' + settings.colorScheme;
                srcIframe += settings.friendsFaces ? '&show_faces=true' : '&show_faces=false';
                srcIframe += settings.header ? '&header=true' : '&header=false';
                srcIframe += settings.posts ? '&stream=true' : '&stream=false';
                srcIframe += settings.border ? '&show_border=true' : '&show_border=false';
                srcIframe += settings.width!= -1 ? '&width=' + settings.width : '';
                srcIframe += settings.height!= -1 ? '&height=' + settings.height : '';
            }
            return srcIframe;
        }
    });

    /**
     * Define view for Header Controller
     * li tag what is contained by items panel
     */
    AWEContent.Views.FacebookItemController = AWEContent.Views.ItemController.extend({
        machineName : 'facebook',
        controllerHtml: function() {
            return '<div class="title-icon">Facebook like box</div><i class="ic ac-icon-facebook"></i>';
        },
        createItemModel: function(templateData) {
            var boxModelSettings;
            if (templateData!= undefined) {

                boxModelSettings = new AWEContent.Models.BoxModelSettings(templateData.boxModelSettings);
                templateData.boxModelSettings = boxModelSettings;

                return new AWEContent.Models.FacebookItem(templateData);
            }

            return new AWEContent.Models.FacebookItem({'boxModelSettings' : new AWEContent.Models.BoxModelSettings()});
        }
    });

    /**
     * Define header panel
     */
    AWEContent.Views.FacebookPanel = AWEContent.Views.ItemPanel.extend({
        tagName: "div",
        className: "awe-obj-panel facebook-panel",
        panelName: "facebook",
        initPanel: function() {
            AWEContent.Views.ItemPanel.prototype.initPanel.call(this);
            var self = this;

            $('#text-facebook-custom-url', self.el).change( function(){
                self.editingModel.set('facebookUrl', $(this).val());
            });
            //$(document).mouseup (function() {
            //    var $fbWidth = $('#facebook-width'),
            //        $varWidth = $('.slider-val', $fbWidth),
            //        $fontWidth = $('.display-font', $fbWidth),
            //        $fbHeight = $('#facebook-height'),
            //        $varHeight = $('.slider-val', $fbHeight),
            //        $fontHeight = $('.display-font', $fbHeight);
            //
            //    if ($varWidth.data('mouseup') != undefined &&  !$varWidth.data('mouseup')) {
            //        $varWidth.data('mouseup', true);
            //        $fontWidth.trigger('change');
            //    }
            //    if ($varHeight.data('mouseup') != undefined &&  !$varHeight.data('mouseup')) {
            //        $varHeight.data('mouseup', true);
            //        $fontHeight.trigger('change');
            //    }
            //});
            //$('#facebook-width .slider-val', self.el).mousedown(function(){
            //    $(this).data('mouseup', false);
            //}).trigger('mousedown');
            $('#facebook-width', self.el).change( function(event, values){
                self.editingModel.set('width', values.value);
                if (values.value == -1)
                    $('.display-font', $(this)).text('DF');
            });
            //$('#facebook-height .slider-val', self.el).mousedown(function(){
            //    $(this).data('mouseup', false);
            //}).trigger('mousedown');
            $('#facebook-height', self.el).change(function(event, values){
                self.editingModel.set('height', values.value);
                if (values.value == -1)
                    $('.display-font', $(this)).text('DF');
            });
            $('#facebook-scheme-dark', self.el).change(function(event, values){
                self.editingModel.set('colorScheme', values.value);
            });
            $('#facebook-friend input', self.el).change( function(event, isPanel){
                if(!isPanel) {
                    self.editingModel.set('friendsFaces', parseInt($(this).val()));
                }
            });
            $('#facebook-header input', self.el).change( function(event, isPanel){
                if(!isPanel) {
                    self.editingModel.set('header', parseInt($(this).val()));
                }
            });
            $('#facebook-posts input', self.el).change( function(event, isPanel){
                if(!isPanel) {
                    self.editingModel.set('posts', parseInt($(this).val()));
                }
            });
            $('#facebook-border input', self.el).change( function(event, isPanel){
                if(!isPanel) {
                    self.editingModel.set('border', parseInt($(this).val()));
                }
            });
            $('#facebook-layout-tab', self.el).initBoxModelPanel(self, 'boxModelSettings');
            $('#text-facebook-custom-id', this.el).change(function(){
                self.editingModel.set('customID', $(this).val());
            });
            $('#text-facebook-custom-classes', this.el).change(function() {
                self.editingModel.set('customClass', $(this).val());
            });
            $('#facebook-custom-attributes', this.el).initAttributesPanel(self);
            $('#facebook-animations input[name=enabled_custom_animation]', this.el).change(function(event, data) {
                self.editingModel.set('customEnableAnimations', parseInt($(this).val()));
                if (data){
                    self.editingModel.set('customDataAnimations', JSON.stringify(data.animations));
                }
            });
        },
        setPanelElementsValue: function() {
            var self = this,
                settings = this.editingModel.toJSON();

            $('#text-facebook-custom-url', self.el).val(settings.facebookUrl);
            $('#facebook-width', self.el).aweSlider('value', settings.width);
            $('#facebook-height', self.el).aweSlider('value', settings.height);
            $('#facebook-scheme-dark', self.el).aweSelect('value', settings.colorScheme);
            $('#facebook-friend input', self.el).val(settings.friendsFaces).trigger('change', {isPanel : true});
            $('#facebook-header input', self.el).val(settings.header).trigger('change', {isPanel : true});
            $('#facebook-posts input', self.el).val(settings.posts).trigger('change', {isPanel : true});
            $('#facebook-border input', self.el).val(settings.border).trigger('change', {isPanel : true});
            $('#facebook-layout-tab', self.el).initBoxModel(settings.boxModelSettings);
            $('#text-facebook-custom-id', self.el).val(settings.customID);
            $('#text-facebook-custom-classes', self.el).val(settings.customClass);
            $('#facebook-custom-attributes', this.el).initAttributes(settings.customEnableAttributes, settings.customDataAttributes);
            $('#facebook-animations input[name=enabled_custom_animation]', this.el).val(settings.customEnableAnimations).trigger('change');
            $('#facebook-animations input[name=enabled_custom_animation]', this.el).attr('data-animations', settings.customDataAnimations).data('view', this.editingModel.view);
        },
        buildPanel: function() {
            return {
                "title": {
                    "type": "markup",
                    "markup": "<div class=\"awe-title\"><h2>Facebook<\/h2><\/div>"
                },
                "custom_type": {
                    "type": "section",

                    custom_url: {
                        type: "text_field",
                        title: "URL",
                        "attributes": {
                            "placeholder": "paste url here"
                        },
                        default_value: ""
                    }
                },
                'box_size' : {
                    'type' : 'section',
                    "width": {
                        "type": "slider",
                        "title": "Width",
                        "min_value": -1,
                        "max_value": 1000,
                        "default_value": 500,
                        "allow_type": true,
                        "unit": "px"
                    },
                    "height": {
                        "type": "slider",
                        "title": "Height",
                        "min_value": -1,
                        "max_value": 1000,
                        "default_value": 500,
                        "allow_type": true,
                        "unit": "px"
                    }
                },
                'news_feed' : {
                    type: "section",
                    "scheme_dark": {
                        "type": "select",
                        "title": "Color Scheme",
                        options : {
                            'dark' : 'Dark',
                            'light' : 'Light'
                        },
                        "default_value": 'dark'
                    },

                    "friend": {
                        "type": "toggle",
                        "title": "Friends'faces",
                        "default_value": 0
                    },
                    "header": {
                        "type": "toggle",
                        "title": "Header",
                        "default_value": 0
                    },
                    "posts": {
                        "type": "toggle",
                        "title": "Posts",
                        "default_value": 0
                    },
                    "border": {
                        "type": "toggle",
                        "title": "Border",
                        "default_value": 0
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
                        default_value: "ID"
                    },
                    custom_classes: {
                        type: "text_field",
                        title: "Classes",
                        default_value: "className"
                    },
                    "custom_attributes": {
                        "type": "custom_attributes"
                    },
                    animations: {
                        type: "animations"
                    }
                }
            };
        }
    });

    $(document).ready(function() {
        AWEContent.Controllers.facebook = new AWEContent.Views.FacebookItemController();
        AWEContent.Panels.facebook = new AWEContent.Views.FacebookPanel();
    });
})(jQuery);
