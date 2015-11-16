<?php
/**
 * @File: awecontent.admin.inc
 * @Author: MegaDrupal
 * Website: http://megadrupal.com/
 */
@include_once(drupal_get_path('module', 'awecontent') . '/includes/awecontent_elements.inc');

/**
 * Callback to generate form which contains editor to create page
 * @param $type
 *    Template type layout
 * @return array
 *      render-able array of page
 */
function ac_template_layout($type = SECTION_TEMPLATE) {
  ac_layout_libraries_load();

  $title = ($type == SECTION_TEMPLATE) ? t('AWEContent Section Template') : t('AWEContent Page Template');
  drupal_set_title($title);

  return array(
    '#theme' => 'ac_layout',
    '#type' => intval($type)
  );
}

/**
 * Callback to render data for panel from ajax request
 */
function ac_render_panel_ajax() {
  $output = array();

  if (isset($_POST["panels"]) && $_POST["panels"] != "") {
    $panels = drupal_json_decode($_POST['panels']);
    foreach ($panels as $panel) {
      $render = ac_render_panel($panel['data'], $panel['name']);

      $output[$panel['name']] = array(
        'html' => sprintf('<div class="obj-bar"><div class="op-top"><div class="toggle-build"><i class="ic ac-icon-arrow-left"></i></div></div></div><div class="obj-adjust scroll-bar">%s</div>', $render["html"]),
        'js' => $render['js']
      );
    }
  }

  drupal_json_output($output);
}

/**
 * Callback to handle request get page templates
 */
function ac_get_pages_templates() {
  $last = (isset($_POST['last']) && intval($_POST['last'])) ? intval($_POST['last']) : 0;
  $output = _ac_get_templates($last);
  drupal_json_output($output);
}

/**
 * Callback to generate content for templates overview page
 * @param $type
 *    type of template
 * @return Array
 *    Render-able array to display list templates
 */
function ac_templates_overview($type = PAGE_TEMPLATE) {
  $start = 0;
  if (isset($_POST['currentTemplates']) && isset($_POST['act']) && $_POST['act'] == 'loadTemplates') { // Return templates data for ajax load
    $start = intval($_POST['currentTemplates']);
  }

  // Get 12 newest template in database
  $templates_data = _ac_load_templates($start, 12, $type);
  if ($start == 0) { // get templates in theme for first load template
    $theme_templates = awecontent_get_theme_templates($type);
    $templates_data['templates'] = array_merge($theme_templates, $templates_data['templates']);
  }

  if (isset($_POST['currentTemplates']) && isset($_POST['act']) && $_POST['act'] == 'loadTemplates') { // Return templates data for ajax load
    drupal_json_output($templates_data);
  }
  else {
    // Render page for GET request
    drupal_add_library('system', 'ui.core');
    drupal_add_library('system', 'ui.widget');
    drupal_add_library('system', 'ui.tabs');
    drupal_add_library('system', 'ui.sortable');
    drupal_add_library('system', 'ui.resizable');
    drupal_add_library('system', 'ui.draggable');
    drupal_add_library('system', 'ui.slider');
    drupal_add_library('awecontent', 'ac_builder');

    drupal_add_css(drupal_get_path('module', 'awecontent') . '/css/awecontent-style.css');
    drupal_add_js(drupal_get_path('module', 'awecontent') . '/js/awecontent/lib/isotope.pkgd.min.js');
    drupal_add_js(drupal_get_path('module', 'awecontent') . '/js/awecontent-template-manage.js');

    drupal_add_css(drupal_get_path('module', 'awecontent') . '/css/awecontent-templates-font.css');
    drupal_add_css(drupal_get_path('module', 'awecontent') . '/css/awecontent-templates-style.css');

    // add path configure settings
    if (!$page_wrapper = variable_get("ac_page_wrapper_element", 'body'))
      $page_wrapper = 'body';
    $layout_url = url("awe-content/template-layout/{$type}", array('absolute' => TRUE));
    if (ac_get_theme_setting())
      $sectionFullWidth = 0;
    else
      $sectionFullWidth = 1;
    drupal_add_js(array(
      'awePathConfigurations' => _ac_path_configuration($layout_url),
      'aweTemplateType' => $type, 'acPageWrapper' => $page_wrapper,
      'sectionsFullWidth' => $sectionFullWidth
    ), 'setting');

    // add type of templates
    $templates_data['type'] = $type;

    return theme('ac_manage_templates', $templates_data);
  }
}

