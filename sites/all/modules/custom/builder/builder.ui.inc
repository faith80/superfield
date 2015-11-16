<?php

/**
 * Page callback for row edit page
 */
function builder_row_edit_page($js = NULL, $builder_cache_id, $row_id) {

  $builder = builder_cache_get($builder_cache_id);
  $form_state = array(
      'title' => t('Row settings'),
      'ajax' => TRUE,
      'builder' => $builder,
      'row_id' => $row_id,
  );

  if (!$js) {
    $builder_form = drupal_build_form('builder_row_edit_form', $form_state);
    return render($builder_form);
  }
  ctools_include('modal');
  ctools_include('ajax');


  $output = ctools_modal_form_wrapper('builder_row_edit_form', $form_state);

  if (!empty($form_state['executed'])) {

    // We'll just overwrite the form output if it was successful.
    $output = array();
    $id_row_prefix = 'builder_' . $builder_cache_id . '_row_' . $row_id;
    $content = theme('builder_ui_row', array('builder' => $builder, 'row_id' => $row_id));
    $output[] = ajax_command_html('#' . $id_row_prefix, $content);
    $output[] = ctools_modal_command_dismiss();

    if (isset($form_state['delete_row_id']) && is_numeric($form_state['delete_row_id']) && $row_id == $form_state['delete_row_id']) {

      $output = array();
      $builder_id_ajax_prefix = 'builder-ui-ajax-wrapper' . $builder_cache_id;
      $content = theme('builder_ui', array('builder' => $builder));
      $output[] = ajax_command_html('#' . $builder_id_ajax_prefix, $content);
      $output[] = ctools_modal_command_dismiss();
    }
  }
  print ajax_render($output);
  exit;
}

/**
 * Page callback for add/edit column
 */
function builder_column_edit_page($js = NULL, $builder_cache_id, $row_id, $column_id = NULL) {

  $builder = builder_cache_get($builder_cache_id);
  $form_state = array(
      'title' => t('Column settings'),
      'ajax' => TRUE,
      'builder' => $builder,
      'row_id' => $row_id,
  );
  if (isset($column_id)) {

    $form_state['column_id'] = $column_id;
  }

  if (!$js) {
    $builder_form = drupal_build_form('builder_column_edit_form', $form_state);
    return render($builder_form);
  }
  ctools_include('modal');
  ctools_include('ajax');


  $output = ctools_modal_form_wrapper('builder_column_edit_form', $form_state);


  if (!empty($form_state['executed'])) {
    // We'll just overwrite the form output if it was successful.
    $output = array();
    $id_row_prefix = 'builder_' . $builder_cache_id . '_row_' . $row_id;
    $content = theme('builder_ui_row', array('builder' => $builder, 'row_id' => $row_id));
    $output[] = ajax_command_html('#' . $id_row_prefix, $content);
    $output[] = ctools_modal_command_dismiss();
  }
  print ajax_render($output);
  exit;
}

/**
 * Edit row form
 */
