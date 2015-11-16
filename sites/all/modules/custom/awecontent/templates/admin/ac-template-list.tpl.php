<?php
/**
 * @File: ac-template-list.tpl.php
 * @Author: MegaDrupal
 * Website: http://megadrupal.com/
 */
?>
<div class="page-template">
  <?php if ($type == PAGE_TEMPLATE):?>
  <div class="template-row">
    <a class="awe-tpl-add add-template-btn" href="#" data-type="page"><?php print t('Add page template');?></a>
    <div class="filters-wrap">
      <div class="filters" id="filters">
        <ul class="template-filter">
          <li class="active"><a href="#" data-filter="*" id="all"><?php print('All');?></a></li>
          <li><a href="#" data-filter=".theme-template" id="theme"><?php print('Theme');?></a></li>
          <li><a href="#" data-filter=".custom" id="custom"><?php print('Custom');?></a></li>
          <li><a href="#" data-filter=".own-template" id="owner"><?php print('My Templates');?></a></li>
        </ul>
      </div>
    </div>
  </div>
  <?php else: ?>
  <div class="template-row">
    <a class="awe-tpl-add add-template-btn" href="#" data-type="section"><?php print t('Add section');?></a>
    <div class="filters-wrap">
      <div class="filters" id="filters">
        <ul class="template-filter">
          <li class="active"><a href="#" data-filter="*" id="all"><?php print('All');?></a></li>
          <li><a href="#" data-filter=".favourite" id="favourite"><?php print('Favourite');?></a></li>
          <?php foreach (variable_get('ac_section_template_categories', array()) as $key => $value):?>
            <li><a href="#" data-filter=".<?php print $key;?>"><?php print $value;?></a></li>
          <?php endforeach;?>
          <li><a href="#" data-filter=".theme-template" id="theme-template"><?php print('Theme');?></a></li>
          <li><a href="#" data-filter=".own-template" id="theme-template"><?php print('My Templates');?></a></li>
        </ul>
      </div>
    </div>
  </div>
  <?php endif;?>
  <div id="ac-items-wrapper" class="template-row">
    <?php foreach ($templates as $template): ?>
      <div class="<?php print implode(' ', $template->classes);?>">
        <div class="template-item">
          <div class="template-preview">
            <a href="#" class="prvimg"><img src="<?php print $template->thumbnail;?>" alt=""></a>
            <ul class="template-control">
              <li class="delete-control"><a href="#"><i class="ic ac-icon-trash"></i></a></li>
              <li class="copy-control"><a href="#"><i class="ic ac-icon-clone"></i></a></li>
              <li class="edit-control"><a href="#"><i class="ic ac-icon-edit"></i></a></li>
              <?php if ($type == SECTION_TEMPLATE):?>
              <li class="favourite-control<?php if ($template->favourite) print ' active';?>"><a href="#"><i class="ic ac-icon-star"></i></a></li>
              <?php endif;?>
            </ul>
          </div>
          <div class="template-entry">
            <div class="template-entry-col">
              <h3 class="template-title"><?php print $template->title;?></h3>
            </div>
              <textarea style="display: none" class="ac-template-data"><?php print drupal_json_encode($template);?></textarea>
          </div>
        </div>
      </div>
    <?php endforeach; ?>
  </div>
  <div class="template-row text-center"<?php if (!$load_more) print ' style="display: none"';?>>
    <a class="load-more" href="#"><?php print t('Load more');?></a>
  </div>
</div>