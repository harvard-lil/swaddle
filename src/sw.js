'use strict';

import { getValidator } from "./validators/swagger-tools";

function fetchWithParams(url, options){
  const params = options.params || {};
  delete options.params;
  url = new URL(url);
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
  return fetch(url, options);
}

async function validateFetch(basePath, event, validator){
  console.log("fetch event fired", event);

  // avoid urls outside of OpenAPI spec
  const parsedUrl = new URL(event.request.url);
  if(!parsedUrl.pathname.startsWith(basePath))
    return;

  const validationErr = await validator(event.request);

  console.log(event.request, validationErr);

  if(validationErr) {
    if(validationErr.statusCode === 404) {
      // TODO: what if any request attributes should be passed along in a 404?
      return fetchWithParams("/not-found", {
        params: {
          origUrl: event.request.url
        }
      });
    }else {
      event.respondWith(new Response(validationErr.message, {status: validationErr.statusCode}));
    }
  }else{
    return fetch(event.request, {
      credentials: 'include'
    });
  }
}

async function main(){
  const apiSpecResponse = await fetch("petstore.json");
  const apiSpec = apiSpecResponse.json();

  // load swagger validation functions
  const validator = await getValidator(apiSpec);

  // watch for fetch events
  self.addEventListener('fetch', event => event.waitUntil(validateFetch(apiSpec.basePath, event, validator)));
}

main();