// based on /ProcessWire/wire/modules/Inputfield/InputfieldTinyMCE/plugins/pwlink/plugin.js
$(document).ready(function() {
    function pwTinyMCE_link(opener) {
        var $ = jQuery;

        var $existingLink = $($(opener).siblings('.InputfieldAssistedUrlText').find('.InputfieldAssistedURLInput').val());

        var $iframe; // set after modalSettings
        var selection = "Title";
        var node = $existingLink;
        var nodeName = "A";
        var selectionText = "Title";
        var selectionHtml = "";

        var labels = {
            insertLink: 'Insert',
            cancel: 'Cancel'
        };

        function getPageId() {
            var $in = jQuery("#Inputfield_id");
            var pageId;
            if($in.length) {
                pageId = $in.val();
            } else {
                pageId = $("#" + editor.id).closest('.Inputfield').attr('data-pid');
            }
            return pageId;
        }

        // action when insert link button is clicked
        function clickInsert($iframe) {

            var $i = $iframe.contents();
            var $a = $($('#link_markup', $i).text());

            if($a.attr('href') && $a.attr('href').length) {
                $(opener).siblings('.InputfieldAssistedUrlText').find('.InputfieldAssistedURLInput').val($a[0].outerHTML);
            }

            $iframe.dialog('close');
        }

        function buildModalUrl($existingLink) {

            var $textarea = jQuery('#' + "_some_id"); // get textarea of this instance
            var $langWrapper = $textarea.closest('.LanguageSupport');
            var modalUrl = ProcessWire.config.urls.admin + 'page/link/?modal=1&id=' + getPageId();
            var n;

            if($langWrapper.length) {
                // multi-language field
                modalUrl += '&lang=' + $langWrapper.data('language');
            } else {
                // multi-language field in Table
                $langWrapper = $textarea.parents('.InputfieldTable_langTabs').find('li.ui-state-active a')
                if($langWrapper.length && typeof $langWrapper.data('lang') !== 'undefined') {
                    modalUrl += '&lang=' + $langWrapper.data('lang');
                } else if(jQuery('#pw-edit-lang').length) {
                    modalUrl += '&lang=' + $('#pw-edit-lang').val(); // front-end editor
                }
            }

            if($existingLink != null) {
                var attrs = ['href', 'title', 'class', 'rel', 'target'];
                for(n = 0; n < attrs.length; n++) {
                    var val = $existingLink.attr(attrs[n]);
                    if(val && val.length) modalUrl += '&' + attrs[n] + '=' + encodeURIComponent(val);
                }
            }

            // set link text
            var linkText = ($existingLink && $existingLink.text().length) ? $existingLink.text() : selectionText;

            if(linkText.length) {
                modalUrl += '&text=' + encodeURIComponent(linkText);
            }

            return modalUrl;
        }

        function buildModalSettings() {
            return {
                title: "<i class='fa fa-link'></i> " + labels.insertLink,
                open: function() {
                    /*
                    if($(".cke_maximized").length > 0) {
                        // the following is required when CKE is maximized to make sure dialog is on top of it
                        $('.ui-dialog').css('z-index', 9999);
                        $('.ui-widget-overlay').css('z-index', 9998);
                    }
                     */
                },
                buttons: [{
                    'class': "pw_link_submit_insert",
                    'html': "<i class='fa fa-link'></i> " + labels.insertLink,
                    'click': function() {
                        clickInsert($iframe);
                    }
                }, {
                    'html': "<i class='fa fa-times-circle'></i> " + labels.cancel,
                    'click': function() {
                        $iframe.dialog('close');
                    },
                    'class': 'ui-priority-secondary'
                }]
            };
        }

        function iframeLoad($iframe) {
            var $i = $iframe.contents();
            $i.find('#ProcessPageEditLinkForm').data('iframe', $iframe);

            // capture enter key in main URL text input
            $('#link_page_url_input', $i).on('keydown', function(event) {
                var $this = $(this);
                var val = $this.val();
                val = typeof val == 'string' ? val.trim() : '';
                if(event.keyCode == 13) {
                    event.preventDefault();
                    if(val.length > 0) clickInsert($iframe);
                    return false;
                }
            });
        }

        function init() {
            var $existingLink = null;

            if(nodeName === 'A') {
                // existing link
                $existingLink = node;
            } else {
                // new link
            }

            // settings for modal window
            var modalUrl = buildModalUrl($existingLink);
            var modalSettings = buildModalSettings();

            // create modal window
            $iframe = pwModalWindow(modalUrl, modalSettings, 'medium');

            // modal window load event
            $iframe.on('load', function() { iframeLoad($iframe) });
        }

        init();
    }

	$(document).on("click", ".InputfieldAssistedURLOpen", function(e) {
        pwTinyMCE_link(e.currentTarget);
        $(this).removeClass('ui-state-active');
        return false;
	});

    function loadIframeLinkPicker(opener) {

        var pageID = $(opener).attr('data-page-id');

        // build the modal URL
        var modalUrl = config.urls.admin + 'page/link/?id=' + pageID + '&modal=1';

        // labels
        var insertLinkLabel = ProcessWire.config.InputfieldCKEditor.pwlink.label;
        var cancelLabel = ProcessWire.config.InputfieldCKEditor.pwlink.cancel;
        var $iframe; // set after modalSettings down

        // action when insert link button is clicked
        function clickInsert() {

            var $i = $iframe.contents();
            var $a = $($("#link_markup", $i).text());

            $(opener).siblings('.InputfieldAssistedUrlText').find('.InputfieldAssistedURLInput').val($a.attr('href'));

            $iframe.dialog("close");
        }

        // settings for modal window
        var modalSettings = {
            title: "<i class='fa fa-link'></i> " + insertLinkLabel,
            open: function() {
                //if($(".cke_maximized").length > 0) {
                //    // the following is required when CKE is maximized to make sure dialog is on top of it
                //    $('.ui-dialog').css('z-index', 9999);
                //    $('.ui-widget-overlay').css('z-index', 9998);
                //}
            },
            buttons: [ {
                class: "pw_link_submit_insert",
                html: "<i class='fa fa-link'></i> " + insertLinkLabel,
                click: clickInsert
            }, {
                html: "<i class='fa fa-times-circle'></i> " + cancelLabel,
                click: function() { $iframe.dialog("close"); },
                class: 'ui-priority-secondary'
            }
            ]
        };

        // create modal window
        var $iframe = pwModalWindow(modalUrl, modalSettings, 'medium');

        // modal window load event
        $iframe.load(function() {

            var $i = $iframe.contents();
            $i.find("#ProcessPageEditLinkForm").data('iframe', $iframe);

            // remove tab navigation
            $i.find('#breadcrumbs').remove();
            $i.find('#PageEditLinkTabs').hide();

            // hide generated link code
            $i.find('#link_markup').hide();

            // capture enter key in main URL text input
            $("#link_page_url", $i).keydown(function(event) {
                var $this = $(this);
                var val = $.trim($this.val());
                if (event.keyCode == 13) {
                    event.preventDefault();
                    if(val.length > 0) clickInsert();
                    return false;
                }
            });

        }); // load

    } // loadIframeLinkPicker

});
