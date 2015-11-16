<div <?php if($id) print 'id="'.$id.'"'; ?> class="<?php print $classes; ?>" <?php print $attributes; ?>>
  <?php foreach ($accordions as $key => $accordion): ?>
    <div class="group">
      <h3 class="title-accor">
        <?php isset($expandIcon) ? print $expandIcon : ''; ?>
        <?php if ($settings['enableIcon']): ?>
          <span class="icon-accr">
            <i class="<?php print $accordion['nameIcon']; ?>"></i>
          </span>
        <?php endif; ?>
        <span class="title-accr">
          <?php print $accordion['title']; ?>
        </span>
      </h3>

      <div class="content-accor">
        <div class="row">
          <?php foreach ($accordion['content'] as $key_item => $item): ?>
            <?php print render($item); ?>
          <?php endforeach; ?>
        </div>
      </div>
    </div>
  <?php endforeach; ?>
</div>
