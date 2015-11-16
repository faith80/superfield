<div <?php if($id) print 'id="'.$id.'"'; ?> class="<?php print $classes; ?>" <?php print $attributes; ?>>
  <ul class="awe-flickr-list">
    <?php if($images !== NULL): ?>
    <?php for($i = 0; $i < $settings['numberPhoto']; $i++): ?>
      <?php
        $link = $images[$i]['link'];
        $title =  $images[$i]['title'];
        $thumb = $images[$i]['thumb'];
        $start = strpos($thumb, ' src="') + 6;
        $offset = strpos($thumb, '_m.jpg"') - $start;
        $thumb = substr($thumb, $start, $offset);
        $class = $settings['flickrPreview'];
        $largeImage = $thumb.'_c.jpg';
        $href = $class == 'openlightbox' ? $largeImage : $link;
        $src = $thumb.'_q.jpg';
      ?>
      <li class="awe-item-flickr">
        <a href="<?php print $href; ?>" data-group="flick-set" title="<?php print $title; ?>" class="<?php print $class; ?>" target="_blank">
          <img src="<?php print $src; ?>" alt="image-flickr"/>
        </a>
      </li>
    <?php endfor; ?>
    <?php endif; ?>
  </ul>
</div>