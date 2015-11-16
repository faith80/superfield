<div class="wrap-twitter">
  <div <?php if($id) print 'id="'.$id.'"'; ?> class="<?php print $classes ?> <?php print $class_random;  ?>" <?php print $attributes ?>>
  </div>
</div>
<script type='text/javascript'>
  jQuery(function($){
    $('.wrap-twitter <?php print '.'.$class_random; ?>').twittie({
        dateFormat: '<?php print $settings['dateFormat']; ?>',
        template: '<?php print $settings['template']; ?>',
        count: <?php print $settings['numberTwitter']; ?>,
        hideReplies: true,
        loadingText: "Loading!"
      }
      <?php if ($settings['sliderTwitter'] == 1): ?>
      ,function(){
        $('.wrap-twitter <?php print '.'.$class_random; ?> ul').owlCarousel({
          items: 1,
          singleItem: true,
          autoPlay: <?php print $twitter_autoplay; ?>,
          autoplayHoverPause: <?php print $settings['stopOnHover']; ?>,
          pagination: <?php print $twitter_pager; ?>
        });
      }
      <?php endif; ?>
    );

  });
</script>