function builder_row_edit_form($form, &$form_state) {

  $builder = $form_state['builder'];
  $row_id = $form_state['row_id'];
  $form['builder'] = array(
      '#type' => 'value',
      '#value' => $builder,
  );
  $form['row_id'] = array(
      '#type' => 'value',
      '#value' => $row_id,
  );

  $row_settings = isset($builder->rows[builder_get_row_key($row_id)]['settings']) ? $builder->rows[builder_get_row_key($row_id)]['settings'] : array();
  $form['title'] = array(
      '#type' => 'textfield',
      '#title' => t('Title'),
      '#default_value' => isset($row_settings['title']) ? $row_settings['title'] : '',
  );

  $form['row_settings_vertical_tabs'] = array(
      '#type' => 'vertical_tabs',
  );

  $form['settings'] = array(
      '#tree' => TRUE,
  );
  $form['settings']['css'] = array(
      '#type' => 'fieldset',
      '#title' => t('Style settings'),
      '#collapsible' => TRUE,
      '#collapsed' => FALSE,
      '#group' => 'row_settings_vertical_tabs',
  );
  $form['settings']['css']['css_id'] = array(
      '#type' => 'textfield',
      '#title' => t('CSS ID'),
      '#default_value' => isset($row_settings['css']['css_id']) ? $row_settings['css']['css_id'] : '',
  );
  $form['settings']['css']['css_class'] = array(
      '#type' => 'textfield',
      '#title' => t('CSS Class'),
      '#default_value' => isset($row_settings['css']['css_class']) ? $row_settings['css']['css_class'] : '',
  );
  $form['settings']['css']['css_inline'] = array(
      '#type' => 'textarea',
      '#title' => t('Custom css'),
      '#default_value' => isset($row_settings['css']['css_inline']) ? $row_settings['css']['css_inline'] : '',
      '#description' => t('Custom your own css for this row. Example: <strong>font-size: 100%; height: 300px;</strong>'),
  );
  $form['settings']['css']['css_inner_type'] = array(
      '#type' => 'select',
      '#title' => t('Inner type'),
      '#default_value' => isset($row_settings['css']['css_inner_type']) ? $row_settings['css']['css_inner_type'] : 'full-width',
      '#options' => array(
          'container' => t('Container'),
          'full-width' => t('Full width'),
      ),
  );

  $form['settings']['background'] = array(
      '#type' => 'fieldset',
      '#title' => t('Background settings'),
      '#collapsible' => TRUE,
      '#collapsed' => FALSE,
      '#group' => 'row_settings_vertical_tabs',
  );
  $form['settings']['background']['background_color'] = array(
      '#type' => 'textfield',
      '#title' => t('Background color'),
      '#default_value' => isset($row_settings['background']['background_color']) ? $row_settings['background']['background_color'] : '',
      '#attributes' => array('class' => array('builder-color-selector-input')),
      '#prefix' => '<div class="builder-color-selector-wrapper">',
      '#suffix' => '<div class="builder-color-selector"></div></div>'
  );
  $form['settings']['background']['background_image'] = array(
      '#type' => 'managed_file',
      '#title' => t('Background image'),
      '#description' => t('Allowed extensions: gif png jpg jpeg'),
      '#default_value' => isset($row_settings['background']['background_image']) ? $row_settings['background']['background_image'] : '',
      '#upload_location' => 'public://',
      '#upload_validators' => array(
          'file_validate_extensions' => array('gif png jpg jpeg'),
          // Pass the maximum file size in bytes
          'file_validate_size' => array(10 * 3024 * 3024),
      ),
  );
  $form['settings']['background']['background_position'] = array(
      '#type' => 'textfield',
      '#title' => t('Background position'),
      '#description' => t('Example: <strong>center top</strong> Or <strong> 0% 0%</strong> or <strong>inherit</strong> ...'),
      '#default_value' => !empty($row_settings['background']['background_position']) ? $row_settings['background']['background_position'] : '0% 0%',
  );
  $form['settings']['background']['background_repeat'] = array(
      '#type' => 'select',
      '#title' => t('Background repeat'),
      '#description' => t('Example: <strong>repeat</strong> or, <strong>no-repeat</strong> or <strong>repeat-x</strong> or <strong>repeat-y</strong>'),
      '#default_value' => isset($row_settings['background']['background_repeat']) ? $row_settings['background']['background_repeat'] : 'no-repeat',
      '#options' => array(
          'repeat' => 'repeat',
          'repeat-x' => 'repeat-x',
          'repeat-y' => 'repeat-y',
          'no-repeat' => 'no-repeat',
          'initial' => 'initial',
          'inherit' => 'inherit',
      ),
  );
  $form['settings']['background']['background_attachment'] = array(
      '#type' => 'select',
      '#title' => t('Background attachment'),
      '#description' => t('Example: <strong>repeat</strong> or, <strong>no-repeat</strong>'),
      '#default_value' => isset($row_settings['background']['background_attachment']) ? $row_settings['background']['background_attachment'] : 'scroll',
      '#options' => array(
          'scroll' => 'scroll',
          'fixed' => 'fixed',
          'local' => 'local',
          'initial' => 'initial',
          'inherit' => 'inherit',
      ),
  );
  $form['settings']['background']['background_size'] = array(
      '#type' => 'textfield',
      '#title' => t('Background size'),
      '#description' => t('Example: <strong>auto</strong> Or <strong>cover</strong> or <strong>100% 100%</strong> or <strong>inherit</strong> ...'),
      '#default_value' => !empty($row_settings['background']['background_size']) ? $row_settings['background']['background_size'] : 'auto',
  );

  $form['settings']['background']['use_parallax'] = array(
      '#type' => 'checkbox',
      '#title' => t('[Beta] Use parallax background'),
      '#default_value' => isset($row_settings['background']['use_parallax']) ? $row_settings['background']['use_parallax'] : 0,
  );
  $form['settings']['background']['parallax'] = array(
      '#type' => 'fieldset',
      '#title' => t('Parallax settings'),
      '#weight' => 5,
      '#collapsible' => TRUE,
      '#collapsed' => FALSE,
      '#states' => array(
          'visible' => array(':input[name="settings[background][use_parallax]"]' => array('checked' => TRUE)),
      ),
  );
  $empty_arr = array();
  $parallax = isset($row_settings['background']['parallax']) ? $row_settings['background']['parallax'] : $empty_arr;

  $form['settings']['background']['parallax']['background_ratio'] = array(
      '#type' => 'textfield',
      '#title' => t('Background ratio'),
      '#default_value' => isset($parallax['background_ratio']) ? $parallax['background_ratio'] : 0.5,
  );

  $form['settings']['background']['parallax']['horizontalScrolling'] = array(
      '#type' => 'checkbox',
      '#title' => t('Horizontal scrolling'),
      '#default_value' => isset($parallax['horizontalScrolling']) ? $parallax['horizontalScrolling'] : TRUE,
  );
  $form['settings']['background']['parallax']['verticalScrolling'] = array(
      '#type' => 'checkbox',
      '#title' => t('Vertical scrolling'),
      '#default_value' => isset($parallax['verticalScrolling']) ? $parallax['verticalScrolling'] : TRUE,
  );
  $form['settings']['background']['parallax']['horizontalOffset'] = array(
      '#type' => 'textfield',
      '#title' => t('Horizontal offset'),
      '#default_value' => isset($parallax['horizontalOffset']) ? $parallax['horizontalOffset'] : 0,
  );
  $form['settings']['background']['parallax']['verticalOffset'] = array(
      '#type' => 'textfield',
      '#title' => t('Vertical offset'),
      '#default_value' => isset($parallax['verticalOffset']) ? $parallax['verticalOffset'] : 0,
  );

  // html5 video backgorund
  $form['settings']['video_bg'] = array(
      '#type' => 'fieldset',
      '#title' => t('Video background'),
      '#collapsible' => TRUE,
      '#collapsed' => FALSE,
      '#group' => 'row_settings_vertical_tabs',
  );
  $form['settings']['video_bg']['videos'] = array(
      '#type' => 'fieldset',
      '#title' => t('Videos'),
      '#collapsible' => TRUE,
      '#collapsed' => FALSE,
  );

  $form['settings']['video_bg']['videos']['mp4'] = array(
      '#type' => 'managed_file',
      '#title' => t('MP4'),
      '#description' => t('Allowed extensions: mp4'),
      '#default_value' => isset($row_settings['video_bg']['videos']['mp4']) ? $row_settings['video_bg']['videos']['mp4'] : '',
      '#upload_location' => 'public://',
      '#upload_validators' => array(
          'file_validate_extensions' => array('mp4'),
          // Pass the maximum file size in bytes
          'file_validate_size' => array(1024 * 1280 * 800),
      ),
  );
  $form['settings']['video_bg']['videos']['webm'] = array(
      '#type' => 'managed_file',
      '#title' => t('Webm'),
      '#description' => t('Allowed extensions: webm'),
      '#default_value' => isset($row_settings['video_bg']['videos']['webm']) ? $row_settings['video_bg']['videos']['webm'] : '',
      '#upload_location' => 'public://',
      '#upload_validators' => array(
          'file_validate_extensions' => array('webm'),
          // Pass the maximum file size in bytes
          'file_validate_size' => array(1024 * 1280 * 800),
      ),
  );
  $form['settings']['video_bg']['videos']['ogv'] = array(
      '#type' => 'managed_file',
      '#title' => t('Ogv'),
      '#description' => t('Allowed extensions: ogv'),
      '#default_value' => isset($row_settings['video_bg']['videos']['ogv']) ? $row_settings['video_bg']['videos']['ogv'] : '',
      '#upload_location' => 'public://',
      '#upload_validators' => array(
          'file_validate_extensions' => array('ogv'),
          // Pass the maximum file size in bytes
          'file_validate_size' => array(1024 * 1280 * 800),
      ),
  );
  $form['settings']['video_bg']['videos']['poster'] = array(
      '#type' => 'managed_file',
      '#title' => t('Poster image'),
      '#description' => t('Allowed extensions: gif png jpg jpeg'),
      '#default_value' => isset($row_settings['video_bg']['videos']['poster']) ? $row_settings['video_bg']['videos']['poster'] : '',
      '#upload_location' => 'public://',
      '#upload_validators' => array(
          'file_validate_extensions' => array('jgif png jpg jpeg'),
          // Pass the maximum file size in bytes
          'file_validate_size' => array(10 * 3024 * 3024),
      ),
  );

  $form['settings']['video_bg']['options'] = array(
      '#type' => 'fieldset',
      '#title' => t('Options'),
      '#collapsible' => TRUE,
      '#collapsed' => TRUE,
  );

  $form['settings']['video_bg']['options']['muted'] = array(
      '#type' => 'checkbox',
      '#title' => t('Muted'),
      '#default_value' => isset($row_settings['video_bg']['options']['muted']) ? $row_settings['video_bg']['options']['muted'] : TRUE,
  );
  $form['settings']['video_bg']['options']['loop'] = array(
      '#type' => 'checkbox',
      '#title' => t('Loop'),
      '#default_value' => isset($row_settings['video_bg']['options']['loop']) ? $row_settings['video_bg']['options']['loop'] : TRUE,
  );
  $form['settings']['video_bg']['options']['autoplay'] = array(
      '#type' => 'checkbox',
      '#title' => t('Auto play'),
      '#default_value' => isset($row_settings['video_bg']['options']['autoplay']) ? $row_settings['video_bg']['options']['autoplay'] : TRUE,
  );
  $form['settings']['video_bg']['options']['resizing'] = array(
      '#type' => 'checkbox',
      '#title' => t('Auto-resizing'),
      '#default_value' => isset($row_settings['video_bg']['options']['resizing']) ? $row_settings['video_bg']['options']['resizing'] : TRUE,
  );

  $animation_default_values = array();
  if (isset($row_settings['animation'])) {
    $animation_default_values = $row_settings['animation'];
  }
  $form['settings']['animation'] = array(
      '#type' => 'fieldset',
      '#title' => t('Animation settings'),
      '#collapsible' => TRUE,
      '#collapsed' => FALSE,
      '#group' => 'row_settings_vertical_tabs',
  );
  $form['settings']['animation']+= builder_ui_animation_form($animation_default_values);


  $form['actions'] = array('#type' => 'actions');
  $form['actions']['submit'] = array(
      '#type' => 'submit',
      '#value' => t('Save'),
  );
  $form['actions']['delete'] = array(
      '#type' => 'submit',
      '#value' => t('Delete'),
  );

  return $form;
}

