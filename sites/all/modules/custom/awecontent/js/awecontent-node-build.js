/**
 * File: awecontent-node-build.js
 * Author: MegaDrupal
 * Website: http://megadrupal.com/
 */
(function($) {
    $(document).ready(function() {
        $('.region-page-top, #admin-menu').remove();
        $('body').removeClass('toolbar toolbar-drawer admin-menu').css('padding-top', 0);
        if ($('#page-title').next().hasClass('tabs'))
            $('#page-title').next().remove();
        $('a').click(function(event) {
            event.preventDefault();
        });

        $('form').submit(function (evt) {
            evt.preventDefault();
        });

        if ($('#toolbar').length == 0) {
            var time = 0,
                removeAdminMenu = setInterval(function() {
                    time += 100;
                    if ($('#admin-menu').length) {
                        $('#admin-menu').remove();
                        $('body').removeClass('admin-menu');
                        clearInterval(removeAdminMenu);
                    }
                    else if (time > 10000)
                        clearInterval(removeAdminMenu);
                }, 100);
        }
        else
            $('#toolbar').remove();
    });
})(jQuery);