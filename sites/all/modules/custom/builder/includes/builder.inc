<?php

function builder_get_last_bid() {
  $query = db_select('builder_data');
  $query->addExpression('MAX(bid)');
  $max = $query->execute()->fetchField();

  return $max;
}

function builder_insert_row($row = array()) {
  global $user;
  $row['uid'] = isset($row['uid']) ? $row['uid'] : $user->uid;
  $row['created'] = !empty($row['created']) ? $row['created'] : REQUEST_TIME;
  $bid = 0;
  if (!empty($row['bid'])) {
    $bid = $row['bid'];
    $builder = db_select('builder_data', 'b')
      ->fields('b', array('bid'))
      ->condition('b.bid', $bid)
      ->execute()
      ->fetchField();
    if ($builder) {
      db_update('builder_data')
        ->fields($row)
        ->condition('bid', $bid)
        ->execute();
    }
    else {
      $bid = db_insert('builder_data')->fields($row)->execute();
    }
  }
  else {
    $bid = db_insert('builder_data')->fields($row)->execute();
  }

  return $bid;
}

function builder_cache_set($id, $object) {
  ctools_include('object-cache');
  $object->cache_id = $id;
  ctools_object_cache_set('builder', $id, $object);
}

function builder_cache_get($id = NULL) {
  ctools_include('object-cache');
  $object = ctools_object_cache_get('builder', $id);
  if (!$object) {
    $object = new stdClass;
    $object->cache_id = $id;
    $object->rows = array();
    $object->is_new = TRUE;
  }
  return $object;
}

function builder_cache_clear($id) {
  ctools_include('object-cache');
  ctools_object_cache_clear('builder', $id);
}

function builder_get_cache_id($bid, $delta) {
  return 'builder_cache_' . $bid . '_' . $delta;
}

function builder_cache_init(&$variables) {

  global $user;
  $element = $variables['element'];

  $element_item = $element[0];
  $entity_type = $element_item['#entity_type'];
  $entity = $element_item['#entity'];
  $field_name = $element['#field_name'];
  list($id, $vid, $bundle) = entity_extract_ids($entity_type, $entity);

  $created = $entity->created;

  $builder_cache_id = 'builder_cache_' . $user->uid . '_' . $created;
  if (!empty($id)) {
    $builder_cache_id = 'builder_cache_' . $id;
    $builder = builder_cache_get($builder_cache_id);
    if (!$builder->editing) {
      foreach (element_children($element) as $key) {
        if ($key !== 'add_more') {
          $delta = $element[$key]['#delta'];
          $bid = $element[$key]['bid']['#default_value'];

          if ($bid) {
            $builder->rows[builder_get_row_key($delta)] = @unserialize(builder_get_row_data($bid));
          }
        }
      }
    }
    $builder->editing = TRUE;
    $builder->update = TRUE;
    builder_cache_set($builder_cache_id, $builder);
  }
  $builder = builder_cache_get($builder_cache_id);
  builder_cache_set($builder_cache_id, $builder);

  return $builder_cache_id;
}

function builder_get_row_key($row_id) {
  if (is_numeric($row_id)) {
    // return 'row_' . $row_id;

    return $row_id;
  }

  return $row_id;
}

function builder_get_row_data($bid) {

  $result = db_select('builder_data', 'b')
    ->fields('b', array('data'))
    ->condition('b.bid', $bid)
    ->execute()
    ->fetchField();

  return $result;
}

function builder_get_column_key($column_id) {
  if (is_numeric($column_id)) {
    //return 'col_' . $column_id;
    return $column_id;
  }

  return $column_id;
}

function builder_get_content_key($content_id) {

  return $content_id;
}

function builder_extract_id_key($str) {
  if (!empty($str)) {
    $arr = explode('_', $str);
    if (isset($arr[1])) {
      return $arr[1];
    }
  }

  return $str;
}

function builder_column_css($column) {
  $classes = array();

  if (!empty($column['settings']['grid'])) {

    foreach ($column['settings']['grid'] as $key => $grid) {
      if (!empty($grid)) {
        $classes[] = 'col-' . $key . '-' . $grid;
      }
    }
  }
  if (!empty($classes)) {
    return implode(' ', $classes);
  }
  return '';
}

