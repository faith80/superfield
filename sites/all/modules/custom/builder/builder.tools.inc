<?php

/**
 * Import and Export Builder.
 */

/**
 * Page callback for exporting builder
 */
function builder_tools_export_page($builder_cache_id) {
  $builder = builder_cache_get($builder_cache_id);
  if (!_builder_tools_export($builder)) {
    drupal_set_message(t('An error create zip archive.'), 'error');
  }
  return drupal_access_denied();
}

/**
 * Create zip file and export builder for download.
 */
function _builder_tools_export($builder) {
  $zip = _builder_tools_create_zip($builder->cache_id);
  if ($zip) {
    $uri = $zip['uri'];
    $name = $zip['name'];
    header('Content-disposition: attachment; filename=' . $name . '.zip');
    header('Content-type: application/zip');
    readfile(drupal_realpath($uri));
    exit();
  }
  return FALSE;
}

/**
 * Builder create zip file for export
 */
function _builder_tools_create_zip($builder_cache_id) {
  $files_added = array();
  $i = 1;
  $builder = builder_cache_get($builder_cache_id);
  $name = 'builder_export_' . REQUEST_TIME;
  $data = '';
  if (!empty($builder)) {

    $archive_uri = 'temporary://' . $name . '.zip';
    $zip = new ZipArchive;
    if ($zip->open(drupal_realpath($archive_uri), ZipArchive::CREATE) === TRUE) {
      if (!empty($builder->rows)) {
        // create image file if row has background image, and video poster
        $rows = $builder->rows;
        foreach ($rows as $row_key => $row) {

          if (!empty($row['settings']['background']['background_image'])) {
            // this row has background image, so we need also export this image to zip file.
            $background_image_file = file_load($row['settings']['background']['background_image']);
            if ($background_image_file) {
              $filename = $background_image_file->filename;
              if (!empty($files_added) && in_array($filename, $files_added)) {
                // this file has been exits in zip. Now we need rename it
                $prefix = $i;
                $filename = $prefix . '_' . $filename;
                $i++; // if file exist we need increase prefix number
              }
              $files_added[] = $filename; // added this to array and check for later.

              $zip->addFile(drupal_realpath($background_image_file->uri), $filename);

              // also rewrite $builder object for save;
              $builder->rows[$row_key]['settings']['settings']['background']['background_image'] = $filename;
            }
          }

          // check for row if has html5 video poster
          if (!empty($row['settings']['video_bg']['videos']['poster'])) {
            $file = file_load($row['settings']['video_bg']['videos']['poster']);
            if ($file) {
              $filename = $file->filename;
              if (!empty($files_added) && in_array($filename, $files_added)) {
                // this file has been exits in zip. Now we need rename it
                $prefix = count($files_added);
                $filename = $prefix . '_' . $filename;
                $i++; // if file exist we need increase prefix number
              }
              $files_added[] = $filename; // added this to array and check for later.

              $zip->addFile(drupal_realpath($file->uri), $filename);
              $builder->rows[$row_key]['settings']['video_bg']['videos']['poster'] = $filename;
            }
          }

          // We are not export video in this case. So the zip file will be too heavy. User have to re-upload video for background video.
          /* ====================  =========================== */


          // now we check each column, and then contents in that column if has image. We will export it too.

          if (!empty($row['columns'])) {
            foreach ($row['columns'] as $column_key => $column) {
              if (!empty($column['contents'])) {
                foreach ($column['contents'] as $content_key => $content) {
                  $delta = $content['delta'];
                  // hook_builder_content_export_alter($zip, $content) or hook_builder_content_export_MODULE_DELTA_alter($zip $content).
                  drupal_alter(array('builder_content_export', "builder_content_export_{$content['module']}_{$delta}"), $zip, $content);
                  $builder->rows[$row_key]['columns'][$column_key]['contents'][$content_key] = $content;
                }
              }
            }
          }
        }
      }

      $data = serialize($builder);
      $zip->addFromString('settings.txt', $data);
      $zip->close();
      return array('uri' => $archive_uri, 'name' => $name);
    }
  }

  return FALSE;
}

