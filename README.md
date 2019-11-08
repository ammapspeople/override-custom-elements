# MapsIndoors Custom Element Experiments

A collection of [custom elements](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements) of [MapsIndoors](https://mapsindoors.github.io/) functionality.

**Warning! Do not use the elements in production. They are unfinished, lacking, opinionated, untested experiments. Also, custom elements are not supported in all browsers.**

These experiments derives from the thought *"what would be the minimal code required to show a MapsIndoors map on a web page?"*

The answer so far is these two lines of JavaScript:

```javascript
import MapsindoorsMap from './elements/mapsindoors-map.js';
window.customElements.define('mapsindoors-map', MapsindoorsMap);
```
and this line of HTML:
```html
<mapsindoors-map google-api-key="AIzaSyD8lfGCYzBMiIaGZM2JqHkSDfQbGZ-2zOM" solution-id="demo"></mapsindoors-map>
```

## MapsIndoors Custom Elements family

The above three lines is a little lacking in feautures. So more custom elements are provided:

### `mapsindoors-map`

The mother element of all MapsIndoors custom elements. It builds on top of the [MapsIndoors SDK for Web](https://mapsindoors.github.io/web/v3/), setting up all necessary dependencies and boilerplate code.

### `mapsindoors-floor-selector`

Adds a floor selector to the map.

### `mapsindoors-search`

Input field where you can search for locations, and the results are shown both in a list and on the map.

### `mapsindoors-directions`

When used, clicking on a location on the map will draw route lines on the map and present route leg switching in the element itself.

For now, the origin location is fixed :)
