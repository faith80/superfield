<?php
  $field_instances = field_info_instance('node', $settings['fieldName'], $settings['nodeType']);
  $display = field_get_display($field_instances, 'full', $node);
  $field_render = field_view_field('node', $node, $settings['fieldName'], $display);
  print render($field_render);
?>