<div <?php if($id) print 'id="'.$id.'"'; ?> class="<?php print $classes; ?>" <?php print $attributes; ?>>
  <ul class="list-gallery clearfix">
    <?php foreach ($images as $key => $image) : ?>
      <?php
        $fid = $image['fid'];
        $file = file_load($fid);
        $srcUrl = file_create_url($file->uri);
        $srcThumb = $styleThumb == 'none' ? $srcUrl : image_style_url($styleThumb, $file->uri);
        $srcImage = $styleImage == 'none' ? $srcUrl : image_style_url($styleImage, $file->uri);
        $srcThumbPopup = image_style_url('ac_slide_thumb_default', $file->uri);
        $linkImage = $image['linkImage'];
        $captionImage = $image['captionImage'] ;
        $target = $image['targetImage']  ? '_blank' : '_self';
        $positionOver = $image ['captionPosition'] == 'over' ? 'position-over' : '';
        if ($image['enableLightBox']  ) {
            $enableLightBox = 'open-lightbox';
            $href = $srcImage;
        }
        else {
            $enableLightBox = '';
            $href = $linkImage;
        }

      ?>
      <li class="md-item-image <?php print $positionOver; ?>" data-thumb ='<?php ?>'>
        <?php if ($enableLightBox || $href):?>
          <a class="mgf-md-popup <?php print $enableLightBox; ?>" href="<?php print $href; ?>" target="<?php print $target ?>">
        <?php endif; ?>
        <div class="awe-image-content clearfix">
          <?php if ($settings['captionPosition'] == 'over'): ?>
          <div class="awe-image-overlay" style="background-color: <?php print $settings['imageBgOverlay']; ?>;"></div>
          <?php endif; ?>
          <?php if($image['captionPosition'] == 'top' && $settings['enableCaption']): ?>
            <div class="awe-image-caption"><?php print $captionImage ?></div>
          <?php endif; ?>
          <div class="awe-image-container">
              <img src="<?php print $srcThumb; ?>" alt="" />
          </div>
          <?php if($image ['captionPosition'] != 'top' && $settings['enableCaption']): ?>
            <div class="awe-image-caption"><span><?php print $captionImage ?></span></div>
          <?php endif; ?>
        </div>
        <?php if ($enableLightBox || $href):?>
          </a>
        <?php endif; ?>
      </li>
    <?php endforeach; ?>
  </ul>
</div>