/**
 * Callback to generate configuration form for AWEContentBuilder
 */
function ac_configurations_form($form, &$form_state) {
  $form['ac_page_wrapper_element'] = array(
    '#type' => 'textfield',
    '#title' => t('Page wrapper element'),
    '#description' => t('ID of class of page wrapper element which contains all content of page. Ex: #page-wrapper or .page-wrapper ...'),
    '#default_value' => variable_get('ac_page_wrapper_element', 'body')
  );

  $form['ac_include_bootstrap'] = array(
    '#type' => 'checkbox',
    '#title' => t('Include Bootstrap CSS'),
    '#description' => t('Uncheck this option if your theme is includes Bootstrap CSS Library.'),
    '#default_value' => variable_get('ac_include_bootstrap', 1)
  );
  $form['font'] = array(
    '#type' => 'fieldset',
    '#title' => t('Google Web Fonts'),
    '#weight' => 2,
    '#collapsible' => TRUE,
    '#collapsed' => FALSE,
  );
  $form['font']['font_description'] = array(
    '#type' => 'markup',
    '#markup' => '<ul class="steps">
      <li>Go to <a href="http://www.google.com/webfonts" target="_blank">www.google.com/webfonts</a>, choose your fonts and add to collection</li>
      <li>Click "Use" in the bottom bar after choose fonts</li>
      <li>Find "Add this code to your website", copy from <strong>http://</strong> to the nearest <strong>\'</strong> and paste it below to activate.</li>
      </ul>',
  );
  $form['font']['ac_google_font'] = array(
    '#type' => 'textarea',
    '#default_value' => variable_get('ac_google_font', ''),
    '#description' => "For example: http://fonts.googleapis.com/css?family=Open+Sans:400,700|Roboto",
    '#resizable' => FALSE,
    '#rows' => 2
  );
  $form['font']['ac_unload_google_fonts'] = array(
    '#type' => 'checkbox',
    '#title' => t("Don't add fonts to my site, I include it in theme."),
    '#default_value' => variable_get('ac_unload_google_fonts', 0),
  );

  $form['media'] = array(
    '#type' => 'fieldset',
    '#title' => t('Media'),
    '#collapsible' => TRUE,
    '#collapsed' => TRUE,
    '#weight' => 3,
    'ac_media_sub_folder' => array(
      '#title' => t('Media path'),
      '#description' => t('Subdirectory in public file to contain file uploaded by MD Awecontent module.'),
      '#default_value' => variable_get('ac_media_sub_folder', ''),
      '#type' => 'textfield'
    )
  );

  return system_settings_form($form);
}


/**
 * Callback to create folder what contains cover templates file
 */
function ac_create_cover_templates_dir() {
  $output = TRUE;
  if (!file_exists(COVER_FILE_DIR)) {
    $output = drupal_mkdir(COVER_FILE_DIR);
  }

  return $output;
}

/**
 * Callback to handle request CRUD for templates
 */
