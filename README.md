# openapi-waf

Service worker based whitelisting WAF configured by upstream OpenAPI spec

To try locally:

* `npm install`
* `npm run start`
    
To deploy to Cloudflare:

* [host OpenAPI 2.0 spec at origin/swagger.json]
* [populate scripts/config.json]
* `npm run deploy`
