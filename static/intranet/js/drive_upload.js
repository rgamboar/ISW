var monthNames = ["Ene.", "Feb.", "Mar.", "Abr.", "May", "Jun.", "Jul.", "Ago.", "Sep.", "Oct.", "No.v", "Dec."];
var bCrumbsCount = 0;
var doc_selected = {};
(function($){
	/* Resetea el input de archivos */
	$.fn.resetInput = function(){
		this.wrap('<form>').closest('form').get(0).reset();
		this.unwrap();
	};
})(jQuery);

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

//Para formatear Bytes a diferentes unidades.
//http://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript
function formatSizeUnits(bytes){
        if      (bytes>=1000000000) {bytes=(bytes/1000000000).toFixed(0)+' GB';}
        else if (bytes>=1000000)    {bytes=(bytes/1000000).toFixed(1)+' MB';}
        else if (bytes>=1000)       {bytes=(bytes/1000).toFixed(0)+' KB';}
        else if (bytes>1)           {bytes=bytes+' bytes';}
        else if (bytes==1)          {bytes=bytes+' byte';}
        else                        {bytes='0 byte';}
        return bytes;
}

//Le da formato a la fecha proporcionada por Google Drive.
function format_date(date){
	var date = new Date(date);
	var day = date.getDate();
	var month = monthNames[date.getMonth()];
	var year = date.getFullYear();
	return formated_date = day + ' ' + month + ' ' + year;
}

$(document).ready(function(){
	// Se define una altura inicial del cuadro con el boton 'mas' para que la animacion se vea
	$('.drive.plus').height($('.drive.plus').height());
})

// Previene que el formulario se envie.
$('.drive.form').submit(function(){
	return false;
});

//Envia la solicitud con en enlace a Google Drive
$('.link').change(function(){
	if($(this).val() != "")
		sendLink(link_analizer_link.replace('999', encodeURIComponent($(this).val())));
	//window.open("{% url 'link_analizer' '999' %}".replace('999', encodeURIComponent($(this).val())), '_blank');
});

// Cuando el boton 'mas' es presionado, se ocultan y eliminan algunos elementos con una animacion
$('.drive.btn').click(function(){
	$('.erasable').animate({
		top: '-10px',
		height: '0px',
		margin: '0px',
		padding: '0px',
		opacity: '0'
	}, 200, function(){
		$(this).remove();
	});
	userFiles();
});


function sendLink(url){
	// Se activa la barra de carga
	$('.loading').removeClass("hidden");
	// Se desactiva el campo de texto hasta obtener una respuesta
	$('.drive.link').prop("disabled", true);
	$.ajax({
		url: url,
		method: 'GET'
	}).done(function(response){
		$('.loading').addClass("hidden");
		$('.drive.link').prop("disabled", false);
		console.log(response);
		if(!response['error'])
			$('.message').html("");
		else
			$('.message').html(response['message']);
	});
}

function userFiles(folderId = "", name = "", bcId = 0){
	// Se activa la barra de carga
	$('.loading').removeClass("hidden");
	// Se desactiva el campo de texto hasta obtener una respuesta
	$('.drive.link').prop("disabled", true);
	$.ajax({
		url: user_files_link.replace('999', folderId),
		method: 'GET'
	}).done(function(response){
		console.log(response);
		if(!response['error']){
			// Se llama a la funcion userFilesHandler para mostrar la lista al usuario
			if (userFilesHandler(response['list'])){
				$('.loading').addClass("hidden");
				$('.drive.link').prop("disabled", false);
				// Mientras el boton + siga vivo:
				if($('.drive.btn').length){
					// Se hace desaparecer el boton con una animacion
					$('.drive.btn').animate({
						opacity: '0'
					}, 200, function(){
						// Una vez terminada la animacion se elimina el boton y se expande el cuadro
						$(this).remove();
						$('.drive.user').removeClass('hidden');
						$('.drive.plus').animate({
							height: $('.drive.user').height().toString() + 'px'
						}, 400);
					});
				}
				else{
					// Se expande el cuadro
					$('.drive.user').removeClass('hidden');
					$('.drive.plus').animate({
						height: $('.drive.user').height().toString() + 'px'
					}, 400);
				}
				if(name != ""){
					// Se agrega la miga de pan
					addBreadCrumb(folderId, name);
				}
				else if(bcId < bCrumbsCount){
					// Se remueven las migas de pan superiores a la id actual
					removeBreadCrumbs(bcId);
				}
			}
		}
		else
			$('.message').html(response['message']);
	});
}

