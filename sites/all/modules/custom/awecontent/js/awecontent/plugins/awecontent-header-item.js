/**
 * File: awecontent-header-item.js
 * Author: AWEThemes
 * Website: http://awethemes.com/
 */
(function($) {
    "use strict";

    /**
     * Define model for heder item
     */
    AWEContent.Models.HeaderItem = AWEContent.Models.Item.extend({
        defaults: {
            machine_name: "header",
            tagName: "h2",
            textContent: 'Type your header here',
            fontFamily: '',
            fontStyle: '',
            textAlign: 'left',
            fontSize: -1,
            lineHeight: -1,
            letterSpacing: -1,
            color: '',
            backgroundColor: '',
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
            this.view = new AWEContent.Views.HeaderItem({model: this});
        },
        clone : function(){
            var cloneModel = {};
            $.each(this.toJSON(), function(key,value){
                cloneModel[key] = value;
            });
            cloneModel.boxModelSettings = new AWEContent.Models.BoxModelSettings(cloneModel.boxModelSettings);
            return new AWEContent.Models.HeaderItem(cloneModel);
        }
    });

    /**
     * Define View for HeaderItem
     */
    AWEContent.Views.HeaderItem = AWEContent.Views.Item.extend({
        additionalEvents: {},
        initialize: function() {
            AWEContent.Views.Item.prototype.initialize.call(this);

            this.listenTo(this.model.get("boxModelSettings"), "change", this.applySettingsChanged);
        },
        renderItemContent: function() {
            var self = this,
                $header = $('<' + this.model.get("tagName") + '/>'),
                settings = this.model.toJSON(),
                css = {
                    'font-family' : settings.fontFamily,
                    'text-align': settings.textAlign,
                    'font-size': settings.fontSize == -1 ? '' : (settings.fontSize + 'px'),
                    'line-height': settings.lineHeight == -1 ? '' : (settings.lineHeight + 'px'),
                    'letter-spacing': settings.letterSpacing == -1 ? '' : (settings.letterSpacing + 'px'),
                    'color': settings.color,
                    'background-color': settings.backgroundColor
                };
            if (settings.fontStyle)
                css = $.extend({}, css, JSON.parse(settings.fontStyle));

            $header.html(settings.textContent).addClass("awe-item awe-header").css(css)
                .attr('id', settings.customID).addClass(settings.customClass)
                .renderItemDefaultBoxModel(settings.boxModelSettings);
            $header.renderItemDefaultAttributes(settings.customEnableAttributes, settings.customDataAttributes);
            if (settings.customEnableAnimations) {
                var animation = settings.customDataAnimations;
                $header.processAnimations(animation)
            }

            // Init hallo js for header item
            self.iframeJQuery(this.el).delegate(self.model.get("tagName"), "itemReady", function() {
                var heightBefore, heightAfter;
                self.iframeJQuery(this).hallo({
                    plugins: {
                        halloformat: {
                            formattings: {
                                bold: true,
                                italic: true,
                                strikethrough: true,
                                underline: true
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
                        if (heightAfter != heightBefore) {
                            self.resizeItem();
                        }
                    }
                });
            });
            self.$el.defaultResponsive(settings);

            return $header;
        },
        applySettingsChanged: function(model) {
            var self = this,
                $header = $(self.model.get("tagName"), self.$el),
                settings = model.toJSON(),
                beforeHeight = self.$el.height();

            $.each(model.changedAttributes(), function(key, value) {
                self.$el.changeResponsive(key, value);
                $header.renderChangeSettingBoxModel(key, value, model);
                switch (key) {
                    case 'fontFamily':
                        $header.css('font-family', value);
                        break;

                    case 'fontStyle':
                        console.log(value);
                        var fontStyle = (value) ? JSON.parse(value) : {'font-weight': '', 'font-style': ''};
                        $header.css(fontStyle);
                        break;

                    case 'textAlign':
                        $header.css('text-align',value);
                        break;

                    case 'fontSize':
                        value == -1 ? $header.css('font-size', '') : $header.css('font-size',value + 'px');
                        break;
                    case 'lineHeight':
                        value == -1 ? $header.css('line-height','') : $header.css('line-height',value +'px');
                        break;
                    case 'letterSpacing':
                        value == -1 ? $header.css('letter-spacing','') : $header.css('letter-spacing',value  +'px');
                        break;
                    case 'tagName':
                        var prev_tag = self.model.previousAttributes().tagName,
                            $item = self.iframeJQuery(self.$el);
                        $(prev_tag, self.$el).remove();
                        self.$el.append(self.renderItemContent());
                        self.iframeJQuery(value, $item).hallo({
                            plugins: {
                                halloformat: {
                                    formattings: {
                                        bold: true,
                                        italic: true,
                                        strikethrough: true,
                                        underline: true
                                    }
                                }
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
                        break;

                    case 'color':
                        $header.css('color', value);
                        break;

                    case 'backgroundColor':
                        $header.css('background-color', value);
                        break;
                    case 'customID':
                        $header.attr('id', value); break;
                    case 'customClass':
                        var prev_class = self.model.previousAttributes().customClass;
                        $header.removeClass(prev_class).addClass(value);
                        break;
                    case 'customEnableAttributes':
                        $header.renderChangeSettingsAttributes(key, value, settings.customDataAttributes);
                        break;
                    case 'customActionAttributes':
                        $header.renderChangeSettingsAttributes(key, value);
                        break;
                    case 'customEnableAnimations':
                        var animation, prevAnimation;
                        if (value) {
                            animation = settings.customDataAnimations;
                            prevAnimation = null;
                            $header.processAnimations(animation);
                        }
                        else {
                            animation = null;
                            prevAnimation = settings.customDataAnimations;
                            $header.processAnimations(animation, prevAnimation);
                        }

                        break;
                    case 'customDataAnimations':
                        var animation, prevAnimation;
                        animation = settings.customDataAnimations;
                        prevAnimation = self.model.previousAttributes().customDataAnimations;
                        $header.processAnimations(animation, prevAnimation);
                        break;
                }
            });

            // Listen event change height of item
            setTimeout(function() {
                self.checkChangeHeight(beforeHeight);
            }, 50);
        },
        processAnimations : function() {
            var self = this,
                model = self.model.toJSON(),
                $header = $(self.model.get("tagName"), self.$el),
                enableAniamtions = model.customEnableAnimations,
                dataAnimations = model.customDataAnimations,
                dataPrevAniamtions = self.model.previousAttributes().customDataAnimations,
                type, duration, delay, advance, className= '', classProperty= '';

            removePrevAnimation(dataPrevAniamtions,$header);
            setTimeout(function(){
                addAnimation();
            }, 50);
            function fnClassProperty(type, advance){
                var temp = '';
                switch (type) {
                    case 'floatin' :
                        temp = 'proty-dir-' + advance; break;
                    case 'flyin' :
                        temp = 'proty-dir-distant-' + advance; break;
                    case 'turnin' :
                        temp = 'proty-dir-turn-' + advance;
                        break;
                }
                return temp;
            }
            function fnClassName (type) {
                var temp = '';
                if (type != 'none'){
                    temp = 'ant-' + type
                }
                return temp;
            }
            function removePrevAnimation (data, el){
                var className = '',
                    classProperty = '',
                    type, advance;
                if (data && data!=''){
                    data = $.parseJSON(data);
                    type = data.type;
                    advance = data.advance;
                    className = fnClassName(type);
                    classProperty = fnClassProperty(type, advance);
                    el.removeClass(className + ' '+ classProperty).css({
                        'animation-duration' : '',
                        'animation-delay' : ''
                    });
                    if (type == 'spinin') {
                        $header.css({
                            '-ms-transform': '',
                            '-webkit-transform': '',
                            'transform': ''
                        });
                    }
                    return true;
                }
                return false;
            }
            function addAnimation() {
                if (dataAnimations !='') {
                    dataAnimations = $.parseJSON(dataAnimations);
                    type = dataAnimations.type;
                    duration = dataAnimations.duration;
                    delay = dataAnimations.delay;
                    advance = dataAnimations.advance;
                    className = fnClassName(type);
                    classProperty = fnClassProperty(type, advance);

                    $header.css({
                        'animation-duration': duration + 'ms',
                        'animation-delay' : delay +'ms'
                    });
                    if (type == 'spinin'){
                        var deg = 360 * parseInt(advance.numberOfSpin);
                        deg = advance.direction == 'clockwise' ? (-deg): deg;
                        deg = 'rotate('+ deg +'deg)';
                        $header.css({
                            '-ms-transform': deg,
                            '-webkit-transform': deg,
                            'transform': deg
                        });
                    }
                    $header.addClass(className +' '+classProperty);
                }
            }
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
    AWEContent.Views.HeaderItemController = AWEContent.Views.ItemController.extend({
        machineName : 'header',
        controllerHtml: function() {
            return '<div class="title-icon">Header</div><i class="ic ac-icon-header"></i>' ;
        },
        createItemModel: function(templateData) {
            var boxModelSettings;
            if (templateData!= undefined) {

                boxModelSettings = new AWEContent.Models.BoxModelSettings(templateData.boxModelSettings);
                templateData.boxModelSettings = boxModelSettings;

                return new AWEContent.Models.HeaderItem(templateData);
            }

            return new AWEContent.Models.HeaderItem({'boxModelSettings' : new AWEContent.Models.BoxModelSettings()});
        }
    });

    /**
     * Define header panel
     */
    AWEContent.Views.HeaderPanel = AWEContent.Views.ItemPanel.extend({
        tagName: "div",
        className: "awe-obj-panel header-panel",
        panelName: "header",
        initPanel: function() {
            AWEContent.Views.ItemPanel.prototype.initPanel.call(this);
            var self = this;

            // handle event on font element
            $('#header-font', this.$el).bind('fontFamilyChange', function(event, fontName) {
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

            $('#header-tag', this.el).change(function(event, tag) {
                self.editingModel.set('tagName', tag.value.toLowerCase());
            });
            $('#header-text-color', this.el).change(function(event, color) {
                if (color)
                    color = color.toRgbString();
                else
                    color = '';

                self.editingModel.set('color', color);
            });
            $('#header-background-color', this.el).change(function(event, color) {
                if (color)
                    color = color.toRgbString();
                else
                    color = '';
                self.editingModel.set('backgroundColor', color);
            });
            $("#header-layout-tab", this.el).initBoxModelPanel(this, "boxModelSettings");
            $('#text-header-custom-id', this.el).change(function(){
                self.editingModel.set('customID', $(this).val());
            });
            $('#text-header-custom-classes', this.el).change(function() {
                self.editingModel.set('customClass', $(this).val());
            });
            $('#header-custom-attributes', this.el).initAttributesPanel(self);
            $('#header-animations input[name=enabled_custom_animation]', this.el).change(function(event, data) {
                self.editingModel.set('customEnableAnimations', parseInt($(this).val()));
                if (data) {
                    self.editingModel.set('customDataAnimations', JSON.stringify(data.animations));
                }
            });
        },
        setPanelElementsValue: function() {
            var settings = this.editingModel.toJSON();

            console.log(settings.fontFamily)

            $('#header-font', this.$el).aweFont('options', {
                fontFamily: settings.fontFamily,
                fontStyle: settings.fontStyle,
                fontSize: settings.fontSize,
                textAlign: settings.textAlign,
                lineHeight: settings.lineHeight,
                letterSpacing: settings.letterSpacing
            });
            $('#header-tag', this.$el).aweSlider('value', settings.tagName.toUpperCase());
            $('#header-text-color', this.el).aweColorPicker('value', settings.color);
            $('#header-background-color', this.el).aweColorPicker('value', settings.backgroundColor);
            $("#header-layout-tab", this.el).initBoxModel(settings.boxModelSettings);
            $('#text-header-custom-id', this.el).val(settings.customID);
            $('#text-header-custom-classes', this.el).val(settings.customClass);
            $('#header-custom-attributes', this.el).initAttributes(settings.customEnableAttributes, settings.customDataAttributes);
            $('#header-animations input[name=enabled_custom_animation]', this.el).val(settings.customEnableAnimations).trigger('change');
            $('#header-animations input[name=enabled_custom_animation]', this.el).attr('data-animations', settings.customDataAnimations).data('view', this.editingModel.view);
        },
        buildPanel: function() {
            return {
                title: {
                    type: "markup",
                    markup: '<div class="awe-title"><h2>Header</h2></div>'
                },
                font_settings: {
                    type: 'section',
                    font: {
                        type: 'font'
                    }
                },
                header_tag: {
                    type: 'section',
                    tag: {
                        type: "slider",
                        title: "Heading tag",
                        values: ["H1", "H2", "H3", "H4", "H5", "H6"],
                        default_value: "H2",
                        allow_type: false
                    }
                },
                color_settings: {
                    type: 'section',
                    text_color: {
                        type: 'colorpicker',
                        title: "Color",
                        options: {
                            "preferredFormat"  : "rgb",
                            "AlphaVerticle"  : true,
                            "showAlpha"  : true,
                            "allowEmpty" : true,
                            "showInput" : true
                        }
                    },
                    background_color: {
                        type: 'colorpicker',
                        title: "Background Color",
                        options: {
                            "preferredFormat"  : "rgb",
                            "AlphaVerticle"  : true,
                            "showAlpha"  : true,
                            "allowEmpty" : true,
                            "showInput" : true
                        }
                    }
                },
                box_settings: {
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
                others: {
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
        AWEContent.Controllers.header = new AWEContent.Views.HeaderItemController();
        AWEContent.Panels.header = new AWEContent.Views.HeaderPanel();
    });
})(jQuery);
