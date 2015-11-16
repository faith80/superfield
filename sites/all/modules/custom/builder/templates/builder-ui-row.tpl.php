<?php
$row_id = builder_extract_id_key($row_id);

$columns = array();
if (!empty($builder->rows[builder_get_row_key($row_id)]['columns'])) {
  foreach ($builder->rows[builder_get_row_key($row_id)]['columns'] as $column_key => $column) {
    $column['column_key'] = $column_key;
    $columns[] = $column;
  }
  uasort($columns, 'drupal_sort_weight');
}
?>
<div class="builder-ui-display-row-wrapper">
  <!--  Row actions -->
  <div class="builder-ui-action-links builder-row-actions">
    <?php if (!empty($row_actions)): ?>
      <ul class="links inline">
        <?php foreach ($row_actions as $link): ?>
          <li><?php print $link; ?></li>
        <?php endforeach; ?>
      </ul>
    <?php endif; ?>
  </div>
  <!-- // Row actions -->
  <?php if (!empty($columns)): ?>
    <div data-bid="<?php print $builder->cache_id; ?>"
         data-rid="<?php print $row_id; ?>"
         class="builder-ui-column-items-wrapper builder-ui-row">
      <?php
      $row = $builder->rows[builder_get_row_key($row_id)];
      foreach ($columns as $column):
        $column_key = $column['column_key'];
        $column_id = builder_extract_id_key($column_key);
        ?>
        <div data-cid="<?php print $column_id; ?>"
             class="builder-ui-column <?php print builder_column_css($column); ?> builder-ui-column-item-<?php print $column_id; ?>">
          <div class="builder-ui-column-inner">
            <div class="builder-ui-column-inside">
              <!-- column links action -->
              <?php if (isset($column_actions[$row_id][$column_id])): ?>
                <div class="builder-ui-action-links column-actions-links">
                  <?php print $column_actions[$row_id][$column_id]; ?>
                </div>
              <?php endif; ?>

              <!-- Column title -->
              <div class="builder-ui-column-title-wrapper builder-draggable">
                <?php if (!empty($column['settings']['title'])): ?>
                  <h2
                    class="builder-ui-column-title"><?php print filter_xss_admin($column['settings']['title']); ?></h2>
                <?php else: ?>
                  <h2
                    class="builder-ui-column-no-title"><?php print t('No title'); ?></h2>
                <?php endif; ?>
              </div>
              <!-- // column title -->


              <!-- // Column links actions -->

              <!--- contents wrapper-->
              <div data-bid="<?php print $builder->cache_id; ?>"
                   data-rid="<?php print $row_id; ?>"
                   data-cid="<?php print $column_id; ?>"
                   class="builder-ui-contents-wrapper">

                <?php
                $sorted_contents = array();
                if (!empty($column['contents'])) {
                  foreach ($column['contents'] as $content_key => $content) {
                    $content['content_key'] = $content_key;
                    $sorted_contents[] = $content;
                  }
                  uasort($sorted_contents, 'drupal_sort_weight');
                }
                ?>
                <?php if (!empty($sorted_contents)): ?>

                  <!-- content -->
                  <?php foreach ($sorted_contents as $content): ?>
                    <?php
                    $content_id = builder_extract_id_key($content['content_key']);
                    ?>
                    <div data-contentid="<?php print $content_id; ?>"
                         class="builder-ui-content-wrapper">
                      <div class="builder-ui-content-inner">
                        <!-- content title -->
                        <div
                          class="builder-ui-content-title-wrapper builder-draggable">
                          <div
                            class="builder-ui-action-links builder-ui-content-title-buttons">
                            <?php print $content_actions[$row_id][$column_id][$content_id] ?>
                          </div>
                          <span
                            class="builder-ui-content-title-text"><?php print !empty($content['title']) ? filter_xss_admin($content['title']) : filter_xss_admin($content['info']); ?></span>
                        </div>
                        <!-- // content title -->


                        <!-- render content -->
                        <div class="builder-ui-content-render-wrapper">
                          <div class="builder-ui-content-render-inner">
                            <?php
                            if ($content['delta'] == 'node') {
                              $build_content['#markup'] = '<p>' . t('Embed node:') . '</p>';
                            }
                            else {
                              $build_content = builder_content_build($content);
                            }

                            if (isset($build_content)) {
                              $collapsible_content = drupal_render($build_content);
                              print theme('ctools_collapsible', array(
                                'collapsed' => TRUE,
                                'handle' => filter_xss_admin($content['info']),
                                'content' => $collapsible_content
                              ));
                            }
                            ?>
                          </div>
                        </div>
                        <!-- // render content -->

                      </div>
                    </div>
                  <?php endforeach; ?>
                  <!-- // content -->

                <?php endif; ?>
              </div>
              <!-- // contents wrapper -->
            </div>
          </div>
        </div>
      <?php endforeach; ?>
    </div>
  <?php endif; ?>
</div>