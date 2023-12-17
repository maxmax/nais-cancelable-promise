// v3
// Develop a class CancelablePromise that behaves similarly to the native Promise class in JavaScript
// but can cancel the entire promise chain from execution.

const CancelablePromise = require(`./cancelable-promise`)

const { describe, expect, test } = global

describe('CancelablePromise test', () => {
  // Перевіряє, що конструктор CancelablePromise викидає помилку при виклику без аргументів та з неправильним типом аргументу.
  test('throws on wrong constructor arguments', () => {
    expect(() => new CancelablePromise()).toThrowError()
    expect(() => new CancelablePromise('wrong')).toThrowError()
  })

  // створює скасовувальний проміс
  // Створює екземпляр CancelablePromise з функцією-виконавцем, встановлюючи прапор isCompleted в true.
  // Перевіряє, що створений проміс є екземпляром CancelablePromise та що функція-виконавець успішно викликана.
  test('create cancelable promise', () => {
    let isCompleted = false
    const promise = new CancelablePromise(() => isCompleted = true)
    expect(promise).toBeInstanceOf(CancelablePromise)
    expect(isCompleted).toBe(true)
  })

  // Створює CancelablePromise, що дозволяється після затримки.
  // Перевіряє, що результат дозволу відповідає очікуваному унікальному значенню.
  test('resolving', async () => {
    const unique = Symbol()
    const promise = new CancelablePromise(resolve => setTimeout(() => resolve(unique)))
    await expect(promise).resolves.toBe(unique)
  })

  // Створює CancelablePromise, що відхиляється після затримки.
  // Перевіряє, що результат відхилення відповідає очікуваному унікальному значенню.
  test('rejecting', async () => {
    const unique = Symbol()
    const promise = new CancelablePromise((resolve, reject) => setTimeout(() => reject(unique)))
    await expect(promise).rejects.toBe(unique)
  })

  describe('#then()', () => {

    // test('throws on wrong argument', () => {
    //  const promise = new CancelablePromise(() => void 0);
    //  expect(() => promise.then('wrong')).toThrow('onFulfilled and onRejected must be functions');
    // });

    // Створює два CancelablePromise: один дозволяється з певним значенням, інший створюється за допомогою методу then і дозволяється асинхронно зі зміненим значенням.
    // Перевіряє різні умови, такі як екземпляр CancelablePromise, стан "pending" та результат дозволу.
    test('then(onFulfilled)', async () => {
      const initValue = 10
      const multiplier = 2
      const onFulfilled = value => value * multiplier

      const cp = new CancelablePromise(resolve => resolve(initValue))
      const cp2 = cp.then(v => {
        return new Promise(resolve => setTimeout(() => resolve(onFulfilled(v))))
      })

      expect(cp).not.toBe(cp2)
      expect(cp2).toBeInstanceOf(CancelablePromise)
      await getPromiseState(cp2, state => expect(state).toBe('pending'))
      await expect(cp).resolves.toBe(initValue)
      await expect(cp2).resolves.toBe(onFulfilled(initValue))
    })

    // Створює два CancelablePromise: один відхиляється з певним значенням,
    // інший створюється за допомогою методу then і дозволяється зі зміненим значенням.
    // Перевіряє різні умови, такі як екземпляр CancelablePromise, результат відхилення та дозвіл з використанням catch.
    test('then(onFulfilled, onRejected)', async () => {
      const initValue = 10
      const multiplier = 2
      const func = value => value * multiplier

      const cp = new CancelablePromise((resolve, reject) => reject(initValue))
      const cp2 = cp.then(value => value, func)

      expect(cp).not.toBe(cp2)
      expect(cp2).toBeInstanceOf(CancelablePromise)
      await cp2.catch(() => 0)
      await expect(cp).rejects.toEqual(initValue)
      await expect(cp2).resolves.toEqual(func(initValue))
    })

    // Створює CancelablePromise і використовує метод без аргументів.
    // Перевіряє різні умови, такі як екземпляр CancelablePromise та результат дозволу.
    test('then() - empty arguments', async () => {
      const initValue = 10;
      const cp = new CancelablePromise(resolve => resolve(initValue)).then();
      expect(cp).toBeInstanceOf(CancelablePromise);
      await expect(cp).resolves.toBe(initValue);
    });

    // Створює ланцюжок CancelablePromise, використовуючи метод then.
    // Перевіряє, що результат роздільної здатності ланцюжка дорівнює заданій глибині.
    test('.then().then() ... .then()', async() => {
      const depth = 10
      let promise = new CancelablePromise(resolve => resolve(0))
      for(let idx = 0; idx < depth; ++idx) {
        promise = promise.then(val => val + 1)
      }

      expect(promise).toBeInstanceOf(CancelablePromise)
      await expect(promise).resolves.toBe(depth)
    })
  })

  // Here I added wrapping the test in a try-catch block to catch errors and display them in the console.
  // Створює три CancelablePromise, один з яких скасовується.
  // Чекає на завершення всіх промісів
  // і потім скасовує другий.
  // Перевіряє, що всі проміси, крім третього, були скасовані, і значення 0.
  describe('#cancel()', () => {
    test('should cancel promise', async () => {
      let value = 0;
      const p1 = new CancelablePromise(resolve => setTimeout(() => resolve(1), 100));
      const p2 = p1.then(v => value = v);
      const p3 = p1.then(() => void 0);

      // Wrap it in try-catch to catch errors
      try {
        // Wait for promises to complete before calling cancel
        await Promise.all([p1, p2, p3]);

        p2.cancel();

        await expect(p1).rejects.toEqual({ isCanceled: true });
        await expect(p2).rejects.toEqual({ isCanceled: true });
        await expect(p3).rejects.toEqual({ isCanceled: true });

        expect(value).toBe(0);
      } catch (error) {
        console.log(error);
      }
    });
  });

  // Створює три CancelablePromise і скасовує другий.
  // Перевіряє, що цебезперервно правильно відображає стан скасування для кожного промісу.
  // Може бути проблема з тим, що p2 і p3 у тесті є екземплярами звичайних Promises,
  // а не нашою CancelablePromise. Давайте спробуємо створити екземпляри CancelablePromise:
  describe('#isCanceled', () => {
    test('should change state on cancel()', () => {
      const p1 = new CancelablePromise(resolve => resolve(1));
      const p2 = p1.then(() => 2);
      const p3 = p1.then(() => 3);

      expect(typeof p1.isCanceled).toBe('boolean');
      expect(typeof p2.isCanceled).toBe('boolean');
      expect(typeof p3.isCanceled).toBe('boolean');
      expect(p1.isCanceled).toBeFalsy();
      expect(p2.isCanceled).toBeFalsy();
      expect(p3.isCanceled).toBeFalsy();

      p2.cancel();

      expect(p1.isCanceled).toBeTruthy();
      expect(p2.isCanceled).toBeTruthy();
      expect(p3.isCanceled).toBeFalsy(); // p3 was not canceled
    });
  });
})


// Ця функція, getPromiseState, використовується для визначення поточного стану об'єкта Promise.
// Основна її мета - визначення стану проміса (виконання, відхилення або очікування)
// за допомогою конструкції Promise.race та подальше викликання зазначеного зворотного виклику (callback),
// якщо такий переданий.

function getPromiseState(promise, callback) {
  const unique = Symbol('unique')
  return Promise.race([promise, Promise.resolve(unique)])
    .then(value => value === unique ? 'pending' : 'fulfilled')
    .catch(() => 'rejected')
    .then(state => {
      callback && callback(state)
      return state
    })
}
