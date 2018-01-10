import maxRequests from './index';
import test from 'ava';

const sameItems = (a1, a2) => {
  if (!Array.isArray(a1) || !Array.isArray(a2)) return a1 === a2;
  if (a1.length !== a2.length) return false;
  let a2copy = [].concat(a2);
  return a1.every(i => {
    let idx = null;
    a2copy.find((a2i, index) => {
      if (sameItems(i, a2i)) {
        idx = index;
        return a2i;
      }
      return false;
    });
    if (idx === null) return false;
    a2copy = a2copy.slice(0, idx).concat(a2copy.slice(idx + 1));
    return true;
  });
};

const asyncRunner = async what =>
  new Promise(res =>
    setTimeout(_ => res(what), parseInt(Math.random() * 500, 10))
  );

const asyncRunnerFails = async what =>
  new Promise(rej =>
    setTimeout(
      _ => rej(new Error(`oops-${what}`)),
      parseInt(Math.random() * 500, 10)
    )
  );

test('maxRequest', async t => {
  const defer = maxRequests(3).deferCall;
  const arrP = [...Array(10).keys()].map(async i => [
    await defer(asyncRunner, i),
    i,
  ]);
  const rv = await Promise.all(arrP);

  // all called and resolved with the same value
  rv.map(([j, k]) => t.is(j, k));
  // all resolved ok
  t.true(sameItems([...Array(10).keys()], rv.map(i => i[0])));

  // and go on
  const rvSingle = await defer(asyncRunner, 1000);
  t.is(1000, rvSingle);
});

test('maxRequest - some may fail', async t => {
  const defer = maxRequests(2).deferCall;
  // await in parallel
  const promArr = [
    await defer(asyncRunner, 11),
    await defer(asyncRunner, 22),
    await defer(asyncRunnerFails, 'boom'),
    await defer(asyncRunner, 44),
    await defer(asyncRunner, 55),
    await defer(asyncRunner, 66),
  ];
  t.true(promArr[2] instanceof Error);
  t.is('oops-boom', promArr[2].message);
  t.deepEqual(promArr.slice(0, 2), [11, 22]);
  t.deepEqual(promArr.slice(3), [44, 55, 66]);
});

test('maxRequest - browser', async t => {
  global.window = {};
  const defer = maxRequests(3).deferCall;
  const arrP = [...Array(4).keys()].map(async i => [
    await defer(asyncRunner, i),
    i,
  ]);
  const rv = await Promise.all(arrP);

  rv.map(([j, k]) => t.is(j, k));
  t.true(sameItems([...Array(4).keys()], rv.map(i => i[0])));
});
