'use strict';

const path = require('path');
const fs = require("fs");
const fetch = require("node-fetch");
const { spawnSync } = require( 'child_process' );

/*
  Compile sw.js and deploy to Cloudflare.
  Before running, create config.json from config.json.sample.
  To run: `npm run deploy`
*/
(async function(){
  // load config.json
  const config = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'config.json')));

  // call webpack to build from source
  console.log("Building dist/sw.js ...");
  const buildResult = spawnSync(
    'npx', [
      'webpack',
      '--config', 'webpack/prod.config.js',
      `--env.OPENAPI_WAF_CONFIG=${JSON.stringify(config.config)}`
    ],
    {
      stdio: 'inherit',
    });
  if(buildResult.status !== 0){
    console.log(`webpack build exited with status ${buildResult.status}:\n${buildResult.stdout}\n${buildResult.stderr}`);
    return;
  }

  // upload to cloudflare
  console.log("Uploading to Cloudflare ...");
  const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${config.zone}/workers/script`, {
    method: "PUT",
    headers: {
      "X-Auth-Email": config.email,
      "X-Auth-Key": config.key,
      "Content-Type": "application/javascript",
    },
    body: fs.createReadStream(path.resolve(__dirname, '../dist/sw.js')),
  });
  const responseText = await response.text();
  // console.log(responseText);
  const responseJson = JSON.parse(responseText);
  console.log("Success:", responseJson.success);
  if(!responseJson.success)
    console.log(responseJson.errors);
})();