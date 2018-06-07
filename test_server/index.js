/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("/*\n  Harness for testing sw.js in the browser.\n  Loaded by test_server/index.html.\n*/\n\n/* Add button to document body to run a function. */\nfunction makeButton(title, onclick) {\n  var button = document.createElement('button');\n  button.innerHTML = title;\n  button.onclick = onclick;\n  document.body.appendChild(button);\n}\n\nif ('serviceWorker' in navigator) {\n  window.addEventListener('load', function() {\n    // register service worker\n    navigator.serviceWorker.register('sw.js').then(function(registration) {\n      // Registration was successful\n      console.log('ServiceWorker registration successful with scope: ', registration.scope);\n    }, function(err) {\n      // registration failed :(\n      console.log('ServiceWorker registration failed: ', err);\n    });\n\n    // *** tests ***\n    makeButton(\"URL outside API\", ()=>{fetch('/foo')}); // should stop processing when it realizes URL doesn't match\n    makeButton(\"non-existing URL\", ()=>{fetch('/api/foo')}); // should detect bad URL and send 404 upstream\n    makeButton(\"simple GET\", ()=>{fetch('/api/pets')}); // should send upstream\n    makeButton(\"GET with ignored param\", ()=>{fetch('/api/pets?foo=bar')});  // should filter out param\n    makeButton(\"GET with bad param\", ()=>{fetch('/api/pets?limit=bar')});  // should complain that limit isn't an int\n\n    // should accept JSON and post upstream\n    // TODO: should filter out parts of JSON that don't match spec\n    makeButton(\"post json\", ()=>{\n      fetch('/api/pets', {\n        method: 'POST',\n        headers: {\n          'Content-Type': 'application/json',\n        },\n        body: JSON.stringify({name: \"Sparky\", wontIgnoreThis: \"ignored\"}),\n      });\n    });\n\n    // should accept HTML post data and post upstream, filtering out unexpected params\n    makeButton(\"post formdata\", ()=>{\n      const fd = new URLSearchParams();\n      fd.append('name', 'Sparky');\n      fd.append('ignoreThis', 'ignored');\n      fetch('/api/pets', {\n        method: 'POST',\n        body: fd,\n      });\n    });\n\n  });\n}//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvaW5kZXguanMuanMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9zcmMvaW5kZXguanM/YjYzNSJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICBIYXJuZXNzIGZvciB0ZXN0aW5nIHN3LmpzIGluIHRoZSBicm93c2VyLlxuICBMb2FkZWQgYnkgdGVzdF9zZXJ2ZXIvaW5kZXguaHRtbC5cbiovXG5cbi8qIEFkZCBidXR0b24gdG8gZG9jdW1lbnQgYm9keSB0byBydW4gYSBmdW5jdGlvbi4gKi9cbmZ1bmN0aW9uIG1ha2VCdXR0b24odGl0bGUsIG9uY2xpY2spIHtcbiAgdmFyIGJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICBidXR0b24uaW5uZXJIVE1MID0gdGl0bGU7XG4gIGJ1dHRvbi5vbmNsaWNrID0gb25jbGljaztcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChidXR0b24pO1xufVxuXG5pZiAoJ3NlcnZpY2VXb3JrZXInIGluIG5hdmlnYXRvcikge1xuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGZ1bmN0aW9uKCkge1xuICAgIC8vIHJlZ2lzdGVyIHNlcnZpY2Ugd29ya2VyXG4gICAgbmF2aWdhdG9yLnNlcnZpY2VXb3JrZXIucmVnaXN0ZXIoJ3N3LmpzJykudGhlbihmdW5jdGlvbihyZWdpc3RyYXRpb24pIHtcbiAgICAgIC8vIFJlZ2lzdHJhdGlvbiB3YXMgc3VjY2Vzc2Z1bFxuICAgICAgY29uc29sZS5sb2coJ1NlcnZpY2VXb3JrZXIgcmVnaXN0cmF0aW9uIHN1Y2Nlc3NmdWwgd2l0aCBzY29wZTogJywgcmVnaXN0cmF0aW9uLnNjb3BlKTtcbiAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgIC8vIHJlZ2lzdHJhdGlvbiBmYWlsZWQgOihcbiAgICAgIGNvbnNvbGUubG9nKCdTZXJ2aWNlV29ya2VyIHJlZ2lzdHJhdGlvbiBmYWlsZWQ6ICcsIGVycik7XG4gICAgfSk7XG5cbiAgICAvLyAqKiogdGVzdHMgKioqXG4gICAgbWFrZUJ1dHRvbihcIlVSTCBvdXRzaWRlIEFQSVwiLCAoKT0+e2ZldGNoKCcvZm9vJyl9KTsgLy8gc2hvdWxkIHN0b3AgcHJvY2Vzc2luZyB3aGVuIGl0IHJlYWxpemVzIFVSTCBkb2Vzbid0IG1hdGNoXG4gICAgbWFrZUJ1dHRvbihcIm5vbi1leGlzdGluZyBVUkxcIiwgKCk9PntmZXRjaCgnL2FwaS9mb28nKX0pOyAvLyBzaG91bGQgZGV0ZWN0IGJhZCBVUkwgYW5kIHNlbmQgNDA0IHVwc3RyZWFtXG4gICAgbWFrZUJ1dHRvbihcInNpbXBsZSBHRVRcIiwgKCk9PntmZXRjaCgnL2FwaS9wZXRzJyl9KTsgLy8gc2hvdWxkIHNlbmQgdXBzdHJlYW1cbiAgICBtYWtlQnV0dG9uKFwiR0VUIHdpdGggaWdub3JlZCBwYXJhbVwiLCAoKT0+e2ZldGNoKCcvYXBpL3BldHM/Zm9vPWJhcicpfSk7ICAvLyBzaG91bGQgZmlsdGVyIG91dCBwYXJhbVxuICAgIG1ha2VCdXR0b24oXCJHRVQgd2l0aCBiYWQgcGFyYW1cIiwgKCk9PntmZXRjaCgnL2FwaS9wZXRzP2xpbWl0PWJhcicpfSk7ICAvLyBzaG91bGQgY29tcGxhaW4gdGhhdCBsaW1pdCBpc24ndCBhbiBpbnRcblxuICAgIC8vIHNob3VsZCBhY2NlcHQgSlNPTiBhbmQgcG9zdCB1cHN0cmVhbVxuICAgIC8vIFRPRE86IHNob3VsZCBmaWx0ZXIgb3V0IHBhcnRzIG9mIEpTT04gdGhhdCBkb24ndCBtYXRjaCBzcGVjXG4gICAgbWFrZUJ1dHRvbihcInBvc3QganNvblwiLCAoKT0+e1xuICAgICAgZmV0Y2goJy9hcGkvcGV0cycsIHtcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICB9LFxuICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7bmFtZTogXCJTcGFya3lcIiwgd29udElnbm9yZVRoaXM6IFwiaWdub3JlZFwifSksXG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIC8vIHNob3VsZCBhY2NlcHQgSFRNTCBwb3N0IGRhdGEgYW5kIHBvc3QgdXBzdHJlYW0sIGZpbHRlcmluZyBvdXQgdW5leHBlY3RlZCBwYXJhbXNcbiAgICBtYWtlQnV0dG9uKFwicG9zdCBmb3JtZGF0YVwiLCAoKT0+e1xuICAgICAgY29uc3QgZmQgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKCk7XG4gICAgICBmZC5hcHBlbmQoJ25hbWUnLCAnU3Bhcmt5Jyk7XG4gICAgICBmZC5hcHBlbmQoJ2lnbm9yZVRoaXMnLCAnaWdub3JlZCcpO1xuICAgICAgZmV0Y2goJy9hcGkvcGV0cycsIHtcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgIGJvZHk6IGZkLFxuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgfSk7XG59Il0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./src/index.js\n");

/***/ })

/******/ });