function ac_templates_do_action() {
  global $user;

  $output = array(
    'status' => 0
  );

  $actions = array(
    'clone',
    'remove',
    'favourite',
    'save_template',
    'up_sec_categories',
    'load_templates'
  );

  if (isset($_POST['act']) && in_array($_POST['act'], $actions)) {

    switch ($_POST['act']) {
      case 'remove':
        $template = db_select('awecontent_templates', 'tpl')
          ->fields('tpl')
          ->condition('tid', $_POST['tid'])
          ->execute()
          ->fetchAssoc();

        if ($template) {
          $allow = FALSE;
          if (_awecontent_check_permission(DELETE_ANY_TPL_PERM) || ($user->uid == $template['uid'] && _awecontent_check_permission(DELETE_TPL_PERM)))
            $allow = TRUE;
          else
            $output['msg'] = t('You do not have permission to delete this template.');

          if ($allow) {
            $ret = db_delete('awecontent_templates')
              ->condition('tid', $_POST['tid'])
              ->execute();

            if ($ret)
              $output['status'] = 1;
          }
        }
        break;

      case 'save_template':
        $output = ac_upload_template();
        break;

      case 'favourite':
        $access = _awecontent_check_permission(USE_PERM);
        if (isset($_POST['favourite']) && isset($_POST['tid']) && $access) {
          $template = _awecontent_get_template($_POST['tid'], SECTION_TEMPLATE);

          if ($template) {
            if ($_POST{'favourite'}) {
              $output['status'] = db_insert('awecontent_favourite_templates')
                ->fields(array('tid' => $_POST['tid'], 'uid' => $user->uid))
                ->execute();
            }
            else {
              $output['status'] = db_delete('awecontent_favourite_templates')
                ->condition('uid', $user->uid)
                ->condition('tid', $_POST['tid'])
                ->execute();
            }
          }
        }
        break;

      case 'clone':
        $template = _awecontent_get_template($_POST['tid'], $_POST['type']);

        if ($template) {
          $permission = CREATE_TPL_PERM;
          if (_awecontent_check_permission($permission)) {
            unset($template['tid']);
            unset($template['favourite']);

            if (!isset($template['category']) || strtolower($template['category']) == 'theme')
              $template['category'] = 'Custom';

            $template['title'] = sprintf('Clone of %s', $template['title']);
            $template['created'] = time();
            $template['uid'] = $user->uid;

            // check max length of clone title
            if (strlen($template['title']) > 255)
              $template['title'] = substr($template['title'], strlen($template['title']) - 256);

            $tid = db_insert('awecontent_templates')
              ->fields($template)
              ->execute();

            if ($tid > 0) {
              // prepare template data
              $template['tid'] = $tid;
              $template['thumbnail'] = file_create_url($template['thumbnail']);
              $template['category'] = 'custom own-template';

              // prepare output data
              $output = array(
                'status' => 1,
                'template' => $template
              );
            }
          }
          else {
            $output['msg'] = t('You do not have permission to create new template.');
          }
        }
        break;

      case 'up_sec_categories':
        if (isset($_POST['sections']) && is_array($_POST['sections'])) {
          $categories = array();
          foreach ($_POST['sections'] as $section) {
            if (!$section['deleted'] && !empty($section['title']) && !empty($section['title'])) {
              $machine_name = str_replace('-', '_', trim($section['machineName'], '-'));
              $categories[$machine_name] = $section['title'];
            }
          }

          variable_set('ac_section_template_categories', $categories);
          $output['status'] = 1;
          $output['sections'] = $categories;
        }
        break;

      case 'load_templates':
        if (isset($_POST['current'])) {
          $templates_data = array('templates' => array(), 'load_more' => FALSE);

          // get template type
          $type = isset($_POST['type']) ? $_POST['type'] : SECTION_TEMPLATE;
          $length = (isset($_POST['length']) && is_numeric($_POST['length'])) ? $_POST['length'] : 10;
          $current = isset($_POST['current']) ? $_POST['current'] : 0;

          if ($current == 0 && $type == PAGE_TEMPLATE)
            $length = 3;

          // get templates from theme
          $theme_templates = awecontent_get_theme_templates($type);

          // remove theme templates loaded
          if ($current > 0)
            array_splice($theme_templates, 0, $current);

          $templates_data['templates'] = array_splice($theme_templates, $current, $length);
          if (count($theme_templates) >= $length+1) {
            $templates_data['load_more'] = TRUE;
          }
          else {
            $db_start = ($current - $length > 0) ? $current - $length : 0;
            $length = $length - count($templates_data['templates']);
            $database_template = _ac_load_templates($db_start, $length, $type);
            $templates_data['templates'] = array_merge($templates_data['templates'], $database_template['templates']);
            $templates_data['load_more'] = $database_template['load_more'];
          }

          $output = array_merge(array('status' => 1), $templates_data);
        }
    }
  }

  drupal_json_output($output);
}

/**
 * Callback to process template upload
 */
