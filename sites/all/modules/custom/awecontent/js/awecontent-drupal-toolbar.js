/**
 * File: awecontent-drupal-toolbar.js
 */
(function($) {
    'use strict';

    /**
     * Define Drupal toolbar class
     */
    AWEContent.Views.DrupalToolbar = AWEContent.Views.Toolbar.extend({
        id: 'drupal-elements',
        template: _.template(
            '<div class="obj-adjust">\
                <div class="awe-element-filter select-list toggle-drop">\
                    <div class="list-item">\
                        <div class="crr-item">\
                            <span class="dis-change">All<span class="ati-quantity"></span></span>\
                            <i class="ic ac-icon-arrow-down"></i><input type="hidden" value="template-all" name="selected_value">\
                        </div>\
                        <ul class="content-drop">\
                            <li class="select-template" data-value="*">All<span class="ati-quantity"></span></li>\
                            <li class="select-template" data-value="fields">Fields <span class="ati-quantity"></span></li>\
                        </ul>\
                    </div>\
                </div>\
                <div class="awe-drupal-items scroll-bar"><ul class="all-element"></ul></div>\
            </div> '
        ),
        filterItemTemplate: _.template(
            '<li class="select-template" data-value="<%= module %>">\
                <%= moduleName %> Module <span class="ati-quantity">(<%= blockQuantity %>)</span>\
            </li>'
        ),
        itemTemplate: _.template(
            '<li class="item-element ac-dp-<%= type %> <%= module %>" data-type="drupal_<%= type %>">\
                <span><%= name %></span>\
            </li>'
        ),
        loadedElements: [],
        initToolbar: function () {
            // init parent method
            AWEContent.Views.Toolbar.prototype.initToolbar.call(this);

            // implements render toolbar content
            this.getToolbarContent();
        },
        renderController: function () {
            return '<a href="#drupal-elements"><i class="ic ac-icon-drupal"></i>Drupal</a>';
        },
        render: function () {
            this.$el.append(this.template());
        },
        getToolbarContent: function() {
            var self = this,
                formID = $('.awecontent-body-wrapper input[name=form_id]').val(),
                nodeType = formID ? formID.trim().replace('_node_form', '') : '';

            // get blocks and fields info
            $.post(AWEContent.Path.drupalElementURL,{type: 'drupal_elements_controller', node_type: nodeType}, function(response) {
                if (response.status) {
                    // add blocks controller
                    $.each(response.data.blocks, function(machineName, module) {
                        // add module filter
                        $('ul.content-drop', self.$el).append(self.filterItemTemplate({moduleName: module.name, blockQuantity: this.blocks.length, module: machineName}));

                        // add block item controller
                        $.each(module.blocks, function() {
                            var blockData = JSON.stringify({delta: this.delta, module: this.module, info: this.info}),
                                $blockController = $(self.itemTemplate({module: this.module, name: this.info, type: 'block'}));

                            $blockController.addClass(this.module +'-'+this.delta).attr('data-template', blockData);
                            $('ul.all-element', self.$el).append($blockController);
                        });
                    });

                    // add fields controller
                    $('.content-drop li[data-value=fields] span.ati-quantity', self.$el).text('(' + Object.keys(response.data.fields).length +')');
                    $.each(response.data.fields, function() {
                        var fieldData = JSON.stringify({fieldName: this.field_name, nodeType: this.bundle, entityType: this.entity_type}),
                            $fieldController = $(self.itemTemplate({module: 'fields', name: this.label, type: 'field'}));

                        $fieldController.addClass('field-'+this.field_name).attr('data-template', fieldData);
                        $('ul.all-element', self.$el).append($fieldController);
                    });

                    // init filter
                    $('.select-list', self.$el).aweSelect().bind('change', function () {
                        var selected = $('input[name=selected_value]', $(this)).val();

                        $('li.item-element', self.$el).show();
                        if (selected != '*')
                            $('li.item-element:not(.' + selected + ')', self.$el).hide();

                        // update perfect scrollbar
                        $(".scroll-bar", self.$el).perfectScrollbar('update');
                    });

                    // init to drag shortcode controllers
                    $('ul.all-element', self.$el).mouseenter(function () {
                        var currentHeight = AWEContent.contentIframe.height(),
                            scrollTop = AWEContent.contentIframe.scrollTop();

                        $('.awecontent-wrapper').height(currentHeight);
                        $(window).scrollTop(scrollTop);
                    });

                    $("ul.all-element > li.item-element", self.$el).draggable({
                        iframeFix: true,
                        refreshPositions: true,
                        helper: 'clone',
                        start: function (event, ui) {
                            $(".scroll-bar", self.$el).addClass("position-default");
                            ui.helper.css("z-index", 9999);
                        },
                        stop: function (event, ui) {
                            $(".scroll-bar", self.$el).removeClass("position-default");
                        }
                    });

                    // init scroll bar for list controller
                    $(".scroll-bar", self.$el).perfectScrollbar().scroll(function() {
                        var $ps_container = $(this),
                            offsetTop = parseInt($('.ps-scrollbar-y-rail', $ps_container).css('top'));

                        $('li.item-element:not(.ui-draggable-dragging, .ui-sortable-helper)', $ps_container).draggable('option', 'cursorAt', {top: offsetTop})
                    }).trigger('scroll');

                    // hide all element which is loaded
                    $.each(self.loadedElements, function() {
                        $('li.item-element.'+this, self.$el).addClass('loaded').attr('style', '');
                    });

                    $(window).resize(function(){
                        AWEContent.iframe.height($(window).height());
                    }).trigger('resize');
                    AWEContent.Panels.toolbarPanel.updateSortableColumn();
                }
            });
        },
        hideController: function(className) {
            this.loadedElements.push(className);
            if (this.initialized)
                $('li.item-element.' + className, this.$el).addClass('loaded').removeAttr('style');
        },
        showController: function(className) {
            this.loadedElements.splice($.inArray(className, this.loadedElements), 1);

            if (this.initialized)
                $('li.item-element.' + className, this.$el).removeClass('loaded');
        },
        resetToolbar: function() {
            this.loadedElements = [];
            $('li.item-element.loaded', this.$el).removeClass('loaded');
        }
    });

    // create DrupalToolbar object
    $(document).ready(function () {
        AWEContent.Toolbars.drupal = new AWEContent.Views.DrupalToolbar();
    });
})(jQuery);
