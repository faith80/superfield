/**
 * File: awecontent-node-form.js
 * Author: MegaDrupal
 * Website: http://megadrupal.com/
 */
(function($) {
    'use strict';
    var builderActivated = false;

    // callback to show node form
    function showNodeForm() {
        $('body').removeClass('awecontent-active');
        $('.awecontent-body-wrapper').children().show();
        $('#drupal-field-panel .scrollbar').removeClass('obj-adjust scroll-bar');
        $('#drupal-field-panel').removeClass('awe-obj-panel')
    }

    // callback to hide node form
    function disableNodeForm() {
        $('body').addClass('awecontent-active');
        $('.awecontent-body-wrapper').children().hide();
        $('#drupal-field-panel').parents().show();
        $('#drupal-field-panel').addClass('awe-obj-panel');
        $('#drupal-field-panel .scrollbar').addClass('obj-adjust scroll-bar').perfectScrollbar();
    }

    // callback to initialize page builder
    function initializeBuilder(sectionsData) {
        if (!builderActivated) {
            // implements AWEContent Builder plugin
            $('body').awecontent({
                pageURL: AWEContent.Path.layoutURL,
                sections: sectionsData,
                sectionsWrapper: '#awe-section-wrapper',
                pageWrapper: Drupal.settings.acPageWrapper,
                sectionAlwaysFluid: $('#edit-ac-container-full-width').is(':checked') ? 1 : 0,
                closeBuilderCallback: function(builderData) {
                    // show node form
                    showNodeForm();

                    // save builderData
                    if (builderData) {
                        $('#edit-ac-content').val(JSON.stringify(builderData));
                        $('#edit-ac-status').prop('checked', true).trigger('change');
                    }
                }
            });

            // set flag define builder is initialized
            builderActivated = true;
        }
        else {
            // reset drupal loader elements list
            AWEContent.Toolbars.drupal.resetToolbar();

            // open builder width section data
            $('body').awecontent('openBuilder', sectionsData);
        }

        // disable node form
        disableNodeForm();
    }

    $(document).ready(function() {
        var pathConfigurations = $('input[name=path_config]').val().trim();

        // load path configuration
        if (pathConfigurations)
            AWEContent.Path = $.extend({}, AWEContent.Path, JSON.parse(pathConfigurations));

        // create page templates dialog
        AWEContent.pageTemplatesDialog = new AWEContent.Views.PageTemplateDialog();

        // Move all body children in to wrapper
        $('body').append('<div class="awecontent-body-wrapper"></div>');
        $('.awecontent-body-wrapper').append($('body').children(':not(.awecontent-body-wrapper, .sp-container)'));

        // Handle click button to active page builder
            $('a.ac-active-builder-btn').click(function(event) {
            event.preventDefault();

            // get sections data
            var sectionsData = $('#edit-ac-content').val().trim() ? JSON.parse($('#edit-ac-content').val().trim()) : [];

            // init page builder
            if (sectionsData.length == 0 && Drupal.settings.ac_has_page_template) {
                // create view for choose page template dialog
                AWEContent.pageTemplatesDialog.open();
            }
            else
                initializeBuilder(sectionsData);
        });

        // handle when pageTemplate dialog close to initialize builder
        AWEContent.pageTemplatesDialog.$el.bind('close', function(event, sectionsData) {
            initializeBuilder(sectionsData);
        });

        // handle change page builder status
        $('#edit-ac-status').change(function(event) {
            if ($(this).is(':checked'))
                $('a.ac-disable-builder-btn').show();
            else
                $('a.ac-disable-builder-btn').hide();
        }).trigger('change');

        // handle click to disable builder button
        $('a.ac-disable-builder-btn').click(function(event) {
            event.preventDefault();
            $('#edit-ac-status').prop('checked', false).trigger('change');
        });

        // Handle change on checkbox set container width
        $('#edit-ac-container-full-width').change(function() {
            if (builderActivated) {
                var alwaysFluid = $(this).is(':checked') ? 1 : 0;
                $('body').awecontent('option', 'sectionAlwaysFluid', alwaysFluid);
            }
        });
    });
})(jQuery);
