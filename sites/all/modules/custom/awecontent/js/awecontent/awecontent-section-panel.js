!function(e){AWEContent.Views.SectionPanel=AWEContent.Views.DefaultPanel.extend({className:"awe-obj-panel section-panel",panelName:"section",initPanel:function(){AWEContent.Views.DefaultPanel.prototype.initPanel.call(this);var t=this;e("#text-section-custom-id",this.el).change(function(){t.editingModel.get("settings").set("customID",e(this).val())}),e("#text-section-custom-classes",this.el).change(function(){t.editingModel.get("settings").set("customClass",e(this).val())}),e("#section-custom-attributes input[name=enabled_custom_attributes]",this.el).change(function(i,l){l||t.editingModel.get("settings").set("customEnableAttributes",parseInt(e(this).val()))}),e("#section-custom-attributes input[name=attributes_data]",this.el).change(function(i,l){t.editingModel.get("settings").set("customDataAttributes",e(this).val(),l)}),e("#section-full-section input[name=toggle_value]",this.el).change(function(i,l){l||t.editingModel.get("settings").set("enabledFullScreen",parseInt(e(this).val()))}),e("#section-fluid-section input[name=toggle_value]",this.el).change(function(i,l){l||t.editingModel.get("settings").set("enabledFluid",parseInt(e(this).val()))}),e("#section-equal-row input[name=toggle_value]",this.el).change(function(i,l){l||t.editingModel.get("settings").set("equalRowHeight",parseInt(e(this).val()))}),e("#section-row-spacing",this.el).change(function(i,l){-1==l.value&&e(".frame-display .display-font",e(this)).text("DF"),t.editingModel.get("settings").set("rowSpacing",l.value)}),e("#section-background-color",this.el).change(function(e,i){i=i?i.toRgbString():"",t.editingModel.get("settings").set("bgColor",i)}),e("#section-background-image input",this.el).change(function(i,l){var o=e(this).val().trim(),n=o?JSON.parse(o):!1,a=n&&void 0!==n.file_url?n.file_url:"",s=n&&void 0!==n.fid?n.fid:-1;0>s?(e(this).parent().next().hide(),e(this).closest(".toggle-pull").nextAll().hide()):e("#section-background-mode",t.el).show().trigger("change",{value:t.editingModel.get("settings").get("bgMode")}),l||(t.editingModel.bgImageURL=a,t.editingModel.get("settings").set("bgFid",s))}),e("#section-background-mode",t.el).change(function(i,l){var o=l.value;e(this).closest(".toggle-drop");"fullcover"==o?e("#section-parallax-scrolling, #section-background-position",t.$el).hide():"parallax"==o?(e("#section-background-position",t.$el).hide(),e("#section-parallax-scrolling",t.$el).show()):(e("#section-background-position",t.$el).show(),e("#section-parallax-scrolling",t.$el).hide()),t.editingModel.get("settings").set("bgMode",o)}),e("#section-background-position",t.el).change(function(e,i){t.editingModel.get("settings").set("bgPosition",i.value)}),e("#section-parallax-scrolling input",t.el).change(function(i,l){l||t.editingModel.get("settings").set("enableScrolling",parseInt(e(this).val()))}),e("#section-background-image",t.el).append('<div class="wanted-image" style="display: none">Video background does not play on mobile, background image will be used as fallback</div>'),e("#section-enable-video-background input[name=toggle_value]",this.el).change(function(i,l){var o=parseInt(e(this).val()),n=e("#section-background-image input",t.el),a=e("#section-enable-video-background",t.el);n.trigger("change",{isPanel:!0}),o?a.nextAll().show():a.nextAll().hide(),l||(o?(e(".wanted-image",t.el).show(),setTimeout(function(){e(".wanted-image",t.el).hide()},5e3)):e(".wanted-image",t.el).hide(),o&&e("wanted-image").show(),t.editingModel.get("settings").set("enableBackgroundVideo",o))}),e("#section-video-url > input",this.el).change(function(){t.editingModel.get("settings").set("bgVideoUrl",e(this).val())}),e("#section-auto-play-video input[name=toggle_value]",this.el).change(function(i,l){l||t.editingModel.get("settings").set("enableAutoPlayVideo",parseInt(e(this).val()))}),e("#section-show-video-controllers input[name=toggle_value]",this.el).change(function(i,l){l||t.editingModel.get("settings").set("enableShowButton",parseInt(e(this).val()))}),e("#section-mute-video input[name=toggle_value]",this.el).change(function(i,l){l||t.editingModel.get("settings").set("enableMute",parseInt(e(this).val()))}),e("#section-background-enable-overlay input[name=toggle_value]",this.el).change(function(i,l){var o=parseInt(e(this).val());o?e("#section-overlay-color",t.el).show():e("#section-overlay-color",t.el).hide(),l||t.editingModel.get("settings").set("enabledBgOverlay",o)}),e("#section-overlay-color",this.el).change(function(e,i){i=i?i.toRgbString():"",t.editingModel.get("settings").set("bgOverlayColor",i)}),e("#section-box-model-settings",this.el).initBoxModelPanel(this,"boxModelSettings")},setPanelElementsValue:function(){var t=this,i=this.editingModel.get("settings").toJSON(),l=i.bgFid?{fid:i.bgFid}:{fid:-1};e("#text-section-custom-id",this.el).val(i.customID),e("#text-section-custom-classes",this.el).val(i.customClass),e("#section-custom-attributes input[name=enabled_custom_attributes]",this.el).val(i.customEnableAttributes).trigger("change",!0),e("#section-custom-attributes input[name=attributes_data]",this.el).val(i.customEnableAttributes),e("#section-full-section input[name=toggle_value]",this.el).val(i.enabledFullScreen).trigger("change",!0),AWEContent.alwaysFluid?e("#section-fluid-section",this.el).hide():e("#section-fluid-section",this.el).show(),e("#section-fluid-section input[name=toggle_value]",this.el).val(i.enabledFluid).trigger("change",!0),e("#section-equal-row input[name=toggle_value]",this.el).val(i.equalRowHeight).trigger("change",!0),e("#section-row-spacing",t.el).aweSlider("value",i.rowSpacing),e("#section-background-color",this.el).aweColorPicker("value",i.bgColor),e("#section-background-image .img-bg",this.el).css("background-image","url("+encodeURI(this.editingModel.bgImageURL)+")"),e("#section-background-image input",this.el).val(JSON.stringify(l)).trigger("change",!0),e("#section-background-mode",this.el).aweSelect("value",i.bgMode),e("#section-background-position",this.el).aweSelect("value",i.bgPosition),e("#section-parallax-scrolling input",this.el).val(i.enableScrolling).trigger("change",!0),e("#text-section-video-url",this.el).val(i.bgVideoUrl),e("#section-enable-video-background input[name=toggle_value]",this.el).val(i.enableBackgroundVideo).trigger("change",!0),e("#section-auto-play-video input[name=toggle_value]",this.el).val(i.enableAutoPlayVideo).trigger("change",!0),e("#section-show-video-controllers input[name=toggle_value]",this.el).val(i.enableShowButton).trigger("change",!0),e("#section-mute-video input[name=toggle_value]",this.el).val(i.enableMute).trigger("change",!0),e("#section-background-enable-overlay input[name=toggle_value]",this.el).val(i.enabledBgOverlay).trigger("change",!0),e("#section-overlay-color",this.el).aweColorPicker("value",i.bgOverlayColor),e("#section-box-model-settings",this.el).initBoxModel(i.boxModelSettings)},buildPanel:function(){return{title:{type:"markup",markup:'<div class="awe-title"><h2>Custom section</h2></div>'},custom_definitions:{type:"section",custom_id:{type:"text_field",title:"ID",attributes:{placeholder:"Custom ID"},default_value:""},custom_classes:{type:"text_field",title:"Classes",attributes:{placeholder:"Custom classes"},default_value:""},custom_attributes:{type:"custom_attributes"},full_section:{type:"toggle",title:"Fullscreen section",default_value:0},fluid_section:{type:"toggle",title:"Fluid section",default_value:0},equal_row:{type:"toggle",title:"Equal row height",default_value:0},row_spacing:{type:"slider",title:"Row Spacing",min_value:-1,max_value:100,default_value:0,allow_type:!0,unit:"px"}},custom_appearances:{type:"section",background_color:{type:"colorpicker",title:"Background color",options:{preferredFormat:"rgb",AlphaVerticle:!0,showAlpha:!0,allowEmpty:!0,showInput:!0}},background_image:{type:"media",title:"Background image"},background_mode:{type:"select",title:"Mode",options:{repeat:"Repeat All","repeat-x":"Repeat Horizontally","repeat-y":"Repeat Vertically","no-repeat":"No Repeat",fullcover:"FullCover",parallax:"Parallax"},default_value:"repeat"},background_position:{type:"select",title:"Position",options:{"left top":"Left Top","left center":"Left Center","left bottom":"Left Bottom","right top":"Right Top","right center":"Right Center","right bottom":"Right Bottom","center top":"Center Top","center center":"Center center","center bottom":"Center Bottom",initial:"Initial",inherit:"Inherit"},default_value:"left top"},parallax_scrolling:{type:"toggle",title:"Parallax scrolling",default_value:0}},background_video:{type:"section",enable_video_background:{type:"toggle",title:"Background video",default_value:0},video_url:{type:"text_field",title:"URL"},video_upload:{type:"video_uploader"},auto_play_video:{type:"toggle",title:"Auto play video",default_value:0},show_video_controllers:{type:"toggle",title:"Show play/pause button",default_value:0},mute_video:{type:"toggle",title:"Mute video",default_value:0}},background_overlay:{type:"section",background_enable_overlay:{type:"toggle",title:"Enable background overlay",default_value:0},overlay_color:{type:"colorpicker",title:"Overlay color",options:{preferredFormat:"rgb",AlphaVerticle:!0,showAlpha:!0,allowEmpty:!0,showInput:!0}}},custom_box_model:{type:"section",box_model_settings:{type:"tabs",tabs:[{tab_title:"Border",contents:{custom_border:{type:"box_border",min_value:0,max_value:100,default_value:0}}},{tab_title:"Padding",contents:{custom_padding:{type:"box_model",model_type:"padding",allow_type:!0,min_value:0,max_value:100,default_value:0}}},{tab_title:"Margin",contents:{custom_margin:{type:"box_model",model_type:"margin",allow_type:!0,min_value:0,max_value:100,default_value:0}}}]}}}}})}(jQuery);