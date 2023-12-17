const CancelableAsync = require('./cancelable-async');

describe('CancelableAsync tests', () => {
  test('should execute and resolve successfully', async () => {
    const expectedResult = 'Operation completed successfully!';
    const executor = jest.fn(async () => {
      return expectedResult;
    });

    const cancelableAsync = new CancelableAsync(executor);
    const result = await cancelableAsync.run();

    expect(executor).toHaveBeenCalled();
    expect(result).toBe(expectedResult);
  });

  test('should handle cancellation and resolve with cancellation indication', async () => {
    const executor = jest.fn(async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return 'Operation completed successfully!';
    });

    const cancelableAsync = new CancelableAsync(executor);

    // Start execution but cancel before completion
    setTimeout(() => {
      cancelableAsync.cancel();
    }, 500);

    const result = await cancelableAsync.run();

    expect(executor).toHaveBeenCalled();
    expect(result).toEqual({ isCanceled: true });
  });

  test('should reject with an actual error if not canceled', async () => {
    const expectedError = new Error('Custom error');
    const executor = jest.fn(async () => {
      throw expectedError;
    });

    const cancelableAsync = new CancelableAsync(executor);

    try {
      await cancelableAsync.run();
      // The line above should throw an error, and this block should not be reached
    } catch (error) {
      expect(executor).toHaveBeenCalled();
      expect(error).toBe(expectedError);
    }
  });

  test('should resolve with cancellation indication if canceled during execution', async () => {
    const executor = jest.fn(async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return 'Operation completed successfully!';
    });

    const cancelableAsync = new CancelableAsync(executor);

    // Start execution and cancel immediately
    cancelableAsync.cancel();
    const result = await cancelableAsync.run();

    expect(executor).not.toHaveBeenCalled();
    expect(result).toEqual({ isCanceled: true });
  });

  test('should handle immediate cancellation before execution', async () => {
    const executor = jest.fn(async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return 'Operation completed successfully!';
    });

    const cancelableAsync = new CancelableAsync(executor);

    // Cancel immediately without starting execution
    cancelableAsync.cancel();
    const result = await cancelableAsync.run();

    expect(executor).not.toHaveBeenCalled();
    expect(result).toEqual({ isCanceled: true });
  });
});