function ac_upload_template() {
  $output = array(
    'status' => 0,
    'tplThumbnail' => '',
    'tid' => ''
  );

  // get thumbnail data 
  $thumbnail_data = '';
  foreach ($_POST as $key => $value) {
    if (strpos($key, 'thumbnail_data_') !== FALSE)
      $thumbnail_data .= $value;
  }

  if (isset($_POST["templateData"]) && !empty($_POST["templateData"]) && (!empty($thumbnail_data) || isset($_FILES['thumbnailData']) || isset($_POST['keep_thumbnail']))) {
    $template = drupal_json_decode($_POST['templateData']);

    // Check user permission
    if (_awecontent_check_permission(CREATE_TPL_PERM)) {
      // Check directory contains cover templates files existed
      if (ac_create_cover_templates_dir()) {
        if (isset($_POST['keep_thumbnail']) && $_POST['keep_thumbnail'])
          $file_path = $template['thumbnail'];
        else {
          if (!empty($thumbnail_data)) {
            // Get thumbnail data image
            $filtered_data = substr($thumbnail_data, strpos($thumbnail_data, ",") + 1);
            $file_data = base64_decode($filtered_data);
            $file_path = sprintf("%s/ac_tpl_%d.jpg", COVER_FILE_DIR, time());
          }
          else {
            $file_data = file_get_contents($_FILES['thumbnailData']['tmp_name']);
            $file_path = sprintf("%s/%s", COVER_FILE_DIR, $_FILES['thumbnailData']['name']);
          }
          $file_path = file_unmanaged_save_data($file_data, $file_path);
        }

        // Save thumbnail image for template
        if ($file_path) {
          global $user;

          // get upload template data
          if (!isset($template['thumbnail']) || $template['thumbnail'] != $file_path)
            $template['thumbnail'] = $file_path;
          $template['data'] = drupal_json_encode($template['data']);

          // unset data favourite
          unset($template['favourite']);

          // Save template to database
          if (isset($template['tid'])) {
            if (isset($template['classes']))
              unset($template['classes']);

            // update template to database
            $tid = db_update('awecontent_templates')
              ->fields($template)
              ->condition('tid', $template['tid'])
              ->execute();
          }
          else {
            // add extra info
            $template = array_merge($template, array('uid' => $user->uid, 'category' => '', 'created' => time()));

            // insert new template to database
            $tid = db_insert('awecontent_templates')
              ->fields($template)
              ->execute();
            $template['tid'] = $tid;
          }

          if ($tid) {
            $template['thumbnail'] = file_create_url($file_path);
            $output = array(
              'status' => 1,
              'tid' => $tid,
              'template' => $template
            );
          }
          else
            $output['msg'] = t('Create template unsuccessful.');
        }
        else
          $output['msg'] = t('Create template thumbnail failed.');
      }
    }
    else
      $output['msg'] = t('You do not have permission to create new template.');
  }
  else {
    $output['msg'] = t('Parameters invalid');
  }

  return $output;
}

/**
 * Callback to handle request render drupal element
 */
function ac_render_drupal_element() {
  $output = array(
    'status' => 0
  );
  $element_types = array(
    'drupal_block',
    'drupal_field',
    'drupal_elements_controller'
  );

  if (isset($_POST['type']) && in_array($_POST['type'], $element_types)) {
    switch ($_POST['type']) {
      case 'drupal_block':
        if (isset($_POST['module']) && isset($_POST['delta'])) {
          $block = block_load($_POST['module'], $_POST['delta']);
          if (isset($_POST['custom_title']) && $_POST['custom_title'])
            $block->title = $_POST['custom_title'];

          $renderable_block = _block_get_renderable_array(_block_render_blocks(array($block)));

          $output = array(
            'status' => 1,
            'blockContent' => drupal_render($renderable_block)
          );

          // implements hook support block view in awecontent build page
          $output = array_merge($output, module_invoke_all('awecontent_block_support', $_POST['delta'], $_POST['module']));
        }
        break;

      case 'drupal_field':
        if (isset($_POST['formData']) && !empty($_POST['formData'])
          && isset($_POST['fieldName']) && !empty($_POST['fieldName'])
          && isset($_POST['nodeType']) && !empty($_POST['nodeType'])
        ) {
          $field_name = $_POST['fieldName'];

          module_load_include('inc', 'node', 'node.pages');
          // Prepare form values
          parse_str($_POST['formData'], $form_data);
          $form_data['op'] = t('Save field');

          $form_state = $_SESSION['ac-form-state'];
          $form_state['values'] = $form_data;

          // implements validate form
          $form = _ac_form_validate($form_data['form_id'], $form_state);
          $form_errors = form_get_errors();
          _ac_clear_form_error($form_errors);

          if (isset($form_errors[$field_name])) {
            $output['error'] = $form_errors[$field_name];
          }
          else { // Render field content
            $node = node_form_submit_build_node($form, $form_state);
            $cloned_node = clone $node;
            _field_invoke_multiple('load', 'node', array($cloned_node->nid => $cloned_node));

            // Load the user's name when needed.
            if (isset($cloned_node->name)) {
              // The use of isset() is mandatory in the context of user IDs, because
              // user ID 0 denotes the anonymous user.
              if ($user = user_load_by_name($cloned_node->name)) {
                $cloned_node->uid = $user->uid;
                $cloned_node->picture = $user->picture;
              }
              else {
                $cloned_node->uid = 0; // anonymous user
              }
            }
            elseif ($cloned_node->uid) {
              $user = user_load($cloned_node->uid);
              $cloned_node->name = $user->name;
              $cloned_node->picture = $user->picture;
            }

            $cloned_node->changed = REQUEST_TIME;
            $nodes = array($cloned_node->nid => $cloned_node);
            field_attach_prepare_view('node', $nodes, 'full');

            $field_instances = field_info_instance('node', $field_name, $node->type);
            if ($field_instances) {
              $display = field_get_display($field_instances, 'full', $node);
              $field_render = field_view_field('node', $nodes[$node->nid], $field_name, $display);
              $field_content = drupal_render($field_render);
            }
            else {
              $field_content = '<div class="awe-field-not-exist">This field does not exist in this node type</div>';
              $output['field_not_exist'] = 1;
            }

            $output = array(
              'status' => 1,
              'fieldContent' => $field_content
            );
          }
        }
        break;

      case 'drupal_elements_controller':
        // get blocks info
        $blocks = awecontent_get_blocks_item();

        $modules = array();
        foreach ($blocks as $block) {
          $block_id = "{$block['module']}_{$block['delta']}";

          if (!isset($modules[$block['module']])) {
            $module_info = system_get_info('module', $block['module']);
            $modules[$block['module']] = array(
              'name' => $module_info['name'],
              'blocks' => array()
            );
          }

          $modules[$block['module']]['blocks'][] = $block;
        }

        // get fields info
        $fields = array();
        if (isset($_POST['node_type']) && !empty($_POST['node_type'])) {
          $fields = field_info_instances('node', $_POST['node_type']);
        }

        $output = array(
          'status' => 1,
          'data' => array(
            'fields' => $fields,
            'blocks' => $modules
          )
        );
        break;
    }
  }

  drupal_json_output($output);
}

