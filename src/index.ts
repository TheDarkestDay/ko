function getPromiseFromArray(arr: any[]): Promise<any[]> {
  const arrayOfPromises = arr.map((elem) => {
    if (elem instanceof Promise) {
      return elem;
    }

    if (Array.isArray(elem)) {
      return getPromiseFromArray(elem);
    }

    return new Promise((resolve, reject) => processNextYeldable(elem, null, resolve, reject));
  });

  return Promise.all(arrayOfPromises);
}


function getPromiseFromObject(obj: any): Promise<any> {
  const result = {};

  const promiseSequence = Object.keys(obj).reduce((acc, curr) => {
    const currentFieldValue = obj[curr];
    let currentPromise;

    if (currentFieldValue instanceof Promise) {
      currentPromise = currentFieldValue;
    } else if (currentFieldValue && currentFieldValue.constructor === Object) {
      currentPromise = getPromiseFromObject(currentFieldValue);
    } else {
      currentPromise = Promise.resolve(currentFieldValue);
    }

    return acc
      .then(() => currentPromise)
      .then((value) => result[curr] = value);
  }, Promise.resolve({}));

  return promiseSequence.then(() => result);
}

function processNextYeldable(generator, generatorInput, resolve, reject, shouldThrowError = false) {
  const currentGeneratorOutput = shouldThrowError ? generator.throw(generatorInput) : generator.next(generatorInput);
  const currentValue = currentGeneratorOutput.value;

  if (currentGeneratorOutput.done) {
    resolve(currentGeneratorOutput.value);
  } else {
    if (currentValue instanceof Promise) {
      // Handling promises
      currentValue
        .then((promiseValue) => {
          processNextYeldable(generator, promiseValue, resolve, reject);
        })
        .catch((error) => {
          processNextYeldable(generator, error, resolve, reject, true);
        });
    } else if (Array.isArray(currentValue)) {
      // Handling arrays
      const resolvedArrayPromise = getPromiseFromArray(currentValue);

      resolvedArrayPromise
        .then((promiseValue) => {
          processNextYeldable(generator, promiseValue, resolve, reject);
        })
        .catch((error) => {
          processNextYeldable(generator, error, resolve, reject, true);
        });
    } else {
      // Handling plain objects
      const resolvedObjectPromise = getPromiseFromObject(currentValue);

      resolvedObjectPromise
        .then((result) => {
          processNextYeldable(generator, result, resolve, reject);
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