function builder_find_max_weight($arr) {
  $numbers = array_map(function ($details) {
    if (isset($details['weight'])) {
      return $details['weight'];
    }
  }, $arr);

  $max = max($numbers);

  return $max + 1;
}

function builder_get_entity_view_modes($entity_type) {
  $entity_info = entity_get_info($entity_type);
  $view_modes = $entity_info['view modes'];

  return $view_modes;
}

function builder_check_exist($bid = NULL) {

  if ($bid) {
    $bid = db_select('builder_data', 'b')
      ->fields('b', array('bid'))
      ->condition('b.bid', $bid)
      ->execute()
      ->fetchField();

    return $bid;
  }

  return FALSE;
}

function builder_get_data($bid) {
  $data = db_select('builder_data', 'b')
    ->fields('b', array('data'))
    ->condition('b.bid', $bid)
    ->execute()
    ->fetchField();

  if (!empty($data)) {
    $data = @unserialize($data);
  }

  return $data;
}

function _builder_data_clone($bid) {
  global $user;
  $selected = db_select('builder_data', 'b')
    ->fields('b')
    ->condition('b.bid', $bid)
    ->execute()
    ->fetchObject();

  $data = isset($selected->data) ? $selected->data : '';
  $type = isset($selected->type) ? $selected->type : '';

  $new_bid = db_insert('builder_data')
    ->fields(array(
      'uid' => $user->uid,
      'type' => $type,
      'data' => $data,
      'status' => 0,
      'created' => REQUEST_TIME,
    ))
    ->execute();


  return $new_bid;
}

function builder_column_attributes($column_id, $column = array(), $i = 1) {
  $attributes = array();
  $attributes['class'] = array(
    'builder-column',
    'builder-column-item-' . $i,
  );
  $empty_arr = array();
  $grid = isset($column['settings']['grid']) ? $column['settings']['grid'] : $empty_arr;
  if (!empty($grid['xs'])) {
    $attributes['class'][] = 'col-xs-' . $grid['xs'];
  }
  if (!empty($grid['sm'])) {
    $attributes['class'][] = 'col-sm-' . $grid['sm'];
  }
  if (!empty($grid['md'])) {
    $attributes['class'][] = 'col-md-' . $grid['md'];
  }
  if (!empty($grid['lg'])) {
    $attributes['class'][] = 'col-lg-' . $grid['lg'];
  }
  if (!empty($column['settings']['css']['css_class'])) {
    $attributes['class'][] = $column['settings']['css']['css_class'];
  }

  if (!empty($column['settings']['animation']['animate'])) {
    $attributes['class'][] = 'builder-animation';
    $attributes['class'][] = $column['settings']['animation']['animate'];

    $animation = $column['settings']['animation'];
    if (!empty($animation['duration'])) {
      $attributes['data-wow-duration'] = $animation['duration'] . 'ms';
    }
    if (!empty($animation['delay'])) {
      $attributes['data-wow-delay'] = $animation['delay'] . 'ms';
    }
    if (!empty($animation['offset'])) {
      $attributes['data-wow-offset'] = $animation['offset'];
    }
    if (!empty($animation['iteration'])) {
      $attributes['data-wow-iteration'] = $animation['iteration'];
    }
  }
  return drupal_attributes($attributes);
}

