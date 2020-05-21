window.onload = function () {
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
    this.fieldSide = 330,
      // размер палубы корабля в px
      this.shipSide = 33,
      // массив с данными кораблей
      // в качестве его элементов выступают массивы содержащие количество палуб и тип кораблей
      // индекс элемента массива будет соответствовать количеству кораблей, данные о которых
      // содержатся в данном элементе
      // чтобы описанная структура была корректной, используем пустой нулевой элемент
      this.shipsData = [
        '',
        [4, 'fourdeck'],
        [3, 'tripledeck'],
        [2, 'doubledeck'],
        [1, 'singledeck']
      ],
      // объект игрового поля, полученный в качестве аргумента
      this.field = field;
    // получаем координаты всех четырёх сторон рамки игрового поля относительно начала
    // document, с учётом возможной прокрутки по вертикали 
    this.fieldX = field.getBoundingClientRect().top + window.pageYOffset;
    this.fieldY = field.getBoundingClientRect().left + window.pageXOffset;
    this.fieldRight = this.fieldY + this.fieldSide;
    this.fieldBtm = this.fieldX + this.fieldSide;
    // создаём пустой массив, куда будем заносить данные по каждому созданному кораблю
    // эскадры, подробно эти данные рассмотрим при создании объектов кораблей
    this.squadron = [];
    // флаг начала игры, устанавливается после нажатия кнопки 'Play' и запрещает
    // редактирование положения кораблей
    this.startGame = false;
  }

  Field.prototype.randomLocationShips = function () {
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
        fc.decks = decks,
          // и уникальное имя корабля, которое будет использоваться в качестве его 'id'
          fc.shipname = this.shipsData[i][1] + String(j + 1);

        // создаём экземпляр объекта корабля с помощью конструктора 'Ships'
        var ship = new Ships(this, fc);
        // генерируем новый корабль и выводим его на экран монитора	
        ship.createShip();
      }
    }
  }

  Field.prototype.getCoordinatesDecks = function (decks) {
    // получаем коэфициенты определяющие направление расположения корабля
    // kx == 0 и ky == 1 — корабль расположен горизонтально,
    // kx == 1 и ky == 0 - вертикально.
    var kx = getRandom(1),
      ky = (kx == 0) ? 1 : 0,
      x, y;
    // в зависимости от направления расположения, генерируем
    // начальные координаты
    if (kx == 0) {
      x = getRandom(9);
      y = getRandom(10 - decks);
    } else {
      x = getRandom(10 - decks);
      y = getRandom(9);
    }

    // проверяем валидность координат всех палуб корабля:
    // нет ли в полученных координатах или соседних клетках ранее
    // созданных кораблей
    var result = this.checkLocationShip(x, y, kx, ky, decks);
    // если координаты невалидны, снова запускаем функцию
    if (!result) return this.getCoordinatesDecks(decks);

    // создаём объект, свойствами которого будут начальные координаты и
    // коэфициенты определяющие направления палуб
    var obj = {
      x: x,
      y: y,
      kx: kx,
      ky: ky
    };
    return obj;
  }

  Field.prototype.checkLocationShip = function(x, y, kx, ky, decks) {
    // зарегистрируем переменные
    var fromX, toX, fromY, toY;

    // формируем индексы начала и конца цикла для строк
    // если координата 'x' равна нулю, то это значит, что палуба расположена в самой верхней строке,
    // т. е. примыкает к верхней границе и началом цикла будет строка с индексом 0
    // в противном случае, нужно начать проверку со строки с индексом на единицу меньшим, чем у
    // исходной, т.е. находящейся выше исходной строки
    fromX = (x == 0) ? x : x - 1;
    // если условие истинно - это значит, что корабль расположен вертикально и его последняя палуба примыкает
    // к нижней границе игрового поля
    // поэтому координата 'x' последней палубы будет индексом конца цикла
    if (x + kx * decks == 10 && kx == 1) toX = x + kx * decks;
    // корабль расположен вертикально и между ним и нижней границей игрового поля есть, как минимум, ещё
    // одна строка, координата этой строки и будет индексом конца цикла
    else if (x + kx * decks < 10 && kx == 1) toX = x + kx * decks + 1;
    // корабль расположен горизонтально вдоль нижней границы игрового поля
    else if (x == 9 && kx == 0) toX = x + 1;
    // корабль расположен горизонтально где-то по середине игрового поля
    else if (x < 9 && kx == 0) toX = x + 2;

    // формируем индексы начала и конца цикла для столбцов
    // принцип такой же, как и для строк
    fromY = (y == 0) ? y : y - 1;
    if (y + ky * decks == 10 && ky == 1) toY = y + ky * decks;
    else if (y + ky * decks < 10 && ky == 1) toY = y + ky * decks + 1;
    else if (y == 9 && ky == 0) toY = y + 1;
    else if (y < 9 && ky == 0) toY = y + 2;

    // если корабль при повороте выходит за границы игрового поля
    // т.к. поворот происходит относительно первой палубы, то 
    // fromX и fromY, всегда валидны
    if (toX === undefined || toY === undefined) return false;

    for (var i = fromX; i < toX; i++) {
        for (var j = fromY; j < toY; j++) {
            if (this.matrix[i][j] == 1) return false;
        }
    }
    return true;
}

