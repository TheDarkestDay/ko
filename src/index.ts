function processNextYeldable(generator, generatorInput, resolve, reject, shouldThrowError = false) {
  const currentGeneratorOutput = shouldThrowError ? generator.throw(generatorInput) : generator.next(generatorInput);
  const currentValue = currentGeneratorOutput.value;

  if (currentGeneratorOutput.done) {
    resolve(currentGeneratorOutput.value);
  } else {
    if (currentValue instanceof Promise) {
      currentValue
        .then((promiseValue) => {
          processNextYeldable(generator, promiseValue, resolve, reject);
        })
        .catch((error) => {
          processNextYeldable(generator, error, resolve, reject, true);
        })
    }
  
    if (Array.isArray(currentValue)) {
      const promises = currentValue.map((promiseOrGenerator) => {
        if (promiseOrGenerator instanceof Promise) {
          return promiseOrGenerator;
        }
  
        return new Promise((resolve, reject) => processNextYeldable(promiseOrGenerator, null, resolve, reject));
      });
  
      Promise.all(promises)
        .then((promiseValue) => {
          processNextYeldable(generator, promiseValue, resolve, reject);
        })
        .catch((error) => {
          processNextYeldable(generator, error, resolve, reject, true);
        });
    }
  }
}

function processPlainFunction(fn: Function, resolve, reject) {
  let returnValue;

  try {
    returnValue = fn();
  } catch (error) {
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

export function asyncify(generatorFnOrPlainFn: Function): Promise<any> {
  return new Promise((resolve, reject) => {
    if (generatorFnOrPlainFn.prototype.toString() === '[object Generator]') {
      processNextYeldable(generatorFnOrPlainFn(), null, resolve, reject);
    } else {
      processPlainFunction(generatorFnOrPlainFn, resolve, reject);
    }
  });
}