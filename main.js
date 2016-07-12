$(function () {
			var addresses, placemarks=[];
			ymaps.ready(function(){
		//localStorage.removeItem("addresses");
		
		//Ловим координаты пользователя
			var lat = ymaps.geolocation.latitude;
			var long = ymaps.geolocation.longitude;
			var y = [lat, long];

		//Создаем карту с параметрами
			var map = new ymaps.Map('map', {
				center: [lat, long],
				zoom: 13
			}, {
				balloonMaxWidth: 250
			});

		//Создаем метку по геолокации пользователя
			map.geoObjects.add(new ymaps.Placemark([lat, long], {
				balloonContentHeader: '',
				balloonContent: 'Вы примерно здесь',
				balloonContentFooter: ''
			}));
			
		//Список меток для инициализации. В дальнейшем будет нужен после очистки localStorage		
			if (localStorage.getItem("addresses") == undefined) {
				addresses = [{
					name: 'Точка1',
					coords: [46.48129002, 30.72620056],
					isFav: false
				}, {
					name: 'Точка2',
					coords: [46.48420653, 30.74337635],
					isFav: false
				}];
		//Расставляем метки из массива (если он есть вообще)
				if (addresses != []) {
					for (var i = 0; i < addresses.length; ++i) {
					addLabel(map, addresses[i]);
					}
				}
			} else {
		//или из localStorage
				var str = JSON.parse(localStorage.getItem("addresses"));				
				for (var i = 0; i < str.length; ++i) {					
					addLabel(map, str[i]);
				}
			}
	// Добавление новых меток
			function addMark(e) {
				if ($('#label').val() != '') {						
					var coords = e.get('coordPosition');
					var myPlacemark = new ymaps.Placemark([coords[0], coords[1]],{
						balloonContentHeader: '',
						balloonContent: $('#label').val(),
						balloonContentFooter: '',
						iconContent: $('#label').val()
					}, {
						preset: 'twirl#blueStretchyIcon'
					})
					map.geoObjects.add(myPlacemark);

					placemarks.push(myPlacemark);
					placemarks[placemarks.length-1].name = $('#label').val();
					placemarks[placemarks.length-1].coords = [coords[0], coords[1]];
					placemarks[placemarks.length-1].isFav = false;
					$('#marks').append('<div><div class="mark">' + placemarks[placemarks.length-1].name + '</div><div class="buttons"><button class="remove">X</button><button class="fav">Добавить в избранное</button></div><br/></div>');
				}
				$('#label').val('');
				map.events.remove('click', addMark);
			}
		//Добавление меток из массива меток или localStorage
			function addLabel(map, address) {				
				var myPlacemark = new ymaps.Placemark([address.coords[0], address.coords[1]], {
					balloonContentHeader: '',
					balloonContent: address.name,
					balloonContentFooter: '',
					iconContent: address.name
				}, {
					preset: 'twirl#blueStretchyIcon'
				})
				map.geoObjects.add(myPlacemark);

				placemarks.push(myPlacemark);
				placemarks[placemarks.length-1].name = address.name;
				placemarks[placemarks.length-1].coords = [address.coords[0], address.coords[1]];
				placemarks[placemarks.length-1].isFav = address.isFav;					
				$('#marks').append('<div><div class="mark">' + placemarks[placemarks.length-1].name + '</div><div class="buttons"><button class="remove">X</button><button class="fav">Добавить в избранное</button></div><br/></div>');
				if (placemarks[placemarks.length-1].isFav == true) {					
					$(document.querySelectorAll('.mark')).last().css('color','gold')
					placemarks[placemarks.length-1].options.set('preset', 'twirl#yellowStretchyIcon');
					$(document.querySelectorAll('.fav')).last().text("Убрать из избранного")
				}
			}

		// Обработка событий по щелчкам мыши
		//
		//Создание новой метки после нажатия на кнопку Добавить
			$(document).on('click', '#btn', function () {
				map.events.add('click', addMark);
			});
				
		//Подсветка объекта на карте при наведении мыши на метку в списке
			$(document).on("mouseover", ".mark", function () {					
				for( i in placemarks) {							  
					if (placemarks[i].name == this.innerHTML) {
						placemarks[i].options.set('preset', 'twirl#redStretchyIcon');
					}
				}
			});
		// и удаление подсветки
			$(document).on("mouseleave", ".mark", function () {					
				for( i in placemarks) {							  
					if (placemarks[i].name == this.innerHTML) {
						placemarks[i].options.set('preset', 'twirl#blueStretchyIcon');
					}
				}
			});

		//Удаление метки по щелчку на кнопку Х
			$(document).on("click", ".remove", function () {	
				for( i in placemarks) {							  
					if (placemarks[i].name == $(this).parent().siblings('.mark').html()) {
						$(this).parent().parent().remove();
						if (placemarks.length > 1) {
							map.geoObjects.remove(placemarks[i]);
							placemarks.splice(i,i);
						} else {
							map.geoObjects.remove(placemarks[i]);
							placemarks = undefined;
						}
					}
				}
			});

		//Добавление метки в избранное по щелчку на соответствующую кнопку
			$(document).on("click", ".fav", function () {
				for( i in placemarks) {							  
					var that = $(this).parent().siblings('.mark');
					if (placemarks[i].name == $(that).html()) {
						if (that.css('color') == 'rgb(255, 215, 0)') {
							that.css('color','black');
							placemarks[i].isFav = false;
							placemarks[i].options.set('preset', 'twirl#blueStretchyIcon');
							$(this).text('Добавить в избранное');
						} else {
							that.css('color','gold');
							placemarks[i].isFav = true;
							placemarks[i].options.set('preset', 'twirl#yellowStretchyIcon');
							$(this).text('Убрать из избранного');
						}
					}
				}
			});

		//Сохранение списка меток при выгрузке страницы
			$(window).unload(function () {
				if (placemarks != undefined) {
					var str = JSON.stringify(placemarks, ["name", "coords", "isFav"]) ;	
					localStorage.setItem('addresses', str);
					console.log(str);
				} else localStorage.removeItem("addresses");
			});			
		});
	});