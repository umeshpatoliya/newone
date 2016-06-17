/**
 * pidoco-tinymce-target-control.js
 *
 * Copyright, Pidoco GmbH
 */

/**
 * This class is used to create target controls. You can create them directly or through the Factory.
 *
 * @example
 * // Create and render a button to the body element
 * tinymce.ui.Factory.create({
 *     type: 'target',
 *     text: 'My button'
 * }).renderTo(document.body);
 *
 * @-x-less Target.less
 * @class tinymce.ui.Button
 * @extends tinymce.ui.Widget
 */
var PidocoTarget = (function(Widget) {
	"use strict";

	return Widget.extend({
		Defaults: {
			classes: "widget btn target",
			role: "button"
		},

		/**
		 * Constructs a new button instance with the specified settings.
		 *
		 * @constructor
		 * @param {Object} settings Name/value object with settings.
		 * @setting {String} size Size of the button small|medium|large.
		 * @setting {String} image Image to use for icon.
		 * @setting {String} icon Icon to use for button.
		 */
		init: function(settings) {
			var self = this, size;

			self._super(settings);
			size = settings.size;

			if (settings.subtype) {
				self.addClass(settings.subtype);
			}

			if (size) {
				self.addClass('btn-' + size);
			}
		},
		
		postRender: function() {
			var self = this, size;
			var data = rabbit.data.folder.getTreeOfFoldersAndPages(false, false);

			this.tree = $(this.getEl()).find('.tree');
			
			var value = '';
			
			this.tree.pidocoTree({
				jqTreeOptions: {
					data: data,
					onCanSelectNode: function(node) {
						if (node && !node.folder) {
							return true;
						} else if (node && node.is_open) {
							this.tree.pidocoTree('getTree').tree('closeNode', node);
							return false;
						} else if (node) {
							this.tree.pidocoTree('getTree').tree('openNode', node);
							return false;
						} else if (node === null) {
							return true;
						} else {
							return false;
						}
					}.bind(this)
				},
				value: value,
				isNodeSelected: typeof rabbit.data.page.store.getById(value) === 'object',
				emptyMessage: t('fields.target.emptyMessage'),
				onlyNodeSelectable: false
			});
			
			this.tree.on('confirm', function(e, value, isNodeSelected) {
				self.fire('confirm', {
					value: value,
					isNodeSelected: isNodeSelected
				}, true);
			});
			
			this.tree.on('cancel', function(e) {
				self.fire('cancel', {}, true);
			});
			
			this.tree.on('getFocus', function(e) {
				self.fire('focus', {}, true);
			});
			
			this.tree.on('valueChanged', function(e, value, isNodeSelected) {
				self.fire('change', {
					value: value,
					isNodeSelected: isNodeSelected
				}, true);
			});
			
			this.tree.pidocoTree('clearValue');

			self._super();
		},

		/**
		 * Sets/gets the current button icon.
		 *
		 * @method icon
		 * @param {String} [icon] New icon identifier.
		 * @return {String|tinymce.ui.MenuButton} Current icon or current MenuButton instance.
		 */
		icon: function(icon) {
			var self = this, prefix = self.classPrefix;

			if (typeof(icon) == 'undefined') {
				return self.settings.icon;
			}

			self.settings.icon = icon;
			icon = icon ? prefix + 'ico ' + prefix + 'i-' + self.settings.icon : '';

			if (self._rendered) {
				var btnElm = self.getEl().firstChild, iconElm = btnElm.getElementsByTagName('i')[0];

				if (icon) {
					if (!iconElm || iconElm != btnElm.firstChild) {
						iconElm = document.createElement('i');
						btnElm.insertBefore(iconElm, btnElm.firstChild);
					}

					iconElm.className = icon;
				} else if (iconElm) {
					btnElm.removeChild(iconElm);
				}

				self.text(self._text); // Set text again to fix whitespace between icon + text
			}

			return self;
		},

		/**
		 * Repaints the button for example after it's been resizes by a layout engine.
		 *
		 * @method repaint
		 */
		repaint: function() {
			var btnStyle = this.getEl().firstChild.style;

			btnStyle.width = btnStyle.height = "100%";

			this._super();
		},

		/**
		 * Sets/gets the current button text.
		 *
		 * @method text
		 * @param {String} [text] New button text.
		 * @return {String|tinymce.ui.Button} Current text or current Button instance.
		 */
		text: function(text) {
			var self = this;

			if (self._rendered) {
				var textNode = self.getEl().lastChild.lastChild;
				if (textNode) {
					textNode.data = self.translate(text);
				}
			}

			return self._super(text);
		},
		
		clearValue: function() {
			this.tree.pidocoTree('clearValue');
		},
		
		setData: function(data) {
			this.tree.pidocoTree('setData', data);
		},
		
		setValue: function(value, isNodeSelected) {
			this.tree.pidocoTree('setValue', value, isNodeSelected);
		},
		
		getValue: function() {
			return this.tree.pidocoTree('getValue');
		},
		
		getIsNodeSelected: function() {
			return this.tree.pidocoTree('getIsNodeSelected');
		},

		/**
		 * Renders the control as a HTML string.
		 *
		 * @method renderHtml
		 * @return {String} HTML representing the control.
		 */
		renderHtml: function() {
			var self = this, id = self._id, prefix = self.classPrefix;
			var icon = self.settings.icon, image;

			image = self.settings.image;
			if (image) {
				icon = 'none';

				// Support for [high dpi, low dpi] image sources
				if (typeof image != "string") {
					image = window.getSelection ? image[0] : image[1];
				}

				image = ' style="background-image: url(\'' + image + '\')"';
			} else {
				image = '';
			}

			icon = self.settings.icon ? prefix + 'ico ' + prefix + 'i-' + icon : '';

			return (
				'<div id="' + id + '" class="' + self.classes.toString() + '" tabindex="-1" aria-labelledby="' + id + '">' +
					/*'<button role="presentation" type="button" tabindex="-1">' +
						(icon ? '<i class="' + icon + '"' + image + '></i>' : '') +
						(self._text ? (icon ? '\u00a0' : '') + self.encode(self._text) : '') +
					'</button>' +*/
					'<div role="presentation" class="tree">' +
						'<input type="text" placeholder="' + t('tinymce.plugin.target.placeholder') + '" />' +
						'<span class="toggle-button"></span>' +
					'</div>' +
				'</div>'
			);
		}
	});
})(tinyMCE.ui.Widget);

tinyMCE.ui.Factory.add('target', PidocoTarget);
