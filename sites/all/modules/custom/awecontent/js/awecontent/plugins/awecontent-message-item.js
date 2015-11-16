/**
 * File: awecontent-message-item.js
 * Author: AWEThemes
 * Website: http://awethemes.com/
 */
(function($) {
    "use strict";

    /**
     * Define model for header item
     */
    AWEContent.Models.MessageItem = AWEContent.Models.Item.extend({
        defaults: {
            machine_name: "message",
            textMessage : 'Type your message here',
            messageType : 'alert-success',
            fontFamily : '',
            fontStyle : '',
            textAlign : 'left',
            fontSize : -1,
            lineHeight : -1,
            letterSpacing : -1,
            color: '',
            backgroundColor : '',
            boxModelSettings : {},
            customID : '',
            customClass : '',
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
            this.view = new AWEContent.Views.MessageItem({model: this});
        },
        clone : function(){
            var cloneModel = {};
            $.each(this.toJSON(), function(key,value){
                cloneModel[key] = value;
            });
            cloneModel.boxModelSettings = new AWEContent.Models.BoxModelSettings(cloneModel.boxModelSettings);
            return new AWEContent.Models.MessageItem(cloneModel);
        }
    });

    /**
     * Define View for MessageItem
     */
    AWEContent.Views.MessageItem = AWEContent.Views.Item.extend({
        initialize: function(){
            AWEContent.Views.Item.prototype.initialize.call(this);
            this.listenTo(this.model.get('boxModelSettings'), 'change', this.applySettingsChanged);
        },
        renderItemContent: function() {
            var self = this,
                settings = self.model.toJSON(),
                $message = $('<div class="awe-message awe-item alert"></div>'),
                css = {
                    'font-size' : settings.fontSize == -1 ? '' : ( settings.fontSize + 'px'),
                    'line-height' : settings.lineHeight == -1 ? '' : (settings.lineHeight + 'px'),
                    'letter-spacing' : settings.letterSpacing  == -1 ? '' : (settings.letterSpacing + 'px'),
                    'color' : settings.color,
                    'background-color' : settings.backgroundColor,
                    'font-family': settings.fontFamily
                };
            if (settings.fontStyle)
                css = $.extend({}, css, JSON.parse(settings.fontStyle));

            $message.addClass((settings.messageType))
                .css(css)
                .html(settings.textMessage)
                .renderItemDefaultBoxModel(settings.boxModelSettings);
            if (settings.customClass != '')
                $message.addClass(settings.customClass);
            if (settings.customID)
                $message.attr('id', settings.customID);
            $message.renderItemDefaultAttributes(settings.customEnableAttributes, settings.customDataAttributes);
            if (settings.customEnableAnimations)
                $message.processAnimations(settings.customDataAnimations)

            self.iframeJQuery(this.el).delegate('.awe-message', "itemReady", function() {
                var heightBefore, heightAfter;

                self.iframeJQuery(this).hallo({
                    plugins: {
                        halloformat: {
                            formattings: {
                                bold: true,
                                italic: true,
                                underline: true,
                                strikethrough: true
                            }
                        },
                        hallojustify: {},
                        hallolists: {
                            lists: {
                                ordered: true,
                                unordered: true
                            }
                        }
                    },
                    create : function(){
                        this.addEventListener("paste", function(e) {
                            e.preventDefault();
                            var text = e.clipboardData.getData("text/plain");
                            AWEContent.documentIframe.execCommand("insertHTML", false, text);

                        });
                    },
                    editable: true,
                    activate: function (event) {
                        heightBefore = $(event.target).height();
                    },
                    deactivated: function(event) {
                        self.changeContent(event);
                        heightAfter = $(event.target).height();
                        if (heightAfter != heightBefore) {
                            self.resizeItem();
                        }
                    }
                });
            });
            self.$el.defaultResponsive(settings);

            return $message;
        },
        applySettingsChanged: function(model) {
            var self = this,
                settings = self.model.toJSON(),
                $message = $('> .awe-message', self.el),
                heightBefore = self.$el.height();

            $.each(model.changedAttributes(), function(key, value){
                self.$el.changeResponsive(key, value);
                $message.renderChangeSettingBoxModel(key, value, model);

                switch (key) {
                    case 'messageType' :
                        var prevType = self.model.previousAttributes().messageType;
                        $message.removeClass(prevType).addClass(value);
                        break;
                    case 'fontFamily':
                        $message.css('font-family', value);
                        break;
                    case 'fontStyle':
                        var fontStyle = (value) ? JSON.parse(value) : {'font-weight': '', 'font-style': ''};
                        $message.css(fontStyle);
                        break;
                    case 'textAlign':
                        $message.css('text-align', value);
                        break;
                    case 'fontSize' :
                        value == -1 ? $message.css('font-size', '') : $message.css('font-size', value + 'px');
                        break;
                    case 'lineHeight':
                        value == -1 ? $message.css('line-height', '') : $message.css('line-height', value + 'px');
                        break;
                    case 'letterSpacing':
                        value == -1 ? $message.css('letter-spacing', '') : $message.css('letter-spacing', value + 'px');
                        break;
                    case 'color' :
                        $message.css('color', value);
                        break;
                    case 'backgroundColor' :
                        $message.css('background-color', value);
                        break;
                    case 'customID':
                        $message.attr('id', value);
                        break;
                    case 'customClass':
                        var prevClass = self.model.previousAttributes().customClass;
                        $message.removeClass(prevClass).addClass(value);
                        break;
                    case 'customEnableAttributes':
                        $message.renderChangeSettingsAttributes(key, value, settings.customDataAttributes);
                        break;

                    case 'customActionAttributes':
                        $message.renderChangeSettingsAttributes(key, value);
                        break;

                    case 'customEnableAnimations':
                        var animation, prevAnimation;
                        if (value) {
                            animation = settings.customDataAnimations;
                            prevAnimation = null;
                            $message.processAnimations(animation);
                        }
                        else {
                            animation = null;
                            prevAnimation = settings.customDataAnimations;
                            $message.processAnimations(animation, prevAnimation);
                        }

                        break;
                    case 'customDataAnimations':
                        var animation, prevAnimation;
                        animation = settings.customDataAnimations;
                        prevAnimation = self.model.previousAttributes().customDataAnimations;
                        $message.processAnimations(animation, prevAnimation);
                        break;
                }
            });

            // Listen event change height of item
            setTimeout(function() {
                self.checkChangeHeight(heightBefore);
            }, 50);
        },
        changeContent: function(el){
            var _html = $(el.currentTarget).html();
            this.model.set('textMessage', _html);
        }
    });

    /**
     * Define view for Header Controller
     * li tag what is contained by items panel
     */
    AWEContent.Views.MessageItemController = AWEContent.Views.ItemController.extend({
        machineName: 'message',
        controllerHtml: function() {
            return '<div class="title-icon">Message</div><i class="ic ac-icon-message"></i>';
        },
        createItemModel: function(templateData) {
            var boxModelSettings;
            if (templateData!= undefined) {

                boxModelSettings = new AWEContent.Models.BoxModelSettings(templateData.boxModelSettings);
                templateData.boxModelSettings = boxModelSettings;

                return new AWEContent.Models.MessageItem(templateData);
            }

            return new AWEContent.Models.MessageItem({'boxModelSettings' : new AWEContent.Models.BoxModelSettings()});
        }
    });

    /**
     * Define header panel
     */
    AWEContent.Views.MessagePanel = AWEContent.Views.ItemPanel.extend({
        tagName: "div",
        className: "awe-obj-panel panel-message",
        panelName: "message",
        initPanel: function() {
            AWEContent.Views.ItemPanel.prototype.initPanel.call(this);
            var self = this;

            $('#message-style', this.$el).change(function(event, values) {
                self.editingModel.set('messageType', values.value);
            });

            $('#message-font-name', this.$el).bind('fontFamilyChange', function(event, fontName) {
                self.editingModel.set('fontFamily', fontName);
            }).bind('fontStyleChange', function(event, fontStyle) {
                self.editingModel.set('fontStyle', fontStyle.value);
            }).bind('textAlignChange', function(event, textAlign) {
                self.editingModel.set('textAlign', textAlign.value);
            }).bind('fontSizeChange', function(event, fontSize) {
                self.editingModel.set('fontSize', fontSize.value);
            }).bind('letterSpacingChange', function(event, letterSpacing) {
                self.editingModel.set('letterSpacing', letterSpacing.value);
            }).bind('lineHeightChange', function(event, lineHeight) {
                self.editingModel.set('lineHeight', lineHeight.value);
            });

            $('#message-color', this.$el).change( function(event, color) {
                if (color)
                    color = color.toRgbString();
                else
                    color = '';
                self.editingModel.set('color', color);
            });
            $('#message-background-color', this.$el).change(function(event, color) {
                if (color)
                    color = color.toRgbString();
                else
                    color = '';

                self.editingModel.set('backgroundColor', color);
            });
            $('#message-column-box-model', self.el).initBoxModelPanel(self, 'boxModelSettings');
            $('#text-message-custom-id', self.el).change( function(){
                self.editingModel.set('customID', $(this).val());
            });
            $('#text-message-custom-class', self.el).change( function(){
                self.editingModel.set('customClass', $(this).val());
            });
            $('#message-custom-attributes', this.el).initAttributesPanel(self);
            $('#message-animations input[name=enabled_custom_animation]', this.el).change(function(event, data) {
                self.editingModel.set('customEnableAnimations', parseInt($(this).val()));
                if (data){
                    self.editingModel.set('customDataAnimations', JSON.stringify(data.animations));
                }
            });
        },
        setPanelElementsValue: function() {
            var self = this,
                settings = this.editingModel.toJSON();

            $('#message-style', this.$el).aweSelect('value', settings.messageType);
            $('#message-font-name', this.$el).aweFont('options', {
                fontFamily: settings.fontFamily,
                fontStyle: settings.fontStyle,
                textAlign: settings.textAlign,
                fontSize: settings.fontSize,
                lineHeight: settings.lineHeight,
                letterSpacing: settings.letterSpacing
            });
            $('#message-color', this.$el).aweColorPicker('value', settings.color);
            $('#message-background-color', this.$el).aweColorPicker('value', settings.backgroundColor);
            $('#message-column-box-model', this.$el).initBoxModel(settings.boxModelSettings);
            $('#text-message-custom-id', this.$el).val(settings.customID);
            $('#text-message-custom-class', this.$el).val(settings.customClass);
            $('#message-custom-attributes', this.$el).initAttributes(settings.customEnableAttributes, settings.customDataAttributes);
            $('#message-animations input[name=enabled_custom_animation]', this.$el).val(settings.customEnableAnimations).trigger('change');
            $('#message-animations input[name=enabled_custom_animation]', this.$el).attr('data-animations', settings.customDataAnimations).data('view', this.editingModel.view);
        },
        buildPanel: function() {
            return {
                "title": {
                    "type": "markup",
                    "markup": "<div class=\"awe-title\"><h2>Message<\/h2><\/div>"
                },
                "custom_type": {
                    "type": "section",
                    "style": {
                        "type": "select",
                        "title": "Type",
                        "options": {
                            "alert-success": "Success",
                            "alert-info": "Info",
                            "alert-warning": "Warning",
                            "alert-danger": "Danger"
                        },
                        "default_value": "alert-success"
                    }
                },
                "custom_style": {
                    "type": "section",
                    font_name:{
                        type: "font"
                    }
                },
                "custom_color": {
                    "type": "section",
                    "color": {
                        "type": "colorpicker",
                        "title": "Color",
                        "options": {
                            "preferredFormat"  : "rgb",
                            "AlphaVerticle"  : true,
                            "showAlpha"  : true,
                            "allowEmpty" : true,
                            "showInput" : true
                        }
                    },
                    "background_color": {
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
                "custom_box_model": {
                    "type": "section",
                    "column_box_model": {
                        "type": "tabs",
                        "tabs": [{
                            "tab_title": "Border",
                            "contents": {
                                "custom_border": {
                                    "type": "box_border",
                                    "min_value": 0,
                                    "max_value": 100,
                                    "default_value": 0
                                }
                            }
                        }, {
                            "tab_title": "Radius",
                            "contents": {
                                "custom_border_radius": {
                                    "type": "box_model",
                                    "model_type": "border_radius",
                                    allow_type: true,
                                    "min_value": 0,
                                    "max_value": 100,
                                    "default_value": 0
                                }
                            }
                        }, {
                            "tab_title": "Padding",
                            "contents": {
                                "custom_padding": {
                                    "type": "box_model",
                                    "model_type": "padding",
                                    allow_type: true,
                                    "min_value": 0,
                                    "max_value": 100,
                                    "default_value": 0
                                }
                            }
                        }, {
                            "tab_title": "Margin",
                            "contents": {
                                "custom_margin": {
                                    "type": "box_model",
                                    "model_type": "margin",
                                    allow_type: true,
                                    "min_value": 0,
                                    "max_value": 100,
                                    "default_value": 0
                                }
                            }
                        }]
                    }
                },
                "custom_definitions": {
                    "type": "section",
                    "custom_id": {
                        "type": "text_field",
                        "title": "ID",
                        "attributes": {
                            "placeholder": "wrapper"
                        },
                        "default_value": ""
                    },
                    "custom_class": {
                        "type": "text_field",
                        "title": "CSS class",
                        "attributes": {
                            "placeholder": "wrapper"
                        },
                        "default_value": ""
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
        AWEContent.Controllers.message = new AWEContent.Views.MessageItemController();
        AWEContent.Panels.message = new AWEContent.Views.MessagePanel();
    });
})(jQuery);
