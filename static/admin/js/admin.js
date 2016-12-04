// Users View
function reload_setup(msg){
	$.ajax({
		url: reload,
		method: 'POST',
		beforeSend: function(xhr){
			xhr.setRequestHeader("X-CSRFToken", csrf_token);
		}
	}).done(function(html){
		if(html.redirect)
			window.location.href = html.redirect;
		else{
			$('#users-setup').children().remove();
			$('#users-setup').append(html);

			if(msg != null)
				$('#invitation-error').text(msg);
		}

	});
}

function users(){
	/*if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && $this.attr('setup-action') =='users') {
		$('.asd').click(function(){
			touched = $(this);
			$(this).addClass('setup-user-row-expand-rsp');
		});
		$(window).on('click', function(e){
			console.log(touched);
			if(!(touched.is(e.target) || touched.children().is(e.target))){
				touched.removeClass('setup-user-row-expand-rsp');
			}
		});
	}*/
	$('.setup-view-box').click(function(){
		window.location.href = $(this).attr('data-target');
	});
	$('.setup-delete-box').click(function(){
		$('#modal-user-img').css('background-image', 'url(' + $(this).attr('user-img') + ')');
		$('#modal-user-name').text($(this).attr('user-full-name'));
		$('#modal-user-count').text($(this).attr('user-count'));
		$('#modal-confirm').attr('user-id', $(this).attr('user-id'));
		$('#modal-delete-confirm').removeClass('modal-hidden').addClass('modal-visible');
		$('#modal-curtain').removeClass('curtain-hidden').addClass('curtain-visible');
	});
	$('.setup-delete-invitation-box').click(function(){
		$.ajax({
			url: remove.replace('999', $(this).attr('user-id')),
			type: 'GET',
		}).done(function(){
			reload_setup();
		});
	});
	$('#modal-cancel').click(function(){
		$('#modal-delete-confirm').addClass('modal-hidden').removeClass('modal-visible');
		$('#modal-curtain').addClass('curtain-hidden').removeClass('curtain-visible');
	});
	$('#modal-confirm').click(function(){
		$.ajax({
			url: remove.replace('999', $(this).attr('user-id')),
			type: 'GET',
		}).done(function(){
			reload_setup();
		});
	});
	$('.setup-block-box').click(function(){
		$.ajax({
			url: block.replace('999', $(this).attr('user-id')),
			type: 'GET',
		}).done(function(){
			reload_setup();
		});
	});
	$('.setup-unblock-box').click(function(){
		$.ajax({
			url: unblock.replace('999', $(this).attr('user-id')),
			type: 'GET',
		}).done(function(){
			reload_setup();
		});
	});
	$('.setup-forward-box').click(function(){
		$.ajax({
			url: invitation,
			type: 'POST',
			data: {'email': $(this).attr('user-email')},
			beforeSend: function(xhr){
				xhr.setRequestHeader("X-CSRFToken", csrf_token);

				$('.setup-forward-box').children().removeClass('fa fa-mail-forward').addClass('fa fa-repeat');
				$('.setup-forward-box').attr("disabled", true);
			}
		}).done(function(){
			reload_setup();
		});
	});
	$('#invitation-form').submit(function(e){
		$.ajax({
			url: invitation,
			type: 'POST',
			data: $(this).serialize(),
			beforeSend: function(xhr){
				xhr.setRequestHeader("X-CSRFToken", csrf_token);
				e.preventDefault();

				if($('#email-invitation').val().length <= 0)	// Abort if email is empty
					xhr.abort();
				else {
					$('#submit-invitation').val("Enviando...").attr("disabled", true);
					$('#invitation-error').text("");
				}
			}
		}).done(function(data){
			reload_setup(data['message']);
		});
	});
}

// Areas View
function reload_area_setup(msg){
	$.ajax({
		url: reload,
		method: 'POST',
		beforeSend: function(xhr){
			xhr.setRequestHeader("X-CSRFToken", csrf_token);
		}
	}).done(function(html){
		if(html.redirect)
			window.location.href = html.redirect;
		else{
			$('#areas-setup').children().remove();
			$('#areas-setup').append(html);

			if(msg != null)
				$('#add-area-error').text(msg);
		}

	});
}

