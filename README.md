# Cancelable Promise Test

## Goal

Develop a class CancelablePromise that behaves similarly to the native Promise class in JavaScript but with the capability to cancel the entire promise chain before execution.

[TZ]

https://gitlab.com/nais.ua/cancelable-promise-test

#### Endpoints:

* For Promise (ES6) method - http://localhost:3000/
* For async / await (ES7) method - http://localhost:3000/api/async-operation

##### Плюси та мінуси використання Promise (ES6) та async / await (ES7):

**Promise (ES6):**

*Плюси:*

* Простий та зручний спосіб обробки асинхронних операцій.
* Визначення послідовних операцій за допомогою then та catch, що полегшує читання коду.

*Мінуси:*

* Займає багато рядків коду, особливо при необхідності декількох послідовних then.
* Може призводити до "callback hell" при великій кількості вкладених операцій.

**async / await (ES7):**

*Плюси:*

* Зменшує кількість коду, необхідного для обробки асинхронних операцій.
* Дозволяє виражати асинхронний код так, як будь-який синхронний код, що покращує читабельність.

*Мінуси:*

* Потребує підтримки викликуючого середовища (наприклад, браузера або Node.js версії 7.6 і вище).
* Може призводити до блокування виконання коду при великій кількості паралельних асинхронних операцій.
