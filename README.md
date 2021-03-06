# Max In Flight

Limits max. async running operations.

[![current version](https://img.shields.io/npm/v/max-in-flight.svg?style=flat-square)](https://www.npmjs.com/package/max-in-flight)
[![travis.ci](https://img.shields.io/travis/dacz/max-in-flight.svg?style=flat-square)](https://travis-ci.org/dacz/max-in-flight)
[![codecov](https://codecov.io/gh/dacz/max-in-flight/branch/master/graph/badge.svg)](https://codecov.io/gh/dacz/max-in-flight)
[![Greenkeeper badge](https://badges.greenkeeper.io/dacz/max-in-flight.svg)](https://greenkeeper.io/)
[![license](https://img.shields.io/github/license/dacz/max-in-flight.svg)](https://github.com/dacz/max-in-flight/blob/master/LICENSE)


## Install

```
npm install max-in-flight
```


## Motivation:

I needed to call great amount of requests to http endpoint from different places of my server side app (graphql bridge with huge query running) and I needed to be sure that only XX requests will be in flight otherwise the server will go down.

There are other solutions when you have existing array of async functions to call and you need to limit their processing (starting).

This was not the case, I needed kind of FIFO queue for such calls, because the requests were initiated in multiple places of an app.

## How to use it:

```javascript
import maxInFlight from 'maxInFlight';
// limit number of max. concurrent async operation
const defer = maxInFlight(3).deferCall;
async function() {
  const result = await defer(
    fetch,
    'http://some.com', ... any other args for fetch ...);
}

// alternatively you can use it to defer fn and use this defered fn then
const deferFetch = maxInFlight(3).deferFn(fetch);
const result = await deferFetch('http://some.com', ...);
```

Error is propagated to the defer so operation may fail and will not take down other operations in flight or any submitted in the future.

## License - MIT

