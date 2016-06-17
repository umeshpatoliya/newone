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
tinymce.PluginManager.add('pidoco.link', function(editor) {
	
	editor.addButton('link', {
		type: 'target',
		icon: 'link',
		shortcut: 'Ctrl+K',
		onPostRender: function() {
			var ctrl = this;
			var selfSelect = false;
			var choosingUrl = false;
		
			editor.on('show', function() {
				var data = rabbit.data.folder.getTreeOfFoldersAndPages(false, false);
				ctrl.setData(data);
			});
			
			var bindSelectorChanged = function() {
				var contentDocument = editor.iframeElement.contentDocument || editor.iframeElement.contentWindow.document;
				// This listener needs to be fire before new selection
				$(contentDocument.body).on('mousedown', function() {
					if (choosingUrl) {
						var value = ctrl.getValue();
						var isNodeSelected = ctrl.getIsNodeSelected();
						confirmUrl(value, isNodeSelected);
						choosingUrl = false;
					}
				});
				
				editor.on('SelectionChange', function(state) {
					var selectedElm = editor.selection.getNode();
					var anchorElm = editor.dom.getParent(selectedElm, 'a[href]');

					// When no link is found, look deeper if the whole text is not a link.
					if (!anchorElm) {
						var linkNode = selectedElm.querySelector('a');
						if (linkNode && linkNode.textContent == selectedElm.textContent) {
							anchorElm = linkNode;
						}
					}
					
					if (anchorElm) {
						var value = anchorElm.getAttribute('href');
						var isNodeSelected = anchorElm.getAttribute('data-is-node-selected') === "true";
						selfSelect = true;
						ctrl.setValue(value, isNodeSelected);
					} else if (document.activeElement && document.activeElement.id != 'hiddenUnfocusHelper') {
						// Do not clear value when closing editor, because we need it to maybe apply the current writen url.
						selfSelect = false;
						ctrl.clearValue();
					}
				}, true);
			};
			
			editor.on('apply', function() {
				var value = ctrl.getValue();
				var isNodeSelected = ctrl.getIsNodeSelected();
				confirmUrl(value, isNodeSelected);
				choosingUrl = false;
			});
			
			ctrl.on('focus', function(event){
				value = null;
				isNodeSelected = null;
				choosingUrl = true;
			});
			
			ctrl.on('cancel', function(event){
				choosingUrl = false;
				selfSelect = false;
			});
			
			ctrl.on('confirm', function(event){
				if (!selfSelect) {
					confirmUrl(event.value, event.isNodeSelected);
				}
				selfSelect = false;
				choosingUrl = false;
			});
			
			var confirmUrl = function (value, isNodeSelected) {
				if (!value) {
					return ;
				}
				
				if (selfSelect) {
					selfSelect = false;
					return ;
				}
				
				function isOnlyTextSelected(anchorElm) {
					var html = selection.getContent();

					// Partial html and not a fully selected anchor element
					if (/</.test(html) && (!/^<a [^>]+>[^<]+<\/a>$/.test(html) || html.indexOf('href=') == -1)) {
						return false;
					}

					if (anchorElm) {
						var nodes = anchorElm.childNodes, i;

						if (nodes.length === 0) {
							return false;
						}

						for (i = nodes.length - 1; i >= 0; i--) {
							if (nodes[i].nodeType != 3) {
								return false;
							}
						}
					}

					return true;
				}
				
				var selection = editor.selection;
				var dom = editor.dom;
				var selectedElm = selection.getNode();
				
				var anchorElm;
				var span;
				
				anchorElm = dom.getParent(selectedElm, 'a[href]');
				
				var onlyText = isOnlyTextSelected();
				var text = selection.getContent({format: 'text'});
				
				if (text === '') {
					selectionDomRangeObject  = selection.getRng();
					if (selectionDomRangeObject.expand) {
						selectionDomRangeObject.expand('word');
						selection.setRng(selectionDomRangeObject);
						text = selection.getContent({format: 'text'});
					}
				}
				
				var linkAttrs = {
					href: value,
					'data-is-node-selected': isNodeSelected
				};

				if (anchorElm) {
					var isUnderlined = $(anchorElm).closest('.underline').length > 0;
					if (!isUnderlined) {
						var newAnchorElm = dom.clone(anchorElm, true);
						dom.setAttribs(newAnchorElm, linkAttrs);
						span = dom.createFragment(dom.createHTML('span', {'class': 'underline'}, newAnchorElm.outerHTML));
						dom.replace(span, anchorElm, false);
					} else {
						dom.setAttribs(anchorElm, linkAttrs);
					}
					editor.undoManager.add();
				} else {
					if (onlyText) {
						var attributes = {};
						if (text == selectedElm.innerText) {
							for (var i = 0; i < selectedElm.attributes.length; i++) {
								var attribute = selectedElm.attributes[i];
								attributes[attribute.name] = attribute.value;
							}
						}
					
						if (attributes['class']) {
							attributes['class'] += ' underline';
						} else {
							attributes['class'] = 'underline';
						}
					
						var content = dom.createHTML('a', linkAttrs, dom.encode(text));
						span = dom.createHTML('span', attributes, content);
						editor.insertContent(span, {skip_focus: false});
					} else {
						linkAttrs['class'] = 'underline';
						editor.execCommand('mceInsertLink', false, linkAttrs);
					}
				}
			};
			
			editor.on('init', bindSelectorChanged);
		}
	});

	editor.addButton('unlink', {
		icon: 'unlink',
		tooltip: 'Remove link',
		cmd: 'unlink',
		classes: 'remove-link widget btn',
		stateSelector: 'a[href]'
	});
});
