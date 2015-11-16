<?php
/**
 * @File: awecontent_elements.inc
 * @Author: AWEThemes
 * Website: http://awethemes.com/
 *
 * Contains function to render element api for panel
 */

/**
 * @param $elements
 *      Array contains elements and settings for each element
 * @param $panel_name
 *      String name of panel
 * @return array
 *      Array contains html and js for panel
 */

function ac_render_panel($elements, $panel_name) {
  $output = array('html' => '', 'js' => '');
  foreach ($elements as $el_name => $el) {
    _ac_render_panel_element($el, $el_name, $panel_name, $output);
  }

  if (!empty($output['js'])) {
    $output['js'] = sprintf('(function($){$(document).ready(function() {%s})})(jQuery)', $output['js']);
  }

  return $output;
}


function _ac_render_panel_element($element, $name, $panel_name, &$output = array()) {
  if (is_object($element)) {
    $element = get_object_vars($element);
  }

  if (isset($element["type"])) {
    $function = sprintf("_ac_render_%s_element", $element["type"]);
    if (function_exists($function)) {
      $render = $function($element, $name, $panel_name);

      if (isset($render["html"])) {
        $output["html"] .= $render["html"];
      }

      if (isset($render["js"])) {
        $output["js"] .= $render["js"];
      }
    }
  }
}

/**
 * Callback to process attributes option of element
 */
function _ac_process_element_attributes($element) {
  $custom_classes = "";
  $attributes = "";

  if (isset($element["attributes"]) && is_array($element["attributes"])) {
    if (isset($element["attributes"]["class"]) && is_array($element["attributes"]["class"])) {
      $custom_classes = sprintf(' %s', implode(" ", $element["attributes"]["class"]));
      unset($element["attributes"]["class"]);
    }

    $attributes = array();
    foreach ($element["attributes"] as $key => $value) {
      $attributes[] = sprintf('%s="%s"', $key, "{$value}");
    }

    if (count($attributes)) {
      $attributes = sprintf(' %s', implode(" ", $attributes));
    }
    else {
      $attributes = "";
    }
  }

  return array("extra_classes" => $custom_classes, "attributes" => $attributes);
}

function _ac_process_element_name(&$name, $panel_name) {
  $name = strtolower(str_replace("_", "-", $name));
  $panel_name = strtolower(str_replace("_", "-", $panel_name));
  $id = ($panel_name) ? "{$panel_name}-{$name}" : $name;

  return $id;
}

/**
 * Callback to generate section item
 */
function _ac_render_markup_element($element, $name, $panel_name) {
  $output = array("html" => "");
  if (isset($element["markup"])) {
    $output["html"] .= $element["markup"];
  }
  else {
    if (isset($element['theme'])) {
      $variables = array();
      if (isset($element['parameters']))
        $variables = array_merge($variables, $element['parameters']);
      $output['html'] = theme($element['theme'], $variables);
    }
  }

  return $output;
}

/**
 * Callback to generate section item
 */
function _ac_render_section_element($element, $name, $panel_name) {
  $attributes = _ac_process_element_attributes($element);
  unset($element["type"]);
  $section = array("html" => "", "js" => "");
  foreach ($element as $key => $value) {
    _ac_render_panel_element($value, $key, $panel_name, $section);
  }

  $section["html"] = sprintf('<div class="md-section%s"%s>%s</div>', $attributes["extra_classes"], $attributes["attributes"], $section["html"]);
  return $section;
}

/**
 * Callback to generate section item
 */