function _ac_form_validate($form_id, &$form_state) {
  if (!isset($form_state['build_info']['args'])) {
    $args = func_get_args();
    array_shift($args);
    array_shift($args);
    $form_state['build_info']['args'] = $args;
  }

  // Merge in default values.
  $form_state += form_state_defaults();
  $form_state['input'] = $form_state['values'];
  $form = drupal_retrieve_form($form_id, $form_state);
  $form_state['submitted'] = TRUE;

  // Reset form validation.
  $form_state['must_validate'] = TRUE;
  form_clear_error();

  drupal_prepare_form($form_id, $form, $form_state);
  _ac_process_form($form_id, $form, $form_state);

  return $form;
}

function _ac_process_form($form_id, &$form, &$form_state) {
  $form_state['values'] = array();

  // With $_GET, these forms are always submitted if requested.
  if ($form_state['method'] == 'get' && !empty($form_state['always_process'])) {
    if (!isset($form_state['input']['form_build_id'])) {
      $form_state['input']['form_build_id'] = $form['#build_id'];
    }
    if (!isset($form_state['input']['form_id'])) {
      $form_state['input']['form_id'] = $form_id;
    }
    if (!isset($form_state['input']['form_token']) && isset($form['#token'])) {
      $form_state['input']['form_token'] = drupal_get_token($form['#token']);
    }
  }

  $form = form_builder($form_id, $form, $form_state);

  // Only process the input if we have a correct form submission.
  if ($form_state['process_input']) {
    drupal_validate_form($form_id, $form, $form_state);
  }
}

function _ac_clear_form_error($form_errors) {
  if ($form_errors && is_array($form_errors) && !empty($form_errors)) {
    form_clear_error();
    $_SESSION['messages']['error'] = array_diff($_SESSION['messages']['error'], array_values($form_errors));
    if (empty($_SESSION['messages']['error'])) {
      unset($_SESSION['messages']['error']);
    }
  }
}

/**
 * Callback to handle request image style url
 */
function ac_get_image_style_url() {
  $output = array();

  if (isset($_POST['fids']) && isset($_POST['styles'])) {
    $images = explode(",", $_POST['fids']);
    $styles = explode(',', $_POST['styles']);

    foreach ($images as $fid) {
      $image = file_load($fid);
      if ($image) {
        foreach($styles as $style) {
          if ($style != 'none')
            $output[$fid][$style] = image_style_url($style, $image->uri);
          else
            $output[$fid][$style] = file_create_url($image->uri);
        }
      }
    }
  }

  drupal_json_output($output);
  exit();
}

