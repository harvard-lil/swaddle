'use strict';

import { getValidator } from "./validators/swagger-tools";


let validators = {};

/* Wrapper for fetch() that accepts a query: dict param and adds it to the URL's query string. */
function fetchWithQuery(url, options){
  const query = options.query || {};
  delete options.query;
  url = new URL(url);
  Object.keys(query).forEach(key => url.searchParams.append(key, query[key]));
  return fetch(url, options);
}

/* Given a domain origin, fetch origin/swagger.json and use it to create a validator function. */
async function loadValidator(origin){
  console.log(`loading validator for ${origin} ...`);
  const apiSpec = await (await fetch(origin + "/swagger.json")).json();
  const validator = await getValidator(apiSpec);
  console.log("validator loaded");
  return [apiSpec, validator];
}

/* Validate a request. */
async function validateFetch(request){
  console.log("fetch event fired", request);

  const parsedUrl = new URL(request.url);
  const origin = parsedUrl.origin;

  // Get validator for this URL, loading and caching if necessary.
  if(!validators[origin])
    validators[origin] = await loadValidator(origin);
  let [apiSpec, validator] = validators[origin];

  // avoid urls outside of the swagger.json spec
  if(!parsedUrl.pathname.startsWith(apiSpec.basePath)){
    console.log(`Requested path ${parsedUrl.pathname} does not start with ${apiSpec.basePath} -- sending to origin.`);
    return fetch(request);
  }

  // perform validation
  console.log(`Validating request to ${parsedUrl.pathname} ...`);
  let upstreamParams;
  try{
    upstreamParams = await validator(request);
  }catch(err){

    //handle validation error
    if(err.validationError){
      console.log("Validation failed:", request, err);

      // route not found -- report 404 upstream
      if(err.statusCode === 404) {
        // TODO: what if any request attributes should be passed along in a 404?
        return fetchWithQuery("/not-found", {query: {origUrl: request.url}});

      // validation failed -- return 400
      }else {
        return new Response(err.message, {status: err.statusCode});
      }
    }

    // not a validation error
    throw err;
  }

  // validation passed -- send params upstream
  console.log("Validation succeeded", request, upstreamParams);
  return fetchWithQuery(parsedUrl.origin + parsedUrl.pathname, {
    method: request.method,
    headers: request.headers,
    query: upstreamParams.query,
    body: upstreamParams.body,
    credentials: 'include',
  });
}

function main(){
  loadValidator();
  // watch for fetch events
  addEventListener('fetch', event => event.respondWith(validateFetch(event.request)));
}

main();