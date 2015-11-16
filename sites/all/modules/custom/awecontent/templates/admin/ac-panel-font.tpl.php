<div class="md-tab tab-font">
  <div class="select-tab">
    <ul>
      <li><a href="#tab-all-font"><?php print t('All');?></a></li>
      <li><a href="#tab-recent-font"><?php print t('Recent');?></a></li>
    </ul>
  </div>
  <div class="md-content-tab">
    <div class="md-tab-item" id="tab-all-font">
      <div class="scroll-bar">
        <div class="md-section">
          <ul class="">
            <li>
              <ul class="default-font fonts-list">
                <li data-value="" class="js-font-select default"><span class="font-name">Default</span></li>
              </ul>
            </li>
            <?php if ($google_font):?>
              <li class="list-google-font">
                <span class="title-font-group"><?php print t('GOOGLE FONT');?></span>
                <ul class="list-google-font fonts-list"></ul>
                <input type="hidden" class="js-link" value="<?php print $google_font; ?>"/>
              </li>
            <?php endif;?>
            <li class="list-system-font">
              <span class="title-font-group"><?php print t('SYSTEM FONT');?></span>
              <ul class="fonts-list"">
                <li data-value="Georgia" class="js-font-select FontGeorgia"><span class="font-name">Georgia</span></li>
                <li data-value="Palatino Linotype" class="js-font-select FontPalatinoLinotype"><span class="font-name">Palatino Linotype</span></li>
                <li data-value="Time New Roman" class="js-font-select FontTimeNewRoman"><span class="font-name">Time New Roman</span></li>
                <li data-value="Arial" class="js-font-select FontArial"><span class="font-name">Arial</span></li>
                <li data-value="Lucia Sans Unicode" class="js-font-select FontLuciaSansUnicode"><span class="font-name">Lucia Sans Unicode</span></li>
                <li data-value="Tahoma" class="js-font-select FontTahoma"><span class="font-name">Tahoma</span></li>
                <li data-value="Verdana" class="js-font-select FontVerdana"><span class="font-name">Verdana</span></li>
                <li data-value="Trebuchet-MS" class="js-font-select FontTrebuchetMS"><span class="font-name">Trebuchet MS</span></li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="md-tab-item" id="tab-recent-font">
      <div class="scroll-bar">
        <div class="md-section">
          <ul class="fonts-list"></ul>
        </div>
      </div>
    </div>
  </div>
</div>