Field.prototype.cleanField = function() {
    // создаём объект игрового поля, на котором должны быть удалены корабли
var parent	= this.field,
    // получаем значение атрибута 'id', которое понадобится для дальнейшей
    // DOM-навигации
    id		= parent.getAttribute('id'),
    // получаем коллекцию все кораблей, которые нужно удалить
    divs 	= document.querySelectorAll('#' + id + ' > div');

// перебираем в цикле полученную коллекцию и удаляем входящие в неё корабли
[].forEach.call(divs, function(el) {
    parent.removeChild(el);
});
// очищаем массив объектов кораблей
this.squadron.length = 0;
}


  window.onload = function () {
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

    // зарегистрируем переменные и присвои им значения полученных элементов игровых полей
    // эти переменные ещё несколько раз понадобятся нам при написании скрипта
    var userfield = getElement('field_user'),
      compfield = getElement('field_comp'),
      comp;
    // с помощью конструктора создаём объект user, за его основу взято поле игрока
    var user = new Field(getElement('field_user'));

    function Ships(player, fc) {
      // на каком поле создаётся данный корабль
      this.player = player;
      // уникальное имя корабля
      this.shipname = fc.shipname;
      //количество палуб
      this.decks = fc.decks;
      // координата X первой палубы
      this.x0 = fc.x;
      // координата Y первой палубы
      this.y0 = fc.y;
      // направлении расположения палуб
      this.kx = fc.kx;
      this.ky = fc.ky;
      // счётчик попаданий
      this.hits = 0;
      // массив с координатами палуб корабля
      this.matrix = [];
    }
    Ships.prototype.createShip = function () {
      var k = 0,
        x = this.x0,
        y = this.y0,
        kx = this.kx,
        ky = this.ky,
        decks = this.decks,
        player = this.player

      // количество циклов будет равно количеству палуб создаваемого корабля
      while (k < decks) {
        // записываем координаты корабля в матрицу игрового поля
        // теперь наглядно должно быть видно зачем мы создавали два
        // коэфициента направления палуб
        // если коэфициент равен 1, то соотвествующая координата будет
        // увеличиваться при каждой итерации
        // если равен нулю, то координата будет оставаться неизменной
        // таким способом мы очень сократили и унифицировали код
        // значение 1, записанное в ячейку двумерного массива, говорит о том, что
        // по данным координатам находится палуба некого корабля
        player.matrix[x + k * kx][y + k * ky] = 1;
        // записываем координаты корабля в матрицу экземпляра корабля
        this.matrix.push([x + k * kx, y + k * ky]);
        k++;
      }
    }
    // заносим информацию о созданном корабле в массив эскадры
    player.squadron.push(this);
    // если корабль создан для игрока, выводим его на экран
    if (player == user) this.showShip();
    // когда количество кораблей в эскадре достигнет 10, т.е. все корабли
    // сгенерированны, то можно показать кнопку запуска игры
    if (user.squadron.length == 10) {
      getElement('play').setAttribute('data-hidden', 'false');
    }


    Ships.prototype.showShip = function () {
      // создаём новый элемент с указанным тегом
      var div = document.createElement('div'),
        // присваиваем имя класса в зависимости от направления расположения корабля
        dir = (this.kx == 1) ? ' vertical' : '',
        // из имени корабля убираем цифры и получаем имя класса
        classname = this.shipname.slice(0, -1),
        player = this.player;

      // устанавливаем уникальный идентификатор для корабля
      div.setAttribute('id', this.shipname);
      // собираем в одну строку все классы 
      div.className = 'ship ' + classname + dir;
      // через атрибут 'style' задаём позиционирование кораблю относительно
      // его родительского элемента
      // смещение вычисляется путём умножения координаты первой палубы на
      // размер клетки игрового поля, этот размер совпадает с размером палубы
      div.style.cssText = 'left:' + (this.y0 * player.shipSide) + 'px; top:' + (this.x0 * player.shipSide) + 'px;';
      player.field.appendChild(div);
    }

    function Instance() {
      this.pressed = false;
    }

    
    Field.prototype.getCoordinatesDecks = function(decks) {
		// получаем коэфициенты определяющие направление расположения корабля
		// kx == 0 и ky == 1 — корабль расположен горизонтально,
		// kx == 1 и ky == 0 - вертикально.
		var kx = getRandom(1),
			ky = (kx == 0) ? 1 : 0,
			x, y;
		// в зависимости от направления расположения, генерируем
		// начальные координаты
		if (kx == 0) {
			x = getRandom(9);
			y = getRandom(10 - decks);
		} else {
			x = getRandom(10 - decks);
			y = getRandom(9);
		}

		// проверяем валидность координат всех палуб корабля:
		// нет ли в полученных координатах или соседних клетках ранее
		// созданных кораблей
		var result = this.checkLocationShip(x, y, kx, ky, decks);
		// если координаты невалидны, снова запускаем функцию
		if (!result) return this.getCoordinatesDecks(decks);

		// создаём объект, свойствами которого будут начальные координаты и
		// коэфициенты определяющие направления палуб
		var obj = {
			x: x,
			y: y,
			kx: kx,
			ky: ky
		};
		return obj;
    }
    

    


}


    Instance.prototype.setObserver = function () {
      // поле для кораблей игрока
      var fieldUser = getElement('field_user'),
        // контейнер, в котором изначально находятся корабли
        initialShips = getElement('ships_collection');

      // нажатие на левую кнопку мышки
      fieldUser.addEventListener('mousedown', this.onMouseDown.bind(this));
      // нажатие на правую кнопку мышки
      fieldUser.addEventListener('contextmenu', this.rotationShip.bind(this));
      // нажатие на левую кнопку мышки
      initialShips.addEventListener('mousedown', this.onMouseDown.bind(this));
      // перемещение мышки с нажатой кнопкой
      document.addEventListener('mousemove', this.onMouseMove.bind(this));
      // отпускание левой кнопки мышки
      document.addEventListener('mouseup', this.onMouseUp.bind(this));
    }

  }
}
// полифил для IE closest
;
(function (ELEMENT) {
  ELEMENT.matches = ELEMENT.matches || ELEMENT.mozMatchesSelector || ELEMENT.msMatchesSelector || ELEMENT.oMatchesSelector || ELEMENT.webkitMatchesSelector;
  ELEMENT.closest = ELEMENT.closest || function closest(selector) {
    if (!this) return null;
    if (this.matches(selector)) return this;
    if (!this.parentElement) {
      return null
    } else return this.parentElement.closest(selector)
  };
}(Element.prototype));

