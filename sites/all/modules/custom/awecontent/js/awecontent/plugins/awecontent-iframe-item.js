/**
 * Author: AWEThemes
 * Website: http://awethemes.com/
 */
(function($) {
    "use strict";

    /**
     * Define model for heder item
     */
    AWEContent.Models.IframeItem = AWEContent.Models.Item.extend({
        defaults: {
            machine_name: "iframe",
            iframeUrl: 'http://megadrupal.com/',
            height: 500,
            boxModelSettings : {},
            customID: '',
            customClass: '',
            customEnableAttributes: 0,
            customDataAttributes: '[] ', // Array Json {"attrName":"autoplay","attrValue":"true"}
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
            this.view = new AWEContent.Views.IframeItem({model: this});
        },
        clone : function(){
            var cloneModel = {};
            $.each(this.toJSON(), function(key,value){
                cloneModel[key] = value;
            });
            cloneModel.boxModelSettings = new AWEContent.Models.BoxModelSettings(cloneModel.boxModelSettings);
            return new AWEContent.Models.IframeItem(cloneModel);
        }
    });

    /**
     * Define View for HeaderItem
     */
    AWEContent.Views.IframeItem = AWEContent.Views.Item.extend({
        initialize: function() {
            AWEContent.Views.Item.prototype.initialize.call(this);

            this.listenTo(this.model.get("boxModelSettings"), "change", this.applySettingsChanged);
        },
        renderItemContent: function() {
            var self = this,
                settings = self.model.toJSON(),
                $iframe = $('<div class="awe-item-preload"></div><iframe class="awe-item awe-iframe" src="" width="100%"></iframe>');

            $iframe.attr({
                src : self.processUrl(settings.iframeUrl),
                id : settings.customID
            }).css({
                height: settings.height == -1 ?  '' : (settings.height+ 'px')
            }).addClass(settings.customClass);
            $iframe.renderItemDefaultBoxModel(settings.boxModelSettings);
            if (settings.customEnableAttributes){
                if (settings.customDataAttributes != '[]') {
                    $.each($.parseJSON(settings.customDataAttributes), function(index, value) {
                        var attrName = 'data-' + value.attrName;
                        var attrValue = value.attrValue;
                        $iframe.attr( attrName ,attrValue);
                    });
                }
            }
            $iframe.renderItemDefaultAttributes(settings.customEnableAttributes, settings.customDataAttributes);
            if (settings.customEnableAnimations) {
                var animation = settings.customDataAnimations;
                $iframe.processAnimations(animation)
            }
            self.$el.defaultResponsive(settings);

            // handle iframe ready
            $iframe.load(function() {
                $('.awe-item-preload', self.$el).remove();
            });

            return $iframe;
        },
        applySettingsChanged: function(model) {
            var self = this,
                $iframe = $('> iframe', self.$el),
                settings = model.toJSON(),
                heightBefore = self.$el.height();

            $.each(model.changedAttributes(), function(key, value) {
                self.$el.changeResponsive(key, value);
                $iframe.renderChangeSettingBoxModel(key, value, model);

                switch (key) {
                    case 'iframeUrl':
                        self.$el.prepend('<div class="awe-item-preload"></div>');
                        $iframe.attr('src', self.processUrl(value));
                        break;

                    case 'height':
                        value == -1 ? $iframe.css('height', '') : $iframe.css('height', value + 'px');
                        break;

                    case 'customID':
                        $iframe.attr('id', value);
                        break;

                    case 'customClass':
                        var prevClass = self.model.previousAttributes().customClass;
                        $iframe.removeClass(prevClass).addClass(value);
                        break;

                    case 'customEnableAttributes':
                        $iframe.renderChangeSettingsAttributes(key, value, settings.customDataAttributes);
                        break;

                    case 'customActionAttributes':
                        $iframe.renderChangeSettingsAttributes(key, value);
                        break;

                    case 'customEnableAnimations':
                        var animation, prevAnimation;
                        if (value) {
                            animation = settings.customDataAnimations;
                            prevAnimation = null;
                            $iframe.processAnimations(animation);
                        }
                        else {
                            animation = null;
                            prevAnimation = settings.customDataAnimations;
                            $iframe.processAnimations(animation, prevAnimation);
                        }

                        break;
                    case 'customDataAnimations':
                        var animation, prevAnimation;
                        animation = settings.customDataAnimations;
                        prevAnimation = self.model.previousAttributes().customDataAnimations;
                        $iframe.processAnimations(animation, prevAnimation);
                        break;
                }
            });

            // Listen event change height of item
            setTimeout(function() {
                self.checkChangeHeight(heightBefore);
            }, 50);
        },
        processUrl : function(url){
            if (url != ''){
                if ( url.indexOf('http://') == 0  || url.indexOf('//') == 0 || url.indexOf('https://') == 0) {
                    return url;
                }
                else
                    return 'http://' + url;
            }
        }
    });

    /**
     * Define view for Header Controller
     * li tag what is contained by items panel
     */
    AWEContent.Views.IframeItemController = AWEContent.Views.ItemController.extend({
        machineName : 'iframe',
        controllerHtml: function() {
            return '<div class="title-icon">iframe</div><i class="ic ac-icon-iframe"></i>';
        },
        createItemModel: function(templateData) {
            var boxModelSettings;
            if (templateData!= undefined) {

                boxModelSettings = new AWEContent.Models.BoxModelSettings(templateData.boxModelSettings);
                templateData.boxModelSettings = boxModelSettings;

                return new AWEContent.Models.IframeItem(templateData);
            }

            return new AWEContent.Models.IframeItem({'boxModelSettings' : new AWEContent.Models.BoxModelSettings()});
        }
    });

    /**
     * Define header panel
     */
    AWEContent.Views.IframePanel = AWEContent.Views.ItemPanel.extend({
        tagName: "div",
        className: "awe-obj-panel panel-iframe",
        panelName: "iframe",
        initPanel: function() {
            AWEContent.Views.ItemPanel.prototype.initPanel.call(this);
            var self = this;

            $('#text-iframe-enter-link', self.el).change( function(){
                self.editingModel.set('iframeUrl', $(this).val());
            });
            $('#iframe-height', self.el).change( function(event, values){
                self.editingModel.set('height', values.value);
                if (values.value == -1)
                    $('.display-font', $(this)).text('DF');
            });
            $('#iframe-column-box-model', self.el).initBoxModelPanel(self, 'boxModelSettings');
            $('#text-iframe-custom-id', self.el).change( function(){
                self.editingModel.set('customID', $(this).val());
            });
            $('#text-iframe-custom-class', self.el).change( function(){
                self.editingModel.set('customClass', $(this).val());
            });
            $('#iframe-custom-attributes', this.el).initAttributesPanel(self);
            $('#iframe-animations input[name=enabled_custom_animation]', this.el).change(function(event, data) {
                self.editingModel.set('customEnableAnimations', parseInt($(this).val()));
                if (data){
                    self.editingModel.set('customDataAnimations', JSON.stringify(data.animations));
                }
            });
        },
        setPanelElementsValue: function() {
            var self = this,
                settings = this.editingModel.toJSON();
            
            $('#text-iframe-enter-link', self.el).val(settings.iframeUrl);
            $('#iframe-height', self.el).aweSlider('value',settings.height);
            $('#iframe-column-box-model', self.el).initBoxModel(settings.boxModelSettings);
            $('#text-iframe-custom-id', self.el).val(settings.customID);
            $('#text-iframe-custom-class', self.el).val(settings.customClass);
            $('#iframe-custom-attributes', this.el).initAttributes(settings.customEnableAttributes, settings.customDataAttributes);
            $('#iframe-animations input[name=enabled_custom_animation]', this.el).val(settings.customEnableAnimations).trigger('change');
            $('#iframe-animations input[name=enabled_custom_animation]', this.el).attr('data-animations', settings.customDataAnimations).data('view', this.editingModel.view);
        },
        buildPanel: function() {
            return {
                "title": {
                    "type": "markup",
                    "markup": "<div class=\"awe-title\"><h2>Custom Iframe<\/h2><\/div>"
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
                    "height": {
                        "type": "slider",
                        "title": "Height",
                        "min_value": -1,
                        "max_value": 999,
                        "default_value": 300,
                        "allow_type": true,
                        "unit": "px"
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
        AWEContent.Controllers.iframe = new AWEContent.Views.IframeItemController();
        AWEContent.Panels.iframe = new AWEContent.Views.IframePanel();
    });
})(jQuery);
