/**
 * File: awecontent-twitter-item.js
 * Author: AWEThemes
 * Website: http://awethemes.com/
 */
(function($) {
    "use strict";

    AWEContent.Models.Twitter = Backbone.Model.extend({
    });

    AWEContent.Collections.Twitter = Backbone.Collection.extend({
        model: AWEContent.Models.Twitter,
        url: AWEContent.Path.twitterAPI,
        initialize: function(models, options) {
            this.url = (options||{}).url || AWEContent.Path.twitterAPI;
        },
        parse: function(response) {
            var self = this,
                tweetie = {};

            $.each(response, function(index, twt) {
                var temp = {};
                temp.date = self.dating(twt.created_at);
                temp.user_name =  twt.user.name;
                temp.retweeted = twt.retweeted;
                temp.avatar = '<img src="'+ twt.user.profile_image_url +'" />';
                temp.url =  'https://twitter.com/' + twt.user.screen_name + '/status/' + twt.id_str;

                temp.tweet = (twt.retweeted) ? self.linking('RT @'+ twt.user.screen_name +': '+ twt.retweeted_status.text) : self.linking(twt.text);
                temp.screen_name = self.linking('@'+ twt.user.screen_name);
                tweetie[index] = temp;
            });

            return tweetie;
        },
        dating: function(twt_date){
            var time = twt_date.split(' ');
            twt_date = new Date(Date.parse(time[1] + ' ' + time[2] + ', ' + time[5] + ' ' + time[3] + ' UTC'));
            var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

            var _date = {
                '%d': twt_date.getDate(),
                '%m': twt_date.getMonth()+1,
                '%b': months[twt_date.getMonth()].substr(0, 3),
                '%B': months[twt_date.getMonth()],
                '%y': String(twt_date.getFullYear()).slice(-2),
                '%Y': twt_date.getFullYear()
            };

            var date = this.dateFormat;
            var format = date.match(/%[dmbByY]/g);

            for (var i = 0, len = format.length; i < len; i++) {
                date = date.replace(format[i], _date[format[i]]);
            }
            return date;
        },
        linking : function (tweet) {
            var twit = tweet.replace(/(https?:\/\/([-\w\.]+)+(:\d+)?(\/([\w\/_\.]*(\?\S+)?)?)?)/ig,'<a href="$1" target="_blank" title="Visit this link">$1</a>')
                .replace(/#([a-zA-Z0-9_]+)/g,'<a href="https://twitter.com/search?q=%23$1&amp;src=hash" target="_blank" title="Search for #$1">#$1</a>')
                .replace(/@([a-zA-Z0-9_]+)/g,'<a href="https://twitter.com/$1" target="_blank" title="$1 on Twitter">@$1</a>');

            return twit;
        },
        dateFormat: '%b/%d/%Y'
    });

    AWEContent.Views.TwitterView = Backbone.View.extend({
        initialize: function() {
            _.bindAll(this, 'render');
            var self = this;
            this.collection.fetch({
                success: function() {
                    self.render();
                }
            });
        },
        templating : function (data) {
            var temp = this.collection.template,
                temp_variables = ['date', 'tweet', 'avatar', 'url', 'retweeted', 'screen_name', 'user_name'];

            for (var i = 0, len = temp_variables.length; i < len; i++) {
                temp = temp.replace(new RegExp('{{' + temp_variables[i] + '}}', 'gi'), data[temp_variables[i]]);
            }
            return temp;
        },
        render: function() {
            var self = this,
                tweetie = this.collection.toJSON()[0],
                listTwitter = '';

            self.listTwitter = [];
            $.each(tweetie, function(index, twitter) {
                self.listTwitter.push('<li>' + self.templating(twitter) + '</li>')
            });
            $('.awe-twitter', this.el).empty().append('<ul class="awe-twitter-list"></ul>').data('listTwitter', self.listTwitter);

            for ( var i =0; i< self.collection.numberTwitter; i ++) {
                $('.awe-twitter-list', self.el).append(self.listTwitter[i]);
            }

            // remove loader
            $('.awe-item-preload', self.$el).remove();
        }
    });

    /**
     * Define model for Twitter item
     */
    AWEContent.Models.TwitterItem = AWEContent.Models.Item.extend({
        defaults: {
            machine_name: "twitter",
            tagName: "div",
            numberTwitter: 5,
            dateFormat: '%b/%d/%Y',
            template: "<strong class=\"date\">{{date}}</strong> - {{screen_name}} {{tweet}}",
            sliderTwitter: 0,
            timeAuto: -1,
            navigation: 'button',
            stopOnHover: 1,
            boxModelSettings: {},
            twitterID : '',
            twitterClass : '',
            customEnableAttributes: 0,
            customDataAttributes: '[]', // Array Json {"attrName":"autoplay","attrValue":"true"}
            customActionAttributes: '{"newAction": "", "newAttrName": "", "newAttrValue": ""}',
            customEnableAnimations: 0,
            customDataAnimations: '', // Data Object
            previewAnimations : 0,
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
            this.view = new AWEContent.Views.TwitterItem({model: this});
        },
        clone : function(){
            var cloneModel = {};
            $.each(this.toJSON(), function(key,value){
                cloneModel[key] = value;
            });
            cloneModel.boxModelSettings = new AWEContent.Models.BoxModelSettings(cloneModel.boxModelSettings);
            return new AWEContent.Models.TwitterItem(cloneModel);
        }

    });

    /**
     * Define View for HeaderItem
     */
    AWEContent.Views.TwitterItem = AWEContent.Views.Item.extend({
        initialize: function() {
            AWEContent.Views.Item.prototype.initialize.call(this);
            this.listenTo(this.model.get("boxModelSettings"), "change", this.applySettingsChanged);
        },
        renderItemContent: function() {
            var self = this,
                $twitter = $('<div class="awe-item awe-twitter '+self.cid+'"><div class="awe-item-preload"></div></div>'),
                settings = self.model.toJSON();

            self.renderTwitter(settings);
            $twitter.renderItemDefaultAttributes(settings.customEnableAttributes, settings.customDataAttributes);
            $twitter.renderItemDefaultBoxModel(settings.boxModelSettings);
            $twitter.attr('id', settings.twitterID).addClass(settings.twitterClass);

            if (settings.customEnableAnimations) {
                var animation = settings.customDataAnimations;
                $twitter.processAnimations(animation)
            }
            self.$el.defaultResponsive(settings);

            // Add owlCarousel library
            AWEContent.Library.addLibrary('owlCarousel', function() {
                if (settings.sliderTwitter) {
                    var interval = setInterval(function(){
                        if ($('.awe-twitter.'+self.cid+' ul li', self.el).length) {
                            clearInterval(interval);
                            $('.awe-twitter.'+self.cid+' ul li', self.el).show();
                            self.sliderTwitter();
                        }
                    }, 50)
                }
            });
            return $twitter;
        },
        applySettingsChanged: function(model, options) {
            var self = this,
                settings = self.model.toJSON(),
                $twitter = $('.awe-twitter', self.el),
                dataListTwitter = $twitter.data('listTwitter'),
                $listTwitter = $('.awe-twitter-list', self.el),
                numberTwitter = settings.numberTwitter,
                heightBefore = self.$el.height();

            $.each(model.changed, function(key, value) {
                self.$el.changeResponsive(key, value);
                $twitter.renderChangeSettingBoxModel(key, value, model);
                switch (key) {
                    case 'numberTwitter':
                        if (settings.sliderTwitter) {
                            self.$owlSlide.data('owlCarousel').destroy();
                        }
                        $listTwitter.empty();
                        for (var i = 0; i< settings.numberTwitter; i ++) {
                            $listTwitter.append(dataListTwitter[i]);
                        }
                        if (settings.sliderTwitter) {
                            self.sliderTwitter();

                        }
                        break;
                    case 'dateFormat':
                    case 'template':
                        $twitter.html('<img style="display: block; margin: 0 auto;" src="/awecontent/img/preload.gif" />');
                        self.renderTwitter(settings);
                        break;
                    case 'sliderTwitter':
                        if (value) {
                            self.sliderTwitter();
                        }
                        else {
                            self.$owlSlide.data('owlCarousel').destroy();
                        }
                        break;
                    case 'navigation':
                        if (settings.navigation == 'none') {
                            self.stOwlSlide.pagination = false;
                        }
                        else {
                            self.stOwlSlide.pagination = true;
                            self.stOwlSlide.paginationNumbers = settings.navigation == 'number' ? true : false;
                        }
                        self.$owlSlide.data('owlCarousel').reinit(self.stOwlSlide);
                        break;
                    case 'stopOnHover':
                        self.stOwlSlide.stopOnHover = settings.stopOnHover ? true : false;
                        self.$owlSlide.data('owlCarousel').reinit(self.stOwlSlide);
                        break;
                    case 'timeAuto':
                        if (settings.timeAuto == -1) {
                            self.stOwlSlide.autoPlay = true;
                        }
                        else {
                            self.stOwlSlide.autoPlay = settings.timeAuto;
                        }
                        self.$owlSlide.data('owlCarousel').reinit(self.stOwlSlide);
                        break;
                    case 'twitterID':
                        $('.awe-twitter', self.el).attr('id',value);
                        break;
                    case 'twitterClass':
                        var prevClass = self.model.previousAttributes().twitterClass;
                        $twitter.removeClass(prevClass).addClass(value);
                        break;
                    case 'customEnableAttributes':
                        $twitter.renderChangeSettingsAttributes(key, value, settings.customDataAttributes);
                        break;
                    case 'customActionAttributes':
                        $twitter.renderChangeSettingsAttributes(key, value);
                        break;
                    case 'customEnableAnimations':
                    case 'customDataAnimations':
                        var animation = value;
                        var prevAnimation = self.model.previousAttributes().customDataAnimations;
                        $twitter.processAnimations(animation, prevAnimation);
                        break;
                    case 'previewAnimations' :
                        if (value) {
                            animation = settings.customDataAnimations;
                            prevAnimation = self.model.previousAttributes().customDataAnimations;
                            self.model.set('previewAnimations', 0);
                            $('.awe-twitter', self.el).processAnimations(animation, prevAnimation);
                        }
                        break;
                }
            });

            // Listen event change height of item
            setTimeout(function() {
                self.checkChangeHeight(heightBefore);
            }, 50);
        },
        renderTwitter: function(settings) {
            var twitter = new AWEContent.Collections.Twitter([], {url: AWEContent.Path.twitterAPI});

            twitter.numberTwitter = settings.numberTwitter;
            twitter.dateFormat = settings.dateFormat;
            twitter.template = settings.template;

            return new AWEContent.Views.TwitterView({
                el: this.$el,
                collection: twitter
            });
        },
        sliderTwitter: function(){
            var self = this,
                settings = self.model.toJSON(),
                $listTwitter = AWEContent.jqIframe('.awe-twitter-list', self.el);

            self.stOwlSlide = {
                items: 1,
                autoPlay: settings.timeAuto == -1 ? 5000 : settings.timeAuto,
                pagination: settings.navigation == 'none' ? false : true,
                paginationNumbers: settings.navigation == 'number' ? true : false,
                navigation: false,
                stopOnHover: settings.stopOnHover ? true : false
            };
            self.$owlSlide = $listTwitter.owlCarousel(self.stOwlSlide);

        }
    });

    /**
     * Define view for Header Controller
     * li tag what is contained by items panel
     */
    AWEContent.Views.TwitterItemController = AWEContent.Views.ItemController.extend({
        machineName : 'twitter',
        controllerHtml : function() {
            return '<i class="ic ac-icon-twitter"></i>';
        },
        createItemModel: function(templateData) {
            var boxModelSettings;
            if (templateData) {
                boxModelSettings = new AWEContent.Models.BoxModelSettings(templateData.boxModelSettings);
                templateData.boxModelSettings = boxModelSettings;
                return new AWEContent.Models.TwitterItem(templateData);
            }
            else {
                boxModelSettings = new AWEContent.Models.BoxModelSettings();
                return new AWEContent.Models.TwitterItem({ 'boxModelSettings' : boxModelSettings});
            }

        }
    });

    /**
     * Define header panel
     */
    AWEContent.Views.TwitterPanel = AWEContent.Views.ItemPanel.extend({
        tagName: "div",
        className: "awe-obj-panel panel-twitter",
        panelName: "twitter",
        initialize: function() {
            // Call parent initialize function
            AWEContent.Views.ItemPanel.prototype.initialize.call(this);
        },
        initPanel: function() {
            AWEContent.Views.ItemPanel.prototype.initPanel.call(this);
            var self = this;

            $('#twitter-number-twitter', self.el).change(function(event, values) {
                self.editingModel.set('numberTwitter', values.value);
            });
            $('#text-twitter-format-date', self.el).change( function() {
                self.editingModel.set('dateFormat', $(this).val());
            });
            $('#textarea-twitter-template', self.el).change( function() {
                self.editingModel.set('template', $(this).val());
            });
            $('#text-twitter-custom-id', self.el).change( function() {
                self.editingModel.set('twitterID', $(this).val());
            });
            $('#text-twitter-custom-class', self.el).change( function() {
                self.editingModel.set('twitterClass', $(this).val());
            });
            $('#twitter-twitter-slide input', self.el).change(function(event, slideEdit) {
                var isSlide = parseInt($(this).val());
                if(!slideEdit){
                    self.editingModel.set('sliderTwitter', isSlide);
                }
                $('#twitter-navigation, #twitter-stop-on-hover, #twitter-time-auto', self.el).css('display', isSlide ? '' : 'none');
            });
            $('#twitter-navigation', self.el).change(function(event, values) {
                self.editingModel.set('navigation', values.value);
            });
            $('#twitter-stop-on-hover input', self.el).change(function(event, slideEdit) {
                if(!slideEdit){
                    self.editingModel.set('stopOnHover', parseInt($(this).val()));
                }
            });
            $('#twitter-time-auto .slider-val', self.el).mousedown(function(){
                $(this).data('mouseup', false);
            });
            $(document).mouseup (function() {
                var $timeAuto = $('#twitter-time-auto'),
                    $sliderVar = $('.slider-val', $timeAuto),
                    $sliderFont = $('.display-font', $timeAuto);
                if ($sliderVar.data('mouseup') != undefined &&  !$sliderVar.data('mouseup')) {
                    $sliderVar.data('mouseup', true);
                    $sliderFont.trigger('change');
                }
            });
            $('#twitter-time-auto .display-font', this.el).change(function(event, isCustom) {
                var $slideVal = $(this).closest('.md-box').find('.slider-val'),
                    time = parseInt($(this).text());

                if (!isCustom && $slideVal.data('mouseup')) {
                    if (isNaN(time)) {
                        time = -1
                    }
                    self.editingModel.set('timeAuto', time);
                }
                $(this).text() == '-1' ? $(this).text('DF') : '';

            });
            $('#twitter-column-box-model', self.el).initBoxModelPanel(self, 'boxModelSettings');
            $('#twitter-custom-atributes', this.el).initAttributesPanel(self);
            $('#twitter-animations input[name=enabled_custom_animation]', this.el).change(function(event, data) {
                self.editingModel.set('customEnableAnimations', parseInt($(this).val()));
                if (data){
                    self.editingModel.set('customDataAnimations', JSON.stringify(data.animations));
                    if (data.previewAnimations){
                        self.editingModel.set('previewAnimations', 1);
                    }
                }
            });
        },
        setPanelElementsValue: function() {
            var self = this,
                settings = this.editingModel.toJSON();

            $('#twitter-number-twitter .display-font', self.el).text(settings.numberTwitter);
            $('#text-twitter-format-date ', this.el).val(settings.dateFormat);
            $('#textarea-twitter-template', self.el).val(settings.template);
            $('#twitter-twitter-slide input', self.el).val(settings.sliderTwitter).trigger("change", true);
            $('#twitter-navigation', self.el).aweSelect('value', settings.navigation);
            $("#twitter-stop-on-hover input[name=toggle_value]", self.el).val(settings.stopOnHover).trigger("change", true);
            $('#twitter-time-auto .display-font', this.el).text(settings.timeAuto).trigger('change', {isPanel : true});
            $('#twitter-time-auto .slider-val', this.el).slider('value', settings.timeAuto);
            $('#text-twitter-custom-id', self.el).val(settings.twitterID);
            $('#text-twitter-custom-class', self.el).val(settings.twitterClass);
            $("#twitter-column-box-model", this.$el).initBoxModel(settings.boxModelSettings);
            $('#twitter-custom-attributes', this.el).initAttributes(settings.customEnableAttributes, settings.customDataAttributes);
            $('#twitter-animations input[name=enabled_custom_animation]', this.el).val(settings.customEnableAnimations).trigger('change');
            $('#twitter-animations input[name=enabled_custom_animation]', this.el).attr('data-animations', settings.customDataAnimations).data('view', this.editingModel.view);
        },
        buildPanel: function() {
            return {"title": {
                "type": "markup",
                "markup": "<div class=\"awe-title\"><h2>Twitter<\/h2><\/div>"
            },
                "custom_attributes": {
                    "type": "section",
                    "number_twitter": {
                        "type": "slider",
                        "title": "No of tweet",
                        "values": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
                        "default_value": 5,
                        "allow_type": true
                    },
                    "format_date": {
                        "type": "text_field",
                        "title": "Date Format",
                        "default_value": "%b/%d/%Y"
                    },
                    "date_description": {
                        "type": "markup",
                        "markup": "<table class='option-tiwtter'><thead><tr><th>Format<\/th><th>Description<\/th><\/tr><\/thead><tbody><tr><td><code>%d<\/code><\/td><td>Date, 1,2,3...<\/td><\/tr><tr><td><code>%m<\/code><\/td><td>Month number 1,2,3...<\/td><\/tr><tr><td><code>%b<\/code><\/td><td>Abbreviated month Jan, Feb, Mar...<\/td><\/tr><tr><td><code>%B<\/code><\/td><td>Full month January, February, March...<\/td><\/tr><tr><td><code>%y<\/code><\/td><td>Last two digits of year, 11,12,13...<\/td><\/tr><tr><td><code>%Y<\/code><\/td><td>Full year 2011, 2012, 2013...<\/td><\/tr><\/tbody><\/table>"
                    },
                    "template": {
                        "type": "textarea_field",
                        "title": "Desctiption",
                        "default_value": "<strong class=\"date\">{{date}}</strong> - {{screen_name}} {{tweet}}"
                    },
                    "template_description": {
                        "type": "markup",
                        "markup": "<table class='option-tiwtter'> <thead> <tr> <th>Template<\/th> <th>Description<\/th> <\/tr><\/thead> <tbody> <tr> <td><code>{{tweet}}<\/code> <\/td><td>Tweet content<\/td><\/tr><tr> <td><code>{{date}}<\/code> <\/td><td>Formatted tweet date<\/td><\/tr><tr> <td><code>{{avatar}}<\/code> <\/td><td>User's Avatar Image<\/td><\/tr><tr> <td><code>{{url}}<\/code> <\/td><td>Direct URL to the tweet<\/td><\/tr><tr> <td><code>{{retweeted}}<\/code> <\/td><td>Returns <code>true<\/code> or <code>false<\/code> if tweet is retweeted<\/td><\/tr><tr> <td><code>{{screen_name}}<\/code> <\/td><td>Screen name of person who posted the tweet<\/td><\/tr><tr> <td><code>{{user_name}}<\/code> <\/td><td>Username of person who posted the tweet<\/td><\/tr><\/tbody><\/table>"
                    },
                    "twitter_slide": {
                        "type": "toggle",
                        "title": "Twitter Slide",
                        "default_value": 1
                    },
                    'navigation' : {
                        type : 'select',
                        title : 'Navigation',
                        "options": {
                            "none": "None",
                            "button": "Button",
                            "number": "Number"
                        },
                        "default_value": "none"
                    },
                    stop_on_hover : {
                        type: 'toggle',
                        title: 'Stop On Hover',
                        default_value: 1
                    },
                    time_auto: {
                        "type": "slider",
                        "title": "Time Auto",
                        "min_value": -1,
                        "max_value": 10000,
                        "default_value": 5000,
                        "allow_type": true,
                        "only_change_mouseup" : true,
                        "unit": "ms"
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
        AWEContent.Controllers.twitter = new AWEContent.Views.TwitterItemController();
        AWEContent.Panels.twitter = new AWEContent.Views.TwitterPanel();
    });
})(jQuery);
