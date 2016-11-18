# oph-urls-js

NPM package containing JavaScript to load and resolve URLs in the browser.

For more information check out the documentation at [github.com/Opetushallitus/java-utils](https://github.com/Opetushallitus/java-utils/tree/master/java-properties)

# Test

`npm run test`

note: Add the file oph_urls.js to the javascript build process or refer to it in the main page with a script tag.

# Configuration for Javascript

note: Add the file oph_urls.js to the javascript build process or refer to it in the main page with a script tag.

## NPM @ [github.com/Opetushallitus/oph-urls-js](https://github.com/Opetushallitus/oph-urls-js)

Add to _package.json_:

```json
{
    "dependencies": {
        "oph-urls-js": "Opetushallitus/oph-urls-js#master"
    }
}
```

## Bower, example from suoritusrekisteri

* [.bowerrc](https://github.com/Opetushallitus/hakurekisteri/blob/master/.bowerrc) - define the directory where bower saves dependencies
* `bower init` - creates bower.json with user defined values, example: [bower.json](https://github.com/Opetushallitus/hakurekisteri/blob/master/bower.json) 
* `bower install --save https://raw.githubusercontent.com/Opetushallitus/oph-urls-js/master/oph_urls.js`

## ES6 projects
```javascript
import 'oph-urls-js'  // functions (urls, url, etc.) attached to window
```

## HTML

    <script type="text/javascript" src="static/js/oph_urls.js/index.js"></script>

## Javascript, Angular

    // load properties from a static file and a rest resource which returns override properties
    // start application after resources are loaded
    window.urls.loadFromUrls("suoritusrekisteri-web-frontend-url_properties.json", "rest/v1/properties").success(function() {
      // bootstrap angular application manually after properties are loaded
      angular.element(document).ready(function() {
        angular.bootstrap(document, ['myApp'])
      })
    })
    window.url("organisaatio-service.soap")tus/o