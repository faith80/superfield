<div id="<?php print $css_id; ?>" class="<?php print $css_class; ?>">

  <?php if (!empty($rows)): ?>
    <div data-bid="<?php print $builder_cache_id; ?>" class="builder-ui-rows-container">
      <?php
      $i = 0;
      foreach ($rows as $row_key => $row_element):
        ?>
        <?php
        $row = $builder->rows[$row_key];
        $row_id = builder_extract_id_key($row_key);
        ?>
        <div class="builder-ui-row-wrapper<?php $i == 0 ? print ' first' : ''; ?>" data-bid="<?php print $builder_cache_id; ?>" data-rid="<?php print $row_id; ?>">
          <div class="builder-ui-row-inner">
            <div class="builder-ui-row-action">
              <div class="builder-ui-move"><span class="builder-ui-draggable icon-builder-move"></span></div>
            </div>
            <div class="builder-ui-row-content-wrapper">
              <div class="builder-ui-row-content-inner">
                <?php print render($row_element); ?>
              </div>
            </div>
          </div>
        </div>
        <?php
        $i++;
      endforeach;
      ?>
    </div>
  <?php endif; ?>

  <div class="builder-actions">
    <?php if (!empty($builder_actions)): ?>
      <ul class="links inline">
        <?php foreach ($builder_actions as $link): ?>
          <li><?php print $link; ?></li>
        <?php endforeach; ?>
      </ul>
    <?php endif; ?>
  </div>
</div>