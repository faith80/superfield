/**
 * File: awecontent-drupal-block-item.js
 * Author: MegaDrupal
 * Website: http://megadrupal.com/
 */
(function($) {
    "use strict";

    /**
     * Define model for drupal block item
     */
    AWEContent.Models.DrupalBlockItem = AWEContent.Models.Item.extend({
        defaults: {
            machine_name: "drupal_block",
            module: '',
            delta: '',
            info: '',
            customTitle: '',
            customID: '',
            customClass: '',
            boxModelSettings: {},
            enableAnimation: 0,
            animationData: '{"type": "none"}',
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
            this.view = new AWEContent.Views.DrupalBlockItem({model: this});
        },
        removePanelView: function() {
            var  blockClass = this.get('module') + '-' + this.get('delta');

            AWEContent.Toolbars.drupal.showController(blockClass);
            AWEContent.Models.Item.prototype.removePanelView.call(this);
        }
    });

    /**
     * Define view for DrupalBlock Controller
     * li tag what is contained by items panel
     */
    AWEContent.Views.DrupalBlockController = AWEContent.Views.ItemController.extend({
        machineName : 'drupal_block',
        el: 'li.ac-dp-block',
        existingElement: true,
        createItemModel: function(templateData) {
            if (templateData) {
                var className = templateData.module + '-' + templateData.delta,
                    isLoadedBlock = $.inArray(className, AWEContent.Toolbars.loadedElements);

                if (isLoadedBlock > -1) {
                    templateData.delta = 'invisible';
                    templateData.module = 'undefined';
                }

                return new AWEContent.Models.DrupalBlockItem(templateData);
            }

            return null;
        }
    });

    /**
     * Define View for HeaderItem
     */
    AWEContent.Views.DrupalBlockItem = AWEContent.Views.Item.extend({
        initialize: function() {
            // implements init of default item
            AWEContent.Views.Item.prototype.initialize.call(this);

            this.listenTo(this.model.get('boxModelSettings'), 'change', this.applySettingsChanged);
        },
        renderItemContent: function() {
            var self = this,
                settings = this.model.toJSON();

            self.$el.addClass('awe-drupal-block-item');
            if (self.model.get('module') != 'undefined') {
                self.loadBlockContent();
            }
            else {
                self.$el.prepend('<div class="block-content-unload">This block is used in another place on this page.</div>');
                self.$el.addClass('awe-item-unload');
            }

            // render responsive settings
            if (!settings.xsResponsive)
                this.$el.addClass('xs-hidden');
            if (!settings.smResponsive)
                this.$el.addClass('sm-hidden');
            if (!settings.mediumResponsive)
                this.$el.addClass('md-hidden');
            this.$el.defaultResponsive(settings);
        },
        loadBlockContent: function() {
            var self = this;

            // remove previous content
            $('> .block', self.el).remove();

            // add loader
            self.$el.prepend('<div class="awe-item-preload"></div>');

            $.post(AWEContent.Path.drupalElementURL,
                {
                    type: this.model.get('machine_name'),
                    module: this.model.get('module'),
                    delta: this.model.get('delta'),
                    custom_title: this.model.get('customTitle')
                },
                function(response) {
                    if (response.status) {
                        var  blockClass = self.model.get('module') + '-' + self.model.get('delta'),
                            settings = self.model.toJSON();

                        // add block content to document
                        self.$el.prepend(response.blockContent);

                        // add class define a builder item
                        $('.block', self.$el).addClass('awe-item');
                        if (settings.customID)
                            $('.block', self.$el).attr('id', settings.customID);

                        if (settings.customClass) {
                            $('.block', self.$el).addClass(settings.customClass)
                        }

                        // render animation and boxModelSettings
                        $('.block', self.$el).renderItemDefaultBoxModel(settings.boxModelSettings);
                        if (settings.enableAnimation)
                            $('.block', self.$el).processAnimations(settings.animationData);

                        $('.awe-item-preload', self.$el).remove();
                        AWEContent.Toolbars.drupal.hideController(blockClass);

                        // add js and css for block
                        if (response.css && response.css.length) {
                            $.each(response.css, function() {
                                var $style = ($.type(this) == 'string') ? $('<link type="text/css" rel="stylesheet" href=""/>').attr('href', this): $('<style />').html(this.data);

                                AWEContent.jqIframe('head').append($style);
                            });
                        }

                        if (response.js && response.js.length) {
                            var loaded = 0,
                                libFiles = 0,
                                inlineScript = [];

                            $.each(response.js, function () {
                                var script = AWEContent.documentIframe.createElement('script');

                                // init attributes for script
                                script.setAttribute('type', 'text/javascript');
                                if ($.type(this) == 'string') {
                                    script.setAttribute('src', this);
                                    libFiles++;

                                    script.onload = function (event) {
                                        loaded++;
                                    };

                                    // add script to head tag
                                    AWEContent.documentIframe.getElementsByTagName("head")[0].appendChild(script);
                                }
                                else {
                                    script.innerHTML = this.data;
                                    inlineScript.push(script);
                                }
                            });

                            if (inlineScript.length) {
                                var interval = setInterval(function() {
                                    if (loaded == libFiles) {
                                        clearInterval(interval);

                                        $.each(inlineScript, function() {
                                            AWEContent.documentIframe.getElementsByTagName("head")[0].appendChild(this);
                                        });
                                    }
                                }, 100)
                            }
                        }
                    }
                }
            );
        },
        applySettingsChanged: function(model) {
            var self = this,
                $block = $('.block', self.el);

            $.each(model.changedAttributes(), function(attribute, newValue) {
                self.$el.changeResponsive(attribute, newValue);
                switch (attribute) {
                    case 'customTitle':
                        if ($('> h2', $block).length)
                            $('> h2', $block).html(newValue);
                        else
                            self.loadBlockContent();
                        break;

                    case 'customID':
                        $('.block', self.el).attr('id', newValue);
                        break;

                    case 'customClass':
                        var prevClass = model.previousAttributes().customClass;
                        if (prevClass)
                            $('.block', self.$el).removeClass(prevClass);
                        $block.addClass(newValue);
                        break;

                    case 'customEnableAnimations':
                        var animation, prevAnimation;
                        if (newValue) {
                            animation = model.toJSON().customDataAnimations;
                            prevAnimation = null;
                            $block.processAnimations(animation);
                        }
                        else {
                            animation = null;
                            prevAnimation = model.toJSON().customDataAnimations;
                            $block.processAnimations(animation, prevAnimation);
                        }

                        break;
                    case 'customDataAnimations':
                        var animation, prevAnimation;
                        animation = model.toJSON().customDataAnimations;
                        prevAnimation = self.model.previousAttributes().customDataAnimations;
                        $block.processAnimations(animation, prevAnimation);
                        break;
                    default :
                        $block.changeResponsive(attribute, newValue);
                        $block.renderChangeSettingBoxModel(attribute, newValue, model);
                        break;
                }
            })
        }
    });

    /**
     * Define view for BlockItemPanel
     */
    AWEContent.Views.DrupalBlockPanel = AWEContent.Views.DefaultPanel.extend({
        panelName: "drupal_block",
        className: "awe-obj-panel drupal-block-panel",
        initPanel: function() {
            var self = this;

            // implements init default panel
            AWEContent.Views.DefaultPanel.prototype.initPanel.call(this);

            // Handle change block title
            $('#text-drupal-block-custom-title', this.$el).change(function() {
                self.editingModel.set('customTitle', $(this).val());
            });

            // handle change on box model settings
            $("#drupal-block-layout-tab", this.$el).initBoxModelPanel(this, "boxModelSettings");

            // Handle change block ID
            $('#text-drupal-block-custom-id', this.$el).change(function() {
                self.editingModel.set('customID', $(this).val());
            });

            // Handle change block classes
            $('#text-drupal-block-custom-classes', this.$el).change(function() {
                self.editingModel.set('customClass', $(this).val());
            });

            // handle change animation data
            $('#drupal-block-animations input[name=enabled_custom_animation]', this.el).change(function(event, data) {
                self.editingModel.set('enableAnimation', parseInt($(this).val()));
                if (data)
                    self.editingModel.set('animationData', JSON.stringify(data.animations));
            });
        },
        setPanelElementsValue: function() {
            var self = this,
                settings = this.editingModel.toJSON();

            $('#text-drupal-block-custom-title', self.el).val(settings.customTitle);
            $('#drupal-block-layout-tab', self.el).initBoxModel(settings.boxModelSettings);
            $('#drupal-block-animations input[name=enabled_custom_animation]', this.el).val(settings.enableAnimation).trigger('change');
            $('#drupal-block-animations input[name=enabled_custom_animation]', this.el).attr('data-animations', settings.animationData).data('view', this.editingModel.view);
            $('#text-drupal-block-custom-id', self.el).val(settings.customID);
            $('#text-drupal-block-custom-classes', self.el).val(settings.customClass);
        },
        buildPanel: function() {
            return {
                "title": {
                    "type": "markup",
                    "markup": "<div class=\"awe-title\"><h2>Drupal Block<\/h2><\/div>"
                },
                'box_settings': {
                    type: "section",
                    custom_title: {
                        type: "text_field",
                        title: "Title",
                        placeholder: "Custom block title"
                    },
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
                    type: 'section',
                    custom_id: {
                        type: "text_field",
                        title: "ID",
                        placeholder: "Custom block ID"
                    },
                    custom_classes: {
                        type: "text_field",
                        title: "Class",
                        placeholder: "Custom class"
                    },
                    animations: {
                        type: "animations"
                    }
                }
            }
        }
    });

    $(document).ready(function() {
        AWEContent.Controllers.drupal_block = new AWEContent.Views.DrupalBlockController();
        AWEContent.Panels.drupal_block = new AWEContent.Views.DrupalBlockPanel();
    });
})(jQuery);
