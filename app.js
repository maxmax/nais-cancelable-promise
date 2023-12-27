// Below is an example of using the CancelablePromise class in a simple Node.js
// application with the Express framework:

// In this example, the simulateAsyncOperation function returns a CancelablePromise that resolves after a
// simulated asynchronous operation. The onCancel handler is used to clean up resources or perform specific
// actions when the promise is canceled.

const express = require('express');
const { triggerOperations, cancelOperations, simulateAsyncOperation } = require('./src/controllers/operations-сontroller');

const app = express();
const port = 3000;

// Endpoint to trigger asynchronous operations
app.get('/trigger-operations', triggerOperations);

// Endpoint to cancel ongoing operations
app.post('/cancel-operations', cancelOperations);

// Endpoint to trigger simulateAsyncOperation
app.get('/base', async (req, res) => {
  try {
    const promises = [
      simulateAsyncOperation('Hello, nais!'),
      simulateAsyncOperation('How are you?'),
      simulateAsyncOperation('Hope you are doing well!'),
      simulateAsyncOperation(0),
      simulateAsyncOperation(),
      simulateAsyncOperation(false),
      simulateAsyncOperation('Слава нації — смерть ворогам!')
    ];

    const results = await Promise.all(promises);

    res.send(results);
  } catch (error) {
    const errorMessage = error.isCanceled ? 'Request canceled' : 'Internal Server Error';
    res.status(500).send(errorMessage);
  }
});

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
