// Below is an example of using the CancelablePromise class in a simple Node.js
// application with the Express framework:

// In this example, the simulateAsyncOperation function returns a CancelablePromise that resolves after a
// simulated asynchronous operation. The onCancel handler is used to clean up resources or perform specific
// actions when the promise is canceled.

// The Express route handler / uses this simulateAsyncOperation function and
// responds with the result or an error message if the promise is canceled or encounters an internal server error.

// To test the cancellation feature, you can make a request to http://localhost:3000/
// and cancel the request before it completes.

const express = require('express');
const CancelablePromise = require('./cancelable-promise'); // Adjust the path based on your project structure

const app = express();
const port = 3000;

function simulateAsyncOperation(data) {
  return new CancelablePromise((resolve, reject, onCancel) => {
    const timeoutId = setTimeout(() => {
      resolve(data);
    }, 2000);

    // Add an onCancel handler to clean up resources or perform specific actions on cancellation
    // The onCancel method is provided by the CancelablePromise constructor.
    // It allows you to register a callback that will be executed if the promise is canceled.
    onCancel(() => {
      clearTimeout(timeoutId);
      console.log('Async operation canceled');
    });
  });
}

app.get('/', async (req, res) => {
  try {
    const promises = [
      simulateAsyncOperation('Hello, nais!'),
      simulateAsyncOperation('How are you?'),
      simulateAsyncOperation('Hope you are doing well!'),
      simulateAsyncOperation('Слава нації — смерть ворогам!')
    ];

    // Use Promise.all to execute all the promises concurrently
    const results = await Promise.all(promises);

    // Send the results back to the client
    res.send(results);
  } catch (error) {
    if (error.isCanceled) {
      res.status(500).send('Request canceled');
    } else {
      res.status(500).send('Internal Server Error');
    }
  }
});

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
