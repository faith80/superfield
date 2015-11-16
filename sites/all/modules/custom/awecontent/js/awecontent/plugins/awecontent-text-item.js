/**
 * File: awecontent-text-item.js
 * Author: AWEThemes
 * Website: http://awethemes.com/
 */
(function($) {
    "use strict";

    /**
     * Define model for heder item
     */
    AWEContent.Models.TextItem = AWEContent.Models.Item.extend({
        defaults: {
            machine_name: "text",
            textContent : 'This is a custom text. You can use editor to change how it display. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
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
            customDataAttributes: '[]',// Array Json ex : [{"attrName":"autoPlay","attrValue":"true"}]
            customActionAttributes: '{"newAction": "", "newAttrName": "", "newAttrValue": ""}',
            customEnableAnimations: 0,
            customDataAnimations: '{"type": "none"}', // Data Object {"type":"spinin","duration":"5000","delay":"0","advance":{"direction":"clockwise","numberOfSpin":"3"}}
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
            this.view = new AWEContent.Views.TextItem({model: this});
        },
        clone : function(){
            var cloneModel = {};
            $.each(this.toJSON(), function(key,value){
                cloneModel[key] = value;
            });

            cloneModel.boxModelSettings = new AWEContent.Models.BoxModelSettings(cloneModel.boxModelSettings);
            return new AWEContent.Models.TextItem(cloneModel);
        }
    });

    /**
     * Define View for HeaderItem
     */
    AWEContent.Views.TextItem = AWEContent.Views.Item.extend({
        initialize: function(){
            AWEContent.Views.Item.prototype.initialize.call(this);
            this.listenTo(this.model.get("boxModelSettings"), "change", this.applySettingsChanged);
        },
        renderItemContent: function() {
            var self = this,
                settings = self.model.toJSON(),
                $item = $('<div class="awe-text awe-item"></div>'),
                $text = $item,
                fontCss = {
                    'font-family': settings.fontFamily,
                    'text-align' : settings.textAlign,
                    'font-size' : settings.fontSize == -1 ? '' : (settings.fontSize + 'px'),
                    'line-height' : settings.lineHeight == -1 ? '' : (settings.lineHeight + 'px'),
                    'letter-spacing' : settings.letterSpacing == -1 ? ''  : ( settings.letterSpacing+ 'px'),
                    'color' : settings.color,
                    'background-color' : settings.backgroundColor
                };

            // prepare font style css
            if (settings.fontStyle) {
                fontCss = $.extend({}, fontCss, JSON.parse(settings.fontStyle));
            }

            $text.html(settings.textContent);
            $item.css(fontCss).renderItemDefaultBoxModel(settings.boxModelSettings);
            if (settings.customID != '') {
                $item.attr('id', settings.customID);
            }
            if (settings.customClass!= '') {
                $item.addClass(settings.customClass);
            }
            if (settings.customEnableAnimations) {
                $item.processAnimations(settings.customDataAnimations)
            }
            $item.renderItemDefaultAttributes(settings.customEnableAttributes, settings.customDataAttributes);
            self.iframeJQuery(this.el).delegate('.awe-text', "itemReady", function() {
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
                        halloheadings: {
                            'formatBlocks': ['p']
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
                    activated: function (event) {
                        heightBefore = $(event.target).height();
                    },
                    deactivated: function(event) {
                        self.changeContent(event);
                        heightAfter = $(event.target).height();
                        if (heightAfter != heightAfter) {
                            self.resizeItem();
                        }
                    }
                });
            });

            self.$el.defaultResponsive(settings);

            return $item;
        },
        applySettingsChanged: function(model) {
            var self = this,
                $text = $('.awe-text', self.el),
                settings = model.toJSON(),
                animation, prevAnimation,
                heightBefore = self.$el.height();

            $.each(model.changedAttributes(), function(key, value){
                self.$el.changeResponsive(key, value);
                $text.renderChangeSettingBoxModel(key, value, model);
                switch (key) {
                    case 'fontFamily':
                        if (value == 'Default')
                            $text.css('font-family', '');
                        else
                            $text.css('font-family', value);
                        break;

                    case 'fontStyle':
                        var fontStyle = (value) ? JSON.parse(value) : {'font-weight': '', 'font-style': ''};
                        $text.css(fontStyle);
                        break;

                    case 'textAlign':
                        $text.css('text-align', value);
                        break;

                    case 'fontSize':
                        value == -1 ? $text.css('font-size','') : $text.css('font-size',value + 'px');
                        break;

                    case 'lineHeight':
                        value == -1 ? $text.css('line-height','') : $text.css('line-height',value +'px');
                        break;

                    case 'letterSpacing':
                        value == -1 ? $text.css('letter-spacing','') : $text.css('letter-spacing',value  +'px');
                        break;

                    case 'color':
                        $text.css('color', value);
                        break;

                    case 'backgroundColor':
                        $text.css('background-color', value);
                        break;

                    case 'customID':
                        $text.attr('id', value);
                        break;

                    case 'customClass':
                        var prev_class = self.model.previousAttributes().customClass;
                        $text.removeClass(prev_class).addClass(value);
                        break;

                    case 'customEnableAttributes':
                        $text.renderChangeSettingsAttributes(key, value, settings.customDataAttributes);
                        break;

                    case 'customActionAttributes':
                        $text.renderChangeSettingsAttributes(key, value);
                        break;

                    case 'customEnableAnimations':
                        var animation, prevAnimation;
                        if (value) {
                            animation = settings.customDataAnimations;
                            prevAnimation = null;
                            $text.processAnimations(animation);
                        }
                        else {
                            animation = null;
                            prevAnimation = settings.customDataAnimations;
                            $text.processAnimations(animation, prevAnimation);
                        }

                        break;
                    case 'customDataAnimations':
                        var animation, prevAnimation;
                        animation = settings.customDataAnimations;
                        prevAnimation = self.model.previousAttributes().customDataAnimations;
                        $text.processAnimations(animation, prevAnimation);
                        break;
                }
            });

            // Listen event change height of item
            setTimeout(function() {
                self.checkChangeHeight(heightBefore);
            }, 50);
        },
        changeContent : function(el){
            var _html = $(el.currentTarget).html();
            this.model.set('textContent', _html);
        }
    });

    /**
     * Define view for Header Controller
     * li tag what is contained by items panel
     */
    AWEContent.Views.TextItemController = AWEContent.Views.ItemController.extend({
        machineName : 'text',
        controllerHtml: function() {
            return '<div class="title-icon">Text</div><i class="ic ac-icon-text"></i>';
        },
        createItemModel: function(templateData) {
            var boxModelSettings;
            if (templateData!= undefined) {

                boxModelSettings = new AWEContent.Models.BoxModelSettings(templateData.boxModelSettings);
                templateData.boxModelSettings = boxModelSettings;

                return new AWEContent.Models.TextItem(templateData);
            }
            return new AWEContent.Models.TextItem({'boxModelSettings' : new AWEContent.Models.BoxModelSettings()});
        }
    });

    /**
     * Define header panel
     */
    AWEContent.Views.TextPanel = AWEContent.Views.ItemPanel.extend({
        tagName: "div",
        className: "awe-obj-panel text-panel",
        panelName: "text",
        initPanel: function() {
            AWEContent.Views.ItemPanel.prototype.initPanel.call(this);
            var self = this;

            $('#text-font', this.$el).bind('fontFamilyChange', function(event, fontName) {
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

            $('#text-text-color', this.$el).change(function(event, color) {
                if (color)
                    color = color.toRgbString();
                else
                    color = '';

                self.editingModel.set('color', color);
            });

            $('#text-background-color', this.$el).change(function(event, color) {
                if (color)
                    color = color.toRgbString();
                else
                    color = '';
                self.editingModel.set('backgroundColor', color);
            });

            $("#text-layout-tab", this.el).initBoxModelPanel(this, "boxModelSettings");
            $('#text-text-custom-id', this.el).change(function(event, data){
                self.editingModel.set('customID', $(this).val());
            });
            $('#text-text-custom-classes', this.el).change(function() {
                self.editingModel.set('customClass', $(this).val());
            });
            $('#text-custom-attributes', this.el).initAttributesPanel(self);
            $('#text-animations input[name=enabled_custom_animation]', this.el).change(function(event, data) {
                self.editingModel.set('customEnableAnimations', parseInt($(this).val()));
                if (data){
                    self.editingModel.set('customDataAnimations', JSON.stringify(data.animations));
                }
            });
            $('#text-layout-tab', self.el).initBoxModelPanel(self, 'boxModelSettings');
        },
        setPanelElementsValue: function() {
            var settings = this.editingModel.toJSON();

            $('#text-font', this.$el).aweFont('options', {
                fontFamily: settings.fontFamily,
                fontStyle: settings.fontStyle,
                fontSize: settings.fontSize,
                textAlign: settings.textAlign,
                letterSpacing: settings.letterSpacing,
                lineHeight: settings.lineHeight
            });
            $('#text-text-color', this.$el).aweColorPicker('value', settings.color);
            $('#text-background-color', this.$el).aweColorPicker('value', settings.backgroundColor);
            $('#text-layout-tab', this.el).initBoxModel(settings.boxModelSettings);
            $('#text-text-custom-id', this.el).val( settings.customID);
            $('#text-text-custom-classes', this.el).val( settings.customClass);
            $('#text-custom-attributes input[name=enabled_custom_attributes]', this.el).val(settings.customEnableAttributes).trigger('change');
            $('#text-custom-attributes input[name=attributes_data]', this.el).val(settings.customDataAttributes);
            $('#text-custom-attributes', this.el).initAttributes(settings.customEnableAttributes, settings.customDataAttributes);
            $('#text-animations input[name=enabled_custom_animation]', this.el).val(settings.customEnableAnimations).trigger('change');
            $('#text-animations input[name=enabled_custom_animation]', this.el).attr('data-animations', settings.customDataAnimations).data('view', this.editingModel.view);
        },
        buildPanel: function() {
            return {
                "title": {
                    "type": "markup",
                    "markup": "<div class=\"awe-title\"><h2>Custom Text<\/h2><\/div>"
                },
                "custom_type": {
                    "type": "section",
                    "font": {
                        "type": "font"
                    }
                },
                'color' : {
                    'type' : 'section',
                    'text_color' : {
                        'type' : 'colorpicker',
                        'title' : 'Text Color',
                        'options' : {
                            "preferredFormat"  : "rgb",
                            "AlphaVerticle"  : true,
                            "showAlpha"  : true,
                            "allowEmpty" : true,
                            "showInput" : true
                        }
                    },
                    'background_color' : {
                        'type' : 'colorpicker',
                        'title' : 'Background Color',
                        'options' : {
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
                        default_value: "ID"
                    },
                    custom_classes: {
                        type: "text_field",
                        title: "Classes",
                        default_value: "className"
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
        AWEContent.Controllers.text = new AWEContent.Views.TextItemController();
        AWEContent.Panels.text = new AWEContent.Views.TextPanel();
    });
})(jQuery);