function builder_row_attributes($row_id, $row = array(), $i = 1) {
  $attributes = array(
    'class' => array(
      'builder-row',
      'builder-row-item-' . $i
    )
  );
  if ($i == 1) {
    $attributes['class'][] = 'builder-row-first';
  }
  if (!empty($row['settings']['css']['css_class'])) {
    $attributes['class'][] = $row['settings']['css']['css_class'];
  }
  //$row_inner_type = !empty($row['settings']['css']['css_inner_type']) ?  $row['settings']['css']['css_inner_type'] : 'container';
  //$attributes['class'][] = 'builder-grid-' . $row_inner_type;

  if (isset($row['settings']['background']['use_parallax']) && $row['settings']['background']['use_parallax']) {
    $parallax = $row['settings']['background']['parallax'];
    if (!empty($parallax['horizontalOffset'])) {
      $attributes['data-stellar-horizontal-offset'] = $parallax['horizontalOffset'];
    }
    if (!empty($parallax['verticalOffset'])) {
      $attributes['data-stellar-vertical-offset'] = $parallax['verticalOffset'];
    }
    if (isset($parallax['verticalScrolling'])) {
      $attributes['data-stellar-vertical-scrolling'] = $parallax['verticalScrolling'];
    }
    if (isset($parallax['horizontalScrolling'])) {
      $attributes['data-stellar-horizontal-scrolling'] = $parallax['horizontalScrolling'];
    }
    $background_ratio = $parallax['background_ratio'];
    $attributes['data-stellar-background-ratio'] = $background_ratio;
    $attributes['class'][] = 'builder-row-parallax';
  }

  if (!empty($row['settings']['animation']['animate'])) {
    $attributes['class'][] = 'builder-animation';
    $attributes['class'][] = $row['settings']['animation']['animate'];
    $animation = $row['settings']['animation'];
    if (!empty($animation['duration'])) {
      $attributes['data-wow-duration'] = $animation['duration'] . 'ms';
    }
    if (!empty($animation['delay'])) {
      $attributes['data-wow-delay'] = $animation['delay'] . 'ms';
    }
    if (!empty($animation['offset'])) {
      $attributes['data-wow-offset'] = $animation['offset'];
    }
    if (!empty($animation['iteration'])) {
      $attributes['data-wow-iteration'] = $animation['iteration'];
    }
  }


  $css_id = 'builder-row-' . $row['bid'] . '-' . $i;
  $attributes['id'] = !empty($row['settings']['css']['css_id']) ? drupal_html_id($row['settings']['css']['css_id']) : drupal_html_id($css_id);
  return drupal_attributes($attributes);
}

function builder_set_column_css_inline($column, $row_id, $i) {
  $css = '';
  $selector = '.builder-wrapper.buider-wrapper-' . $column['bid'] . ' .builder-row.builder-row-item-' . $row_id . ' .builder-column.builder-column-item-' . $i;
  if (!empty($column['settings']['css']['css_inline'])) {
    $css .= trim($column['settings']['css']['css_inline']);
  }
  if (!empty($css)) {
    $inline_css = $selector . "{ $css }";
    drupal_add_css($inline_css, array('type' => 'inline'));
  }
}

function builder_set_row_css_inline($row, $i = 1) {
  $css = '';
  $selector = '.builder-wrapper.buider-wrapper-' . $row['bid'] . ' .builder-row.builder-row-item-' . $i;
  if (!empty($row['settings']['css']['css_inline'])) {
    $css .= trim($row['settings']['css']['css_inline']);
  }
  if (!empty($row['settings']['background']['background_color'])) {
    $color = $row['settings']['background']['background_color'];
    $css .= "\n";
    $css .= "background-color: $color;";
    $css .= "\n";
  }
  if (!empty($row['settings']['background']['background_image'])) {

    $bg = $row['settings']['background'];
    $background_position = $bg['background_position'];
    $background_repeat = $bg['background_repeat'];
    $background_attachment = $bg['background_attachment'];
    $background_size = $bg['background_size'];

    $fid = $row['settings']['background']['background_image'];
    if ($file = file_load($fid)) {
      $file_url = file_create_url($file->uri);
      $css .= "\n";
      $css .= 'background-image: url("' . $file_url . '");';
      $css .= "\n";
      $css .= "background-position: $background_position; ";
      $css .= "\n";
      $css .= "background-repeat: $background_repeat;";
      $css .= "\n";
      $css .= "background-attachment: $background_attachment;";
      $css .= "\n";
      $css .= "background-size: $background_size;";
    }
  }

  if (isset($row['settings']['background']['use_parallax']) && $row['settings']['background']['use_parallax']) {
    $parallax = $row['settings']['background']['parallax'];
    if (isset($parallax['background_ratio'])) {
      unset($parallax['background_ratio']);
      $css .= "position: relative;";
    }
  }
  if (!empty($css)) {
    $inline_css = $selector . "{ $css }";
    drupal_add_css($inline_css, array('type' => 'inline'));
  }
}

function builder_youtube_video_validate($form, &$form_state) {

  $values = $form_state['values'];
  $url = !empty($values['settings']['youtube_url']) ? $values['settings']['youtube_url'] : '';

  if (!builder_is_youtube($url)) {
    form_set_error('settings][youtube_url', t('Please enter correct Youtube video URL.'));
  }
}

