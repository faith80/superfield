/**
 * File: awecontent-drupal-field-item.js
 * Author: MegaDrupal
 * Website: http://megadrupal.com/
 */

(function($) {
    "use strict";

    /**
     * Define model for Drupal Field item
     */
    AWEContent.Models.DrupalFieldItem = AWEContent.Models.Item.extend({
        defaults: {
            machine_name: "drupal_field",
            nodeType: '',
            fieldName: '',
            lgResponsive: true,
            xsResponsive: true,
            mediumResponsive: true,
            smResponsive: true
        },
        createView: function() {
            this.view = new AWEContent.Views.DrupalFieldItem({model: this});
        },
        removePanelView: function() {
            AWEContent.Toolbars.drupal.showController('field-'+this.get('fieldName'));
            AWEContent.Models.Item.prototype.removePanelView.call(this);
        }
    });

    /**
     * Define View for DrupalFieldItem
     */
    AWEContent.Views.DrupalFieldItem = AWEContent.Views.Item.extend({
        renderItemContent: function() {
            var self = this,
                settings = this.model.toJSON();

            self.$el.addClass('awe-drupal-field-item');

            switch (this.model.get('fieldName')) {
                case 'invisible':
                    self.$el.prepend('<div class="awe-field-loaded">This field is used in another place on this page</div>').addClass('awe-item-unload');
                    break;

                default:
                    self.$el.prepend('<div class="awe-item-preload"></div>');
                    $.post(AWEContent.Path.drupalElementURL,
                        {
                            type: this.model.get('machine_name'),
                            nodeType: this.model.get('nodeType'),
                            fieldName: this.model.get('fieldName'),
                            formData: $('.awecontent-body-wrapper .node-form').serialize()
                        },
                        function(response) {
                            var fieldContent = response.fieldContent ? response.fieldContent :'<div class="ac-field-content">' + Drupal.t('Field content') + '</div>';

                            self.$el.prepend(fieldContent);
                            $('.awe-item-preload', self.$el).remove();

                            if (response.field_not_exist)
                                self.$el.addClass('awe-item-unload');
                            AWEContent.Toolbars.drupal.hideController('field-'+self.model.get('fieldName'));
                        }
                    );
                    break;
            }

            // render responsive settings
            if (!settings.xsResponsive)
                self.$el.addClass('xs-hidden');
            if (!settings.smResponsive)
                self.$el.addClass('sm-hidden');
            if (!settings.mediumResponsive)
                self.$el.addClass('md-hidden');
            self.$el.defaultResponsive(settings);
        }
    });

    /**
     * Define view for DrupalBlock Controller
     * li tag what is contained by items panel
     */
    AWEContent.Views.DrupalFieldController = AWEContent.Views.ItemController.extend({
        machineName : 'drupal_field',
        el: 'li.ac-dp-field',
        existingElement: true,
        createItemModel: function(templateData) {
            if (templateData != undefined) {
                var fieldClass = 'field-' + templateData.fieldName,
                    isLoadedField = $.inArray(fieldClass, AWEContent.Toolbars.drupal.loadedElements);

                if (isLoadedField > -1)
                    templateData.fieldName = 'invisible';

                return new AWEContent.Models.DrupalFieldItem(templateData);
            }

            return null;
        },
        applySettingsChanged: function(model) {
            var self = this;

            $.each(model.changedAttributes(), function(key, value) {
                self.$el.changeResponsive(key, value);
            });
        }
    });

    /**
     * Define drupal field panel
     */
    AWEContent.Views.DrupalFieldPanel = AWEContent.Views.ItemPanel.extend({
        panelName: "drupal_field",
        el: '#drupal-field-panel',
        className: "awe-obj-panel drupal-field-panel",
        initialize: function() {
            this.initialized = true;
            AWEContent.Views.ItemPanel.prototype.initialize.call(this);
            var self = this;

            $('form.node-form #edit-actions input').click(function() {
                $("input[type=submit]", $(this).parents("form")).removeAttr("clicked");
                $(this).attr('clicked', true);
            });

            $('form.node-form').submit(function(event) {
                if ($('#edit-actions input[clicked=true]', $(this)).attr('id') == 'edit-view-field') {
                    event.preventDefault();
                    self.getFieldContent($(this));
                }
            }).bind('getFieldContentSuccess', function(event, response) {
                self.editingModel.view.$el.children(':not(.awe-custom)').remove();
                self.editingModel.view.$el.prepend(response.fieldContent);

                if (response.field_not_exit)
                    self.$el.addClass('awe-item-unload');
                
                AWEContent.Toolbars.drupal.hideController('field-'+self.editingModel.get('fieldName'));
                $('.awe-item-preload', self.editingModel.view.$el).remove();
                self.closePanel();
            });
        },
        getFieldContent: function($form) {
            var self = this,
                fieldName = self.editingModel.get('fieldName'). replace(/_/g, '-'),
                $field = $('.field-name-' + fieldName, $form);

            if (!$field.data('second-load'))
                self.editingModel.view.$el.prepend('<div class="awe-item-preload"></div>');
            $.ajax({
                url: AWEContent.Path.drupalElementURL,
                type: 'POST',
                data: {
                    formData : $form.serialize(),
                    fieldName: self.editingModel.get('fieldName'),
                    type: 'drupal_field',
                    nodeType: $('#edit-actions input[clicked=true]', $form).data('node-type')
                },
                success: function(response) {
                    if (response.status) {
                        if ($('.ckeditor-mod', $field).length && !$field.data('second-load')) {
                            self.getFieldContent($form);
                            $field.data('second-load', 1);
                        }
                        else {
                            $form.trigger('getFieldContentSuccess', response);
                            $field.data('second-load', 0);
                        }
                    }
                    else
                        $('.ac-form-messages', self.$el).html(response.error);
                }
            });
        },
        initPanel: function() {
            $('<div class="ac-form-messages"></div>').insertAfter($('.md-section', this.$el).prev());
        },
        openPanel: function() {
            AWEContent.Views.ItemPanel.prototype.openPanel.call(this);

            var _self = this,
                $nodeForm = $('.node-form', this.$el),
                fieldName = this.editingModel.get('fieldName').replace(/_/g, '-');

            // add classes
            this.$el.addClass(this.className);

            // process form elements for field
            this.resetNodeForm($nodeForm);

            $('> div > .form-item, > div > .form-wrapper:not(.form-actions), .vertical-tabs, .awe-control-buttons', $nodeForm).hide();
            $('.field-name-' + fieldName, $nodeForm).show();
            $('#edit-actions input:not(#edit-view-field)', $nodeForm).hide();
            $('#edit-actions input#edit-view-field', $nodeForm).show();            
            this.$el.addClass('large-panel');
        },
        closePanel: function() {
            AWEContent.Views.ItemPanel.prototype.closePanel.call(this);

            this.$el.removeClass('large-panel');
            this.resetNodeForm($('form', this.$el));
        },
        resetNodeForm: function($form) {
            $('> div > .form-item, > div > .form-wrapper, .vertical-tabs, .awe-control-buttons', $form).show();
            $('#edit-actions input:not(#edit-view-field)', $form).show();
            $('#edit-actions input#edit-view-field', $form ).hide();
            $('.ac-form-messages', this.$el).html('');
        },
        buildPanel: function() {
            return {
                wrapper: {
                    type: 'section'
                }
            }
        }
    });

    $(document).ready(function() {
        AWEContent.Controllers.drupal_field = new AWEContent.Views.DrupalFieldController();
        AWEContent.Panels.drupal_field = new AWEContent.Views.DrupalFieldPanel();
    });
})(jQuery);