function _ac_render_tabs_element($element, $name, $panel_name) {
  $id = _ac_process_element_name($name, $panel_name);
  $attributes = _ac_process_element_attributes($element);
  $output = array("html" => "", "js" => "");

  if (isset($element["tabs"]) && is_array($tabs = $element["tabs"])) {
    $tabs_render = array("html" => "", "controllers" => "", "js" => "");
    foreach ($tabs as $tab_id => $tab) {
      // Convert tab to array
      if (is_object($tab)) {
        $tab = get_object_vars($tab);
      }

      // Generate controller for tab
      $tabs_render["controllers"] .= sprintf('<li class="evr-change"><a href="#%s-tab-%d">%s<i class="i-sign ic ac-icon-circle"></i></a></li>', $name, $tab_id, $tab["tab_title"]);

      // Generate content for tab
      $render_tab = array("html" => "", "js" => "");
      $tab_contents = $tab["contents"];
      if (is_object($tab_contents)) {
        $tab_contents = get_object_vars($tab_contents);
      }
      foreach ($tab_contents as $key => $value) {
        _ac_render_panel_element($value, $key, $panel_name, $render_tab);
      }

      $tabs_render["html"] .= sprintf('<div id="%s-tab-%d">%s</div>', $name, $tab_id, $render_tab["html"]);
      $tabs_render["js"] .= $render_tab["js"];
    }

    // Generate tab element
    $output["html"] .= sprintf('
			<div id="%s" class="md-tab table-size%s"%s>
				<div class="select-tab"><ul>%s</ul></div>
				<div class="md-content-tab">%s</div>
			</div>
		', $id, $attributes["extra_classes"], $attributes["attributes"], $tabs_render["controllers"], $tabs_render["html"]);
    $output["js"] .= $tabs_render["js"];
    $output["js"] .= sprintf('$("#%s").tabs();', $id);
  }

  return $output;
}

/**
 * Callback to generate list_box element
 */
function _ac_render_list_box_element($element, $name, $panel_name) {
  unset($element["type"]);
  $attributes = _ac_process_element_attributes($element);
  $list_box = array("html" => "", "js" => "");
  foreach ($element as $key => $value) {
    _ac_render_panel_element($value, $key, $panel_name, $list_box);
  }
  $list_box["html"] = sprintf('<div class="list-box%s"%s>%s</div>', $attributes["extra_classes"], $attributes["attributes"], $list_box["html"]);

  return $list_box;
}

function _ac_render_colorpicker_element($element, $name, $panel_name) {
  $id = _ac_process_element_name($name, $panel_name);
  $attributes = _ac_process_element_attributes($element);

  $options = "";
  if (isset($element["options"])) {
    $options = array();
    foreach ($element["options"] as $key => $value) {
      if (in_array($key, array(
        "move",
        "change",
        "hide",
        "show",
        "beforeShow",
        "dragStart",
        "dragStop"
      ))) {
        $options[] = sprintf('"%s": %s', $key, $value);
      }
      else {
        $options[] = sprintf('"%s": %s', $key, var_export($value, TRUE));
      }
    }

    $options = sprintf("{%s}", implode(",", $options));
  }
  return array(
    "html" => sprintf(
      '<div id="%s" class="color-picker%s"%s>
          <span class="tit">%s</span>
          <div class="color"><input type="text" class="spectrum" value="" name="awe-color-picker" /></div>
      </div>',
      $id,
      $attributes["extra_classes"],
      $attributes["attributes"],
      $element["title"]
    ),
    "js" => sprintf('$("#%s").aweColorPicker(%s);', $id, $options),
  );
}

function _ac_render_font_element($element, $name, $panel_name) {
  $id = _ac_process_element_name($name, $panel_name);
  $title = isset($element["title"]) ? $element["title"] : "Font";
  $attributes = _ac_process_element_attributes($element);

  // create font family settings element
  $font_family_name = 'font_family';
  $font_family = sprintf(
    '<div id="%s" class="awe-font-family tit-info toggle-pull">
        <label>%s</label>
        <span class="type-font">Default</span>
        <div class="apply-font"><i class="js-apply-font ic ac-icon-done"></i></div>
    </div>',
    _ac_process_element_name($font_family_name, $panel_name),
    $title
  );

  // create html for font weight
  $font_style = array('html' => '', 'js' => '');
  if (!isset($element['disabledElements']) || in_array('fontStyle', $element['disabledElements']) === FALSE) {
    $font_style_el = array(
      'type' => 'select',
      'title' => t("Font style"),
      'options' => array(
        '{"font-weight":"","font-style":""}' => t('Default'),
        '{"font-weight":100,"font-style":""}' => t('Thin'),
        '{"font-weight":200,"font-style":""}' => t('Extra-Light'),
        '{"font-weight":400,"font-style":""}' => t('Normal'),
        '{"font-weight":500,"font-style":""}' => t('Medium'),
        '{"font-weight":600,"font-style":""}' => t('Semi Bold'),
        '{"font-weight":700,"font-style":""}' => t('Bold'),
        '{"font-weight":800,"font-style":""}' => t('Extra Bold'),
        '{"font-weight":900,"font-style":""}' => t('Ultra Bold'),
      ),
      'default_value' => 'default',
      'attributes' => array('class' => array('awe-font-style'), 'data-font-style' => '100,200,400,500,600,700,800,900')
    );
    $font_style = _ac_render_select_element($font_style_el, 'font_style', $panel_name);
  }

  // create font align
  $font_align = array('html' => '', 'js' => '');
  if (!isset($element['disabledElements']) || in_array('textAlign', $element['disabledElements']) === FALSE) {
    $font_align_el = array(
      'title' => t('Align'),
      'type' => 'select',
      'options' => array(
        'left' => t('Left'),
        'center' => t('Center'),
        'right' => t('Right'),
      ),
      'default_value' => 'left',
      'attributes' => array('class' => array('awe-text-align'))
    );
    $font_align = _ac_render_select_element($font_align_el, 'text_align', $panel_name);
  }

  // create html for font size, line spacing & letter spacing
  $font_box_el = array('type' => 'list_box');
  if (!isset($element['disabledElements']) || in_array('fontSize', $element['disabledElements']) === FALSE) {
    $font_box_el['font_size'] = array(
      'type' => 'slider',
      'title' => t('Font size'),
      'min_value' => -1,
      'max_value' => 100,
      'unit' => 'px',
      'default_value' => -1,
      'allow_type' => TRUE,
      'attributes' => array('class' => array('awe-font-size'))
    );
  }

  if (!isset($element['disabledElements']) || in_array('lineSpacing', $element['disabledElements']) === FALSE) {
    $font_box_el['line_spacing'] = array(
      'type' => 'slider',
      'title' => t('Line spacing'),
      'min_value' => -1,
      'max_value' => 100,
      'unit' => 'px',
      'default_value' => -1,
      'allow_type' => TRUE,
      'attributes' => array('class' => array('awe-line-spacing'))
    );
  }

  if (!isset($element['disabledElements']) || in_array('letterSpacing', $element['disabledElements']) === FALSE) {
    $font_box_el['letter_spacing'] = array(
      'type' => 'slider',
      'title' => t('Letter spacing'),
      'min_value' => -1,
      'max_value' => 10,
      'unit' => 'px',
      'default_value' => -1,
      'allow_type' => TRUE,
      'attributes' => array('class' => array('awe-letter-spacing'))
    );
  }
  $font_box = _ac_render_list_box_element($font_box_el, 'font_box', $panel_name);

  return array(
    'html' => sprintf(
      '<div id="%s" class="%s"%s>%s%s%s%s</div>',
      $id,
      $attributes["extra_classes"],
      $attributes["attributes"],
      $font_family,
      $font_style['html'],
      $font_align['html'],
      $font_box['html']
    ),
    'js' => "$('#{$id}').aweFont();"
  );
}

function _ac_render_select_element($element, $name, $panel_name) {
  $select_options = isset($element["options"]) ? (is_object($element["options"]) ? get_object_vars($element["options"]) : $element["options"]) : array();
  $js = "";
  $html = "";

  if (!empty($select_options)) {
    $id = _ac_process_element_name($name, $panel_name);
    $title = isset($element["title"]) ? $element["title"] : "";
    if (isset($element["default_value"]) && isset($select_options[$element["default_value"]]))
      $default_value = $element["default_value"];
    else {
      $options_value = array_keys($select_options);
      $default_value = $options_value[0];
    }
    $attributes = _ac_process_element_attributes($element);
    $options = array();

    foreach ($select_options as $key => $value) {
      $options[] = sprintf('<li data-value=\'%s\'>%s</li>', $key, $value);
    }

    $options = sprintf('<ul class="content-drop">%s</ul>', implode("\n", $options));
    $js = "$('#{$id}').aweSelect();";
    $html = sprintf(
      '<div id="%s" class="select-list toggle-drop%s"%s>
          <span class="title-tag">%s</span>
          <div class="list-item">
              <div class="crr-item">
                  <span class="dis-change">%s</span>
                  <i class="ic ac-icon-arrow-down"></i>
                  <input type="hidden" value=\'%s\' name="selected_value" />
              </div>
              %s
          </div>
      </div>',
      $id,
      $attributes["extra_classes"],
      $attributes["attributes"],
      $title,
      $select_options[$default_value],
      $default_value,
      $options
    );
  }

  return array(
    "html" => $html,
    "js" => $js
  );
}

function _ac_render_slider_element($element, $name, $panel_name) {
  $id = _ac_process_element_name($name, $panel_name);
  $title = isset($element["title"]) ? $element["title"] : "Title";
  $unit = isset($element["unit"]) ? $element["unit"] : "";
  $allow_edit = isset($element["allow_type"]) ? var_export($element["allow_type"], TRUE) : FALSE;
  $attributes = _ac_process_element_attributes($element);
  $step = (isset($element["step"]) && intval($element["step"])) ? intval($element["step"]) : 1;
  $default_value = (isset($element["default_value"])) ? ''.$element['default_value'] : '';


  if ((isset($element["values"]) && is_array($element["values"])) || (isset($element["widget"]) && $element["widget"] == "button") && isset($element["min_value"]) && isset($element["max_value"]) && intval($element["max_value"]) > intval($element["min_value"])) {
    $values =  isset($element["values"])? $element["values"] : range($element["min_value"], $element["max_value"], $step);
    if (!in_array($default_value, $values))
      $default_value = $values[0];

    $controller = sprintf(
      '<div class="add-abstract">
          <span class="change-tag abstract"><i class="ic ac-icon-minus"></i></span>
          <span class="change-tag add"><i class="ic ac-icon-add"></i></span>
      </div>
      <input type="hidden" value=%s name="slider_values" />', json_encode($values));
    $options = array("type" => "button", "allowType" => $allow_edit);
  }
  elseif (isset($element["min_value"]) && isset($element["max_value"]) && intval($element["max_value"]) > intval($element["min_value"])) {
    $default_value = isset($element["default_value"]) ? $element["default_value"] : round((intval($element["max_value"]) + intval($element["min_value"])) / 2);
    $controller = '<div class="pull-slider"><div class="slider-val"></div></div>';
    $options = array(
      "type" => "slider",
      "allowType" => $allow_edit,
      "min" => $element["min_value"],
      "max" => $element["max_value"],
      "step" => $step,
      "default" => $default_value
    );
  }

  $html = sprintf(
    '<div id= "%s" class="md-box frame-slider%s"%s>
        <div class="drif-item">
            <span class="awe-slider-title">%s</span>
            <div class="frame-display">
                <span contenteditable="%s" class="display-font type-num key-add">%s</span>
                <span class="font-unit">%s</span>
            </div>
            %s
        </div>
        <div class="drif-item-overlay"></div>
    </div>',
    $id, $attributes["extra_classes"], $attributes["attributes"], $title, $allow_edit, ''.$default_value, $unit, $controller
  );

  return array(
    "html" => $html,
    "js" => sprintf('$("#%s").aweSlider(%s);', $id, json_encode($options))
  );
}

/**
 * Callback to generate text_field element on panel
 */
function _ac_render_text_field_element($element, $name, $panel_name) {
  $id = _ac_process_element_name($name, $panel_name);
  $title = isset($element["title"]) ? $element["title"] : "Text field";
  $default_value = isset($element["default_value"]) ? $element["default_value"] : "";
  $attributes = _ac_process_element_attributes($element);
  $placeholder = isset($element['placeholder']) ? sprintf(' placeholder="%s"', $element['placeholder']) : '';

  $html = sprintf('
		<div id="%s" class="aw-input%s"%s>
            <label for="text-%s">%s</label>
            <input type="text" id="text-%s" value=\'%s\'%s>
        </div>
		', $id, $attributes["extra_classes"], $attributes["attributes"], $id, $title, $id, $default_value, $placeholder);

  return array("html" => $html);
}

/**
 * Callback to generate text_field element on panel
 */
function _ac_render_textarea_field_element($element, $name, $panel_name) {
  $id = _ac_process_element_name($name, $panel_name);
  $title = isset($element["title"]) ? $element["title"] : "Textarea field";
  $default_value = isset($element["default_value"]) ? $element["default_value"] : "";
  $attributes = _ac_process_element_attributes($element);

  $html = sprintf('
		<div id="%s" %s>
      <div class="des-page">
          <textarea  id="textarea-%s" placeholder="%s">%s</textarea>
      </div>
    </div>
		', $id, $attributes["extra_classes"], $id, $title, $default_value, $id, $default_value);

  return array("html" => $html);
}

/**
 * Callback to generate element of padding, border ....
 */
function awecontent_border_unit($title) {
  $unit_class = sprintf('custom-border-%s', strtolower(trim($title)));
  return sprintf('
		<div class="panel-element md-box frame-ab type-num %s">
            <div class="drif-item">
                <span class="awe-title">%s</span>
                <div class="frame-display">
                	<input type="text" value="" class="border-unit-spectrum">
                    <span class="display-font" contenteditable="true">0</span>
                    <div class="unit">
                		<span class="font-unit">px</span>
                		<span class="type-border">none</span>
            		</div>
                </div>
                <input type="hidden" name="changing-color">
                <div class="add-abstract ">
                    <span class="change-tag abstract"><i class="ic ac-icon-minus"></i></span>
                    <span class="change-tag add"><i class="ic ac-icon-add"></i></span>
                </div>
            </div>
            <div class="drif-item-overlay"></div>
        </div>
	', $unit_class, $title);
}

/**
 * Callback to generate border element
 */
function _ac_render_box_border_element($element, $name, $panel_name) {
  $values = json_encode(range($element["min_value"], $element["max_value"]));
  $id = _ac_process_element_name($name, $panel_name);
  $attributes = _ac_process_element_attributes($element);

  // Render top element
  $html = awecontent_border_unit("Top");
  $html .= awecontent_border_unit("Right");
  $html .= awecontent_border_unit("Left");
  $html .= awecontent_border_unit("Bottom");
  $html = sprintf('
		<div id="%s" class="awe-border%s"%s>
			<div class="toggle-enable">
                <span>Enable custom border</span>
                <div class="togg-status">
                    <div class="butt-status"></div>
                    <input type="hidden" value="1" name="toggle_value">
                </div>
            </div>
			<div class="list-box">
				%s
				<div class="trigger-uniform enabled"><i class="ic ac-icon-link"></i></div>
				<input type="hidden" class="list-border-values" value="%s">
			</div>
		</div>
	', $id, $attributes["extra_classes"], $attributes["attributes"], $html, $values);

  $js = sprintf('$("#%s").aweBorderElementInit();', $id);

  return array("html" => $html, "js" => $js);
}

/**
 * Callback to generate padding element
 */
function _ac_render_box_model_element($element, $name, $panel_name) {
  $html = "";
  $js = "";
  $id = _ac_process_element_name($name, $panel_name);
  $title = $element["model_type"];
  $attributes = _ac_process_element_attributes($element);

  $element["default_value"] = 0;
  $element["unit"] = "px";

  // Render first unit
  $element["title"] = "Top";
  $unit_name = "{$name}_top";
  if ($element["model_type"] == "border_radius") {
    $element["title"] = "Top Left";
    $unit_name = "{$name}_top_left";
    $title = "border radius";
    $element["attributes"]["class"][] = "border-radius-tl";
  }
  else {
    $element["attributes"]["class"][] = "custom-{$element["model_type"]}-top";
  }

  $render = _ac_render_slider_element($element, $unit_name, $panel_name);
  $html .= $render["html"];
  $js .= $render["js"];

  // Render second unit
  $element["title"] = "Right";
  $unit_name = "{$name}_right";
  if ($element["model_type"] == "border_radius") {
    $element["title"] = "Top Right";
    $unit_name = "{$name}_top_right";
    $element["attributes"]["class"] = array("border-radius-tr");
  }
  else {
    $element["attributes"]["class"] = array("custom-{$element["model_type"]}-right");
  }

  $render = _ac_render_slider_element($element, $unit_name, $panel_name);
  $html .= $render["html"];
  $js .= $render["js"];

  // Render third unit
  $element["title"] = "Left";
  $unit_name = "{$name}_left";

  if ($element["model_type"] == "border_radius") {
    $element["title"] = "Bottom Left";
    $unit_name = "{$name}_bottom_left";
    $element["attributes"]["class"] = array("border-radius-bl");
  }
  else {
    $element["attributes"]["class"] = array("custom-{$element["model_type"]}-left");
  }
  $render = _ac_render_slider_element($element, $unit_name, $panel_name);
  $html .= $render["html"];
  $js .= $render["js"];


  // Render fourth unit
  $element["title"] = "Bottom";
  $unit_name = "{$name}_bottom";

  if ($element["model_type"] == "border_radius") {
    $element["title"] = "Bottom Right";
    $unit_name = "{$name}_bottom_right";
    $element["attributes"]["class"] = array("border-radius-br");
  }
  else {
    $element["attributes"]["class"] = array("custom-{$element["model_type"]}-bottom");
  }
  $render = _ac_render_slider_element($element, $unit_name, $panel_name);
  $html .= $render["html"];
  $js .= $render["js"];

  $html = sprintf('
		<div id="%s" class="awe-box-model awe-%s%s"%s>
			<div class="toggle-enable ">
                <span>Enable custom %s</span>
                <div class="togg-status">
                    <div class="butt-status"></div>
                    <input type="hidden" value="1" name="toggle_value">
                </div>
            </div>
			<div class="list-box">%s<div class="trigger-uniform enabled"><i class="ic ac-icon-link"></i></div></div>
		</div>
	', $id, str_replace("_", "-", $element["model_type"]), $attributes["extra_classes"], $attributes["attributes"], $title, $html);

  $js .= sprintf('$("#%s").aweBoxModelElementInit();', $id);

  return array("html" => $html, "js" => $js);
}

/**
 * Callback to generate padding element
 */
function _ac_render_custom_attributes_element($element, $name, $panel_name) {
  $id = _ac_process_element_name($name, $panel_name);
  $title = isset($element["title"]) ? $element["title"] : "Custom Attributes";
  $attributes = _ac_process_element_attributes($element);

  $html = sprintf('
		<div id="%s" class="aw-cus evr-change toggle-pull%s"%s>
	        <span>%s<i class="i-sign ic ac-icon-circle"></i></span>
	        <div class="togg-status">
	            <div class="butt-status"></div>
	            <input type="hidden" name="enabled_custom_attributes" value="1">
	        </div>
	        <i class="js-edit-attributes ic ac-icon-edit"></i>
	        <input type="hidden" name="attributes_data">
	    </div>
	', $id, $attributes["extra_classes"], $attributes["attributes"], $title);

  $js = sprintf('$("#%s").aweCustomAttributesElementInit();', $id);
  return array("html" => $html, "js" => $js);
}

/**
 * Callback to generate padding element
 */
function _ac_render_animations_element($element, $name, $panel_name) {
  $id = _ac_process_element_name($name, $panel_name);
  $title = isset($element["title"]) ? $element["title"] : "Animations";
  $attributes = _ac_process_element_attributes($element);
  $html = sprintf('
		<div id="%s" class="aw-cus evr-change toggle-pull%s"%s>
	        <span>%s<i class="i-sign ic ac-icon-circle"></i></span>
	        <div class="togg-status">
	            <div class="butt-status"></div>
	            <input type="hidden" name="enabled_custom_animation" value="1">
	        </div>
	        <i class="js-edit-animations ic ac-icon-edit"></i>
	    </div>
	', $id, $attributes["extra_classes"], $attributes["attributes"], $title);

  $js = sprintf('$("#%s").aweCustomAnimationElementInit();', $id);
  return array("html" => $html, "js" => $js);
}

/**
 * Callback to generate media element
 */
function _ac_render_media_element($element, $name, $panel_name) {
  $id = _ac_process_element_name($name, $panel_name);
  $title = isset($element["title"]) ? $element["title"] : "Media";
  $attributes = _ac_process_element_attributes($element);
  $html = sprintf('
		<div id="%s" class="awe-background-element aw-cus evr-change toggle-pull%s"%s>
            <span>%s</span>
            <div class="img-bg">
            	<input type="hidden" name="selected_media" value="">
            </div>
            <span class="delete-bg-img"><i class="ic ac-icon-trash"></i></span>
        </div>
	', $id, $attributes["extra_classes"], $attributes["attributes"], $title);

  $js = sprintf('$("#%s").aweMediaElementInit();', $id);

  return array("html" => $html, "js" => $js);
}

/**
 * Callback to generate media element
 */
function _ac_render_video_upload_element($element, $name, $panel_name) {
  $id = _ac_process_element_name($name, $panel_name);
  $title = isset($element["title"]) ? $element["title"] : "Media";
  $attributes = _ac_process_element_attributes($element);

  $html = sprintf('
		<div class="square">
       		<span>Upload</span>
       		<span class="tit-sq">mp4</span>
    	</div>
    	<div class="square">
       		<span>Upload</span>
       		<span class="tit-sq">ogg</span>
    	</div>
    	<div class="square">
       		<span>Upload</span>
       		<span class="tit-sq">webm</span>
    	</div>
	');

  return array("html" => $html);
}

/**
 * Callback to generate upload element
 */
function _ac_render_media_upload_element($element, $name, $panel_name) {
  $output = array("html" => "", "js" => "");
  $id = _ac_process_element_name($name, $panel_name);
  $attributes = _ac_process_element_attributes($element);
  $accept_types = (isset($element["accept_types"]) && is_array($element["accept_types"])) ? $element["accept_types"] : array();
  $tabs_enabled = (isset($element["tabs_enabled"]) && is_array($element["tabs_enabled"])) ? $element["tabs_enabled"] : array(
    "upload",
    "library",
    "my_files"
  );

  // Create tabs for library element
  $media_library = array(
    "type" => "tabs",
    "tabs" => array()
  );

  if (in_array("upload", $tabs_enabled)) {
    $html = sprintf('
			<div id="%s" class="library awe-upload%s"%s>
	            <div class="upload-photo">
	                <div class="center-img">
	                    <div class="txt">
	                        <i class="ic ac-icon-upload"></i>
	                        <h4><b>To Upload photos</b></h4>
	                        <span>Drag photos from computer <br>  or Just click here</span>
	                    </div>
	                </div>
	            </div>
	            <div class="awe-info-upload">

	            </div>
	            <div class="awe-default-upload">
	            	<form class="awe-media-upload-form" method="post" enctype="multipart/form-data" action="%s">
	            		<input type="file" name="awe_media_upload"><input type="submit" value="Upload">
	            	</form>
	            </div>
	        </div>
		', $id, $attributes["extra_classes"], $attributes["attributes"], $element["upload_url"]);

    $output["js"] = sprintf(
      '$("#%s").aweUploadElementInit(%s);',
      $id,
      json_encode(array(
        "url" => $element["upload_url"],
        "acceptTypes" => $accept_types
      ))
    );

    $media_library["tabs"][] = array(
      "tab_title" => "Upload",
      "contents" => array(
        "upload_form" => array(
          "type" => "markup",
          "markup" => $html
        )
      )
    );
  }

  $enabled_book_lib = FALSE;
  if (in_array("library", $tabs_enabled) && user_access('view media library')) {
    $enabled_book_lib = TRUE;

    $library_url = (isset($element['library_options']['url'])) ? $element['library_options']['url'] : '';
    $media_library["tabs"][] = array(
      "tab_title" => t("Library"),
      "contents" => array(
        "upload_form" => array(
          "type" => "markup",
          "markup" => sprintf(
            '<div class="js-library library" data-url="%s">
                <div class="awe-slide">
                    <div class="cover-slide scroll-bar">
                        <div class="books-item shell-act"></div>
                    </div>
                    <div class="borrow-slide"></div>
                </div>
            </div>
            <input class="js-select-lib-media" type="button" value="Choose">
            <div class="awe-media-message"></div>',
            $library_url
          )
        )
      )
    );
  }

  if (in_array("my_files", $tabs_enabled)) {
    $enabled_book_lib = TRUE;

    $my_file_url = (isset($element['my_file_options']['url'])) ? $element['my_file_options']['url'] : '';
    $media_library["tabs"][] = array(
      "tab_title" => t("My Files"),
      "contents" => array(
        "upload_form" => array(
          "type" => "markup",
          "markup" => sprintf(
            '<div class="js-my-files library" data-url="%s">
                <div class="awe-slide">
                    <div class="cover-slide scroll-bar">
                        <div class="books-item shell-act"></div>
                    </div>
                    <div class="borrow-slide"></div>
                </div>
            </div>
            <input class="js-select-lib-media" type="button" value="Choose">
            <div class="awe-media-message"></div>',
            $my_file_url
          )
        )
      )
    );
  }

  if ($enabled_book_lib) {
    $output["js"] .= sprintf('
			$("#%s").delegate(".book-lib", "click", function(event) {
				var multiUpload = $("#%s").data("multi-upload");
				if (multiUpload)
					$(this).toggleClass("borrowed");
				else {
					$(".book-lib", $(this).parent()).removeClass("borrowed");
					$(this).addClass("borrowed");
				}
				event.preventDefault();
			});
		', $id, $id);
  }

  _ac_render_panel_element($media_library, $name, $panel_name, $output);
  return $output;
}

/**
 * Callback to generate toggle element on panel
 */
function _ac_render_toggle_element($element, $name, $panel_name) {
  $id = _ac_process_element_name($name, $panel_name);
  $title = isset($element["title"]) ? $element["title"] : "Toggle";
  $attributes = _ac_process_element_attributes($element);

  $html = sprintf('
		<div id="%s" class="toggle-enable%s"%s>
	        <span>%s</span>
	        <div class="togg-status">
	            <div class="butt-status"></div>
	            <input type="hidden" name="toggle_value" value="1">
	        </div>
	    </div>
	', $id, $attributes["extra_classes"], $attributes["attributes"], $title);

  $js = sprintf('
		$("#%s").click(function(event) {
			$("> .togg-status",this).toggleClass("active");
			if ($("> .togg-status",this).hasClass("active"))
				$("input[name=toggle_value]", $(this)).val(1).trigger("change");
			else
				$("input[name=toggle_value]", $(this)).val(0).trigger("change");
		});
		$("input[name=toggle_value]", "#%s").change(function() {
			if (parseInt($(this).val()))
				$(this).parent().addClass("active");
			else
				$(this).parent().removeClass("active");
		});
	', $id, $id);

  return array("html" => $html, "js" => $js);
}

function _ac_render_box_icon_element($element, $name, $panel_name) {
  $output = array("html" => "", "js" => "");
  $output['html'] .= '<ul class="library-icon">';

  foreach ($element->box_icon as $key => $value) {
    $output['html'] .= sprintf('<li class="item-icon"><i class="%s"></i></li>', $value);
  }
  $output['html'] .= sprintf('</ul>');
  return $output['html'];
}

function _ac_render_tabs_icon_element($element, $name, $panel_name) {
  $id = _ac_process_element_name($name, $panel_name);
  $output = array("html" => "", "js" => "");

  if (isset($element["tabs"]) && is_array($tabs = $element["tabs"])) {
    $tabs_render = array("html" => "", "controllers" => "", "js" => "");
    $output["html"] .= sprintf(
      '<div id = "%s" class="tab-icon" >%s',
      $name, $element['title']
    );
    foreach ($tabs as $tab_id => $tab) {
      // Convert tab to array
      if (is_object($tab)) {
        $tab = get_object_vars($tab);
      }

      // Generate controller for tab
      $tabs_render["controllers"] .= sprintf('<li class="evr-change"><a href="#%s-tab-%d">%s</a></li>', $name, $tab_id, $tab["tab_title"]);

      // Generate content for tab
      $render_tab = array("html" => "", "js" => "");
      $tab_contents = $tab["contents"];
      if (is_object($tab_contents)) {
        $tab_contents = get_object_vars($tab_contents);
      }
      foreach ($tab_contents as $key => $value) {
        $render_tab['html'] .= _ac_render_box_icon_element($value, $key, $panel_name);
      }

      $tabs_render["html"] .= sprintf('<div id="%s-tab-%d" class="md-tab-item"><div class="scroll-bar">%s</div></div>', $name, $tab_id, $render_tab["html"]);
      $tabs_render["js"] .= $render_tab["js"];
    }

    // Generate tab element
    $output["html"] .= sprintf(
      '<div id="%s" class="md-tab">
          <div class="select-tab"><ul>%s</ul></div>
          <div class="md-content-tab">%s</div>
      </div>'
      , $id, $tabs_render["controllers"], $tabs_render["html"]
    );
    $output['html'] .= '</div>';
    $output["js"] .= $tabs_render["js"];
    $output["js"] .= sprintf('$("#%s").tabs();', $id);
    $output['js'] .= sprintf(
      "$('.title-tab > i', '#%s').click( function() {
          $(this).parent().next().children('.select-tab').toggle();
      });
      $('.select-tab li', '#%s').click( function() {
          $(this).closest('.select-tab').hide().trigger('change');
      });
      $('.md-content-tab li', '#%s').click ( function() {
          $(this).closest('.tab-icon').find('.title-tab').children('i').attr('data-icon', $('i', this).attr('class'));
          $('.title-tab', '#%s' ).trigger('change');
      });",
      $name, $name, $name, $name
    );
  }
  return $output;
}

function _ac_render_grid_image_element($element, $name, $panel_name) {
  $output = array("html" => "", "js" => "");
  $output['html'] = '<div class="library">
                            <div class="awe-slide">
                                <div class="cover-slide scroll-bar">
                                    <div class="books-item shell-act">
                                        <div class="book-lib">
                                            <i class="ic ac-icon-done"></i>
                                            <img src="img/04-03.jpg" alt="book">
                                        </div>
                                        <div class="book-lib">
                                            <i class="ic ac-icon-done"></i>
                                            <img src="img/04-03.jpg" alt="book">
                                        </div>
                                        <div class="book-lib">
                                            <i class="ic ac-icon-done"></i>
                                            <img src="img/04-03.jpg" alt="book">
                                        </div>
                                    </div>
                                </div>
                            </div>
                    </div>';
  return $output;
}

function _ac_render_button_element($element, $name, $panel_name) {
  $title = $element['title'];
  $id = _ac_process_element_name($name, $panel_name);
  $output = array("html" => "", "js" => "");
  $output['html'] = sprintf('<div id="%s" class="thumb-image"><div class="image-content"><img src="img/no-image.PNG" alt=""/></div><div class="control-image"><button class="select-image">%s</button></div><input type="hidden" name="selected_media" value=""></div>', $id, $title);
  $output['js'] = sprintf('$("#%s").aweButtonElementInit();', $id);
  return $output;
}

function _ac_render_gallery_element($element, $name, $panel_name) {
  $id = _ac_process_element_name($name, $panel_name);
  $title = $element['title'];
  $output = array(
    'html' => '',
    'js' => ''
  );
  $output['html'] = sprintf('<div id="%s" class="thumb-gallery list-thumb"><div class="library clearfix "></div><div class="control-gallery"><button class="select-image js-gallery-sellect">%s <input type="hidden" name="selected_media"/></button></div></div>', $id, $title);
  $output['js'] = sprintf('$("#%s").aweGalleryElementInit();', $id);
  return $output;
}

/**
 * Callback to generate list image style element
 */
function _ac_render_image_style_list_element($element, $name, $panel_name) {
  // get list image styles
  $styles = array_merge(array('none' => t('None')), image_style_options(FALSE));

  $element['type'] = 'select';
  $element['options'] = $styles;
  $element['default_value'] = 'none';

  return _ac_render_select_element($element, $name, $panel_name);
}
