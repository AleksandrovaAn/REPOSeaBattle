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