/**
 * Submit handle for Row settings form
 */
function builder_row_edit_form_submit($form, &$form_state) {

  $values = $form_state['values'];
  $op = $values['op'];
  $builder = $values['builder'];
  $builder_cache_id = $builder->cache_id;
  $row_id = $values['row_id'];
  if ($op == t('Delete')) {
    // we do remove row here.
    $form_state['delete_row_id'] = $row_id;
    $row_deleted = isset($builder->pending_actions['rows_deleted']) ? $builder->pending_actions['rows_deleted'] : array();
    $row_deleted[] = $values['row_id'];
    $builder->pending_actions['rows_deleted'] = $row_deleted;
    //$builder->rows[builder_get_row_key($row_id)] = array();
    if (isset($builder->rows[builder_get_row_key($row_id)])) {
      unset($builder->rows[builder_get_row_key($row_id)]);
    }
    if (!empty($builder->rows)) {
      $rows = array_values($builder->rows); // re-index items of rows in array, after removing a row.
      $builder->rows = $rows;
    }
  } else {
    // save row settings here
    $builder->rows[builder_get_row_key($row_id)]['title'] = $values['title'];
    $builder->rows[builder_get_row_key($row_id)]['settings'] = $values['settings'];
    $builder->rows[builder_get_row_key($row_id)]['settings']['title'] = $values['title'];
  }
  builder_cache_set($builder_cache_id, $builder);
}

