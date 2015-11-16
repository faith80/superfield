/**
 * File: awecontent-divider-item.js
 * Author: AWEThemes
 * Website: http://awethemes.com/
 */
(function($) {
    "use strict";

    /**
     * Define model for heder item
     */
    AWEContent.Models.DividerItem = AWEContent.Models.Item.extend({
        defaults: {
            machine_name: "divider",

            textContent: 'Divider text here',
            borderStyle: 'dotted',
            borderColor: '#ccc',
            borderWeight: 0,
            widthDivider : 0,
            with: 'text',
            fontFamily: '',
            fontStyle: '',
            fontSize: -1,
            lineHeight: -1,
            letterSpacing: -1,
            color: '',
            width : '200',
            margin: {},
            customID: '',
            customClass: '',
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
            this.view = new AWEContent.Views.DividerItem({model: this});
        },
        relations: [
            {
                type: Backbone.HasOne,
                key: "margin",
                relatedModel: AWEContent.Models.BoxModelSettings
            }
        ],
        clone : function(){
            var cloneModel = {};
            $.each(this.toJSON(), function(key,value){
                cloneModel[key] = value;
            });
            cloneModel.margin = new AWEContent.Models.BoxModelSettings(cloneModel.margin);
            return new AWEContent.Models.DividerItem(cloneModel);
        }
    });

    /**
     * Define View for HeaderItem
     */
    AWEContent.Views.DividerItem = AWEContent.Views.Item.extend({
        initialize: function() {
            AWEContent.Views.Item.prototype.initialize.call(this);
            this.listenTo(this.model.get("margin"), "change", this.applySettingsChanged);
        },
        renderItemContent: function() {
            var self = this,
                $divider = $('<div class="obj-content awe-item awe-divider">\
                <div class="divider-field">\
                    <span class="divider-left"><span class="line-divider"></span></span>\
                    <span class="text-divider"><div class="content" contenteditable="true" ></div></span>\
                    <span class="divider-right"><span class="line-divider"></span></span>\
                </div>\
                </div>'),
                settings = self.model.toJSON(),
                $dividerLeft = $('.divider-left', $divider),
                $dividerRight = $('.divider-right', $divider),
                $dividerText = $('.text-divider .content', $divider),
                $dividerLine = $('.line-divider', $divider);

            self.iframeJQuery(this.el).delegate('.awe-divider', "itemReady", function() {
                var heightBefore, heightAfter;
                self.iframeJQuery('.text-divider .content', this).hallo({
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
                    activated: function (event) {
                        heightBefore = $(event.target).height();
                    },
                    deactivated: function(event) {
                        self.changeContent(event);

                        heightAfter = $(event.target).height();
                        if (heightBefore != heightAfter) {
                            self.resizeItem();
                        }
                    }
                });
                // self.iframeJQuery('.text-divider', this).resizable({
                //     handles: "e",
                //     resize: function(event, ui) {
                //         var width = ui.size.width;
                //         self.model.set('width', width);
                //     },
                //     start: function (event, ui) {
                //         heightBefore = $(event.target).height();
                //     },
                //     stop : function (event,ui) {
                //         heightAfter = $(event.target).height();
                //         if (heightAfter != heightBefore) {
                //             self.resizeItem();
                //         }
                //     }
                // });
            });

            // process font style for element
            var css = {
                'font-size' : settings.fontSize == -1 ? '' : (settings.fontSize + 'px'),
                'line-height' : settings.lineHeight == -1 ? '' : (settings.lineHeight + 'px'),
                'letter-spacing' : settings.letterSpacing == -1 ? '' : (settings.letterSpacing + 'px'),
                'color' : settings.color,
                'width' : settings.width + 'px'
            }
            if (settings.fontStyle)
                css = $.extend({}, css, JSON.parse(settings.fontStyle));
            $dividerText.html(settings.textContent).css(css).addClass(settings.fontFamily.replace(/ /g, ''));

            if ( settings.with == 'none') {
                $dividerText.parent().hide();
                $dividerRight.hide();
            }
            $dividerLine.css({
                'border-top-style' : settings.borderStyle,
                'border-top-color': settings.borderColor,
                'border-top-width' : !settings.borderWeight ? '' : ( settings.borderWeight + 'px')
            });
            $divider.renderItemDefaultAttributes(settings.customEnableAttributes, settings.customDataAttributes);
            $divider.attr('id', settings.customID).addClass(settings.customClass).renderItemDefaultBoxModel(settings.margin);
            $divider.css('width', !settings.widthDivider ? '' : settings.widthDivider + 'px');
            if (settings.customEnableAnimations) {
                var animation = settings.customDataAnimations;
                $divider.processAnimations(animation)
            }
            self.$el.defaultResponsive(settings);
            return $divider;
        },
        changeContent : function(el) {
            var content = $(el.currentTarget).html();
            this.model.set('textContent', content);
        },
        applySettingsChanged: function(model) {
            var self = this,
                $divider = $('.awe-divider', self.el),
                $lineDivider = $('.line-divider', $divider),
                $textDivider = $('.text-divider .content', $divider),
                $dividerLeft = $('.divider-left', $divider),
                $dividerRight = $('.divider-right', $divider),
                settings = self.model.toJSON(),
                heightBefore = self.$el.height();

            $.each(model.changed, function(key, value) {
                self.$el.changeResponsive(key, value);
                $divider.renderChangeSettingBoxModel(key, value, model);
                switch (key) {
                    case 'borderStyle' :
                        $lineDivider.css('border-top-style', value);
                        break;

                    case 'borderColor' :
                        $lineDivider.css('border-top-color', value);
                        break;

                    case 'borderWeight' :
                        value == '0' ? $lineDivider.css('border-top-width', '') : $lineDivider.css('border-top-width', value + 'px');
                        break;

                    case 'widthDivider':
                        value == '0' ? $divider.css('width', '') : $divider.css('width', value + 'px');
                        break;

                    case 'with' :
                        if (value == 'none') {
                            $textDivider.parent().hide();
                            $dividerRight.hide();
                        }
                        else {
                            $textDivider.parent().show();
                            $dividerRight.show();
                        }
                        break;

                    case 'fontFamily':
                        var prevFamily = self.model.previousAttributes().fontFamily.replace(/ /g, ''),
                            currentFamily = value.replace(/ /g, '');
                        $textDivider.removeClass(prevFamily).addClass(currentFamily);
                        break;

                    case 'fontStyle':
                        var fontStyle = (value) ? JSON.parse(value) : {'font-weight': '', 'font-style': ''};
                        $textDivider.css(fontStyle);
                        break;

                    case 'fontSize' :
                        value == -1 ? $textDivider.css('font-size', '') : $textDivider.css('font-size', value + 'px');
                        break;

                    case 'lineHeight' :
                        value == -1 ? $textDivider.css('line-height', '') : $textDivider.css('line-height', value + 'px');
                        break;

                    case 'letterSpacing':
                        value == -1 ? $textDivider.css('letter-spacing','') : $textDivider.css('letter-spacing', value + 'px');
                        break;

                    case 'color' :
                        $textDivider.css('color', value);
                        break;

                    case 'width' :
                        $textDivider.css({
                            'width': value + 'px',
                            'left': 0
                        });
                        break;

                    case 'customID' :
                        $divider.attr('id', value);
                        break;

                    case 'customClass':
                        var prevClass = self.model.previousAttributes().customClass;
                        $divider.removeClass(prevClass).addClass(value);
                        break;

                    case 'customEnableAttributes':
                        $divider.renderChangeSettingsAttributes(key, value, settings.customDataAttributes);
                        break;

                    case 'customActionAttributes':
                        $divider.renderChangeSettingsAttributes(key, value);
                        break;

                    case 'customEnableAnimations':
                        var animation, prevAnimation;
                        if (value) {
                            animation = settings.customDataAnimations;
                            prevAnimation = null;
                            $divider.processAnimations(animation);
                        }
                        else {
                            animation = null;
                            prevAnimation = settings.customDataAnimations;
                            $divider.processAnimations(animation, prevAnimation);
                        }

                        break;
                    case 'customDataAnimations':
                        var animation, prevAnimation;
                        animation = settings.customDataAnimations;
                        prevAnimation = self.model.previousAttributes().customDataAnimations;
                        $divider.processAnimations(animation, prevAnimation);
                        break;
                }
            });

            // Listen event change height of item
            setTimeout(function() {
                self.checkChangeHeight(heightBefore);
            }, 50);
        }
    });

    /**
     * Define view for Header Controller
     * li tag what is contained by items panel
     */
    AWEContent.Views.DividerItemController = AWEContent.Views.ItemController.extend({
        machineName : 'divider',
        controllerHtml: function() {
            return '<div class="title-icon">Divider</div><i class="ic ac-icon-divider"></i>';
        },
        createItemModel: function(templateData) {
            var margin;
            if (templateData!= undefined) {

                margin = new AWEContent.Models.BoxModelSettings(templateData.margin);
                templateData.boxModelSettings = margin;

                return new AWEContent.Models.DividerItem(templateData);
            }

            return new AWEContent.Models.DividerItem({'margin' : new AWEContent.Models.BoxModelSettings()});
        }
    });
    /**
     * Define header panel
     */
    AWEContent.Views.DividerPanel = AWEContent.Views.ItemPanel.extend({
        tagName: "div",
        className: "awe-obj-panel panel-divider",
        panelName: "divider",
        initPanel: function() {
            AWEContent.Views.ItemPanel.prototype.initPanel.call(this);
            var self = this;

            $('#divider-style', this.el).change( function(event, values) {
                self.editingModel.set('borderStyle', values.value);
            });
            $('#divider-color', this.el).change(function(event, color) {
                if (color)
                    color = color.toRgbString();
                else
                    color = '';
                self.editingModel.set('borderColor', color);
            });
            $('#divider-height', this.el).change(function(event, values) {
                self.editingModel.set('borderWeight', values.value);
            });
            $('#divider-width', self.el).change( function(event, values) {
                    self.editingModel.set('widthDivider', values.value);
            });
            $('#divider-with', this.el).change( function(event, values) {
                if (values.value == 'none')
                    $('#divider-font, #divider-color-element', self.$el).hide()
                else
                    $('#divider-font, #divider-color-element', self.$el).show();

                self.editingModel.set('with', values.value);
            });

            $('#divider-font', this.$el).bind('fontFamilyChange', function(event, param) {
                self.editingModel.set('fontFamily', param);
            }).bind('fontStyleChange', function(event, fontStyle) {
                self.editingModel.set('fontStyle', fontStyle.value);
            }).bind('fontSizeChange', function(event, fontSize) {
                self.editingModel.set('fontSize', fontSize.value);
            }).bind('letterSpacingChange', function(event, letterSpacing) {
                self.editingModel.set('letterSpacing', letterSpacing.value);
            }).bind('lineHeightChange', function(event, lineHeight) {
                self.editingModel.set('lineHeight', lineHeight.value);
            });

            $('#divider-color-element', self.el).change(function(event, color) {
                if (color)
                    color = color.toRgbString();
                else
                    color = '';
                self.editingModel.set('color', color);
            });
            $('#divider-column-box-model', self.el).initBoxModelPanel(self, 'margin');
            $('#text-divider-custom-id', self.el).change( function() {
                self.editingModel.set('customID', $(this).val());
            });
            $('#text-divider-custom-class', self.el).change( function() {
                self.editingModel.set('customClass', $(this).val());
            });
            $('#divider-custom-attributes', this.el).initAttributesPanel(self);
            $('#divider-animations input[name=enabled_custom_animation]', this.el).change(function(event, data) {
                self.editingModel.set('customEnableAnimations', parseInt($(this).val()));
                if (data){
                    self.editingModel.set('customDataAnimations', JSON.stringify(data.animations));
                }
            });
        },
        setPanelElementsValue: function() {
            var settings = this.editingModel.toJSON();
            $('#divider-style', this.$el).aweSelect('value', settings.borderStyle);
            $('#divider-color', this.$el).aweColorPicker('value', settings.borderColor);
            $('#divider-height', this.$el).aweSlider('value', settings.borderWeight).trigger('change', {isPanel : true});
            $('#divider-width', this.$el).aweSlider('value', settings.widthDivider);
            $('#divider-with', this.el).aweSelect('value', settings.with);
            $('#divider-font', this.$el).aweFont('options', {
                fontFamily: settings.fontFamily,
                fontStyle: settings.fontStyle,
                fontSize: settings.fontSize,
                lineHeight: settings.lineHeight,
                letterSpacing: settings.letterSpacing
            });
            $('#divider-color-element', this.$el).aweColorPicker('value', settings.color);
            $('#divider-column-box-model', this.$el).initBoxModel(settings.margin);
            $('#text-divider-custom-id', this.el).val( settings.customID);
            $('#text-divider-custom-class', this.el).val( settings.customClass);
            $('#divider-custom-attributes', this.el).initAttributes(settings.customEnableAttributes, settings.customDataAttributes);
            $('#divider-animations input[name=enabled_custom_animation]', this.el).val(settings.customEnableAnimations).trigger('change');
            $('#divider-animations input[name=enabled_custom_animation]', this.el).attr('data-animations', settings.customDataAnimations).data('view', this.editingModel.view);
        },
        buildPanel: function() {
            return {
                "title": {
                    "type": "markup",
                    "markup": "<div class=\"awe-title\"><h2>Divider<\/h2><\/div>"
                },
                "custom_style": {
                    "type": "section",
                    "style": {
                        "type": "select",
                        "title": "Style",
                        "options": {
                            "solid": "Solid",
                            "dotted": "Dotter",
                            "dashed": "Dashed"
                        },
                        "default_value": "solid"
                    },
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
                    "height": {
                        "type": "slider",
                        "title": "Height",
                        "min_value": 0,
                        "max_value": 100,
                        "default_value": 12,
                        "allow_type": true,
                        "unit": "px"
                    },
                    "width": {
                        "type": "slider",
                        "title": "Width",
                        "min_value": 0,
                        "max_value": 1000,
                        "default_value": 12,
                        "allow_type": true,
                        "unit": "px"
                    }
                },
                "custom_element": {
                    "type": "section",
                    "with": {
                        "type": "select",
                        "title": "With",
                        "options": {
                            'none' : 'None',
                            "text": "Text"
                        },
                        "default_value": "text"
                    },
                    "font": {
                        "type": "font",
                        disabledElements: ['textAlign']
                    },
                    "color_element": {
                        "type": "colorpicker",
                        "title": "Color",
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
        AWEContent.Controllers.divider = new AWEContent.Views.DividerItemController();
        AWEContent.Panels.divider = new AWEContent.Views.DividerPanel();
    });
})(jQuery);
