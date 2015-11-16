/**
 * File: awecontent-icon-item.js
 * Author: AWEThemes
 * Website: http://awethemes.com/
 */
(function($) {
    "use strict";

    /**
     * Define model for heder item
     */
    AWEContent.Models.IconItem = AWEContent.Models.Item.extend({
        defaults: {
            machine_name: "icon",
            nameIcon: 'ic ac-icon-help',
            fontSize: -1,
            lineHeight: -1,
            styleIcon: 'icon-plain',
            iconAlign : 'awe-icon-left',
            color: '',
            backgroundColor: '',
            hoverColor: '',
            hoverBackgroundColor: '',
            iconLink: '',
            boxModelSettings : {},
            customID : '',
            customClass: '',
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
        createView: function() {
            this.view = new AWEContent.Views.IconItem({model: this});
        },
        relations: [
            {
                type: Backbone.HasOne,
                key: "boxModelSettings",
                relatedModel: AWEContent.Models.BoxModelSettings
            }
        ],
        clone : function(){
            var cloneModel = {};
            $.each(this.toJSON(), function(key,value){
                cloneModel[key] = value;
            });
            cloneModel.boxModelSettings = new AWEContent.Models.BoxModelSettings(cloneModel.boxModelSettings);
            return new AWEContent.Models.IconItem(cloneModel);
        }
    });

    /**
     * Define View for HeaderItem
     */
    AWEContent.Views.IconItem = AWEContent.Views.Item.extend({
        initialize : function(){
            AWEContent.Views.Item.prototype.initialize.call(this);
            this.listenTo(this.model.get('boxModelSettings'), 'change', this.applySettingsChanged);
        },
        itemTemplate: _.template(
            '<div class="awe-item awe-icon">\
                <style></style>\
                <% if (iconLink) { %>\
                <a class="" href="<%= iconLink %>" target="_blank">\
                <% } %>\
                    <div class="awe-icon-container"><i class="<%= iconClasses %>"></i></div>\
                <% if (iconLink) { %>\
                </a>\
                <% } %>\
            </div>'
        ),
        itemStyle: _.template(
            '.<%= itemClass %>.awe-icon .awe-icon-container {\n\
                color: <%= color %>;\n\
                background-color: <%= bgColor %>;\n\
            }\n\
            .<%= itemClass %>.awe-icon .awe-icon-container:hover {\n\
                color: <%= hoverColor %>;\n\
                background-color: <%= hoverBgColor %>;\n\
            }\n'
        ),
        renderItemContent: function() {
            var self = this,
                settings = self.model.toJSON(),
                $icon = $(this.itemTemplate({iconLink: settings.iconLink, iconClasses: settings.nameIcon})),
                $style = $('style', $icon);

            self.itemClass = 'awe-icon-' + this.cid;
            $icon.addClass(self.itemClass).css({
                'font-size' : settings.fontSize == -1 ? '' : (settings.fontSize + 'px'),
                'line-height' : settings.lineHeight == -1 ?  '' : ( settings.lineHeight + 'px')
            }).renderItemDefaultBoxModel(settings.boxModelSettings);

            $icon.addClass(settings.styleIcon);
            $style.html(this.itemStyle({
                itemClass: this.itemClass,
                color: settings.color,
                bgColor: settings.backgroundColor,
                hoverColor: settings.hoverColor,
                hoverBgColor: settings.hoverBackgroundColor
            }));
            $icon.addClass(settings.customClass).attr('id', settings.customID);
            $icon.renderItemDefaultAttributes(settings.customEnableAttributes, settings.customDataAttributes);
            if (settings.customEnableAnimations) {
                $icon.processAnimations(settings.customDataAnimations)
            }
            self.$el.defaultResponsive(settings);
            $icon.addClass(settings.iconAlign);

            return $icon;
        },
        applySettingsChanged: function(model) {
            var self = this,
                $icon = $('.awe-icon', self.el),
                $i = $('i', $icon),
                $style = $('style', $icon),
                settings = model.toJSON(),
                heightBefore = self.$el.height();

            $.each(model.changedAttributes(), function(key, value) {
                self.$el.changeResponsive(key, value);
                $icon.renderChangeSettingBoxModel(key, value, model);
                switch (key){
                    case 'nameIcon' :
                        var prevIcon = self.model.previousAttributes().nameIcon;

                        $i.removeClass(prevIcon).addClass(value);
                        break;

                    case 'fontSize' :
                        value == -1 ? $icon.css('fontSize', '') : $icon.css('fontSize', value + 'px');
                        break;

                    case 'lineHeight' :
                        value == -1 ? $icon.css('line-height', '') : $icon.css('line-height', value + 'px');
                        break;

                    case 'styleIcon' :
                        var prevStyle = self.model.previousAttributes().styleIcon;

                        $icon.removeClass(prevStyle).addClass(value);
                        break;

                    case 'iconAlign' :
                        var prevAlign = self.model.previousAttributes().iconAlign;

                        $icon.removeClass(prevAlign).addClass(value);
                        break;

                    case 'color':
                    case 'backgroundColor':
                    case 'hoverColor':
                    case 'hoverBackgroundColor':
                        self.generateStyle();
                        break;

                    case 'iconLink':
                        $icon.remove();
                        self.$el.append(self.renderItemContent());
                        break;

                    case 'customID':
                        $icon.attr('id', value);
                        break;

                    case 'customClass' :
                        var prevClass = self.model.previousAttributes().customClass;

                        $icon.removeClass(prevClass).addClass(value);
                        break;

                    case 'customEnableAttributes':
                        $icon.renderChangeSettingsAttributes(key, value, settings.customDataAttributes);
                        break;

                    case 'customActionAttributes':
                        $icon.renderChangeSettingsAttributes(key, value);
                        break;

                    case 'customEnableAnimations':
                        var animation, prevAnimation;
                        if (value) {
                            animation = settings.customDataAnimations;
                            prevAnimation = null;
                            $icon.processAnimations(animation);
                        }
                        else {
                            animation = null;
                            prevAnimation = settings.customDataAnimations;
                            $icon.processAnimations(animation, prevAnimation);
                        }
                        break;

                    case 'customDataAnimations':
                        $icon.processAnimations(settings.customDataAnimations, self.model.previousAttributes().customDataAnimations);
                        break;
                }
            });

            // Listen event change height of item
            setTimeout(function() {
                self.checkChangeHeight(heightBefore);
            }, 50);
        },
        generateStyle: function() {
            var self = this,
                style = '',
                settings = this.model.toJSON();

            if (self.updateColor)
                clearTimeout(self.updateColor);

            self.updateColor = setTimeout(function() {
                var style = self.itemStyle({
                    itemClass: self.itemClass,
                    color: settings.color,
                    bgColor: settings.backgroundColor,
                    hoverColor: settings.hoverColor,
                    hoverBgColor: settings.hoverBackgroundColor
                });

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
    AWEContent.Views.IconItemController = AWEContent.Views.ItemController.extend({
        machineName : 'icon',
        controllerHtml: function() {
            return '<div class="title-icon">Font Icon</div><i class="ic ac-icon-icon"><span>Icon</span></i>';
        },
        createItemModel: function(templateData) {
            var boxModelSettings;
            if (templateData!= undefined) {

                boxModelSettings = new AWEContent.Models.BoxModelSettings(templateData.boxModelSettings);
                templateData.boxModelSettings = boxModelSettings;

                return new AWEContent.Models.IconItem(templateData);
            }

            return new AWEContent.Models.IconItem({'boxModelSettings' : new AWEContent.Models.BoxModelSettings()});
        }
    });

    /**
     * Define header panel
     */
    AWEContent.Views.IconPanel = AWEContent.Views.ItemPanel.extend({
        tagName: "div",
        className: "awe-obj-panel panel-icon",
        panelName: "icon",
        initPanel: function() {
            AWEContent.Views.ItemPanel.prototype.initPanel.call(this);
            var self = this;

            $('#custom-choose-icons .title-tab', self.el).click( function() {
                var $controller = $(this).closest('#custom-choose-icons');
                AWEContent.Panels.listIconPanel.processIcon($controller);
            });
            $('#custom-choose-icons', self.el).change( function(event, data) {
                if (data) {
                    self.editingModel.set('nameIcon', data.nameIcon);
                    $('.title-tab > i', this).removeClass().addClass(data.nameIcon);
                }
            });
            $('#icon-custom-size', self.el).change(function(event, values) {
                self.editingModel.set('fontSize', values.value);
                if (values.value == -1)
                    $('.display-font', $(this)).text('DF');
            });
            $('#icon-custom-line-height', self.el).change(function(event, values){
                self.editingModel.set('lineHeight', values.value);
                if (values.value == -1)
                    $('.display-font', $(this)).text('DF');
            });
            $('#icon-custom-style', self.el).change(function(event, values) {
                self.editingModel.set('styleIcon', values.value);
            });
            $('#icon-custom-align', self.el).change(function(event, values) {
                self.editingModel.set('iconAlign', values.value);
            });
            $('#icon-custom-color', self.el).change(function(event, color) {
                if (color)
                    color = color.toRgbString();
                else
                    color = '';
                self.editingModel.set('color', color);
            });
            $('#icon-custom-background', self.el).change(function(event, color) {
                if (color)
                    color = color.toRgbString();
                else
                    color = '';
                self.editingModel.set('backgroundColor', color);
            });
            $('#icon-custom-hover', self.el).change(function(event, color) {
                if (color)
                    color = color.toRgbString();
                else
                    color = '';
                self.editingModel.set('hoverColor', color);
            });
            $('#icon-custom-hover-background', self.el).change(function(event, color) {
                if (color)
                    color = color.toRgbString();
                else
                    color = '';
                self.editingModel.set('hoverBackgroundColor', color);
            });
            $('#text-icon-custom-link', self.el).change( function() {
                self.editingModel.set('iconLink', $(this).val());
            });
            $('#icon-column-box-model', self.el).initBoxModelPanel(self, 'boxModelSettings');
            $('#text-icon-custom-id', self.el).change( function() {
                self.editingModel.set('customID', $(this).val());
            });
            $('#text-icon-custom-css', self.el).change( function() {
                self.editingModel.set('customClass', $(this).val());
            });
            $('#icon-custom-attributes', this.el).initAttributesPanel(self);
            $('#icon-animations input[name=enabled_custom_animation]', this.el).change(function(event, data) {
                self.editingModel.set('customEnableAnimations', parseInt($(this).val()));
                if (data){
                    self.editingModel.set('customDataAnimations', JSON.stringify(data.animations));
                }
            });
        },
        setPanelElementsValue: function() {
            var self = this,
                settings = this.editingModel.toJSON();

            $('#custom-choose-icons', self.el).attr('data-name-icon', settings.nameIcon);
            $('#custom-choose-icons i', self.el).removeClass().addClass(settings.nameIcon);
            $('#icon-custom-size', self.el).aweSlider('value', settings.fontSize);
            $('#icon-custom-line-height', self.el).aweSlider('value', settings.lineHeight);
            $('#icon-custom-style', self.el).aweSelect('value', settings.styleIcon);
            $('#icon-custom-align', self.el).aweSelect('value', settings.iconAlign);
            $('#icon-custom-color', self.el).aweColorPicker('value', settings.color);
            $('#icon-custom-background', self.el).aweColorPicker('value', settings.backgroundColor);
            $('#icon-custom-hover', self.el).aweColorPicker('value', settings.hoverColor);
            $('#icon-custom-hover-background', self.el).aweColorPicker('value', settings.hoverBackgroundColor);
            $('#text-icon-custom-link', self.el).val(settings.iconLink);
            $('#icon-column-box-model', self.el).initBoxModel(settings.boxModelSettings);
            $('#text-icon-custom-id', self.el).val(settings.customID);
            $('#text-icon-custom-css', self.el).val(settings.customClass);
            $('#icon-custom-attributes', this.el).initAttributes(settings.customEnableAttributes, settings.customDataAttributes);
            $('#icon-animations input[name=enabled_custom_animation]', this.el).val(settings.customEnableAnimations).trigger('change');
            $('#icon-animations input[name=enabled_custom_animation]', this.el).attr('data-animations', settings.customDataAnimations).data('view', this.editingModel.view);
        },
        buildPanel: function() {
            return {
                "title": {
                    "type": "markup",
                    "markup": "<div><h2>Icon<\/h2><\/div>"
                },
                "custom_definitions": {
                    "type": "section",
                    "custom_choose_icons": {
                        "type": "tabs_icon",
                        "title": "<div class=\"title-tab\"><span>Choose Icons<\/span><i class=\"\"><\/i><\/div>",
                        "tabs": []
                    },
                    "custom_size": {
                        "type": "slider",
                        "title": "Font Size",
                        "min_value": -1,
                        "unit": "px",
                        "max_value": 100,
                        "default_value": 100,
                        "allow_type": true
                    },
                    "custom_line_height": {
                        "type": "slider",
                        "title": "Line Spacing",
                        "unit": "px",
                        "min_value": -1,
                        "max_value": 100,
                        "default_value": 100,
                        "allow_type": true
                    },
                    "custom_style": {
                        "type": "select",
                        "title": "Style",
                        "options": {
                            "awe-icon-plain": "Plain",
                            "awe-icon-circle": "Circle",
                            "awe-icon-square": "Square"
                        },
                        "default_value": "awe-icon-plain"
                    },
                    "custom_align": {
                        "type": "select",
                        "title": "Align",
                        "options": {
                            "awe-icon-left": "Left",
                            "awe-icon-center": "Center",
                            "awe-icon-right": "Right"
                        },
                        "default_value": "awe-icon-left"
                    },
                    "custom_color": {
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
                    "custom_background": {
                        "type": "colorpicker",
                        "title": "Background",
                        "options": {
                            "preferredFormat"  : "rgb",
                            "AlphaVerticle"  : true,
                            "showAlpha"  : true,
                            "allowEmpty" : true,
                            "showInput" : true
                        }
                    },
                    "custom_hover": {
                        "type": "colorpicker",
                        "title": "Hover color",
                        "options": {
                            "preferredFormat"  : "rgb",
                            "AlphaVerticle"  : true,
                            "showAlpha"  : true,
                            "allowEmpty" : true,
                            "showInput" : true
                        }
                    },
                    "custom_hover_background": {
                        "type": "colorpicker",
                        "title": "Hover background",
                        "options": {
                            "preferredFormat"  : "rgb",
                            "AlphaVerticle"  : true,
                            "showAlpha"  : true,
                            "allowEmpty" : true,
                            "showInput" : true
                        }
                    },
                    "custom_link": {
                        "type": "text_field",
                        "title": "Link",
                        "attributes": {
                            "placeholder": "http:\/\/..."
                        },
                        "default_value": ""
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
                "custom_style": {
                    "type": "section",
                    "custom_id": {
                        "type": "text_field",
                        "title": "ID",
                        "attributes": {
                            "placeholder": "Custom ID"
                        },
                        "default_value": ""
                    },
                    "custom_css": {
                        "type": "text_field",
                        "title": "Class",
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
        AWEContent.Controllers.icon = new AWEContent.Views.IconItemController();
        AWEContent.Panels.icon = new AWEContent.Views.IconPanel();
    });
})(jQuery);