function builder_vimeo_validate($form, &$form_state) {

  $values = $form_state['values'];
  $url = !empty($values['settings']['vimeo_url']) ? $values['settings']['vimeo_url'] : '';

  if (!builder_is_vimeo($url)) {
    form_set_error('settings][vimeo_url', t('Please enter correct Vimeo URL.'));
  }
}

function builder_is_youtube($url) {
  return (preg_match('/youtu\.be/i', $url) || preg_match('/youtube\.com\/watch/i', $url));
}

function builder_is_vimeo($url) {
  return (preg_match('/vimeo\.com/i', $url));
}

function builder_youtube_video_id($url) {
  if (builder_is_youtube($url)) {
    $pattern = '/^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/';
    preg_match($pattern, $url, $matches);
    if (count($matches) && strlen($matches[7]) == 11) {
      return $matches[7];
    }
  }

  return FALSE;
}

function builder_vimeo_video_id($url) {
  if (builder_is_vimeo($url)) {
    $pattern = '/\/\/(www\.)?vimeo.com\/(\d+)($|\/)/';
    preg_match($pattern, $url, $matches);
    if (count($matches)) {
      return $matches[2];
    }
  }

  return FALSE;
}

function builder_generate_unique() {

  $id = uniqid();

  return $id;
}

function _builder_extract_directory($create = TRUE) {
  $directory = &drupal_static(__FUNCTION__, '');
  if (empty($directory)) {
    $directory = 'public://builder_' . builder_generate_unique();
    if ($create && !file_exists($directory)) {
      mkdir($directory);
    }
  }
  return $directory;
}

function _builder_unique_identifier() {
  $id = &drupal_static(__FUNCTION__, '');
  if (empty($id)) {
    $id = substr(hash('sha256', drupal_get_hash_salt()), 0, 8);
  }
  return $id;
}

function builder_tools_extract_archive($file, $directory) {
  $archiver = archiver_get_archiver($file);
  if (!$archiver) {
    throw new Exception(t('Cannot extract %file, not a valid archive.', array('%file' => $file)));
  }
  $files = $archiver->listContents();


  $extract_location = $directory;
  if (file_exists($extract_location)) {
    file_unmanaged_delete_recursive($extract_location);
  }
  $archiver->extract($directory);
  return $archiver;
}

function _builder_tools_import_format_builder($builder, $files) {
  if (!empty($builder->rows)) {

    // create image file if row has background image, and video poster
    $rows = $builder->rows;
    foreach ($rows as $row_key => $row) {

      if (!empty($row['settings']['background']['background_image'])) {
        // this row has background image, so we need also export this image to zip file.
        $row_bg_filename = $row['settings']['background']['background_image'];
        if (!empty($files[$row_bg_filename])) {
          $fid = $files[$row_bg_filename];
          $builder->rows[$row_key]['settings']['settings']['background']['background_image'] = $fid;
        }
      }

      // check for row if has html5 video poster
      if (!empty($row['settings']['video_bg']['videos']['poster'])) {
        $video_filename = $row['settings']['video_bg']['videos']['poster'];
        if (!empty($files[$video_filename])) {
          $fid = $files[$video_filename];
          $builder->rows[$row_key]['settings']['video_bg']['videos']['poster'] = $fid;
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
              // hook_builder_content_import_alter($zip, $content) or hook_builder_content_import_MODULE_DELTA_alter($zip $content).
              drupal_alter(array(
                'builder_content_import',
                "builder_content_import_{$content['module']}_{$delta}"
              ), $files, $content);
              $builder->rows[$row_key]['columns'][$column_key]['contents'][$content_key] = $content;
            }
          }
        }
      }
    }
  }

  return $builder;
}

function _builder_content_permissions($roles = array()) {
  $cache = &drupal_static(__FUNCTION__, array());

  $role_permissions = $fetch = array();

  if ($roles) {
    foreach ($roles as $rid => $name) {
      if (isset($cache[$rid])) {
        $role_permissions[$rid] = $cache[$rid];
      }
      else {
        // Add this rid to the list of those needing to be fetched.
        $fetch[] = $rid;
        // Prepare in case no permissions are returned.
        $cache[$rid] = array();
      }
    }

    if ($fetch) {
      // Get from the database permissions that were not in the static variable.
      // Only role IDs with at least one permission assigned will return rows.
      $result = db_query("SELECT rid, delta FROM {builder_permission} WHERE rid IN (:fetch)", array(':fetch' => $fetch));

      foreach ($result as $row) {
        $cache[$row->rid][$row->delta] = TRUE;
      }
      foreach ($fetch as $rid) {
        // For every rid, we know we at least assigned an empty array.
        $role_permissions[$rid] = $cache[$rid];
      }
    }
  }

  return $role_permissions;
}

