<?php

function awe_table($item, $class_rand, $node) {
  $style = '';

  $html = '';
  $cellModel = $item['cellModelSettings'];
  $boxModel = $item['boxModelSettings'];
  $content = array(
    'enableHeader' => $item['TableHeader'],
    'enableFooter' => $item['TableFooter'],
    'content' => $item['content']
  );
  $tableId = $item['customID'] != '' ? drupal_html_id($item['customID']) : '';
  $tableClass = $item['customClass'];
  $attributes = array(
    'enable' => $item['customEnableAttributes'],
    'attributes' => $item['customDataAttributes']
  );
  $animations = array(
    'enable' => $item['customEnableAnimations'],
    'animations' => $item['customDataAnimations']
  );

  $responsive = array(
    'lgResponsive' => $item['lgResponsive'],
    'xsResponsive' => $item['xsResponsive'],
    'mediumResponsive' => $item['mediumResponsive'],
    'smResponsive' => $item['smResponsive']
  );
  $equalColumn = $item['EqualColum'];
  $colOddBg = array(
    'background' => $item['ColOddBG']
  );
  $colEventBg = array(
    'background' => $item['ColEvenBG']
  );
  $rowOddBg = array(
    'background' => $item['RowOddBG']
  );
  $rowEventBg = array(
    'background' => $item['RowEvenBG']
  );
  // Create Node Style
  $nodeStyle = _ac_render_item_id_tag($tableId, $tableClass, $class_rand);
  if ($nodeStyle['isChange']) {
    $tableClass = $nodeStyle['isChange'];
  }
  $nodeStyle = $nodeStyle['result'];
  $nodeCellStyle = sprintf('%s td, %s th', $nodeStyle, $nodeStyle);
  $nodeColOdd = sprintf('%s colgroup col:nth-child(odd)', $nodeStyle);
  $nodeColEvent = sprintf('%s colgroup col:nth-child(even)', $nodeStyle);
  $nodeRowOdd = sprintf('%s tbody tr:nth-child(odd)', $nodeStyle);
  $nodeRowEvent = sprintf('%s tbody tr:nth-child(even)', $nodeStyle);

  // process data for item Table
  $cellModel = _ac_render_item_box_model_settings($cellModel);

  $style .= render_css($nodeCellStyle, array($cellModel));
  $boxModel = _ac_render_item_box_model_settings($boxModel, $nodeStyle);
  $style .= render_css($nodeStyle, array($boxModel));
  $colOddBg = _ac_render_item_hover_settings($colOddBg, $nodeColOdd);
  $style .= render_css($nodeColOdd, array($colOddBg['normal']));
  $colEventBg = _ac_render_item_hover_settings($colEventBg, $nodeColEvent);
  $style .= render_css($nodeColEvent, array($colEventBg['normal']));
  $rowOddBg = _ac_render_item_hover_settings($rowOddBg, $nodeRowOdd);
  $style .= render_css($nodeRowOdd, array($rowOddBg['normal']));
  $rowEventBg = _ac_render_item_hover_settings($rowEventBg, $nodeRowEvent);
  $style .= render_css($nodeRowEvent, array($rowEventBg['normal']));
  $attributes = _ac_render_item_attributes_settings($attributes);
  $animations = _ac_render_item_animations_settings($animations);
  $responsive = _ac_render_item_responsive_settings($responsive);
  $content = render_settings_item_table_content($content, $nodeStyle);
  $equalColumn = $equalColumn ? sprintf('%s > colgroup >col {width: 1%%}', $nodeStyle) : '';
  $style .= $equalColumn;
  $tableClass .= $responsive;

  $str_attributes = '';
  $animations != '' ? $str_attributes = "data-animation='" . $animations . "'" : '';
  if (count($attributes)) {
    foreach ($attributes as $key => $value) {
      $str_attributes .= $key . '="' . $value . '"';
    }
  }
  $html = sprintf('<table %s class="awe-table table %s" %s>%s %s %s %s</table>', $tableId, $tableClass, $str_attributes, $content['colgroup'], $content['thead'], $content['tbody'], $content['tfoot']);
  drupal_add_css( $style, array('type' => 'inline', 'group' => CSS_THEME));
  return $html;
}

function render_settings_item_table_content($settings, $parentNode) {
  $render = array(
    'colgroup' => '',
    'thead' => '',
    'tbody' => '',
    'tfoot' => '',
    'style' => ''
  );
  foreach ($settings['content'] as $key => $row) {

    $settingRow = array(
      'row' => $row,
      'enableHeader' => $settings['enableHeader'],
      'enableFooter' => $settings['enableFooter']
    );
    $temp = render_settings_item_table_row($settingRow, $parentNode);
    $render['colgroup'] .= $temp['colgroup'];
    $render['thead'] .= $temp['thead'];
    if ($temp['tbody'] != '') {
      $render['tbody'] .= sprintf('<tr>%s</tr>', $temp['tbody']);
    }
    $render['tfoot'] .= $temp['tfoot'];
    $render['style'] .= $temp['style'];
  }

  return $render;
}

function render_settings_item_table_row($setting, $parentNode) {
  $render = array(
    'colgroup' => '',
    'thead' => '',
    'tbody' => '',
    'tfoot' => '',
    'style' => ''
  );

  $type = $setting['row']['type'];
  $enableHeader = $setting['enableHeader'];
  $enableFooter = $setting['enableFooter'];
  if (!$enableHeader && $type == 'theader') {
    return $render;
  }
  if (!$enableFooter && $type == 'tfooter') {
    return $render;
  }
  $col = render_settings_item_table_col($setting['row']['colums'], $parentNode);
  $render['style'] = $col['style'];

  if ($type == 'colgroup') {
    $render['colgroup'] = sprintf('<colgroup>%s</colgroup>', $col['html']);
    return $render;
  }
  if ($enableHeader && $type == 'theader') {
    $render['thead'] = sprintf('<thead>%s</thead>', $col['html']);
    return $render;
  }
  if ($enableFooter && $type == 'tfooter') {
    $render['tfoot'] = sprintf('<tfoot>%s</tfoot>', $col['html']);
    return $render;
  }
  $render['tbody'] = sprintf('%s', $col['html']);
  return $render;
}

function render_settings_item_table_col($col, $parentNode) {
  $render = array(
    'html' => '',
    'style' => ''
  );
  foreach ($col as $key => $content) {
    $tagName = $content['tagName'];
    $text = $content['content'];
    $render['html'] .= sprintf('<%s>%s</%s>', $tagName, $text, $tagName);
    if (isset($content['colWidth']) && $content['colWidth'] != '') {

      $render['style'] .= sprintf('%s col:nth-of-type(%d){width: %spx;}', $parentNode, $key + 1, (int) ($content['colWidth']));
    }
  }
  return $render;
}