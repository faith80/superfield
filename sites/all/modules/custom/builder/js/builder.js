(function ($) {
  Drupal.behaviors.builder = {
    attach: function (context, settings) {

      wow = new WOW(
              {
                boxClass: 'builder-animation',
                animateClass: 'animated', // default
                offset: 0, // default
                mobile: true, // default
                live: true        // default
              }
      );
      wow.init();


    }
  };

})(jQuery);
