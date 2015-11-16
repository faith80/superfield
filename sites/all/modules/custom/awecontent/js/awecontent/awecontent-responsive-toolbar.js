!function(e){"use strict";AWEContent.Views.ResponsiveToolbar=AWEContent.Views.Toolbar.extend({id:"responsive-settings",template:_.template('<div class="obj-adjust scroll-bar">                <div class="awe-title"><h2>Responsive settings</h2></div>                <div class="md-section">                    <div class="toggle-enable preview-mode">                        <span>Preview mode</span>                        <div class="togg-status">                            <div class="butt-status"></div>                            <input type="hidden" value="0" name="toggle_value">                        </div>                    </div>                </div>                <div class="md-section">                    <div id="responsive-display" class="md-tab table-size">                        <div class="select-tab">                            <ul class="responsive-devices">                                <li class="awe-responsive-lg"><a title="Desktop - Large display"><i class="ic ac-icon-laptop"></i></a></li>                                <li class="awe-responsive-md"><a title="Tablet"><i class="ic ac-icon-tablet"></i></a></li>                                <li class="awe-responsive-sm"><a title="Tablet horizontal"><i class="ic ac-icon-tablet-hoz"></i></a></li>                                <li class="awe-responsive-xs"><a title="Phone"><i class="ic ac-icon-phone"></i></a></li>                            </ul>                        </div>                        <ul class="md-content-tab root-parent"></ul>                    </div>                </div>            </div>'),templateComponent:_.template('<li class="item-component parent-component toggle-display">                <div class="type-<%= type %> type-component ">                    <div class="options-expand">                        <span class="name-type">                            <span class="name-<%= type %>"> <%= type %> </span>                            <span class="num-<%= type %>"></span>                        </span>                        <span class="expand-childs">                            <i class="ic ac-icon-arrow-right"></i>                        </span>                    </div>                    <% if (hasControls) { %>                        <div class="options-controls">                            <% if (hasReset) { %>                            <span class="reset-default">                                <i class="ic ac-icon-refresh"></i>                            </span>                            <% } %>                            <span class="show-hide">                                <i class="ic ac-icon-eye"></i>                                <input type="hidden" class="is-eye" value="1" data-default="1">                            </span>                        </div>                    <% } %>                </div>                <% if (hasChildren) {%>                    <ul class="parent-component hide"></ul>                <% } %>         </li>'),events:{"click .options-expand":"showComponent","click .show-hide":"showElement","change input.is-eye":"setResponsiveElement","click .reset-default":"resetDefault","mouseenter .options-expand":"connectToView","mouseleave .options-expand":"connectToView"},renderController:function(){return'<a href="#responsive-settings"><i class="ic ac-icon-responsive"></i>Responsive</a>'},render:function(){var s=this;this.$el.append(this.template()),this.classScreen="col-lg",this.screen="lgResponsive";var t=setInterval(function(){void 0!=AWEContent.contentIframe&&(clearInterval(t),s.$pageWrapper=AWEContent.$pageWrapper,s.screenDefault())},50),n=e(".preview-mode",s.el);n.click(function(){e("> .togg-status",this).toggleClass("active"),e("> .togg-status",this).hasClass("active")?e("input[name=toggle_value]",e(this)).val(1).trigger("change"):e("input[name=toggle_value]",e(this)).val(0).trigger("change")}),e("input[name=toggle_value]",n).change(function(){parseInt(e(this).val())?(e(this).parent().addClass("active"),e(".root-parent",s.el).hide(),void 0!=AWEContent.jqIframe&&AWEContent.jqIframe("body").addClass("awe-preview")):(e(this).parent().removeClass("active"),e(".root-parent",s.el).show(),void 0!=AWEContent.jqIframe&&AWEContent.jqIframe("body").removeClass("awe-preview"))}).trigger("change"),e(".responsive-devices > li",s.el).click(function(t){e(this).siblings(".ui-tabs-active").removeClass("ui-tabs-active"),e(this).addClass("ui-tabs-active"),s.detectScreen(),s.responsiveIframe(),s.reInitPanel()})},afterOpenCallback:function(){var s=this;s.buildResponsive(),e(".ui-tabs-active",s.el).length?e(".ui-tabs-active",s.el).eq(0).trigger("click"):e(".awe-responsive-lg",s.el).trigger("click");var t=s.$el.closest(".awe-toolbar").find('a[href="#'+s.$el.attr("id")+'"]').parent();t.siblings().addClass("disable")},afterCloseCallback:function(){e(".awe-buildzone").css({width:"",left:""}),this.$pageWrapper&&this.$pageWrapper.removeClass("open-responsive-panel responsive-md responsive-sm responsive-xs"),AWEContent.jqIframe(".hover-responsive").removeClass("hover-responsive")},detectScreen:function(){var s=this,t=s.$pageWrapper,n=e(".ui-tabs-active",s.el);t.removeClass("responsive-lg responsive-md responsive-sm responsive-xs"),s.screen="lgResponsive",s.classScreen="col-lg",t.addClass("open-responsive-panel"),n.hasClass("awe-responsive-lg")?(s.screen="lgResponsive",s.classScreen="col-lg",t.addClass("responsive-lg")):n.hasClass("awe-responsive-md")?(s.screen="mediumResponsive",s.classScreen="col-md",t.addClass("responsive-md")):n.hasClass("awe-responsive-sm")?(s.screen="smResponsive",s.classScreen="col-sm",t.addClass("responsive-sm")):n.hasClass("awe-responsive-xs")&&(s.screen="xsResponsive",s.classScreen="col-xs",t.addClass("responsive-xs")),setTimeout(function(){s.updateColumnResizeGrid()},1e3)},screenDefault:function(){this.$pageWrapper.addClass("responsive-lg").removeClass("open-responsive-panel")},reInitPanel:function(){e("input.is-eye",this.el).trigger("change"),this.reInitIframeNewRow()},resetDefault:function(s){var t=this,n=e(s.target).hasClass("reset-default")?e(s.target):e(s.target).closest(".reset-default"),a=n.closest(".parent-component"),i=t.screen;e.each(e(".is-eye",a),function(){var s=e(this).data("element"),t=e(this).data(i+"DF");void 0!=s.get("settings")&&(s=s.get("settings")),s.get(i)!=t&&(s.set(i,t),e(this).trigger("change"))})},connectToView:function(s){var t=this,n=e(s.target).hasClass(".options-expand")?e(s.target):e(s.target).closest(".options-expand"),a=n.next().find(".is-eye"),i=a.data("element"),o=t.getViewFromIframe(i);n.hasClass("disable")?(n.removeClass("disable"),o.removeClass("awe-active")):(n.addClass("disable"),o.addClass("awe-active"))},getViewFromIframe:function(e){return AWEContent.jqIframe(".awe-model-"+e.cid)},responsiveIframe:function(){var s=this.screen,t=e(".awe-buildzone"),n=e(window).width(),a=(n+350)/2,i=a-240,o=a-384,l=a-496;switch(s){case"lgResponsive":t.css({width:"",left:""});break;case"mediumResponsive":t.css({width:"1000px",left:l+"px"});break;case"smResponsive":t.css({width:"780px",left:o+"px"});break;case"xsResponsive":t.css({width:"480px",left:i+"px"})}},reInitIframeNewRow:function(){function e(s,t){s.get("hasLayout")?(s.get("layout").at(s.get("layout").length-1).view.autoSetNewRow(),s.get("layout").each(function(s,t){e(s,t)})):s.get("items").each(function(s,t){var n=s.get("machine_name");"tabs"==n?s.get("tabs").each(function(s,t){s.get("content").at(s.get("content").length-1).view.autoSetNewRow(),s.get("content").each(function(s,t){e(s,t)})}):"accordion"==n&&s.get("accordion").each(function(s,t){s.get("content").at(s.get("content").length-1).view.autoSetNewRow(),s.get("content").each(function(s,t){e(s,t)})})})}AWEContent.sections.each(function(s,t){s.get("columns").at(s.get("columns").length-1).view.autoSetNewRow(),s.get("columns").each(function(s,t){e(s,t)})})},updateColumnResizeGrid:function(){AWEContent.jqIframe(".awe-col").each(function(){var e,s=AWEContent.jqIframe(this),t=s.parent();t.parent().hasClass(".content-accor")?t=t.closest(".group"):t.parent().hasClass("ui-tabs-panel")&&(t=t.closest(".md-content-tab")),e=parseInt(t.width()/12),s.resizable("option","grid",[e,e])})},buildResponsive:function(){var s=this,t=e(".root-parent",s.el);t.empty(),AWEContent.sections.each(function(n,a){function i(t,n,a){var o=e(s.templateComponent({type:"column",hasChildren:!0,hasControls:!0,hasReset:!1})).addClass("parent-2"),l=t.toJSON().settings,c=e(".parent-component",o);if(e(".name-column",o).html("Column"),e(".num-column",o).html(n+1),e(".show-hide input",o).data({element:t,lgResponsiveDF:l.lgResponsive,mediumResponsiveDF:l.mediumResponsive,smResponsiveDF:l.smResponsive,xsResponsiveDF:l.xsResponsive}).attr("data-cid",t.cid),a.append(o),t.get("hasLayout")){var r=e('<div class="parent-layout type-layout"></div>');a.addClass("column-has-layout").append(r),t.get("layout").each(function(e,s){i(e,s,r)})}else t.get("items").length?t.get("items").each(function(t,n){var a=e(s.templateComponent({type:"item",hasChildren:!1,hasControls:!0,hasReset:!1})),o=t.toJSON(),l=t.get("machine_name");if(e(">.type-component > .options-expand >.expand-childs",a).addClass("visibility-hidden"),e(".show-hide input",a).data({element:t,lgResponsiveDF:o.lgResponsive,mediumResponsiveDF:o.mediumResponsive,smResponsiveDF:o.smResponsive,xsResponsiveDF:o.xsResponsive}).attr("data-cid",t.cid),e(".name-item",a).html(l),e(".num-item",a).html(n+1),c.append(a),"tabs"==l){e(".expand-childs",a).removeClass("visibility-hidden");var r=e('<ul class="parent-component hide item-child-column"></ul>');a.addClass("item-extend").append(r),t.get("tabs").each(function(t,n){var a=e(s.templateComponent({type:"tabs",hasChildren:!0,hasControls:!1,hasReset:!1})),o=e("> .parent-component",a);e(".name-tabs",a).html("Tab Children"),e(".num-tabs",a).html(n+1),r.append(a),t.get("content").each(function(e,s){i(e,s,o)})})}else if("accordion"==l){e(".expand-childs",a).removeClass("visibility-hidden");var r=e('<div class="parent-component hide item-child-column"></div>');a.addClass("item-extend").append(r),t.get("accordion").each(function(t,n){var a=e(s.templateComponent({type:"accordion",hasChildren:!0,hasControls:!1})),o=e("> .parent-component",a);e(".name-accordion",a).html("Accordion Children"),e(".num-accordion",a).html(n+1),r.append(a),t.get("content").each(function(e,s){i(e,s,o)})})}}):(e(">.type-component > .options-expand >.expand-childs",o).addClass("visibility-hidden"),c.remove())}var o=e(s.templateComponent({type:"section",hasChildren:!0,hasControls:!0,hasReset:!0})).addClass("parent-1"),l=n.toJSON().settings,c=e(".parent-component",o);e(".name-section",o).html("Section"),e(".num-section",o).html(a+1),t.append(o),e(".show-hide input",o).data({element:n,lgResponsiveDF:l.lgResponsive,mediumResponsiveDF:l.mediumResponsive,smResponsiveDF:l.smResponsive,xsResponsiveDF:l.xsResponsive}).attr("data-cid",n.cid),n.get("columns").each(function(e,s){i(e,s,c)})})},showComponent:function(s){var t=e(s.target).closest(".type-component"),n=e(".expand-childs i",t),a=t.nextAll(".parent-component");a.toggleClass("hide"),n.parent().hasClass("visibility-hidden")||(n.hasClass("ac-icon-arrow-right")?n.removeClass("ac-icon-arrow-right").addClass("ac-icon-arrow-down"):n.removeClass("ac-icon-arrow-down").addClass("ac-icon-arrow-right"))},showElement:function(s){var t=this,n=e(s.target).hasClass("show-hide")?e(s.target):e(s.target).closest(".show-hide"),a=e("input",n),i=t.screen,o=a.data("element");void 0!=o.get("settings")&&(o=o.get("settings")),n.hasClass("disable")?o.set(i,!0):o.set(i,!1),a.trigger("change")},setResponsiveElement:function(s){var t=this,n=t.screen,a=e(s.target),i=a.parent(),o=i.parent().prev().children(".expand-childs"),l=i.parent().parent().next(),c=a.data("element");void 0!=c.get("settings")&&(c=c.get("settings")),c.get(n)?(i.removeClass("disable"),l.css("display",""),o.css({visibility:"",opacity:""})):(i.addClass("disable"),l.css("display","none"),o.css({visibility:"hidden",opacity:0}))}}),e(document).ready(function(){AWEContent.Toolbars.responsive=new AWEContent.Views.ResponsiveToolbar})}(jQuery);