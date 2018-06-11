/*
  Convert a fetch() Request object to an http.IncomingMessage-style object.
 */
export async function getNodeStyleRequest(request) {
  // parse url
  const parsedUrl = new URL(request.url);
  const query = {};
  for(const k of parsedUrl.searchParams.keys()) {
    query[k] = parsedUrl.searchParams.getAll(k);
    if(query[k].length === 1)
      query[k] = query[k][0];
  }

  // get content type
  let contentType;
  try {
    contentType = request.headers.get('Content-Type').split(';')[0];
  } catch (err) {
  }

  // parse request data into dict based on content type
  let body = {};
  switch (contentType) {
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
    query: query,
    contentTypePrefix: contentType,
  };
}

export function throwValidationError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.validationError = true;
  throw err;
}