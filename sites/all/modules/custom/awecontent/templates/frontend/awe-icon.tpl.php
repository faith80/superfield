<?php if($link_icon == ''): ?>
  <div <?php if($id) print 'id="'.$id.'"'; ?> class="<?php print $classes; ?>" <?php print $attributes; ?>>
    <div class="awe-icon-container"><i class="<?php print $name_icon; ?>"></i></div>
  </div>
<?php else: ?>
  <div <?php if($id) print 'id="'.$id.'"'; ?> class="<?php print $classes; ?>" <?php print $attributes; ?>>
    <a target="_blank" href="<?php print $link_icon; ?>">
      <div class="awe-icon-container"><i class="<?php print $name_icon; ?>"></i></div>
    </a>
  </div>
<?php endif; ?>