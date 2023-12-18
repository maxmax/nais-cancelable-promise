
const CancelableAsync = require(`./сancelable-async`)

describe('CancelableAsync', () => {

  test('resolves with the correct value', async () => {
    const asyncOperation = new CancelableAsync(async () => 'Success');

    const result = await asyncOperation;

    expect(result).toBe('Success');
  });

  // Тут ми використовуємо метод .catch, щоб перехопити помилку і потім явно викинути її,
  // щоб .rejects.toThrow міг коректно обробити ситуацію.
  test('rejects with the correct reason', async () => {
    const asyncOperation = new CancelableAsync(async () => {
      throw new Error('Failed');
    });

    await expect(
      asyncOperation.catch((error) => {
        throw error; // Ручное перебрасывание ошибки для использования .rejects
      })
    ).rejects.toThrow('Failed');
  });

  // test('cancels the promise', async () => {
  // });


  //test('executes finally callback even when canceled', async () => {
  // });

});
