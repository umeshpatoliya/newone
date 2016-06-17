/**
 * pidoco-tinymce-dot-border-plugin.js
 *
 * Copyright, Pidoco GmbH
 */

/*global tinymce:true */

/*
 * This plugins adds 4 dots to show the border of the text
 */
tinymce.PluginManager.add('pidoco.dotborder', function(editor) {
	
	editor.on('init', function() {
		var iframeElement = editor.iframeElement;
		var dotBorderTopLeft = $('<div class="mce-pidoco-dot-border mce-pidoco-dot-border-top-left">•</div>');
		var dotBorderTopRight = $('<div class="mce-pidoco-dot-border mce-pidoco-dot-border-top-right">•</div>');
		var dotBorderBottomLeft = $('<div class="mce-pidoco-dot-border mce-pidoco-dot-border-bottom-left">•</div>');
		var dotBorderBottomRight = $('<div class="mce-pidoco-dot-border mce-pidoco-dot-border-bottom-right">•</div>');
		var startSize;

		$(iframeElement.parentElement).append(dotBorderTopLeft);
		$(iframeElement.parentElement).append(dotBorderTopRight);
		$(iframeElement.parentElement).append(dotBorderBottomLeft);
		$(iframeElement.parentElement).append(dotBorderBottomRight);
	});
	
});
