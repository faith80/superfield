<?php
/**
 * @param $columns
 * @param $prefix_class
 */
function _awecontent_preprocess_columns($columns, $prefix_class, $node) {
  foreach ($columns as $key => $column) {
    $column['#theme'] = 'awecontent_column';
    $column['#settings'] = $column['settings'];
    $column['#classes'] = $column['classes'];
    $column['#hasLayout'] = $column['hasLayout'];
    $column['#layout'] = $column['hasLayout'] == 1 ? $column['layout'] : NULL;
    $column['#items'] = isset($column['items']) ? $column['items'] : NULL;
    $column['class_random'] = $prefix_class . '-' . $key;
    $column['#class_random'] = $prefix_class . '-' . $key;
    $column['#node'] = $node;
    $columns[$key] = $column;
  }
  return $columns;
}

/**
 * @param $vars
 */
function awecontent_preprocess_awecontent_section(&$vars) {
  $columns = $vars['columns'];
  $columns = _awecontent_preprocess_columns($columns, $vars['class_random'], $vars['node']);
  $vars['columns'] = $columns;
  $style = '';
  $settings = $vars['settings'];
  $classSection = $settings['customClass'];
  $idSection = $settings['customID'] != '' ? drupal_html_id($settings['customID']) : FALSE;
  $vars['id'] = $idSection;
  $attributes = array(
    'enable' => $settings['customEnableAttributes'],
    'attributes' => $settings['customDataAttributes']
  );
  $fullscreen = $settings['enabledFullScreen'];
  $fluid = $settings['enabledFluid'];
  $parallax = $settings['bgMode'] == 'parallax' && $settings['enableScrolling'] ? true : false;
  $overlay = array(
    'enable' => $settings['enabledBgOverlay'],
    'bgColor' => $settings['bgOverlayColor']
  );
  $vars['overlay'] = $overlay;
  $background = array(
    'bgColor' => $settings['bgColor'],
    'bgFid' => $settings['bgFid'],
    'bgMode' => $settings['bgMode'],
    'bgPosition' => $settings['bgPosition'],
    'enableScrolling' => $settings['enableScrolling']
  );
  $bgVideo = array(
    'enable' => $settings['enableBackgroundVideo'],
    'url' => $settings['bgVideoUrl'],
    'auto' => $settings['enableAutoPlayVideo'],
    'mute' => $settings['enableMute'],
    'showControl' => $settings['enableShowButton']
  );
  $boxModel = $settings['boxModelSettings'];
  $nodeStyle = _ac_render_item_id_tag($idSection, $classSection, $vars['class_random']);
  if ($nodeStyle['isChange']) {
    $classSection = $nodeStyle['isChange'];
    if ($classSection != $vars['class_random'])
      $vars['classes_array'][] = $classSection;
  }
  $nodeStyle = $nodeStyle['result'];
  $vars['classes_array'][] = $vars['class_random'];
  $parallax = _ac_render_parallax_settings($parallax);
  $vars['attributes_array'] = _ac_render_item_attributes_settings($attributes);
  $overlay = _ac_render_overlay_settings($overlay, $nodeStyle, $settings['boxModelSettings']);
  $style .= $overlay['style'];
  if ($bgVideo['enable'] && $bgVideo['url'] != '') {
    $bgVideo = _ac_render_video_background_settings($bgVideo, $nodeStyle);
    $style .= $bgVideo['style'];
    $vars['bgvideo'] = $bgVideo['html'];
    $background = _ac_render_item_background_settings($background);
    $style .= render_css($nodeStyle . ' .overlay-iframe', array($background['style']));
  }

  else {
    $bgVideo['html'] = '';
    $background = _ac_render_item_background_settings($background, $nodeStyle);
    $vars['classes_array'][] = $parallax;
    $style .= render_css($nodeStyle, array($background['style']));
  }
  $vars['classes_array'][] = $fullscreen ? 'awesection-fullscreen' : '';
  $vars['fluid'] = $fluid ? 'container-fluid' : 'container';
  $boxModel = _ac_render_item_box_model_settings($boxModel);
  $style .= $overlay['style'] . render_css($nodeStyle, array($boxModel));
  drupal_add_css( $style, array('type' => 'inline', 'group' => CSS_THEME));

  // separate columns to rows
  $rows = array(array());
  $row_id = 0;
  $layout_total = 0;
  foreach($columns as $column) {
    $layout_total += $column['classes']['col-lg'];
    if ($layout_total > 12 || $column['classes']['col-lg-make-row']) {
      $rows[] = array();
      $row_id += 1;
      $layout_total = $column['classes']['col-lg'];
    }

    // add column to row
    $rows[$row_id][] = $column;
  }
  $vars['rows'] = $rows;
}

/**
 * @param $vars
 */
function awecontent_preprocess_awecontent_column(&$vars) {
  $items = $vars['items'];
  $short_codes = awecontent_get_objects_item(TRUE);
  if (count($items) > 0) {
    foreach ($items as $key => $item) {
      $item['#settings'] = $item;
      $item['#node'] = $vars['node'];
      $item['#class_random'] = $vars['class_random'] . '-' . $key . '-' . $item['machine_name'];
      if (in_array($item['machine_name'], array_keys($short_codes))) {
        if (isset($short_codes[$item['machine_name']]['callback_render'])
          && $short_codes[$item['machine_name']]['callback_render'] != ''
        ) {
          $callback_render = $short_codes[$item['machine_name']]['callback_render'];
          $file_path = isset($short_codes[$item['machine_name']]['file_path']) ?
            $short_codes[$item['machine_name']]['file_path'] : FALSE;
          $file_name = isset($short_codes[$item['machine_name']]['file']) ?
            $short_codes[$item['machine_name']]['file'] : FALSE;
          if (isset($file_path) && isset($file_name)) {
            $file = DRUPAL_ROOT . '/' . $file_path . '/' . $file_name;
            if (is_file($file)) {
              require_once $file;
            }
          }
          $item['#type'] = 'markup';
          $warning = '<div class="alert alert-danger" role="alert">
                        You need define function callback_render().
                      </div>';
          $class_random = $vars['class_random'] . '-' . $item['machine_name'] . '-' . $key;
          $item['#markup'] = function_exists($callback_render) ?
            call_user_func_array($callback_render, array(
              $item,
              $class_random,
              $vars['node']
            )) :
            $warning;
        }
        elseif (isset($short_codes[$item['machine_name']]['theme_callback'])
          && $short_codes[$item['machine_name']]['theme_callback'] != ''
        ) {
          $item['#theme'] = $short_codes[$item['machine_name']]['theme_callback'];
        }
      }
      $items[$key] = $item;
    }
    $vars['items'] = $items;
  }
  $settings = $vars['settings'];
  $classes = $vars['classes'];
  $boxModel = $settings['boxModelSettings'];
  $customID = $settings['customID'] != '' ? drupal_html_id($settings['customID']) : FALSE;
  $vars['id'] = $customID;
  $customClass = $settings['customClass'];
  $background = array(
    'bgColor' => $settings['bgColor'],
    'bgFid' => $settings['bgFid'],
    'bgMode' => $settings['bgMode'],
    'enableScrolling' => $settings['enableScrolling'],
    'bgPosition' => $settings['bgPosition']
  );
  $overlay = array(
    'enable' => $settings['enabledBgOverlay'],
    'bgColor' => $settings['bgOverlayColor']
  );
  $parallax = $settings['enableScrolling'];
  $nodeStyle = _ac_render_item_id_tag($customID, $customClass, $vars['class_random']);

  //process data settings
  if ($nodeStyle['isChange']) {
    $customClass = $nodeStyle['isChange'];
  }
  $nodeStyle = $nodeStyle['result'];
  $boxModel = _ac_render_item_box_model_settings($boxModel);
  $background = _ac_render_item_background_settings($background, $nodeStyle);
  $parallax = _ac_render_parallax_settings($parallax);
  $class_responsive = _ac_render_column_class_settings($classes);
  $overlay = _ac_render_overlay_settings($overlay, $nodeStyle, $settings['boxModelSettings']);
  $vars['classes_array'][] = $vars['class_random'];
  if ($customClass != $vars['class_random'])
    $vars['classes_array'][] = $customClass;
  if (isset($settings["makeRow"]))
    $vars['classes_array'][] = 'make-row';
  if ($parallax != '')
    $vars['classes_array'][] = $parallax;
  $classes_array = array_merge($vars['classes_array'], $class_responsive);
  $vars['classes_array'] = $classes_array;
  $vars['overlay'] = $overlay;
  $style = $overlay['style']  . render_css($nodeStyle , array($boxModel, $background['style']));
  if ($settings['minHeight'] != -1) {
    $style .= sprintf('%s{min-height: %dpx;}', $nodeStyle, $settings['minHeight']);
  }
  drupal_add_css( $style, array('type' => 'inline', 'group' => CSS_THEME));
}

/**
 * @param $vars
 */
