<div <?php if($id) print 'id="'.$id.'"'; ?> class="awe-col <?php print $classes;?>" <?php print $attributes?>>
<?php if($hasLayout): ?>
  <div class="row">
  <?php foreach ($layout as $key => $column): ?>
    <?php
      $variables = array(
        'items' => $column['items'],
        'settings' => $column['settings'],
        'classes' => $column['classes'],
        'hasLayout' => $column['hasLayout'],
        'layout' => $column['layout'],
        'class_random' => $class_random. '-' . $key,
        'node' => $node
      );
    ?>
    <?php print theme('awecontent_column',$variables); ?>
  <?php endforeach; ?>
  </div>
<?php else: ?>
  <div class="awe-col-content <?php print $settings['textAlign']; ?>">
    <?php print $overlay['html'];?>
    <div class="awe-col-wrapper">
    <?php foreach ($items as $key => $item):?>
      <?php print render($item); ?>
    <?php endforeach ?>
    </div>
  </div>
<?php endif; ?>
</div>