function builder_contents_change_permissions($rid, array $permissions = array()) {
  // Grant new permissions for the role.
  $grant = array_filter($permissions);
  if (!empty($grant)) {
    builder_contents_grant_permissions($rid, array_keys($grant));
  }
  // Revoke permissions for the role.
  $revoke = array_diff_assoc($permissions, $grant);
  if (!empty($revoke)) {
    builder_contents_revoke_permissions($rid, array_keys($revoke));
  }
}

function builder_contents_revoke_permissions($rid, array $permissions = array()) {
  // Revoke permissions for the role.
  db_delete('builder_permission')
    ->condition('rid', $rid)
    ->condition('delta', $permissions, 'IN')
    ->execute();
}

function builder_contents_grant_permissions($rid, array $permissions = array()) {
  $modules = builder_contents_get_modules();
  // Grant new permissions for the role.
  foreach ($permissions as $delta) {
    if (!empty($modules[$delta])) {
      db_merge('builder_permission')
        ->key(array(
          'rid' => $rid,
          'delta' => $delta,
        ))
        ->fields(array(
          'module' => $modules[$delta],
        ))
        ->execute();
    }
  }
}

function builder_contents_get_modules() {
  $contents = array();
  foreach (module_implements('builder_content_info') as $module) {
    $content = module_invoke($module, 'builder_content_info');
    foreach ($content as $delta => $value) {
      $value['module'] = $module;

      $contents[$delta] = $module;
    }
  }
  return $contents;
}

function builder_ui_animation_form($default = array()) {

  $animate_options = _builder_ui_animate_list();

  $form['animate'] = array(
    '#title' => t('Animations'),
    '#type' => 'select',
    '#default_value' => isset($default['animate']) ? $default['animate'] : '',
    '#options' => $animate_options,
    '#attributes' => array('class' => array('builder-animation-demo-select')),
    '#field_suffix' => '<strong class="builder-animation-demo">' . t('Animation') . '</strong>',
    '#prefix' => '<div class="builder-ui-animation-wrapper">',
    '#suffix' => '</div>',
  );
  $form['duration'] = array(
    '#title' => t('Duration'),
    '#type' => 'textfield',
    '#description' => t('Change the animation duration. Example: 2000'),
    '#field_suffix' => t('ms'),
    '#default_value' => isset($default['duration']) ? $default['duration'] : '',
  );
  $form['delay'] = array(
    '#title' => t('Delay'),
    '#type' => 'textfield',
    '#description' => t('Delay before the animation starts. Example: 1000'),
    '#field_suffix' => t('ms'),
    '#default_value' => isset($default['delay']) ? $default['delay'] : '',
  );
  $form['offset'] = array(
    '#title' => t('Offset'),
    '#type' => 'textfield',
    '#description' => t('Distance to start the animation (related to the browser bottom). Example: 10'),
    '#default_value' => isset($default['offset']) ? $default['offset'] : '',
  );
  $form['iteration'] = array(
    '#title' => t('Iteration'),
    '#type' => 'textfield',
    '#description' => t('Number of times the animation is repeated, if valule: <strong>infinite</strong> the animation will play forever. Example: 10'),
    '#default_value' => isset($default['iteration']) ? $default['iteration'] : '',
  );
  return $form;
}

/**
 * Return list of css animations for select.
 */
