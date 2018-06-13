'use strict';

const path = require('path');
const fs = require("fs");

const makeServiceWorkerEnv = require('service-worker-mock');
const makeFetchMock = require('service-worker-mock/fetch');

const swagger = fs.readFileSync(path.resolve(__dirname, 'fixtures/swagger.json'));

function fromPairs(pairs){
  const out = {};
  for (const pair of pairs)
    out[pair[0]] = pair[1];
  return out;
}

describe('Service worker', () => {
  beforeEach(() => {
    // patch environment to provide service worker objects like Request and Response
    Object.assign(global, makeServiceWorkerEnv());
    jest.resetModules();

    // create fake upstream server by mocking fetch()
    global.fetch = jest.fn(function(url, options){
      if(typeof url === "string")
        url = new URL(url);
      let response;
      if(url.pathname === '/swagger.json')
        response = new Response(swagger);
      else if(url.pathname === '/not-found')
        response = new Response("Not found.", {status: 404});
      else
         response = new Response(url.toString());
      return Promise.resolve(response);
    });

    // helper to validate requests
    global.checkRequest = async function(url, options){
      // perform request
      const request = new Request(url, options.requestOptions);
      const response = await self.trigger('fetch', request);

      // get upstream request from mocked fetch()
      const upstreamRequests = global.fetch.mock.calls;
      const [upstreamRequestUrl, upstreamRequestOptions] = upstreamRequests.slice(-1)[0];

      // should add the appropriate X-Swaddle header
      expect(response.headers.get('X-Swaddle')).toEqual(options.wafHeader || 'ok');
      // should have expected status
      expect(response.status).toEqual(options.status || 200);
      // should have 1 upstream request to fetch swagger.json, and 0 or 1 additional upstream requests depending on response code
      expect(upstreamRequests.length).toEqual({200: 2, 404: 2, 400: 1}[response.status]);
      // if rewrite is expected, should hit appropriate upstream URL
      if(options.upstreamUrl)
        expect(upstreamRequestUrl.toString()).toEqual(options.upstreamUrl);
      // check query param filtering
      if(options.upstreamSearchParams)
        expect(fromPairs(upstreamRequestUrl.searchParams.entries())).toEqual(options.upstreamSearchParams);
      // check body filtering
      if(options.upstreamBody)
        expect(upstreamRequestOptions.body).toEqual(options.upstreamBody);
    };

    // load service worker
    require('../test_server/sw');
  });

  test('should ignore urls outside base', async () => {
    await checkRequest('http://localhost/foo', {
      wafHeader: 'ignored',
    });
  });

  test('should send 404 for unknown url', async () => {
    await checkRequest('http://localhost/api/does-not-exist', {
      wafHeader: 'err',
      status: 404,
      upstreamUrl: 'http://localhost/not-found?origUrl='+encodeURIComponent('http://localhost/api/does-not-exist'),
    });
  });

  test('should strip unexpected get params', async () => {
    await checkRequest('http://localhost/api/pets?limit=1&ignore=bar', {
      upstreamSearchParams: {limit: '1'},
    });
  });

  test('should block bad params', async () => {
    await checkRequest('http://localhost/api/pets?limit=not-a-number', {
      wafHeader: 'err',
      status: 400,
    });
  });

  // this currently fails with "SyntaxError: Unexpected token u in JSON at position 0" because service-worker-mock does
  // not handle body correctly
  test.skip('should accept JSON post', async () => {
    await checkRequest('http://localhost/api/pets', {
      requestOptions: {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        // TODO: should filter out parts of JSON that don't match spec
        body: JSON.stringify({name: "Sparky", wontIgnoreThis: "ignored"}),
      },
      upstreamBody: JSON.stringify({name: "Sparky", wontIgnoreThis: "ignored"}),
    });
  });

  // this currently fails with "TypeError: request.clone(...).formData is not a function" because service-worker-mock does
  // not handle body correctly
  test.skip('should accept form post', async () => {
    await checkRequest('http://localhost/api/pets', {
      requestOptions: {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: new URLSearchParams({name: "Sparky", ignoreThis: "ignored"}),
      },
      upstreamBody: new URLSearchParams({name: "Sparky"}).toString(),
    });
  });
});