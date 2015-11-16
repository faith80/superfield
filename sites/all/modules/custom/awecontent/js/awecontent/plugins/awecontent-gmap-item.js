/**
 * File: awecontent-gmap-item.js
 * Author: AWEThemes
 * Website: http://awethemes.com/
 */
(function ($) {
    "use strict";

    AWEContent.Models.GmapItem = AWEContent.Models.Item.extend({
        iconMarkerURL: '',
        defaults: {
            machine_name: "gmap",
            height: 400,
            zoom: 15,
            style: "style1",
            latLong: "21.001763, 105.820591",
            disableScrollZoom: 0,
            enableCustomInfo: 0,
            iconMarker: -1,
            infoTitle: '',
            infoDescriptions: '',
            boxModelSettings: {},
            customEnableAttributes: 0,
            customID: '',
            customClass: '',
            customDataAttributes: '[] ', // Array Json [{"attrName":"autoPlay","attrValue":"true"}, ....]
            customActionAttributes: '{"newAction": "", "newAttrName": "", "newAttrValue": ""}',
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
            this.view = new AWEContent.Views.GmapItem({model: this});
        },
        clone: function () {
            var cloneModel = {};
            $.each(this.toJSON(), function (key, value) {
                cloneModel[key] = value;
            });
            cloneModel.boxModelSettings = new AWEContent.Models.BoxModelSettings(cloneModel.boxModelSettings);
            return new AWEContent.Models.GmapItem(cloneModel);
        }
    });

    AWEContent.Views.GmapItem = AWEContent.Views.Item.extend({
        initialize: function () {
            AWEContent.Views.Item.prototype.initialize.call(this);
            this.listenTo(this.model.get("boxModelSettings"), "change", this.applySettingsChanged);
        },
        renderItemContent: function () {
            var self = this,
                $gmap = $('<div class="awe-item gmap-wrapper"><div class="gmap-content"></div></div>'),
                gm_wrapper = $gmap,
                gm_content = $('.gmap-content', $gmap),
                settings = self.model.toJSON(),
                iconMarker = !isNaN(parseInt(settings.iconMarker)) ? settings.iconMarker : -1;

            //  add googleMap library
            AWEContent.Library.addLibrary('googleMap', function () {
                var initNumber = self.$el.data('init-number');
                self.$el.data('init-number', initNumber+1);
                self.$el.trigger('gmapInitializeSuccess');
            });
            gm_wrapper.css({
                'display': 'block',
                'overflow': 'auto'
            });
            gm_content
                .css({
                    'height': settings.height != -1 ? settings.height + 'px' : ''
                })
                .attr({
                    'data-zoom': settings.zoom,
                    'data-style': settings.style,
                    'data-latlong': settings.latLong,
                    'data-info': settings.enableCustomInfo,
                    'data-title': settings.infoTitle,
                    'data-description': settings.infoDescriptions,
                    'data-icon': settings.iconMarker,
                    'data-disscroll': settings.disableScrollZoom,
                    id: settings.customID
                });
            gm_content.renderItemDefaultAttributes(settings.customEnableAttributes, settings.customDataAttributes);
            gm_content.renderItemDefaultBoxModel(settings.boxModelSettings);
            self.$el.defaultResponsive(settings);

            // reset number initialize
            self.$el.data('init-number', 0);
            // get URL of iconMaker
            self.$el.aweImageURL({
                fid: [iconMarker],
                styles: ['none'],
                success: function(el, fid, styles, response) {
                    var initNumber = self.$el.data('init-number');
                    
                    self.model.iconMarkerURL = (iconMarker > 0 && response[iconMarker]['none']) ? response[iconMarker]['none'] : '';
                    gm_content.attr('data-icon', self.model.iconMarkerURL);
                    self.$el.data('init-number', initNumber+1);
                    self.$el.trigger('gmapInitializeSuccess');
                }
            });

            // handle event library loaded
            self.$el.bind('gmapInitializeSuccess', function(event) {
                if (self.$el.data('init-number') === 2) {
                    self.$el.data('init-number', 0);
                    self.loadMap(gm_content);
                }
            });

            return $gmap;
        },
        loadMap: function (el) {
            var self = this,
                settings = self.model.toJSON(),
                enableinfo = settings.enableCustomInfo,
                latlong_arg = settings.latLong.split(','),
                mapOptions,
                interval = setInterval(function () {
                    if (AWEContent.windowIframe.google.maps.LatLng != undefined) {
                        clearInterval(interval);
                        mapOptions = {
                            zoom: parseInt(settings.zoom),
                            center: new AWEContent.windowIframe.google.maps.LatLng(latlong_arg[0], latlong_arg[1]),
                            mapTypeId: AWEContent.windowIframe.google.maps.MapTypeId.Road
                        };
                        self.map = new AWEContent.windowIframe.google.maps.Map(el[0], mapOptions);

                        // Set Marker for Map
                        var image = self.model.iconMarkerURL;
                        self.marker = new AWEContent.windowIframe.google.maps.Marker({
                            map: self.map,
                            title: 'Click to show info',
                            icon: image,
                            position: new AWEContent.windowIframe.google.maps.LatLng(latlong_arg[0], latlong_arg[1]),
                            animation: AWEContent.windowIframe.google.maps.Animation.BOUNCE

                        });

                        self.infowindow = new AWEContent.windowIframe.google.maps.InfoWindow({
                            content: '<h2 style="color: #333;">' + settings.infoTitle + '</h2><p style="color: #555;">' + settings.infoDescriptions + '</p>'
                        });

                        // Set Style for Map
                        self.styles = {
                            style1: [{"featureType": "landscape", "stylers": [{"saturation": -100}, {"lightness": 65}, {"visibility": "on"}]}, {"featureType": "poi", "stylers": [{"saturation": -100}, {"lightness": 51}, {"visibility": "simplified"}]}, {"featureType": "road.highway", "stylers": [{"saturation": -100}, {"visibility": "simplified"}]}, {"featureType": "road.arterial", "stylers": [{"saturation": -100}, {"lightness": 30}, {"visibility": "on"}]}, {"featureType": "road.local", "stylers": [{"saturation": -100}, {"lightness": 40}, {"visibility": "on"}]}, {"featureType": "transit", "stylers": [{"saturation": -100}, {"visibility": "simplified"}]}, {"featureType": "administrative.province", "stylers": [{"visibility": "off"}]}, {"featureType": "water", "elementType": "labels", "stylers": [{"visibility": "on"}, {"lightness": -25}, {"saturation": -100}]}, {"featureType": "water", "elementType": "geometry", "stylers": [{"hue": "#ffff00"}, {"lightness": -25}, {"saturation": -97}]}],
                            style2: [{"featureType": "water", "stylers": [{"visibility": "on"}, {"color": "#acbcc9"}]}, {"featureType": "landscape", "stylers": [{"color": "#f2e5d4"}]}, {"featureType": "road.highway", "elementType": "geometry", "stylers": [{"color": "#c5c6c6"}]}, {"featureType": "road.arterial", "elementType": "geometry", "stylers": [{"color": "#e4d7c6"}]}, {"featureType": "road.local", "elementType": "geometry", "stylers": [{"color": "#fbfaf7"}]}, {"featureType": "poi.park", "elementType": "geometry", "stylers": [{"color": "#c5dac6"}]}, {"featureType": "administrative", "stylers": [{"visibility": "on"}, {"lightness": 33}]}, {"featureType": "road"}, {"featureType": "poi.park", "elementType": "labels", "stylers": [{"visibility": "on"}, {"lightness": 20}]}, {}, {"featureType": "road", "stylers": [{"lightness": 20}]}],
                            style3: [{"featureType": "water", "stylers": [{"color": "#46bcec"}, {"visibility": "on"}]}, {"featureType": "landscape", "stylers": [{"color": "#f2f2f2"}]}, {"featureType": "road", "stylers": [{"saturation": -100}, {"lightness": 45}]}, {"featureType": "road.highway", "stylers": [{"visibility": "simplified"}]}, {"featureType": "road.arterial", "elementType": "labels.icon", "stylers": [{"visibility": "off"}]}, {"featureType": "administrative", "elementType": "labels.text.fill", "stylers": [{"color": "#444444"}]}, {"featureType": "transit", "stylers": [{"visibility": "off"}]}, {"featureType": "poi", "stylers": [{"visibility": "off"}]}],
                            style4: [{"featureType": "water", "elementType": "geometry", "stylers": [{"color": "#000000"}, {"lightness": 17}]}, {"featureType": "landscape", "elementType": "geometry", "stylers": [{"color": "#000000"}, {"lightness": 20}]}, {"featureType": "road.highway", "elementType": "geometry.fill", "stylers": [{"color": "#000000"}, {"lightness": 17}]}, {"featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{"color": "#000000"}, {"lightness": 29}, {"weight": 0.2}]}, {"featureType": "road.arterial", "elementType": "geometry", "stylers": [{"color": "#000000"}, {"lightness": 18}]}, {"featureType": "road.local", "elementType": "geometry", "stylers": [{"color": "#000000"}, {"lightness": 16}]}, {"featureType": "poi", "elementType": "geometry", "stylers": [{"color": "#000000"}, {"lightness": 21}]}, {"elementType": "labels.text.stroke", "stylers": [{"visibility": "on"}, {"color": "#000000"}, {"lightness": 16}]}, {"elementType": "labels.text.fill", "stylers": [{"saturation": 36}, {"color": "#000000"}, {"lightness": 40}]}, {"elementType": "labels.icon", "stylers": [{"visibility": "off"}]}, {
                                "featureType": "transit",
                                "elementType": "geometry",
                                "stylers": [{"color": "#000000"}, {"lightness": 19}]
                            }, {"featureType": "administrative", "elementType": "geometry.fill", "stylers": [{"color": "#000000"}, {"lightness": 20}]}, {"featureType": "administrative", "elementType": "geometry.stroke", "stylers": [{"color": "#000000"}, {"lightness": 17}, {"weight": 1.2}]}]
                        };
                        self.map.setOptions({styles: self.styles.style1});

                        // Set disable Scroll Zoom
                        if (settings.disableScrollZoom)
                            self.map.setOptions({scrollwheel: false});
                        else
                            self.map.setOptions({scrollwheel: true});

                        AWEContent.windowIframe.google.maps.event.addListener(self.map, 'zoom_changed', function () {
                            self.changeSettingMap(self.map);
                        });

                        AWEContent.windowIframe.google.maps.event.addListener(self.marker, 'click', function () {
                            self.infowindow.open(self.map, self.marker);
                            if (self.marker.getAnimation() != null)
                                self.marker.setAnimation(null);
                            else
                                self.marker.setAnimation(google.maps.Animation.BOUNCE);
                        });
                        if (!enableinfo) self.marker.setMap(null);
                    }
                }, 50);
        },
        changeSettingMap: function (map) {
            this.model.set('zoom', map.getZoom());

            if (AWEContent.Panels.gmap.editingModel)
                AWEContent.Panels.gmap.setPanelElementsValue();
        },
        applySettingsChanged: function (model, options) {
            var self = this,
                settings = self.model.toJSON(),
                gm_wraper = $('.gmap-wrapper', self.$el),
                gm_content = $('.gmap-content', self.$el),
                heightBefore = self.$el.height();

            $.each(model.changedAttributes(), function (key, value) {
                self.$el.changeResponsive(key, value);
                gm_content.renderChangeSettingBoxModel(key, value, model);
                switch (key) {
                    case 'height':
                        value == -1 ? gm_content.css('height', '') : gm_content.css('height', value + 'px');
                        AWEContent.windowIframe.google.maps.event.trigger(self.map, 'resize');
                        break;
                    case 'zoom':
                        gm_content.attr('data-zoom', value);
                        self.map.setZoom(value);
                        break;
                    case 'infoDescriptions':
                        gm_content.attr('data-description', value);
                        self.infowindow.setContent('<h2 style="color: #333;">' + settings.infoTitle + '</h2><p style="color: #555;">' + settings.infoDescriptions + '</p>');
                        break;
                    case 'infoTitle':
                        gm_content.attr('data-title', value);
                        self.infowindow.setContent('<h2 style="color: #333;">' + settings.infoTitle + '</h2><p style="color: #555;">' + settings.infoDescriptions + '</p>');
                        break;
                    case 'enableCustomInfo':
                        gm_content.attr('data-info', value);
                        settings.enableCustomInfo ? self.marker.setMap(self.map) : self.marker.setMap();
                        break;
                    case 'iconMarker':
                        gm_content.attr('data-icon', self.model.iconMarkerURL);
                        self.marker.setIcon(self.model.iconMarkerURL);
                        self.marker.setMap(self.map);
                        break;
                    case 'style':
                        gm_content.attr('data-style', value);
                        self.map.setOptions({styles: self.styles[value]});
                        break;
                    case 'latLong':
                        var latLong = value.split(','),
                            position = new AWEContent.windowIframe.google.maps.LatLng(latLong[0], latLong[1]);
                        gm_content.attr('data-latlong', value);
                        self.marker.setPosition(position);
                        self.map.setCenter(position);
                        break;
                    case 'disableScrollZoom' :
                        var srcollWheel = value ? false : true;
                        gm_content.attr('data-disscroll', srcollWheel);
                        self.map.setOptions({scrollwheel: srcollWheel});
                        break;
                    case 'customClass':
                        var prevClass = self.model.previousAttributes().customClass;
                        gm_content.removeClass(prevClass).addClass(value);
                        break;
                    case 'customID':
                        gm_content.attr('id', value);
                        break;
                    case 'customEnableAttributes':
                        gm_content.renderChangeSettingsAttributes(key, value, settings.customDataAttributes);
                        break;
                    case 'customActionAttributes':
                        gm_content.renderChangeSettingsAttributes(key, value);
                        break;
                }
            });

            // Listen event change height of item
            setTimeout(function() {
                self.checkChangeHeight(heightBefore);
            }, 50);
        }
    });

    AWEContent.Views.GmapItemController = AWEContent.Views.ItemController.extend({
        machineName: 'gmap',
        controllerHtml: function () {
            return '<div class="title-icon">Google maps</div><i class="ic ac-icon-map"></i>';
        },
        createItemModel: function (templateData) {
            var boxModelSettings;
            if (templateData != undefined) {

                boxModelSettings = new AWEContent.Models.BoxModelSettings(templateData.boxModelSettings);
                templateData.boxModelSettings = boxModelSettings;

                return new AWEContent.Models.GmapItem(templateData);
            }

            return new AWEContent.Models.GmapItem({'boxModelSettings': new AWEContent.Models.BoxModelSettings()});
        }
    });

    AWEContent.Views.GmapPanel = AWEContent.Views.ItemPanel.extend({
        tagName: "div",
        className: "awe-obj-panel panel-gmap",
        panelName: "gmap",
        initPanel: function () {
            AWEContent.Views.ItemPanel.prototype.initPanel.call(this);

            var self = this;

            $('#gmap-height', self.$el).change(function (event, values) {
                self.editingModel.set('height', values.value);
                if (values.value == -1)
                    $('.display-font', $(this)).text('DF');
            });
            $('#gmap-zoom', self.$el).change(function (event, values) {
                self.editingModel.set('zoom', values.value);
            });
            $('#gmap-enter-link input', self.$el).change(function () {
                self.editingModel.set('latLong', $(this).val());
            });
            $('#gmap-select-type', this.$el).change(function (event, values) {
                self.editingModel.set('style', values.value);
            });
            $('#gmap-scroll-zoom input', self.$el).change(function (event, scrollEdit) {
                if (!scrollEdit) {
                    self.editingModel.set('disableScrollZoom', parseInt($(this).val()));
                }
            });
            $('#gmap-custom-info-active input', self.$el).change(function (event, infoEdit) {
                if (!infoEdit) {
                    var active = self.editingModel.set('enableCustomInfo', $(this).val());
                    if (self.editingModel.get('enableCustomInfo') == 1) {
                        $('#gmap-custom-info-active', self.el).nextAll().show();
                    } else {
                        $('#gmap-custom-info-active', self.el).nextAll().hide();
                    }
                }
            });
            $('#gmap-custom-info-marker .img-bg', self.$el).change(function () {
                var inputValue = $('> input', this).val().trim(),
                    fileInfo = inputValue ? JSON.parse(inputValue) : {fid: -1, file_url: ''}

                self.editingModel.iconMarkerURL = fileInfo.file_url;
                    self.editingModel.set('iconMarker', fileInfo.fid);
            });

            $('#text-gmap-custom-info-title', self.$el).change(function () {
                self.editingModel.set('infoTitle', $(this).val());
            });

            $('#textarea-gmap-custom-info-description', self.$el).change(function () {
                self.editingModel.set('infoDescriptions', $(this).val());
            });
            $('#gmap-custom-id input', this.$el).change(function () {
                self.editingModel.set('customID', $(this).val());
            });
            $('#gmap-custom-class input', this.$el).change(function () {
                self.editingModel.set('customClass', $(this).val());
            });
            $('#gmap-column-box-model', self.el).initBoxModelPanel(self, 'boxModelSettings');
            $('#gmap-custom-attributes', this.el).initAttributesPanel(self);
        },
        setPanelElementsValue: function () {
            var self = this,
                settings = self.editingModel.toJSON(),
                iconMaker = !isNaN(parseInt(settings.iconMaker)) ? settings.iconMaker : -1;

            $('#gmap-height', self.el).aweSlider('value', settings.height);
            $('#gmap-zoom', self.el).aweSlider('value', settings.zoom);
            $('#gmap-enter-link #text-gmap-enter-link', self.$el).val(settings.latLong);
            $('#gmap-select-type', self.el).aweSelect('value', settings.style);
            $('#gmap-scroll-zoom input', self.el).val(settings.disableScrollZoom).trigger("change", true);
            $('#gmap-custom-info-active input', self.el).val(settings.enableCustomInfo).trigger("change", true);
            if (settings.enableCustomInfo)
                $('#gmap-custom-info-active', self.el).nextAll().show();
            else
                $('#gmap-custom-info-active', self.el).nextAll().hide();
            $('#gmap-custom-info-marker .img-bg', self.el).css({"background-image": "url(" + self.editingModel.iconMarkerURL + ")"});
            if (iconMaker === -1)
                $('#gmap-custom-info-marker .delete-bg-img', self.el).hide();
            $('#text-gmap-custom-info-title', self.el).val(settings.infoTitle);
            $('#textarea-gmap-custom-info-description', self.el).val(settings.infoDescriptions);
            $('#text-gmap-custom-id', self.el).val(settings.customID);
            $('#text-gmap-custom-class', self.el).val(settings.customClass);
            $('#gmap-column-box-model', self.el).initBoxModel(settings.boxModelSettings);
            $('#gmap-custom-attributes', self.el).initAttributes(settings.customEnableAttributes, settings.customDataAttributes);
        },
        buildPanel: function () {
            return {
                "title": {
                    "type": "markup",
                    "markup": "<div class=\"awe-title\"><h2>Google map<\/h2><\/div>"
                },
                "custom_attributes": {
                    "type": "section",
                    "enter_link": {
                        "type": "text_field",
                        "title": "latlong",
                        "attributes": {
                            "placeholder": "address"
                        }
                    },
                    "title": {
                        "type": "markup",
                        "markup": "<div class=\"small-quote\"><span>Visit <a href=\"https:\/\/www.google.com\/maps\" target=\"_blank\">Google maps <\/a>find your address and then click \u201cLink\u201d button to obtain your map link.<\/span><\/div>"
                    },
                    "select_type": {
                        "type": "select",
                        "title": "Style",
                        "options": {
                            "style1": "Subtle Grayscale",
                            "style2": "Pale Dawn",
                            "style3": "Blue water",
                            "style4": "Shades of Grey"
                        },
                        "default_value": "style1"
                    },
                    "zoom": {
                        "type": "slider",
                        "title": "Zoom",
                        "values": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
                        "default_value": 8,
                        "allow_type": true,
                        "unit": "px"
                    },
                    "height": {
                        "type": "slider",
                        "title": "Height",
                        "min_value": -1,
                        "max_value": 999,
                        "default_value": 300,
                        "allow_type": true,
                        "unit": "px"
                    },
                    "scroll_zoom": {
                        "type": "toggle",
                        "title": "Disable scroll to zoom",
                        "default_value": 1
                    }
                },
                "custom_box_info": {
                    "type": "section",
                    "column_box_info": {
                        "type": "tabs",
                        "tabs": [{
                            "tab_title": "Informations",
                            "contents": {
                                "custom_info_active": {
                                    "type": "toggle",
                                    "title": "Enable",
                                    "default_value": 0
                                },
                                "custom_info_marker": {
                                    "type": "media",
                                    "title": "Marker"
                                },
                                "custom_info_title": {
                                    "type": "text_field",
                                    "title": "Title",
                                    "default_value": ""
                                },
                                "custom_info_description": {
                                    "type": "textarea_field",
                                    "title": "Desctiption",
                                    "default_value": ""
                                }
                            }
                        }]
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
                    }
                }
            };
        }
    });

    $(document).ready(function () {
        AWEContent.Controllers.gmap = new AWEContent.Views.GmapItemController();
        AWEContent.Panels.gmap = new AWEContent.Views.GmapPanel();

    });
})(jQuery);
