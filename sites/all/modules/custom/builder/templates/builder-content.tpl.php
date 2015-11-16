
<div<?php print builder_content_attributes($content, $classes); ?>>
  <?php if (!empty($content['subject'])): ?>
    <div class="builder-content-title">
      <h2<?php print $title_attributes; ?>><?php print filter_xss_admin($content['subject']) ?></h2>
    </div>
  <?php endif; ?>
  <div class="builder-content"<?php print $content_attributes; ?>>
    <?php print $main_content; ?>
  </div>
</div>