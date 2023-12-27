// operationsController.js
const CancelablePromise = require("./cancelable-promise");

const simulateAsyncOperation = (data, timeout = 2000) => {
  return new CancelablePromise((resolve, reject, onCancel) => {
    const timeoutId = setTimeout(() => {
      resolve(data);
    }, timeout);

    onCancel(() => {
      clearTimeout(timeoutId);
      console.log("Async operation canceled");
    });
  });
};

const fetchData = () => {
  return simulateAsyncOperation({ data: "Hello, this is fetched data!" });
};

const processUserData = userData => {
  return simulateAsyncOperation({
    processedData: `${userData.data} Processing complete!`,
  });
};

const displayResult = result => {
  return simulateAsyncOperation({ displayResult: result });
};

const triggerOperations = async (req, res) => {
  try {
    const result = await fetchData().then(processUserData).then(displayResult);

    res.json({ message: "All operations completed successfully", result });
  } catch (error) {
    if (error.isCanceled) {
      res
        .status(500)
        .json({ error: "Operation canceled", message: error.message });
    } else {
      res
        .status(500)
        .json({ error: "Error during execution", message: error.message });
    }
  }
};

const cancelOperations = (req, res) => {
  // Assuming you have some logic to identify the ongoing operations and cancel them
  // For demonstration purposes, we'll just log a message
  console.log("Operations canceled by API request");
  res.json({ message: "Operations canceled successfully" });
};

module.exports = {
  simulateAsyncOperation,
  triggerOperations,
  cancelOperations,
};
