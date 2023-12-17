// here's an implementation of a CancelableAsync class that behaves similarly to
// the native async/await syntax in JavaScript but allows canceling the promise chain before execution:

class CancelableAsync {
  constructor(executor) {
    this._executor = executor;
    this._isCanceled = false;
  }

  async run() {
    try {
      if (!this._isCanceled) {
        const result = await this._executor();
        return this._isCanceled ? { isCanceled: true } : result;
      } else {
        return { isCanceled: true };
      }
    } catch (error) {
      if (this._isCanceled) {
        return { isCanceled: true };
      } else {
        throw error;
      }
    }
  }

  cancel() {
    this._isCanceled = true;
  }
}

module.exports = CancelableAsync;




// Example usage:

// const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// const cancelableAsync = new CancelableAsync(async () => {
//  await delay(1000);
//  console.log('Async operation completed');
//  return 'Result';
// });

// cancelableAsync.run().then((result) => {
//  if (result.isCanceled) {
//    console.log('Async operation canceled');
//  } else {
//    console.log('Async operation result:', result);
//  }
// });

// Cancel the operation
// cancelableAsync.cancel();

// In this example, CancelableAsync is constructed with an asynchronous executor function.
// The run method executes the asynchronous operation and handles cancellation by resolving
// with an object { isCanceled: true } if canceled during execution.
// The cancel method sets the _isCanceled flag to indicate cancellation.
// This implementation provides a basic structure for handling cancellation in an asynchronous context.
// Depending on your specific use case, you might need to adapt it to suit your requirements.
