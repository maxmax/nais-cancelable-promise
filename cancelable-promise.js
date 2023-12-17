// Here is an example of the CancelablePromise class,
// which behaves similarly to JavaScript's own Promise class,
// but with the ability to cancel the entire chain of promises before execution:

// This CancelablePromise class has a similar interface to
// like the standard Promise class, but with additional methods cancel and isCanceled,
// which allow you to cancel a promise chain and check if it has been canceled.


class CancelablePromise {
  // The class constructor takes an executor function as an argument.
  // It checks if the executor is a function, throwing an error if not.
  constructor(executor) {
    if (typeof executor !== 'function') {
      throw new Error('Executor must be a function');
    }

    // Two instance variables (_isCanceled and _onCancelHandlers) are declared to manage
    // the cancellation state and store cancelation handlers.
    this._isCanceled = false;
    this._onCancelHandlers = [];

    // This function (onCancel) is a utility to add
    // cancelation handlers to the _onCancelHandlers array.
    const onCancel = (handler) => {
      this._onCancelHandlers.push(handler);
    };

    // This block defines a wrappedExecutor function that is passed to the Promise constructor.
    // It wraps the original executor function, handling cancellation checks.
    const wrappedExecutor = (resolve, reject) => {
      if (this._isCanceled) {
        reject({ isCanceled: true });
        return;
      }

      executor(
        (value) => {
          if (this._isCanceled) {
            reject({ isCanceled: true });
          } else {
            resolve(value);
          }
        },
        (reason) => {
          if (this._isCanceled) {
            reject({ isCanceled: true });
          } else {
            reject(reason);
          }
        },
        onCancel
      );
    };

    // A Promise instance is created with the wrappedExecutor function.
    this._promise = new Promise(wrappedExecutor);
  }

  then(onFulfilled, onRejected) {
    // If both handlers are missing, simply return the current instance
    if (!onFulfilled && !onRejected) {
      return this;
    }

    // Instead of creating a new CancelablePromise instance,
    // create a new promise inside the current instance
    const newPromise = new CancelablePromise((resolve, reject, onCancel) => {
      onCancel(() => {
        this.cancel();
        reject({ isCanceled: true });
      });

      this._promise.then(
        (value) => {
          if (this._isCanceled) {
            reject({ isCanceled: true });
            return;
          }

          if (typeof onFulfilled === 'function') {
            try {
              resolve(onFulfilled(value));
            } catch (error) {
              reject(error);
            }
          } else {
            resolve(value);
          }
        },
        (reason) => {
          if (this._isCanceled) {
            reject({ isCanceled: true });
            return;
          }

          if (typeof onRejected === 'function') {
            try {
              resolve(onRejected(reason));
            } catch (error) {
              reject(error);
            }
          } else {
            reject(reason);
          }
        }
      );
    });

    return newPromise;
  }

  // The catch method is a shorthand for handling only rejection cases in the promise chain.
  catch(onRejected) {
    return this.then(undefined, onRejected);
  }

  // The finally method adds a callback that will be executed regardless of the promise's fulfillment or rejection.
  finally(onFinally) {
    return this.then(
      (value) => {
        onFinally();
        return value;
      },
      (reason) => {
        onFinally();
        throw reason;
      }
    );
  }

  // The cancel method sets the cancellation state to true and executes all registered cancelation handlers.
  cancel() {
    if (!this._isCanceled) {
      this._isCanceled = true;
      this._onCancelHandlers.forEach((handler) => handler());
    }
  }

  // The isCanceled getter allows external code to check the cancellation state
  // without directly accessing the _isCanceled variable.
  get isCanceled() {
    return this._isCanceled;
  }
}

module.exports = CancelablePromise;