/**
 * Add/edit column form
 */
function builder_column_edit_form($form, &$form_state) {
  $column_id = NULL;
  $builder = $form_state['builder'];
  $row_id = $form_state['row_id'];
  $form['builder'] = array(
      '#type' => 'value',
      '#value' => $builder,
  );
  $form['row_id'] = array(
      '#type' => 'value',
      '#value' => $row_id,
  );
  if (isset($form_state['column_id'])) {
    $column_id = $form_state['column_id'];
    $form['column_id'] = array(
        '#type' => 'value',
        '#value' => $column_id,
    );
  }

  $column = isset($builder->rows[builder_get_row_key($row_id)]['columns'][builder_get_column_key($column_id)]) ? $builder->rows[builder_get_row_key($row_id)]['columns'][builder_get_column_key($column_id)] : array();
  $form['title'] = array(
      '#type' => 'textfield',
      '#title' => t('Title'),
      '#default_value' => isset($column['settings']['title']) ? $column['settings']['title'] : '',
  );

  $form['column_settings_vertical_tabs'] = array(
      '#type' => 'vertical_tabs',
  );

  $form['settings'] = array(
      '#tree' => TRUE,
  );

  $form['settings']['grid'] = array(
      '#type' => 'fieldset',
      '#title' => t('Grid size settings'),
      '#collapsible' => TRUE,
      '#collapsed' => FALSE,
      '#tree' => TRUE,
      '#group' => 'column_settings_vertical_tabs',
  );


  $grid_options = array(
      '' => t('None')
  );
  for ($i = 1; $i <= 12; $i++) {
    $grid_options[$i] = $i;
  }
  $form['settings']['grid']['lg'] = array(
      '#type' => 'select',
      '#title' => t('Large devices Desktops: col-lg-'),
      '#options' => $grid_options,
      '#default_value' => isset($column['settings']['grid']['lg']) ? $column['settings']['grid']['lg'] : 3,
  );
  $form['settings']['grid']['md'] = array(
      '#type' => 'select',
      '#title' => t('Medium devices Desktops: col-md-'),
      '#options' => $grid_options,
      '#default_value' => isset($column['settings']['grid']['md']) ? $column['settings']['grid']['md'] : 3,
  );
  $form['settings']['grid']['sm'] = array(
      '#type' => 'select',
      '#title' => t('Small devices: col-sm-'),
      '#options' => $grid_options,
      '#default_value' => isset($column['settings']['grid']['sm']) ? $column['settings']['grid']['sm'] : '',
  );

  $form['settings']['grid']['xs'] = array(
      '#type' => 'select',
      '#title' => t('Extra small devices: col-xs-'),
      '#options' => $grid_options,
      '#default_value' => isset($column['settings']['grid']['xs']) ? $column['settings']['grid']['xs'] : '',
  );

  $form['settings']['css'] = array(
      '#type' => 'fieldset',
      '#title' => t('Styles settings'),
      '#collapsible' => TRUE,
      '#collapsed' => FALSE,
      '#tree' => TRUE,
      '#group' => 'column_settings_vertical_tabs',
  );
  $form['settings']['animation'] = array(
      '#type' => 'fieldset',
      '#title' => t('Animation settings'),
      '#collapsible' => TRUE,
      '#collapsed' => FALSE,
      '#tree' => TRUE,
      '#group' => 'column_settings_vertical_tabs',
  );
  $animation_default_values = array();
  if (isset($column['settings']['animation'])) {
    $animation_default_values = $column['settings']['animation'];
  }
  $form['settings']['animation']+= builder_ui_animation_form($animation_default_values);
  $empty_array = array();
  $css = isset($column['settings']['css']) ? $column['settings']['css'] : $empty_array;

  $form['settings']['css']['css_class'] = array(
      '#type' => 'textfield',
      '#title' => t('CSS class'),
      '#default_value' => isset($css['css_class']) ? $css['css_class'] : '',
  );
  $form['settings']['css']['css_inline'] = array(
      '#type' => 'textarea',
      '#title' => t('Custom css'),
      '#default_value' => isset($css['css_inline']) ? $css['css_inline'] : '',
      '#description' => t('Custom your own css for this column. Example: <strong>height: 200px; border: 1px solid #ccc;</strong>')
  );

  $form['settings']['extra'] = array(
      '#type' => 'fieldset',
      '#title' => t('Advanced settings'),
      '#collapsible' => TRUE,
      '#collapsed' => FALSE,
      '#tree' => TRUE,
      '#group' => 'column_settings_vertical_tabs',
  );
  $form['settings']['extra']['hide_on_empty'] = array(
      '#type' => 'checkbox',
      '#title' => t('Hide column if empty'),
      '#default_value' => isset($column['settings']['extra']['hide_on_empty']) ? $column['settings']['extra']['hide_on_empty'] : FALSE,
  );

  $form['actions'] = array('#type' => 'actions');
  $form['actions']['submit'] = array(
      '#type' => 'submit',
      '#value' => t('Save'),
  );
  if (isset($column_id)) {
    $form['actions']['delete'] = array(
        '#type' => 'submit',
        '#value' => t('Delete'),
    );
  }
  return $form;
}