function awecontent_preprocess_awe_button(&$vars) {
  $settings = $vars['settings'];
  $vars['classes_array'] = array('awe-btn', 'awe-item', $vars['class_random']);
  $buttonLink = $settings['buttonUrl'] != '' ? $settings['buttonUrl'] : '#';
  $buttonStyle = $settings['buttonStyle'];
  $vars['text_button'] = $settings['textButton'];
  $textHover = array(
    'color' => $settings['color'],
    'background' => $settings['backgroundColor'],
    'hoverColor' => $settings['hoverColor'],
    'hoverBackground' => $settings['hoverBackgroundColor']
  );
  $fontSettings = array(
    'fontFamily' => $settings['fontFamily'],
    'fontStyle' => $settings['fontStyle'],
    'fontSize' => $settings['fontSize'],
    'lineHeight' => $settings['lineHeight'],
    'letterSpacing' => $settings['letterSpacing'],
    'unit' => 'px'
  );
  $target = $settings['openNewWindow'] ? '_blank' : 'self';
  $buttonID = $settings['customID'] != '' ? drupal_html_id($settings['customID']) : FALSE;
  $vars['id'] = $buttonID;
  $buttonClass = $settings['customClass'];
  $boxModel = $settings['boxModelSettings'];
  $attributes = array(
    'enable' => $settings['customEnableAttributes'],
    'attributes' => $settings['customDataAttributes']
  );
  $animations = array(
    'enable' => $settings['customEnableAnimations'],
    'animations' => $settings['customDataAnimations']
  );
  $responsive = array(
    'lgResponsive' => $settings['lgResponsive'],
    'xsResponsive' => $settings['xsResponsive'],
    'mediumResponsive' => $settings['mediumResponsive'],
    'smResponsive' => $settings['smResponsive']
  );
  // process settings for button
  $nodeStyle = _ac_render_item_id_tag($buttonID, $buttonClass, $vars['class_random']);
  if ($nodeStyle['isChange']) {
    $buttonClass = $nodeStyle['isChange'];
  }
  $nodeStyle = $nodeStyle['result'];
  $responsive = _ac_render_item_responsive_settings($responsive);
  if ($buttonClass != $vars['class_random'])
    $vars['classes_array'][] = $buttonClass;
  $vars['classes_array'][] = $buttonStyle;
  $vars['classes_array'][] = $responsive;
  $attributes = _ac_render_item_attributes_settings($attributes);
  $animations = _ac_render_item_animations_settings($animations);
  $vars['attributes_array'] = array_merge($vars['attributes_array'], $attributes);
  $animations !== '' ? $vars['attributes_array']['data-animation'] = $animations : '';
  $vars['attributes_array']['href'] = $buttonLink;
  $vars['attributes_array']['target'] = $target;
  $hover = _ac_render_item_hover_settings($textHover, $nodeStyle);
  $boxModel = _ac_render_item_box_model_settings($boxModel, $nodeStyle);
  $fontSettings = _ac_render_item_font_settings($fontSettings, $nodeStyle);
  $style = render_css('.awe-btn' . $nodeStyle, array($hover['normal'], $boxModel, $fontSettings));
  $style .= render_css('.awe-btn' .$nodeStyle .':hover', $hover['hover']);

  drupal_add_css( $style, array('type' => 'inline', 'group' => CSS_THEME));
}

/**
 * @param $vars
 */
function awecontent_preprocess_awe_divider(&$vars) {
  $style = '';
  $settings = $vars['settings'];
  $vars['classes_array'] = array('awe-item', 'awe-divider', $vars['class_random']);
  //Get setting for item divider
  $borderWidth = isset($settings['borderWeight']) ? $settings['borderWeight'] : 1;
  $border = array(
    'style' => $settings['borderStyle'],
    'color' => $settings['borderColor'],
    'width' => $borderWidth
  );
  $fontSettings = array(
    'fontFamily' => $settings['fontFamily'],
    'fontStyle' => $settings['fontStyle'],
    'fontSize' => $settings['fontSize'],
    'lineHeight' => $settings['lineHeight'],
    'letterSpacing' => $settings['letterSpacing'],
    'unit' => 'px'
  );
  $idDivider = $settings['customID'] != '' ? drupal_html_id($settings['customID']) : FALSE;
  $vars['id'] = $idDivider;
  $classDivider = $settings['customClass'];
  $attributes = array(
    'enable' => $settings['customEnableAttributes'],
    'attributes' => $settings['customDataAttributes']
  );
  $boxModel = $settings['margin'];
  $animations = array(
    'enable' => $settings['customEnableAnimations'],
    'animations' => $settings['customDataAnimations']
  );
  $responsive = array(
    'lgResponsive' => $settings['lgResponsive'],
    'xsResponsive' => $settings['xsResponsive'],
    'mediumResponsive' => $settings['mediumResponsive'],
    'smResponsive' => $settings['smResponsive']
  );
  $nodeSytle = _ac_render_item_id_tag($idDivider, $classDivider, $vars['class_random']);
  if ($nodeSytle['isChange']) {
    $classDivider = $nodeSytle['isChange'];
  }
  $nodeSytle = $nodeSytle['result'];
  $nodeLine = sprintf('%s .line-divider', $nodeSytle);

  // process data for item Divider

  $nodeText = sprintf('%s .text-divider', $nodeSytle);
  if (isset($settings['color']) && !empty($settings['color'])) {
    $color = rgb2hex($settings['color']);
    $style .= sprintf('%s {color: %s; color: %s;}', $nodeText, $color['hex'], $settings['color']);
    if ($settings['width'])
      $style .= sprintf('%s {width: %spx; }', $nodeText, $settings['width']);
  }
  $fontSettings = _ac_render_item_font_settings($fontSettings);
  $style .= render_css($nodeText, array($fontSettings));
  $border = render_settings_item_divider_border($border, $nodeLine);
  $style .= render_css($nodeLine, array($border));
  $attributes = _ac_render_item_attributes_settings($attributes);
  $animations = _ac_render_item_animations_settings($animations);
  $responsive = _ac_render_item_responsive_settings($responsive);
  $boxModel = _ac_render_item_box_model_settings($boxModel);
  if (isset($settings['widthDivider']) && $settings['widthDivider']) {
    $boxModel .= 'width: ' . $settings['widthDivider'] . 'px;';
  }
  $style .= render_css($nodeSytle, array($boxModel));

  //set value for variables{}
  if ($classDivider != $vars['class_random'])
    $vars['classes_array'][] = $classDivider;
  $vars['classes_array'][] = $responsive;
  $vars['attributes_array'] = array_merge($vars['attributes_array'], $attributes);
  $animations !== '' ? $vars['attributes_array']['data-animation'] = $animations : '';
  drupal_add_css( $style, array('type' => 'inline', 'group' => CSS_THEME));
}

/**
 * @param $vars
 */
function awecontent_preprocess_awe_gallery(&$vars) {
  $settings = $vars['settings'];
  $vars['images'] = $settings['images'];
  $vars['classes_array'][] = array('awe-item', $vars['class_random']);
  $imageBoxSettings = $settings['imageBoxModelSettings'];
  $boxModel = $settings['boxModelSettings'];
  $columns = $settings['columns'];

  $captionOnHover = $settings['captionOnHover'];
  $galleryID = $settings['customID'] != '' ? drupal_html_id($settings['customID']) : FALSE;
  $vars['id'] = $galleryID;
  $galleryClass = $settings['customClass'];

  $attributes = array(
    'enable' => $settings['customEnableAttributes'],
    'attributes' => $settings['customDataAttributes']
  );
  $animations = array(
    'enable' => $settings['customEnableAnimations'],
    'animations' => $settings['customDataAnimations']
  );
  $responsive = array(
    'lgResponsive' => $settings['lgResponsive'],
    'xsResponsive' => $settings['xsResponsive'],
    'mediumResponsive' => $settings['mediumResponsive'],
    'smResponsive' => $settings['smResponsive']
  );
  // Process data input
  $nodeStyle = _ac_render_item_id_tag($galleryID, $galleryClass, $vars['class_random']);
  if ($nodeStyle['isChange']) {
    $galleryClass = $nodeStyle['isChange'];
    if ($galleryClass != $vars['class_random'])
      $vars['classes_array'][] = $galleryClass;
  }
  $nodeStyle = $nodeStyle['result'];
  if ($captionOnHover) {
    $vars['classes_array'][] = 'caption-hover';
  }
  if(!$settings['customColumnsResponsive']){
    $vars['classes_array'][] = 'image-col-' . $columns;
  }
  $boxModel = _ac_render_item_box_model_settings($boxModel);
  $imageBoxSettings = _ac_render_item_box_model_settings($imageBoxSettings);
  $attributes = _ac_render_item_attributes_settings($attributes);
  $animations = _ac_render_item_animations_settings($animations);
  $responsive = _ac_render_item_responsive_settings($responsive);
  $vars['classes_array'][] = $responsive;

  // set value for variables
  $vars['attributes_array']['data-enable-thumb'] = $settings['enableThumbnail'] ? 'true' : 'false';
  $vars['attributes_array']['data-enable-caption-on-lightbox'] = $settings['captionOnLightBox'] ? 'true' : 'false';
  $vars['attributes_array']['data-items-thumb'] = $settings['itemsThumb'];
  $vars['styleThumb'] = $settings['styleThumb'];
  $vars['styleImage'] = $settings['styleImage'];
  $vars['classes_array'][] = $galleryClass;
  if ($settings['customColumnsResponsive']) {
    $vars['classes_array'][] = 'image-col-' . $settings['smallDesktopColumns'];
    $vars['classes_array'][] = 'image-col-sm-' . $settings['tabletColumns'];
    $vars['classes_array'][] = 'image-col-xs-' . $settings['mobileColumns'];
  }
  $vars['attributes_array'] = array_merge($vars['attributes_array'], $attributes);
  $animations !== '' ? $vars['attributes_array']['data-animation'] = $animations : '';
  $style = render_css($nodeStyle, array($boxModel)) . '' . render_css(sprintf('%s .awe-image-content', $nodeStyle), array($imageBoxSettings));
  drupal_add_css( $style, array('type' => 'inline', 'group' => CSS_THEME));
}

/**
 * @param $vars
 */
