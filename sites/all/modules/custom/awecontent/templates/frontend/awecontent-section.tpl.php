<div <?php if($id) print 'id="'.$id.'"'; ?>  class="<?php print $classes; ?>" <?php print $attributes; ?>>
<?php if(isset($bgvideo)) print $bgvideo; ?>
  <?php if(isset($overlay['enable']) && $overlay['enable'] == 1): ?>
  <div class="awe-bg-overlay"></div>
  <?php endif; ?>
  <div class="<?php print $fluid; ?>">
    <?php foreach ($rows as $row):?>
    <div class="row">
      <?php foreach ($row as $column):?>
        <?php print render($column); ?>
      <?php endforeach; ?>
    </div>
    <?php endforeach;?>
  </div>
</div>
