/**
 * pidoco-tinymce-trailing-space-remover-plugin.js
 *
 * Copyright, Pidoco GmbH
 */

/*global tinymce:true */
/*eslint no-nested-ternary:0 */

/**
 * Trailing space remover
 * This plugin prevent browser (like Windows) to select trailing space when double clicking
 */
tinymce.PluginManager.add('pidoco.trailing_space_remover', function(editor) {

	editor.on('dblclick', function() {
		var content = editor.selection.getContent();
		if (content.match(/ $/)) {
			var range = editor.selection.getRng();
			if (range.endOffset > 0) {
				range.setEnd(range.endContainer, range.endOffset - 1);	
			}
		}
	});
});