function awecontent_preprocess_awe_facebook(&$vars) {
  $settings = $vars['settings'];
  $vars['classes_array'] = array('awe-facebook', 'awe-item', $vars['class_random']);
  $facebookSettings = array(
    'url' => $settings['facebookUrl'],
    'friendFaces' => $settings['friendsFaces'],
    'colorScheme' => $settings['colorScheme'],
    'header' => $settings['header'],
    'posts' => $settings['posts'],
    'border' => $settings['border'],
    'width' => $settings['width'],
    'height' => $settings['height']
  );
  $boxModel = $settings['boxModelSettings'];
  $attributes = array(
    'enable' => $settings['customEnableAttributes'],
    'attributes' => $settings['customDataAttributes']
  );
  $animations = array(
    'enable' => $settings['customEnableAnimations'],
    'animations' => $settings['customDataAnimations']
  );
  $responsive = array(
    'lgResponsive' => $settings['lgResponsive'],
    'xsResponsive' => $settings['xsResponsive'],
    'mediumResponsive' => $settings['mediumResponsive'],
    'smResponsive' => $settings['smResponsive']
  );
  $customID = $settings['customID'] != '' ? drupal_html_id($settings['customID']) : FALSE;
  $vars['id'] = $customID;
  $customClass = $settings['customClass'];
  $nodeSytle = _ac_render_item_id_tag($customID, $customClass, $vars['class_random']);
  if ($nodeSytle['isChange']) {
    $customClass = $nodeSytle['isChange'];
    if ($customClass != $vars['class_random'])
      $vars['classes_array'][] = $customClass;
  }
  $nodeSytle = $nodeSytle['result'];

  $facebookSrc = render_settings_item_facebook_src($facebookSettings, $nodeSytle);
  $boxModel = _ac_render_item_box_model_settings($boxModel);
  $attributes = _ac_render_item_attributes_settings($attributes);
  $animations = _ac_render_item_animations_settings($animations);
  $responsive = _ac_render_item_responsive_settings($responsive);
  $customClass .= $responsive;

  // set value for variable
  $facebookSrc['src'] !== '' ? $vars['attributes_array']['src'] = $facebookSrc['src'] : '';
  $vars['attributes_array'] = array_merge($vars['attributes_array'], $attributes);
  $animations !== '' ? $vars['attributes_array']['data-animation'] = $animations : '';
  $style = render_css($nodeSytle, array($boxModel)) . $facebookSrc['style'];
  drupal_add_css( $style, array('type' => 'inline', 'group' => CSS_THEME));
}

/**
 * @param $vars
 */
function awecontent_preprocess_awe_gmap(&$vars) {
  $settings = $vars['settings'];
  $vars['classes_array'] = array('awe-gmap', 'awe-item', $vars['class_random']);
  $icon_marker = intval($settings['iconMarker']);
  $image = file_load($icon_marker);
  $icon_url = ($image) ? file_create_url($image->uri) : '';

  $gmapSettings = array(
    'zoom' => $settings['zoom'],
    'style' => $settings['style'],
    'latLong' => $settings['latLong'],
    'scroll_zoom' => $settings['disableScrollZoom'],
    'custom_info' => $settings['enableCustomInfo'],
    'icon_marker' => $icon_url,
    'title' => $settings['infoTitle'],
    'descriptions' => $settings['infoDescriptions']
  );
  $attributes = array(
    'enable' => $settings['customEnableAttributes'],
    'attributes' => $settings['customDataAttributes']
  );

  $responsive = array(
    'lgResponsive' => $settings['lgResponsive'],
    'xsResponsive' => $settings['xsResponsive'],
    'mediumResponsive' => $settings['mediumResponsive'],
    'smResponsive' => $settings['smResponsive']
  );
  $height = $settings['height'];
  $gmapID = $settings['customID'] != '' ? drupal_html_id($settings['customID']) : FALSE;
  $vars['id'] = $gmapID;
  $gmapClass = $settings['customClass'];
  $boxModel = $settings['boxModelSettings'];

  $nodeStyle = _ac_render_item_id_tag($gmapID, $gmapClass, $vars['class_random']);
  if ($nodeStyle['isChange']) {
    $gmapClass = $nodeStyle['isChange'];
    if ($gmapClass != $vars['class_random'])
      $vars['classes_array'][] = $gmapClass;
  }
  $nodeStyle = $nodeStyle['result'];

  $gmapSettings = render_settings_item_gmap_gmapSettings($gmapSettings);
  $attributes = _ac_render_item_attributes_settings($attributes);
  $responsive = _ac_render_item_responsive_settings($responsive);
  $vars['classes_array'][] = $responsive;
  $boxModel = _ac_render_item_box_model_settings($boxModel, $nodeStyle);

  // set value for variable
  $vars['attributes_array'] = array_merge($vars['attributes_array'], $attributes);
  $vars['attributes_array'] = array_merge($vars['attributes_array'], $gmapSettings);
  $style = render_css($nodeStyle, array($boxModel, sprintf('height: %spx;', $height)));
  drupal_add_css( $style, array('type' => 'inline', 'group' => CSS_THEME));
}

/**
 * @param $vars
 */
function awecontent_preprocess_awe_flickr(&$vars) {
  $settings = $vars['settings'];
  $vars['classes_array'][] = $vars['class_random'];
  if ($settings['flickrStream'] == 'user') {
    $url = 'https://api.flickr.com/services/feeds/photos_public.gne';
  }
  else {
    $url = 'https://api.flickr.com/services/feeds/groups_pool.gne';
  }
  $url = sprintf('%s?id=%s&format=rss_200', $url, $settings['flickrID']);
  $flickr = new FlickrImages($url);
  $vars['images'] = count($flickr->getImages()) > 0 ? $flickr->getImages() : NULL;

  $flickrSettings = array(
    'stream' => $settings['flickrStream'],
    'id' => $settings['flickrID'],
    'numberPhoto' => $settings['numberPhoto'],
    'numberColumn' => $settings['numberColum'],
    'lightbox' => $settings['flickrPreview'],
    'imageMargin' => $settings['imageMargin']
  );
  $flickrID = $settings['customID'] != '' ? drupal_html_id($settings['customID']) : FALSE;
  $vars['id'] = $flickrID;
  $flickrClass = $settings['customClass'];
  $attributes = array(
    'enable' => $settings['customEnableAttributes'],
    'attributes' => $settings['customDataAttributes']
  );
  $animations = array(
    'enable' => $settings['customEnableAnimations'],
    'animations' => $settings['customDataAnimations']
  );

  $responsive = array(
    'lgResponsive' => $settings['lgResponsive'],
    'xsResponsive' => $settings['xsResponsive'],
    'mediumResponsive' => $settings['mediumResponsive'],
    'smResponsive' => $settings['smResponsive']
  );
  $boxModel = $settings['boxModelSettings'];
  $nodeStyle = _ac_render_item_id_tag($flickrID, $flickrClass, $vars['class_random']);
  if ($nodeStyle['isChange']) {
    $flickrClass = $nodeStyle['isChange'];
    if ($flickrClass != $vars['class_random'])
      $vars['classes_array'][] = $flickrClass;
  }
  $nodeStyle = $nodeStyle['result'];
  $style = '';
  // process data for item flickr
  if ($settings['imageMargin'] && $settings['imageMargin'] != '0') {
    $style .= sprintf('%s .awe-item-flickr {padding: %spx; }', $nodeStyle, $settings['imageMargin']);
  }

  $boxModel = _ac_render_item_box_model_settings($boxModel);
  $attributes = _ac_render_item_attributes_settings($attributes);
  $animations = _ac_render_item_animations_settings($animations);
  $responsive = _ac_render_item_responsive_settings($responsive);
  $vars['classes_array'][] = $responsive;
  $vars['classes_array'][] = 'type-column-' . $settings['numberColum'];
  // set value for variables
  $vars['attributes_array'] = array_merge($vars['attributes_array'], $attributes);
  $animations !== '' ? $vars['attributes_array']['data-animation'] = $animations : '';
  $style .= render_css($nodeStyle, array($boxModel));
  drupal_add_css( $style, array('type' => 'inline', 'group' => CSS_THEME));
}

/**
 * @param $vars
 */
function awecontent_preprocess_awe_header(&$vars) {
  $settings = $vars['settings'];
  $vars['classes_array'] = array('awe-item', 'awe-header', $vars['class_random']);
  $tagname = $settings['tagName'];
  $text = $settings['textContent'];
  $font_settings = array(
    'fontFamily' => $settings['fontFamily'],
    'fontStyle' => $settings['fontStyle'],
    'fontSize' => $settings['fontSize'],
    'lineHeight' => $settings['lineHeight'],
    'letterSpacing' => $settings['letterSpacing'],
    'textAlign' => $settings['textAlign'],
    'unit' => 'px'
  );
  $color_settings = array(
    'color' => $settings['color'],
    'background' => $settings['backgroundColor']
  );
  $header_id = $settings['customID'] != '' ? drupal_html_id($settings['customID']) : FALSE;
  $vars['id'] = $header_id;
  $header_class = $settings['customClass'];
  $attributes = array(
    'enable' => $settings['customEnableAttributes'],
    'attributes' => $settings['customDataAttributes']
  );
  $animations = array(
    'enable' => $settings['customEnableAnimations'],
    'animations' => $settings['customDataAnimations']
  );
  $responsive = array(
    'lgResponsive' => $settings['lgResponsive'],
    'xsResponsive' => $settings['xsResponsive'],
    'mediumResponsive' => $settings['mediumResponsive'],
    'smResponsive' => $settings['smResponsive']
  );
  $box_model = $settings['boxModelSettings'];
  $node_style = _ac_render_item_id_tag($header_id, $header_class, $vars['class_random']);
  if ($node_style['isChange']) {
    $header_class = $node_style['isChange'];
    if ($header_class != $vars['class_random'])
      $vars['classes_array'][] = $header_class;
  }
  $node_style = $node_style['result'];
  // process data for item header
  $responsive = _ac_render_item_responsive_settings($responsive);
  $attributes = _ac_render_item_attributes_settings($attributes);
  $animations = _ac_render_item_animations_settings($animations);
  $vars['classes_array'][] = $responsive;
  $box_model = _ac_render_item_box_model_settings($box_model);
  $font_settings = _ac_render_item_font_settings($font_settings, 'header');
  $color_settings = _ac_render_item_hover_settings($color_settings);

  // set value for variable
  $vars['tagname'] = $tagname;
  $vars['attributes_array'] = array_merge($vars['attributes_array'], $attributes);
  $animations !== '' ? $vars['attributes_array']['data-animation'] = $animations : '';
  $vars['textcontent'] = $text;

  $style = render_css($node_style, array($color_settings['normal'], $box_model , $font_settings));
  drupal_add_css( $style, array('type' => 'inline', 'group' => CSS_THEME));
}

