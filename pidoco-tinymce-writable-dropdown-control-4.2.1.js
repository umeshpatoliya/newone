/**
 * pidoco-tinymce-writable-dropdown-control.js
 *
 * Copyright, Pidoco GmbH
 */

/**
 * This class is used to create writable dropdown controls. You can create them directly or through the Factory.
 *
 * @example
 * // Create and render a button to the body element
 * tinymce.ui.Factory.create({
 *     type: 'writable-dropdown',
 *     text: 'My button'
 * }).renderTo(document.body);
 *
 * @-x-less Target.less
 * @class tinymce.ui.Button
 * @extends tinymce.ui.Widget
 */
var PidocoWritableDropdown = (function(Widget) {
	"use strict";
	
	var items;
	var writing = false;

	return Widget.extend({
		Defaults: {
			classes: "widget btn writable-dropdown",
			role: "button"
		},
		
		init: function(settings) {
			var self = this;
			items = settings.items;

			self._super(settings);
		},
		
		postRender: function() {
			this.dropdown = $(this.getEl()).find('.writable-dropdown');
			this.input = $(this.getEl()).find('input');

			this.dropdown.pidocoDropdown({
				multiple: false,
				data: items
			});
			
			this.dropdown.on('dropdownItemSelected', function(e, extraParameters){
				var value = $(e.target).pidocoDropdown('getValue');
				writing = false;

				this.input.val(extraParameters.displayableValue);
				
				this.fire('confirm', {
					value: extraParameters.value,
					displayableValue: extraParameters.displayableValue,
					isValueSelected: true
				}, true);
			}.bind(this));
			
			this.input.focus(function(e) {
				this.input.select();
			}.bind(this));
			
			this.input.keydown(function(e){
				writing = true;
				if (e.keyCode == 13) {
					this.fire('confirm', {
						value: this.input.val(),
						displayableValue: this.input.val(),
						isValueSelected: false
					}, true);
					writing = false;
				} else if (e.keyCode == 27) {
					this.fire('cancel');
					writing = false;
				}
			}.bind(this));

			this._super();
		},
		
		isWriting: function() {
			return writing;
		},
		
		setValue: function(value, optionalDisplayableValue) {
			if (_.has(items, value)) {
				this.dropdown.pidocoDropdown('select', value, optionalDisplayableValue);
			} else {
				this.dropdown.pidocoDropdown('deselect');
				this.input.val(optionalDisplayableValue);
			}
		},
		
		getValue: function() {
			if (writing) {
				this.dropdown.pidocoDropdown('deselect');
				return this.input.val();
			} else {
				this.dropdown.pidocoDropdown('getValue');
			}
		},

		/**
		 * Renders the control as a HTML string.
		 *
		 * @method renderHtml
		 * @return {String} HTML representing the control.
		 */
		renderHtml: function() {
			var self = this, id = self._id;

			return (
				'<div id="' + id + '" class="' + self.classes.toString() + '" tabindex="-1" aria-labelledby="' + id + '">' +
					'<div role="presentation" class="writable-dropdown">' +
						'<input type="text" placeholder="' + t('tinymce.plugin.fontsize.placeholder') + '" />' +
						'<span class="toggle-button"></span>' +
					'</div>' +
				'</div>'
			);
		}
	});
})(tinyMCE.ui.Widget);

tinyMCE.ui.Factory.add('writable-dropdown', PidocoWritableDropdown);
