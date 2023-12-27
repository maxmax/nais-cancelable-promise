class CancelablePromise {
  constructor(executor) {
    if (typeof executor !== "function") {
      throw new Error("Executor must be a function");
    }

    // Internal promise state
    this._state = "pending";

    // Property indicating whether the promise execution has been canceled.
    this._isCanceled = false;

    // Array of cancellation handlers.
    this._onCancelHandlers = [];

    // Create a Proxy to track changes in the promise state.
    this._promise = new Proxy(new Promise(() => {}), {
      set: (target, prop, value) => {
        if (prop === "status") {
          this._state = value;
          if (value === "rejected" && this._isCanceled) {
            // If the state becomes "rejected" and the promise is canceled, change the state to "canceled."
            this._state = "canceled";
          }
        }
        target[prop] = value;
        return true;
      },
    });

    // Internal flag to check if cancellation has been triggered.
    this._cancelTriggered = false;

    // Function to be called on cancellation.
    const onCancelCallback = () => {
      if (this._state !== "rejected" || !this._cancelTriggered) {
        this.cancel();
        cancelablePromise.cancel();
      }
    };

    // Function to add a cancellation handler.
    const onCancel = handler => {
      this._onCancelHandlers.push(handler);
    };

    // Add cancellation handler.
    onCancel(onCancelCallback);

    // Wrap the executor to call onCancel when creating the promise.
    const wrappedExecutor = (resolve, reject) => {
      onCancel(onCancelCallback);
      executor(
        value => {
          if (this._isCanceled) {
            reject({ isCanceled: true });
          } else {
            resolve(value);
          }
        },
        reason => {
          if (this._isCanceled) {
            reject({ isCanceled: true });
          } else {
            reject(reason);
          }
        },
        onCancel,
      );
    };

    // Create a promise with the wrapped executor.
    this._promise = new Promise(wrappedExecutor);

    // Create a reference to the current object for access in internal methods.
    const cancelablePromise = this;
  }

  then(onFulfilled, onRejected) {
    const isValidFunction = fn => typeof fn === "function";

    const validateCallbacks = (fulfilled, rejected) => {
      if (fulfilled !== undefined && !isValidFunction(fulfilled)) {
        throw new TypeError("onFulfilled must be a function");
      }
      if (rejected !== undefined && !isValidFunction(rejected)) {
        throw new TypeError("onRejected must be a function");
      }
    };

    const onCancelCallback = () => {
      this.cancel();
      newPromise.cancel();
    };

    const onCancel = handler => {
      this._onCancelHandlers.push(handler);
    };

    onCancel(onCancelCallback);
    validateCallbacks(onFulfilled, onRejected);

    const newPromise = new CancelablePromise((resolve, reject, onCancel) => {
      onCancel(onCancelCallback);
      validateCallbacks(onFulfilled, onRejected);

      this._promise.then(
        value => {
          if (this._isCanceled) {
            reject({ isCanceled: true });
            return;
          }

          const handleResult = resultFn => {
            try {
              resolve(isValidFunction(resultFn) ? resultFn(value) : value);
            } catch (error) {
              reject(error);
            }
          };

          if (isValidFunction(onFulfilled)) {
            handleResult(onFulfilled);
          } else {
            handleResult(undefined);
          }
        },
        reason => {
          if (this._isCanceled) {
            reject({ isCanceled: true });
            return;
          }

          const handleResult = resultFn => {
            try {
              resolve(isValidFunction(resultFn) ? resultFn(reason) : reason);
            } catch (error) {
              reject(error);
            }
          };

          if (isValidFunction(onRejected)) {
            handleResult(onRejected);
          } else {
            handleResult(undefined);
          }
        },
      );
    });

    return newPromise;
  }

  catch(onRejected) {
    return this.then(undefined, onRejected);
  }

  finally(onFinally) {
    return this.then(
      value => {
        onFinally();
        return value;
      },
      reason => {
        onFinally();
        throw reason;
      },
    );
  }

  cancel() {
    if (!this._isCanceled) {
      this._isCanceled = true;

      // Create a copy of the array of handlers to avoid changes during iteration.
      const onCancelHandlers = [...this._onCancelHandlers];

      // Asynchronously call cancellation event handlers.
      return Promise.all(onCancelHandlers.map(handler => handler())).then(
        () => {},
      );
    }

    return Promise.resolve();
  }

  get isCanceled() {
    return this._isCanceled;
  }
}

module.exports = CancelablePromise;