/**
 * Callback to handle request layout url
 */
function ac_generate_layout_url() {
  $output = array('status' => 0, 'url' => '');
  $node_types = array_keys(node_type_get_types());
  if (isset($_POST['node_type']) && in_array($_POST['node_type'], $node_types)) {
    $node = new stdClass();
    $node->title = 'AWEContent Layout';
    $node->type = $_POST['node_type'];
    node_object_prepare($node);
    node_save($node);
    variable_set("ac_temp_layout_{$_POST['node_type']}", $node->nid);
    $output = array(
      'status' => 1,
      'url' => url("node/{$node->nid}", array(
        'absolute' => TRUE,
        'query' => array('ac_layout' => 1)
      ))
    );
  }

  drupal_json_output($output);
  exit;
}

/**
 * Callback to create template layout_page
 */
function ac_template_layout_page() {
  // load libraries is used in page build
  ac_layout_libraries_load();

  return sprintf(
    '<div id="awe-section-wrapper" class="awe-colper"></div>
    <div class="add-section">
        <a href="#" class="awe-actionbutton new-section">%s</a>
    </div>',
    t('Add new section')
  );
}

/**
 * Callback to load templates
 */
function _ac_load_templates($start = 0, $length = 10, $template_type = SECTION_TEMPLATE) {
  global $user;

  // implements query template from database
  $query = db_select('awecontent_templates', 'act')->fields('act')->condition('type', $template_type);
  if (!_awecontent_check_permission(VIEW_ANY_TPL_PERM))
    $query->condition('uid', $user->uid);
  $templates = $query->range($start, $length+1)
    ->orderBy('created', 'DESC')
    ->execute()
    ->fetchAll(PDO::FETCH_CLASS, 'stdClass');

  // check load more flag
  $load_more = FALSE;
  if (count($templates) === $length+1) {
    $load_more = TRUE;
    array_pop($templates);
  }

  // get favourite templates of current user
  if ($template_type == SECTION_TEMPLATE) {
    $favourites = db_select('awecontent_favourite_templates', 'fav')
      ->fields('fav', array('tid'))
      ->condition('uid', $user->uid)
      ->execute()->fetchAllAssoc('tid');
    $favourites = array_keys($favourites);
  }

  // prepare template thumbnail url
  foreach($templates as $template) {
    $template->thumbnail = file_create_url($template->thumbnail);
    $template->data = drupal_json_encode(drupal_json_decode($template->data));
    if ($template_type == SECTION_TEMPLATE)
      $template->favourite = in_array($template->tid, $favourites) !== FALSE ? 1 : 0;
    if (empty($template->category))
      $template->category = t('Custom');
  }

  return array('templates' => $templates, 'load_more' => $load_more);
}

/**
 * @param $ac_data
 * @param $node
 * @return mixed
 */
function _awe_preprocess_data($ac_data, $node) {
  if ($ac_data !== NULL && json_last_error() === JSON_ERROR_NONE) {
    foreach ($ac_data as $key => $sections) {
      $sections['#theme'] = 'awecontent_section';
      $sections['class_random'] = 'awe-section-' . $node->nid . '-' . $key;
      $sections['#class_random'] = 'awe-section-' . $node->nid . '-' . $key;
      $sections['#settings'] = $sections['settings'];
      $sections['#columns'] = $sections['columns'];
      $sections['#node'] = $node;
      $ac_data[$key] = $sections;
    }
    $ac_data['#sections'] = $ac_data;
    $ac_data['#theme'] = 'awecontent_sections';
    $ac_data['#node'] = $node;
  }
  return $ac_data;
}

/**
 * Callback get template by tid
 */
function _awecontent_get_template($tid='', $type = SECTION_TEMPLATE) {
  $template = FALSE;

  if ($tid) {
    if (intval($tid) > 0) {
        // get custom template in database
        $template = db_select('awecontent_templates', 'tpl')
          ->fields('tpl')
          ->condition('tid', $_POST['tid'])
          ->execute()
          ->fetchAssoc();
      }
      else { // get theme templates
        $theme_templates = awecontent_get_theme_templates($type, TRUE);
        $template = (isset($theme_templates[$tid])) ? (array)$theme_templates[$tid] : FALSE;
      }
  }

  return $template;
}