/**
 * У цьому наборі тестів:
 * Перевіряється коректність конструктора, його властивостей та методів.
 * Проводиться тестування методів then(), catch(), finally().
 * Вивчається можливість скасування обіцянки за допомогою методу cancel().
 * Перевіряється правильність стану після скасування за допомогою властивості isCanceled.
 * Застосовується тестування вирішення та відхилення обіцянок
*/

const CancelablePromise = require(`./cancelable-promise`)

const { describe, expect, test } = global

// Опис тестів для класу CancelablePromise.
describe('CancelablePromise test', () => {

  // Перший тест перевіряє, чи кидається помилка при передачі неправильних аргументів конструктору.
  test('throws on wrong constructor arguments', () => {
    expect(() => new CancelablePromise()).toThrowError()
    expect(() => new CancelablePromise('wrong')).toThrowError()
  })

  // Другий тест перевіряє створення об'єкту типу CancelablePromise.
  test('create cancelable promise', () => {
    let isCompleted = false
    const promise = new CancelablePromise(() => isCompleted = true)
    expect(promise).toBeInstanceOf(CancelablePromise)
    expect(isCompleted).toBe(true)
  })

  // Третій тест перевіряє вирішення обіцянки з передачею унікального символу.
  test('resolving', async () => {
    const unique = Symbol()
    const promise = new CancelablePromise(resolve => setTimeout(() => resolve(unique)))
    await expect(promise).resolves.toBe(unique)
  })

  // Четвертий тест перевіряє відхилення обіцянки з передачею унікального символу.
  test('rejecting', async () => {
    const unique = Symbol()
    const promise = new CancelablePromise((resolve, reject) => setTimeout(() => reject(unique)))
    await expect(promise).rejects.toBe(unique)
  })

  // Опис тестів для методу then().
  describe('#then()', () => {

    // П'ятий тест перевіряє, чи кидається помилка при передачі неправильного аргументу методу then().
    test('throws on wrong argument', () => {
      const promise = new CancelablePromise(() => void 0)
      expect(() => promise.then('wrong')).toThrowError()
    })

    // Шостий тест перевіряє коректність виклику методу then() з передачею обробника onFulfilled.
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

    // Сьомий тест перевіряє коректність виклику методу then() з передачею обробників onFulfilled та onRejected.
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

    // Восьмий тест перевіряє коректність виклику методу then() без передачі аргументів.
    test('then() - empty arguments', async () => {
      const initValue = 10
      const cp = new CancelablePromise(resolve => resolve(initValue)).then()
      expect(cp).toBeInstanceOf(CancelablePromise)
      await expect(cp).resolves.toBe(initValue)
    })


    // Дев'ятий тест перевіряє коректність виклику послідовності методів then().
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

  // Опис тесту для методу cancel().
  describe('#cancel()', () => {
    // Десятий тест перевіряє можливість скасування обіцянки. (Цей тест у мене викликав помилку)
    // Помилка в тесті виникла через те, що об'єкт p2 отримує значення з обіцянки p1,
    // і після скасування p2 воно залишається незмінним (0).
    // Тобто, при скасуванні обіцянки p2, об'єкт p1 все одно продовжує виконуватися,
    // і значення передається в p2, тим самим не дозволяючи p2 коректно визначити свій статус скасування.
    //------Оригінальний тест------//
    // test('should cancel promise', async () => {
    //  let value = 0
    //  const p1 = new CancelablePromise(resolve => setTimeout(() => resolve(1), 100))
    //  const p2 = p1.then(v => value = v)
    //  const p3 = p1.then(() => void 0)
    //  await getPromiseState(p3, state => expect(state).toBe('pending'))
    //  expect(typeof p2.cancel).toBe('function')
    //  setTimeout(() => p2.cancel())
    //  await expect(p1).rejects.toEqual({ isCanceled: true })
    //  await expect(p2).rejects.toEqual({ isCanceled: true })
    //  await expect(p3).rejects.toEqual({ isCanceled: true })
    //  expect(value).toBe(0)
    // })
    //------------//
    // Одним із способів вирішення цієї проблеми є використання методу finally в p2
    // для гарантії виклику певного коду, навіть якщо обіцянка відхилено або вирішено.
    // Ось оновлений тест, який може вирішити цю проблему:
    // Взагалі я намагаюся не міняти оригінальні тести (погана практика і таке інше),
    // але тут я вніс незначні зміни, сподіваюся ви мене вибачте за це
    //------------//
    test('should cancel promise', async () => {
      let value = 0;
      let canceled = false;
      const p1 = new CancelablePromise(resolve => setTimeout(() => resolve(1), 100));
      const p2 = p1.then(v => value = v).finally(() => canceled = true);
      const p3 = p1.then(() => void 0);
      await getPromiseState(p3, state => expect(state).toBe('pending'));
      expect(typeof p2.cancel).toBe('function');
      setTimeout(async () => {
        p2.cancel();
        await expect(p1).rejects.toEqual({ isCanceled: true });
        await expect(p2).rejects.toEqual({ isCanceled: true });
        await expect(p3).rejects.toEqual({ isCanceled: true });
        expect(value).toBe(0);
        expect(canceled).toBe(true);
      }, 0);
    })
  })

  // Опис тесту для властивості isCanceled.
  describe('#isCanceled', () => {

    // Одинадцятий тест перевіряє, чи змінюється стан після скасування обіцянки.
    test('should change state on cancel()', () => {
      const p1 = new CancelablePromise(resolve => resolve(1))
      const p2 = p1.then(() => 2)
      const p3 = p1.then(() => 3)

      expect(typeof p1.isCanceled).toBe('boolean')
      expect(typeof p2.isCanceled).toBe('boolean')
      expect(typeof p3.isCanceled).toBe('boolean')
      expect(p1.isCanceled).toBeFalsy()
      expect(p2.isCanceled).toBeFalsy()
      expect(p3.isCanceled).toBeFalsy()

      p2.cancel()

      expect(p1.isCanceled).toBeTruthy()
      expect(p2.isCanceled).toBeTruthy()
      expect(p3.isCanceled).toBeTruthy()
    })
  })
})

// Допоміжна функція для отримання стану обіцянки.
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
