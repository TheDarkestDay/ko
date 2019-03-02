function processNextYeldable(generator, generatorInput, resolve, reject, shouldThrowError = false) {
  const currentGeneratorOutput = shouldThrowError ? generator.throw(generatorInput) : generator.next(generatorInput);
  const currentValue = currentGeneratorOutput.value;

  if (currentValue === undefined) {
    resolve(generatorInput);
  }

  if (currentValue instanceof Promise) {
    currentValue
      .then((promiseValue) => {
        processNextYeldable(generator, promiseValue, resolve, reject);
      })
      .catch((error) => {
        processNextYeldable(generator, error, resolve, reject, true);
      })
  }
}

function processPlainFunction(fn: Function, resolve, reject) {
  let returnValue;

  try {
    returnValue = fn();
  } catch(error) {
    return reject(error);
  }

  if (returnValue instanceof Promise) {
    returnValue
      .then((resolvedValue) => resolve(resolvedValue))
      .catch((error) => reject(error))
  } else {
    resolve(returnValue);
  }
}

export function co(generatorOrPlainFn: Function): Promise<any> {
  return new Promise((resolve, reject) => {
    if (generatorOrPlainFn.prototype.toString() === '[object Generator]') {
      processNextYeldable(generatorOrPlainFn(), null, resolve, reject);
    } else {
      processPlainFunction(generatorOrPlainFn, resolve, reject);
    }
  });
}