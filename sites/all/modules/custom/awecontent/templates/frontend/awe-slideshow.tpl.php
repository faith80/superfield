<div <?php if($id) print 'id="'.$id.'"'; ?> class="<?php print $classes; ?>" <?php print $attributes; ?>>
  <div class="owl-carousel image-slide-show ">
    <?php foreach ($images as $key => $image) :?>
      <?php
        $fid = $image['fid'];
        $file = file_load($fid);
        $srcUrl = file_create_url($file->uri);
        $srcImage = $styleImage == 'none' ? $srcUrl : image_style_url($styleImage, $file->uri);
        $srcThumb = $styleThumb == 'none' ? $srcUrl : image_style_url($styleThumb, $file->uri);
        $caption = $image['captionImage'];
        $target = $image['targetImage']  ? '_blank' : '_self';
        $href = $image['linkImage'] ;
        $over = $image['captionPosition'] ? 'position-over' : '';
      ?>

      <?php if($image['captionPosition'] == 'top'): ?>
        <div class="md-item-image" data-thumb="<?php print $srcThumb;?>">
          <?php if ($image['linkImage'] != ''): ?>
            <a class="mgf-md-popup" href="<?php print $href;?>" target="<?php print $target; ?>">
          <?php endif; ?>
            <div class="awe-image-content clearfix">
              <?php if ($settings['captionPosition'] == 'over'): ?>
                <div class="awe-image-overlay" style="background-color: <?php print $settings['imageBgOverlay']; ?>;"></div>
              <?php endif; ?>
              <?php if($settings['caption']): ?>
                <div class="awe-image-caption">
                  <span><?php print $caption; ?></span>
                  </div>
              <?php endif; ?>
              <div class="awe-image-container">
                <img src="<?php print $srcImage ?>" alt="" data-thumb="<?php print $srcThumb?>"/>
              </div>
            </div>
          <?php if ($image['linkImage'] != ''): ?>
            </a>
          <?php endif; ?>
        </div>
      <?php else: ?>
        <div class="md-item-image <?php print $over; ?>" data-thumb="<?php print $srcThumb;?>">
          <?php if ($image['linkImage'] != ''): ?>
            <a class="mgf-md-popup" href="<?php print $href;?>" target="<?php print $target; ?>">
          <?php endif; ?>
          <div class="awe-image-content clearfix">
            <?php if ($settings['captionPosition'] == 'over'): ?>
              <div class="awe-image-overlay" style="background-color: <?php print $settings['imageBgOverlay']; ?>;"></div>
            <?php endif; ?>
            <div class="awe-image-container">
              <?php if ($image['linkImage'] == ''): ?>
                <img src="<?php print $srcImage ?>" alt="" data-thumb="<?php print $srcThumb?>"/>
              <?php else: ?>
                <a class="mgf-md-popup" href="<?php print $href;?>" target="<?php print $target; ?>">
                  <img src="<?php print $srcImage ?>" alt="" data-thumb="<?php print $srcThumb?>"/>

              <?php endif; ?>
            </div>
            <?php if($settings['caption']): ?>
              <div class="awe-image-caption">
                <span><?php print $caption; ?></span>
                </div>
            <?php endif; ?>
          </div>
          <?php if ($image['linkImage'] != ''): ?>
            </a>
          <?php endif; ?>
        </div>
      <?php endif; ?>
    <?php endforeach; ?>
  </div>
</div>
