/**
 * File: awecontent-blank-item.js
 * Author: MegaDrupal
 * Website: http://megadrupal.com/
 */

(function($) {
	'use strict';

	/**
     * Define model for blank object
     */
    AWEContent.Models.BlankObject = AWEContent.Models.Item.extend({
        defaults: {
            machine_name: "awe_blank",
            /* others attributes setting of item with default value*/
        },
        createView: function() {
        	/* Create instance of View for this object */
            this.view = new AWEContent.Views.BlankObjectView({model: this});
        }
    });

    /**
     * Define View for BlankObject
     * Properties defaut of view object:
     *		- model: an instance of AWEContent.Models.BlankObject
     *		- el: DOM element of view
     *		- $el: jQuery object of DOM element
     */
    AWEContent.Views.BlankObjectView = AWEContent.Views.Item.extend({
        additionalEvents: {},
        initialize: function() {
        	// Call parent initialize method
            AWEContent.Views.Item.prototype.initialize.call(this);

            // others initialize code
        },
        renderItemContent: function() {
            var settings = this.model.toJSON(),
                itemContent = '<p>Content of this item base on settings</p>';

            // process settings data of model object to create html and css view for this object 

            return itemContent;
        },
        applySettingsChanged: function(model) {
            var _self = this,
                settings = model.toJSON();

            $.each(model.changedAttributes(), function(attrName, attrValue) {
                // process change view of BlankObject when value of attribute changed
                // attrName is name of attribute what defined in model default
                // attrValue contains new value of attribute
                // to get value of attribute before change use: model.previousAttributes().attrName
            });
        }
    });

    /**
     * Define view display for BlankObject in list objects panel
     * li tag what is contained by items panel
     */
    AWEContent.Views.BlankObjectController = AWEContent.Views.ItemController.extend({
        machineName : 'awe_blank', // is value of machine_name in model
        
    	// this function return html of item will shown in list object panel of admin
        controllerHtml: function() {
            return '<div class="title-icon">Blank</div>' ;
        },
        // this function create new instance of model object (AWEContent.Models.BlankObject)
        // this function will call when drop controller of this object to builder page or when re-edit page what contains this object
        createItemModel: function(templateData) {
            if (templateData != undefined) {
            	// create model with data saved
                return new AWEContent.Models.BlankObject(templateData);
            }

            // create model with default data
            return new AWEContent.Models.BlankObject();
        }
    });

    /**
     * Define panel settings for BlankObject
     * This panel contains elements which allow to change value of attribute in model
     * Properties of this object:
     	- editingModel: instance of model will change when use element in panel. This property is set when click on pen icon of object in builder.
     */
    AWEContent.Views.BlankObjectPanel = AWEContent.Views.ItemPanel.extend({
        className: "awe-obj-panel awe-blank-panel",
        panelName: "awe_blank",
        initPanel: function() {
            AWEContent.Views.ItemPanel.prototype.initPanel.call(this);
            var self = this;

            // handle event of elements in panel to set value changed for model
            // use : this.editingModel.set('attrName', attrValue); to set new value for attribute in model
        },
        setPanelElementsValue: function() {
            var settings = this.editingModel.toJSON();

            // set value of attributes to elements in panel
        },
        // this function return list elements will show in panel
        buildPanel: function() {
            return {
                title: {
                    type: "markup",
                    markup: '<div class="awe-title"><h2>BlankObject Settings</h2></div>'
                }
            };
        }
    });

    $(document).ready(function() {
        AWEContent.Controllers.awe_blank = new AWEContent.Views.BlankObjectController();
        AWEContent.Panels.awe_blank = new AWEContent.Views.BlankObjectPanel();
    });
})(jQuery);