getElement('type_placement').addEventListener('click', function(e) {
    // используем делегирование основанное на всплытии событий
    var el = e.target;
    if (el.tagName != 'SPAN') return;

    // получаем объект в котором находится коллекция кораблей
    // для перетаскивания
    var shipsCollection = getElement('ships_collection');
    // если мы уже создали эскадру ранее, то видна кнопка начала игры
    // скроем её на время расстановки кораблей новой эскадры
    getElement('play').setAttribute('data-hidden', true);
    // очищаем матрицу
    user.cleanField();

    var type = el.getAttribute('data-target'),
        // создаём литеральный объект typeGeneration
        // каждому свойству литерального объекта соотвествует анонимная функция
        // в которой вызывается рандомная или ручная расстановка кораблей
        typeGeneration = {
            'random': function() {
                // если мы хотели самостоятельно расставить корабли, а потом решили
                // сделать это рандомно, то скрываем корабали для перетаскивания
                shipsCollection.setAttribute('data-hidden', true);
                user.randomLocationShips();
            },
            'manually': function() {
                // создаём двумерный массив, в который будем записывать полученные координаты
                // палуб кораблей, а в дальнейшем, координаты выстрелов компьютера, попаданий
                // и клеток игрового поля, где кораблей точно быть не может
                user.matrix = createMatrix();

                // проверяем, видна ли первоначальная дислокация кораблей
                // используя данное условие, мы можем при повторных клика
                // на псевдо-ссылку Самостоятельно с чистого листа
                // показывать / скрывать первоначальную дислокацию
                if (shipsCollection.getAttribute('data-hidden') === 'true') {
                    // показываем объект
                    shipsCollection.setAttribute('data-hidden', false);
                    // создаём экземпляр объекта с помощью конструктора Instance
                    var instance = new Instance();
                    // и устанавливаем обработчики событий мыши
                    instance.setObserver();
                } else {
                    // скрываем объект
                    shipsCollection.setAttribute('data-hidden', true);
                }
            }
        };
    // вызов анонимной функции литерального объекта в зависимости
    // от значения атрибута 'data-target'
    typeGeneration[type]();
});