// Se encarga de recibir la lista de archivos de Google drive y las muestra en pantalla, configurando todo lo necesario
function userFilesHandler(files){
	$('.drive.list').children().remove();
	template = [
			'<tr class="document" type="$type" title="$title" id="$id" $style size="$rawsize">',
				'<td class="check"> $checkbox </td>',
				'<td> <i class="fa fa-$icon" aria-hidden="true"></i> $name </td>',
				'<td>$date</td>',
				'<td class="size">$size</td>',
			'</tr>'];
	for(var i = 0; i < files.length; i++){
		code = template.join('');
		if(files[i]['isFolder']){
			code = code.replace(/\$icon/g, 'folder')
						.replace(/\$type/g, 'folder')
						.replace(/\$rawsize/g, '')
						.replace(/\$size/g, '-');
		}
		else{
			code = code.replace(/\$icon/g, 'file-pdf-o')
						.replace(/\$size/g, formatSizeUnits(parseInt(files[i]['fileSize'])))
						.replace(/\$rawsize/g, files[i]['fileSize'])
						.replace(/\$type/g, 'file');
		}

		// Si el archivo esta seleccionado, se pinta de verde
		if(files[i]['id'] in doc_selected){
			code = code.replace('$style', 'style="background-color: rgb(207, 234, 226);"')
						.replace('$checkbox', '<i class="fa fa-check" aria-hidden="true"></i>');
		}
		else
			code = code.replace("$style", "").replace('$checkbox', '');

		code = code.replace(/\$name/g, files[i]['title'])
				.replace(/\$date/g, format_date(files[i]['modifiedDate']))
				.replace(/\$id/g, files[i]['id'])
				.replace(/\$title/g, files[i]['title']);

		$('.drive.list').append(code);
	}

	// Se configuran los escucha
	$('.document').off(); // Se desactivan los anteriores
	$('.document').click(function(){
		// Si es una carpeta, se solicitan sus hijos
		if($(this).attr('type') == 'folder'){
			userFiles($(this).attr('id'),$(this).attr('title'))
		}
		else if($(this).attr('type') == 'file'){
			if($(this).attr('id') in doc_selected){
				// Si la id ya existe, se elimina
				delete doc_selected[$(this).attr('id')];
				$(this).css('background-color', 'transparent');
				$(this).children('.check').children().remove();
			}
			else{
				// Si el tamaño es mayor a 2 megabytes, no se permite la seleccion
				if(parseInt($(this).attr('size')) > 2097152){
					$(this).children('.size').css('background-color', '#f7cacd');
					var $this = $(this);
					setTimeout(function(){
						$this.children('.size').css('background-color', 'transparent');
					},500);
				}
				// Si la id no existe y es menor a 2 mb, se crea
				else{
					doc_selected[$(this).attr('id')] = $(this).attr('title');
					$(this).css('background-color', '#cfeae2');
					$(this).children('.check').append('<i class="fa fa-check" aria-hidden="true"></i>');
				}
			}
		}
	});
	return true;
}

function addBreadCrumb(folderId, name){
	code = [
		'<div class="crumbs step" bc-id="$id">',
			'<button onclick="userFiles($folderId, ``, $id)">$name</button>',
		'</div>',
	];

	code = code.join(' ').replace(/\$id/g, (++bCrumbsCount).toString()).replace('$folderId', "'" + folderId + "'").replace('$name', name);
	$('.drive.breadcrumbs').append(code);

	$('.crumbs.step[bc-id="' + bCrumbsCount + '"]').animate({
		left: '0px',
		opacity: '1'
	},200);
}

// Remueve todas las migas de pan que posean una id superior al parametro 'id' de la funcion
function removeBreadCrumbs(id){
	for(var i = bCrumbsCount; id < i; i--){
		$('.crumbs.step[bc-id="' + i + '"]').animate({
			left: '-7px',
			opacity: '0'
		},200, function(){
			$(this).remove();
		});
	}
}