/**
 * Form submit handle for column settings form.
 */
function builder_column_edit_form_submit($form, &$form_state) {

  $values = $form_state['values'];
  $op = $values['op'];
  $builder = $values['builder'];
  $builder_cache_id = $builder->cache_id;
  $row_id = $values['row_id'];
  // if column is new (get last item array of rows.
  $column_id = isset($builder->rows[builder_get_row_key($row_id)]['columns']) ? count($builder->rows[builder_get_row_key($row_id)]['columns']) : 0;

  $add_new = TRUE;
  if (isset($values['column_id'])) { // if update column
    $column_id = $values['column_id'];
    if ($op == t('Delete')) {
      $add_new = FALSE;
      // if delete an column
      if (isset($builder->rows[builder_get_row_key($row_id)]['columns'][builder_get_column_key($column_id)])) {
        unset($builder->rows[builder_get_row_key($row_id)]['columns'][builder_get_column_key($column_id)]);
        if (!empty($builder->rows[builder_get_row_key($row_id)]['columns'])) {
          $columns = array_values($builder->rows[builder_get_row_key($row_id)]['columns']);
          $builder->rows[builder_get_row_key($row_id)]['columns'] = $columns;
        }
        builder_cache_set($builder_cache_id, $builder);
      }
    }
  }
  // add new column or update column here.
  if ($add_new) {
    $settings = $values['settings'];
    $settings['title'] = $values['title'];
    $builder->rows[builder_get_row_key($row_id)]['columns'][builder_get_column_key($column_id)]['title'] = $values['title'];
    $builder->rows[builder_get_row_key($row_id)]['columns'][builder_get_column_key($column_id)]['settings'] = $settings;

    if (!isset($values['column_id'])) {
      // this is add new column, so we need set weight
      $weight = 1;
      if (!empty($builder->rows[builder_get_row_key($row_id)]['columns'])) {
        $weight = builder_find_max_weight($builder->rows[builder_get_row_key($row_id)]['columns']);
      }
      $builder->rows[builder_get_row_key($row_id)]['columns'][builder_get_column_key($column_id)]['weight'] = $weight;
    }
    builder_cache_set($builder_cache_id, $builder);
  }
}

/**
 * page callback for adding content (list all content available to add.
 */
function builder_content_list_all_page($js = NULL, $builder_cache_id, $row_id, $column_id) {

  $builder = builder_cache_get($builder_cache_id);
  $contents = builder_content_load_contents();
  $output = theme('builder_ui_content_list', array('contents' => $contents, 'builder' => $builder, 'row_id' => $row_id, 'column_id' => $column_id, 'js' => $js));
  if (!$js) {
    return $output;
  }
  $ajax_output = array();
  $ajax_output[0] = array(
      'output' => $output,
      'command' => 'modal_display',
      'title' => t('Add content'),
  );
  print ajax_render($ajax_output);
  exit;
}

/**
 * Page callback for adding content
 */
