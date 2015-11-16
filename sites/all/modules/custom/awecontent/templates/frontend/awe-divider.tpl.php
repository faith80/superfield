<div <?php if($id) print 'id="'.$id.'"'; ?> class="<?php print $classes; ?>" <?php print $attributes; ?>>
  <div class="divider-field">
    <?php if($settings['with'] == 'text'): ?>
      <span class="divider-left">
        <span class="line-divider">
        </span>
      </span>
      <span class="text-divider">
        <?php print $settings['textContent']; ?>
      </span>
      <span class="divider-right">
        <span class="line-divider">
        </span>
      </span>
    <?php else: ?>
      <div class="divider-left"><span class="line-divider"></span></div>
    <?php endif; ?>
  </div>
</div>
