export default class extends HTMLElement {
    constructor() {
        super();

        const template = document.createElement('template');

        template.innerHTML = `
        <style>
            :host {
                display: inline-block;
            }
            .mapsindoors-search {
                width: 100%;
                max-height: 100vh;
                overflow-y: auto;
            }
        </style>
        <div class="mapsindoors-search">
            <form>
                <label for="mapsindoors-search-input">Find</label>
                <input type="search" name="search" id="mapsindoors-search-input">
            </form>
            <div id="mapsindoors-search-results"></div>
        </div>
        `;

        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        this.searchInputField = this.shadowRoot.querySelector('#mapsindoors-search-input');
        this.searchResultsElement = this.shadowRoot.querySelector('#mapsindoors-search-results');
    }

    async connectedCallback() {
        // TODO: injectScript should see if the script is already loaded
        // await this.injectScript(`//maps.googleapis.com/maps/api/js?v=3&key=${this.googleApiKey}&libraries=geometry,places`);
        // await this.injectScript(`https://app.mapsindoors.com/mapsindoors/js/sdk/mapsindoors-3.4.0.js.gz?apikey=${this.mapsIndoorsSolutionId}`);

        this.searchInputField.addEventListener('input', () => this.search());
        this.searchResultsElement.addEventListener('click', e => this.searchResultClicked(e));
    }

    /* ------------------------------------------------------------------------- */

    search(event) {
        const query = this.searchInputField.value;
        if (query.length >= 2) {
            mapsindoors.LocationsService.getLocations({ q: query }).then(locations => {
                this.locations = locations;

                this.searchResultsElement.innerHTML = '';
                for (const location of locations) {
                    this.searchResultsElement.insertAdjacentHTML('beforeend', this.createResultHtml(location));
                }

                // Filter locations on map
                let filter = locations.map(location => location.id );
                this.emitEvent('mapsindoorsfilter', filter);
            });
        } else {
            this.searchResultsElement.innerHTML = '';
            this.emitEvent('mapsindoorsfilter', null);
        }
    }

    createResultHtml(result) {
        return `
            <div class="mapsindoors-search-result" data-id="${result.id}">
                <h2>${result.properties.name}</h2>
            </div>
        `;
    }

    searchResultClicked(e) {
        const searchResult = e.target.closest('.mapsindoors-search-result');
        const location = this.locations.find(loc => loc.id === searchResult.dataset.id);
        this.emitEvent('mapsindoorsselectlocation', location);
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