function areas(){
	/*if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && $this.attr('setup-action') =='users') {
	 $('.asd').click(function(){
	 touched = $(this);
	 $(this).addClass('setup-user-row-expand-rsp');
	 });
	 $(window).on('click', function(e){
	 console.log(touched);
	 if(!(touched.is(e.target) || touched.children().is(e.target))){
	 touched.removeClass('setup-user-row-expand-rsp');
	 }
	 });
	 }*/
	$('.setup-delete-box').click(function(){
		$('#modal-delete-confirm #modal-area-name').text($(this).attr('area-name'));
		$('#modal-delete-confirm #modal-confirm').attr('area-id', $(this).attr('area-id'));
		$('#modal-delete-confirm').removeClass('modal-hidden').addClass('modal-visible');
		$('#modal-curtain').removeClass('curtain-hidden').addClass('curtain-visible');
	});
    $('.setup-edit-box').click(function(){
        $('#modal-edit-confirm #modal-confirm').attr('area-id', $(this).attr('area-id'));
        $('#modal-edit-confirm #modal-confirm').attr('area-name', $(this).attr('area-name'));
        $('#modal-edit-confirm #modal-area-name').val($(this).attr('area-name'));
        $('#modal-edit-confirm').removeClass('modal-hidden').addClass('modal-visible');
        $('#modal-curtain').removeClass('curtain-hidden').addClass('curtain-visible');
        $('#modal-edit-confirm #modal-error').text("");
    });
	$('#modal-delete-confirm #modal-cancel').click(function(){
		$('#modal-delete-confirm').addClass('modal-hidden').removeClass('modal-visible');
		$('#modal-curtain').addClass('curtain-hidden').removeClass('curtain-visible');
	});
	$('#modal-edit-confirm #modal-cancel').click(function(){
        $('#modal-edit-confirm').addClass('modal-hidden').removeClass('modal-visible');
        $('#modal-curtain').addClass('curtain-hidden').removeClass('curtain-visible');
    });
	$('#modal-delete-confirm #modal-confirm').click(function(){
		$.ajax({
			url: remove.replace('999', $(this).attr('area-id')),
			type: 'GET'
		}).done(function(){
			reload_area_setup();
		});
	});
    $('#modal-edit-confirm #modal-confirm').click(function(){
        $.ajax({
            url: edit.replace('999', $(this).attr('area-id')),
            type: 'POST',
            data: {'name': $('#modal-edit-confirm #modal-area-name').val()},
            beforeSend: function(xhr){
                xhr.setRequestHeader("X-CSRFToken", csrf_token);

                if($('#modal-edit-confirm #modal-area-name').val().length <= 0) {	// Abort if name is empty
                    xhr.abort();
                    $('#modal-edit-confirm #modal-error').text("El nombre del área no puede estar vacío");
                }
                else if($('#modal-edit-confirm #modal-area-name').val() == $('#modal-edit-confirm #modal-confirm').attr('area-name')){	// Abort if no changes were made
                    xhr.abort();
                    $('#modal-edit-confirm #modal-error').text("No ha hecho ningún cambio");
				}
                else {
                    $('#modal-edit-confirm #modal-error').text("");
                }
            }
        }).done(function(){
            reload_area_setup();
        });
    });
	$('#add-area-form').submit(function(e){
		$.ajax({
			url: reload,
			type: 'POST',
			data: $(this).serialize(),
			beforeSend: function(xhr){
				xhr.setRequestHeader("X-CSRFToken", csrf_token);
				e.preventDefault();

				if($('#add-area-name').val().length <= 0)	// Abort if email is empty
					xhr.abort();
				else {
					$('#add-area-submit').val("Agregando...").attr("disabled", true);
					$('#add-area-error').text("");
				}
			}
		}).done(function(data){
			reload_area_setup(data['message']);
		});
	});
}

