<?php
/**
 * @File: theme.inc
 * @Author: MegaDrupal
 * Website: http://megadrupal.com/
 */
@include_once(drupal_get_path('module', 'awecontent') . '/includes/awecontent_elements.inc');

/**
 * Implements hook_preprocess_ac_panel_icon()
 */
function awecontent_preprocess_ac_panel_icon(&$vars) {
  if (module_exists('icon') && module_exists('fontello')) {
    $icon_bundles = icon_bundles();
    if ($icon_bundles['lullacons_pack1']) {
      unset($icon_bundles['lullacons_pack1']);
    }
    $vars['icons'] = $icon_bundles;
  }
}

/**
 * implements hook_preprocess_hook for theme ac_manage_templates
 */
function awecontent_preprocess_ac_manage_templates(&$vars) {
  global $user;

  foreach ($vars['templates'] as &$template) {
    $template->thumbnail = file_create_url($template->thumbnail);
    $template->classes = array('ac-tpl-item');
    if (isset($template->category) && $template->category)
      $template->classes[] = strtolower($template->category);

    // Check template is theme template
    $active_theme = variable_get('theme_default', 'bartik');
    if (strpos($template->tid, $active_theme) !== FALSE)
      $template->classes[] = 'theme-template';

    if (isset($template->favourite) && $template->favourite) {
      $template->classes[] = 'favourite';
    }

    if (isset($template->uid) && $template->uid == $user->uid)
      $template->classes[] = 'own-template';
  }
}

/**
 * implements hook_preprocss_theme()
 * @param $vars
 */
function awecontent_preprocess_ac_panel_font(&$vars) {
  $vars['google_font'] = '';
  if (isset($vars['path'])) {
    $node_type = '';
    $path = explode('/', trim($vars['path'], '/'));

    if (strpos($vars['path'], '/node/add') !== FALSE)
      $node_type = $path[count($path)-1];
    else {
      $node = node_load($path[count($path)-2]);
      if ($node)
        $node_type = $node->type;
    }

    $google_font = variable_get('ac_google_font', '');
    if ($node_type && variable_get("ac_{$node_type}_google_font", ''))
      $google_font = variable_get("ac_{$node_type}_google_font", '');

    $vars['google_font'] = $google_font;
  }
}