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

const CancelablePromise = require('./cancelable-promise'); // Promise (ES6)
const CancelableAsync = require('./сancelable-async'); // async / await (ES7)

const app = express();
const port = 3000;

// CancelablePromise
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
    const result = await simulateAsyncOperation('Hello, nais!');
    res.send(result);
  } catch (error) {
    if (error.isCanceled) {
      res.status(500).send('Request canceled');
    } else {
      res.status(500).send('Internal Server Error');
    }
  }
});

// CancelableAsync
// Приклад маршруту Express, що використовує CancelableAsync
app.get('/api/async-operation', async (req, res) => {
  // Створюємо екземпляр CancelableAsync з асинхронною операцією
  const asyncOperation = new CancelableAsync(async () => {
    // Ваша асинхронна операція тут, наприклад, затримка на 3 секунди
    await new Promise((resolve) => setTimeout(resolve, 3000));
    return 'Слава Україні, Смерть ворогам!';
  });

  try {
    // Чекаємо на виконання асинхронної операції
    const result = await asyncOperation;

    // Відправляємо успішну відповідь
    res.status(200).json({ result });
  } catch (error) {
    // Перевіряємо, чи було скасовано операцію
    if (error.isCanceled) {
      console.log('Async operation canceled');
      res.status(400).json({ error: 'Operation canceled' });
    } else {
      // Обробляємо інші помилки
      console.error('Error during async operation:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
