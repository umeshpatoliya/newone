/**
 * pidoco-tinymce-autoreisze-plugin.js
 *
 * Copyright, Pidoco GmbH
 */

/*global tinymce:true */
/*eslint no-nested-ternary:0 */

/**
 * Auto Resize
 * This plugin is a modificated version of the official autoresize TinyMCE Plugin
 */
tinymce.PluginManager.add('pidoco.autoresize', function(editor) {
	var settings = editor.settings, oldSize = 0, oldWidth = 0, numberOfCharacterInContentLastEvent, pause = true, direction;

	function isFullscreen() {
		return editor.plugins.fullscreen && editor.plugins.fullscreen.isFullscreen();
	}

	if (editor.settings.inline) {
		return;
	}

	/**
	 * This method gets executed each time the editor needs to resize.
	 */
	function resize(e, force) {
		var deltaSize, doc, body, docElm, DOM = tinymce.DOM, newWidth, newHeight, myHeight,
			marginTop, marginBottom, paddingTop, paddingBottom, borderTop, borderBottom, 
			resized = false, numberOfCharacterDifferenceFromLastEvent, resizeContent = false;

		doc = editor.getDoc();
		
		if (!doc || pause) {
			return;
		}
		
		if (e && e.type === 'setcontent') {
			numberOfCharacterDifferenceFromLastEvent = e.content.length - numberOfCharacterInContentLastEvent;
			numberOfCharacterInContentLastEvent = e.content.length;
			resizeContent = true;
		}
		
		direction = 'both';
		if (settings.direction == 'width' || settings.direction == 'height') {
			direction = settings.direction;
		}
		
		body = doc.body;
		docElm = doc.documentElement;
		
		if (!body || (e && e.type === "setcontent" && e.initial) || isFullscreen()) {
			if (body && docElm) {
				body.style.overflowY = "auto";
				body.style.overflowX = "auto";
			}

			return;
		}
		
		var lineWithoutSpaceTooBig = direction == 'height' && editor.iframeElement.scrollWidth + 1 < editor.getBody().scrollWidth;
		
		if (direction == 'both' || direction == 'width' || lineWithoutSpaceTooBig) {
			newWidth = settings.autoresize_min_width;
		
			var marginLeft = editor.dom.getStyle(body, 'margin-left', true);
			var marginRight = editor.dom.getStyle(body, 'margin-right', true);
			var paddingLeft = editor.dom.getStyle(body, 'padding-left', true);
			var paddingRight = editor.dom.getStyle(body, 'padding-right', true);
			var borderLeft = editor.dom.getStyle(body, 'border-left-width', true);
			var borderRight = editor.dom.getStyle(body, 'border-right-width', true);
			var myWidth = body.offsetWidth + parseInt(marginLeft, 10) + parseInt(marginRight, 10) +
				parseInt(paddingLeft, 10) + parseInt(paddingRight, 10) +
				parseInt(borderLeft, 10) + parseInt(borderRight, 10) + 20;
		
			// Make sure we have a valid height
			if (isNaN(myWidth) || myWidth <= 0) {
				// Get height differently depending on the browser used
				myWidth = tinymce.Env.ie ? body.scrollWidth : (tinymce.Env.webkit && body.clientWidth === 0 ? 0 : body.offsetWidth);
			}

			// Don't make it smaller than the minimum width
			if (!settings.autoresize_min_width || myWidth > settings.autoresize_min_width) {
				newWidth = myWidth;
			}

			// If a maximum width has been defined don't exceed this width
			if (settings.autoresize_max_width && myWidth > settings.autoresize_max_width) {
				newWidth = settings.autoresize_max_width;
				body.style.overflowY = "auto";
				editor.fire('AutoresizeReachMaxWidth');
			} else {
				body.style.overflowY = "hidden";
				body.scrollTop = 0;
			}
			
			if (resizeContent) {
				newWidth = settings.autoresize_max_width;
				body.style.overflowY = "auto";
			}
			
			// Resize content element
			if (newWidth !== oldWidth || force) {
				deltaSize = newWidth - oldWidth;
				resizeWidth(newWidth);
			}
		}
		
		if (direction == 'both' || direction == 'height') {
			newHeight = settings.autoresize_min_height;
			
			marginTop = editor.dom.getStyle(body, 'margin-top', true);
			marginBottom = editor.dom.getStyle(body, 'margin-bottom', true);
			paddingTop = editor.dom.getStyle(body, 'padding-top', true);
			paddingBottom = editor.dom.getStyle(body, 'padding-bottom', true);
			borderTop = editor.dom.getStyle(body, 'border-top-width', true);
			borderBottom = editor.dom.getStyle(body, 'border-bottom-width', true);
			myHeight = body.offsetHeight + parseInt(marginTop, 10) + parseInt(marginBottom, 10) +
				parseInt(paddingTop, 10) + parseInt(paddingBottom, 10) +
				parseInt(borderTop, 10) + parseInt(borderBottom, 10);
				
			// Make sure we have a valid height
			if (isNaN(myHeight) || myHeight <= 0) {
				// Get height differently depending on the browser used
				myHeight = tinymce.Env.ie ? body.scrollHeight : (tinymce.Env.webkit && body.clientHeight === 0 ? 0 : body.offsetHeight);
			}	

			// Don't make it smaller than the minimum height
			if (!settings.autoresize_min_height || myHeight > settings.autoresize_min_height) {
				newHeight = myHeight;
			}

			// If a maximum height has been defined don't exceed this height
			if (settings.autoresize_max_height && myHeight > settings.autoresize_max_height) {
				newHeight = settings.autoresize_max_height;
				body.style.overflowY = "auto";
			} else {
				body.style.overflowY = "hidden";
				body.scrollTop = 0;
			}
			
			// Resize content element
			if (newHeight !== oldSize || force) {
				fixLineHeight(newHeight);
				
				deltaSize = newHeight - oldSize;
				DOM.setStyle(editor.iframeElement, 'height', newHeight + 'px');
				oldSize = newHeight;
				resized = true;
			}
		}
	}
	
	function resizeWidth(newWidth) {
		editor.dom.setStyle(editor.iframeElement, 'width', newWidth + 'px');
		editor.dom.setStyle(editor.editorContainer, 'width', newWidth + 'px');
		oldWidth = newWidth;
		resized = true;
	}
	
	function resizeEnd() {
		var body = editor.getDoc().body;
		var bodyWidth = parseInt(getComputedStyle(body).width.replace('px', ''), 10);
		var calculatedWidth = rabbit.temp.text2.calculateWidth(editor.getDoc().body.childNodes, bodyWidth);
		
		if (bodyWidth < calculatedWidth) {
			editor.getDoc().body.style.width = calculatedWidth + 'px';
			resizeWidth(calculatedWidth);
			editor.fire('BlockAutoresize');
		} else if (bodyWidth > calculatedWidth) {
			editor.getDoc().body.style.width = 'auto';
			editor.settings.direction = 'both';
			editor.settings.autoresize_min_width = null;
			editor.settings.autoresize_min_height = null;
			resize({}, true);
			editor.fire('UnblockAutoresize');
		} else {
			editor.settings.direction = 'height';
			editor.fire('BlockAutoresize');
		}
	}
	
	function fixLineHeight(height) {
		if (!_.isNumber(height)) {
			resize();
			// Force to set line height because it's not sure that resize() will do it.
			if (editor.dom.getStyle(editor.iframeElement, 'height') == '17px') {
				height = 17;
			} else {
				return ;
			}
		}
		
		// Strange fix for a strange bug... #3987
		if (height <= 17) {
			$(editor.getBody()).css('line-height', '17px');
		} else {
			$(editor.getBody()).css('line-height', 'normal');
		}
	}
	
	function pausePlugin() {
		$(editor.getDoc().body).removeClass('fixed');
		pause = true;
	}
	
	function resumePlugin() {
		pause = false;
	}
	
	function keydown() {
		if (direction == 'both' || direction == 'width') {
			var newWidth = editor.dom.getSize(editor.iframeElement).w + 20;
			if (settings.autoresize_max_width && settings.autoresize_max_width > newWidth) {
				editor.dom.setStyle(editor.iframeElement, 'width', (newWidth) + 'px');
			}
		}
	}
	
	/**
	 * Calls the resize x times in 100ms intervals. We can't wait for load events since
	 * the CSS files might load async.
	 */
	function wait(times, interval, callback) {
		setTimeout(function() {
			resize({});

			if (times--) {
				wait(times, interval, callback);
			} else if (callback) {
				callback();
			}
		}, interval);
	}

	// Define minimum height
	settings.autoresize_min_height = parseInt(editor.getParam('autoresize_min_height', editor.getElement().offsetHeight), 10);
	settings.autoresize_min_width = parseInt(editor.getParam('autoresize_min_width', editor.getElement().offsetWidth), 10);

	// Define maximum height
	settings.autoresize_max_height = parseInt(editor.getParam('autoresize_max_height', 0), 10);
	settings.autoresize_max_width = parseInt(editor.getParam('autoresize_max_width', 0), 10);

	// Add appropriate listeners for resizing content area
	editor.on("nodechange setcontent keyup", resize);
	editor.on("keydown", keydown);
	editor.on("hide", pausePlugin);
	editor.on("show", resumePlugin);
	editor.on("show", fixLineHeight);
	editor.on("ResizeEnd", resizeEnd);

	if (editor.getParam('autoresize_on_init', true)) {
		editor.on('init', function() {
			// Hit it 20 times in 100 ms intervals
			wait(20, 100, function() {
				// Hit it 5 times in 1 sec intervals
				wait(5, 1000);
			});
		});
	}

	// Register the command so that it can be invoked by using tinyMCE.activeEditor.execCommand('mceExample');
	editor.addCommand('mceAutoResize', resize);
});
