/**
 * File: awecontent-table-item.js
 * Author: AWEThemes
 * Website: http://awethemes.com/
 */
(function($) {
    "use strict";
    /**
     * Define modle for col of table
     */
    AWEContent.Models.TableCol = Backbone.RelationalModel.extend({
        defaults: {
            tagName: 'td',
            content: 'cell'
        }
    });

    /**
     * Define collection for col of table
     */

    AWEContent.Collections.TableColList = Backbone.Collection.extend({
        model: AWEContent.Models.TableCol
    });

    /**
     * Define View For col of table
     */
    AWEContent.Views.TableColView = Backbone.View.extend({
        tagName: function() {
            return this.model.get('tagName');
        },
        className: function() {
            return this.model.get('className');
        },
        initialize: function() {
            this.listenTo(this.model, 'destroy', this.destroy);
        },
        render: function() {
            var self = this;
            if(this.model.get("tagName") == "col"){
                var width = this.model.get('colWidth') || '';
                this.$el.html(this.model.get("content"));
                this.$el.css({width: width});
            }
            else{
                this.$el.html('<div class="content" >'+this.model.get("content")+'</div>');
                var heightBefore, heightAfter;
                AWEContent.jqIframe('.content',this.el).hallo({
                    plugins: {
                        halloformat: {
                            formattings: {
                                bold: true,
                                italic: true,
                                underline: true,
                                strikethrough: true
                            }
                        },
                        hallojustify: {},
                        hallolists: {
                            lists: {
                                ordered: true,
                                unordered: true
                            }
                        }
                    },
                    create : function(){
                        this.addEventListener("paste", function(e) {
                            e.preventDefault();
                            var text = e.clipboardData.getData("text/plain");
                            AWEContent.documentIframe.execCommand("insertHTML", false, text);

                        });
                    },
                    editable: true,
                    deactivated: function(event) {
                        self.changeContent(event);
                        heightAfter = $(event.target).height();
                        if (heightAfter != heightBefore) {
                            $(event.target).closest('.awe-section').trigger('resize');
                        }
                    }
                })
            }
        },
        destroy: function() {
            this.remove();
        },
        changeContent : function(el) {
            var _html = $(el.currentTarget).html();
            this.model.set('content', _html);
        }

    });
    /**
     * Define Model for rows of table
     */
    AWEContent.Models.TableRow = Backbone.RelationalModel.extend({
        defaults: {
            type: 'tbody',
            colums: []
        },
        relations: [{
            type: Backbone.HasMany,
            key: "colums",
            relatedModel: AWEContent.Models.TableCol,
            relatedCollection: AWEContent.Collections.TableColList
        }],
        clone: function() {
            var columlist = new AWEContent.Collections.TableColList();
            this.get("colums").each(function(colum) {
                columlist.add(colum.clone());
            });
            return new AWEContent.Models.TableRow({
                colums: columlist
            });
        }
    });

    /**
     * Define View for row of table
     */
    AWEContent.Views.TableRowView = Backbone.View.extend({
        tagName: "tr",
        type: function() {
            return this.model.get('type');
        },
        initialize: function() {
            this.listenTo(this.model.get('colums'), 'add', this.addColum);
            this.listenTo(this.model, 'destroy', this.destroy);
        },
        render: function() {
            var self = this;
            this.model.get('colums').each(function(colum) {
                var columview = new AWEContent.Views.TableColView({
                    model: colum
                });
                columview.render();
                self.$el.append(columview.$el);
            });
        },
        destroy: function() {
            this.remove();
        },
        addColum: function(colum, collection, options) {
            var columview = new AWEContent.Views.TableColView({
                model: colum
            });
            columview.render();
            this.$el.append(columview.$el);
        }

    });

    /**
     * Define collection for row of table
     */

    AWEContent.Collections.TableRowList = Backbone.Collection.extend({
        model: AWEContent.Models.TableRow
    });

    /**
     * Define model for heder item
     */
    AWEContent.Models.TableItem = AWEContent.Models.Item.extend({
        defaults: {
            machine_name: "table",
            title: "Title Tables",
            TableColums: 3,
            TableRows: 3,
            TableHeader: 1,
            TableFooter: 1,
            EqualColum: 0,
            ColOddBG: '',
            ColEvenBG: '',
            RowOddBG: '',
            RowEvenBG: '',
            CellBorderEnable: 1,
            CellPaddingEnable: 0,
            customID: '',
            customClass: '',
            customEnableAttributes: 0,
            customDataAttributes: '[] ', // Array Json ex : [{"attrName":"autoPlay","attrValue":"true"}]
            customActionAttributes: '{"newAction": "", "newAttrName": "", "newAttrValue": ""}',
            customEnableAnimations: 0,
            customDataAnimations: '{"type" : "none"}', // Data Object
            cellModelSettings: {},
            boxModelSettings: {},
            content: [],
            lgResponsive: true,
            xsResponsive: true,
            mediumResponsive: true,
            smResponsive: true
        },
        relations: [{
            type: Backbone.HasMany,
            key: "content",
            relatedModel: AWEContent.Models.TableRow,
            relatedCollection: AWEContent.Collections.TableRowList
        },
            {
                type: Backbone.HasOne,
                key: "boxModelSettings",
                relatedModel: AWEContent.Models.BoxModelSettings
            },
            {
                type: Backbone.HasOne,
                key: "cellModelSettings",
                relatedModel: AWEContent.Models.BoxModelSettings
            }],

        createView: function() {
            this.view = new AWEContent.Views.TableItem({
                model: this
            });
        },
        clone : function(){
            var cloneModel = {};
            $.each(this.toJSON(), function(key,value){
                cloneModel[key] = value;
            });
            cloneModel.boxModelSettings = new AWEContent.Models.BoxModelSettings(cloneModel.boxModelSettings);
            cloneModel.cellModelSettings = new AWEContent.Models.BoxModelSettings(cloneModel.cellModelSettings);
            return new AWEContent.Models.TableItem(cloneModel);
        }
    });

    /**
     * Define View for HeaderItem
     */
    AWEContent.Views.TableItem = AWEContent.Views.Item.extend({
        styleTemplate: _.template('\
            <%= classtable  %> tbody tr:nth-child(odd) { background-color: <%= rowoddbg  %>;}\
            <%= classtable  %> tbody tr:nth-child(even) { background-color: <%= rowevenbg  %>;}\
            <%= classtable  %> colgroup col:nth-child(odd) { background-color: <%= coloddbg  %>;}\
            <%= classtable  %> colgroup col:nth-child(even) { background-color: <%= colevenbg  %>;}\
        '),
        initialize: function() {
            AWEContent.Views.Item.prototype.initialize.call(this);
            var self = this;
            self.rowResize();
            this.listenTo(this.model.get('content'), 'add', this.addRow);
            this.listenTo(this.model.get('boxModelSettings'), 'change', this.applySettingsChanged);
            this.listenTo(this.model.get('cellModelSettings'), 'change', this.applySettingsChanged);
        },
        renderItemContent: function() {
            var self = this,
                $table = $('<table></table>'),
                $theader = $('<thead></thead>'),
                $tfooter = $('<tfoot></tfoot>'),
                $wraptable = $('<div class="awe-item awe-table '+self.cid+'"></div>'),
                settings = self.model.toJSON(),
                $styleTable = this.styleTemplate({classtable: '.'+self.cid ,rowoddbg: settings.RowOddBG, rowevenbg: settings.RowEvenBG, coloddbg: settings.ColOddBG, colevenbg: settings.ColEvenBG });

            $table.append('<thead></thead>').append('<tbody></tbody>').append('<tfoot></tfoot>');
            this.model.get('content').each(function(row) {
                var rowview = new AWEContent.Views.TableRowView({
                    model: row
                });
                rowview.render();
                switch (row.get('type')) {
                    case 'colgroup':
                        var colgroup = new AWEContent.Views.TableRowView({
                            model: row,
                            tagName: 'colgroup'
                        });
                        colgroup.render();
                        $table.prepend(colgroup.$el);
                        break;
                    case 'theader':
                        $table.find('thead').append(rowview.$el);
                        break;
                    case 'tbody':
                        $table.find('tbody').append(rowview.$el);
                        break;
                    case 'tfooter':
                        $table.find('tfoot').append(rowview.$el);
                        break;
                }

            });
            if (!settings.TableHeader) {
                $('thead', $table).hide();
            }
            if (!settings.TableFooter){
                $('tfoot', $table).hide();
            }
            $table.attr('id', settings.customID).addClass(settings.customClass);
            $wraptable.prepend($table);
            $wraptable.append('<style class="table-style">'+$styleTable+'</style>');
            $table.renderItemDefaultBoxModel(settings.boxModelSettings);
            $table.renderItemDefaultAttributes(settings.customEnableAttributes, settings.customDataAttributes);
            if (settings.customEnableAnimations) {
                var animation = settings.customDataAnimations;
                $wraptable.processAnimations(animation)
            }

            $wraptable.append('<style class="cell-border"></style>');
            $wraptable.append('<style class="cell-padding"></style>');

            var $styleBorder = $('.cell-border', $wraptable),
                $stylePadding = $('.cell-padding', $wraptable),
                cellSetting = settings.cellModelSettings;

            if(cellSetting.enabledCustomBorder == 0){
                $styleBorder.html('');
            }
            else if(cellSetting.enabledCustomBorder == 1){
                var cellborder = '';
                if(cellSetting.enabledConstraintBorder == 1){
                    cellborder = '.'+self.cid+' table td, .'+self.cid+' table th{border: '+cellSetting.borderTop+'}';
                }
                else{
                    cellborder = '.'+self.cid+' table td, .'+self.cid+' table th {border-top: '+cellSetting.borderTop+'}';
                    cellborder += '.'+self.cid+' table td, .'+self.cid+' table th {border-bottom: '+cellSetting.borderBottom+'}';
                    cellborder += '.'+self.cid+' table td, .'+self.cid+' table th {border-left: '+cellSetting.borderLeft+'}';
                    cellborder += '.'+self.cid+' table td, .'+self.cid+' table th {border-right: '+cellSetting.borderRight+'}';
                }
                if($wraptable.find('.cell-border').length){
                    $styleBorder.html(cellborder);
                }
                else{
                    $wraptable.append('<style class="cell-border">'+cellborder+'</style>');
                }
            }
            if(cellSetting.enabledCustomPadding == 0){
                $stylePadding.html('');
            }
            else if(cellSetting.enabledCustomPadding == 1){
                var cellPadding = '';
                if(cellSetting.enabledConstraintPadding == 1){
                    cellPadding = '.'+self.cid+' table td, .'+self.cid+' table th{padding: '+cellSetting.paddingTop+'px}';
                }
                else{
                    cellPadding = '.'+self.cid+' table td, .'+self.cid+' table th {padding-top: '+cellSetting.paddingTop+'px}';
                    cellPadding += '.'+self.cid+' table td, .'+self.cid+' table th {padding-bottom: '+cellSetting.paddingBottom+'px}';
                    cellPadding += '.'+self.cid+' table td, .'+self.cid+' table th {padding-left: '+cellSetting.paddingLeft+'px}';
                    cellPadding += '.'+self.cid+' table td, .'+self.cid+' table th {padding-right: '+cellSetting.paddingRight+'px}';
                }
                if($wraptable.find('.cell-padding').length){
                    $stylePadding.html(cellPadding);
                }
                else{
                    $wraptable.append('<style class="cell-padding">'+cellPadding+'</style>');
                }
            }
            self.$el.defaultResponsive(settings);
            return $wraptable;
        },
        applySettingsChanged: function(model, options) {
            var self = this,
                thismodel = model,
                settings = self.model.toJSON(),
                cellSetting = settings.cellModelSettings,
                $wraptable = $('.awe-item', self.el),
                $table = $('table', self.el),
                $cell = $('.awe-table tbody td', self.el),
                heightBefore = self.$el.height();

            $.each(model.changed, function(key, value) {
                self.$el.changeResponsive(key, value);
                $table.renderChangeSettingBoxModel(key, value, thismodel);
                switch (key) {
                    case 'TableColums':
                        self.model.get('content').each(function(row, idRow) {
                            var columns = row.get('colums').length,
                                offset = value > columns ? (value - columns) : (columns - value);
                            if (value > columns)
                                for (var i = 0; i < offset; i ++) {
                                    var tagName = (row.get('type') == 'theader') ? 'th' : (row.get('type') == 'colgroup') ? 'col' : 'td',
                                        content = (row.get('type') == 'theader') ? 'Header' : (row.get('type') == 'tfooter') ? 'Footer' : (row.get('type') == 'colgroup') ? '' : 'cell',
                                        newColum = new AWEContent.Models.TableCol({
                                            tagName: tagName,
                                            content: content
                                        });

                                    row.get('colums').add(newColum);
                                }
                            else {
                                for (var j = 0; j < offset ; j ++) {
                                    var colum = row.get('colums').pop();
                                    colum.destroy();
                                }
                            }
                        });
                        self.rowResize();
                        self.$el.closest('.awe-section').trigger('resize');
                        break;
                    case 'TableRows':
                        var theader = self.model.get('TableHeader'),
                            tfooter = self.model.get('TableFooter'),
                            length = self.model.get('content').length,
                            newValue = value + 3;
                        if (length < newValue) {
                            for (var i = 0; i< (newValue - length) ; i ++) {
                                var newRow = self.model.get('content').models['1'].clone();
                                newRow.set({
                                    type: 'tbody'
                                });
                                newRow.get('colums').each(function(colum, key) {
                                    colum.set({
                                        tagName: 'td',
                                        content: 'cell'
                                    });
                                });
                                self.model.get('content').add(newRow);
                            }
                        }
                        else {
                            var collectionContent = self.model.get('content'),
                                indexPop = collectionContent.length - 1,
                                offset = length - newValue;

                            while(offset && indexPop !=-1 ){
                                var row = self.model.get('content').at(indexPop);
                                if (row.get('type') == 'tbody'){
                                    offset --;
                                    collectionContent.remove(row);
                                    row.destroy();
                                }
                                indexPop --;
                            }
                        }
                        self.$el.closest('.awe-section').trigger('resize');
                        break;
                    case 'TableHeader':
                        var models = self.model.get('content').models;
                        $('thead th', self.el).css('width', '');
                        $('tr:first-child td', self.el).css('width', '');
                        if (value == 0) {
                            $('.awe-table thead',self.$el).hide();
                            self.iframeJQuery('tbody tr:first td', self.el).resizable('enable').find('.ui-resizable-handle').css('width', '');
                        }
                        else {
                            $('.awe-table thead',self.$el).show();
                            self.iframeJQuery('tbody tr:first td', self.el).resizable('disable').find('.ui-resizable-handle').css('width', '0');
                        }
                        self.$el.closest('.awe-section').trigger('resize');
                        break;
                    case 'TableFooter':
                        if (value == 0) {
                            $('.awe-table tfoot',self.$el).hide();
                        } else {
                            $('.awe-table tfoot',self.$el).show();
                        }
                        self.$el.closest('.awe-section').trigger('resize');
                        break;
                    case 'EqualColum':
                        if(!$('.awe-table style.table-col-with',self.el).length){
                            $('.awe-table',self.el).append('<style class="table-col-with"></style>');
                        }
                        if(value == 0){
                            $('.awe-table style.table-col-with',self.el).html('');
                        }else{
                            $('.awe-table td, .awe-table th, .awe-table col',self.$el).attr('style','');
                            $('.awe-table style.table-col-with',self.el).html('.awe-table.'+self.cid+' >table >colgroup >col {width: 1%;}');
                        }
                        self.$el.closest('.awe-section').trigger('resize');
                        break;
                    case 'RowOddBG':
                    case 'RowEvenBG':
                    case 'ColOddBG':
                    case 'ColEvenBG':

                        if (self.updateColor)
                            clearTimeout(self.updateColor);

                        self.updateColor = setTimeout(function() {
                            var $styleTable = self.styleTemplate({
                                    classtable : '.'+self.cid,
                                    rowoddbg : settings.RowOddBG,
                                    rowevenbg : settings.RowEvenBG,
                                    coloddbg: settings.ColOddBG,
                                    colevenbg: settings.ColEvenBG
                                });
                            if ($('.awe-table style.table-style', self.el).length) {
                                $('.awe-table style.table-style', self.el).html($styleTable);
                            }
                            else {
                                $('.awe-table',self.el).append('<style class="table-style">'+$styleTable+'</style>');
                            }
                            
                            // clear timeout
                            self.updateColor = false;
                        }, 100);

                        break;
                    case 'customID' :
                        $table.attr('id', value);
                        break;
                    case 'customClass':
                        var prevClass = self.model.previousAttributes().customClass;
                        $table.removeClass(prevClass).addClass(value);
                        break;
                    case 'customEnableAttributes':
                        $table.renderChangeSettingsAttributes(key, value, settings.customDataAttributes);
                        break;
                    case 'customActionAttributes':
                        $table.renderChangeSettingsAttributes(key, value);
                        break;
                    case 'customEnableAnimations':
                        var animation, prevAnimation;
                        if (value) {
                            animation = settings.customDataAnimations;
                            prevAnimation = null;
                            $wraptable.processAnimations(animation);
                        }
                        else {
                            animation = null;
                            prevAnimation = settings.customDataAnimations;
                            $wraptable.processAnimations(animation, prevAnimation);
                        }

                        break;
                    case 'customDataAnimations':
                        var animation, prevAnimation;
                        animation = settings.customDataAnimations;
                        prevAnimation = self.model.previousAttributes().customDataAnimations;
                        $wraptable.processAnimations(animation, prevAnimation);
                        break;
                    default:
                        if(thismodel.get("nameBox") != "box")
                        {
                            if(cellSetting.enabledCustomBorder == 0){
                                $('style.cell-border', self.el).html('');
                            }
                            else if(cellSetting.enabledCustomBorder == 1){
                                var cellborder = '';
                                if(cellSetting.enabledConstraintBorder == 1){
                                    cellborder = '.'+self.cid+' table td, .'+self.cid+' table th{border: '+cellSetting.borderTop+'}';
                                }
                                else{
                                    cellborder = '.'+self.cid+' table td, .'+self.cid+' table th {border-top: '+cellSetting.borderTop+'}';
                                    cellborder += '.'+self.cid+' table td, .'+self.cid+' table th {border-bottom: '+cellSetting.borderBottom+'}';
                                    cellborder += '.'+self.cid+' table td, .'+self.cid+' table th {border-left: '+cellSetting.borderLeft+'}';
                                    cellborder += '.'+self.cid+' table td, .'+self.cid+' table th {border-right: '+cellSetting.borderRight+'}';
                                }
                                if($('style.cell-border', self.el).length){
                                    $('style.cell-border', self.el).html(cellborder);
                                }
                                else{
                                    $('.awe-table', self.el).append('<style class="cell-border">'+cellborder+'</style>');
                                }
                            }
                            if(cellSetting.enabledCustomPadding == 0){
                                $('style.cell-padding', self.el).html('');
                            }
                            else if(cellSetting.enabledCustomPadding == 1){
                                var cellPadding = '';
                                if(cellSetting.enabledConstraintPadding == 1){
                                    cellPadding = '.'+self.cid+' table td, .'+self.cid+' table th{padding: '+cellSetting.paddingTop+'px}';
                                }
                                else{
                                    cellPadding = '.'+self.cid+' table td, .'+self.cid+' table th {padding-top: '+cellSetting.paddingTop+'px}';
                                    cellPadding += '.'+self.cid+' table td, .'+self.cid+' table th {padding-bottom: '+cellSetting.paddingBottom+'px}';
                                    cellPadding += '.'+self.cid+' table td, .'+self.cid+' table th {padding-left: '+cellSetting.paddingLeft+'px}';
                                    cellPadding += '.'+self.cid+' table td, .'+self.cid+' table th {padding-right: '+cellSetting.paddingRight+'px}';
                                }
                                if($('style.cell-padding', self.el).length){
                                    $('style.cell-padding', self.el).html(cellPadding);
                                }
                                else{
                                    $('.awe-table', self.el).append('<style class="cell-padding">'+cellPadding+'</style>');
                                }
                            }
                            self.$el.closest('.awe-section').trigger('resize');
                        }
                }
            });

            setTimeout(function() {
                self.checkChangeHeight(heightBefore);
            }, 100);
        },
        addRow: function(row, collection, options) {
            var rowview = new AWEContent.Views.TableRowView({
                model: row
            });
            rowview.render();
            switch (row.get('type')) {
                case 'theader':
                    $('table thead', this.$el).append(rowview.$el);
                    break;
                case 'tbody':
                    $('table tbody', this.$el).append(rowview.$el);
                    break;
                case 'tfooter':
                    $('table tfoot', this.$el).append(rowview.$el);
                    break;
            }
        },
        rowResize: function() {
            var self = this, query,
                settings = self.model.toJSON();
            self.iframeJQuery('th:not(.ui-resizable), tbody tr:first td:not(.ui-resizable)', self.el).resizable({
                handles: 'e',
                start: function() {
                    var index = $(this).index();
                    self.model.set("EqualColum", 0, {updateToPanel: true});
                    $('col', self.el).eq(index).css('width', '');
                },
                stop: function( event, ui ) {
                    var  index = $(this).index(),
                        indexCold = index + 1,
                        width = ui.size.width,
                        colModel = self.model.get('content').at(0).get('colums').at(index);
                    self.iframeJQuery('col', self.el).eq(index).css({'width' : width});
                    colModel.set({colWidth: width});
                }
            });
            if (settings.TableHeader)
                self.iframeJQuery('tbody tr:first td', self.el).resizable('disable').find('.ui-resizable-handle').css('width', '0');
            else{
                self.iframeJQuery('tbody tr:first td', self.el).resizable('enable').find('.ui-resizable-handle').css('width', '');
                self.iframeJQuery('thead', self.el).hide();
            }
        }
    });

    /**
     * Define view for Header Controller
     * li tag what is contained by items panel
     */
    AWEContent.Views.TableItemController = AWEContent.Views.ItemController.extend({
        machineName: 'table',
        controllerHtml: function() {
            return '<div class="title-icon">Table</div><i class="ic ac-icon-table"></i>';
        },
        createItemModel: function(templateData) {
            if (templateData){
                templateData.cellModelSettings = new AWEContent.Models.BoxModelSettings(templateData.cellModelSettings);
                templateData.boxModelSettings = new AWEContent.Models.BoxModelSettings(templateData.boxModelSettings);
                var content = new AWEContent.Collections.TableRowList(),
                    count = templateData.content.length;
                $.each(templateData.content, function(index, dataRow){
                    var row = new AWEContent.Models.TableRow();
                    $.each(dataRow.colums, function(index, dataCol){
                        var col = new AWEContent.Models.TableCol(dataCol);
                        row.get('colums').add(col);
                    });
                    dataRow.colums = row.get('colums');
                    content.add(dataRow);
                });
                templateData.content = content;
                return new AWEContent.Models.TableItem(templateData);
            }
            else {
                var cellModelSettings = new AWEContent.Models.BoxModelSettings({nameBox:"cell"}),
                    boxModelSettings = new AWEContent.Models.BoxModelSettings({nameBox:"box"}),
                    colheader = new AWEContent.Models.TableCol({
                        tagName: 'th',
                        content: 'Header'
                    }),
                    colgroup = new AWEContent.Models.TableCol({
                        tagName: 'col',
                        content: ''
                    }),
                    colbody = new AWEContent.Models.TableCol(),
                    colfooter = new AWEContent.Models.TableCol({
                        content: 'Footer'
                    }),
                    rowcoldgroup = new AWEContent.Models.TableRow({
                        type: 'colgroup',
                        tagName: 'colgroup',
                        colums: [colgroup, colgroup.clone(), colgroup.clone()]
                    }),
                    rowheader = new AWEContent.Models.TableRow({
                        type: 'theader',
                        colums: [colheader, colheader.clone(), colheader.clone()]
                    }),
                    rowbody = new AWEContent.Models.TableRow({
                        type: 'tbody',
                        colums: [colbody, colbody.clone(), colbody.clone()]
                    }),
                    rowfooter = new AWEContent.Models.TableRow({
                        type: 'tfooter',
                        colums: [colfooter, colfooter.clone(), colfooter.clone()]
                    }),
                    listrow = new AWEContent.Collections.TableRowList([rowcoldgroup, rowheader, rowbody, rowbody.clone(), rowbody.clone(), rowfooter]);
                return new AWEContent.Models.TableItem({cellModelSettings: cellModelSettings, boxModelSettings : boxModelSettings, content: listrow});
            }
        }
    });

    /**
     * Define header panel
     */
    AWEContent.Views.TablePanel = AWEContent.Views.ItemPanel.extend({
        tagName: "div",
        className: "awe-obj-panel panel-table",
        panelName: "table",
        initPanel: function() {
            AWEContent.Views.ItemPanel.prototype.initPanel.call(this);
            var self = this;

            $('#table-number-colums', self.el).change(function(event, values) {
                self.editingModel.set('TableColums', values.value);
            });
            $('#table-number-rows', self.el).change(function(event, values) {
                self.editingModel.set('TableRows', values.value);
            });
            $('#table-enable-header input', self.el).change(function(event, headerEdit) {
                if(!headerEdit){
                    self.editingModel.set('TableHeader', parseInt($(this).val()));
                }
            });
            $('#table-enable-footer input', self.el).change(function(event, footerEdit) {
                if(!footerEdit){
                    self.editingModel.set('TableFooter', parseInt($(this).val()));
                }
            });
            $('#table-equal-colum-width input', self.el).change(function(event, equalColum) {
                if(!equalColum){
                    self.editingModel.set('EqualColum', $(this).val());
                }
            });
            $('#table-odd-col-background', self.el).change(function(event, color) {
                if (color)
                    color = color.toRgbString();
                else
                    color = '';
                self.editingModel.set('ColOddBG', color);
            });
            $('#table-even-col-background', self.el).change(function(event, color) {
                if (color)
                    color = color.toRgbString();
                else
                    color = '';
                self.editingModel.set('ColEvenBG', color);
            });
            $('#table-odd-row-background', self.el).change(function(event, color) {
                if (color)
                    color = color.toRgbString();
                else
                    color = '';
                self.editingModel.set('RowOddBG', color);
            });
            $('#table-even-row-background', self.el).change(function(event, color) {
                if (color)
                    color = color.toRgbString();
                else
                    color = '';
                self.editingModel.set('RowEvenBG', color);
            });
            $("#table-column-box-model", self.el).initBoxModelPanel(self, "boxModelSettings");
            $("#table-column-box-model-cell", self.el).initBoxModelPanel(self, "cellModelSettings");
            $('#text-table-custom-id', self.el).change( function(){
                self.editingModel.set('customID', $(this).val());
            });
            $('#text-table-custom-class', self.el).change( function(){
                self.editingModel.set('customClass', $(this).val());
            });
            $('#table-custom-attributes', this.el).initAttributesPanel(self);
            $('#table-animations input[name=enabled_custom_animation]', this.el).change(function(event, data) {
                self.editingModel.set('customEnableAnimations', parseInt($(this).val()));
                if (data){
                    self.editingModel.set('customDataAnimations', JSON.stringify(data.animations));
                }
            });
        },
        setPanelElementsValue: function() {
            var self = this,
                settings = this.editingModel.toJSON();

            $('#table-number-colums', self.el).aweSlider('value', settings.TableColums);
            $('#table-number-rows', self.el).aweSlider('value', settings.TableRows);
            $('#table-enable-header input', self.el).val(settings.TableHeader).trigger("change", true);
            $('#table-enable-footer input', self.el).val(settings.TableFooter).trigger("change", true);
            $('#table-equal-colum-width input', self.el).val(settings.EqualColum).trigger("change", true);
            $("#table-odd-row-background", this.el).aweColorPicker("value", settings.RowOddBG);
            $("#table-even-row-background", this.el).aweColorPicker("value", settings.RowEvenBG);
            $("#table-odd-col-background", this.el).aweColorPicker("value", settings.ColOddBG);
            $("#table-even-col-background", this.el).aweColorPicker("value", settings.ColEvenBG);
            $("#table-column-box-model", this.el).initBoxModel(settings.boxModelSettings);
            $("#table-column-box-model-cell", this.el).initBoxModel(settings.cellModelSettings);
            $('#text-table-custom-id', this.el).val(settings.customID);
            $('#text-table-custom-class', this.el).val(settings.customClass);
            $('#table-custom-attributes', this.el).initAttributes(settings.customEnableAttributes, settings.customDataAttributes);
            $('#table-animations input[name=enabled_custom_animation]', this.el).val(settings.customEnableAnimations).trigger('change');
            $('#table-animations input[name=enabled_custom_animation]', this.el).attr('data-animations', settings.customDataAnimations).data('view', this.editingModel.view);

            // Listen event change value of EqualColumn attribute to update panel element
            if (!this.editingModel.isFirstEdit) {
                this.listenTo(this.editingModel, "change:EqualColum", this.updateEqualColumnController);
                this.editingModel.isFirstEdit = 1;
            }
        },
        updateEqualColumnController: function(model, changedValue, options) {
            if (options.updateToPanel)
                $('#table-equal-colum-width input', this.$el).val(changedValue).trigger("change", true);
        },
        buildPanel: function() {
            return {
                "title": {
                    "type": "markup",
                    "markup": "<div class=\"awe-title\"><h2>Table<\/h2><\/div>"
                },
                "custom_attributes": {
                    "type": "section",
                    "number_colums": {
                        "type": "slider",
                        "title": "Columns",
                        "values": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
                        "default_value": 4,
                        "allow_type": true
                    },
                    "number_rows": {
                        "type": "slider",
                        "title": "Rows",
                        "values": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
                        "default_value": 4,
                        "allow_type": true
                    },
                    "enable_header": {
                        "type": "toggle",
                        "title": "Table header",
                        "default_value": 1
                    },
                    "enable_footer": {
                        "type": "toggle",
                        "title": "Table footer",
                        "default_value": 1
                    },
                    "equal_colum_width": {
                        "type": "toggle",
                        "title": "Equal column width",
                        "default_value": 0
                    }
                },
                "custom_background": {
                    "type": "section",
                    "odd_row_background": {
                        "type": "colorpicker",
                        "title": "Odd row background",
                        "options": {
                            "preferredFormat"  : "rgb",
                            "AlphaVerticle"  : true,
                            "showAlpha"  : true,
                            "allowEmpty" : true,
                            "showInput" : true
                        }
                    },
                    "even_row_background": {
                        "type": "colorpicker",
                        "title": "Even row background",
                        "options": {
                            "preferredFormat"  : "rgb",
                            "AlphaVerticle"  : true,
                            "showAlpha"  : true,
                            "allowEmpty" : true,
                            "showInput" : true
                        }
                    },
                    "odd_col_background": {
                        "type": "colorpicker",
                        "title": "Odd Col background",
                        "options": {
                            "preferredFormat"  : "rgb",
                            "AlphaVerticle"  : true,
                            "showAlpha"  : true,
                            "allowEmpty" : true,
                            "showInput" : true
                        }
                    },
                    "even_col_background": {
                        "type": "colorpicker",
                        "title": "Even col background",
                        "options": {
                            "preferredFormat"  : "rgb",
                            "AlphaVerticle"  : true,
                            "showAlpha"  : true,
                            "allowEmpty" : true,
                            "showInput" : true
                        }
                    }
                },
                "custom_cell": {
                    "type": "section",
                    "column_box_model_cell": {
                        "type": "tabs",
                        "tabs": [
                            {
                                "tab_title": "Cell Border",
                                "contents": {
                                    "custom_border_cell": {
                                        "type": "box_border",
                                        "min_value": 0,
                                        "max_value": 100,
                                        "default_value": 0
                                    }
                                }
                            }, {
                                "tab_title": "Cell padding",
                                "contents": {
                                    "custom_padding_cell": {
                                        "type": "box_model",
                                        "model_type": "padding",
                                        allow_type: true,
                                        "min_value": 0,
                                        "max_value": 100,
                                        "default_value": 0
                                    }
                                }
                            }]
                    }
                },
                "custom_box_model": {
                    "type": "section",
                    "column_box_model": {
                        "type": "tabs",
                        "tabs": [{
                            "tab_title": "Border",
                            "contents": {
                                "custom_border": {
                                    "type": "box_border",
                                    "min_value": 0,
                                    "max_value": 100,
                                    "default_value": 0
                                }
                            }
                        },{
                            "tab_title": "Radius",
                            "contents": {
                                "custom_border_radius": {
                                    "type": "box_model",
                                    "model_type": "border_radius",
                                    allow_type: true,
                                    "min_value": 0,
                                    "max_value": 100,
                                    "default_value": 0
                                }
                            }
                        }, {
                            "tab_title": "Margin",
                            "contents": {
                                "custom_margin": {
                                    "type": "box_model",
                                    "model_type": "margin",
                                    allow_type: true,
                                    "min_value": 0,
                                    "max_value": 100,
                                    "default_value": 0
                                }
                            }
                        }]
                    }
                },
                "custom_definitions": {
                    "type": "section",
                    "custom_id": {
                        "type": "text_field",
                        "title": "ID",
                        "attributes": {
                            "placeholder": "Custom ID"
                        },
                        "default_value": ""
                    },
                    "custom_class": {
                        "type": "text_field",
                        "title": "CSS class",
                        "attributes": {
                            "placeholder": "Custom class"
                        },
                        "default_value": ""
                    },
                    "custom_attributes": {
                        "type": "custom_attributes"
                    },
                    animations: {
                        type: "animations"
                    }
                }
            };
        }
    });
    $(document).ready(function() {
        AWEContent.Controllers.table = new AWEContent.Views.TableItemController();
        AWEContent.Panels.table = new AWEContent.Views.TablePanel();
    });
})(jQuery);