/**
 * @param $vars
 */
function awecontent_preprocess_awe_icon(&$vars) {
  $vars['classes_array'] = array('awe-item', 'awe-icon', $vars['class_random']);
  $settings = $vars['settings'];
  $name_icon = $settings['nameIcon'];
  $font_settings = array(
    'fontSize' => $settings['fontSize'],
    'lineHeight' => $settings['lineHeight'],
    'unit' => 'px'
  );
  $style_icon = $settings['styleIcon'];
  $color_settings = array(
    'color' => $settings['color'],
    'background' => $settings['backgroundColor'],
    'hoverColor' => $settings['hoverColor'],
    'hoverBackground' => $settings['hoverBackgroundColor']
  );
  $link_icon = $settings['iconLink'] != '' ? $settings['iconLink'] : '';
  $vars['link_icon'] = $link_icon;
  $icon_class = $settings['customClass'];
  $icon_id = $settings['customID'] != '' ? drupal_html_id($settings['customID']) : FALSE;
  $vars['id'] = $icon_id;
  $box_model = $settings['boxModelSettings'];
  $attributes = array(
    'enable' => $settings['customEnableAttributes'],
    'attributes' => $settings['customDataAttributes']
  );
  $animations = array(
    'enable' => $settings['customEnableAnimations'],
    'animations' => $settings['customDataAnimations']
  );

  $responsive = array(
    'lgResponsive' => $settings['lgResponsive'],
    'xsResponsive' => $settings['xsResponsive'],
    'mediumResponsive' => $settings['mediumResponsive'],
    'smResponsive' => $settings['smResponsive']
  );

  // process data for item Icon
  $node_style = _ac_render_item_id_tag($icon_id, $icon_class, $vars['class_random']);
  if ($node_style['isChange']) {
    $icon_class = $node_style['isChange'];
    if ($icon_class != $vars['class_random'])
      $vars['classes_array'][] = $icon_class;
  }
  $node_style = $node_style['result'] . '.awe-icon .awe-icon-container';
  $vars['classes_array'][] = $style_icon;
  $font_settings = _ac_render_item_font_settings($font_settings);
  $color_settings = _ac_render_item_hover_settings($color_settings);
  $box_model = _ac_render_item_box_model_settings($box_model);
  $attributes = _ac_render_item_attributes_settings($attributes);
  $animations = _ac_render_item_animations_settings($animations);
  $responsive = _ac_render_item_responsive_settings($responsive);
  $vars['classes_array'][] = $responsive;

  // set value for variable
  $vars['attributes_array'] = array_merge($vars['attributes_array'], $attributes);
  $animations !== '' ? $vars['attributes_array']['data-animation'] = $animations : '';
  $vars['name_icon'] = $name_icon;
  $style = render_css($node_style, array($font_settings, $color_settings['normal'], $box_model));
  $style .= render_css($node_style . ':hover', array($color_settings['hover']));
  drupal_add_css( $style, array('type' => 'inline', 'group' => CSS_THEME));
}

/**
 * @param $vars
 */
function awecontent_preprocess_awe_iframe(&$vars) {
  $settings = $vars['settings'];
  $vars['classes_array'] = array('awe-item', 'awe-iframe', $vars['class_random']);
  $iframe_url = $settings['iframeUrl'] !== '' ? $settings['iframeUrl'] : '#';
  $iframe_id = $settings['customID'] != '' ? drupal_html_id($settings['customID']) : FALSE;
  $vars['id'] = $iframe_id;
  $height = $settings['height'];
  $iframe_class = $settings['customClass'];
  $attributes = array(
    'enable' => $settings['customEnableAttributes'],
    'attributes' => $settings['customDataAttributes']
  );
  $animations = array(
    'enable' => $settings['customEnableAnimations'],
    'animations' => $settings['customDataAnimations']
  );
  $responsive = array(
    'lgResponsive' => $settings['lgResponsive'],
    'xsResponsive' => $settings['xsResponsive'],
    'mediumResponsive' => $settings['mediumResponsive'],
    'smResponsive' => $settings['smResponsive']
  );
  $box_model = $settings['boxModelSettings'];
  $node_style = _ac_render_item_id_tag($iframe_id, $iframe_class, $vars['class_random']);
  if ($node_style['isChange']) {
    $iframe_class = $node_style['isChange'];
    if ($iframe_class != $vars['class_random'])
      $vars['classes_array'][] = $iframe_class;
  }
  $node_style = $node_style['result'];

  // process data in item iframe
  $box_model = _ac_render_item_box_model_settings($box_model);
  $height = sprintf('height: %spx;', $height);
  $attributes = _ac_render_item_attributes_settings($attributes);
  $animations = _ac_render_item_animations_settings($animations);
  $responsive = _ac_render_item_responsive_settings($responsive);

  // set value for variable
  $vars['classes_array'][] = $responsive;
  $vars['attributes_array']['src'] = $iframe_url;
  $vars['attributes'] = array_merge($vars['attributes_array'], $attributes);
  $style = render_css($node_style, array($box_model, $height));
  drupal_add_css( $style, array('type' => 'inline', 'group' => CSS_THEME));
}

/**
 * @param $vars
 */
function awecontent_preprocess_awe_image(&$vars) {
  $settings = $vars['settings'];
  $vars['classes_array'] = array('awe-item', 'awe-image', $vars['class_random']);
  $src_image = $src_lightbox = '';
  if ($settings['fid'] != -1) {
    $file = file_load($settings['fid']);
    if (isset($file->uri)) {
      $src_image = ($settings['styleImage'] != 'none') ? image_style_url($settings['styleImage'], $file->uri) : file_create_url($file->uri);
      $src_lightbox = ($settings['styleLightbox'] != 'none') ? image_style_url($settings['styleLightbox'], $file->uri) : file_create_url($file->uri);
    }
  }

  $light_box = $settings['lightBox'] ? ' open-lightbox' : '';
  $caption = $settings['caption'];
  $content_caption = $settings['contentCaption'];
  $link_extend = $settings['linkExtend'];
  $target_image = $settings['targetImage'] ? '_blank' : '_self';
  $position_caption = $settings['positionCaption'];
  $on_hover = $settings['onHover'];
  $caption_on_light_box = $settings['captionOnLightBox'] ? 'true' : 'false';
  $image_id = $settings['customID'] != '' ? drupal_html_id($settings['customID']) : FALSE;
  $vars['id'] = $image_id;
  $image_class = $settings['customClass'];
  $attributes = array(
    'enable' => $settings['customEnableAttributes'],
    'attributes' => $settings['customDataAttributes']
  );
  $animations = array(
    'enable' => $settings['customEnableAnimations'],
    'animations' => $settings['customDataAnimations']
  );

  $responsive = array(
    'lgResponsive' => $settings['lgResponsive'],
    'xsResponsive' => $settings['xsResponsive'],
    'mediumResponsive' => $settings['mediumResponsive'],
    'smResponsive' => $settings['smResponsive']
  );
  $box_model = $settings['boxModelSettings'];
  $caption_top = '';
  $caption_bottom = '';
  $href = '';

  // process data input
  $node_style = _ac_render_item_id_tag($image_id, $image_class, $vars['class_random']);
  if ($node_style['isChange']) {
    $image_class = $node_style['isChange'];
    if ($image_class != $vars['class_random'])
      $vars['classes_array'][] = $image_class;
  }
  $node_style = $node_style['result'];
  $attributes = _ac_render_item_attributes_settings($attributes);
  $animations = _ac_render_item_animations_settings($animations);
  $responsive = _ac_render_item_responsive_settings($responsive);
  $vars['classes_array'][] = $responsive;
  $box_model = _ac_render_item_box_model_settings($box_model);
  if ($light_box != '') {
    $href = $src_lightbox;
  }
  else {
    $href = $link_extend;
  }
  if ($caption) {
    if ($position_caption == 'top') {
      $caption_top = sprintf('<div class="awe-image-caption" data-on-lightbox="%s">%s</div>', $caption_on_light_box, $content_caption);
    }
    else {
      $caption_bottom = sprintf('<div class="awe-image-caption" data-on-lightbox="%s">%s</div>', $caption_on_light_box, $content_caption);
      if ($position_caption == 'over') {
        $vars['classes_array'][] = 'position-over';
      }
    }
  }

  if ($on_hover) {
    $vars['classes_array'][] = 'caption-hover';
  }

  // set value for variable
  $vars['attributes_array'] = array_merge($vars['attributes_array'], $attributes);
  $animations !== '' ? $vars['attributes_array']['data-animation'] = $animations : '';
  $vars['caption_top'] = $caption_top;
  $vars['classes_lightbox'] = 'mgf-md-popup clearfix';
  $vars['classes_lightbox'] .= $light_box;
  $vars['href_lightbox'] = $href;
  $vars['href_target'] = $target_image;
  $vars['src_image'] = $src_image;
  $vars['caption_bottom'] = $caption_bottom;
  $style = render_css($node_style, array($box_model));
  drupal_add_css( $style, array('type' => 'inline', 'group' => CSS_THEME));
}

/**
 * @param $vars
 */
