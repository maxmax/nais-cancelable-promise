# Cancelable Promise Test

## Goal

Develop a class CancelablePromise that behaves similarly to the native Promise class in JavaScript but with the capability to cancel the entire promise chain before execution.

[TZ]

https://gitlab.com/nais.ua/cancelable-promise-test

### Enhanced the code example with multiple asynchronous requests in index.js

**In the provided example:**

1. An array promises is created, containing several asynchronous operations.
1. The Promise.all function is utilized for the parallel execution of all promises in the array.
1. The results of all operations are collected in the results array.
1. The results array is sent back to the client.

_This code enables the simultaneous execution of multiple asynchronous requests and sends their results back to the client in a single response._

![Result](https://github.com/maxmax/nais-cancelable-promise/raw/main/result.jpg)

- GET /trigger-operations
- POST /cancel-operations
- GET /base
