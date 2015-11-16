/**
 * File: awecontent-filckr-item.js
 * Author: AWEThemes
 * Website: http://awethemes.com/
 */
(function ($) {
    "use strict";

    AWEContent.Models.Flick = Backbone.Model.extend({});

    AWEContent.Collections.Flicks = Backbone.Collection.extend({
        model: AWEContent.Models.Flick,
        stream: 'group',
        id: '130337024@N06',
        url: function () {
            var stream = this.stream,
                id = this.id,
                link = (stream == "user") ? 'https://api.flickr.com/services/feeds/photos_public.gne' : 'https://api.flickr.com/services/feeds/groups_pool.gne';

            return link + '?id=' + id + "&format=json&jsoncallback=?";
        },
        parse: function (response) {
            return response.items;
        }
    });

    AWEContent.Views.FlicksView = Backbone.View.extend({
        initialize: function () {
            _.bindAll(this, 'render');
            var that = this;
            this.collection.fetch({
                success: function () {
                    that.render();
                }
            });
        },
        template: _.template(
            '<li class="awe-item-flickr">\
                <a target="_blank" href="<%= href %>" data-group="example-set" title="Title: <%= title %>" class="<%= lightbox %>">\
                <img src="<%= src %>" alt="image-flickr"></a>\
            </li>'
        ),
        render: function () {
            var that = this,
                numberPhoto = that.collection.numberPhoto - 1,
                numberColum = that.collection.numberColum,
                lightbox = that.collection.lightbox,
                listFlickr = '';

            $.each(this.collection.toJSON(), function (index, flick) {
                var image = flick.media.m.replace('_m.jpg', ''),
                    small_image = image + '_q.jpg',
                    larger_image = image + '_c.jpg',
                    link = flick.link,
                    href = lightbox == 'openlightbox' ? larger_image : link,
                    title = flick.title;
                listFlickr += that.template({
                    href: href,
                    src: small_image,
                    title: title,
                    lightbox: lightbox
                });
            });
            $('.awe-flickr', this.el).html('<ul class="awe-flickr-list">' + listFlickr + '</ul>').addClass('type-column-' + numberColum);
            $('.awe-flickr li:gt(' + numberPhoto + ')', this.el).hide().find('a').removeClass('openlightbox');

            // remove loader
            $('.awe-item-preload', this.$el).remove();
        }

    });

    /**
     * Define model for flickr item
     */
    AWEContent.Models.FlickrItem = AWEContent.Models.Item.extend({
        defaults: {
            machine_name: "flickr",
            tagName: "div",
            flickrID: '113963751@N02',
            numberPhoto: '12',
            numberColum: '4',
            imageMargin: 3,
            flickrStream: "user",
            flickrPreview: "openlightbox",
            boxModelSettings: {},
            customID: '',
            customClass: '',
            customEnableAttributes: 0,
            customDataAttributes: '[] ', // Array Json {"attrName":"autoPlay","attrValue":"true"}
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
        createView: function () {
            this.view = new AWEContent.Views.FlickrItem({model: this});
        },
        clone: function () {
            var cloneModel = {};
            $.each(this.toJSON(), function (key, value) {
                cloneModel[key] = value;
            });
            cloneModel.boxModelSettings = new AWEContent.Models.BoxModelSettings(cloneModel.boxModelSettings);
            return new AWEContent.Models.FlickrItem(cloneModel);
        }
    });

    /**
     * Define View for HeaderItem
     */
    AWEContent.Views.FlickrItem = AWEContent.Views.Item.extend({
        initialize: function () {
            AWEContent.Views.Item.prototype.initialize.call(this);
            var self = this;

            this.listenTo(this.model.get("boxModelSettings"), "change", this.applySettingsChanged);
            AWEContent.Library.addLibrary('magnific', function () {
                self.openlightbox(self);
            });
        },
        renderItemContent: function () {
            var self = this,
                $flickr = $('<div class="awe-item awe-flickr"><div class="awe-item-preload"></div></div>'),
                settings = self.model.toJSON();

            self.renderFlick(settings);
            $flickr.attr('id', settings.customID).addClass(settings.customClass);
            $flickr.renderItemDefaultAttributes(settings.customEnableAttributes, settings.customDataAttributes);
            $flickr.renderItemDefaultBoxModel(settings.boxModelSettings);
            if (settings.customEnableAnimations) {
                var animation = settings.customDataAnimations;
                $flickr.processAnimations(animation)
            }
            self.$el.defaultResponsive(settings);
            return $flickr;
        },
        applySettingsChanged: function (model) {
            var self = this,
                settings = self.model.toJSON(),
                numberColum = settings.numberColum,
                numberPhoto = settings.numberPhoto - 1,
                $flick = $('.awe-flickr', self.el),
                heightBefore = self.$el.height();

            $.each(model.changed, function (key, value) {
                self.$el.changeResponsive(key, value);
                $flick.renderChangeSettingBoxModel(key, value, model);
                switch (key) {
                    case 'flickrID':
                    case 'flickrStream':
                        self.renderFlick(settings);
                        break;

                    case 'numberColum':
                        var prevNumber = 'type-column-' + self.model.previousAttributes().numberColum;
                        $('.awe-flickr ul', self.$el).removeClass().addClass('awe-flickr-list ' + settings.customClass + '');
                        $('.awe-flickr', self.$el).removeClass(prevNumber).addClass('type-column-' + numberColum);
                        break;

                    case 'numberPhoto':
                        $('.awe-flickr ul li:gt(' + numberPhoto + ')', self.$el).hide().find('a').removeClass('openlightbox');
                        $('.awe-flickr ul li:lt(' + (numberPhoto + 1 ) + ')', self.$el).show().find('a').addClass('openlightbox');
                        break;

                    case 'flickrPreview':
                        self.renderFlick(settings);
                        break;

                    case 'imageMargin':
                        if (value == -1) {
                            $('.awe-item-flickr', self.$el).css({'padding': ''});
                            $('.awe-item ul', self.$el).css({'margin': ''});
                        }
                        else {
                            $('.awe-item-flickr', self.$el).css({'padding': value + 'px'});
                            $('.awe-item ul', self.$el).css({'margin': '-' + value + 'px'});
                        }
                        break;

                    case 'customID':
                        $flick.attr('id', value);
                        break;

                    case 'customClass':
                        var prevClass = self.model.previousAttributes().customClass;
                        $flick.removeClass(prevClass).addClass(value);
                        break;

                    case 'customActionAttributes':
                        $flick.renderChangeSettingsAttributes(key, value);
                        break;

                    case 'customEnableAttributes':
                        $flick.renderChangeSettingsAttributes(key, value, settings.customDataAttributes);
                        break;

                    case 'customEnableAnimations':
                        var animation, prevAnimation;
                        if (value) {
                            animation = settings.customDataAnimations;
                            prevAnimation = null;
                            $flick.processAnimations(animation);
                        }
                        else {
                            animation = null;
                            prevAnimation = settings.customDataAnimations;
                            $flick.processAnimations(animation, prevAnimation);
                        }

                        break;
                    case 'customDataAnimations':
                        var animation, prevAnimation;
                        animation = settings.customDataAnimations;
                        prevAnimation = self.model.previousAttributes().customDataAnimations;
                        $flick.processAnimations(animation, prevAnimation);
                        break;
                }
            });

            // Listen event change height of item
            setTimeout(function() {
                self.checkChangeHeight(heightBefore);
            }, 50);
        },
        renderFlick: function (settings) {
            var flickrs = new AWEContent.Collections.Flicks();

            flickrs.stream = settings.flickrStream;
            flickrs.id = settings.flickrID;
            flickrs.numberPhoto = settings.numberPhoto;
            flickrs.numberColum = settings.numberColum;
            flickrs.lightbox = settings.flickrPreview;

            return new AWEContent.Views.FlicksView({
                el: this.$el,
                collection: flickrs
            });
        },
        openlightbox: function () {
            AWEContent.jqIframe('.awe-flickr, .awe-type-lightbox', this.el).magnificPopup({
                delegate: '.openlightbox',
                type: 'image',
                removalDelay: 300,
                mainClass: 'mfp-fade',
                prependTo: '.awe-page-wrapper',
                gallery: {
                    enabled: true,
                    preload: [0, 2],
                    navigateByImgClick: true
                }
            });
        }
    });

    /**
     * Define view for Header Controller
     * li tag what is contained by items panel
     */
    AWEContent.Views.FlickrItemController = AWEContent.Views.ItemController.extend({
        machineName: 'flickr',
        controllerHtml: function () {
            return '<div class="title-icon">Flickr</div><i class="ic ac-icon-flickr"></i>';
        },
        createItemModel: function (templateData) {
            var boxModelSettings;

            if (templateData != undefined) {

                boxModelSettings = new AWEContent.Models.BoxModelSettings(templateData.boxModelSettings);
                templateData.boxModelSettings = boxModelSettings;

                return new AWEContent.Models.FlickrItem(templateData);
            }

            return new AWEContent.Models.FlickrItem({'boxModelSettings': new AWEContent.Models.BoxModelSettings()});
        }
    });

    /**
     * Define header panel
     */
    AWEContent.Views.FlickrPanel = AWEContent.Views.ItemPanel.extend({
        tagName: "div",
        className: "awe-obj-panel panel-flickr",
        panelName: "flickr",
        initPanel: function () {
            AWEContent.Views.ItemPanel.prototype.initPanel.call(this);
            var self = this;

            $('#flickr-enter-link input', self.$el).change(function () {
                self.editingModel.set('flickrID', $(this).val());
            });
            $('#flickr-custom-id input', self.$el).change(function () {
                self.editingModel.set('customID', $(this).val());
            });
            $('#flickr-custom-class input', self.$el).change(function () {
                self.editingModel.set('customClass', $(this).val());
            });
            $('#flickr-stream', self.$el).change(function (event, values) {
                self.editingModel.set('flickrStream', values.value);
            });
            $('#flickr-number-photo', this.$el).change(function (event, values) {
                self.editingModel.set('numberPhoto', values.value);
            });
            $('#flickr-column', this.$el).change(function (event, values) {
                self.editingModel.set('numberColum', values.value);
            });
            $('#flickr-preview', self.$el).change(function (event, values) {
                self.editingModel.set('flickrPreview', values.value);
            });
            $('#flickr-image-margin', this.$el).change(function (event, values) {
                self.editingModel.set('imageMargin', values.value);
                if (values.value == -1)
                    $('.display-font', $(this)).text('DF');
            });
            $('#flickr-custom-attributes', this.el).initAttributesPanel(self);
            $('#flickr-column-box-model', self.$el).initBoxModelPanel(self, 'boxModelSettings');
            $('#flickr-animations input[name=enabled_custom_animation]', this.el).change(function (event, data) {
                self.editingModel.set('customEnableAnimations', parseInt($(this).val()));
                if (data) {
                    self.editingModel.set('customDataAnimations', JSON.stringify(data.animations));
                }
            });
        },
        setPanelElementsValue: function () {
            var self = this,
                settings = this.editingModel.toJSON();

            $('#flickr-enter-link input', this.$el).val(settings.flickrID);
            $('#flickr-custom-id input', this.$el).val(settings.customID);
            $('#flickr-custom-class input', this.$el).val(settings.customClass);
            $('#flickr-stream', self.$el).aweSelect('value', settings.flickrStream);
            $('#flickr-preview', self.$el).aweSelect('value', settings.flickrPreview);
            $('#flickr-number-photo', this.$el).aweSlider('value', settings.numberPhoto);
            $('#flickr-column', this.$el).aweSlider('value', settings.numberColum);
            $('#flickr-image-margin', this.$el).aweSlider('value', settings.imageMargin);
            $("#flickr-column-box-model", this.$el).initBoxModel(settings.boxModelSettings);
            $('#flickr-custom-attributes', this.el).initAttributes(settings.customEnableAttributes, settings.customDataAttributes);
            $('#flickr-animations input[name=enabled_custom_animation]', this.el).val(settings.customEnableAnimations).trigger('change');
            $('#flickr-animations input[name=enabled_custom_animation]', this.el).attr('data-animations', settings.customDataAnimations).data('view', this.editingModel.view);
        },
        buildPanel: function () {
            return {
                "title": {
                    "type": "markup",
                    "markup": "<div class=\"awe-title\"><h2>Flickr<\/h2><\/div>"
                },
                "custom_attributes": {
                    "type": "section",
                    "enter_link": {
                        "type": "text_field",
                        "title": "Flickr ID",
                        "attributes": {
                            "placeholder": ""
                        },
                        "default_value": "32738276@N08"
                    },
                    "title": {
                        "type": "markup",
                        "markup": "<div class=\"small-quote\"><span>To find your flickrID visit <a href=\"http:\/\/idgettr.com\/\" target=\"_blank\">idGettr<\/a><\/span><\/div>"
                    },
                    "number_photo": {
                        "type": "slider",
                        "title": "No of Img",
                        "values": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
                        "default_value": 5,
                        "allow_type": true
                    },
                    "column": {
                        "type": "slider",
                        "title": "Column",
                        "values": [1, 2, 3, 4, 5, 6],
                        "default_value": 3,
                        "allow_type": true
                    },
                    "image_margin": {
                        "type": "slider",
                        "title": "Image Margin",
                        "min_value": -1,
                        "max_value": 20,
                        "default_value": 3,
                        "allow_type": true,
                        "unit": "px"
                    },
                    "stream": {
                        "type": "select",
                        "title": "Stream",
                        "options": {
                            "user": "User",
                            "group": "Group"
                        },
                        "default_value": "group"
                    },
                    "preview": {
                        "type": "select",
                        "title": "Preview",
                        "options": {
                            "openlightbox": "Lightbox",
                            "linktoflickr": "Link to flickr"
                        },
                        "default_value": "openlightbox"
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
                                    "allow_type": true,
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
                                    "allow_type": true,
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
                                    "allow_type": true,
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
                    "animations": {
                        "type": "animations"
                    }
                }
            };
        }
    });

    $(document).ready(function () {
        AWEContent.Controllers.flickr = new AWEContent.Views.FlickrItemController();
        AWEContent.Panels.flickr = new AWEContent.Views.FlickrPanel();
    });
})(jQuery);