function awecontent_preprocess_awe_slideshow(&$vars) {
  $settings = $vars['settings'];

  $vars['images'] = $settings['images'];
  $vars['styleImage'] = $settings['styleImage'];
  $vars['styleThumb'] = $settings['styleThumb'];
  $vars['classes_array'] = array('awe-item','awe-slideshow', $vars['class_random']);
  if ($settings['captionOnHover'])
    $vars['classes_array'][] = 'caption-hover';
  $slideID = $settings['customID'] != '' ? drupal_html_id($settings['customID']) : FALSE;
  $vars['id'] = $slideID;
  $slideClass = $settings['customClass'];
  $attributes = $attributes = array(
    'enable' => $settings['customEnableAttributes'],
    'attributes' => $settings['customDataAttributes']
  );
  $animations = array(
    'enable' => $settings['customEnableAnimations'],
    'animations' => $settings['customDataAnimations']
  );
  $responsive = array(
    'lgResponsive' => $settings['lgResponsive'],
    'xsResponsive' => $settings['xsResponsive'],
    'mediumResponsive' => $settings['mediumResponsive'],
    'smResponsive' => $settings['smResponsive']
  );
  $boxModel = $settings['boxModelSettings'];
  $nodeStyle = _ac_render_item_id_tag($slideID, $slideClass, $vars['class_random']);
  if ($nodeStyle['isChange']) {
    $slideClass = $nodeStyle['isChange'];
    if ($slideClass != $vars['class_random'])
      $vars['classes_array'][] = $slideClass;
  }
  $nodeStyle = $nodeStyle['result'];

  $attributes = _ac_render_item_attributes_settings($attributes);
  $animations = _ac_render_item_animations_settings($animations);
  $responsive = _ac_render_item_responsive_settings($responsive);
  $boxModel = _ac_render_item_box_model_settings($boxModel);
  $vars['classes_array'][] = $responsive;

  $vars['attributes_array']['data-effect'] = $settings['effectSlide'];
  $vars['attributes_array']['data-navigation'] = $settings['nav'];
  if ($settings['nav'] == 'thumbnail') {
    $vars['attributes_array']['data-positionNav'] = $settings['positionThumb'];
  }
  $vars['attributes_array']['data-showcontrols'] = $settings['showControls'];
  $vars['attributes_array']['data-stoponhover'] = $settings['stopOnHoverSlide'];
  $vars['attributes_array']['data-autoplay'] = $settings['autoPlay'];
  if ($settings['autoPlay'] != '') {
    $vars['attributes_array']['data-speed'] = $settings['speedImage'];
    $vars['attributes_array']['data-transspeed'] = $settings['transSpeed'];
  }
  $vars['attributes_array'] = array_merge($vars['attributes_array'], $attributes);
  $animations !== '' ? $vars['attributes_array']['data-animation'] = $animations : '';

  $style = render_css($nodeStyle, array($boxModel));
  drupal_add_css( $style, array('type' => 'inline', 'group' => CSS_THEME));
}

/**
 * @param $vars
 */
function awecontent_preprocess_awe_message(&$vars) {
  $vars['classes_array'] = array('awe-item', 'awe-message', 'alert');
  $settings = $vars['settings'];
  $text_message = $settings['textMessage'];
  $type_message = $settings['messageType'];
  $font_settings = array(
    'fontFamily' => $settings['fontFamily'],
    'fontStyle' => $settings['fontStyle'],
    'textAlign' => $settings['textAlign'],
    'fontSize' => $settings['fontSize'],
    'lineHeight' => $settings['lineHeight'],
    'letterSpacing' => $settings['letterSpacing'],
    'unit' => 'px'
  );
  $color_settings = array(
    'color' => $settings['color'],
    'background' => $settings['backgroundColor']
  );
  $message_id = $settings['customID'] != '' ? drupal_html_id($settings['customID']) : FALSE;
  $vars['id'] = $message_id;
  $message_class = $settings['customClass'];
  $attributes = array(
    'enable' => $settings['customEnableAttributes'],
    'attributes' => $settings['customDataAttributes']
  );
  $animations = array(
    'enable' => $settings['customEnableAnimations'],
    'animations' => $settings['customDataAnimations']
  );

  $responsive = array(
    'lgResponsive' => $settings['lgResponsive'],
    'xsResponsive' => $settings['xsResponsive'],
    'mediumResponsive' => $settings['mediumResponsive'],
    'smResponsive' => $settings['smResponsive']
  );
  $box_model = $settings['boxModelSettings'];
  $node_style = _ac_render_item_id_tag($message_id, $message_class, $vars['class_random']);
  if ($node_style['isChange']) {
    $message_class = $node_style['isChange'];
    if ($message_class != $vars['class_random'])
      $vars['classes_array'][] = $message_class;
  }
  $node_style = $node_style['result'];
  // process data for item Message
  $font_settings = _ac_render_item_font_settings($font_settings);
  $color_settings = _ac_render_item_hover_settings($color_settings);
  $attributes = _ac_render_item_attributes_settings($attributes);
  $animations = _ac_render_item_animations_settings($animations);
  $responsive = _ac_render_item_responsive_settings($responsive);
  $vars['classes_array'][] = $responsive;
  $box_model = _ac_render_item_box_model_settings($box_model);

  // set value for variable
  $vars['classes_array'][] = $type_message;
  $vars['attributes_array'] = array_merge($vars['attributes_array'], $attributes);
  $animations !== '' ? $vars['attributes_array']['data-animation'] = $animations : '';
  $vars['text_content'] = $text_message;

  $style = render_css($node_style, array($font_settings , $color_settings['normal'], $box_model));
  drupal_add_css( $style, array('type' => 'inline', 'group' => CSS_THEME));
}

/**
 * @param $vars
 */
function awecontent_preprocess_awe_text(&$vars) {
  $vars['classes_array'] = array('awe-item', 'awe-text', $vars['class_random']);
  $settings = $vars['settings'];

  $text = $settings['textContent'];
  $font_settings = array(
    'fontFamily' => $settings['fontFamily'],
    'fontStyle' => $settings['fontStyle'],
    'fontSize' => $settings['fontSize'],
    'lineHeight' => $settings['lineHeight'],
    'letterSpacing' => $settings['letterSpacing'],
    'textAlign' => $settings['textAlign'],
    'unit' => 'px'
  );
  $color_settings = array(
    'color' => $settings['color'],
    'background' => $settings['backgroundColor']
  );
  $text_id = $settings['customID'] != '' ? drupal_html_id($settings['customID']) : FALSE;
  $vars['id'] = $text_id;
  $text_class = $settings['customClass'];
  $attributes = array(
    'enable' => $settings['customEnableAttributes'],
    'attributes' => $settings['customDataAttributes']
  );
  $animations = array(
    'enable' => $settings['customEnableAnimations'],
    'animations' => $settings['customDataAnimations']
  );
  $responsive = array(
    'lgResponsive' => $settings['lgResponsive'],
    'xsResponsive' => $settings['xsResponsive'],
    'mediumResponsive' => $settings['mediumResponsive'],
    'smResponsive' => $settings['smResponsive']
  );
  $box_model = $settings['boxModelSettings'];
  $node_style = _ac_render_item_id_tag($text_id, $text_class, $vars['class_random']);
  if ($node_style['isChange']) {
    $text_class = $node_style['isChange'];
    if ($text_class != $vars['class_random'])
      $vars['classes_array'][] = $text_class;
  }
  $node_style = $node_style['result'];

  // process data for item header
  $attributes = _ac_render_item_attributes_settings($attributes);
  $animations = _ac_render_item_animations_settings($animations);
  $responsive = _ac_render_item_responsive_settings($responsive);
  $vars['classes_array'][] = $responsive;
  $box_model = _ac_render_item_box_model_settings($box_model);
  $font_settings = _ac_render_item_font_settings($font_settings);
  $color_settings = _ac_render_item_hover_settings($color_settings);

  // set value for variable
  $vars['attributes_array'] = array_merge($vars['attributes_array'], $attributes);
  $animations !== '' ? $vars['attributes_array']['data-animation'] = $animations : '';
  $vars['text_content'] = $text;

  $style = render_css($node_style, array($color_settings['normal'] , $box_model , $font_settings));
  drupal_add_css( $style, array('type' => 'inline', 'group' => CSS_THEME));
}

function awecontent_preprocess_awe_html(&$vars) {
  $vars['classes_array'] = array('awe-item', 'awe-html');
  $settings = $vars['settings'];
  $vars['html'] = check_markup($settings['contentHtml'], 'full_html', '', FALSE);
}

/**
 * @param $vars
 */
