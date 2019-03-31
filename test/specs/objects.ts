import assert from 'assert';

import { asyncify } from '../../src';

describe('asyncify(* -> yield {})', function(){
  it('should aggregate several promises', function(){
    return asyncify(function *(){
      const a = Promise.resolve('exports');
      const b = Promise.resolve('MIT');
      const c = Promise.resolve('devDependencies');

      const res = yield {
        a: a,
        b: b,
        c: c
      };

      assert.equal(3, Object.keys(res).length);
      assert(~res.a.indexOf('exports'));
      assert(~res.b.indexOf('MIT'));
      assert(~res.c.indexOf('devDependencies'));
    });
  })

  it('should noop with no args', function(){
    return asyncify(function *(){
      const res = yield {};
      assert.equal(0, Object.keys(res).length);
    });
  })

  it('should ignore non-thunkable properties', function(){
    return asyncify(function *(){
      const foo = {
        name: { first: 'tobi' },
        age: 2,
        address: Promise.resolve('test'),
        tobi: new Pet('tobi'),
        now: new Date(),
        falsey: false,
        nully: null,
        undefiney: undefined,
      };

      const res = yield foo;

      assert.equal('tobi', res.name.first);
      assert.equal(2, res.age);
      assert.equal('tobi', res.tobi.name);
      assert.equal(foo.now, res.now);
      assert.equal(false, foo.falsey);
      assert.equal(null, foo.nully);
      assert.equal(undefined, foo.undefiney);
      assert.equal(res.address, 'test');
    });
  })

  it('should preserve key order', function(){
    function delayTime(time){
      return new Promise((resolve) => {
        setTimeout(resolve, time);
      })
    }

    return asyncify(function *(){
      const before = {
        sun: delayTime(30),
        rain: delayTime(20),
        moon: delayTime(10)
      };

      const after = yield before;

      const orderBefore = Object.keys(before).join(',');
      const orderAfter = Object.keys(after).join(',');
      assert.equal(orderAfter, orderBefore);
    });
  })
})

function Pet(name) {
  this.name = name;
  this.something = function(){};
}