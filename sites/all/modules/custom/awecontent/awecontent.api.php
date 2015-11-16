<?php
/**
 * @File: awecontent.api.php
 * @Author: MegaDrupal
 * Website: http://megadrupal.com/
 */

/**
 * Hook function to declare a short-code for AWEContent
 *
 * @return array
 *      List short-code info include
 *          js_file: Full path of js_file what control for short-code in builder
 *          render_callback: php function will return render-able data for short-code
 *          render_path: directory what contains php file of render_callback function. If empty file will in root module directory
 *          render_file: file what contains render_callback function. If empty it will in module function
 */

function hook_awecontent_objects_info() {
  return array(
    'header' => array(
      'js' => array(
        drupal_get_path('module', 'awecontent') . '/js/plugins/awecontent-header-item.js' => array()
      ),
      'css' => array(),
      'render_callback' => 'ac_header_shortcode_render',
      'render_path' => '',
      'render_file' => ''
    )
  );
}

/**
 * Hook alter short code info
 *
 * @param $shortcodes
 *      Array list shortcode info which declares in modules
 */
function hook_awecontent_objects_info_alter(&$shortcodes) {
  //@TODO: Change info of shortcodes
}

/**
 * Hook support for block in awecontent build page
 *
 * @param $delta
 *    Block delta
 * @param $module
 *    Module of block
 *
 * @return array
 *    Array css and js what is used in block view
 */
function hook_awecontent_block_support($delta = '', $module = '') {
  $output = array();

  // process for block of views module
  if ($module == 'views') {
    if ($delta == 'aaa') {
      $output = array('css' => array(), 'js' => array());

      //@TODO: get all css and js file what is used in block view
    }
  }

  return $output;
}