function awecontent_preprocess_awe_video(&$vars) {
  $vars['classes_array'] = array('awe-item', 'awe-video', $vars['class_random']);
  $settings = $vars['settings'];

  $video_processed = $settings['linkProcessed'];
  $video_url = $settings['linkVideo'];
  $type_thumb = $settings['typeThumb'];
  if ($type_thumb == 'auto') {
    $src_thumb = $settings['srcThumbAuto'];
  }
  else {
    if ($thumb = file_load($settings['fidThumbCustom'])) {
      if ($settings['thumbStyle'] == 'none')
        $src_thumb = file_create_url($thumb->uri);
      else
        $src_thumb = image_style_url($settings['thumbStyle'], $thumb->uri);
    }
    else
      $src_thumb = '';
  }
  $type_play = $settings['typePlay'];
  $height_video = $settings['heightVideo'];
  $background_color = $settings['backgroundColor'];
  $video_id = $settings['customID'] != '' ? drupal_html_id($settings['customID']) : FALSE;
  $vars['id'] = $video_id;
  $video_class = $settings['customClass'];
  $attributes = array(
    'enable' => $settings['customEnableAttributes'],
    'attributes' => $settings['customDataAttributes']
  );
  $animations = array(
    'enable' => $settings['customEnableAnimations'],
    'animations' => $settings['customDataAnimations']
  );
  $responsive = array(
    'lgResponsive' => $settings['lgResponsive'],
    'xsResponsive' => $settings['xsResponsive'],
    'mediumResponsive' => $settings['mediumResponsive'],
    'smResponsive' => $settings['smResponsive']
  );
  $box_model = $settings['boxModelSettings'];
  $node_style = _ac_render_item_id_tag($video_id, $video_class, $vars['class_random']);
  if ($node_style['isChange']) {
    $video_class = $node_style['isChange'];
    if ($video_class != $vars['class_random'])
      $vars['classes_array'][] = $video_class;
  }
  $node_style = $node_style['result'];

  //process data for item Video
  $box_model = _ac_render_item_box_model_settings($box_model);
  $attributes = _ac_render_item_attributes_settings($attributes);
  $animations = _ac_render_item_animations_settings($animations);
  $responsive = _ac_render_item_responsive_settings($responsive);
  $vars['classes_array'][] = $responsive;
  $data_element = array();
  if ($src_thumb != '') {
    $data_element['data-thumb'] = $src_thumb;
  }
  if ($background_color != '') {
    $data_element['data-background'] = $background_color;
  }
  if ($height_video != '') {
    $data_element['data-heightvideo'] = $height_video;
  }
  $data_element['data-typeplay'] = $type_play;
  if ($type_play != 'lightbox') {
    $data_element['data-href'] = $video_processed;
  }
  else {
    $data_element['data-href'] = $video_url;
  }

  // set value for variables
  $vars['attributes_array'] = array_merge($vars['attributes_array'], $attributes);
  $animations !== '' ? $vars['attributes_array']['data-animation'] = $animations : '';
  $vars['attributes_array'] = array_merge($vars['attributes_array'], $data_element);
  $style = render_css($node_style, array($box_model));
  drupal_add_css( $style, array('type' => 'inline', 'group' => CSS_THEME));

}

/**
 * @param $vars
 */
function awecontent_preprocess_awe_tabs(&$vars) {
  $style = '';
  $settings = $vars['settings'];
  $tabs = $settings['tabs'];
  foreach ($tabs as $key_tab => $tab) {
    $tabs['title'][] = $tab['title'];
    $tabs[$key_tab] = $tab;
    $tabs['content'][] = _awecontent_preprocess_columns($tab['content'], $vars['class_random'], $vars['node']);

    // process for icon
    if (!isset($tab['icon']))
      $tabs[$key_tab]['icon'] = 'ic ac-icon-done';
  }
  $vars['tabs'] = $tabs;
  $vars['classes_array'] = array('awe-item', 'awe-tabs', $vars['class_random']);
  $settings = $vars['settings'];

  $tab_position = $settings['tabPosition'];

  // process for icon settings
  if (module_exists('icon') && isset($settings['enableIcon']) && $settings['enableIcon']) {
    $vars['classes_array'][] = 'awe-tab-icon-enabled';
    if (isset($settings['iconPosition']) && $settings['iconPosition'] == 'right')
      $vars['classes_array'][] = 'awe-tab-icon-right';
  }

  $normal_settings = array(
    'color' => $settings['normalTextColor'],
    'background' => $settings['normalBackgroundColor']
  );
  $hover_settings = array(
    'color' => $settings['hoverTextColor'],
    'background' => $settings['hoverBackgroundColor']
  );
  $active_settings = array(
    'color' => $settings['activeTextColor'],
    'background' => $settings['activeBackgroundColor']
  );
  $tabs_id = $settings['customID'] != '' ? drupal_html_id($settings['customID']) : FALSE;
  $vars['id'] = $tabs_id;
  $tabs_class = $settings['customClass'];
  $attributes = array(
    'enable' => $settings['customEnableAttributes'],
    'attributes' => $settings['customDataAttributes']
  );
  $animations = array(
    'enable' => $settings['customEnableAnimations'],
    'animations' => $settings['customDataAnimations']
  );

  $responsive = array(
    'lgResponsive' => $settings['lgResponsive'],
    'xsResponsive' => $settings['xsResponsive'],
    'mediumResponsive' => $settings['mediumResponsive'],
    'smResponsive' => $settings['smResponsive']
  );
  $box_model = $settings['boxModelSettings'];
  $node_style = _ac_render_item_id_tag($tabs_id, $tabs_class, $vars['class_random']);
  if ($node_style['isChange']) {
    $tabs_class = $node_style['isChange'];
    if ($tabs_class != $vars['class_random'])
      $vars['classes_array'][] = $tabs_class;
  }
  $node_style = $node_style['result'];

  if ($settings['titleColorEnable']) {
    $textAlign = sprintf('%s > .select-tab > .ui-tabs-nav > li > a {text-align: %s;}', $node_style, $settings['titleTextAlign']);
    $nodeNormal = sprintf('%s > .select-tab > .ui-tabs-nav > li > .ui-tabs-anchor', $node_style);
    $nodeHover = sprintf('%s > .select-tab > .ui-tabs-nav > li:hover > .ui-tabs-anchor', $node_style);
    $nodeActive = sprintf('%s > .select-tab > .ui-tabs-nav > li.ui-tabs-active > .ui-tabs-anchor', $node_style);
    $normal = _ac_render_item_hover_settings($normal_settings);
    $style .= render_css($nodeNormal, array($normal['normal']));
    $hover = _ac_render_item_hover_settings($hover_settings);
    $style .= render_css($nodeHover, array($hover['normal']));
    $active = _ac_render_item_hover_settings($active_settings);
    $style .= render_css($nodeActive, array($active['normal']));
  }

  $attributes = _ac_render_item_attributes_settings($attributes);
  $animations = _ac_render_item_animations_settings($animations);
  $responsive = _ac_render_item_responsive_settings($responsive);
  $boxModel = _ac_render_item_box_model_settings($box_model);

  // set value for variables
  $vars['classes_array'][] = $tab_position;
  $vars['classes_array'][] = $responsive;
  $vars['attributes_array'] = array_merge($vars['attributes_array'], $attributes);
  $animations !== '' ? $vars['attributes_array']['data-animation'] = $animations : '';

  $style .= render_css($node_style, array($boxModel));

  drupal_add_css( $style, array('type' => 'inline', 'group' => CSS_THEME));
}

/**
 * @param $vars
 */
function awecontent_preprocess_awe_accordion(&$vars) {
  $style = '';

  //Process data $accordions
  $settings = $vars['settings'];
  $accordions = $settings['accordion'];
  foreach ($accordions as $key_accordion => $accordion) {
    foreach ($accordion['content'] as $key_column => $column) {
      $accordion['content'] = _awecontent_preprocess_columns($accordion['content'], $vars['class_random'] . $key_accordion, $vars['node']);
    }
    $accordions[$key_accordion] = $accordion;
  }

  $vars['accordions'] = $accordions;
  //
  $vars['classes_array'] = array('awe-item', 'awe-accordion', $vars['class_random']);
  if ($settings['expandIcon'] || $settings['enableIcon'])
    $vars['classes_array'][] = 'accor-icon-enable';

  $settings = $vars['settings'];
  if ($settings['expandIcon']) {
    $vars['expandIcon'] = '<span class="sign-toggle-accr"><i class="ic ac-icon-add"></i></span>';
    $vars['classes_array'][] = 'accor-expand-icon';
  }

  $normalSettings = array(
    'color' => $settings['normalTextColor'],
    'background' => $settings['normalBackgroundColor']
  );
  $hoverSettings = array(
    'color' => $settings['hoverTextColor'],
    'background' => $settings['hoverBackgroundColor']
  );
  $activeSettings = array(
    'color' => $settings['activeTextColor'],
    'background' => $settings['activeBackgroundColor']
  );
  $accordionTitle = array(
    'enable' => $settings['enableCustomTitle'],
    'titlePosition' => $settings['titlePosition'],
    'normal' => $normalSettings,
    'hover' => $hoverSettings,
    'active' => $activeSettings
  );
  $accordionIcon = array(
    'expandIcon' => $settings['expandIcon'],
    'enableIcon' => $settings['enableIcon'],
    'iconPosition' => $settings['iconPosition'],
    'toggleExpand' => $settings['toggleExpand'],
  );
  $accordion = array(
    'icon' => $accordionIcon,
    'accordion' => $settings['accordion']
  );
  $accordionID = $settings['customID'] != '' ? drupal_html_id($settings['customID']) : FALSE;
  $vars['id'] = $accordionID;
  $accordionClass = $settings['customClass'];
  $attributes = array(
    'enable' => $settings['customEnableAttributes'],
    'attributes' => $settings['customDataAttributes']
  );
  $animations = array(
    'enable' => $settings['customEnableAnimations'],
    'animations' => $settings['customDataAnimations']
  );
  $boxModel = $settings['margin'];
  $responsive = array(
    'lgResponsive' => $settings['lgResponsive'],
    'xsResponsive' => $settings['xsResponsive'],
    'mediumResponsive' => $settings['mediumResponsive'],
    'smResponsive' => $settings['smResponsive']
  );
  $nodeStyle = _ac_render_item_id_tag($accordionID, $accordionClass, $vars['class_random']);
  if ($nodeStyle['isChange']) {
    $accordionClass = $nodeStyle['isChange'];
    if ($accordionClass != $vars['class_random'])
      $vars['classes_array'][] = $accordionClass;
  }
  $nodeStyle = $nodeStyle['result'];
  if ($settings['enableCustomTitle']) {
    $nodeNormal = sprintf('%s > .group > .ui-accordion-header', $nodeStyle);
    $nodeHover = sprintf('%s > .group > .ui-accordion-header:hover, %s > .group > .ui-accordion-header.ui-state-hover', $nodeStyle, $nodeStyle);
    $nodeActive = sprintf('%s > .group > .ui-accordion-header.ui-state-active', $nodeStyle);
    $settingsNormal = _ac_render_item_hover_settings($normalSettings);
    $style .= render_css($nodeNormal, array($settingsNormal['normal']));
    $settingsHover = _ac_render_item_hover_settings($hoverSettings);
    $style .= render_css($nodeHover, array($settingsHover['normal']));
    $settingsActive = _ac_render_item_hover_settings($activeSettings);
    $style .= render_css($nodeActive, array($settingsActive['normal']));
  }

  $vars['attributes_array']['data-toggle'] = $settings['toggleExpand'];
  if ($settings['enableIcon']) {
    $vars['classes_array'][] = 'accor-expand-icon';
    $vars['classes_array'][] = $settings['iconPosition'];
  }
  $vars['classes_array'][] = $settings['titlePosition'];
  $attributes = _ac_render_item_attributes_settings($attributes);
  $animations = _ac_render_item_animations_settings($animations);
  $boxModel = _ac_render_item_box_model_settings($boxModel);
  $responsive = _ac_render_item_responsive_settings($responsive);
  $class = $accordionClass . $responsive;

  $vars['classes_array'][] = $class;
  $vars['attributes_array'] = array_merge($vars['attributes_array'], $attributes);
  $animations !== '' ? $vars['attributes_array']['data-animation'] = $animations : '';

  $style .= render_css($nodeStyle, array($boxModel));
  drupal_add_css( $style, array('type' => 'inline', 'group' => CSS_THEME));
}

