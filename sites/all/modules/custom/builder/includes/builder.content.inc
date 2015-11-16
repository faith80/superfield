<?php

/**
 * List all contents information from modules use hook_builder_content_info()
 */
function builder_content_load_contents() {
  global $user;
  $contents = &drupal_static(__FUNCTION__);
  $cache_id_key = 'builder_contents_all_' . $user->uid;
  if (!isset($contents)) {
    if ($cache = cache_get($cache_id_key)) {
      $contents = $cache->data;
    }
    else {
      $contents = array();
      foreach (module_implements('builder_content_info') as $module) {
        // allows developer call from other module with HOOK_builder_content_info()
        $builder_module_contents = module_invoke($module, 'builder_content_info');
        foreach ($builder_module_contents as $delta => $content) {
          $content['module'] = $module;
          $content['delta'] = $delta;
          if (builder_content_access($delta, $user)) {
            $contents[$module][$delta] = $content;
          }
        }
      }
      cache_set($cache_id_key, $contents, 'cache');
    }
  }
  return $contents;
}

/**
 * rerurn content information of module with delta.
 * Return FALSE, if not found content.
 */
function builder_content_load($module, $delta) {
  $contents = builder_content_load_contents();

  if (isset($contents[$module][$delta])) {

    return $contents[$module][$delta];
  }
  return FALSE;
}

function builder_content_render_load($content) {
  $array = module_invoke($content['module'], 'builder_content_view', $content['delta'], $content);

  // Valid PHP function names cannot contain hyphens.
  $delta = str_replace('-', '_', $content['delta']);
  // Allow modules to modify the content before it is viewed.
  // hook_builder_content_view_alter() or hook_builder_content_view_MODULE_DELTA_alter().
  drupal_alter(array(
    'builder_content_view',
    "builder_content_view_{$content['module']}_{$delta}"
  ), $array, $content);
  if (isset($array) && is_array($array)) {
    foreach ($array as $k => $v) {
      $content[$k] = $v;
    }
  }
  if (isset($content['content']) && $content['content']) {
    if (is_string($content['content'])) {
      $content['content'] = array('#markup' => $content['content']);
    }
    // Override default block title if a custom display title is present.
    if ($content['title']) {
      $content['title'] = $content['title'] == '<none>' ? '' : ($content['title']);
      $content['subject'] = $content['title'] == '<none>' ? '' : ($content['title']);
    }
    if (!isset($content['subject'])) {
      $content['subject'] = '';
    }
  }

  return $content;
}

function builder_content_check_visiblity_rules($content) {
  global $user;
  $empty_arr = array();
  $rules = isset($content['rules']) ? $content['rules'] : $empty_arr;

  $roles_value = !empty($rules['roles']['settings']) ? $rules['roles']['settings'] : $empty_arr;
  $permissions = !empty($rules['permissions']['settings']) ? $rules['permissions']['settings'] : '';
  $roles = array();
  if (!empty($roles_value)) {
    $filter = array_filter($roles_value);
    $roles = array_values($filter);
  }

  if (!empty($roles) && !array_intersect($roles, array_keys($user->roles))) {
    return FALSE;
  }
  if (!empty($permissions)) {
    if (!user_access($permissions)) {
      return FALSE;
    }
  }
  return TRUE;
}

function builder_content_build($content) {


  $content_load = builder_content_render_load($content);
  $build = array();
  $key = $content['module'] . '__' . $content['delta'];
  if (isset($content_load['content'])) {
    $build[$key] = $content_load['content'];
    unset($content_load['content']);
  }
  $build[$key]['#content'] = $content_load;
  $build[$key]['#theme_wrappers'][] = 'builder_content';

  return $build;
}