function builder_content_add_page($js = NULL, $builder_cache_id, $row_id, $column_id, $module, $delta) {
  $builder = builder_cache_get($builder_cache_id);
  $content = builder_content_load($module, $delta);
  $form_state = array(
      'title' => t("Settings: !title", array('!title' => $content['info'])),
      'ajax' => TRUE,
      'builder' => $builder,
      'row_id' => $row_id,
      'column_id' => $column_id,
      'module' => $module,
      'delta' => $delta,
      'content_is_new' => TRUE,
  );

  if (!$js) {
    $builder_form = drupal_build_form('builder_content_configure_form', $form_state);
    return render($builder_form);
  }
  ctools_include('modal');
  ctools_include('ajax');

  $output = ctools_modal_form_wrapper('builder_content_configure_form', $form_state);

  if (!empty($form_state['executed'])) {
    // We'll just overwrite the form output if it was successful.
    $output = array();
    $id_row_prefix = 'builder_' . $builder_cache_id . '_row_' . $row_id;
    $builder = builder_cache_get($builder_cache_id);
    $content = theme('builder_ui_row', array('builder' => $builder, 'row_id' => $row_id));

    $output[] = ajax_command_html('#' . $id_row_prefix, $content);
    $output[] = ctools_modal_command_dismiss();
  }
  print ajax_render($output);
  exit;
}

/**
 * Page callback for adding content
 */
function builder_content_edit_page($js = NULL, $builder_cache_id, $row_id, $column_id, $content_id) {

  $builder = builder_cache_get($builder_cache_id);
  $content = $builder->rows[builder_get_row_key($row_id)]['columns'][builder_get_column_key($column_id)]['contents'][builder_get_content_key($content_id)];
  $form_state = array(
      'title' => t("Settings: !title", array('!title' => $content['info'])),
      'ajax' => TRUE,
      'builder' => $builder,
      'row_id' => $row_id,
      'column_id' => $column_id,
      'content_id' => $content_id,
      'content_is_new' => FALSE,
  );

  if (!$js) {
    $builder_form = drupal_build_form('builder_content_configure_form', $form_state);
    return render($builder_form);
  }
  ctools_include('modal');
  ctools_include('ajax');

  $output = ctools_modal_form_wrapper('builder_content_configure_form', $form_state);
  if (!empty($form_state['executed'])) {
    // We'll just overwrite the form output if it was successful.
    $output = array();
    $id_row_prefix = 'builder_' . $builder_cache_id . '_row_' . $row_id;
    $content = theme('builder_ui_row', array('builder' => $builder, 'row_id' => $row_id));
    $output[] = ajax_command_html('#' . $id_row_prefix, $content);
    $output[] = ctools_modal_command_dismiss();
  }
  print ajax_render($output);
  exit;
}

/**
 * Page callback for adding new row
 */
function builder_row_add_page($js = NULL, $builder_cache_id = NULl) {

  $builder = builder_cache_get($builder_cache_id);
  $weight = 1;
  $row_id = 0;
  $row = array();

  if (!empty($builder->rows)) {
    $weight = builder_find_max_weight($builder->rows);
    $row['weight'] = $weight;
    $row_id = count($builder->rows);
  }

  $builder->rows[builder_get_row_key($row_id)] = $row;
  builder_cache_set($builder_cache_id, $builder);
  if (!$js) {
    drupal_set_message(t('Server AJAX error'), 'error');
    return '';
  }

  $output = array();
  $id_ajax_prefix = 'builder-ui-ajax-wrapper' . $builder_cache_id;
  $ajax_content = theme('builder_ui', array('builder' => $builder));
  $output[] = ajax_command_html('#' . $id_ajax_prefix, $ajax_content);
  print ajax_render($output);
  exit;
}

/**
 * Delete column page callback
 */
function builder_column_delete_page($js = NULL, $builder_cache_id, $row_id, $column_id) {

  $builder = builder_cache_get($builder_cache_id);

  if (isset($builder->rows[builder_get_row_key($row_id)]['columns'][builder_get_column_key($column_id)])) {
    unset($builder->rows[builder_get_row_key($row_id)]['columns'][builder_get_column_key($column_id)]);
    if (!empty($builder->rows[builder_get_row_key($row_id)]['columns'])) {
      $columns = array_values($builder->rows[builder_get_row_key($row_id)]['columns']);
      $builder->rows[builder_get_row_key($row_id)]['columns'] = $columns;
    }
    builder_cache_set($builder_cache_id, $builder);
  }

  if (!$js) {
    drupal_set_message(t('Server AJAX error'), 'error');
    return '';
  }
  $output = array();
  $id_row_prefix = 'builder_' . $builder_cache_id . '_row_' . $row_id;
  $ajax_content = theme('builder_ui_row', array('builder' => $builder, 'row_id' => $row_id));
  $output[] = ajax_command_html('#' . $id_row_prefix, $ajax_content);
  print ajax_render($output);
  exit;
}

/**
 * Clone column page callback
 */
