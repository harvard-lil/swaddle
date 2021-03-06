'use strict';

// import { getValidator } from "./validators/swagger-tools";
import { getValidator } from "./validators/sway";


let validators = {};

/* Add headers to response. */
function addHeaders(response, status){
  const newHeaders = new Headers(response.headers);
  newHeaders.append('X-Swaddle', status);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  });
}

/* Wrapper for fetch() that accepts a query: dict param and adds it to the URL's query string. */
function fetchWithQuery(url, options){
  const query = options.query || {};
  delete options.query;
  url = new URL(url);
  Object.keys(query).forEach(key => url.searchParams.append(key, query[key]));
  return fetch(url, options);
}

/* Given a domain origin, fetch origin/swagger.json and use it to create a validator function. */
async function loadValidator(apiUrl, request){
  console.log(`loading validator from ${apiUrl} ...`);

  // fetch JSON
  let response;
  try{
    response = await fetch(apiUrl, { cf: { apps: false } });
  }catch(err){
    console.log(`Error fetching ${apiUrl}:`, err);
    throw err;
  }

  // parse JSON
  const apiSpecText = await response.text();
  let apiSpec;
  try{
    apiSpec = JSON.parse(apiSpecText);
  }catch(err){
    console.log("Error parsing JSON response:", err, response, apiSpecText);
    throw err;
  }

  // load validator from JSON
  const validator = await getValidator(apiSpec);
  console.log("validator loaded");
  return [apiSpec, validator];
}

/* Validate a request. */
async function validateFetch(request){
  console.log("fetch event fired", request);

  const parsedUrl = new URL(request.url);
  const origin = parsedUrl.origin;
  let response;

  if(request.pathname === "/swagger.json"){
    return addHeaders(await fetch(request), 'ignored');
  }

  // Get validator for this URL, loading and caching if necessary.
  if(!validators[origin]) {
    validators[origin] = await loadValidator(origin + "/swagger.json", request);
  }
  let [apiSpec, validator] = validators[origin];

  // avoid urls outside of the swagger.json spec
  if(!parsedUrl.pathname.startsWith(apiSpec.basePath)){
    console.log(`Requested path ${parsedUrl.pathname} does not start with ${apiSpec.basePath} -- sending to origin.`);
    return addHeaders(await fetch(request), 'ignored');
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
        if(SWADDLE_CONFIG.DEBUG_TO_CLIENT)
          response = new Response(err.message, {status: err.statusCode});
        else
          response = await fetchWithQuery(origin + "/not-found", {
            query: {origUrl: request.url},
            headers: {Accept: request.headers.get('accept')},
          });

      // validation failed -- return 400
      }else {
        response = new Response(err.message, {status: err.statusCode});
      }

      return addHeaders(response, 'err');
    }

    // not a validation error
    throw err;
  }

  // validation passed -- send params upstream
  console.log("Validation succeeded", request, upstreamParams);
  const responsePromise = fetchWithQuery(parsedUrl.origin + parsedUrl.pathname, {
    method: request.method,
    headers: request.headers,
    query: upstreamParams.query,
    body: upstreamParams.body,
  });
  // return responsePromise;
  return addHeaders(await responsePromise, 'ok');
}

/* Catch errors thrown by promise, and either log them or return them to client depending on DEBUG setting. */
async function handleErrors(promiseResponse){
  try{
    return await promiseResponse;
  } catch (err) {
    // Display the error stack.
    console.log("Caught error while validating:", err);
    if(SWADDLE_CONFIG.DEBUG_TO_CLIENT)
      return new Response(err.stack || err);
    else
      throw err;
  }
}

function main(){
  // watch for fetch events
  addEventListener('fetch', event => event.respondWith(handleErrors(validateFetch(event.request))));
}

main();