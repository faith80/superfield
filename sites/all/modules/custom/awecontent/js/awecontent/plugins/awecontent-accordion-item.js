/**
 * File: awecontent-accordion-item.js
 * Author: AWEThemes
 * Website: http://awethemes.com/
 */
(function($) {
    "use strict";

    AWEContent.Models.AccordionChildItem = Backbone.RelationalModel.extend({
        defaults : {
            'title' : '',
            'nameIcon' : 'ic ac-icon-done',
            'content' : []
        },
        //relations: [
        //    {
        //        type: Backbone.HasMany,
        //        key : 'content',
        //        relatedModel: AWEContent.Models.Column,
        //        relatedCollection: AWEContent.Collections.ListColumn
        //    }
        //],
        clone: function() {
            var column = new AWEContent.Collections.ListColumn();
            this.get('content').each( function( data) {
                column.add( data.clone());
            });
            return new AWEContent.Models.AccordionChildItem({
                nameIcon : this.get('nameIcon'),
                title : this.get('title'),
                content:  column
            });
        }
    });

    AWEContent.Views.AccordionChildItem = Backbone.View.extend({
        accordionTemplate : _.template(
            '<div class="group">\
                <div class="awe-custom custom-obj">\
                    <ul>\
                        <li class="awe-accordion-item-clone"><i class="ic ac-icon-clone"></i></li>\
                        <li class="awe-accordion-item-del"><i class="ic ac-icon-trash"></i></li>\
                        <li class="awe-accordion-item-move"><i class="ic ac-icon-move"></i></li>\
                    </ul>\
                </div>\
                <h3 class="title-accor">\
                    <span class="sign-toggle-accr"><i class="ic ac-icon-add"></i></span>\
                    <span class="icon-accr"><i class="<%= nameIcon %>"></i></span>\
                    <span class="title-accr" ><%= titleAccordion %></span>\
                </h3>\
                <div class="content-accor"></div>\
            </div>'
        ),
        render: function() {
            var accordionChild = new AWEContent.Views.ListColumn( {collection: this.model.get('content')});
            this.$el.append(accordionChild.$el);
            return accordionChild.$el;
        }
    });

    AWEContent.Collections.ListAccodionChildItem = Backbone.Collection.extend({
        model: AWEContent.Models.AccordionChildItem
    });

    AWEContent.Models.AccordionItem = AWEContent.Models.Item.extend({
        defaults: {
            machine_name: "accordion",

            expandIcon: 0,
            enableIcon: 0,
            iconName: 'ic ac-icon-done',
            iconPosition: 'accor-icon-left',
            toggleExpand: 0,
            enableCustomTitle : 1,
            titlePosition : 'accor-title-left',
            normalTextColor : '',
            normalBackgroundColor : '',
            hoverTextColor : '',
            hoverBackgroundColor : '',
            activeTextColor : '',
            activeBackgroundColor : '',
            margin : {},
            customID : '',
            customClass : '',
            customEnableAttributes: 0,
            customDataAttributes: '[] ', // Array Json ex : [{"attrName":"autoPlay","attrValue":"true"}]
            customActionAttributes : '{"newAction": "", "newAttrName": "", "newAttrValue": ""}',
            customEnableAnimations: 0,
            customDataAnimations: '{"type": "none"}', // Data Object
            lgResponsive: true,
            xsResponsive: true,
            mediumResponsive: true,
            smResponsive: true,
            accordion: []
        },
        relations: [
            {
                type: Backbone.HasMany,
                key: 'accordion',
                relatedModel: AWEContent.Models.AccordionChildItem,
                relatedCollection: AWEContent.Collections.ListAccodionChildItem,
                reverseRelation: {
                    key: 'accordionChildItem'
                }
            },
            {
                type: Backbone.HasOne,
                key: "margin",
                relatedModel: AWEContent.Models.BoxModelSettings
            }
        ],
        hasContentLayout: true,
        createView: function() {
            this.view = new AWEContent.Views.AccordionItem({model: this});
        },
        clone : function() {
            var cloneModel = {},
                listAccordion = new  AWEContent.Collections.ListAccodionChildItem();

            this.get('accordion').each( function(accordionChild) {
                listAccordion.add(accordionChild.clone());
            });
            $.each(this.toJSON(), function(key,value){
                if (key != 'accordion')
                    cloneModel[key] = value;
            });
            cloneModel.accordion = listAccordion;
            cloneModel.margin = new AWEContent.Models.BoxModelSettings(cloneModel.margin);
            return new AWEContent.Models.AccordionItem(cloneModel);
        },
        removePanelView: function () {
            AWEContent.Models.Item.prototype.removePanelView.call(this);

            this.get('accordion').each(function(modelChild) {
                modelChild.get('content').each(function(modelCol) {
                    modelCol.removePanelView();
                });
            });
        },
        getContentColumnModel: function($column, colID) {
            var $accordion = $column.parent().parent().parent(),
                accordionIndex = $accordion.index() - 1,
                accordionModel = this.get('accordion').at(accordionIndex);

            return accordionModel.get('content').at(colID);
        }
    });

    AWEContent.Views.AccordionItem = AWEContent.Views.Item.extend({
        colorStyle: _.template(
            '.<%= className %> > .group > .ui-accordion-header {\
                color: <%= normalColor %>;\
                background-color: <%= normalBgColor %>;\
            }\
            .<%= className %> > .group > .ui-accordion-header.ui-state-active {\
                color: <%= activeColor %>;\
                background-color: <%= activeBgColor %>;\
            }\
            .<%= className %> > .group > .ui-accordion-header:hover,\
            .<%= className %> > .group > .ui-accordion-header.ui-state-hover {\
                color: <%= hoverColor %>;\
                background-color: <%= hoverBgColor %>;\
            }'
        ),
        additionalEvents: {
            'click > .awe-accordion > .awe-add-accordion' : 'addAccordion',
            'click > .awe-accordion > .group > .awe-custom > ul > li.awe-accordion-item-del' : 'delAccordion',
            'click > .awe-accordion > .group > .title-accor > .icon-accr' : 'editIcon',
            'change > .awe-accordion > .group > .title-accor > .icon-accr' : 'editIcon',
            'click > .awe-accordion > .group > .awe-custom > ul > li.awe-accordion-item-clone': 'cloneAccordion',
            'click > .awe-accordion > .group >.title-accor' : 'resizeIframe'
        },
        initialize: function() {
            AWEContent.Views.Item.prototype.initialize.call(this);
            this.listenTo(this.model.get("margin"), "change", this.applySettingsChanged);

            var self = this;

            self.iframeJQuery(self.$el).delegate(".awe-accordion.awe-item", "itemReady", function() {
                self.iframeJQuery(self.$el).undelegate();

                var $accordion = self.iframeJQuery(this).accordion({
                        'header' : '>.group >h3',
                        heightStyle : 'content',
                        collapsible: true,
                        activate : function(event, ui){
                        },
                        create : function(event, ui){
                            $(ui.header).find('.sign-toggle-accr > i').removeClass('ic ac-icon-add').addClass('ic ac-icon-minus');
                        },
                        beforeActivate: function(event, ui) {
                            var isToggle = self.model.get('toggleExpand');
                            if (isToggle) {
                                var currHeader, currContent, isPanelSelected;
                                if (ui.newHeader[0]) {
                                    currHeader  = ui.newHeader;
                                    currContent = currHeader.next('.ui-accordion-content');
                                } else {
                                    currHeader  = ui.oldHeader;
                                    currContent = currHeader.next('.ui-accordion-content');
                                }
                                isPanelSelected = currHeader.attr('aria-selected') == 'true';
                                currHeader.toggleClass('ui-corner-all',isPanelSelected).toggleClass('accordion-header-active ui-state-active ui-corner-top',!isPanelSelected).attr('aria-selected',((!isPanelSelected).toString()));
                                currHeader.children('.ui-icon').toggleClass('ui-icon-triangle-1-e',isPanelSelected).toggleClass('ui-icon-triangle-1-s',!isPanelSelected);
                                currContent.toggleClass('accordion-content-active',!isPanelSelected);
                                if (isPanelSelected) { currContent.slideUp(); }  else { currContent.slideDown(); }
                                return false;
                            }
                        }
                    }),
                    beforeSortIndex;
                self.iframeJQuery(this).sortable({
                    axis: "y",
                    items: "> .group",
                    handle: '.awe-custom .awe-accordion-item-move',
                    start: function(event, ui) {
                        beforeSortIndex = ui.item.index();
                    },
                    stop: function(event, ui) {
                        var afterSortIndex = ui.item.index(),
                            accordion = self.model.get("accordion"),
                            sortedAccordion = accordion.remove(accordion.at(beforeSortIndex-1));
                        accordion.add(sortedAccordion, {at: afterSortIndex-1, silent: true});
                        $accordion.accordion("refresh");
                    }
                });
                self.editTitleAccordion(true);
                AWEContent.Panels.toolbarPanel.updateSortableColumn();
            });
        },
        renderItemContent: function() {
            var self = this,
                settings = self.model.toJSON(),
                $accordion = $(
                    '<div class="awe-accordion awe-item">\
                        <style></style>\
                        <div class="awe-add-accordion">\
                            <div><i class="ic ac-icon-add"></i></div>\
                        </div>\
                    </div>'
                );

            $accordion.addClass('awe-accordion-' + self.cid);
            self.classAccordion = 'awe-accordion-' + self.cid;
            self.totalAccordion = self.model.get('accordion').length;
            self.model.get("accordion").each(function( acdChild, accordionChildIndex) {
                var accordionChild = new AWEContent.Views.AccordionChildItem({model: acdChild}),
                    titleAccordion = 'Accordion ' + (accordionChildIndex + 1) ,
                    nameIcon = accordionChild.model.get('nameIcon'),
                    $tempAccordion;

                titleAccordion =  accordionChild.model.get('title') !='' ? accordionChild.model.get('title') : titleAccordion;
                $tempAccordion = $(accordionChild.accordionTemplate({titleAccordion : titleAccordion, nameIcon: nameIcon}));
                accordionChild.model.set('title', titleAccordion);

                // Render accordion  content
                $('.content-accor', $tempAccordion).append(accordionChild.render());
                $('>.awe-add-accordion',$accordion).before($tempAccordion);
            });

            // Render Settings default
            if (settings.expandIcon)
                $accordion.addClass('accor-expand-icon');
            if (settings.enableIcon)
                $accordion.addClass('accor-icon-enable');
            $accordion.addClass(settings.iconPosition + ' ' + settings.titlePosition);

            // generate color style
            if (settings.enableCustomTitle) {
                var colorSettings = {
                    normalColor: settings.normalTextColor,
                    normalBgColor: settings.normalBackgroundColor,
                    activeColor: settings.activeTextColor,
                    activeBgColor: settings.activeBackgroundColor,
                    hoverColor: settings.hoverTextColor,
                    hoverBgColor: settings.hoverBackgroundColor,
                    className: self.classAccordion
                };
                $('> style', $accordion).html(self.colorStyle(colorSettings));
            }
            $accordion.renderItemDefaultBoxModel(settings.margin);
            $accordion.attr('id', settings.customID).addClass(settings.customClass);
            $accordion.renderItemDefaultAttributes(settings.customEnableAttributes, settings.customDataAttributes);
            if (settings.customEnableAnimations)
                $accordion.processAnimations(settings.customDataAnimations)
            if (!settings.xsResponsive)
                self.$el.addClass('xs-hidden');
            if (!settings.smResponsive)
                self.$el.addClass('sm-hidden');
            if (!settings.mediumResponsive)
                self.$el.addClass('md-hidden');
            self.$el.defaultResponsive(settings);

            // Check enable module icon
            if (!Drupal.settings.enable_icon)
                $accordion.removeClass('accor-icon-enable');

            return $accordion ;
        },
        applySettingsChanged: function(model) {
            var self = this,
                settings = self.model.toJSON(),
                $accordion = $('> .awe-accordion', this.el),
                $iconTitle = $('>.awe-accordion >.group >.title-accor >.icon-accr', self.el),
                $extendIcon = $('>.awe-accordion >.group >.title-accor >.sign-toggle-accr', self.el),
                tabStyle, prevClass,
                heightBefore = self.$el.height();

            $.each(model.changedAttributes(), function(key, value) {
                self.$el.changeResponsive(key, value);
                $accordion.renderChangeSettingBoxModel(key, value, model);
                switch (key) {
                    case 'expandIcon':
                        value ? $accordion.addClass('accor-expand-icon') : $accordion.removeClass('accor-expand-icon');
                        break;

                    case 'enableIcon':
                        value ? $accordion.addClass('accor-icon-enable') : $accordion.removeClass('accor-icon-enable');
                        break;

                    case 'iconName':
                        $('>i', $iconTitle).removeClass().addClass(value);
                        break;

                    case 'iconPosition':
                        var prevPos = self.model.previousAttributes().iconPosition;
                        $accordion.removeClass(prevPos).addClass(value);
                        break;

                    case 'enableCustomTitle':
                        var colorSettings = {
                                normalColor: settings.normalTextColor,
                                normalBgColor: settings.normalBackgroundColor,
                                activeColor: settings.activeTextColor,
                                activeBgColor: settings.activeBackgroundColor,
                                hoverColor: settings.hoverTextColor,
                                hoverBgColor: settings.hoverBackgroundColor,
                                className: self.classAccordion
                            },
                            style = value ? self.colorStyle(colorSettings) : '';

                        $('> style', $accordion).html(style)
                        break;

                    case 'titlePosition':
                        var prevTitle = self.model.previousAttributes().titlePosition;
                        $accordion.removeClass(prevTitle).addClass(value);
                        break;

                    case 'normalTextColor':
                        $('.ui-accordion-header:not(.ui-state-active) span.title-accr', self.$el).css('color', value);
                        self.generateStyle();
                        break;

                    case 'normalBackgroundColor':
                        $('.ui-accordion-header:not(.ui-state-active)', self.$el).css('background-color', value);
                        self.generateStyle();
                        break;

                    case 'hoverTextColor':
                    case 'hoverBackgroundColor':
                        self.generateStyle();
                        break;

                    case 'activeTextColor':
                        $('.ui-accordion-header.ui-state-active span.title-accr', self.$el).css('color', value);
                        self.generateStyle();
                        break;

                    case 'activeBackgroundColor':
                        $('.ui-accordion-header.ui-state-active', self.$el).css('background-color', value);
                        self.generateStyle();
                        break;

                    case 'customID':
                        $accordion.attr('id', value);
                        break;

                    case 'customClass':
                        prevClass = self.model.previousAttributes().customClass;
                        $accordion.removeClass((prevClass)).addClass(value);
                        break;

                    case 'customEnableAttributes':
                        $accordion.renderChangeSettingsAttributes(key, value, settings.customDataAttributes);
                        break;

                    case 'customActionAttributes':
                        $accordion.renderChangeSettingsAttributes(key, value);
                        break;

                    case 'customEnableAnimations':
                        var animation, prevAnimation;
                        if (value) {
                            animation = settings.customDataAnimations;
                            prevAnimation = null;
                            $accordion.processAnimations(animation);
                        }
                        else {
                            animation = null;
                            prevAnimation = settings.customDataAnimations;
                            $accordion.processAnimations(animation, prevAnimation);
                        }
                        break;

                    case 'customDataAnimations':
                        $accordion.processAnimations(settings.customDataAnimations, self.model.previousAttributes().customDataAnimations);
                        break;

                    case 'accordion':
                        break;
                }
            });

            // Listen event change height of item
            setTimeout(function() {
                self.checkChangeHeight(heightBefore);
            }, 50);
        },
        addAccordion : function() {
            this.totalAccordion ++;
            var self = this,
                boxModelColumn = new AWEContent.Models.BoxModelSettings(),
                column = new AWEContent.Models.Column({
                    items: new AWEContent.Collections.ListItem(),
                    settings: new AWEContent.Models.ColumnSettings({boxModelSettings: boxModelColumn}),
                    classes: new AWEContent.Models.BootstrapGrid()
                }),
                accordionChildItem = new AWEContent.Models.AccordionChildItem({content: new AWEContent.Collections.ListColumn([column])}),
                accordionChildCView = new AWEContent.Views.AccordionChildItem({model: accordionChildItem}),
                titleAccordion = 'Accordion ' + this.totalAccordion,
                nameIcon = accordionChildItem.get('nameIcon'),
                $tempAccordion = $(accordionChildCView.accordionTemplate({titleAccordion : titleAccordion, nameIcon: nameIcon})),
                $htmlChild = accordionChildCView.render();

            accordionChildCView.model.set('title', titleAccordion);
//            if (!this.model.get('enableIcon')){
//                $('.icon-accr', $tempAccordion).hide();
//            }
//            else {
//                $('.icon-accr', $tempAccordion).show();
//            }
            this.model.get("accordion").add(accordionChildItem, {silent: true});
            $("> .awe-accordion > .awe-add-accordion", this.$el).before($tempAccordion);
            $('> .content-accor', $tempAccordion).append($htmlChild);
            self.processAccordionActive();
            self.editTitleAccordion();
            AWEContent.Panels.toolbarPanel.updateSortableColumn();

            // Resize Item
            this.resizeItem();
        },
        delAccordion : function(event) {
            var $targetItem = $(event.target).hasClass('awe-accordion-item-edit') ? $(event.target) : $(event.target).parent(),
                $group = $targetItem.parent().parent().parent(),
                indexItem = $group.index() -1,
                modelAccordionChild = this.model.get('accordion').at(indexItem);
            if (modelAccordionChild.get('content') != undefined){
                modelAccordionChild.get('content').each( function(columnModel, idCol){
                    columnModel.removePanelView();
                });
            }

            $group.remove();
            modelAccordionChild.destroy();
            this.model.get('accordion').remove(modelAccordionChild);
            this.processAccordionActive();

            // Resize Item
            this.resizeItem();
        },
        cloneAccordion: function(event) {
            this.totalAccordion++;
            var self = this,
                $target = $(event.target),
                $group = $target.closest('.group'),
                indexAccordion = $group.index() - 1,
                modelAccordion = self.model.get('accordion').at(indexAccordion),
                cloneModel = modelAccordion.clone(),
                titleAccordion = cloneModel.get('title') + ' Clone',
                nameIcon = cloneModel.get('nameIcon'),
                accordionChildCView = new AWEContent.Views.AccordionChildItem({model: cloneModel}),
                $tempAccordion = $(accordionChildCView.accordionTemplate({titleAccordion : titleAccordion, nameIcon: nameIcon})),
                $htmlChild =  accordionChildCView.render();

            accordionChildCView.model.set('title', titleAccordion);
            this.model.get("accordion").add(cloneModel, {silent: true});
            $("> .awe-accordion > .awe-add-accordion", this.$el).before($tempAccordion);
            $('> .content-accor', $tempAccordion).append($htmlChild);
            self.processAccordionActive();
            self.editTitleAccordion();
            AWEContent.Panels.toolbarPanel.updateSortableColumn();

            // Resize Item
            this.resizeItem();
        },
        processAccordionActive: function(){
            var self = this,
                $headerActive = self.iframeJQuery(" > .awe-accordion", self.iframeJQuery(self.el)).find('> .group > .ui-state-active').eq(0),
                arrActive = [], indexActive;

            indexActive = $headerActive.parent().index() -1;
            self.iframeJQuery(" > .awe-accordion", self.iframeJQuery(self.el)).accordion("refresh");
            self.iframeJQuery(" > .awe-accordion", self.iframeJQuery(self.el)).find('> .group > .ui-state-active').next().show();
            if (indexActive !=0) {
                var $header = self.iframeJQuery(" > .awe-accordion", self.iframeJQuery(self.el)).find('> .group > .ui-accordion-header').eq(0),
                    $panel = $header.next();
                $header.removeClass('ui-state-active');
                $panel.hide();
            }
        },
        editIcon: function(event,data){
            var $controller = $(event.target).hasClass('icon-accr') ? $(event.target) : $(event.target).parent(),
                prevIcon,modelAccordion, indexAccordion;

            indexAccordion = $controller.closest('.group').index() -1;
            modelAccordion = this.model.get('accordion').at(indexAccordion);
            if (event.type =='click') {
                $controller.attr('data-name-icon', modelAccordion.get('nameIcon'));
                AWEContent.Panels.listIconPanel.processIcon($controller, {name :'accordion'});
            }
            if (event.type == 'change') {
                modelAccordion.set('nameIcon', data.nameIcon);
                // Set Icon for Element
                prevIcon = modelAccordion.previousAttributes().nameIcon;
                $('> i',$controller).removeClass(prevIcon).addClass(data.nameIcon);
            }
        },
        editTitleAccordion : function(isTotal){
            var self = this, indexAccordion, modelAccordion, title,
                extend = ':last';

            if (isTotal == true)
                extend = '';

            self.iframeJQuery(">.awe-accordion >.group >.title-accor >.title-accr" + extend, self.iframeJQuery(self.$el))
                .keydown( function(event){
                    event.stopPropagation();
                })
                .click( function(event){
                    event.preventDefault();
                    event.stopPropagation();
                    $(this).attr('contenteditable', 'true');
                    $(this).focus();

                })
                .focusin( function(event){
                    indexAccordion = $(this).parent().parent().index() - 1;
                    modelAccordion = self.model.get('accordion').at(indexAccordion);
                    title = modelAccordion.get('title');
                    $(this).text(title);

                })
                .focusout( function(event){
                        indexAccordion = $(this).parent().parent().index() - 1;
                        modelAccordion = self.model.get('accordion').at(indexAccordion);
                        title = $(this).text();
                        modelAccordion.set('title', title);
                        $(this).html(title);
                    $(this).attr('contenteditable', 'false')
                });
        },
        resizeIframe : function(event) {
            var self = this,
                $header = $(event.target).hasClass('.title-accor') ?  $(event.target) :  $(event.target).closest('.title-accor'),
                $expandIcon = $('.sign-toggle-accr', $header),
                $iconPlus = '<i class="ic ac-icon-add"></i>',
                $iconMinus = '<i class="ic ac-icon-minus"></i>';

            $.each($('>.awe-accordion >.group >.title-accor', self.el), function(index, header){
               if (!$(header).hasClass('ui-state-active')){
                   $('.sign-toggle-accr', header).children().remove();
                   $('.sign-toggle-accr', header).append($iconPlus)
               }
            });
            $expandIcon.children().remove();
            if ($header.hasClass('ui-state-active'))
                $expandIcon.append($iconMinus);
            else
                $expandIcon.append($iconPlus);

            var count = 0,
                interval = setInterval(function() {
                    var accordionHeight =  AWEContent.iframe.find('html').outerHeight(),
                        iframeHeight = AWEContent.iframe.height();

                    if (accordionHeight > iframeHeight)
                        self.resizeItem();

                    count++;
                    if (count > 10)
                        clearInterval(interval);
            }, 50);
        },
        generateStyle: function() {
            var self = this,
                settings = this.model.toJSON();

            if (self.updateColor)
                clearTimeout(self.updateColor);

            self.updateColor = setTimeout(function() {
                var colorSettings = {
                    normalColor: settings.normalTextColor,
                    normalBgColor: settings.normalBackgroundColor,
                    activeColor: settings.activeTextColor,
                    activeBgColor: settings.activeBackgroundColor,
                    hoverColor: settings.hoverTextColor,
                    hoverBgColor: settings.hoverBackgroundColor,
                    className: self.classAccordion
                };

                // update style color
                $('.awe-accordion > style', self.$el).html(self.colorStyle(colorSettings));

                // clear inline style for all color
                $('span.title-accr', self.$el).css('color', '');
                $('.ui-accordion-header', self.$el).css('background-color', '');

                // clear timeout
                self.updateColor = false;
            }, 100);
        }
    });

    AWEContent.Views.AccordionItemController = AWEContent.Views.ItemController.extend({
        machineName : 'accordion',
        controllerHtml: function() {
            return '<div class="title-icon">Accordion</div><i class="ic ac-icon-accordion"></i>';
        },
        createItemModel: function(templateData) {
            if (templateData) {
                var accordion = new AWEContent.Collections.ListAccodionChildItem();
                templateData.margin = new AWEContent.Models.BoxModelSettings(templateData.margin);

                $.each(templateData.accordion, function(index, accordionChild){
                    var columns = new AWEContent.Collections.ListColumn();
                    $.each(accordionChild.content, function(index, columnData) {
                        var columnModel = AWEContent.createColumnFromTemplate(columnData);
                        columns.add(columnModel);
                    });
                    accordionChild.content = columns;
                    delete accordion.accordionChildItem;

                    accordion.add(new AWEContent.Models.AccordionChildItem(accordionChild));
                });
                templateData.accordion = accordion;

                return new AWEContent.Models.AccordionItem(templateData);
            }
            else {
                var boxModelColumn = new AWEContent.Models.BoxModelSettings(),
                    column = new AWEContent.Models.Column({
                        items: new AWEContent.Collections.ListItem(),
                        settings: new AWEContent.Models.ColumnSettings({ boxModelSettings: boxModelColumn}),
                        classes: new AWEContent.Models.BootstrapGrid()
                    }),
                    accordionItem = new AWEContent.Models.AccordionChildItem({content: new AWEContent.Collections.ListColumn([column])}),
                    margin = new AWEContent.Models.BoxModelSettings();
                return new AWEContent.Models.AccordionItem({accordion: new AWEContent.Collections.ListAccodionChildItem(accordionItem), margin : margin});
            }
        }
    });

    AWEContent.Views.AccordionPanel = AWEContent.Views.ItemPanel.extend({
        tagName: "div",
        className: "awe-obj-panel panel-accordion",
        panelName: "accordion",
        initPanel: function() {
            AWEContent.Views.ItemPanel.prototype.initPanel.call(this);
            var self = this;

            $('#accordion-collapse-icon input', self.el).change(function(event, isPanel){
                if (!isPanel){
                    self.editingModel.set('expandIcon', parseInt($(this).val()));
                }
            });
            $('#accordion-enable-icon input', self.el).change(function(event, isPanel){
                if (parseInt($(this).val())){
                    $(this).closest('.toggle-enable').next().show();
                }
                else {
                    $(this).closest('.toggle-enable').next().hide();
                }
                if (!isPanel){
                    self.editingModel.set('enableIcon', parseInt($(this).val()));
                }
            });
            $('#accordion-icon-pos', self.el).change(function(event, values){
                self.editingModel.set('iconPosition', values.value);
            });
            $('#accordion-toggle input', self.el).change(function(event, isPanel){
                if (!isPanel){
                    self.editingModel.set('toggleExpand', parseInt($(this).val()));
                }
            });
            $('#accordion-title-color input',self.el).change(function(event, isPanel){
                if (parseInt($(this).val()))
                    $(this).closest('.toggle-enable').nextAll().show();
                else
                    $(this).closest('.toggle-enable').nextAll().hide();
                if (!isPanel)
                    self.editingModel.set('enableCustomTitle', parseInt($(this).val()));
            });
            $('#accordion-title-align', self.el).change( function(event, values){
                self.editingModel.set('titlePosition', values.value);
            });
            $('#accordion-normal-color', self.el).change(function(event, color) {
                color = color ? color.toRgbString() : '';
                self.editingModel.set('normalTextColor', color);
            });
            $('#accordion-normal-background-color', self.el).change( function(event, color) {
                color = color ? color.toRgbString() : '';
                self.editingModel.set('normalBackgroundColor', color);
            });
            $('#accordion-hover-color', self.el).change(function(event, color) {
                color = color ? color.toRgbString() : '';
                self.editingModel.set('hoverTextColor', color);
            });
            $('#accordion-hover-background-color', self.el).change(function(event, color) {
                color = color ? color.toRgbString() : '';
                self.editingModel.set('hoverBackgroundColor', color);
            });
            $('#accordion-active-color', self.el).change( function(event, color) {
                color = color ? color.toRgbString() : '';
                self.editingModel.set('activeTextColor', color);
            });
            $('#accordion-active-background-color', self.el).change( function(event, color) {
                color = color ? color.toRgbString() : '';
                self.editingModel.set('activeBackgroundColor', color);
            });
            $('#accordion-column-box-model', self.el).initBoxModelPanel(self, 'margin');
            $('#text-accordion-custom-id', self.el).change( function(){
                self.editingModel.set('customID', $(this).val());
            });
            $('#text-accordion-custom-class', self.el).change( function(){
                self.editingModel.set('customClass', $(this).val());
            });
            $('#accordion-custom-attributes', this.el).initAttributesPanel(self);
            $('#accordion-animations input[name=enabled_custom_animation]', this.el).change(function(event, data) {
                self.editingModel.set('customEnableAnimations', parseInt($(this).val()));
                if (data) {
                    self.editingModel.set('customDataAnimations', JSON.stringify(data.animations));
                }
            });
        },
        setPanelElementsValue: function() {
            var self = this,
                settings = this.editingModel.toJSON();

            $('#accordion-collapse-icon input', self.el).val(settings.expandIcon).trigger('change', {isPanel:true});
            if (!Drupal.settings.enable_icon)
                $('#accordion-enable-icon, #accordion-icon-pos', self.el).remove();
            else {
                $('#accordion-enable-icon input', self.el).val(settings.enableIcon).trigger('change', {isPanel:true});
                $('#accordion-icon-pos', self.el).aweSelect('value', settings.iconPosition);
            }
            $('#accordion-toggle input', self.el).val(settings.toggleExpand).trigger('change', {isPanel:true});
            $('#accordion-title-color input', self.el).val(settings.enableCustomTitle).trigger('change', {isPanel: true});
            $('#accordion-title-align', self.el).aweSelect('value', settings.titlePosition);
            $('#accordion-normal-color', self.el).aweColorPicker('value',settings.normalTextColor);
            $('#accordion-normal-background-color', self.el).aweColorPicker('value',settings.normalBackgroundColor);
            $('#accordion-hover-color', self.el).aweColorPicker('value',settings.hoverTextColor);
            $('#accordion-hover-background-color ', self.el).aweColorPicker('value',settings.hoverBackgroundColor);
            $('#accordion-active-color', self.el).aweColorPicker('value',settings.activeTextColor);
            $('#accordion-active-background-color', self.el).aweColorPicker('value',settings.activeBackgroundColor);
            $('#accordion-column-box-model', self.el).initBoxModel(settings.margin);
            $('#text-accordion-custom-id', self.el).val(settings.customID);
            $('#text-accordion-custom-class', self.el).val(settings.customClass);
            $('#accordion-custom-attributes', this.el).initAttributes(settings.customEnableAttributes, settings.customDataAttributes);
            $('#accordion-animations input[name=enabled_custom_animation]', this.el).val(settings.customEnableAnimations).trigger('change');
            $('#accordion-animations input[name=enabled_custom_animation]', this.el).attr('data-animations', settings.customDataAnimations).data('view', this.editingModel.view);
        },
        buildPanel: function() {
            return {
                "title": {
                    "type": "markup",
                    "markup": "<div class=\"awe-title\"><h2>Accordion<\/h2><\/div>"
                },
                "custom_icon": {
                    "type": "section",
                    "collapse_icon": {
                        "type": "toggle",
                        "title": "Expand\/Collapse icon",
                        "default_value": 0
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
                            "accor-icon-left": "Left",
                            "accor-icon-center": "Center",
                            "accor-icon-right": "Right"
                        },
                        "default_value": "accor-icon-right"
                    },
                    'toggle' : {
                        "type": "toggle",
                        "title": "Toggle",
                        "default_value": 0
                    }
                },
                "Custom_title": {
                    "type": "section",
                    "title": {
                        "type": "markup",
                        "markup": "<div class=\"name-title\"><h4>Accordion Title<\/h4><\/div>"
                    },
                    "title_align": {
                        "type": "select",
                        "title": "Align",
                        "options": {
                            "accor-title-left": "Left",
                            "accor-title-center": "Center",
                            "accor-title-right": "Right"
                        },
                        "default_value": "accor-title-left"
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
                        "tabs": [ {
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
        AWEContent.Controllers.accordion = new AWEContent.Views.AccordionItemController();
        AWEContent.Panels.accordion = new AWEContent.Views.AccordionPanel();
    });
})(jQuery);
