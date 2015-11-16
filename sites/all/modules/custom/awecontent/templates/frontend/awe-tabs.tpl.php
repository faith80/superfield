<div <?php if($id) print 'id="'.$id.'"'; ?> class="<?php print $classes; ?>" <?php print $attributes; ?>>
  <div class="select-tab">
    <ul class="ui-tabs-nav">
    <?php foreach ($tabs['title'] as $key => $title): ?>
      <li class="awe-tab-item ">
        <a href="#<?php print $class_random . '-' . $key; ?>">
          <span class="awe-tab-icon"><i class="<?php print $tabs[$key]['icon'];?>"></i></span>
          <span class="awe-tab-title"><?php print $title; ?></span>
        </a>
      </li>
    <?php endforeach; ?>
    </ul>
  </div>
  <div class="md-content-tab">
    <?php foreach ($tabs['content'] as $key => $content): ?>
      <div id="<?php print $class_random . '-' . $key; ?>">
        <div class="row">
          <?php foreach ($content as $key_column => $column): ?>
            <?php print render($column); ?>
          <?php endforeach; ?>
        </div>
      </div>
    <?php endforeach; ?>
  </div>
</div>