// Webpage View
function reload_webpage_setup(id){
	$.ajax({
		url: reload,
		method: 'POST',
		data: {'id': id},
		beforeSend: function(xhr){
			xhr.setRequestHeader("X-CSRFToken", csrf_token);
		}
	}).done(function(html){
		if(html.redirect)
			window.location.href = html.redirect;
		else{
			// Remove TinyMCE Editor instances
			tinymce.execCommand('mceRemoveEditor', true, 'spanish-title-edit');
			tinymce.execCommand('mceRemoveEditor', true, 'spanish-body-edit');
			tinymce.execCommand('mceRemoveEditor', true, 'english-title-edit');
			tinymce.execCommand('mceRemoveEditor', true, 'english-body-edit');

			$('#webpage-setup').children().remove();
			$('#webpage-setup').append(html);
		}
	});
}

function webpage(){
	var imgIndex = 0;
	var src = '';
	/*if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && $this.attr('setup-action') =='users') {
	 $('.asd').click(function(){
	 touched = $(this);
	 $(this).addClass('setup-user-row-expand-rsp');
	 });
	 $(window).on('click', function(e){
	 console.log(touched);
	 if(!(touched.is(e.target) || touched.children().is(e.target))){
	 touched.removeClass('setup-user-row-expand-rsp');
	 }
	 });
	 }*/
	$('.body').bind('scroll', function(){
		if ($('.body').scrollTop() > 123.421875 && $(document).width() > 1100){
            var parent = $('.editor-box');
            var width = parent.css('width').replace('px', '') - 2;
			$('.setup-webpage-list').addClass('fixed');
            $('.setup-webpage-list').css('width', width);
			$(this).css('z-index', '100');

            $(window).resize(function(){
                var parent = $('.editor-box');
                var width = parent.css('width').replace('px', '') - 2;
                $('.setup-webpage-list').css('width', width);
            });
		}
		else{
            $(window).unbind('resize');
			$('.setup-webpage-list').removeClass('fixed');
            $('.setup-webpage-list').css('width', '110%');
			$(this).css('z-index', '');
		}
	});

	$('#spanish-edit-box').click(function(){
		tinyMCE.get('spanish-title-edit').setMode('design');
		tinyMCE.get('spanish-body-edit').setMode('design');
		$(this).parent(0).addClass('setup-hidden');
		$('#spanish-accept-box').parent(0).removeClass('setup-hidden');
		$('#spanish-cancel-box').parent(0).removeClass('setup-hidden');
	});

	$('#english-edit-box').click(function(){
		tinyMCE.get('english-title-edit').setMode('design');
		tinyMCE.get('english-body-edit').setMode('design');
		$(this).parent(0).addClass('setup-hidden');
		$('#english-accept-box').parent(0).removeClass('setup-hidden');
		$('#english-cancel-box').parent(0).removeClass('setup-hidden');
	});

	$('#spanish-accept-box').click(function(){
		var spanish_title_edit = tinyMCE.get('spanish-title-edit');
		var spanish_body_edit = tinyMCE.get('spanish-body-edit');

		spanish_title_edit.setMode('readonly');
		spanish_body_edit.setMode('readonly');
        $('#modal-curtain').removeClass('curtain-hidden').addClass('curtain-visible');

        var submitContent = function(urls){
        	if(urls != null){
                var images = $('#spanish-body-edit_ifr').contents().find('img[image-id]');
                images.each(function(i, image){
                    var url = urls[$(image).attr('image-id')];
                    $(image).attr('src', url);
                    $(image).attr('data-mce-src', url);
                    $(image).attr('image-id', null);
                });
			}

            $.ajax({
                url: edit.replace('999', $('#spanish-accept-box').attr('section-id')),
                method: 'POST',
                data: {
                    'spanish-title': spanish_title_edit.getContent(),
                    'spanish-body': spanish_body_edit.getContent()
                },
                beforeSend: function(xhr){
                    xhr.setRequestHeader("X-CSRFToken", csrf_token);
                }
            }).done(function(html){
                if(html.redirect)
                    window.location.href = html.redirect;
                else{
                    $('#spanish-edit-box').parent(0).removeClass('setup-hidden');
                    $('#spanish-accept-box').parent(0).addClass('setup-hidden');
                    $('#spanish-cancel-box').parent(0).addClass('setup-hidden');
                    $('#modal-curtain').removeClass('curtain-visible').addClass('curtain-hidden');
                }
            });
        };

        // Get editor new images
        var images = $('#spanish-body-edit_ifr').contents().find('img[image-id]');
        submitSectionImages(images, submitContent, $(this).attr('section-id'), spanish_title_edit, spanish_body_edit);
	});

	$('#spanish-cancel-box').click(function(){
		var spanish_title_edit = tinyMCE.get('spanish-title-edit');
		var spanish_body_edit = tinyMCE.get('spanish-body-edit');

		spanish_title_edit.getBody().innerHTML = spanish_title_edit.startContent;
		spanish_body_edit.getBody().innerHTML = spanish_body_edit.startContent;
		spanish_title_edit.setMode('readonly');
		spanish_body_edit.setMode('readonly');

		$('#spanish-edit-box').parent(0).removeClass('setup-hidden');
		$('#spanish-accept-box').parent(0).addClass('setup-hidden');
		$('#spanish-cancel-box').parent(0).addClass('setup-hidden');
	});

	$('#english-accept-box').click(function(){
		var english_title_edit = tinyMCE.get('english-title-edit');
		var english_body_edit = tinyMCE.get('english-body-edit');

		english_title_edit.setMode('readonly');
		english_body_edit.setMode('readonly');
        $('#modal-curtain').removeClass('curtain-hidden').addClass('curtain-visible');

        var submitContent = function(urls){
            if(urls != null){
                var images = $('#english-body-edit_ifr').contents().find('img[image-id]');
                images.each(function(i, image){
                    var url = urls[$(image).attr('image-id')];
                    $(image).attr('src', url);
                    $(image).attr('data-mce-src', url);
                    $(image).attr('image-id', null);
                });
            }

            $.ajax({
                url: edit.replace('999', $(this).attr('section-id')),
                method: 'POST',
                data: {
                    'english-title': english_title_edit.getContent(),
                    'english-body': english_body_edit.getContent()
                },
                beforeSend: function(xhr){
                    xhr.setRequestHeader("X-CSRFToken", csrf_token);
                }
            }).done(function(html){
                if(html.redirect)
                    window.location.href = html.redirect;
                else{
                    $('#english-edit-box').parent(0).removeClass('setup-hidden');
                    $('#english-accept-box').parent(0).addClass('setup-hidden');
                    $('#english-cancel-box').parent(0).addClass('setup-hidden');
                    $('#modal-curtain').removeClass('curtain-visible').addClass('curtain-hidden');
                }
            });
        };

        // Get editor new images
        var images = $('#english-body-edit_ifr').contents().find('img[image-id]');
        submitSectionImages(images, submitContent, $(this).attr('section-id'), english_title_edit, english_body_edit);
	});

	$('#english-cancel-box').click(function(){
		var english_title_edit = tinyMCE.get('english-title-edit');
		var english_body_edit = tinyMCE.get('english-body-edit');

		english_title_edit.getBody().innerHTML = english_title_edit.startContent;
		english_body_edit.getBody().innerHTML = english_body_edit.startContent;
		english_title_edit.setMode('readonly');
		english_body_edit.setMode('readonly');

		$('#english-edit-box').parent(0).removeClass('setup-hidden');
		$('#english-accept-box').parent(0).addClass('setup-hidden');
		$('#english-cancel-box').parent(0).addClass('setup-hidden');
	});

	/* TinyMCE Editors */
	// Title Editors
	$('#spanish-title-edit, #english-title-edit').tinymce({
		force_br_newlines : false,
		force_p_newlines : false,
		forced_root_block : 'h1',
		menubar: false,
		statusbar: false,
		content_css: tinymce_css,
		toolbar: 'undo redo | bold italic underline | alignleft aligncenter alignright outdent indent',
		readonly: true,
		language: current_lang,
		setup: function(ed){
			ed.on('loadContent', function(){    // Avoid to loose <h1> class when everything is deleted
				$(ed.getBody()).bind("DOMNodeInserted", function(e){
					var element = e.target;
					if(element.tagName == 'H1')
						$(element).addClass('c12');
				});
			})
		}
	});

	// Body Editors
	$('#spanish-body-edit, #english-body-edit').tinymce({
		height: 400,
		content_css: tinymce_css,
		plugins: [
			'advlist autolink lists link image charmap preview hr anchor pagebreak',
			'searchreplace wordcount visualblocks visualchars fullscreen',
			'insertdatetime media nonbreaking save table contextmenu directionality',
			'paste textcolor colorpicker textpattern imagetools'
		],
		toolbar1: 'insertfile undo redo | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist',
		toolbar2: 'outdent indent | link image | preview media | forecolor backcolor |',
		readonly: true,
		language: current_lang,
		setup: function(ed){
			ed.on('loadContent', function(){    // Avoid to loose <p> class when everything is deleted
				$(ed.getBody()).bind('DOMNodeInserted', function(e){
					var element = e.target;
					if(element.tagName == 'P')
						$(element).addClass('s3 c9');
					else if(element.tagName == 'IMG') {	// Identify new images
                        $(element).attr('src', src);
                        $(element).attr('image-id', imgIndex++);
                        src = '';
                    }
				});
			})
		},
        file_picker_callback: function(callback, value, meta){
            if(meta.filetype == 'image'){
            	if($(this).attr('id') == 'spanish-body-edit')
            		$('#spanishImageField').click();
            	else if($(this).attr('id') == 'english-body-edit')
                    $('#englishImageField').click();
            }
		}
	});
    $('#spanishImageField, #englishImageField').change(function(evt){
    	var field = $(this);
    	var input = evt.target;
        var id = $(this).attr('id');
        var closeButton = top.$('.mce-btn.mce-open').parent().find('.mce-textbox').closest('.mce-window').find('.mce-close');

        closeButton.click();
        $('#modal-curtain').removeClass('curtain-hidden').addClass('curtain-visible');

    	// Read image in base64 and insert it into editor
        var reader = new FileReader();
        reader.onloadend = function(){
            var img = $(new Image());
			src = reader.result;

            if(id == 'spanishImageField')
            	tinyMCE.get('spanish-body-edit').execCommand("mceInsertContent", false, img.get(0).outerHTML);
            else if(id == 'englishImageField')
                tinyMCE.get('english-body-edit').execCommand("mceInsertContent", false, img.get(0).outerHTML);

            field.val('');
            $('#modal-curtain').removeClass('curtain-visible').addClass('curtain-hidden');
        };

        reader.readAsDataURL(input.files[0]);
    });
}

