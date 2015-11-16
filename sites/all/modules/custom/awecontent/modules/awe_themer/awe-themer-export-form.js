/**
 * File:awe-themer-export-form.js
 * Author: MegaDrupal
 * Website: http://megadrupal.com/
 */
(function ($) {
    'use strict';

    $(document).ready(function () {
        $('.export-template input').change(function () {
            var export_data = $('input[name=export_data]').val(),
                tid = $(this).parents('.template-item:first').data('tid');

            if (export_data)
                export_data = export_data.split(',');
            else
                export_data = [];

            if ($(this).is(':checked'))
                export_data.push(tid);
            else {
                var index = export_data.indexOf(tid);

                if (index > -1)
                    export_data.splice(index, 1);
            }

            $('input[name=export_data]').val(export_data.join(','));
        });

        $('a#export-templates').click(function(event) {
            var href = Drupal.settings.basePath + Drupal.settings.pathPrefix + '?q=admin/awe-content/templates/export/download/&templates=' + $('input[name=export_data]').val();
            $(this).attr('href', href);
        });
    });
})(jQuery);
