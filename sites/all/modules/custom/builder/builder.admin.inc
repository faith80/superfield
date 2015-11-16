<?php

/**
 * 
 * Form setting up permission for contents of Builder per role.
 */
function builder_admin_content_permissions($form, &$form_state, $rid = NULL) {

  $groups = array();
  $content_load = builder_content_load_contents();
  if (!empty($content_load)) {
    foreach ($content_load as $module => $module_contents) {
      if (!empty($module_contents)) {
        foreach ($module_contents as $delta => $content) {
          if (!empty($content['group'])) {
            $groups[$content['group']][$delta] = $content;
          } else {
            $groups[t('Other')][$delta] = $content;
          }
        }
      }
    }
  }
  $role_names = user_roles();
  if (is_numeric($rid)) {
    $role_names = array($rid => $role_names[$rid]);
  }

  $role_permissions = _builder_content_permissions($role_names);

  $form['role_names'] = array(
      '#type' => 'value',
      '#value' => $role_names,
  );

  $options = array();
  foreach ($groups as $group => $contents) {
    if (!empty($contents)) {

      $form['permission'][] = array(
          '#markup' => $group,
          '#group' => TRUE,
      );
      foreach ($contents as $delta => $content) {
        if (is_numeric($delta)) {
          $delta = 'REMOVE__' . $delta;
        }
        $options[$delta] = '';
        $form['permission'][$delta] = array(
            '#type' => 'item',
            '#markup' => $content['info'],
        );
        foreach ($role_names as $rid => $name) {
          // Builds arrays for checked boxes for each role
          $new_delta = str_replace('REMOVE__', '', $delta);
          if (isset($role_permissions[$rid][$new_delta])) {
            $status[$rid][] = $delta;
          }
        }
      }
    }
  }

  // Have to build checkboxes here after checkbox arrays are built
  foreach ($role_names as $rid => $name) {
    $form['checkboxes'][$rid] = array(
        '#type' => 'checkboxes',
        '#options' => $options,
        '#default_value' => isset($status[$rid]) ? $status[$rid] : array(),
        '#attributes' => array('class' => array('rid-' . $rid)),
    );
    $form['role_names'][$rid] = array('#markup' => check_plain($name), '#tree' => TRUE);
  }

  $form['actions'] = array('#type' => 'actions');
  $form['actions']['submit'] = array('#type' => 'submit', '#value' => t('Save permissions'));
  $form['#attached']['js'][] = drupal_get_path('module', 'builder') . '/js/builder.permissions.js';

  return $form;
}

/*
 *  Submition handle for builder_admin_content_permissions()
 */

function builder_admin_content_permissions_submit($form, &$form_state) {
  foreach ($form_state['values']['role_names'] as $rid => $name) {
    $perms = array();
    $permissions = $form_state['values'][$rid];
    if (!empty($permissions)) {
      foreach ($permissions as $k => $v) {
        $new_key = str_replace('REMOVE__', '', $k);
        $perms[$new_key] = $v;
      }
    }
    builder_contents_change_permissions($rid, $perms);
  }

  drupal_set_message(t('The changes have been saved.'));
  cache_clear_all();
}

function theme_builder_admin_content_permissions($variables) {
  $form = $variables['form'];

  $roles = user_roles();
  foreach (element_children($form['permission']) as $key) {
    $row = array();
    // Module name
    if (is_numeric($key)) {
      $row[] = array('data' => drupal_render($form['permission'][$key]), 'class' => array('module'), 'id' => 'module-' . $form['permission'][$key]['#id'], 'colspan' => count($form['role_names']['#value']) + 1);
    } else {
      // Permission row.
      $row[] = array(
          'data' => drupal_render($form['permission'][$key]),
          'class' => array('permission'),
      );
      foreach (element_children($form['checkboxes']) as $rid) {
        $form['checkboxes'][$rid][$key]['#title'] = $roles[$rid] . ': ' . $form['permission'][$key]['#markup'];
        $form['checkboxes'][$rid][$key]['#title_display'] = 'invisible';
        $row[] = array('data' => drupal_render($form['checkboxes'][$rid][$key]), 'class' => array('checkbox'));
      }
    }
    $rows[] = $row;
  }
  $header[] = (t('Builder content'));
  foreach (element_children($form['role_names']) as $rid) {
    $header[] = array('data' => drupal_render($form['role_names'][$rid]), 'class' => array('checkbox'));
  }
  $output = '<p>' . t('Setup permissions by role to able select contents when use Builder.') . '</p>';
  $output .= theme('table', array('header' => $header, 'rows' => $rows, 'attributes' => array('id' => 'permissions')));
  $output .= drupal_render_children($form);
  return $output;
}
