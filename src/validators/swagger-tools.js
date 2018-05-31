'use strict';

import * as swaggerValidator from 'swagger-tools/middleware/swagger-validator';
import * as swaggerMetadata from 'swagger-tools/middleware/swagger-metadata';


async function getNodeStyleRequest(request){
  const body = await request.clone().blob();

  // see https://github.com/bahmutov/express-service/blob/7a9b12fddb6ab8d6b348d4255fcc08b0cc1485a4/src/service.js#L89
  return {
    url: request.url,
    method: request.method,
    body: body,
    headers: Object.assign({}, request.headers)
  };
}

// function getMiddleware(apiSpec){
//   return new Promise((resolve,reject) => initializeMiddleware(apiSpec, resolve));
// }

export async function getValidator(apiSpec){
  let addSwaggerMetadata = swaggerMetadata(apiSpec);
  let validateRequest = swaggerValidator();

  return async (request)=>{
    const req = await getNodeStyleRequest(request);
    const res = {};
    let validationErr;

    addSwaggerMetadata(req, res, ()=>{});
    validateRequest(req, res, (err)=>{
      if(err) {
        validationErr = {
          message: err.message,
          statusCode: res.statusCode
        };
      }else if(!req.swagger){
        validationErr = {
          message: 'Not found.',
          statusCode: 404,
        }
      }
    });

    return validationErr;
  }
}