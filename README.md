# Cancelable Promise Test

## Goal

Develop a class CancelablePromise that behaves similarly to the native Promise class in JavaScript but with the capability to cancel the entire promise chain before execution.

[TZ]

https://gitlab.com/nais.ua/cancelable-promise-test


### Доповнив приклад коду, з множинним викликом асинхронних запитів в index.js

**У наведеному прикладі:**

1. Створено масив `promises`, що містить декілька асинхронних операцій.
2. Використовується функція `Promise.all` для паралельного виконання всіх обіцянок у масиві.
3. Результати виконання всіх операцій збираються в масив `results`.
4. Масив `results` надсилається назад клієнту.

*Цей код дозволяє одночасно виконувати декілька асинхронних запитів і надсилати назад клієнту їхні результати однією відповіддю.*