/* Muestra en pantalla el formulario del documento */
function addDocument(key_count, filename, object){
	/* Plantilla para el idioma Espanol */
	if (current_lang == 'es'){
		var code = ['<div class="s1 c10 intranet box upload file wrapper animation enter down" doc-index="$index">',
					'<div class="c12 upload file head">',
						'<button class="upload delete" doc-index="$index"><i class="fa fa-times" aria-hidden="true"></i></button>',
					'</div>',
					'<div class="c12 upload file filename">',
						'<h3>$filename</h3>',
					'</div>',
					'<div class="c12 upload file field">',
						'<div class="c3">',
							'<strong>Titulo:</strong>' ,
						'</div>',
						'<div class="c9">',
							'<div class="upload crossrefWrapper">',
								'<input type="text" class="field text" value="$title" field-name="title" doc-index="$index" name="title$index" placeholder="Ej: Tesis de microbiologia" autocomplete="off" required>',
								//crossref
								'<div class="upload crossref hidden" doc-index="$index">',
									'<div class="upload records">',
										'<div class="upload records topbar">',
											// Cabecera del cuadro
											'<i class="upload fa fa-check" doc-index="$index" aria-hidden="true"></i>',
											'<i class="upload loader fa fa-circle-o-notch fa-spin fa-3x fa-fw" doc-index="$index"></i>',
											'<button doc-index="$index"><i class="fa fa-times" aria-hidden="true"></i></button>',
										'</div>',
										'<div class="upload records list">',
											'<ul class="upload records root" doc-index="$index">',
											//Lista de sugerencias
											'</ul>',
										'</div>',
									'</div>',
								'</div>',
							'</div>',

						'</div>',
					'</div>',
					'<div class="c12 upload file field">',
						'<div class="c3">',
							'<strong>Autor:</strong>' ,
						'</div>',
						'<div class="c9">',
							'<input type="text" class="field text" value="$author" name="author$index" placeholder="Ej: Juan Perez" required>',
						'</div>',
					'</div>',
					'<div class="c12 upload file field">',
						'<div class="c3">',
							'<strong>Fecha de creacion:</strong>',
						'</div>',
						'<div class="c9">',
							'<input type="date" class="field text" value="$date" name="date$index" required>',
						'</div>',
					'</div>',
					'<div class="c12 upload file field">',
						'<div class="c3">',
							'<strong>DOI:</strong>', 
						'</div>',
						'<div class="c9">',
							'<input type="text" class="field text" name="doi$index" placeholder="Ej: 10.1109/ms.2006.34" required>',
						'</div>',
					'</div>',
					'<div class="c12 upload file field">',
						'<div class="c3">',
							'<strong>ISSN:</strong> ',
						'</div>',
						'<div class="c9">',
							'<input type="text" class="field text" name="issn$index" placeholder="No requerido" required>',
						'</div>',
					'</div>',
					'<div class="c12 upload file field">',
						'<div class="c3">',
							'<strong>Páginas:</strong> ',
						'</div>',
						'<div class="c9">',
							'<input type="text" class="field text" name="pages$index" placeholder="No requerido" required>',
						'</div>',
					'</div>',
					'<div class="c12 upload file field">',
						'<div class="c3">',
							'<strong>Area:</strong> ',
						'</div>',
						'<div class="c9">',
							'<select name="category$index" class="field" required>',
								'<option value="" disabled selected>Selecciona una categoria</option>',
								'<option value="1">Microbiología Molecular</option>',
								'<option value="2">Biotecnología Ambiental</option>',
								'<option value="3">Bionanotecnología</option>',
								'<option value="4">Genómica Funcional y Proteómica</option>',
								'<option value="5">Síntesis de compuestos bioactivos y de interés biotecnológico</option>',
								'<option value="6">Biorremediación de Ambientes Contaminados</option>',
							'</select>',
						'</div>',
					'</div>',
					'<div class="c12 upload file field">',
						'<div class="c3">',
							'<strong>Privacidad:</strong> ',
						'</div>',
						'<div class="c9">',
							'<select class="type-select field" name="type$index" required>',
									'<option value="" disabled selected>Selecciona privacidad</option>',
									'<option value="0">Público</option>',
									'<option value="1">Privado</option>',
								'</select>',
						'</div>',
					'</div>',
				'</div>']
	}

	/* Plantilla para el idioma Ingles */ 
	else if (current_lang == 'en'){
		var code = ['<div class="document-frame animation-down" doc-index="$index">',
					'<div class="frame-header">',
						'<h5 class="frame-title">$filename</h5>',
						'<select class="type-select field" name="type$index" required>',
							'<option value="" disabled selected>' + gettext('Selecciona privacidad') + '</option>',
							'<option value="0">' + gettext('Público') + '</option>',
							'<option value="1">' + gettext('Privado') + '</option>',
						'</select>',
						'<button class="close-btn"  doc-index="$index"><i class="fa fa-times" aria-hidden="true"></i></button>',
						'<div class="clear"></div>',
					'</div>',
					'<ul class="frame-data">',
						'<li><strong>' + gettext('Titulo') + ':</strong> <input type="text" class="field" value="$title" field-name="title" name="title$index" doc-index="$index" placeholder="' + gettext('Ej: Tesis de microbiologia') + '" autocomplete="off" required><div class="crossref-wrapper hidden" doc-index="$index"><div class="loader hidden" doc-index="$index><img src="' + spinner_link + '"></div><div class="crossref-list-wrapper"><ul class="crossref-list" doc-index="$index"></ul></div></div></li>',
						'<li><strong>' + gettext('Autor') + ':</strong> <input type="text" class="field" value="$author" name="author$index" placeholder="' + gettext('Ej: Juan Perez') + '" required></li>',
						'<li><strong>' + gettext('Fecha de creación') + ':</strong> <input type="text" class="field" value="$date" name="date$index" placeholder="' + gettext('Ej: 2016-12-30') + '" required></li>',
						'<li><strong>ISSN:</strong><input type="text" class="field" name="issn$index" placeholder="No requerido"></li>',
						'<li><strong>DOI:</strong><input type="text" class="field" name="doi$index" placeholder="No requerido"></li>',
						'<li><strong>URL:</strong><input type="text" class="field" name="url$index" placeholder="ej: http://dx.doi.org/10.1109/ms.2006.34"></li>',
						'<li><strong>Paginas:</strong><input type="text" class="field" name="pages$index" placeholder="No requerido"></li>',
						'<li><strong>' + gettext('Area') + ':</strong>',
							'<select name="category$index" class="field form-select" required>',
								'<option value="" disabled selected>' + gettext('Selecciona una categoria') + '</option>',
								'<option value="1">' + gettext('Microbiología Molecular') + '</option>',
								'<option value="2">' + gettext('Biotecnología Ambiental') + '</option>',
								'<option value="3">' + gettext('Bionanotecnología') + '</option>',
								'<option value="4">' + gettext('Genómica Funcional y Proteómica') + '</option>',
								'<option value="5">' + gettext('Síntesis de compuestos bioactivos y de interés biotecnológico') + '</option>',
								'<option value="6">' + gettext('Biorremediación de Ambientes Contaminados') + '</option>',
							'</select>',
						'</li>',
					'</ul>',
				'</div>']
	}
	/* Se reemplazan las etiquetas por los Metadatos extraidos */
	code = code.join('')
		.replace(/\$index/g, key_count)
		.replace(/\$filename/g, filename)
		.replace(/\$title/g, object['Title'] ? object['Title']:'')
		.replace(/\$author/g, object['Author'] ? object['Author']:'')
		.replace(/\$date/g, object['CreationDate'] ? (object['CreationDate'].substr(2, 4) + '-' + object['CreationDate'].substr(6, 2) + '-' + object['CreationDate'].substr(8, 2) ):'');
	/* Se agrega al frontend */
	$('#form').append(code);
	/* Se realiza la primera consulta a crossref */
	crossref_query(object['Title'] ? object['Title']:'', key_count, false);

	/* Se evita la accion del boton Enter */
	$('#form').off();
	$('#form').keydown(function(e){
		if(event.keyCode == 13) {
		  event.preventDefault();
		  return false;
		}
	});

	/* Se configura la accion del boton Cruz */
	$('.upload.delete').off();
	$('.upload.delete').click(function(e){
		e.preventDefault();
		hideElement('.file[doc-index="' + $(this).attr('doc-index') + '"]', true);
		console.log('.file[doc-index="' + $(this).attr('doc-index') + '"]');
		delete files[$(this).attr('doc-index')];
		checkFilesSize();
		if(Object.size(files) == 0)
			$('#local-submit').prop('disabled', true).addClass('disabled');
	});

	// Se activa crossref
	enableCrossref("class");
}

