/**
 * File: awecontent-tabs-item.js
 * Author: AWEThemes
 * Website: http://awethemes.com/
 */
(function($) {
    "use strict";

    /**
     * Define model for tab in TabsItem
     */
    AWEContent.Models.TabItem = Backbone.RelationalModel.extend({
        defaults: {
            title: "",
            content: [],
            icon: 'ic ac-icon-done'
        },
        //relations: [
        //    {
        //        type: Backbone.HasMany,
        //        key: "content",
        //        relatedModel: AWEContent.Models.Column,
        //        relatedCollection: AWEContent.Collections.ListColumn
        //    }
        //],
        clone: function() {
            var column = new AWEContent.Collections.ListColumn();
            this.get('content').each( function( data) {
                column.add( data.clone());
            });
            return new AWEContent.Models.TabItem ({
                title : this.get('title'),
                content:  column
            });
        }
    });

    /**
     * Define view for TabItem
     */
    AWEContent.Views.TabItem = Backbone.View.extend({
        tabController: _.template(
            '<li class="awe-tab-item">\
                <a href="#custom-obj-tab-<%= tabIndex %>">\
                    <span class="awe-tab-icon"><i class="<%= tabIcon %>"></i></span>\
                    <span class="awe-tab-title"><%= tabTitle %></span>\
                </a>\
                <div class="awe-custom cus-tab-item">\
                    <ul>\
                        <li class="awe-tab-item-clone"><i class="ic ac-icon-clone"></i></li>\
                        <li class="awe-tab-item-del"><i class="ic ac-icon-trash"></i></li>\
                        <li class="awe-tab-item-move"><i class="ic ac-icon-move"></i></li>\
                    </ul>\
                </div>\
            </li>'
        ),
        initialize: function() {
            this.listenTo(this.model, 'destroy', this.remove);
        },
        render: function(tabIndex) {
            var tabContent = new AWEContent.Views.ListColumn({collection: this.model.get("content")});
            this.$el.append(tabContent.$el).attr("id", "custom-obj-tab-" + this.model.cid);
        },
        remove : function() {
            this.$el.remove();
        }
    });

    /**
     * Define collection of TabItem
     */
    AWEContent.Collections.ListTabItem = Backbone.Collection.extend({
        model: AWEContent.Models.TabItem
    });

    /**
     * Define model for heder item
     */
    AWEContent.Models.TabsItem = AWEContent.Models.Item.extend({
        defaults: {
            machine_name: "tabs",
            tabPosition : 'tabs-left',
            enableIcon: 0,
            iconPosition: 'left',
            titleColorEnable : 1,
            titleTextAlign : 'tabs-title-left',
            normalTextColor : '',
            normalBackgroundColor : '',
            hoverTextColor : '',
            hoverBackgroundColor : '',
            activeTextColor : '',
            activeBackgroundColor : '',
            boxModelSettings : {},
            customID : '',
            customClass : '',
            customEnableAttributes: 0,
            customDataAttributes: '[] ', // Array Json ex : [{"attrName":"autoPlay","attrValue":"true"}]
            customActionAttributes : '{"newAction": "", "newAttrName": "", "newAttrValue": ""}',
            customEnableAnimations: 0,
            customDataAnimations: '{"type" : "none"}', // Data Object
            tabs: [],
            lgResponsive: true,
            xsResponsive: true,
            mediumResponsive: true,
            smResponsive: true
        },
        relations: [
            {
                type: Backbone.HasMany,
                key: "tabs",
                relatedModel: AWEContent.Models.TabItem,
                relatedCollection: AWEContent.Collections.ListTabItem,
                reverseRelation: {
                    key: "tabsItem"
                }
            },
            {
                type: Backbone.HasOne,
                key: "boxModelSettings",
                relatedModel: AWEContent.Models.BoxModelSettings
            }
        ],
        hasContentLayout: true,
        getContentColumnModel: function($column, colID) {
            var $tabContent = $column.parent().parent(),
                tabId = $tabContent.attr("aria-labelledby"),
                $tabController = $("li.awe-tab-item[aria-labelledby=" + tabId + "]", $tabContent.parent().parent()),
                tabIndex = $tabController.index(),
                tabModel = this.get("tabs").at(tabIndex);

            return tabModel.get("content").at(colID);
        },
        createView: function() {
            this.view = new AWEContent.Views.TabsItem({model: this});
        },
        clone: function() {
            var cloneModel = {},
                listTabItem = new  AWEContent.Collections.ListTabItem();

            this.get('tabs').each( function(tab) {
                listTabItem.add(tab.clone());
            });
            $.each(this.toJSON(), function(key,value){
                if (key != 'tabs')
                    cloneModel[key] = value;
            });
            cloneModel.tabs = listTabItem;
            cloneModel.boxModelSettings = new AWEContent.Models.BoxModelSettings(cloneModel.boxModelSettings);
            return new AWEContent.Models.TabsItem(cloneModel);
        },
        removePanelView: function () {
            AWEContent.Models.Item.prototype.removePanelView.call(this);

            this.get('tabs').each(function(tabModel) {
                tabModel.get('content').each(function(modelCol) {
                    modelCol.removePanelView();
                });
            });
        }
    });

    /**
     * Define View for Tabs
     */
    AWEContent.Views.TabsItem = AWEContent.Views.Item.extend({
        controller: _.template(
            '<div class="select-tab">\
                <ul>\
                    <%= controllers %>\
                    <li class="awe-new-tab add-tab"><i class="ic ac-icon-add"></i></li>\
                </ul>\
            </div>'
        ),
        titleColorStyle: _.template(
            '.<%= className %> li.awe-tab-item {\
                background-color: <%= normalBgColor %> !important;\
            }\
            .<%= className %> li.awe-tab-item > .ui-tabs-anchor {\
                color: <%= normalColor %> !important;\
                background-color: <%= normalBgColor %> !important;\
            }\
            .<%= className %> li.awe-tab-item:hover,\
            .<%= className %> li.awe-tab-item.ui-state-hover {\
                color: <%= hoverColor %> !important;\
                background-color: <%= hoverBgColor %> !important;\
            }\
            .<%= className %> li.awe-tab-item:hover > .ui-tabs-anchor,\
            .<%= className %> li.awe-tab-item.ui-state-hover > .ui-tabs-anchor {\
                color: <%= hoverColor %> !important;\
                background-color: <%= hoverBgColor %> !important;\
            }\
            .<%= className %> li.awe-tab-item.ui.state-active > .ui-tabs-anchor {\
                color: <%= activeColor %> !important;\
                background-color: <%= activeBgColor %> !important;\
            }'
        ),
        additionalEvents: {
            "click > .awe-tabs > .select-tab > ul > li.awe-new-tab": "addTab",
            'click > .awe-tabs > .select-tab > ul > li.awe-tab-item > .cus-tab-item > ul > li.awe-tab-item-del' : "deleteTab",
            'click > .awe-tabs > .select-tab > ul > li.awe-tab-item > .cus-tab-item > ul > li.awe-tab-item-edit' : 'editTitleTab',
            'click > .awe-tabs > .select-tab > ul > li.awe-tab-item > .cus-tab-item > ul > li.awe-tab-item-clone' : 'cloneTab',
            'click > .awe-tabs li.awe-tab-item .awe-tab-icon' : 'changeIcon',
            'change > .awe-tabs li.awe-tab-item .awe-tab-icon' : 'changeIcon',
        },
        initialize: function() {
            // Call parent initialize
            AWEContent.Views.Item.prototype.initialize.call(this);
            this.listenTo(this.model.get("boxModelSettings"), "change", this.applySettingsChanged);

            // Wait item ready to run javascript code
            var self = this;
            self.iframeJQuery(self.$el).delegate(".awe-tabs", "itemReady", function() {
                self.iframeJQuery(self.$el).undelegate();
                var $tabs = self.iframeJQuery(this).tabs(),
                    beforeSortIndex;

                self.iframeJQuery(".select-tab > ul", self.iframeJQuery(this)).sortable({
                    axis: "x",
                    items: ".awe-tab-item",
                    handle: '.awe-custom .awe-tab-item-move',
                    start: function(event, ui) {
                        beforeSortIndex = ui.item.index();
                    },
                    stop: function(event, ui) {
                        var afterSortIndex = ui.item.index(),
                            tabs = self.model.get("tabs"),
                            sortedTab = tabs.remove(tabs.at(beforeSortIndex));
                        tabs.add(sortedTab, {at: afterSortIndex, silent: true});
                        $tabs.tabs("refresh");
                    }
                });
                if (self.model.get('tabPosition') == 'tabs-vertical-right' || self.model.get('tabPosition') == 'tabs-vertical-left'){
                    self.iframeJQuery(".select-tab > ul", self.iframeJQuery(this)).sortable('option', 'axis', 'y');
                }
                self.editTitleTab();
                AWEContent.Panels.toolbarPanel.updateSortableColumn();
            });
        },
        renderItemContent: function() {
            var self = this,
                controllers = "",
                $content = $('<div class="md-content-tab"></div>'),
                $tabs = $('<div class="awe-item awe-tabs"><style></style></div>'),
                settings = self.model.toJSON(),
                $style = $('> style', $tabs);
                self.classTabs = 'awe-tab-' + this.cid;

            $tabs.addClass(this.classTabs);
            this.totalTabs = 0;
            self.model.get("tabs").each(function(tab, tabIndex) {
                self.totalTabs ++;
                var tabView = new AWEContent.Views.TabItem({model: tab}),
                    title = (tab.get("title")) ? tab.get("title") : "AWETab " + self.totalTabs;
                    tab.set('title', title);

                // Render tab content
                controllers += tabView.tabController({tabIndex: tab.cid, tabTitle: title, tabIcon: tab.get('icon')});
                tabView.render();
                $content.append(tabView.$el);
            });
            controllers = this.controller({controllers: controllers});
            $tabs.append(controllers).append($content);

            // Render Default Data
            $tabs.addClass(settings.tabPosition).addClass(settings.titleTextAlign);
            if (settings.titleColorEnable) {
                var titleColor = {
                    className: self.classTabs,
                    normalColor: settings.normalTextColor,
                    normalBgColor: settings.normalBgColor,
                    hoverColor: settings.hoverTextColor,
                    hoverBgColor: settings.hoverBackgroundColor,
                    activeColor: settings.activeTextColor,
                    activeBgColor: settings.activeBackgroundColor
                };
                $style.html(self.titleColorStyle(titleColor));
            }
            $tabs.renderItemDefaultBoxModel(settings.boxModelSettings);
            $tabs.attr('id', settings.customID).addClass(settings.customClass);
            $tabs.renderItemDefaultAttributes(settings.customEnableAttributes, settings.customDataAttributes);
            if (settings.customEnableAnimations) {
                var animation = settings.customDataAnimations;
                $tabs.processAnimations(animation)
            }
            self.$el.defaultResponsive(settings);

            // render settings for icons
            if (settings.enableIcon) {
                $tabs.addClass('awe-tab-icon-enabled');

                if (settings.iconPosition == 'right')
                    $tabs.addClass('awe-tab-icon-right');
            }

            return $tabs;
        },
        applySettingsChanged: function(model) {
            var self = this,
                settings = self.model.toJSON(),
                $tab = $('> .awe-tabs', this.$el),
                prevClass,
                heightBefore = self.$el.height();

            $.each(model.changedAttributes(), function(key, value) {
                self.$el.changeResponsive(key, value);
                $tab.renderChangeSettingBoxModel(key, value, model);
                switch (key) {
                    case 'tabPosition' :
                        var prev_class = self.model.previousAttributes().tabPosition;

                        $tab.removeClass(prev_class).addClass(value);

                        $('> .awe-tabs > .md-content-tab', self.$el).before($('> .awe-tabs > .select-tab', self.$el));
                        if (prev_class == 'tabs-vertical-left' || prev_class == 'tabs-vertical-right'){
                            self.iframeJQuery("> .awe-tabs >.select-tab > ul", self.iframeJQuery(self.$el)).sortable('option', 'axis', 'x');
                        }
                        if (prev_class.indexOf('tabs-bottom') !=-1) {
                            $('> .awe-tabs >.select-tab', self.$el).css({
                                'position': ''
                            });
                            $('.awe-tabs', self.$el).css('height','');
                            $('> .awe-tabs > .md-content-tab', self.$el).before($('> .awe-tabs > .select-tab', self.$el));
                        }
                        if (value.indexOf('tabs-bottom') !=-1) {
                            $('> .awe-tabs > .select-tab', self.$el).css({
                                'position': 'static'
                            });
                            $('> .awe-tabs > .md-content-tab', self.$el).after($('> .awe-tabs > .select-tab', self.$el));
                        }
                        if (value == 'tabs-vertical-right') {
                            $('> .awe-tabs > .md-content-tab', self.$el).css({
                                'width' : '100%',
                                'float' : 'none'
                            }).after($('> .awe-tabs > .select-tab', self.$el));
                            self.iframeJQuery("> .awe-tabs >.select-tab > ul", self.iframeJQuery(self.$el)).sortable('option', 'axis', 'y');
                        }
                        if (value == 'tabs-vertical-left') {
                            $('> .awe-tabs > .md-content-tab', self.$el).css('width', '').before($('> .awe-tabs > .select-tab', self.$el));
                            self.iframeJQuery("> .awe-tabs >.select-tab > ul", self.iframeJQuery(self.$el)).sortable('option', 'axis', 'y');
                        }
                        break;

                    case 'enableIcon':
                        value ? $('.awe-tabs', self.$el).addClass('awe-tab-icon-enabled') : $('.awe-tabs', self.$el).removeClass('awe-tab-icon-enabled');
                        break;

                    case 'iconPosition':
                        if (value == 'left')
                            $('.awe-tabs', self.$el).removeClass('awe-tab-icon-right');
                        else
                            $('.awe-tabs', self.$el).addClass('awe-tab-icon-right');
                        break;

                    case 'titleColorEnable' :
                        var titleColor = {
                                className: self.classTabs,
                                normalColor: settings.normalTextColor,
                                normalBgColor: settings.normalBgColor,
                                hoverColor: settings.hoverTextColor,
                                hoverBgColor: settings.hoverBackgroundColor,
                                activeColor: settings.activeTextColor,
                                activeBgColor: settings.activeBackgroundColor
                            },
                            style = value ? self.titleColorStyle(titleColor) : '';

                        $('> style', $tab).html(style);
                        break;

                    case 'titleTextAlign':
                        $tab.removeClass(self.model.previousAttributes().titleTextAlign).addClass(value);
                        break;

                    case 'normalTextColor':
                        $('li.awe-tab-item:not(.ui-state-active) .ui-tabs-anchor', self.$el).css('color', value);
                        self.updateTitleColor();
                        break;

                    case 'normalBackgroundColor':
                        $('li.awe-tab-item:not(.ui-state-active) .ui-tabs-anchor', self.$el).css('background-color', value);
                        $('li.awe-tab-item:not(.ui-state-active)', self.$el).css('background-color', value);
                        self.updateTitleColor();
                        break;

                    case 'hoverTextColor' :
                    case 'hoverBackgroundColor' :
                        self.updateTitleColor();
                        break;

                    case 'activeTextColor':
                        $('li.awe-tab-item.ui-state-active .ui-tabs-anchor', self.$el).css('color', value);
                        self.updateTitleColor();
                        break;

                    case 'activeBackgroundColor' :
                        $('li.awe-tab-item.ui-state-active .ui-tabs-anchor', self.$el).css('background-color', value);
                        $('li.awe-tab-item.ui-state-active', self.$el).css('background-color', value);
                        self.updateTitleColor();
                        break;

                    case 'customID' :
                        $tab.attr('id', value);
                        break;

                    case 'customClass' :
                        prevClass = self.model.previousAttributes().customClass;
                        $tab.removeClass(prevClass).addClass(value);
                        break;

                    case 'customEnableAttributes':
                        $tab.renderChangeSettingsAttributes(key, value, settings.customDataAttributes);
                        break;

                    case 'customActionAttributes':
                        $tab.renderChangeSettingsAttributes(key, value);
                        break;

                    case 'customEnableAnimations':
                        var animation, prevAnimation;
                        if (value) {
                            animation = settings.customDataAnimations;
                            prevAnimation = null;
                            $tab.processAnimations(animation);
                        }
                        else {
                            animation = null;
                            prevAnimation = settings.customDataAnimations;
                            $tab.processAnimations(animation, prevAnimation);
                        }
                        break;

                    case 'customDataAnimations':
                        $tab.processAnimations(settings.customDataAnimations, self.model.previousAttributes().customDataAnimations);
                        break;
                }
            });

            // Listen event change height of item
            setTimeout(function() {
                self.checkChangeHeight(heightBefore);
            }, 50);
        },
        updateTitleColor: function() {
            var self = this,
                settings = this.model.toJSON();

            // clear previous timeout
            if (this.updateColor)
                clearTimeout(this.updateColor);

            // create timeout to update new title style
            this.updateColor = setTimeout(function() {
                var titleColor = {
                        className: self.classTabs,
                        normalColor: settings.normalTextColor,
                        normalBgColor: settings.normalBgColor,
                        hoverColor: settings.hoverTextColor,
                        hoverBgColor: settings.hoverBackgroundColor,
                        activeColor: settings.activeTextColor,
                        activeBgColor: settings.activeBackgroundColor
                    },
                    style = self.titleColorStyle(titleColor);

                // update title style
                $('.awe-tabs > style', self.$el).html(style);

                // reset elements style
                $('li.awe-tab-item .ui-tabs-anchor', self.$el).css({'background-color': '', color: ''});
                $('li.awe-tab-item', self.$el).css({'background-color': '', color: ''});
                 // reset timeout flag
                self.updateColor = false;
            }, 100);
        },
        addTab: function() {
            this.totalTabs ++;
            var boxModelColumn = new AWEContent.Models.BoxModelSettings(),
                column = new AWEContent.Models.Column({
                    items: new AWEContent.Collections.ListItem(),
                    settings: new AWEContent.Models.ColumnSettings({boxModelSettings: boxModelColumn}),
                    classes: new AWEContent.Models.BootstrapGrid()
                }),
                tabItem = new AWEContent.Models.TabItem({content: new AWEContent.Collections.ListColumn([column])}),
                tabView = new AWEContent.Views.TabItem({model: tabItem}),
                tabTitle =  "AWETab " + this.totalTabs,
                controller = tabView.tabController({tabIndex: tabItem.cid, tabTitle: tabTitle, tabIcon: tabItem.get('icon')});

            tabView.render();
            tabView.model.set('title', tabTitle);
            $(controller).insertBefore($("> .awe-tabs > .select-tab > ul > li.awe-new-tab", this.$el));
            $("> .awe-tabs > .md-content-tab", this.$el).append(tabView.$el);
            this.iframeJQuery(" > .awe-tabs", this.iframeJQuery(this.el)).tabs("refresh");
            this.model.get("tabs").add(tabItem, {silent: true});
            this.editTitleTab(':last');
            AWEContent.Panels.toolbarPanel.updateSortableColumn();

            // Resize Tab
            this.resizeItem();
        },
        cloneTab : function (event) {
            var self = this,
                $target = $(event.target),
                $controlTab = $target.closest('.awe-tab-item'),
                indexControl = $controlTab.index(),
                modelCurrent = self.model.get('tabs').at(indexControl),
                modelClone = modelCurrent.clone(),
                viewClone = new AWEContent.Views.TabItem({model: modelClone}),
                tabTitle = modelClone.get('title') + ' Clone',
                tabIcon = modelClone.get('icon'),
                controller = viewClone.tabController({tabIndex: modelClone.cid, tabTitle: tabTitle, tabIcon: tabIcon});

            viewClone.render();
            viewClone.model.set('title', tabTitle);
            $(controller).insertAfter($controlTab);
            viewClone.$el.insertAfter($("> .awe-tabs > .md-content-tab", this.$el).children().eq(indexControl));
            this.iframeJQuery(" > .awe-tabs", this.iframeJQuery(this.el)).tabs("refresh");
            this.model.get("tabs").add(modelClone, {at : indexControl + 1, silent: true});
            this.editTitleTab(":eq(" + (indexControl + 2)+ ")");
            AWEContent.Panels.toolbarPanel.updateSortableColumn();

            // Resize Tab
            this.resizeItem();
        },
        deleteTab : function(event) {
            var $delItem = ($(event.target).hasClass('awe-tab-item-del')) ? $(event.target) : $(event.target).parents('.awe-tab-item-del'),
                $tabItem = $delItem.parent().parent().parent(),
                indexTabItem = $tabItem.index(),
                modelTabs = this.model.get('tabs').at(indexTabItem);
            if (modelTabs.get('content') != undefined){
                modelTabs.get('content').each( function(columnModel, idCol){
                    columnModel.removePanelView();
                });
            }
            modelTabs = this.model.get('tabs').remove(modelTabs);
            $tabItem.remove();
            modelTabs.destroy();
            this.iframeJQuery(".awe-tabs", this.iframeJQuery(this.el)).tabs("refresh");

            // Resize Tab
            this.resizeItem();
        },
        editTitleTab : function(options){
            var self = this, indexTab, modelTab, title, $target,
                extend = options;

            if (options == undefined)
                extend = '';
            self.iframeJQuery("> .awe-tabs > .select-tab > ul > li" +extend, self.iframeJQuery(self.$el)).prev().find('span.awe-tab-title')
                .keydown( function(event){
                    event.stopPropagation();
                })
                .click( function(event){
                    event.preventDefault();
                    event.stopPropagation();
                    $(this).attr('contenteditable', 'true').focus();
                })
                .focusin( function(event){
                    indexTab = $(this).parents('li.awe-tab-item:first').index();
                    modelTab = self.model.get('tabs').at(indexTab);
                    title = modelTab.get('title');
                    $(this).text(title);
                })
                .focusout( function(event){
                    indexTab = $(this).parents("li.awe-tab-item:first").index();
                    modelTab = self.model.get('tabs').at(indexTab);
                    title = $(this).text();
                    modelTab.set('title', title);
                    $(this).text(title);
                    $(this).attr('contenteditable', 'false')
                });
        },
        changeIcon: function(event, data) {
            var $controller = $(event.target).hasClass('awe-tab-icon') ? $(event.target) : $(event.target).parents('.awe-tab-icon'),
                indexTab = $controller.parents('li.awe-tab-item:first').index(),
                tabModel = this.model.get('tabs').at(indexTab);

            if (event.type =='click') {
                $controller.attr('data-name-icon', tabModel.get('icon'));
                AWEContent.Panels.listIconPanel.processIcon($controller, {name :'accordion'});
            }
            if (event.type == 'change') {
                tabModel.set('icon', data.nameIcon);
                $('> i', $controller).removeClass().addClass(data.nameIcon);
            }
        }
    });

    /**
     * Define view for Header Controller
     * li tag what is contained by items panel
     */
    AWEContent.Views.TabsItemController = AWEContent.Views.ItemController.extend({
        machineName: 'tabs',
        controllerHtml: function() {
            return '<div class="title-icon">Tabs</div><i class="ic ac-icon-tabs"></i>';
        },
        createItemModel: function(templateData) {
            if (templateData) {
                var boxModel = new AWEContent.Models.BoxModelSettings(templateData.boxModelSettings),
                    tabs = new AWEContent.Collections.ListTabItem();
                templateData.boxModelSettings = boxModel;

                $.each(templateData.tabs, function(index, tab) {
                    var columns = new AWEContent.Collections.ListColumn();

                    $.each(tab.content, function(index, columnData) {
                        var columnModel = AWEContent.createColumnFromTemplate(columnData);
                        columns.add(columnModel);
                    });
                    tab.content = columns;
                    delete tab.tabsItem;

                    tabs.add(new AWEContent.Models.TabItem(tab));
                });

                templateData.tabs = tabs;
                return new AWEContent.Models.TabsItem(templateData);
            }
            else {
                var boxModelColumn = new AWEContent.Models.BoxModelSettings(),
                    column = new AWEContent.Models.Column({
                        items: new AWEContent.Collections.ListItem(),
                        settings: new AWEContent.Models.ColumnSettings({boxModelSettings: boxModelColumn}),
                        classes: new AWEContent.Models.BootstrapGrid()
                    }),
                    tabItem = new AWEContent.Models.TabItem({content: new AWEContent.Collections.ListColumn([column])}),
                    boxModelSettings = new AWEContent.Models.BoxModelSettings();

                return new AWEContent.Models.TabsItem({tabs: new AWEContent.Collections.ListTabItem(tabItem), boxModelSettings : boxModelSettings});
            }
        }
    });

    /**
     * Define header panel
     */
    AWEContent.Views.TabsPanel = AWEContent.Views.ItemPanel.extend({
        tagName: "div",
        className: "awe-obj-panel tabs-panel",
        panelName: "tabs",
        initPanel: function() {
            AWEContent.Views.ItemPanel.prototype.initPanel.call(this);
            var self = this;

            $('.color-picker', self.el).append('<input type="hidden" name="changing-color">');
            $('#tabs-position', self.el).change(function(event, values) {
                self.editingModel.set('tabPosition', values.value);
            });

            $('#tabs-enable-icon input', this.$el).change(function(event, initPanel) {
                var value = parseInt($(this).val());

                if (value)
                    $('#tabs-icon-pos', self.$el).show();
                else
                    $('#tabs-icon-pos', self.$el).hide();
                if (!initPanel)
                    self.editingModel.set('enableIcon', value);
            });

            $('#tabs-icon-pos', self.$el).change(function(event, values) {
                self.editingModel.set('iconPosition', values.value);
            });
            $('#tabs-title-color input', self.el).change(function(event, isPanel){
                if (parseInt($(this).val()))
                    $(this).closest('.toggle-enable').nextAll().show();
                else
                    $(this).closest('.toggle-enable').nextAll().hide();
                if (!isPanel)
                    self.editingModel.set('titleColorEnable', parseInt($(this).val()))
            });
            $('#tabs-title-align', self.el).change( function(event, values) {
                self.editingModel.set('titleTextAlign', values.value);
            });

            $('#tabs-normal-color', self.el).change( function(event, color) {
                if (color)
                    color = color.toRgbString();
                else
                    color = '';
                self.editingModel.set('normalTextColor', color);
            });
            $('#tabs-normal-background-color', self.el).change( function(event, color) {
                if (color)
                    color = color.toRgbString();
                else
                    color = '';
                self.editingModel.set('normalBackgroundColor', color);
            });
            $('#tabs-hover-color', self.el).change( function(event, color) {
                if (color)
                    color = color.toRgbString();
                else
                    color = '';
                self.editingModel.set('hoverTextColor', color);
            });
            $('#tabs-hover-background-color', self.el).change( function(event, color) {
                if (color)
                    color = color.toRgbString();
                else
                    color = '';
                self.editingModel.set('hoverBackgroundColor', color);
            });
            $('#tabs-active-color', self.el).change( function(event, color) {
                if (color)
                    color = color.toRgbString();
                else
                    color = '';
                self.editingModel.set('activeTextColor', color);
            });
            $('#tabs-active-background-color', self.el).change(function(event, color) {
                if (color)
                    color = color.toRgbString();
                else
                    color = '';
                self.editingModel.set('activeBackgroundColor', color);
            });
            $('#tabs-column-box-model', self.el).initBoxModelPanel(self, 'boxModelSettings');
            $('#text-tabs-custom-id', self.el).change( function() {
                self.editingModel.set('customID', $(this).val());
            });
            $('#text-tabs-custom-class', self.el).change( function() {
                self.editingModel.set('customClass', $(this).val());
            });
            $('#tabs-custom-attributes', this.el).initAttributesPanel(self);
            $('#tabs-animations input[name=enabled_custom_animation]', this.el).change(function(event, data) {
                self.editingModel.set('customEnableAnimations', parseInt($(this).val()));
                if (data){
                    self.editingModel.set('customDataAnimations', JSON.stringify(data.animations));
                }
            });
        },
        setPanelElementsValue: function() {
            var self = this,
                settings = this.editingModel.toJSON();

            // Set data for Panel Item Tabs
            $('#tabs-position', self.el).aweSelect('value', settings.tabPosition);
            if (!Drupal.settings.enable_icon)
                $('#tabs-enable-icon, #tabs-icon-pos', this.$el).remove();
            else {
                $('#tabs-enable-icon input', this.$el).val(settings.enableIcon).trigger('change', true);
                $('#tabs-icon-pos', this.$el).aweSelect('value', settings.iconPosition);
            }
            $('#tabs-title-color input', self.el).val(settings.titleColorEnable).trigger('change', {isPanel : true});
            $('#tabs-title-align', self.el).aweSelect('value', settings.titleTextAlign);
            $('#tabs-normal-color', self.el).aweColorPicker('value',settings.normalTextColor);
            $('#tabs-normal-background-color', self.el).aweColorPicker('value',settings.normalBackgroundColor);
            $('#tabs-hover-color', self.el).aweColorPicker('value',settings.hoverTextColor);
            $('#tabs-hover-background-color', self.el).aweColorPicker('value',settings.hoverBackgroundColor);
            $('#tabs-active-color', self.el).aweColorPicker('value',settings.activeTextColor);
            $('#tabs-active-background-color', self.el).aweColorPicker('value',settings.activeBackgroundColor);
            $('#tabs-column-box-model', self.el).initBoxModel(settings.boxModelSettings);
            $('#text-tabs-custom-id', self.el).val(settings.customID);
            $('#text-tabs-custom-class', self.el).val(settings.customClass);
            $('#tabs-custom-attributes', this.el).initAttributes(settings.customEnableAttributes, settings.customDataAttributes);
            $('#tabs-animations input[name=enabled_custom_animation]', this.el).val(settings.customEnableAnimations).trigger('change');
            $('#tabs-animations input[name=enabled_custom_animation]', this.el).attr('data-animations', settings.customDataAnimations).data('view', this.editingModel.view);
        },
        buildPanel: function() {
            return {
                "title": {
                    "type": "markup",
                    "markup": "<div class=\"awe-title\"><h2>Tabs<\/h2><\/div>"
                },
                "custom_attributes": {
                    "type": "section",
                    "position": {
                        "type": "select",
                        "title": "Position",
                        "options": {
                            "tabs-left": "Top Left",
                            "tabs-center": "Top Center",
                            "tabs-right": "Top Right",
                            "tabs-bottom tabs-left": "Bottom Left",
                            "tabs-bottom tabs-center": "Bottom Center",
                            "tabs-bottom tabs-right": "Bottom Right",
                            "tabs-vertical-left": 'Vertical Left',
                            'tabs-vertical-right': 'Vertical Right'
                        },
                        "default_value": "tab-left"
                    },
                    "enable_icon": {
                        "type": "toggle",
                        "title": "Enable icon",
                        "default_value": 0
                    },
                    "icon_pos": {
                        "type": "select",
                        "title": "Icon pos",
                        "options": {
                            "left": "Left",
                            "right": "Right"
                        },
                        "default_value": "left"
                    }
                },
                "Custom_title": {
                    "type": "section",
                    "title": {
                        "type": "markup",
                        "markup": "<div class=\"name-title\"><h4>Tab title<\/h4><\/div>"
                    },
                    "title_align": {
                        "type": "select",
                        "title": "Align",
                        "options": {
                            "tabs-title-left": "Left",
                            "tabs-title-center": "Center",
                            "tabs-title-right": "Right"
                        },
                        "default_value": "tabs-title-left"
                    },
                    "title_color": {
                        "type": "toggle",
                        "title": "Enable custom title color",
                        "default_value": 0
                    },
                    "display_model_color": {
                        "type": "tabs",
                        "tabs": [{
                            "tab_title": "Normal",
                            "contents": {
                                "normal_color": {
                                    "type": "colorpicker",
                                    "title": "Text color",
                                    "options": {
                                        "preferredFormat"  : "rgb",
                                        "AlphaVerticle"  : true,
                                        "showAlpha"  : true,
                                        "allowEmpty" : true,
                                        "showInput" : true
                                    }
                                },
                                "normal_background_color": {
                                    "type": "colorpicker",
                                    "title": "Background color",
                                    "options": {
                                        "preferredFormat"  : "rgb",
                                        "AlphaVerticle"  : true,
                                        "showAlpha"  : true,
                                        "allowEmpty" : true,
                                        "showInput" : true
                                    }
                                }
                            }
                        }, {
                            "tab_title": "Hover",
                            "contents": {
                                "hover_color": {
                                    "type": "colorpicker",
                                    "title": "Text color",
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
                                    "title": "Background color",
                                    "options": {
                                        "preferredFormat"  : "rgb",
                                        "AlphaVerticle"  : true,
                                        "showAlpha"  : true,
                                        "allowEmpty" : true,
                                        "showInput" : true
                                    }
                                }
                            }
                        }, {
                            "tab_title": "Active",
                            "contents": {
                                "active_color": {
                                    "type": "colorpicker",
                                    "title": "Text color",
                                    "options": {
                                        "preferredFormat"  : "rgb",
                                        "AlphaVerticle"  : true,
                                        "showAlpha"  : true,
                                        "allowEmpty" : true,
                                        "showInput" : true
                                    }
                                },
                                "active_background_color": {
                                    "type": "colorpicker",
                                    "title": "Background color",
                                    "options": {
                                        "preferredFormat"  : "rgb",
                                        "AlphaVerticle"  : true,
                                        "showAlpha"  : true,
                                        "allowEmpty" : true,
                                        "showInput" : true
                                    }
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
                    },
                    animations: {
                        type: "animations"
                    }
                }
            };
        }
    });

    $(document).ready(function() {
        AWEContent.Controllers.tabs = new AWEContent.Views.TabsItemController();
        AWEContent.Panels.tabs = new AWEContent.Views.TabsPanel();
    });
})(jQuery);
