'use strict';

import * as swaggerValidator from 'swagger-tools/middleware/swagger-validator';
import * as swaggerMetadata from 'swagger-tools/middleware/swagger-metadata';


/*
  Convert client-side fetch API Request() object to stub of Node's http.IncomingMessage object.

  See https://github.com/bahmutov/express-service/blob/7a9b12fddb6ab8d6b348d4255fcc08b0cc1485a4/src/service.js#L89
  for a more complete implementation.
*/
async function getNodeStyleRequest(request){
  // get content type
  let contentType;
  try{
    contentType = request.headers.get('Content-Type').split(';')[0];
  }catch (err) {}

  // parse request data into dict based on content type
  let body = {};
  switch(contentType){
    case 'application/x-www-form-urlencoded':
      body = await request.clone().formData();
      break;
    case 'application/json':
      body = await request.clone().json();
      break;
    case 'multipart/form-data':
      throw "Support for multipart/form-data not implemented.";
  }

  // copy headers
  const headers = {};
  for (const pair of request.headers.entries())
    headers[pair[0].toLowerCase()] = pair[1];

  // return new object
  return {
    url: request.url,
    method: request.method,
    body: body,
    headers: headers,
    contentTypePrefix: contentType,
  };
}

/*
  Given an OpenAPI 2 json spec, return a function that validates a request against the spec.

  Input to returned function: fetch Request object.
  Response from returned function:
    On success, returns dict of whitelisted {query, body} for upstream request.
    On error, throws err with validationError = true and statusCode = response status code.
*/
export async function getValidator(apiSpec){
  let swaggerLoaded = false;
  const addSwaggerMetadata = swaggerMetadata(apiSpec, undefined, ()=>{swaggerLoaded=true});
  const validateRequest = swaggerValidator();
  while(!swaggerLoaded)
    await (async () => undefined)();

  return async (request)=>{
    const req = await getNodeStyleRequest(request);
    const res = {};

    // perform validation
    try{
      await new Promise((resolve, reject)=>{
        addSwaggerMetadata(req, res, ()=>{
          validateRequest(req, res, (e)=>{
            if(e)
              reject(e);
            else
              resolve();
          });
        });
      });
    }catch(err){
      // handle validation error
      err.statusCode = res.statusCode;
      err.validationError = true;
      throw err;
    }

    // handle route not found
    if(!req.swagger){
      const err = new Error(`${req.url} not found in ${JSON.stringify(apiSpec)}`);
      err.statusCode = 404;
      err.validationError = true;
      throw err;
    }

    // validation succeeded -- get approved params
    const params = {};
    for (const key of Object.keys(req.swagger.params)) {
      const param = req.swagger.params[key];
      if(param.originalValue === undefined)
        continue;
      const paramIn = param.schema.in;
      if(!params[paramIn])
        params[paramIn] = {};
      if(paramIn === "body")
        params.body = param.value;
      else
        params[paramIn][key] = param.value;
    }

    // prepare upstream request body
    let body;
    switch(req.contentTypePrefix){
      case 'application/x-www-form-urlencoded':
        if(params.formData)
          body = new URLSearchParams(params.formData);
        break;
      case 'application/json':
        if(params.body)
          body = JSON.stringify(params.body);
        break;
      case 'multipart/form-data':
        throw "Support for multipart/form-data not implemented.";
    }

    // prepare upstream request query params
    const query = params.query || {};

    console.log("Successful request", req, params, query, body);
    return {query, body};
  }
}