function _builder_ui_animate_list() {

  return array(
    '' => t('None'),
    t('Attention Seekers') => array(
      'bounce' => t('bounce'),
      'flash' => t('flash'),
      'pulse' => t('pulse'),
      'rubberBand' => t('rubberBand'),
      'shake' => t('shake'),
      'swing' => t('swing'),
      'tada' => t('tada'),
      'wobble' => t('wobble'),
      'jello' => t('jello'),
    ),
    t('Bouncing Entrances') => array(
      'bounceIn' => t('bounceIn'),
      'bounceInDown' => t('bounceInDown'),
      'bounceInLeft' => t('bounceInLeft'),
      'bounceInRight' => t('bounceInRight'),
      'bounceInUp' => t('bounceInUp'),
    ),
    t('Bouncing Exits') => array(
      'bounceOut' => t('bounceOut'),
      'bounceOutDown' => t('bounceOutDown'),
      'bounceOutLeft' => t('bounceOutLeft'),
      'bounceOutRight' => t('bounceOutRight'),
      'bounceOutUp' => t('bounceOutUp'),
    ),
    t('Fading Entrances') => array(
      'fadeIn' => t('fadeIn'),
      'fadeInDown' => t('fadeInDown'),
      'fadeInDownBig' => t('fadeInDownBig'),
      'fadeInLeft' => t('fadeInLeft'),
      'fadeInLeftBig' => t('fadeInLeftBig'),
      'fadeInRight' => t('fadeInRight'),
      'fadeInRightBig' => t('fadeInRightBig'),
      'fadeInUp' => t('fadeInUp'),
      'fadeInUpBig' => t('fadeInUpBig'),
    ),
    t('Fading Exits') => array(
      'fadeOut' => t('fadeOut'),
      'fadeOutDown' => t('fadeOutDown'),
      'fadeOutDownBig' => t('fadeOutDownBig'),
      'fadeOutLeft' => t('fadeOutLeft'),
      'fadeOutLeftBig' => t('fadeOutLeftBig'),
      'fadeOutRight' => t('fadeOutRight'),
      'fadeOutRightBig' => t('fadeOutRightBig'),
      'fadeOutUp' => t('fadeOutUp'),
      'fadeOutUpBig' => t('fadeOutUpBig'),
    ),
    t('Flippers') => array(
      'flip' => t('flip'),
      'flipInX' => t('flipInX'),
      'flipInY' => t('flipInY'),
      'flipOutX' => t('flipOutX'),
      'flipOutY' => t('flipOutY'),
    ),
    t('Lightspeed') => array(
      'lightSpeedIn' => t('lightSpeedIn'),
      'lightSpeedOut' => t('lightSpeedOut'),
    ),
    t('Rotating Entrances') => array(
      'rotateIn' => t('rotateIn'),
      'rotateInDownLeft' => t('rotateInDownLeft'),
      'rotateInDownRight' => t('rotateInDownRight'),
      'rotateInUpLeft' => t('rotateInUpLeft'),
      'rotateInUpRight' => t('rotateInUpRight'),
    ),
    t('Rotating Exits') => array(
      'rotateOut' => t('rotateOut'),
      'rotateOutDownLeft' => t('rotateOutDownLeft'),
      'rotateOutDownRight' => t('rotateOutDownRight'),
      'rotateOutUpLeft' => t('rotateOutUpLeft'),
      'rotateOutUpRight' => t('rotateOutUpRight'),
    ),
    t('Sliding Entrances') => array(
      'slideInUp' => t('slideInUp'),
      'slideInDown' => t('slideInDown'),
      'slideInLeft' => t('slideInLeft'),
      'slideInRight' => t('slideInRight'),
    ),
    t('Sliding Exits') => array(
      'slideOutUp' => t('slideOutUp'),
      'slideOutDown' => t('slideOutDown'),
      'slideOutLeft' => t('slideOutLeft'),
      'slideOutRight' => t('slideOutRight'),
    ),
    t('Zoom Entrances') => array(
      'zoomIn' => t('zoomIn'),
      'zoomInDown' => t('zoomInDown'),
      'zoomInLeft' => t('zoomInLeft'),
      'zoomInRight' => t('zoomInRight'),
      'zoomInUp' => t('zoomInUp'),
    ),
    t('Zoom Exits') => array(
      'zoomOut' => t('zoomOut'),
      'zoomOutDown' => t('zoomOutDown'),
      'zoomOutLeft' => t('zoomOutLeft'),
      'zoomOutRight' => t('zoomOutRight'),
      'zoomOutUp' => t('zoomOutUp'),
    ),
    t('Specials') => array(
      'hinge' => t('hinge'),
      'rollIn' => t('rollIn'),
      'rollOut' => t('rollOut'),
    ),
  );
}