function crossref_query(query, doc_id, open = true){
	// Se muestra el icono que gira y se remueve el check
	$('.upload.fa-check[doc-index="' + doc_id +'"]').addClass('hidden');
	$('.upload.loader[doc-index="' + doc_id +'"]').removeClass('hidden');

	$.ajax({
		url: crossref_link.replace('999', query),
		method: 'GET'
		/*beforeSend: function(xhr){
			xhr.setRequestHeader("X-CSRFToken", csrf_token);
		}*/
	}).done(function(response){
		if(!response['error']) {
			toggleCrossref(doc_id, open);
			$('.upload.records.root[doc-index="' + doc_id +'"]').children().remove();
			$('.upload.records.root[doc-index="' + doc_id +'"]').append(response);

			$('.crossref-row').off();
			$('.crossref-row').click(function(e){
				//Cuando se hace click sobre una sugerencia, se rellenan los datos
				var index = $(this).closest('ul').attr('doc-index');
				console.log('.field[name="title' + index + '"]');
				$('.field[name="title' + index + '"]').val($(this).attr('title'));
				$('.field[name="author' + index + '"]').val($(this).attr('author'));
				$('.field[name="date' + index + '"]').val($(this).attr('date'));
				$('.field[name="issn' + index + '"]').val($(this).attr('issn'));
				$('.field[name="doi' + index + '"]').val($(this).attr('doi'));
				$('.field[name="url' + index + '"]').val($(this).attr('url'));
				$('.field[name="pages' + index + '"]').val($(this).attr('pages'));
			});
			// Se meuestra el icono check
			$('.upload.fa-check[doc-index="' + doc_id +'"]').removeClass('hidden');
		}
		$('.upload.loader[doc-index="' + doc_id +'"]').addClass('hidden');
		//Comprueba si hubo un cambio en el campo de texto desde que mando la solicitud
		if(last_cr_query.localeCompare(query) != 0){
			console.log("entra");
			crossref_query(last_cr_query, doc_id);
		}
		else
			crossref_busy = false;

	});		
}

