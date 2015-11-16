<?php
/**
 * @File: templates-file.tpl.php.
 * @Author: MegaDrupal
 * Website: http://megadrupal.com/
 */
print "<?php\n"
?>
/**
 * @File: <?php print $file_name."\n";?>
 */

/**
 * Callback to return list templates default by this theme
 */
function <?php print $function_name;?>($type='') {
  $templates = array(
    'section' => array(
    <?php foreach ($section_templates as $template):?>
      array(
          'tid' => <?php print $template->tid;?>,
          'title' => '<?php print $template->title;?>',
          'type' => '<?php print $template->type;?>',
          'data' => '<?php print $template->data;?>',
          'favourite' => 0,
          'thumbnail' => '<?php print $template->thumbnail;?>',
          'category' => '<?php print $template->category;?>',
          'created' => <?php print $template->created;?>,
        ),
    <?php endforeach;?>
    ),
    'page' => array(
    <?php foreach ($page_templates as $template):?>
      array(
        'tid' => <?php print $template->tid;?>,
        'title' => '<?php print $template->title;?>',
        'type' => '<?php print $template->type;?>',
        'data' => '<?php print $template->data;?>',
        'thumbnail' => '<?php print $template->thumbnail;?>',
        'created' => <?php print $template->created;?>,
      ),
    <?php endforeach;?>
    )
  );
  if ($type && isset($templates[$type])) {
    return $templates[$type];
  }

  return $templates;
}