function awecontent_preprocess_awe_drupal_block(&$vars) {
  $settings = $vars['settings'];
  $block = block_load($settings['module'], $settings['delta']);
  $block->awe_settings = $settings;
  $block->awe_node = $vars['node'];
  $renderable_block = _block_get_renderable_array(_block_render_blocks(array($block)));
  $vars['content'] = drupal_render($renderable_block);
}

/**
 * @param $id
 * @param $class
 * @param $class_random
 * @return array
 */
function _ac_render_item_id_tag($id, $class, $class_random) {
  $render = array(
    'result' => '',
    'isChange' => FALSE
  );
  if ($id != FALSE) {
    $render['result'] = sprintf('#%s', $id);
  }
  else {
    $render['result'] = '.' . $class_random;
    $render['isChange'] = $class;
  }
  return $render;
}


/**
 * @param $parallax
 * @return string
 */
function _ac_render_parallax_settings($parallax) {
  $render = '';
  if ($parallax) {
    $render = ' md-parallax';
  }
  return $render;
}

/**
 * @param $settings
 * @return array
 */
function _ac_render_item_attributes_settings($settings) {
  $customAttr = array();
  $enableAttributes = $settings['enable'];
  $attributes = $settings['attributes'];
  if ($enableAttributes) {
    $attributes = drupal_json_decode($attributes);
    if (gettype($attributes) == 'array') {
      foreach ($attributes as $attr) {
        $attrName = $attr['attrName'];
        $attrValue = $attr['attrValue'];
        $customAttr[$attrName] = $attrValue;
      }
    }
  }
  return $customAttr;
}

/**
 * @param $setting
 * @param $parentNode
 * @return array
 */
function _ac_render_overlay_settings($setting, $parentNode, $radius = NULL) {
  $temp = array(
    'html' => '',
    'style' => ''
  );
  $radius_style = '';
  if (is_array($radius) && $radius['enabledCustomBorderRadius']  == 1){
    $radius_topleft = $radius['borderRadiusTopLeft'];
    $radius_topright = $radius['borderRadiusTopRight'];
    $radius_bottomleft = $radius['borderRadiusBottomLeft'];
    $radius_bootomright = $radius['borderRadiusBottomRight'];
    $check = array_unique(array($radius_topleft, $radius_topright, $radius_bottomleft, $radius_bootomright));
    if (count($check) == 1) {
      $radius_style .= 'boder-radius: '. $check[0] . 'px;';
      $radius_style .= '-webkit-border-radius: '. $check[0] . 'px;';
      $radius_style .= '-moz-border-radius: '. $check[0] . 'px;';
    }
    else{
      $radius_style .= 'border-top-left-radius: ' . $radius_topleft .'px;';
      $radius_style .= 'border-top-right-radius: ' . $radius_topright .'px;';
      $radius_style .= 'border-bottom-left-radius: ' . $radius_bottomleft .'px;';
      $radius_style .= 'border-bottom-right-radius: ' . $radius_bootomright .'px;';
    }
  }
  if ($setting['enable']) {
    $temp['html'] = sprintf('<div class="awe-bg-overlay"></div>');
    if ($setting['bgColor']) {
      $color = rgb2hex($setting['bgColor']);
      $temp['style'] = sprintf('%s { position: relative;} %s .awe-bg-overlay {' . $radius_style . ' background-color: %s; background-color: %s; height: 100%s; position: absolute; width: 100%s; top: 0; left: 0;}', $parentNode, $parentNode, $color['hex'], $setting['bgColor'], '%', '%');
    }
  }
  return $temp;
}

/**
 * @param $settings
 * @param $parentNode
 * @return array
 */
function _ac_render_item_background_settings($settings) {
  $temp = array(
    'html' => '',
    'style' => ''
  );
  if ($settings['bgColor'] != '') {
    $color = rgb2hex($settings['bgColor']);
    $background = $settings['bgColor'];
    $temp['style'] .= sprintf('background-color: %s; background-color: %s;',  $background, $color['hex']);
  }
  if($settings['bgFid'] > 0) {
    $background = _ac_render_background_image($settings);
    $temp['style'] .= sprintf('background: %s;',  $background);
  }
  return $temp;
}

/**
 * Callback to generate background image style
 */
function _ac_render_background_image($settings) {
  $style = '';
  $image = file_load($settings{'bgFid'});
  if ($image) {
    $image_url = file_create_url($image->uri);

    switch ($settings['bgMode']) {
      case 'parallax':
        $style = "url({$image_url}) fixed 50% 0%/cover";
        break;

      case 'fullcover':
        $style = "url({$image_url}) center/cover";
        break;
      
      default:
        $style = "url({$image_url}) {$settings['bgMode']} {$settings['bgPosition']}";
        break;
    }
  }

  return $style;
}

/**
 * @param $settings
 * @param $parentNode
 * @return string
 */
function _ac_render_item_box_model_settings($settings) {
  $render = '';
  $enableBorder = $settings['enabledCustomBorder'];
  $enableRadius = $settings['enabledCustomBorderRadius'];
//    $unitRadius = $boxModelSettings ->
  $enablePadding = $settings['enabledCustomPadding'];
  $enableMargin = $settings['enabledCustomMargin'];

  if ($enableBorder)
    $render .= render_unit_settings('border', $settings);
  if ($enableMargin)
    $render .= render_unit_settings('margin', $settings);
  if ($enablePadding)
    $render .= render_unit_settings('padding', $settings);
  if ($enableRadius) {
    $unitRadius = $settings['borderRadiusUnit'];
    $borderRadiusTopLeft = $settings['borderRadiusTopLeft'];
    $borderRadiusTopRight = $settings['borderRadiusTopRight'];
    $borderRadiusBottomLeft = $settings['borderRadiusBottomLeft'];
    $borderRadiusBottomRight = $settings['borderRadiusBottomRight'];
    $render .= 'border-top-left-radius: ' . $borderRadiusTopLeft . $unitRadius . ';';
    $render .= 'border-top-right-radius: ' . $borderRadiusTopRight . $unitRadius . ';';
    $render .= 'border-bottom-left-radius: ' . $borderRadiusBottomLeft . $unitRadius . ';';
    $render .= 'border-bottom-right-radius: ' . $borderRadiusBottomRight . $unitRadius . ';';
  }

  return $render;
}

/**
 * @param $name
 * @param $boxModelSettings
 * @return string
 */
function render_unit_settings($name, $boxModelSettings) {
  $render_unit = '';
  $nameTop = $boxModelSettings[$name . 'Top'];
  $nameLeft = $boxModelSettings[$name . 'Left'];
  $nameBottom = $boxModelSettings[$name . 'Bottom'];
  $nameRight = $boxModelSettings[$name . 'Right'];
  $nameUnit = isset($boxModelSettings[$name . 'Unit']) ? $boxModelSettings[$name . 'Unit'] : '';
  $render_unit .= $name . '-top: ' . $nameTop . $nameUnit . '; ';
  $render_unit .= $name . '-left: ' . $nameLeft . $nameUnit . '; ';
  $render_unit .= $name . '-bottom: ' . $nameBottom . $nameUnit . '; ';
  $render_unit .= $name . '-right: ' . $nameRight . $nameUnit . '; ';
  return $render_unit;
}

/**
 * @param $classes
 * @return array
 */
function _ac_render_column_class_settings($classes) {
  $class = array();
  foreach ($classes as $key => $value) {
    if ($value != 0) {
      if (strpos($key, 'make-row') !== FALSE)
        $value = 'true';
      $class[] = sprintf('%s-%s', $key, $value);
    }
  }
  return $class;
}



/**
 * @param $settings
 * @return string
 */
function _ac_render_item_responsive_settings($settings) {
  $class = '';
  if (!$settings['lgResponsive']) {
    $class .= ' hidden-lg';
  }
  if (!$settings['mediumResponsive']) {
    $class .= ' hidden-md';
  }
  if (!$settings['smResponsive']) {
    $class .= ' hidden-sm';
  }
  if (!$settings['xsResponsive']) {
    $class .= ' hidden-xs';
  }
  return $class;
}

/**
 * @param $settings
 * @return string
 */
function _ac_render_item_animations_settings($settings) {
  $render = '';
  if ($settings['enable'] && $settings['animations'] != '') {
    $render = $settings['animations'];
  }
  return $render;
}

/**
 * @param $settings
 * @param $node
 * @return string
 */
