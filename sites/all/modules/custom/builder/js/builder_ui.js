(function ($) {
  Drupal.behaviors.builder_ui = {
    attach: function (context, settings) {


      /* ===  Begin background color input settings init===== */
      $('.builder-color-selector-wrapper', context).each(function () {
        var $this = $(this);
        $this.find('input.builder-color-value').remove();
        var $colorInput = $this.find('input.builder-color-selector-input');
        $colorInput.after('<input style="background-color:' + $colorInput.val() + '" class="builder-color-value" name="builder-color-value" readonly />');

        $this.find('.builder-color-selector').ColorPicker({
          flat: true,
          color: $this.find('.builder-color-selector-input').val(),
          onShow: function (colpkr) {
            $(colpkr).fadeIn(500);
            return false;
          },
          onHide: function (colpkr) {
            $(colpkr).fadeOut(500);
            return false;
          },
          onChange: function (hsb, hex, rgb) {
            $this.find('.builder-color-selector-input').val('#' + hex);
            $this.find('.builder-color-value').css('background-color', '#' + hex);

          }
        });



      });

      $('.builder-color-selector-wrapper input').click(function () {
        var $this = $(this);
        $this.parents('.builder-color-selector-wrapper').find('.builder-color-selector').toggle();
      });



      /* ==== End background color input settings init ===== */


      /* ====== Start Animate for demo UI ======*/
      $('.builder-animation-demo-select').change(function () {
        var builder_animate_value = $(this).val();
        $('.builder-ui-animation-wrapper strong').removeClass().addClass(builder_animate_value + ' animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
          $(this).removeClass();
        });
      });
      /** ======= End Animate Demo for UI ===== */

      /* ====Begin Disable click on live view. === */
      $('.builder-ui-content-wrapper .ctools-collapsible-container a, .builder-ui-content-wrapper .ctools-collapsible-container button,.builder-ui-content-wrapper .ctools-collapsible-container input', context).click(function (e) {
        e.preventDefault();
      });
      $('.builder-ui-content-wrappert .ctools-collapsible-container select').change(function (e) {
        e.preventDefault();
      });
      /* End Disable click on live view. */


      /* ==== Begin drag sort rows in the builder ===== */
      $(".builder-ui-rows-container").sortable({
        items: ".builder-ui-row-wrapper",
        tolerance: 'pointer',
        opacity: 1,
        cursor: "move",
        axis: "y",
        handle: ".builder-ui-row-action .builder-ui-draggable",
        update: function (event, ui) {
          builder_ui_update_rows_weight($(this));
        }

      });

      $(".builder-ui-rows-container").disableSelection();

      function builder_ui_update_rows_weight(builder_rows_container) {
        var $builder_cache_id = builder_rows_container.attr('data-bid');

        var rows = builder_rows_container.sortable("toArray", {attribute: "data-rid"});
        var $builder_update_weight_url = Drupal.settings.builder.update_weight_url;
        $update_row_url = $builder_update_weight_url + '/row/' + $builder_cache_id;
        var builder_rows_data = {rows: rows};
        $.ajax({
          data: builder_rows_data,
          type: 'POST',
          url: $update_row_url
        });
      }


      /* ==== End drag sort rows in the builder ===== */

      /* === Begin drag sort columns in row ===== */
      $(".builder-ui-column-items-wrapper").sortable({
        items: ".builder-ui-column",
        tolerance: 'pointer',
        opacity: 1,
        cursorAt: {left: 70, top: 5},
        cursor: "move",
        handle: ".column-actions-links .builder-ui-draggable",
        update: function (event, ui) {
          builder_ui_update_columns_weight($(this));
        }

      });

      $(".builder-ui-column-items-wrapper").disableSelection();

      function builder_ui_update_columns_weight(builder_row_wrapper) {

        var $builder_cache_id = builder_row_wrapper.attr('data-bid');
        var $builder_row_id = builder_row_wrapper.attr('data-rid');
        var columns = builder_row_wrapper.sortable("toArray", {attribute: "data-cid"});
        var $builder_update_weight_url = Drupal.settings.builder.update_weight_url;
        $update_column_url = $builder_update_weight_url + '/column/' + $builder_cache_id + '/' + $builder_row_id;
        var builder_columns_data = {columns: columns};
        $.ajax({
          data: builder_columns_data,
          type: 'POST',
          url: $update_column_url
        });
      }
      /* ======End sort columns in row ====== */



      /* === Begin drag sort contents in column ===== */
      $(".builder-ui-contents-wrapper").sortable({
        items: ".builder-ui-content-wrapper",
        tolerance: 'pointer',
        opacity: 1,
        axis: "y",
        cursor: "move",
        handle: ".builder-ui-content-title-wrapper .builder-ui-draggable",
        update: function (event, ui) {
          builder_ui_update_contents_weight($(this));
        }

      });

      $(".builder-ui-contents-wrapper").disableSelection();

      function builder_ui_update_contents_weight(builder_column_wrapper) {

        var $builder_cache_id = builder_column_wrapper.attr('data-bid');
        var $builder_row_id = builder_column_wrapper.attr('data-rid');
        var $builder_column_id = builder_column_wrapper.attr('data-cid');
        var contents = builder_column_wrapper.sortable("toArray", {attribute: "data-contentid"});
        var $builder_update_weight_url = Drupal.settings.builder.update_weight_url;
        var $update_content_url = $builder_update_weight_url + '/content/' + $builder_cache_id + '/' + $builder_row_id + '/' + $builder_column_id;
        var builder_contents_data = {contents: contents};

        $.ajax({
          data: builder_contents_data,
          type: 'POST',
          url: $update_content_url
        });
      }
      /* ======End sort contents in column ====== */



      // icons searching filter
      var $builder_icon_search_input = $('.builder-ui-icon-search');
      $builder_icon_search_input.keyup(function () {
        var keyword = $builder_icon_search_input.val();
        if (keyword === '') {
          $('.builder-ui-content-icons-markup span.builder-ui-icon-wrap').show();
        } else {
          $('.builder-ui-content-icons-markup span.builder-ui-icon-wrap').hide();
          $(".builder-ui-content-icons-markup span.builder-ui-icon-wrap:contains(" + keyword + ")").show();
        }
      });
      $builder_icon_search_input.focus();

      $('.builder-ui-content-icon-markup .selector-button').click(function () {
        var $selector_button = $(this);
        $('.builder-ui-content-icons-markup').toggle(400, function () {
          var $this = $(this);
          if ($this.is(":visible")) {
            $selector_button.find('i').attr('class', 'fa fa-arrow-down');
          } else {
            $selector_button.find('i').attr('class', 'fa fa-arrow-up');
          }

        });
      });

      $('.builder-ui-icon-wrap').click(function () {
        $('.builder-ui-icon-wrap').removeClass('current-icon');
        var $this = $(this);
        $this.addClass('current-icon');
        $('.builder-ui-content-icon-markup .selected-icon i').attr('class', $this.attr('data-value'));
        $('.builder-ui-content-icon-selected').val($this.attr('data-value'));
      });



      // filter element

      jQuery.expr[':'].Contains = function(a,i,m){
        return (a.textContent || a.innerText || "").toUpperCase().indexOf(m[3].toUpperCase())>=0;
      };

    // create and add the filter form to the header
    var $input = $('.builder-filter-element');
    var $list = $input.parents('.fieldset-wrapper');
    
    $input.change( function () {
        var filter = $(this).val();
        if(filter) {
          // this finds all links in a list that contain the input,
          // and hide the ones not containing the input while showing the ones that do
          $list.find("a:not(:Contains(" + filter + "))").parent().hide();
          $list.find("a:Contains(" + filter + ")").parent().show();
        } else {
          $list.find("li").show();
        }
        return false;
      })
    .keyup( function () {
        // fire the above change event after every letter
        $(this).change();
    });


      // Your custom js code here...
    }
  };

})(jQuery);


