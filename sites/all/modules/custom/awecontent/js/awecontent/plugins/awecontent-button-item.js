/**
 * File: awecontent-button-item.js
 * Author: AWEThemes
 * Website: http://awethemes.com/
 */
(function($) {
    "use strict";
    /**
     * Define model for heder item
     */
    AWEContent.Models.ButtonItem = AWEContent.Models.Item.extend({
        defaults: {
            machine_name: "button",
            buttonUrl: '',
            buttonStyle : 'none',
            textButton : 'Button',
            color: '',
            backgroundColor: '',
            hoverColor: '',
            hoverBackgroundColor: '',
            fontFamily: '',
            fontStyle: '',
            fontSize : -1, // '0' <-->  AUTO
            lineHeight: -1,
            letterSpacing: -1,
            openNewWindow: 1,
            boxModelSettings: {},
            customID : '',
            customClass : '',
            customEnableAttributes: 0,
            customDataAttributes: '[] ', // Array Json
            customActionAttributes: '{"newAction": "", "newAttrName": "", "newAttrValue": ""}',
            customEnableAnimations: 0,
            customDataAnimations: '{"type": "none"}', // Data Object
            lgResponsive: true,
            xsResponsive: true,
            mediumResponsive: true,
            smResponsive: true
        },
        createView: function() {
            this.view = new AWEContent.Views.ButtonItem({model: this});
        },
        relations: [
            {
                type: Backbone.HasOne,
                key: "boxModelSettings",
                relatedModel: AWEContent.Models.BoxModelSettings
            }
        ],
        clone : function() {
            var cloneModel = {};

            $.each(this.toJSON(), function(key,value){
                cloneModel[key] = value;
            });
            cloneModel.boxModelSettings = new AWEContent.Models.BoxModelSettings(cloneModel.boxModelSettings);

            return new AWEContent.Models.ButtonItem(cloneModel);
        }
    });

    /**
     * Define View for HeaderItem
     */
    AWEContent.Views.ButtonItem = AWEContent.Views.Item.extend({
        initialize : function(){
            AWEContent.Views.Item.prototype.initialize.call(this);
            this.listenTo(this.model.get('boxModelSettings'), 'change', this.applySettingsChanged);
        },
        renderItemContent: function() {
            var self = this,
                $button = $('<a href="" class="awe-btn awe-item"></a>'),
                $style = $('<style></style>'),
                settings = self.model.toJSON(),
                fontCss = {
                    'font-size' : settings.fontSize == -1 ? '' : (settings.fontSize + 'px'),
                    'line-height' : settings.lineHeight == -1 ? ' ' : (settings.lineHeight + 'px'),
                    'letter-spacing' : settings.letterSpacing == -1 ? ''  : (settings.letterSpacing + 'px'),
                    'font-family': settings.fontFamily
                };

            if (settings.fontStyle)
                fontCss = $.extend({}, fontCss, JSON.parse(settings.fontStyle));

            self.$el.append($style);
            self.classButton = 'awe-button-' + self.cid;
            self.enableEditText = 0;
            $button.attr({'href': settings.buttonUrl, 'id' : settings.customID})
                .addClass(settings.customClass + ' ' +self.classButton + ' ' + settings.buttonStyle)
                .html(settings.textButton)
                .css(fontCss)
                .renderItemDefaultBoxModel(settings.boxModelSettings);
            if (settings.openNewWindow)
                $button.attr('target', '_blank');
            $button.renderItemDefaultAttributes(settings.customEnableAttributes, settings.customDataAttributes);
            if (settings.customEnableAnimations)
                $button.processAnimations(settings.customDataAnimations)
            if (settings.textHover !='')
                $button.attr('data-hover', settings.textHover);
            $style.html(self.processStyle());
            self.iframeJQuery(this.el).delegate('.awe-btn.awe-item', "itemReady", function() {
                var heightBefore, heightAfter;
                self.iframeJQuery(this).hallo({
                    plugins: {
                        "halloformat": {}
                    },
                    editable: true,
                    create : function(){
                        this.addEventListener("paste", function(e) {
                            e.preventDefault();
                            var text = e.clipboardData.getData("text/plain");
                            AWEContent.documentIframe.execCommand("insertHTML", false, text);
                        });
                    },
                    activated : function (event) {
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

          return $button;
        },
        applySettingsChanged: function(model) {
            var self = this,
                $button = $('.awe-btn', self.$el),
                $style = $('style', self.$el),
                settings = model.toJSON(),
                heightBefore = self.$el.height();

            $.each(model.changedAttributes(), function(key, value) {
                self.$el.changeResponsive(key, value);
                $button.renderChangeSettingBoxModel(key, value, model);
                switch (key){
                    case 'buttonUrl':
                        $button.attr('href', value);
                        break;

                    case 'buttonStyle':
                        var prevClass = self.model.previousAttributes().buttonStyle;
                        $button.removeClass(prevClass).addClass(value);
                        break;

                    case 'textButton':
                        $button.html(value);
                        break;

                    case 'textHover':
                        $button.attr('data-hover', value);
                        break;

                    case 'color':
                    case 'backgroundColor':
                    case 'hoverColor':
                    case 'hoverBackgroundColor':
                        //$style.html(self.processStyle());
                        self.generateStyle();
                        break;

                    case 'fontFamily':
                        $button.css('font-family', value);
                        break;

                    case 'fontStyle':
                        var fontStyle = (value) ? JSON.parse(value) : {'font-weight': '', 'font-style': ''};
                        $button.css(fontStyle);
                        break;

                    case 'fontSize':
                        value == -1 ? $button.css('font-size', '') : $button.css('font-size', value + 'px');
                        break;

                    case 'lineHeight' :
                        value == -1 ? $button.css('line-height', '') : $button.css('line-height', value + 'px');
                        break;
                    case 'letterSpacing':
                        value == -1 ? $button.css('letter-spacing', '') : $button.css('letter-spacing', value + 'px');
                        break;

                    case 'openNewWindow' :
                        var target =  value ? '_blank' : '_self';
                        $button.attr('target', target);
                        break;

                    case 'customID':
                        $button.attr('id', value);
                        break;

                    case 'customClass':
                        var prevClass = self.model.previousAttributes().customClass;
                        $button.removeClass(prevClass).addClass(value);
                        break;

                    case 'customEnableAttributes':
                        $button.renderChangeSettingsAttributes(key, value, settings.customDataAttributes);
                        break;

                    case 'customActionAttributes':
                        $button.renderChangeSettingsAttributes(key, value);
                        break;

                    case 'customEnableAnimations':
                        var animation, prevAnimation;
                        if (value) {
                            animation = settings.customDataAnimations;
                            prevAnimation = null;
                            $button.processAnimations(animation);
                        }
                        else {
                            animation = null;
                            prevAnimation = settings.customDataAnimations;
                            $button.processAnimations(animation, prevAnimation);
                        }

                        break;
                    case 'customDataAnimations':
                        var animation, prevAnimation;
                        animation = settings.customDataAnimations;
                        prevAnimation = self.model.previousAttributes().customDataAnimations;
                        $button.processAnimations(animation, prevAnimation);
                        break;
                }
            });

            // Listen event change height of item
            setTimeout(function() {
                self.checkChangeHeight(heightBefore);
            }, 50);
        },
        changeContent : function(el){
            var self = this,
                settings = self.model.toJSON(),
                _html = $(el.currentTarget).html();
            this.model.set('textButton', _html);
        },
        editText: function(event){
            var self = this;
            if (!self.enableEditText) {
                self.iframeJQuery('a', self.el).hallo({
                    plugins: {
                        "halloformat": {}
                    },
                    editable: true,
                    create : function(){
                        this.addEventListener("paste", function(e) {
                            e.preventDefault();
                            var text = e.clipboardData.getData("text/plain");
                            AWEContent.documentIframe.execCommand("insertHTML", false, text);
                        });
                    },
                    deactivated: function(el) {
                        self.changeContent(el);
                    }
                });
                self.enableEditText = 1;
            }
        },
        processStyle : function(){
            var settings = this.model.toJSON(),
                style;

            style = '.' + this.classButton + '.awe-btn {' +
                'color :' + settings.color + ';' +
                'background-color:' + settings.backgroundColor + ';' +
                '} ' +
                '.' + this.classButton + '.awe-btn:hover {' +
                'color :' + settings.hoverColor + ';' +
                'background:' + settings.hoverBackgroundColor + ';' +
                '}';
            return style;
        },
        generateStyle: function() {
            var self = this,
                style = '',
                settings = this.model.toJSON();

            if (self.updateColor)
                clearTimeout(self.updateColor);

            self.updateColor = setTimeout(function() {
                style = '.' + self.classButton + '.awe-btn {' +
                    'color :' + settings.color + ';' +
                    'background-color:' + settings.backgroundColor + ';' +
                    '} ' +
                    '.' + self.classButton + '.awe-btn:hover {' +
                    'color :' + settings.hoverColor + ';' +
                    'background:' + settings.hoverBackgroundColor + ';' +
                    '}';

                // update style color
                $('style', self.el).html(style);

                // clear timeout
                self.updateColor = false;
            }, 100);
        }
    });

    /**
     * Define view for Header Controller
     * li tag what is contained by items panel
     */
    AWEContent.Views.ButtonItemController = AWEContent.Views.ItemController.extend({
        machineName: 'button',
        controllerHtml: function() {
            return '<div class="title-icon">Button</div><i class="ic ac-icon-button"></i>';
        },
        createItemModel: function(templateData) {
            var boxModelSettings;
            if (templateData!= undefined) {
                boxModelSettings = new AWEContent.Models.BoxModelSettings(templateData.boxModelSettings);
                templateData.boxModelSettings = boxModelSettings;

                return new AWEContent.Models.ButtonItem(templateData);
            }
            return new AWEContent.Models.ButtonItem({'boxModelSettings' : new AWEContent.Models.BoxModelSettings()});
        }
    });

    /**
     * Define header panel
     */
    AWEContent.Views.ButtonPanel = AWEContent.Views.ItemPanel.extend({
        tagName: "div",
        className: "awe-obj-panel panel-button",
        panelName: "button",
        initPanel: function() {
            AWEContent.Views.ItemPanel.prototype.initPanel.call(this);
            var self = this;

            $('#text-button-text-content', self.el).change(function(){
                self.editingModel.set('textButton', $(this).val());
            });
            $('#text-button-enter-link', this.el).change(function() {
                self.editingModel.set('buttonUrl', $(this).val());
            });
            $('#button-select-style', this.el).change(function(event, values) {
                self.editingModel.set('buttonStyle', values.value);
            });
            $('#button-text-color', this.el).change(function(event, color) {
                if (color)
                    color = color.toRgbString();
                else
                    color = '';
                self.editingModel.set('color', color);
            });
            $('#button-background-color', this.el).change(function(event, color) {
                if (color)
                    color = color.toRgbString();
                else
                    color = '';

                self.editingModel.set('backgroundColor', color);
            });
            $('#button-hover-text-color', this.el).change(function(event, color) {
                if (color)
                    color = color.toRgbString();
                else
                    color = '';
                self.editingModel.set('hoverColor', color);
            });
            $('#button-hover-background-color', self.el).change(function(event, color) {
                if (color)
                    color = color.toRgbString();
                else
                    color = '';

                self.editingModel.set('hoverBackgroundColor', color);
            });
            $('#button-font-name', this.$el).bind('fontFamilyChange', function(event, fontName) {
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

            $('#button-target-blank input', self.el).change( function(event, isPanel){
                if (!isPanel)
                    self.editingModel.set('openNewWindow', parseInt($(this).val()));
            });
            $('#button-column-box-model', self.el).initBoxModelPanel(self, 'boxModelSettings');
            $('#text-button-custom-id', self.el).change( function(){
                self.editingModel.set('customID', $(this).val());
            });
            $('#text-button-custom-class', self.el).change( function(){
                self.editingModel.set('customClass', $(this).val());
            });
            $('#button-custom-attributes', this.el).initAttributesPanel(self);
            $('#button-animations input[name=enabled_custom_animation]', this.el).change(function(event, data) {
                self.editingModel.set('customEnableAnimations', parseInt($(this).val()));
                if (data){
                    self.editingModel.set('customDataAnimations', JSON.stringify(data.animations));
                }
            });
        },
        setPanelElementsValue: function() {
            var self = this,
                settings = this.editingModel.toJSON();
            
            $('#text-button-enter-link', self.el).val(settings.buttonUrl);
            $('#button-select-style', this.el).aweSelect('value', settings.buttonStyle);
            $('#text-button-text-content', this.el).val(settings.textButton);
            $('#button-text-color', self.el).aweColorPicker('value', settings.color);
            $('#button-background-color', self.el).aweColorPicker('value', settings.backgroundColor);
            $('#button-hover-text-color', self.el).aweColorPicker('value', settings.hoverColor);
            $('#button-hover-background-color', self.el).aweColorPicker('value', settings.hoverBackgroundColor);
            $('#button-font-name', this.$el).aweFont('options', {
                fontFamily: settings.fontFamily,
                fontStyle: settings.fontStyle,
                fontSize: settings.fontSize,
                textAlign: settings.textAlign,
                letterSpacing: settings.letterSpacing,
                lineHeight: settings.lineHeight
            });
            $('#button-target-blank input', self.el).val(settings.openNewWindow).trigger('change');
            $('#button-column-box-model', self.el).initBoxModel(settings.boxModelSettings);
            $('#text-button-custom-id', self.el).val(settings.customID);
            $('#text-button-custom-class', self.el).val(settings.customClass);
            $('#button-custom-attributes', this.el).initAttributes(settings.customEnableAttributes, settings.customDataAttributes);
            $('#button-animations input[name=enabled_custom_animation]', this.el).val(settings.customEnableAnimations).trigger('change');
            $('#button-animations input[name=enabled_custom_animation]', this.el).attr('data-animations', settings.customDataAnimations).data('view', this.editingModel.view);
        },
        buildPanel: function() {
          return {
            "title": {
              "type": "markup",
              "markup": "<div class=\"awe-title\"><h2>Button<\/h2><\/div>"
            },
            "custom_attributes": {
              "type": "section",
              "enter_link": {
                "type": "text_field",
                "title": "Link",
                "attributes": {
                  "placeholder": "http:\/\/..."
                },
                "default_value": "http:\/\/"
              },
              "select_style": {
                "type": "select",
                "title": "Style",
                "options": {
                  "none" : "None",
                  "hvr-fade": "Fade",
                  "hvr-sweep-to-right": "Sweep To Right",
                  "hvr-sweep-to-left": "Sweep To Left",
                  "hvr-sweep-to-bottom": "Sweep To Bottom",
                  "hvr-sweep-to-top": "Sweep To Top"
                },
                "default_value": "none"
              }
            },
            "custom_color": {
              "type": "section",
              "text-color": {
                "type": "colorpicker",
                "title": "Button text color",
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
                "title": "Button background",
                "options": {
                    "preferredFormat"  : "rgb",
                    "AlphaVerticle"  : true,
                    "showAlpha"  : true,
                    "allowEmpty" : true,
                    "showInput" : true
                }
              },
              "hover_text_color": {
                "type": "colorpicker",
                "title": "Button hover text color",
                "options": {
                    "preferredFormat"  : "rgb",
                    "AlphaVerticle"  : true,
                    "showAlpha"  : true,
                    "allowEmpty" : true,
                    "showInput" : true
                }
              },
              "hover_background_color": {
                "type": "colorpicker",
                "title": "Button hover background",
                "options": {
                    "preferredFormat"  : "rgb",
                    "AlphaVerticle"  : true,
                    "showAlpha"  : true,
                    "allowEmpty" : true,
                    "showInput" : true
                }
              }
            },
            "custom_text": {
              "type": "section",
              font_name:{
                type: "font",
                  disabledElements: ['textAlign']
              }
            },
            "custom_target": {
              "type": "section",
              "target_blank": {
                "type": "toggle",
                "title": "Open in new window",
                "default_value": 0
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
                      'allow_type' : true,
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
                      'allow_type' : true,
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
                      'allow_type' : true,
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
                  "placeholder": "Custom ID"
                },
                "default_value": ""
              },
              "custom_class": {
                "type": "text_field",
                "title": "CSS class",
                "attributes": {
                  "placeholder": "Custom class"
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
        AWEContent.Controllers.button = new AWEContent.Views.ButtonItemController();
        AWEContent.Panels.button = new AWEContent.Views.ButtonPanel();
    });
})(jQuery);
