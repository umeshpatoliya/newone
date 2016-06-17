/**
 * pidoco-tinymce-link-plugin.js
 *
 * Copyright, Pidoco GmbH
 */

/*global tinymce:true */

/*
 * Link
 * This plugin is a modificated version of the official autoresize TinyMCE Plugin
 */
tinymce.PluginManager.add('pidoco.fontsize', function(editor) {
	var selfSelect = false;
	
	var beautifyValue = function(value) {
		return value.replace(/^([0-9\.]*)/, '$1 ');
	};
	
	var sanitizeValue = function(value) {
		value = _.trim(value);
		
		if (value.match(/^[0-9\.]*$/)) {
			value += 'px';
		}
		
		value = value.replace(/ /g, '');
		
		return value;
	};
	
	editor.addButton('fontsize', {
		type: 'writable-dropdown',
		icon: 'link',
		items: {
			'11px': '11 px',
			'14px': '14 px',
			'18px': '18 px',
			'20px': '20 px',
			'24px': '24 px',
			'26px': '26 px',
			'32px': '32 px',
			'42px': '42 px'
		},
		defaultFontSize: '14px',
		shortcut: 'Ctrl+K',
		onPostRender: function() {
			var ctrl = this;
			
			editor.on('init', function() {
				editor.on('NodeChange', function(e) {
					var formatName = 'fontsize';
					var formatter = editor.formatter;
					var value = null;

					$.each(e.parents, function(index, node) {
						if (node.style.fontSize) {
							value = node.style.fontSize;
							return false;
						}
					});
					
					if (!value) {
						value = ctrl.settings.defaultFontSize;
					}
					
					if (value) {
						if (_.has(ctrl.settings.items, value)) {
							selfSelect = true;	
						}
						var displayableValue = beautifyValue(value);
						ctrl.setValue(value, displayableValue);	
					}
				});
			});
			
			editor.on('apply', function(event) {
				if (ctrl.isWriting()) {
					var value = ctrl.getValue();
					confirmFontSize(event.value);
				}
			});
			
			ctrl.on('confirm', function(event) {
				if (selfSelect) {
					selfSelect = false;
					return ;
				}
				
				var value = event.value;
				
				if (!event.isValueSelected) {
					value = sanitizeValue(value);
				}
				
				confirmFontSize(value);
			});
			
			confirmFontSize = function(value) {
				// Timeout is needed because otherwise writing fontsize does not work on Firefox #3975
				setTimeout(function(){
					editor.execCommand('FontSize', false, value);
				}, 0);
			};
		}
	});
});
