// Клас CancelableAsync представляє собою інструмент для роботи з асинхронними операціями,
// які можна скасувати. Він дозволяє створювати асинхронні об'єкти, які можна відмінити,
// і обробляти їх результати або помилки.

/*
 * Основні методи та властивості:

 * Конструктор:

 - Приймає функцію executor, яка представляє виконання асинхронної операції.
 - Приймає функцію onCancel, яка буде викликана при скасуванні операції.
 - Створює асинхронну операцію, обгортає її в Promise та ініціалізує масив обробників скасування.

 * then:
 - Додає обробники для вирішення та відхилення операції.
 - Повертає новий Promise з результатом виконання обробників або вихідним значенням, якщо обробників немає.

 * catch:
 - Додає обробник для відхилення операції.
 - Повертає новий Promise з результатом виконання обробника відхилення.

 *finally:
 - Додає обробник, який буде викликаний незалежно від вирішення чи відхилення операції.
 - Повертає новий Promise з результатом виконання обробників та обробника finally.

 * cancel:
 - Скасовує виконання операції, викликаючи усі обробники скасування.

 * isCanceled:
 - Повертає статус скасування операції.
*/

class CancelableAsync {
  /**
   * Конструктор класу CancelableAsync.
   * @param {Function} executor - Функція, яка представляє виконання асинхронної операції.
   * @param {Function} onCancel - Функція, яка буде викликана при скасуванні операції.
   * @throws {Error} - Викидає помилку, якщо executor не є функцією.
   */
  constructor(executor, onCancel) {
    if (typeof executor !== 'function') {
      throw new Error('Executor must be a function');
    }

    // Властивість, що вказує, чи скасовано виконання операції.
    this._isCanceled = false;

    // Масив обробників скасування.
    this._onCancelHandlers = [];

    // Функція, яка буде викликана при скасуванні операції.
    const onCancelCallback = () => {
      this.cancel();
      cancelableAsync.cancel();
    };

    // Встановлюємо функцію скасування на передану або стандартну функцію.
    const onCancelHandler = onCancel || onCancelCallback;
    this._onCancelHandlers.push(onCancelHandler);

    // Асинхронна функція-обгортка для виконання переданого executor.
    const wrappedExecutor = async () => {
      // Додаємо обробник скасування до масиву.
      this._onCancelHandlers.push(onCancelHandler);

      try {
        // Перевіряємо, чи не скасована операція, інакше викидаємо помилку.
        if (this._isCanceled) {
          throw { isCanceled: true };
        }

        // Виконуємо переданий executor і повертаємо його результат.
        return await executor();
      } catch (error) {
        // Обробка помилок, викидених під час виконання операції.
        if (this._isCanceled) {
          // Якщо операція скасована, викидаємо помилку скасування.
          throw { isCanceled: true };
        } else {
          // В іншому випадку викидаємо отриману помилку.
          throw error;
        }
      }
    };

    // Запускаємо обгортку операції і отримуємо посилання на поточний об'єкт.
    this._promise = wrappedExecutor();
    const cancelableAsync = this;
  }

  /**
   * Метод then додає обробники для вирішення та відхилення операції.
   * @param {Function} onFulfilled - Функція для обробки результату операції.
   * @param {Function} onRejected - Функція для обробки помилок операції.
   * @returns {Promise} - Повертає новий об'єкт типу Promise, результатом якого є результат виконання onFulfilled або onRejected.
   */
  async then(onFulfilled, onRejected) {
    // Очікуємо результат виконання операції.
    const value = await this._promise;

    // Якщо операція скасована, повертаємо Promise з помилкою скасування.
    return this._isCanceled
      ? Promise.reject({ isCanceled: true })
      : onFulfilled
      ? onFulfilled(value)
      : value;
  }

  /**
   * Метод catch додає обробник для відхилення операції.
   * @param {Function} onRejected - Функція для обробки помилок операції.
   * @returns {Promise} - Повертає новий об'єкт типу Promise з результатом виконання onRejected.
   */
  catch(onRejected) {
    return this.then(undefined, onRejected);
  }

  /**
   * Метод finally додає обробник, який буде викликаний незалежно від вирішення чи відхилення операції.
   * @param {Function} onFinally - Функція для виконання завершальних дій.
   * @returns {Promise} - Повертає новий об'єкт типу Promise, результатом якого є результат виконання операції.
   */
  finally(onFinally) {
    return this.then(
      // Обробник для вирішення операції.
      (value) => {
        onFinally();
        return value;
      },
      // Обробник для відхилення операції.
      (reason) => {
        onFinally();
        throw reason;
      }
    );
  }

  /**
   * Метод cancel скасовує виконання операції.
   * Викликає усі обробники скасування, які були додані.
   */
  cancel() {
    if (!this._isCanceled) {
      // Позначаємо операцію як скасовану.
      this._isCanceled = true;

      // Викликаємо всі обробники скасування.
      this._onCancelHandlers.forEach((handler) => handler());
    }
  }

  /**
   * Метод isCanceled повертає статус скасування операції.
   * @returns {boolean} - true, якщо операція скасована; false, якщо ні.
   */
  get isCanceled() {
    return this._isCanceled;
  }
}

module.exports = CancelableAsync;
