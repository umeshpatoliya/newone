/**
 * pidoco-tinymce-resize-plugin.js
 *
 * Copyright, Pidoco GmbH
 */

/*global tinymce:true */

/*
 * Resize
 */
tinymce.PluginManager.add('pidoco.resize', function(editor) {
	
	editor.on('init', function() {
		var iframeElement = editor.iframeElement;
		var id = 'pidoco-resize-handler';
		var resizeHandler = $('<div id="' + id + '" class="mce-pidoco-resizeHandler">•</div>');
		var startSize;

		$(iframeElement.parentElement).append(resizeHandler);
		
		new tinyMCE.ui.DragHelper(id, {
			start: function() {
				var elm = editor.getContentAreaContainer().firstChild;

				startSize = {
					width: elm.clientWidth,
					height: elm.clientHeight
				};
			},

			drag: function(e) {
				var height = editor.getDoc().body.offsetHeight;
				
				editor.theme.resizeTo(startSize.width + e.deltaX, null);
				
				// Body size need to be set to ensure text alignment features
				editor.getDoc().body.style.width = (startSize.width + e.deltaX) + 'px';

				tinyMCE.DOM.setStyle(editor.iframeElement, 'height', height + 'px');
				tinyMCE.DOM.setStyle(editor.editorContainer, 'height', height + 'px');
			},

			stop: function() {
				editor.fire('ResizeEnd');
			}
		});
	});
	
	editor.on('pidoco-resize-set-initial-width', function(e) {
		if (e.width) {
			editor.getDoc().body.style.width = e.width + 'px';
		} else {
			editor.getDoc().body.style.width = 'auto';
		}
	});
});
