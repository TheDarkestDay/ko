import assert from 'assert';

import { asyncify } from '../../src';

describe('asyncify(* -> yield [])', function(){
  it('should aggregate several promises', function(){
    return asyncify(function *(){
      var a = Promise.resolve(1);
      var b = Promise.resolve(2);
      var c = Promise.resolve(3);

      var res = yield [a, b, c];
      assert.equal(3, res.length);
      assert.equal(res[0], 1);
      assert.equal(res[1], 2);
      assert.equal(res[2], 3);
    });
  });

  it('should noop with no args', function(){
    return asyncify(function *(){
      var res = yield [];
      assert.equal(0, res.length);
    });
  });

  it('should support an array of generators', function(){
    return asyncify(function*(){
      var val = yield [function*(){ return 1 }()];
      assert.deepEqual(val, [1]);
    })
  });
})