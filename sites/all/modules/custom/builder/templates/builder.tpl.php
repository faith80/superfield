<!-- Builder wrapper -->
<div class="builder-wrapper buider-wrapper-<?php print $builder->bid; ?>">
  <?php if (!empty($rows)): ?>
    <?php
    $i_row = 1;
    foreach ($rows as $row):
      ?>
      <?php $row_id = builder_extract_id_key($row['row_key']); ?>
      <!-- row -->
      <div<?php print builder_row_attributes($row_id, $row, $i_row); ?>>
        <?php
        $row_inner_class = !empty($row['settings']['css']['css_inner_type']) ? ' builder-grid-' . $row['settings']['css']['css_inner_type'] : ' builder-grid-full';
        ?>
        <div class="builder-row-inner<?php print $row_inner_class; ?>">
          <?php if (!empty($row['title'])): ?>
            <div class="builder-row-title">
              <h2><?php print filter_xss_admin($row['title']); ?></h2>
            </div>
          <?php endif; ?>
          <?php
          $columns = array();
          if (!empty($builder->rows[builder_get_row_key($row_id)]['columns'])) {
            foreach ($builder->rows[builder_get_row_key($row_id)]['columns'] as $column_key => $column) {
              $column['column_key'] = $column_key;
              $column['bid'] = $builder->bid;
              $columns[] = $column;
            }
            uasort($columns, 'drupal_sort_weight');
          }
          ?>
          <?php if (!empty($columns)) : ?>
            <div class="builder-columns-wrapper builder-grid-row">
              <?php
              $i_column = 1;
              foreach ($columns as $column):
                ?>
                <?php $column_id = builder_extract_id_key($column['column_key']); ?>
                <?php
                $render_contents = array();
                $contents = array();
                if (!empty($column['contents'])) {
                  foreach ($column['contents'] as $content_key => $content) {
                    $content['content_key'] = $content_key;
                    $contents[] = $content;
                  }
                  uasort($contents, 'drupal_sort_weight');
                }
                if (!empty($contents)) {
                  foreach ($contents as $content) {
                    $visiblity = builder_content_check_visiblity_rules($content);
                    if ($visiblity) {
                      $build_content = builder_content_build($content);
                      if (!empty($build_content)) {
                        $render_contents[] = $build_content;
                      }
                    }
                  }
                }
                ?>

                <?php
                if (isset($column['settings']['extra']['hide_on_empty']) && $column['settings']['extra']['hide_on_empty'] && empty($render_contents)) {
                  continue; // If check hide column on empty. Let skip this column.
                }
                ?>
                <!-- Column -->
                <div<?php print builder_column_attributes($column_id, $column, $i_column) ?>>
                  <?php if (!empty($column['settings']['title'])): ?>
                    <div class="builder-column-title">
                      <h3><?php print filter_xss_admin($column['settings']['title']); ?></h3>
                    </div>
                  <?php endif; ?>

                  <?php if (!empty($render_contents)): ?>
                    <?php foreach ($render_contents as $render_content): ?>
                      <!-- Content -->
                      <div class="builder-content-wrapper">
                        <div class="builder-content-inner">
                          <?php print render($render_content); ?>
                        </div>
                      </div>
                      <!-- // Content -->
                    <?php endforeach; ?>

                  <?php endif; ?>
                </div>
                <!-- // Column -->
                <?php
                $i_column++;
              endforeach;
              ?>

            </div>
          <?php endif; ?>
        </div>
        <! -- // row inner -->
      </div>
      <!-- // Row -->
      <?php
      $i_row++;
    endforeach;
    ?>
  <?php endif; ?>
</div>
<!-- // builder wrapper -->