function webpage_init(){
	/*if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && $this.attr('setup-action') =='users') {
	 $('.asd').click(function(){
	 touched = $(this);
	 $(this).addClass('setup-user-row-expand-rsp');
	 });
	 $(window).on('click', function(e){
	 console.log(touched);
	 if(!(touched.is(e.target) || touched.children().is(e.target))){
	 touched.removeClass('setup-user-row-expand-rsp');
	 }
	 });
	 }*/
	$('#section-select').change(function(){
		reload_webpage_setup(this.value);
	});
}

function submitSectionImages(images, submitContent, section_id, title_edit, body_edit){
    // Save images before save content
    if(images.length > 0){
        var form = new FormData();
        form.append('csrfmiddlewaretoken', csrf_token);
        form.append('section_id', section_id);

        var submitAJAX = function(){
            $.ajax({
                url: save_images_url,
                method: "POST",
                data: form,
                processData: false,
                contentType: false
            }).done(function(response){
                if(response.redirect)
                    window.location.href = response.redirect;
                else if(!response['error'])
                    submitContent(response['urls']);
                else{
                    $('#modal-curtain').removeClass('curtain-visible').addClass('curtain-hidden');
                    title_edit.setMode('design');
                    body_edit.setMode('design');
                }
            })
        };

        // Save images binary in form
        var counter = 0;
        images.each(function(i, image){
            getBlobFromURL(image.src, function(blob){	// Get blob object from url created by the editor
                form.append($(image).attr('image-id'), blob);
                counter++;

                if(counter == images.length)	// Submit only when all images are in form
                    submitAJAX();
            });
        });
    }
    else
        submitContent(null);
}

// Utilities
function getBlobFromURL(url, callback){
    var blob = null;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = "blob";	// force the HTTP response, response-type header to be blob
    xhr.onload = function(){
        blob = xhr.response;
        callback(blob);
    };

    xhr.send();
}

