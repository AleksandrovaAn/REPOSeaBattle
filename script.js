window.onload = function() {
	/* variables
	shipSide	- размер палубы
	user.field 	- игровое поле пользователя
	comp.field 	- игровое поле компьютера
	user.fieldX,
	user.fieldY	- координаты игрового поля пользователя
	comp.fieldX,
	comp.fieldY	- координаты игрового поля компьютера

	0 - пустое место
	1 - палуба корабля
	2 - клетка рядом с кораблём
	3 - обстрелянная клетка
	4 - попадание в палубу
	*/

    'use strict';

    function Field(field) {
		// размер стороны игрового поля в px
		this.fieldSide	= 330,
		// размер палубы корабля в px
		this.shipSide	= 33,
		// массив с данными кораблей
		// в качестве его элементов выступают массивы содержащие количество палуб и тип кораблей
		// индекс элемента массива будет соответствовать количеству кораблей, данные о которых
		// содержатся в данном элементе
		// чтобы описанная структура была корректной, используем пустой нулевой элемент
		this.shipsData	= [
			'',
			[4, 'fourdeck'],
			[3, 'tripledeck'],
			[2, 'doubledeck'],
			[1, 'singledeck']
		],
		// объект игрового поля, полученный в качестве аргумента
		this.field		= field;
		// получаем координаты всех четырёх сторон рамки игрового поля относительно начала
		// document, с учётом возможной прокрутки по вертикали 
		this.fieldX		= field.getBoundingClientRect().top + window.pageYOffset;
		this.fieldY		= field.getBoundingClientRect().left + window.pageXOffset;
		this.fieldRight	= this.fieldY + this.fieldSide;
		this.fieldBtm	= this.fieldX + this.fieldSide;
		// создаём пустой массив, куда будем заносить данные по каждому созданному кораблю
		// эскадры, подробно эти данные рассмотрим при создании объектов кораблей
		this.squadron	= [];
		// флаг начала игры, устанавливается после нажатия кнопки 'Play' и запрещает
		// редактирование положения кораблей
		this.startGame	= false;
    }
    
    Field.prototype.randomLocationShips = function() {
		// создаём двумерный массив, в который будем записывать полученные координаты
		// палуб корабля, а в дальнейшем, координаты выстрелов, попаданий и клеток
		// игрового поля, где кораблей точно быть не может
		this.matrix = createMatrix();

		for (var i = 1, length = this.shipsData.length; i < length; i++) {
			// i равно количеству кораблей, создаваемых для типа корабля в данной итерации
			// ещё раз напомню на примере:
			// элемент [3, 'tripledeck'] имеет индекс 2 в массиве shipsData, значит
			// должно быть два трёхпалубных корабля
			// индекс элемента [2, 'doubledeck'] равен 3, значит должно быть создано
			// три двухпалубных корабля
			// и так по каждому элементу массива

			// количество палуб у текущего типа кораблей
			var decks = this.shipsData[i][0]; // кол-во палуб
			for (var j = 0; j < i; j++) {
				// получаем координаты первой палубы и направление расположения палуб (корабля)
				var fc = this.getCoordinatesDecks(decks);

				// добавим объекту 'fc' два новых свойства
				//количество палуб
				fc.decks 	= decks,
				// и уникальное имя корабля, которое будет использоваться в качестве его 'id'
				fc.shipname	= this.shipsData[i][1] + String(j + 1);

					// создаём экземпляр объекта корабля с помощью конструктора 'Ships'
				var ship = new Ships(this, fc);
					// генерируем новый корабль и выводим его на экран монитора	
					ship.createShip();
			}
		}
	}

}