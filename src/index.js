/*
  Harness for testing sw.js in the browser.
  Loaded by test_server/index.html.
*/

/* Add button to document body to run a function. */
function makeButton(title, onclick) {
  var button = document.createElement('button');
  button.innerHTML = title;
  button.onclick = onclick;
  document.body.appendChild(button);
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    // register service worker
    navigator.serviceWorker.register('sw.js').then(function(registration) {
      // Registration was successful
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, function(err) {
      // registration failed :(
      console.log('ServiceWorker registration failed: ', err);
    });

    // *** tests ***
    makeButton("URL outside API", ()=>{fetch('/foo')}); // should stop processing when it realizes URL doesn't match
    makeButton("non-existing URL", ()=>{fetch('/api/foo')}); // should detect bad URL and send 404 upstream
    makeButton("simple GET", ()=>{fetch('/api/pets')}); // should send upstream
    makeButton("GET with param", ()=>{fetch('/api/pets?limit=1&ignore=bar')});  // should filter out param
    makeButton("GET with bad param", ()=>{fetch('/api/pets?limit=bar')});  // should complain that limit isn't an int

    // should accept JSON and post upstream
    // TODO: should filter out parts of JSON that don't match spec
    makeButton("post json", ()=>{
      fetch('/api/pets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({name: "Sparky", wontIgnoreThis: "ignored"}),
      });
    });

    // should accept HTML post data and post upstream, filtering out unexpected params
    makeButton("post formdata", ()=>{
      const fd = new URLSearchParams();
      fd.append('name', 'Sparky');
      fd.append('ignoreThis', 'ignored');
      fetch('/api/pets', {
        method: 'POST',
        body: fd,
      });
    });

  });
}