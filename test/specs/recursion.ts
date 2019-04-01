import assert from 'assert';
import { asyncify } from '../../src';

describe('asyncify() recursion', function(){
  it('should aggregate arrays within arrays', function(){
    return asyncify(function *(){
      const a = Promise.resolve('Promise A');
      const b = Promise.resolve('Promise B');
      const c = Promise.resolve('Promise C');

      const res = yield [a, [b, c]];
      assert.equal(2, res.length);
      assert.equal(res[0], 'Promise A');
      assert.equal(2, res[1].length);
      assert.equal(res[1][0], 'Promise B');
      assert.equal(res[1][1], 'Promise C');
    });
  })

  it('should aggregate objects within objects', function(){
    return asyncify(function *(){
      const a = Promise.resolve('Promise A');
      const b = Promise.resolve('Promise B');
      const c = Promise.resolve('Promise C');

      const res = yield {
        0: a,
        1: {
          0: b,
          1: c
        }
      };

      assert.equal(res[0], 'Promise A');
      assert.equal(res[1][0], 'Promise B');
      assert.equal(res[1][1], 'Promise C');
    });
  })
})