function builder_column_clone_page($js = NULL, $builder_cache_id, $row_id, $column_id) {
  $builder = builder_cache_get($builder_cache_id);
  if (isset($builder->rows[builder_get_row_key($row_id)]['columns'][builder_get_column_key($column_id)])) {
    $clone = $builder->rows[builder_get_row_key($row_id)]['columns'][builder_get_column_key($column_id)];

    if (!empty($clone['contents'])) {
      foreach ($clone['contents'] as $content_key => $content) {
        $delta = $content['delta'];
        // hook_builder_content_clone_alter($delta, &$content) or hook_builder_content_clone_MODULE_DELTA_alter($delta &$content).
        drupal_alter(array('builder_content_clone', "builder_content_clone_{$content['module']}_{$delta}"), $delta, $content);
        $clone['contents'][$content_key] = $content;
      }
    }
    $clone_column_id = count($builder->rows[builder_get_row_key($row_id)]['columns']);
    $weight = builder_find_max_weight($builder->rows[builder_get_row_key($row_id)]['columns']);
    $clone['weight'] = $weight;
    $builder->rows[builder_get_row_key($row_id)]['columns'][builder_get_column_key($clone_column_id)] = $clone;

    builder_cache_set($builder_cache_id, $builder);
  }

  if (!$js) {
    drupal_set_message(t('Server AJAX error'), 'error');
    return '';
  }
  $output = array();
  $id_row_prefix = 'builder_' . $builder_cache_id . '_row_' . $row_id;
  $ajax_content = theme('builder_ui_row', array('builder' => $builder, 'row_id' => $row_id));
  $output[] = ajax_command_html('#' . $id_row_prefix, $ajax_content);
  print ajax_render($output);
  exit;
}

/**
 * Delete row page callback
 */
function builder_row_delete_page($js = NULL, $builder_cache_id, $row_id) {
  $builder = builder_cache_get($builder_cache_id);

  if (isset($builder->rows[builder_get_row_key($row_id)])) {
    unset($builder->rows[builder_get_row_key($row_id)]);

    if (!empty($builder->rows)) {
      $rows = array_values($builder->rows); // re-index items of rows in array, after removing a row.
      $builder->rows = $rows;
    }

    builder_cache_set($builder_cache_id, $builder);
  }

  if (!$js) {
    drupal_set_message(t('Server AJAX error'), 'error');
    return '';
  }
  $output = array();
  $id_ajax_prefix = 'builder-ui-ajax-wrapper' . $builder_cache_id;
  $ajax_content = theme('builder_ui', array('builder' => $builder));
  $output[] = ajax_command_html('#' . $id_ajax_prefix, $ajax_content);
  print ajax_render($output);
  exit;
}

function builder_row_clone_page($js = NULL, $builder_cache_id, $row_id) {
  $builder = builder_cache_get($builder_cache_id);
  if (isset($builder->rows[builder_get_row_key($row_id)])) {
    $clone = $builder->rows[builder_get_row_key($row_id)];
    // check if clone row has background image, and video

    if (!empty($clone['settings']['background']['background_image'])) {
      $fid = $clone['settings']['background']['background_image'];
      $file = file_load($fid);
      if ($file) {
        $destination = 'public://';
        $new_file = file_copy($file, $destination);
        if ($new_file) {
          $clone['settings']['background']['background_image'] = $new_file->fid;
        }
      }
    }
    // videos

    if (!empty($clone['settings']['video_bg']['videos'])) {
      foreach ($clone['settings']['video_bg']['videos'] as $key => $video_file_fid) {
        if (!empty($video_file_fid) && $video_file = file_load($video_file_fid)) {
          $destination = 'public://';
          $new_video_file = file_copy($video_file, $destination);
          if ($new_video_file) {
            $clone['settings']['video_bg']['videos'][$key] = $new_video_file->fid;
          }
        }
      }
    }

    // now check if row has contents we do call back to hook_builder_content_clone_alter($delta, &$content)

    if (!empty($clone['columns'])) {
      foreach ($clone['columns'] as $column_key => $column) {

        if (!empty($column['contents'])) {
          foreach ($column['contents'] as $content_key => $content) {
            $delta = $content['delta'];
            // hook_builder_content_clone_alter($delta, &$content) or hook_builder_content_clone_MODULE_DELTA_alter($delta &$content).
            drupal_alter(array('builder_content_clone', "builder_content_clone_{$content['module']}_{$delta}"), $delta, $content);
            $clone['columns'][$column_key]['contents'][$content_key] = $content;
          }
        }
      }
    }


    $delta = $content['delta'];
    // hook_builder_content_export_alter($zip, $content) or hook_builder_content_export_MODULE_DELTA_alter($zip $content).
    drupal_alter(array('builder_content_clone', "builder_content_clone_{$content['module']}_{$delta}"), $delta, $content);
    $clone['contents'][$content_key] = $content;

    $weight = builder_find_max_weight($builder->rows);
    $clone['weight'] = $weight;
    $clone_row_id = count($builder->rows);
    $builder->rows[builder_get_row_key($clone_row_id)] = $clone;
    builder_cache_set($builder_cache_id, $builder);
  }
  if (!$js) {
    drupal_set_message(t('Server AJAX error'), 'error');
    return '';
  }
  $output = array();
  $id_ajax_prefix = 'builder-ui-ajax-wrapper' . $builder_cache_id;
  $ajax_content = theme('builder_ui', array('builder' => $builder));
  $output[] = ajax_command_html('#' . $id_ajax_prefix, $ajax_content);
  print ajax_render($output);
  exit;
}

