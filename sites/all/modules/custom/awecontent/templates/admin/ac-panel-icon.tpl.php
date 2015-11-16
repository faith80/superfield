<div class="md-section">
  <div class="md-tab tab-icon">
    <div class="">
      <ul>
        <?php foreach ($icons as $type => $icon ): ?>
          <li><a href="#tab-icon-<?php print $type; ?>"><?php print $icon['title']; ?></a></li>
        <?php endforeach; ?>
      </ul>
    </div>
    <div class="md-content-tab">
      <?php foreach ($icons as $type => $icon ): ?>
        <div class="md-tab-item" id="tab-icon-<?php print $type; ?>">
          <div class="obj-adjust scroll-bar">
            <ul>
            <?php foreach ($icon['icons'] as $icon_class => $value): ?>
              <li class="item-icon">
                <?php print theme('icon', array('bundle' => $type, 'icon' => $icon_class)); ?>
              </li>
            <?php endforeach; ?>
            </ul>
          </div>
        </div>
      <?php endforeach; ?>
    </div>
  </div>
</div>
<div class="panel-icon-control">
  <button class="control-ok"><?php print t('OK'); ?></button>
  <button class="control-cancel"><?php print t('Cancel'); ?></button>
</div>