/**
 * File: awecontent-template-manage.js
 * Author: MegaDrupal
 * Website: http://megadrupal.com/
 */
(function($) {
    'use strict';
    var initializedBuilder = false,
        $editingTemplate = null;

    function closeBuilder() {
        $('.awecontent-body-wrapper').show();
        $('body').awecontent('disable').removeClass('awecontent-active');
    }

    function openBuilder(sectionsData) {
        AWEContent.templateType = Drupal.settings.aweTemplateType;

        // init builder
        if (!initializedBuilder) {
            // init builder
            $('body').awecontent({
                pageURL: AWEContent.Path.layoutURL,
                sections: sectionsData,
                sectionsWrapper: '#awe-section-wrapper',
                pageWrapper: 'body',
                sectionAlwaysFluid: Drupal.settings.sectionsFullWidth,
                disableAuto: false,
                closeBuilderCallback: function(builderData) {
                    if (builderData) {
                        var template = $editingTemplate ? JSON.parse($('.ac-template-data', $editingTemplate).val().trim()) : {title: ''};

                        // prepare template data
                        if (Drupal.settings.aweTemplateType == 'section') {
                            AWEContent.templateDialog.savedElement = $('.awe-section:eq(0)', AWEContent.sectionsView.$el);
                            template.data = builderData[0];
                        }
                        else {
                            AWEContent.templateDialog.savedElement = AWEContent.sectionsView.$el;
                            template.data = builderData;
                        }

                        // show save dialog
                        AWEContent.templateDialog.open(template);
                    }
                    else
                        closeBuilder();
                }
            });

            // set flag builder is activated
            initializedBuilder = true;
        }
        else
            $('body').awecontent('openBuilder', sectionsData);

        // hide body wrapper
        $('.awecontent-body-wrapper').hide();
        $('body').addClass('awecontent-active');

        // handle when builder open
        $(window).bind('aweBuilderOpen', function(event) {
            if (Drupal.settings.aweTemplateType == 'section') {
                AWEContent.iframe.contents().find('div.add-section').remove();
                AWEContent.Toolbars.template.allowDragTemplate = false;
                AWEContent.iframe.contents().find('body').addClass('awe-build-section');
            }
        });
    }

    function addTemplateItem(templateData, addedByLoadMore) {
        // create new template item
        var template = _.template(
                '<div class="ac-tpl-item">\
                    <div class="template-item">\
                        <div class="template-preview">\
                            <a href="#" class="prvimg"><img alt="" src="<%= template.thumbnail %>"></a>\
                            <ul class="template-control">\
                                    <li class="delete-control"><a href="#"><i class="ic ac-icon-trash"></i></a></li>\
                                    <li class="copy-control"><a href="#"><i class="ic ac-icon-clone"></i></a></li>\
                                    <li class="edit-control"><a href="#"><i class="ic ac-icon-edit"></i></a></li>\
                                    <% if (type == "section") { %>\
                                    <li class="favourite-control"><a href="#"><i class="ic ac-icon-star"></i></a></li>\
                                    <% } %>\
                                </ul>\
                        </div>\
                        <div class="template-entry">\
                            <div class="template-entry-col">\
                                <h3 class="template-title"><%= template.title %></h3>\
                            </div>\
                                <textarea class="ac-template-data" style="display: none"><%= JSON.stringify(template) %></textarea>\
                        </div>\
                    </div>\
                </div>'
            )({template: templateData, type: Drupal.settings.aweTemplateType}),
            $template = $(template);

        // add favourite and category class
        if (templateData.category)
            $template.addClass(templateData.category);
        else
            $template.addClass('custom own-template');
        if (templateData.favourite)
            $template.addClass('favourite');

        // add template item to list templates
        if (addedByLoadMore)
            $('#ac-items-wrapper').append($template);
        else
            $('#ac-items-wrapper').prepend($template);
    }

    $(document).ready(function () {
        // get configuration path
        AWEContent.Path = Drupal.settings.awePathConfigurations;

        // move all body children in to wrapper && move builder to body
        $('body').append('<div class="awecontent-body-wrapper"></div>');
        $('.awecontent-body-wrapper').append($('body').children(':not(.awecontent-body-wrapper)'));
        $('body').append($('#save-template-dialog'));

        // handle click button to add new template
        $('a.add-template-btn, a.add-new-section').click(function(event) {
            event.preventDefault();
            $editingTemplate = null;
            openBuilder([]);
        });

        // init for filter template
        $('#filters').delegate('.template-filter a', 'click', function(event) {
            event.preventDefault();
            var selector = $(this).attr('data-filter');

            // activate current category and reset state template items
            $('.template-filter > li.active').removeClass('active');
            $(this).parent('li').addClass('active');
            $('#ac-items-wrapper .ac-tpl-item').removeClass('ac-disable');

            // add disable class when choose a category
            if (selector != '*')
                $('#ac-items-wrapper .ac-tpl-item:not('+ selector +')').addClass('ac-disable');
        });

        // handle event template upload successful
        $(window).bind('aweUploadTemplateSuccess', function(event, template) {
            if ($editingTemplate) {
                // update new data for template
                $('.template-preview img', $editingTemplate).attr('src', template.thumbnail);
                $('.template-title', $editingTemplate).html(template.title);
                $('.ac-template-data', $editingTemplate).val(JSON.stringify(template));
            }
            else // create new template item
                addTemplateItem(template, false);

            // Close builder
            closeBuilder();
        });

        // handle click to template controller
        $('.page-template').delegate('ul.template-control > li > a', 'click', function(event) {
            event.preventDefault();

            var $templateItem = $(this).parents('.ac-tpl-item'),
                templateData = JSON.parse($('.ac-template-data', $(this).parents('.ac-tpl-item')).val().trim());

            if ($(this).parent().hasClass('delete-control')) {
                if (templateData && confirm(Drupal.t('This template will be deleted permanently. Are you sure?'))) {
                    $.post(AWEContent.Path. templateActionURL,
                        {tid: templateData.tid, act: 'remove'},
                        function(response) {
                            if (response.status)
                                $templateItem.remove();
                            else
                                alert(Drupal.t('Delete template unsuccessful.'));
                        }
                    );
                }
            }
            else if ($(this).parent().hasClass('copy-control')) {
                $.post(AWEContent.Path.templateActionURL,
                    {tid: templateData.tid, act: 'clone', type: Drupal.settings.aweTemplateType},
                    function(response) {
                        if (response.status) {
                            addTemplateItem(response.template, false);
                        }
                        else
                            alert(response.msg);
                    }
                );
            }
            else if ($(this).parent().hasClass('edit-control')) {
                // get edit template data
                $editingTemplate = $templateItem;
                templateData = JSON.parse(templateData.data);
                templateData = Drupal.settings.aweTemplateType == 'section' ? [templateData] : templateData;

                // open builder to edit template
                openBuilder(templateData);
            }
            else if ($(this).parent().hasClass('favourite-control')) {
                var favourite = $templateItem.hasClass('favourite') ? 0 : 1;

                $.post(AWEContent.Path.templateActionURL,
                    {tid: templateData.tid, act: 'favourite', favourite: favourite},
                    function(response) {
                        if (response.status) {
                            if (favourite)
                                $templateItem.addClass('favourite');
                            else
                                $templateItem.removeClass('favourite');
                        }
                        else
                            alert(Drupal.t('Update favourite unsuccessful.', {}, null));
                    }
                );
            }
        });

        // handle click to loadMore button
        $('a.load-more').click(function(event) {
            event.preventDefault();

            var $loadMoreButton = $(this).parent(),
                numberTemplates = $('.page-template > .template-row > .ac-tpl-item').length;

            $.post(window.location.href, {currentTemplates: numberTemplates, act: 'loadTemplates'}, function(response) {
               if (!response.loadMore) {
                   $loadMoreButton.hide();
               }
                if (response.templates.length) {
                    $.each(response.templates, function(id, template) {
                        addTemplateItem(template, true);
                    });
                    $('.template-filter > li.active > a').trigger('click');
                }
            });
        });
    });
})(jQuery)