/**
 * Page callback for delete page
 */
function builder_content_delete_page($js = NULL, $builder_cache_id = NULL, $row_id, $column_id, $content_id) {

  $builder = builder_cache_get($builder_cache_id);

  if (isset($builder->rows[builder_get_row_key($row_id)]['columns'][builder_get_column_key($column_id)]['contents'][builder_get_content_key($content_id)])) {
    $content = $builder->rows[builder_get_row_key($row_id)]['columns'][builder_get_column_key($column_id)]['contents'][builder_get_content_key($content_id)];
    unset($builder->rows[builder_get_row_key($row_id)]['columns'][builder_get_column_key($column_id)]['contents'][builder_get_content_key($content_id)]);
    if (!empty($builder->rows[builder_get_row_key($row_id)]['columns'][builder_get_column_key($column_id)]['contents'])) {
      $contents = array_values($builder->rows[builder_get_row_key($row_id)]['columns'][builder_get_column_key($column_id)]['contents']);
      $builder->rows[builder_get_row_key($row_id)]['columns'][builder_get_column_key($column_id)]['contents'] = $contents;
    }
    builder_cache_set($builder_cache_id, $builder);

    // Available for HOOK_builder_content_delete($delta, $edit = array())
    $edit = array(
        'quick_remove' => TRUE,
        'content' => $content,
        'row_id' => $row_id,
        'column_id' => $column_id,
        'builder' => $builder,
        'content_id' => $content_id,
    );
    module_invoke($content['module'], 'builder_content_delete', $content['delta'], $edit);
  }

  if (!$js) {
    drupal_set_message(t('Server AJAX error'), 'error');
    return '';
  }
  $output = array();
  $id_row_prefix = 'builder_' . $builder_cache_id . '_row_' . $row_id;
  $ajax_content = theme('builder_ui_row', array('builder' => $builder, 'row_id' => $row_id));
  $output[] = ajax_command_html('#' . $id_row_prefix, $ajax_content);
  print ajax_render($output);
  exit;
}

/**
 * Page callback for update column weight
 */
function builder_column_update_weight($builder_cache_id, $row_id) {
  $builder = builder_cache_get($builder_cache_id);

  if (!empty($_POST['columns']) && is_array($_POST['columns'])) {
    $columns = $_POST['columns'];

    foreach ($columns as $weight => $column_id) {
      if (isset($builder->rows[builder_get_row_key($row_id)]['columns'][builder_get_column_key($column_id)])) {
        $builder->rows[builder_get_row_key($row_id)]['columns'][builder_get_column_key($column_id)]['weight'] = $weight;
      }
    }
    builder_cache_set($builder_cache_id, $builder);

    exit;
  } else {
    return drupal_access_denied();
  }
}

/**
 * Page callback for update rows weight in the builder
 */
function builder_row_update_weight($builder_cache_id) {
  $builder = builder_cache_get($builder_cache_id);
  if (!empty($_POST['rows']) && is_array($_POST['rows'])) {

    $rows = $_POST['rows'];
    foreach ($rows as $weight => $row_id) {
      if (isset($builder->rows[builder_get_row_key($row_id)])) {
        $builder->rows[builder_get_row_key($row_id)]['weight'] = $weight;
      }
    }
    builder_cache_set($builder_cache_id, $builder);

    exit;
  } else {
    return drupal_access_denied();
  }
}

/**
 * Page callback to update content weight
 */
function builder_content_update_weight($builder_cache_id, $row_id, $column_id) {

  $builder = builder_cache_get($builder_cache_id);

  if (!empty($_POST['contents']) && is_array($_POST['contents'])) {
    $contents = $_POST['contents'];
    foreach ($contents as $weight => $content_id) {

      if (isset($builder->rows[builder_get_row_key($row_id)]['columns'][builder_get_column_key($column_id)]['contents'][builder_get_content_key($content_id)])) {
        $builder->rows[builder_get_row_key($row_id)]['columns'][builder_get_column_key($column_id)]['contents'][builder_get_content_key($content_id)]['weight'] = $weight;
      }
    }

    builder_cache_set($builder_cache_id, $builder);
    exit;
  } else {
    return drupal_access_denied();
  }
}

/**
 * Page callback for autocomplete 
 * 
 */
function builder_autocomplete_node_page($string = '') {
  $matches = array();
  if ($string) {
    $or = db_or()
            ->condition('nid', $string, '=')
            ->condition('title', db_like($string) . '%', 'LIKE');
    $result = db_select('node')->fields('node', array('nid', 'title'))->condition($or)->range(0, 10)->execute();
    foreach ($result as $node) {
      $matches[$node->nid] = check_plain($node->title);
    }
  }

  drupal_json_output($matches);
}
