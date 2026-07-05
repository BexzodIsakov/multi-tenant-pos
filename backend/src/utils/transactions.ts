export async function runWithRetry<T>(fn: () => Promise<T>): Promise<T> {
  while (true) {
    try {
      return await fn();
    } catch (err) {
      const hasErrorLabel = (err as { hasErrorLabel?: (label: string) => boolean }).hasErrorLabel;
      if (typeof hasErrorLabel === 'function' && hasErrorLabel.call(err, 'TransientTransactionError')) {
        continue;
      }
      throw err;
    }
  }
}