/**
 * Page callback for ctools import
 */
function builder_tools_import_page($js, $builder_cache_id) {
  $form_state = array(
      'title' => t('Import builder'),
      'ajax' => TRUE,
      'builder_cache_id' => $builder_cache_id,
  );

  if (!$js) {
    $builder_form = drupal_build_form('builder_tools_import_form', $form_state);
    return render($builder_form);
  }
  ctools_include('modal');
  ctools_include('ajax');


  $output = ctools_modal_form_wrapper('builder_tools_import_form', $form_state);

  if (!empty($form_state['executed'])) {
    $builder = builder_cache_get($builder_cache_id);
    $output = array();
    $builder_id_ajax_prefix = 'builder-ui-ajax-wrapper' . $builder_cache_id;
    $content = theme('builder_ui', array('builder' => $builder));
    $output[] = ajax_command_html('#' . $builder_id_ajax_prefix, $content);
    $output[] = ctools_modal_command_dismiss();
  }
  print ajax_render($output);
  exit;
}

/**
 * Form import
 */
function builder_tools_import_form($form, &$form_state) {
  $builder_cache_id = $form_state['builder_cache_id'];
  $form['builder_cache_id'] = array(
      '#type' => 'value',
      '#value' => $builder_cache_id,
  );
  $form['zip_file'] = array(
      '#type' => 'managed_file',
      '#title' => t('Upload'),
      '#description' => t('Upload your builder that exported before. Allowed extensions: zip'),
      '#upload_location' => 'public://',
      '#upload_validators' => array(
          'file_validate_extensions' => array('zip'),
          // Pass the maximum file size in bytes
          'file_validate_size' => array(1024 * 1280 * 800),
      ),
      '#required' => TRUE,
  );

  $form['actions'] = array('#type' => 'actions');
  $form['actions']['submit'] = array(
      '#type' => 'submit',
      '#value' => t('Import'),
  );

  return $form;
}

/**
 * validation handle for Import process form
 */
function builder_tools_import_form_validate($form, &$form_state) {
  $values = $form_state['values'];
  if (!isset($values['zip_file']) || !is_numeric($values['zip_file']) || !$file = file_load($values['zip_file'])) {
    form_set_error('zip_file', t('Please upload validate builder zip file that exported before.'));
  }
}

/**
 * Submition handle for Import process form
 */
function builder_tools_import_form_submit($form, &$form_state) {

  $builder = new stdClass;
  $files_saved = array();
  $values = $form_state['values'];
  $builder_cache_id = $values['builder_cache_id'];
  $zip_upload_fid = $values['zip_file'];


  $file = file_load($zip_upload_fid);
  $zip = new ZipArchive();
  $res = $zip->open(file_create_url(drupal_realpath($file->uri)));

  if ($res === TRUE) {

    $extract_directory = _builder_extract_directory();
    $local_file = drupal_realpath($file->uri);
    try {
      builder_tools_extract_archive($local_file, $extract_directory);
    } catch (Exception $e) {
      drupal_set_message(t('An error: %msg', array('%msg' => $e->getMessage())), 'error');
    }

    $files = file_scan_directory($extract_directory, '/.*/');
    if (!empty($files)) {
      foreach ($files as $read_file) {
        if ($read_file->filename == 'settings.txt') {
          $settings_content = file_get_contents(drupal_realpath($read_file->uri));
          $builder = @unserialize($settings_content);
          if ($builder) {
            $builder->is_new = FALSE;
          }
        } else {
          $file_save = file_save($read_file);
          if (isset($file_save->fid) && $file_save->fid) {
            $files_saved[$file_save->filename] = $file_save->fid;
          }
        }
      }
    }
    $builder = _builder_tools_import_format_builder($builder, $files_saved);
    if ($builder) {
      file_delete($file, TRUE);
      builder_cache_set($builder_cache_id, $builder);
    }
  }
}
