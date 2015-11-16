<div <?php if ($id) {
  print 'id="' . $id . '"';
} ?> class="<?php print $classes; ?>" <?php print $attributes; ?>>
  <?php if ($href_lightbox != '' || $settings['lightBox'] != 0) : ?>
  <a class="<?php print $classes_lightbox; ?>" href="<?php print $href_lightbox ?>" target="<?php print $href_target; ?>">
  <?php endif; ?>
    <div class="awe-image-content">
      <?php if ($settings['positionCaption'] == 'over'): ?>
        <div class="awe-image-overlay"
             style="background-color: <?php print $settings['imageBgOverlay']; ?>"></div>
      <?php endif; ?>
      <?php print $caption_top ?>
      <div class="awe-image-container">
        <img src="<?php print $src_image; ?>" alt=""/>
      </div>
      <?php print $caption_bottom; ?>
    </div>
  <?php if ($href_lightbox != '' || $settings['lightBox'] != 0) : ?>
  </a>
<?php endif; ?>
</div>