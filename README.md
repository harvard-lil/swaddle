# Swaddle

*Alpha: this is a security project that has not received external review. Use your own judgment.*

Swaddle is a web application firewall that makes sure upstream servers only receive requests that comply with the
upstream server's published OpenAPI spec. It runs on Cloudflare Service Workers (or any reverse proxy implementing
the service workers API).

## Deployment

* publish your OpenAPI spec to yoursite.com/swagger.json
* enable service workers in your Cloudflare account
* clone git repo
* npm install
* copy scripts/config.json.sample to scripts/config.json
* run `npm run deploy` to build the service worker and deploy it to Cloudflare
* enable the service worker for yoursite.com/* in Cloudflare

## Uploading to Cloudflare

Config variables are set in scripts/config.json. You must provide your cloudflare email, API key, and zone ID to
let `npm run deploy` automatically upload dist/sw.js for you. Alternatively, you could run `npm run build` and use
the Cloudflare API or web interface to upload dist/sw.js for yourself.

## Debugging

Some issues are difficult to debug in the Cloudflare Service Workers console, and require debugging of live requests.
To send stack traces and path resolution errors directly to the client, set `DEBUG_TO_CLIENT: true` in scripts/config.json.

## Swaddle's firewall behavior

Swaddle checks all incoming requests, and takes one of four actions:

* Requested URLs not beginning with the OpenAPI `basePath` are passed through without inspection.
    * Response header: `X-Swaddle: ignored`
* Requested URLs beginning with the OpenAPI `basePath`, but not listed in the OpenAPI `paths`, result in an upstream
  request to `/not-found?origUrl=<path>`.
    * Response header: `X-Swaddle: err`
    * Responde status: 404
* Requested URLs listed in the OpenAPI `paths` are checked for validity by the Sway library.
    * Valid requests are sent upstream and responses relayed to the client. Unknown query and body parameters are filtered out.
        * Response header: `X-Swaddle: ok`
    * Invalid requests send an error from the Sway library to the client.
        * Response header: `X-Swaddle: err`
        * Response status: 400

## Local development

To develop the server locally, run `npm run start` and load http://localhost:8080 in a browser that supports service
workers.

To run tests, run `npm run build-dev` and then `npm run test`.

## TODO/limitations/missing features:

* OpenAPI 3 support (currently only tested with OpenAPI 2).
* Support `multipart/form-data` requests.
* Support file uploads.
* Filter unexpected values from JSON body parameters (filtering currently only works on query and post parameters).
* Validate responses as well as requests.