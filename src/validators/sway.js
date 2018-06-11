'use strict';

import * as Sway from 'sway';
import {getNodeStyleRequest, throwValidationError} from "../helpers";


export async function getValidator(apiSpec){
  const api = await Sway.create({definition: apiSpec});

  return async function(request){
    const req = await getNodeStyleRequest(request);

    // 404
    const path = api.getPath(req);
    if(path === undefined)
      throwValidationError(404, `${req.url} not found in ${JSON.stringify(apiSpec)}`);

    // check request method
    const operation = path.getOperation(req.method);
    if(operation === undefined)
      throwValidationError(400, "Invalid request method.");

    // check request
    if (operation.consumes.length > 0 && !req.headers['content-type'])
      req.headers['content-type'] = operation.consumes[0];
    const results = operation.validateRequest(req);
    if(results.errors.length > 0)
      throwValidationError(400, JSON.stringify(results.errors));

    // success -- return params
    const params = {};
    for (const param of operation.getParameters()) {
      const paramValue = param.getValue(req);
      if(paramValue.value === undefined)
        continue;
      const paramIn = param.in;
      if(!params[paramIn])
        params[paramIn] = {};
      if(paramIn === "body")
        params.body = paramValue.value;
      else
        params[paramIn][param.name] = paramValue.value;
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