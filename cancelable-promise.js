/**
 * Клас CancelablePromise реалізує об'єкт, аналогічний класу Promise в JavaScript,
 * з можливістю скасування виконання всього ланцюжка обіцянок.
 *
 * Конструктор приймає функцію виконання (executor), яка викликається при створенні обіцянки.
 * Якщо executor не є функцією, викидається помилка.
 *
 * У цьому класі:
 * constructor створює об'єкт CancelablePromise з переданою функцією виконання (executor).
 * then додає обробники для вирішення та відхилення обіцянки.
 * catch додає обробник для відхилення обіцянки.
 * finally додає обробник, який викликається незалежно від вирішення чи відхилення обіцянки.
 * cancel скасовує виконання обіцянки.
 * isCanceled повертає статус скасування обіцянки.
*/

class CancelablePromise {
  constructor(executor) {
    if (typeof executor !== 'function') {
      throw new Error('Executor must be a function');
    }

    // Властивість, яка вказує, чи скасовано виконання обіцянки.
    this._isCanceled = false;

    // Масив обробників скасування.
    this._onCancelHandlers = [];

    // Функція, яка викликається при скасуванні обіцянки.
    const onCancelCallback = () => {
      this.cancel();
      cancelablePromise.cancel();
    };

    // Функція для додавання обробника скасування.
    const onCancel = (handler) => {
      this._onCancelHandlers.push(handler);
    };

    // Додаємо обробник скасування в масив.
    onCancel(onCancelCallback);

    // Обгортаємо executor для виклику onCancel при створенні обіцянки.
    const wrappedExecutor = (resolve, reject) => {
      onCancel(onCancelCallback);

      executor(
        // Обробник для вирішення обіцянки.
        (value) => {
          if (this._isCanceled) {
            reject({ isCanceled: true });
          } else {
            resolve(value);
          }
        },
        // Обробник для відхилення обіцянки.
        (reason) => {
          if (this._isCanceled) {
            reject({ isCanceled: true });
          } else {
            reject(reason);
          }
        },
        // Передаємо onCancel в executor.
        onCancel
      );
    };

    // Створюємо обіцянку з обгорнутим executor.
    this._promise = new Promise(wrappedExecutor);

    // Створюємо посилання на поточний об'єкт, щоб мати доступ у внутрішніх методах.
    const cancelablePromise = this;
  }

  /**
   * Метод then додає обробники для вирішення та відхилення обіцянки.
   * Валідує, чи передані обробники onFulfilled та onRejected є функціями.
   */
  then(onFulfilled, onRejected) {
    const isValidFunction = (fn) => typeof fn === 'function';

    // Валідація переданих обробників.
    const validateCallbacks = (fulfilled, rejected) => {
      if (fulfilled !== undefined && !isValidFunction(fulfilled)) {
        throw new TypeError('onFulfilled must be a function');
      }
      if (rejected !== undefined && !isValidFunction(rejected)) {
        throw new TypeError('onRejected must be a function');
      }
    };

    // Функція, яка викликається при скасуванні обіцянки.
    const onCancelCallback = () => {
      this.cancel();
      newPromise.cancel();
    };

    // Функція для додавання обробника скасування.
    const onCancel = (handler) => {
      this._onCancelHandlers.push(handler);
    };

    // Додаємо обробник скасування в масив.
    onCancel(onCancelCallback);

    // Валідація переданих обробників.
    validateCallbacks(onFulfilled, onRejected);

    // Створюємо нову обіцянку, яку повернемо з методу then.
    const newPromise = new CancelablePromise((resolve, reject, onCancel) => {
      // Додаємо обробник скасування в масив.
      onCancel(onCancelCallback);
      // Валідація переданих обробників.
      validateCallbacks(onFulfilled, onRejected);

      // Виконуємо then для поточної обіцянки.
      this._promise.then(
        // Обробник для вирішення обіцянки.
        (value) => {
          if (this._isCanceled) {
            reject({ isCanceled: true });
            return;
          }

          const handleResult = (resultFn) => {
            try {
              resolve(isValidFunction(resultFn) ? resultFn(value) : value);
            } catch (error) {
              reject(error);
            }
          };

          // Викликаємо обробник onFulfilled, якщо він є функцією.
          if (isValidFunction(onFulfilled)) {
            handleResult(onFulfilled);
          } else {
            handleResult(undefined);
          }
        },
        // Обробник для відхилення обіцянки.
        (reason) => {
          if (this._isCanceled) {
            reject({ isCanceled: true });
            return;
          }

          const handleResult = (resultFn) => {
            try {
              resolve(isValidFunction(resultFn) ? resultFn(reason) : reason);
            } catch (error) {
              reject(error);
            }
          };

          // Викликаємо обробник onRejected, якщо він є функцією.
          if (isValidFunction(onRejected)) {
            handleResult(onRejected);
          } else {
            handleResult(undefined);
          }
        }
      );
    });

    // Повертаємо нову обіцянку.
    return newPromise;
  }

  /**
   * Метод catch додає обробник для відхилення обіцянки.
   * Передається в метод then з порожнім onFulfilled.
   */
  catch(onRejected) {
    return this.then(undefined, onRejected);
  }

  /**
   * Метод finally додає обробник, який буде викликаний незалежно від вирішення чи відхилення обіцянки.
   */
  finally(onFinally) {
    return this.then(
      // Обробник для вирішення обіцянки.
      (value) => {
        onFinally();
        return value;
      },
      // Обробник для відхилення обіцянки.
      (reason) => {
        onFinally();
        throw reason;
      }
    );
  }

  /**
   * Метод cancel скасовує виконання обіцянки.
   * Викликає усі обробники скасування, які були додані.
   */
  cancel() {
    if (!this._isCanceled) {
      this._isCanceled = true;
      this._onCancelHandlers.forEach((handler) => handler());
    }
  }

  /**
   * Метод isCanceled повертає статус скасування обіцянки.
   */
  get isCanceled() {
    return this._isCanceled;
  }
}

module.exports = CancelablePromise;