function _ac_render_item_hover_settings($settings) {
  $render = array(
    'hover' => '',
    'normal' => ''
  );
  $hover = '';
  $normal = '';
  if (isset($settings['color']) && $settings['color'] != '') {
    $color = rgb2hex($settings['color']);
    $normal .= sprintf('color: %s;', $color['hex']);
    $normal .= sprintf('color: %s;', $settings['color']);
  }
  if (isset($settings['background']) && $settings['background'] != '') {
    $color = rgb2hex($settings['background']);
    $normal .= sprintf('background: %s;', $color['hex']);
    $normal .= sprintf('background: %s;', $settings['background']);
  }
  if (isset($settings['hoverColor']) && $settings['hoverColor'] != '') {
    $color = rgb2hex($settings['hoverColor']);
    $hover .= sprintf('color: %s;', $color['hex']);
    $hover .= sprintf('color: %s;', $settings['hoverColor']);
  }
  if (isset($settings['hoverBackground']) && $settings['hoverBackground'] != '') {
    $color = rgb2hex($settings['hoverBackground']);
    $hover .= sprintf('background-color: %s;', $color['hex']);
    $hover .= sprintf('background-color: %s;', $settings['hoverBackground']);
  }
  if ($normal != '') {
    $render['normal'] = $normal;
  }
  if ($hover) {
    $render['hover'] = $hover;
  }

  return $render;
}

/**
 * @param $settings
 * @param $node
 * @return string
 */
function _ac_render_item_font_settings($settings, $item_type = '') {
  $render = '';
  $unit = $settings['unit'];
  if (isset($settings['fontFamily']) && $settings['fontFamily'])
    $render = sprintf('font-family: %s;', $settings['fontFamily']);
  if ($settings['fontSize'] != -1) {
    $render .= sprintf('font-size: %s%s', $settings['fontSize'], $unit);
    if ($item_type == 'header')
      $render .= ' !important';
    $render .= ';';
  }
  if (isset($settings['lineHeight']) && $settings['lineHeight'] != -1)
    $render .= sprintf('line-height: %s%s;', $settings['lineHeight'], $unit);
  if (isset($settings['fontStyle']) && $settings['fontStyle'] != '') {
    preg_match('/{(.*?)}/', $settings['fontStyle'], $matches);
    if ($matches[1]) {
      $fontStyle = explode(',', $matches[1]);
      foreach($fontStyle as $key => $value) {
        $values = explode(':', $value);
        if (isset($values[1]) && trim($values[1]) == '""')
          unset($fontStyle[$key]);
      }
      $fontStyle = (count($fontStyle)) ? implode(';', str_replace('"', '', $fontStyle)) . ';' : '';
      $render .= $fontStyle;
    }
  }
  if (isset($settings['textAlign']) && $settings['textAlign'] != '')
    $render .= sprintf('text-align: %s;', $settings['textAlign']);
  if (isset($settings['letterSpacing']) && $settings['letterSpacing'] != '' && $settings['letterSpacing'] != -1)
    $render .= sprintf('letter-spacing: %s%s;', $settings['letterSpacing'], $unit);
  if (isset($settings['lineSpacing']) && $settings['lineSpacing'] && $settings['lineSpacing'] != -1)
    $render .= sprintf('line-spacing: %s%s;', $settings['lineSpacing'], $unit);

  return $render;
}

/**
 * @param $settings
 * @param $parentNode
 * @return string
 */
function render_settings_item_divider_border($settings) {
  $render = '';
  $render .= sprintf('border-top-style: %s;', $settings['style']);
  if ($settings['color']) {
    $color = rgb2hex($settings['color']);
    $render .= sprintf('border-top-color: %s;', $settings['color']);
    $render .= sprintf('border-top-color: %s;', $color['hex']);
  }
  if ($settings['width']) {
    $render .= sprintf('border-top-width: %spx;', $settings['width']);
  }

  return $render;
}

/**
 * @param $settings
 * @return array
 */
function render_settings_item_gmap_gmapSettings($settings) {
  $render = array();
  $render['data-zoom'] = $settings['zoom'];
  $render['data-style'] = $settings['style'];
  $render['data-latLong'] = $settings['latLong'];
  $render['data-scrollZoom'] = $settings['scroll_zoom'];
  if ($settings['custom_info']) {
    $render['data-info'] = $settings['custom_info'];
    $render['data-marker'] = $settings['icon_marker'];
    $render['data-title'] = $settings['title'];
    $render['data-descriptions'] = $settings['descriptions'];
  }
  return $render;
}

/**
 * @param $settings
 * @param $parentNode
 * @return array
 */
function render_settings_item_facebook_src($settings, $parentNode) {
  $render = array(
    'src' => '',
    'style' => ''
  );
  if ($settings['url'] != '') {
    $render['src'] .= sprintf('//www.facebook.com/plugins/likebox.php?href=%s&colorscheme=light&show_faces=false&header=false&stream=false&show_border=false&width=%s&height=%s', $settings['url'], $settings['width'], $settings['height']);
    if ($settings['colorScheme']) {
      $render['src'] = str_replace('colorscheme=light', 'colorscheme=dark', $render['src']);
    }
    if ($settings['friendFaces']) {
      $render['src'] = str_replace('show_faces=false', 'show_faces=true', $render['src']);
    }
    if ($settings['header']) {
      $render['src'] = str_replace('header=false', 'header=true', $render['src']);
    }
    if ($settings['posts']) {
      $render['src'] = str_replace('stream=false', 'stream=true', $render['src']);
    }
    if ($settings['border']) {
      $render['src'] = str_replace('show_border=false', 'show_border=true', $render['src']);
    }
    if ($settings['width'] != '0') {
      $render['style'] .= sprintf('width: %spx;', $settings['width']);
    }
    if ($settings['height']) {
      $render['style'] .= sprintf('height: %spx', $settings['height']);
    }
    if ($render['style']) {
      $render['style'] = sprintf('%s {%s}', $parentNode, $render['style']);
    }
  }
  return $render;
}

function _ac_render_video_background_settings($setting, $parentNode) {
  $temp = array(
    'html' => '',
    'style' => ''
  );
  if ($setting['enable']) {
    if ($setting['showControl']) {
      $auto = $setting['auto'] ? 'pause-btn' : 'play-btn';
      $control = sprintf('<div class="awe-media-control"><a class="media-btn %s"></a></div>', $auto);
    }
    else {
      $control = '';
    }
    $url = video_regUrl($setting['url']);
    if (!$setting['auto']) {
      $url = str_replace('autoplay=1', 'autoplay=0', $url);
    }
    if (!$setting['mute']) {
      $url = str_replace('volume=1', 'volume=0', $url);
    }
    $id = 'iframe-video-' . rand(0, 1000) . rand(0, 1000);
    $temp['html'] = sprintf('<div class="frame-embed"><iframe id="%s" class="frame-embed-item" src="%s"></iframe><div class="overlay-iframe"></div>%s</div>', $id, $url, $control);
  }
  return $temp;
}

function render_css($select, $data) {
  $output = '';
  if (is_array($data)) {
    $output .= implode(' ', $data);
  }
  else if(is_string($data))
    $output .= $data;

  if($output != '') {
    $output = $select . '{' . $output .' }';
    return $output;
  }
  else
    return false;
}

function video_regUrl($url) {
  if (gettype(strpos($url, 'youtube')) == 'integer') {
    $ids = array();
    // find all urls
    preg_match_all('/(http|https)\:\/\/[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,3}(\/\S*)?/', $url, $links);
    foreach ($links[0] as $link) {
      if (preg_match('~youtube\.com~', $link)) {
        if (preg_match('/[^=]+=([^?]+)/', $link, $id)) {
          $ids[] = $id[1];
        }
      }
    }
    $idYT = count($ids) ? $ids[0] : '';
    $ytLink = '//www.youtube.com/embed/' . $idYT . '?autoplay=1' . '&loop=1&controls=1&showinfo=0&volume=1&enablejsapi=1';
    return $ytLink;
  }
  else {
    if (gettype(strpos($url, 'vimeo')) == 'integer') {
      preg_match('/(https?:\/\/)?(www\.)?(player\.)?vimeo\.com\/([a-z]*\/)*([0-9]{6,11})[?]?.*/', $url, $match);
      $idVM = $match[5];
      $vmLink = '//player.vimeo.com/video/' . $idVM . '?autoplay=1&loop=1&fullscreen=1';
      return $vmLink;
    }
  }
}

function rgb2hex($color) {
  $data = array();
  $pattern = '/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/';
  preg_match($pattern, $color, $matches);
  if ($matches) {
    $hex = "#";
    $hex .= str_pad(dechex($matches[1]), 2, "0", STR_PAD_LEFT);
    $hex .= str_pad(dechex($matches[2]), 2, "0", STR_PAD_LEFT);
    $hex .= str_pad(dechex($matches[3]), 2, "0", STR_PAD_LEFT);
    $data['hex'] = $hex;
    if ( isset($matches[4]) ){
      $data['alpha'] = $matches[4];
    }
  }
  elseif (strpos($color, '#') !== FALSE)
    $data['hex'] = $color;

  return $data;
}

class FlickrImages {
  private $xml;

  public function __construct($rss_url) {
    $this->xml = @simplexml_load_file($rss_url);
  }

  public function getTitle() {
    return $this->xml->channel->title;
  }

  public function getProfileLink() {
    return $this->xml->channel->link;
  }

  public function getImages() {
    $images = array();
    $regx = "/<img(.+)\/>/";
    foreach ($this->xml->channel->item as $item) {
      preg_match($regx, $item->description, $matches);
      $images[] = array(
        'title' => $item->title,
        'link' => $item->link,
        'thumb' => $matches[0]
      );
    }
    return $images;
  }

  public function getXML() {
    return $this->xml;
  }
}