function enableCrossref(){

	$('.field[field-name="title"]').off();
	$('.field[field-name="title"]').on('input', function(){
		last_cr_query = $(this).val();
		if(!crossref_busy){
			crossref_busy = true;

			toggleCrossref($(this).attr('doc-index'), true);
			var $this = $(this)
			crossref_timeout = setTimeout(function(){
				if($this.val() == ''){
					crossref_busy = false;
				}
				else{
					console.log($this.val());
					crossref_query($this.val(), $this.attr('doc-index'));
				}
			}, 500);
		}
	});

	//Al hacer click sobre el campo de texto, si hay textos de sugerencia, se muestran.
	$('.field[field-name="title"]').focus(function(e){
		var cr = $('.crossref[doc-index="' + $(this).attr('doc-index') +'"]');
		console.log(cr.find('.upload.records.list').find('li').length);
		if(cr.find('.upload.records.list').find('li').length > 0)
			toggleCrossref($(this).attr('doc-index'), true, false);
	});
	
	// Cuando se presiona esc o enter, se esconde el cuadro.
	$('.field[field-name="title"]').keyup(function(e){
		if(e.which == 27 || e.which == 13){
			toggleCrossref($(this).attr('doc-index'));
		}
	});


	//Cuando se sale el cursor del campo de texto, se esconde el cuadro
	$('.field[field-name="title"]').focusout(function(e){
		var $this = $(this)
		setTimeout(function(){
			toggleCrossref($this.attr('doc-index'));			
		}, 100);
	});
}

function checkEmptyFields(){
	$(".field").each(function(i, field){
		if (($(field).val() == null || $(field).val() == '') && $(field).prop('required') == true){
			$(field).addClass("required");
			$(field).on('input', function(){
				if($(this).hasClass('required'))
					$(this).removeClass('required');
				$(this).off();
			});	
		}
	});
}