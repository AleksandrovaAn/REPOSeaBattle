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

}