function builder_content_configure_form($form, &$form_state) {
  $builder = $form_state['builder'];
  $row_id = $form_state['row_id'];
  $column_id = $form_state['column_id'];
  $content_is_new = TRUE;
  if ($form_state['content_is_new']) {
    $content = builder_content_load($form_state['module'], $form_state['delta']);
  }
  if (!$form_state['content_is_new']) {
    $content_is_new = FALSE;
    $content_id = $form_state['content_id'];
    $content = $builder->rows[builder_get_row_key($row_id)]['columns'][builder_get_column_key($column_id)]['contents'][builder_get_content_key($content_id)];
    $form['content_id'] = array(
      '#type' => 'value',
      '#value' => $content_id,
    );
  }
  $form['builder'] = array(
    '#type' => 'value',
    '#value' => $builder,
  );
  $form['row_id'] = array(
    '#type' => 'value',
    '#value' => $row_id,
  );
  $form['column_id'] = array(
    '#type' => 'value',
    '#value' => $column_id,
  );
  $form['content'] = array(
    '#type' => 'value',
    '#value' => $content,
  );
  $form['content_is_new'] = array(
    '#type' => 'value',
    '#value' => $content_is_new,
  );
  $title_default_value = isset($content['title']) ? $content['title'] : '';
  if ($content_is_new) {
    $title_default_value = $content['info'];
  }


  $form['settings'] = array(
    '#tree' => TRUE,
  );

  $title_type = 'textfield';
  if (!empty($content['no_title'])) {
    $title_type = 'hidden';
  }
  $form['settings']['title'] = array(
    '#type' => $title_type,
    '#title' => t('Title'),
    '#maxlength' => 255,
    '#default_value' => $title_default_value,
    '#weight' => -19,
  );


  if ($settings = module_invoke($content['module'], 'builder_content_configure', $content['delta'], $content)) {
    foreach ($settings as $k => $v) {
      if ($k == '#validate' || $k == '#submit') {
        if (!empty($v[0])) {
          // we need add form submit or validates.
          $form[$k][] = $v[0];
        }
      }
      else {
        $form['settings'][$k] = $v;
      }
    }
  }


  // do visiblity rules settings here. For editing content.
  $form['builder_content_tabs'] = array(
    '#type' => 'vertical_tabs',
    '#title' => t('Advanced settings'),
  );
  $form['rules'] = array(
    '#tree' => TRUE,
    '#group' => 'builder_content_tabs',
    '#type' => 'fieldset',
    '#title' => t('Visibility settings'),
    '#collapsible' => TRUE,
    '#collapsed' => FALSE,
  );
  $form['rules']['roles'] = array(
    '#type' => 'fieldset',
    '#title' => t('Roles'),
    '#collapsible' => TRUE,
    '#collapsed' => TRUE,
    '#tree' => TRUE,
  );
  // Per-role visibility.

  $empty_arr = array();
  $default_role_options = isset($content['rules']['roles']['settings']) ? $content['rules']['roles']['settings'] : $empty_arr;
  $role_options = array_map('check_plain', user_roles());

  $form['rules']['roles']['settings'] = array(
    '#type' => 'checkboxes',
    '#title' => t('Show content for specific roles'),
    '#default_value' => $default_role_options,
    '#options' => $role_options,
    '#description' => t('Show this block only for the selected role(s). If you select no roles, the block will be visible to all users.'),
  );

  $form['rules']['permissions'] = array(
    '#type' => 'fieldset',
    '#title' => t('Permissions'),
    '#collapsible' => TRUE,
    '#collapsed' => TRUE,
    '#tree' => TRUE,
  );
  $perm_options = array('' => t('None'));
  foreach (module_list(FALSE, FALSE, TRUE) as $module) {
    if ($permissions = module_invoke($module, 'permission')) {
      foreach ($permissions as $k => $v) {
        $perm_options[$module][$k] = $v['title'];
      }
    }
  }

  $form['rules']['permissions']['settings'] = array(
    '#type' => 'select',
    '#title' => t('Permission for current user'),
    '#default_value' => isset($content['rules']['permissions']['settings']) ? $content['rules']['permissions']['settings'] : $empty_arr,
    '#options' => $perm_options,
    '#description' => t('Only users with the selected permission flag will be able to access this.'),
  );


  $form['animation'] = array(
    '#tree' => TRUE,
    '#group' => 'builder_content_tabs',
    '#type' => 'fieldset',
    '#title' => t('Animation settings'),
    '#collapsible' => TRUE,
    '#collapsed' => FALSE,
  );
  $animation_default_values = array();
  if (isset($content['animation'])) {
    $animation_default_values = $content['animation'];
  }
  $form['animation'] += builder_ui_animation_form($animation_default_values);


  $form['actions'] = array('#type' => 'actions');
  $form['actions']['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Save'),
  );
  if (!$content_is_new) {
    $form['actions']['delete'] = array(
      '#type' => 'submit',
      '#value' => t('Delete'),
    );
  }
  return $form;
}

