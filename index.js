const express = require('express');
const app = express();

const CancelableAsync = require('./cancelable-async');

app.get('/', async (req, res) => {
  const cancelableAsync = new CancelableAsync(async () => {
    await new Promise(resolve => setTimeout(resolve, 5000)); // Simulating a time-consuming operation
    return 'Hello, nais! Operation completed successfully!';
  });

  // Execute the cancelable async operation
  const result = await cancelableAsync.run();

  if (result.isCanceled) {
    res.send('Operation canceled!');
  } else {
    res.send(`Result: ${result}`);
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
