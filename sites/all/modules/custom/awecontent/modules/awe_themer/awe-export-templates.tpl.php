<?php
/**
 * @File: awe-export-templates.tpl.php
 * @Author: MegaDrupal
 * Website: http://megadrupal.com/
 */
?>
<div id="awe-export-templates">
  <h3><?php print t('Choose templates to export');?></h3>
  <div class="page-templates">
    <h4 class="title"><?php print t('Page Templates') ?></h4>
    <ul class="templates-list clearfix">
      <?php if (!empty($page_templates)):?>
        <?php foreach($page_templates as $tid => $template):?>
        <li class="template-item" data-tid="<?php print $tid;?>">
          <div class="template-thumbnail">
            <img src="<?php print $template->thumbnail;?>" alt="">
          </div>
          <div class="template-title"><h4><?php print $template->title;?></h4></div>
          <div class="export-template"><input type="checkbox"></div>
        </li>
        <?php endforeach;?>
      <?php else:?>
        <?php print t('There is no page template available.');?>
      <?php endif;?>
    </ul>
  </div>
  <div class="section-templates">
    <h4 class="title"><?php print t('Section Templates') ?></h4>
    <ul class="templates-list clearfix">
      <?php if (!empty($section_templates)):?>
        <?php foreach($section_templates as $tid => $template):?>
        <li class="template-item" data-tid="<?php print $tid;?>">
          <div class="template-thumbnail">
            <img src="<?php print $template->thumbnail;?>" alt="">
          </div>
          <div class="template-title"><h4><?php print $template->title;?></h4></div>
          <div class="export-template"><input type="checkbox"></div>
        </li>
        <?php endforeach;?>
      <?php else:?>
        <?php print t('There is no section template available.');?>
      <?php endif;?>
    </ul>
  </div>
</div>