/**
 * Submit handle for adding content
 */
function builder_content_configure_form_submit($form, &$form_state) {

  $values = $form_state['values'];

  $op = $values['op'];
  $builder = $values['builder'];
  $builder_cache_id = $builder->cache_id;
  $row_id = $values['row_id'];
  $column_id = $values['column_id'];
  $content = $values['content'];
  $content['title'] = isset($values['settings']['title']) ? $values['settings']['title'] : '';
  $content['settings'] = $values['settings'];
  if (isset($values['rules'])) {
    $content['rules'] = $values['rules'];
  }
  if (isset($values['animation'])) {
    $content['animation'] = $values['animation'];
  }
  if ($op == t('Delete')) {
    // delete content from builder object
    $content_id = $values['content_id'];
    if (isset($builder->rows[builder_get_row_key($row_id)]['columns'][builder_get_column_key($column_id)]['contents'][builder_get_content_key($content_id)])) {
      unset($builder->rows[builder_get_row_key($row_id)]['columns'][builder_get_column_key($column_id)]['contents'][builder_get_content_key($content_id)]);

      if (!empty($builder->rows[builder_get_row_key($row_id)]['columns'][builder_get_column_key($column_id)]['contents'])) {
        $contents = array_values($builder->rows[builder_get_row_key($row_id)]['columns'][builder_get_column_key($column_id)]['contents']);
        $builder->rows[builder_get_row_key($row_id)]['columns'][builder_get_column_key($column_id)]['contents'] = $contents;
      }

      builder_cache_set($builder_cache_id, $builder);

      // Available for HOOK_builder_content_delete($delta, $edit = array())
      module_invoke($content['module'], 'builder_content_delete', $content['delta'], $form_state['values']);
    }
  }
  else {
    if ($op == t('Save')) {

      // Available for HOOK_builder_content_configure_submit($delta = "", $content= array())
      if (isset($content['module']) && isset($content['delta'])) {
        module_invoke($content['module'], 'builder_content_configure_submit', $content['delta'], $content);
      }

      // insert content to builder
      if ($values['content_is_new']) {
        $new_content_id = !empty($builder->rows[builder_get_row_key($row_id)]['columns'][builder_get_column_key($column_id)]['contents']) ? count($builder->rows[builder_get_row_key($row_id)]['columns'][builder_get_column_key($column_id)]['contents']) : 0;
        $builder->rows[builder_get_row_key($row_id)]['columns'][builder_get_column_key($column_id)]['contents'][builder_get_content_key($new_content_id)] = $content;

        $weight = 1;
        if (!empty($builder->rows[builder_get_row_key($row_id)]['columns'][builder_get_column_key($column_id)]['contents'])) {
          $weight = builder_find_max_weight($builder->rows[builder_get_row_key($row_id)]['columns'][builder_get_column_key($column_id)]['contents']);
        }
        $builder->rows[builder_get_row_key($row_id)]['columns'][builder_get_column_key($column_id)]['contents'][builder_get_content_key($new_content_id)]['weight'] = $weight;
        builder_cache_set($builder_cache_id, $builder);

        // Available for HOOK_builder_content_insert($delta, $edit = array())
        module_invoke($content['module'], 'builder_content_insert', $content['delta'], $form_state['values']);
      }
      else {
        // update current content of builder
        $update_content_id = $values['content_id'];
        $builder->rows[builder_get_row_key($row_id)]['columns'][builder_get_column_key($column_id)]['contents'][builder_get_content_key($update_content_id)] = $content;

        builder_cache_set($builder_cache_id, $builder);
        //Available for HOOK_builder_content_update($delta, $edit = array())
        module_invoke($content['module'], 'builder_content_update', $content['delta'], $form_state['values']);
      }
    }
  }
}

function builder_content_attributes($content, $classes = "") {
  $attributes = array();

  if (!empty($classes)) {
    $attributes['class'][] = $classes;
  }
  if (!empty($content['animation']['animate'])) {
    $animation = $content['animation'];

    $attributes['class'][] = 'builder-animation';
    $attributes['class'][] = $animation['animate'];

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
