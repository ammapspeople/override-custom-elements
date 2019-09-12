export default class extends HTMLElement {
    constructor() {
        super();

        const template = document.createElement('template');

        template.innerHTML = `
        <style>
            :host {
                display: inline-block;
            }
        </style>
        <div class="mapsindoors-directions"></div>
        `;
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }

    async connectedCallback() {
        // TODO: injectScript should see if the script is already loaded
        // await this.injectScript(`//maps.googleapis.com/maps/api/js?v=3&key=${this.googleApiKey}&libraries=geometry,places`);
        // await this.injectScript(`https://app.mapsindoors.com/mapsindoors/js/sdk/mapsindoors-3.4.0.js.gz?apikey=${this.mapsIndoorsSolutionId}`);

        window.addEventListener('mapsindoorslocationselected', e => {
            this.prepareDirections(e.detail);
        });
    }

    /* ------------------------------------------------------------------------- */

    prepareDirections(location) {
        this.emitEvent('mapsindoorssetroute', { origin: { lat: 57.0580564211464, lng: 9.94982129858636, floor: 0 }, destination: location });
    }

    injectScript(url) {
        return new Promise(resolve => {
            const scriptTag = document.createElement('script');
            scriptTag.setAttribute('type', 'text/javascript');
            scriptTag.setAttribute('src', url);
            document.body.appendChild(scriptTag);
            scriptTag.onload = () => resolve();
        });
    }

    emitEvent(name, detail) {
		this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true }));
    }
};
