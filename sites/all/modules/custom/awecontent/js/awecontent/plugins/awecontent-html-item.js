/**
 * Created by Ong Chinh on 4/11/15.
 */
(function ($) {
    "use strict";

    AWEContent.Models.HtmlItem = AWEContent.Models.Item.extend({
        defaults: {
            machine_name: 'html',
            contentHtml: '<b>Custom Code HTML</b>',
            lgResponsive: true,
            xsResponsive: true,
            mediumResponsive: true,
            smResponsive: true
        },
        createView: function () {
            this.view = new AWEContent.Views.HtmlItem({model: this});
        },
        clone: function () {
            var cloneModel = {};
            $.each(this.toJSON(), function (key, value) {
                cloneModel[key] = value;
            });
            return new AWEContent.Models.HtmlItem(cloneModel);
        }
    });

    AWEContent.Views.HtmlItem = AWEContent.Views.Item.extend({
        initialize: function () {
            AWEContent.Views.Item.prototype.initialize.call(this);
        },
        renderItemContent: function(){
            var self = this,
                settings = self.model.toJSON(),
                $html = $('<div class="awe-item awe-html"></div>');

            self.$html = $html;

            self.$html.html(settings.contentHtml);
            self.$el.defaultResponsive(settings);

            return $html;
        },
        applySettingsChanged: function(model){
            var self = this,
                settings = self.model.toJSON();

            $.each(model.changed, function(key, value){
                self.$el.changeResponsive(key, value);
                switch (key) {
                    case 'contentHtml':
                        self.$html.empty().html(settings.contentHtml);
                        break;
                }
            });
        }
    });

    AWEContent.Views.HtmlItemController = AWEContent.Views.ItemController.extend({
        machineName: 'html',
        controllerHtml: function () {
            return '<div class="title-icon">HTML code</div><i class="ic ac-icon-code"></i>';
        },
        createItemModel: function (templateData) {

            if (templateData != undefined) {

                return new AWEContent.Models.HtmlItem(templateData);
            }
            return new AWEContent.Models.HtmlItem();
        }
    });

    AWEContent.Views.HtmlPanel = AWEContent.Views.ItemPanel.extend({
        tagName: "div",
        className: "awe-obj-panel panel-html",
        panelName: "html",

        initPanel: function() {
            var self = this;

            // Call parent init method
            AWEContent.Views.ItemPanel.prototype.initPanel.call(this);

            // add aceEditor library
            $('#ace-editor-value', self.el).val(self.editingModel.get('contentHtml'));
            AWEContent.Library.addLibrary('aceEditor', function () {
                self.loadLibraryDone();
            }, true);
        },
        loadLibraryDone: function(){
            var self = this;
            self.editor = ace.edit('ace-editor-edit');
            self.editor.setTheme("ace/theme/twilight");
            self.editor.getSession().setMode("ace/mode/html");
            self.editor.setOption("wrap", 25);
            self.editor.setDisplayIndentGuides(true);
            self.editor.renderer.setShowGutter(true);

            // Events
            self.editor.getSession().on('change', function(e, data) {
                self.editingModel.set('contentHtml', self.editor.getValue());
            });
            self.addLibraryDone = true;
        },
        setPanelElementsValue: function(){
            var self = this,
                settings = this.editingModel.toJSON(),
                interval = setInterval(function() {
                    if (self.addLibraryDone) {
                        self.editor.getSession().setValue(settings.contentHtml);
                        clearInterval(interval);
                    }
                }, 50);
        },
        buildPanel: function(){
            return {
                "title": {
                    "type": "markup",
                    "markup": "<div class=\"awe-title\"><h2>HTML Custom<\/h2><\/div>"
                },
                "custom_attributes": {
                    "type": "section",
                    "custom_html": {
                        "type": "markup",
                        "markup": "<div class='ace-editor-wrapper'><div class='ace-editor-edit' id='ace-editor-edit'></div></div>"
                    }
                }
            }
        }
    });

    $(document).ready(function () {
        AWEContent.Controllers.html = new AWEContent.Views.HtmlItemController();
        AWEContent.Panels.html = new AWEContent.Views.HtmlPanel();
    });
})(jQuery)