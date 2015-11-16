<?php

/**
 * HOOK_builder_content_info()
 */
function HOOK_builder_content_info() {

  $contents = array();

  //Custom text
  $contents['custom_text'] = array(
    'info' => t('Custom text'),
    'group' => t('Text'),
  );

  $contents['node'] = array(
    'info' => t('Adding existing node'),
    'group' => t('Node'),
  );


  return $contents;
}

/**
 * Hook_builder_content_configure($delta = '', $content = array())
 */
function HOOK_builder_content_configure($delta = '', $content = array()) {

  $form = array();
  switch ($delta) {
    case 'node':
      $form['nid'] = array(
        '#type' => 'textfield',
        '#title' => t('Enter node ID or title'),
        '#default_value' => !empty($content['settings']['nid']) ? $content['settings']['nid'] : '',
        '#autocomplete_path' => 'builder/autocomplete/node',
        '#required' => TRUE,
      );
      $view_modes_options = array();
      $view_modes = builder_get_entity_view_modes('node');
      if (!empty($view_modes)) {
        foreach ($view_modes as $key => $vm) {
          $view_modes_options[$key] = $vm['label'];
        }
      }
      $form['view_mode'] = array(
        '#type' => 'select',
        '#title' => t('View mode'),
        '#options' => $view_modes_options,
        '#default_value' => isset($content['settings']['view_mode']) ? $content['settings']['view_mode'] : 'full',
      );
      $form['hide_node_title'] = array(
        '#type' => 'checkbox',
        '#title' => t('Hide node title'),
        '#default_value' => isset($content['settings']['hide_node_title']) ? $content['settings']['hide_node_title'] : FALSE,
      );
      break;

    case 'custom_text':
      $form['custom_text'] = array(
        '#type' => 'text_format',
        '#title' => t('Custom text'),
        '#default_value' => isset($content['settings']['custom_text']['value']) ? $content['settings']['custom_text']['value'] : '',
        '#format' => isset($content['settings']['custom_text']['format']) ? $content['settings']['custom_text']['format'] : filter_default_format(),
      );

      break;
  }


  return $form;
}

/**
 * HOOK_builder_content_view()
 */
function HOOK_builder_content_view($delta = '', $content = array()) {
  $content = '';
  switch ($delta) {
    case 'node':

      $node_content = '';
      if (!empty($content['settings']['nid'])) {
        $nid = $content['settings']['nid'];
        if ($node = node_load($nid)) {
          if (isset($content['settings']['hide_node_title']) && $content['settings']['hide_node_title']) {
            // hide node title.
            $node->title = FALSE;
          }
          $node_view = node_view($node, $content['settings']['view_mode']);

          $node_content = render($node_view);
        }
      }
      $content['content'] = $node_content;
      break;


    case 'custom_text':
      $custom_text_value = isset($content['settings']['custom_text']['value']) ? $content['settings']['custom_text']['value'] : '';
      if (isset($content['settings']['custom_text']['format'])) {
        $custom_text_value = check_markup($custom_text_value, $content['settings']['custom_text']['format']);
      }
      $content['content'] = $custom_text_value;

      break;

      return $content;
  }


}

/** This is for Export content, we may alter $content, and $zip file before user download it
 * Hook_builder_content_export($zip , $content)
 */
function HOOK_builder_content_export_alter(&$zip, &$content) {
  if ($content['module'] == 'builder' && $content['delta'] == 'image') {
    if (!empty($content['settings']['image'])) {
      $file = file_load($content['settings']['image']);
      $filename = $file->filename;
      $zip->addFile(drupal_realpath($file->uri), $filename);
    }
  }
}

/**
 * Hook_builder_content_import_alter($files , $content)
 */
function builder_builder_content_import_alter($files, &$content) {
  if ($content['module'] == 'builder' && $content['delta'] == 'image') {
    if (!empty($content['settings']['image'])) {
      $filename = $content['settings']['image'];
      if (!empty($files[$filename])) {
        $fid = $files[$filename];
        $content['settings']['image'] = $fid; // add file name location callback for settings data in settings.txt (zip file).
      }
    }
  }
}

/**
 * Implements of hook_builder_content_clone_alter($delta, &$content)
 */
function builder_builder_content_clone_alter($delta, &$content) {
  switch ($delta) {
    case 'image':
      if (!empty($content['settings']['image'])) {
        $fid = $content['settings']['image'];
        if ($file = file_load($fid)) {
          $destination = 'public://';
          $new_file = file_copy($file, $destination);
          if ($new_file && !empty($new_file->fid)) {
            $content['settings']['image'] = $new_file->fid;
          }
        }
      }
      break;
  }
}

/**
 * Implements of hook_builder_content_saved_alter($delta, $content, $bid)
 */
function HOOK_builder_content_saved_alter($delta = '', $content, $bid) {
  switch ($delta) {
    case 'image':
      if (!empty($content['settings']['image'])) {
        $fid = $content['settings']['image'];

        if ($file = file_load($fid)) {
          if ($file->status !== FILE_STATUS_PERMANENT) {

            $file->status = FILE_STATUS_PERMANENT;
            file_save($file);
            file_usage_add($file, 'builder', 'builder', $bid);
          }
        }
      }
      break;
  }
}
