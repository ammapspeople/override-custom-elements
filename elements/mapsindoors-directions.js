export default class extends HTMLElement {
    constructor() {
        super();

        const template = document.createElement('template');

        template.innerHTML = `
        <style>
            :host {
                display: inline-block;
            }

            .mapsindoors-directions-legs-overview {
                display: flex;
                justify-content: space-around;
            }

            .mapsindoors-directions-leg {
                flex: 1;
                background-color: #eee;
                margin: .5rem;
                padding: .5rem;
                display: flex;
                border-radius: 1rem;
                cursor: pointer;
            }

            .mapsindoors-directions-leg.active {
                box-shadow: 0 0 0 3px green;
            }

            .mapsindoors-directions-leg-index {
                color: #aaa;
                padding-right: 1rem;
            }

            .mapsindoors-directions-leg-description {
                flex: 1;
                text-align: left;
            }
        </style>
        <div class="mapsindoors-directions-legs-overview" id="mapsindoors-directions-legs-overview"></div>
        `;
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        // Attributes
        this.fromLat = this.getAttribute('from-lat');
        this.fromLng = this.getAttribute('from-lng');
        this.fromFloor = this.getAttribute('from-floor');

        this.legsOverviewElement = this.shadowRoot.querySelector('#mapsindoors-directions-legs-overview');
    }

    static get observedAttributes() {
        return ['from-lat', 'from-lng', 'from-floor'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'from-lat':
                this.fromLat = newValue;
                break;
            case 'from-lng':
                this.fromLng = newValue;
                break;
            case 'from-floor':
                this.fromFloor = newValue;
                break;
        }
    }

    async connectedCallback() {
        // TODO: injectScript should see if the script is already loaded
        // await this.injectScript(`//maps.googleapis.com/maps/api/js?v=3&key=${this.googleApiKey}&libraries=geometry,places`);
        // await this.injectScript(`https://app.mapsindoors.com/mapsindoors/js/sdk/mapsindoors-3.4.0.js.gz?apikey=${this.mapsIndoorsSolutionId}`);

        window.addEventListener('mapsindoorslocationselected', e => {
            this.prepareDirections(e.detail);
        });

        window.addEventListener('mapsindoorsrouteset', e => {
            this.legsOverviewElement.innerHTML = '';
            this.renderLegsOverview(e.detail);
        });
    }

    /* ------------------------------------------------------------------------- */

    prepareDirections(location) {
        this.emitEvent('mapsindoorssetroute', { origin: { lat: this.fromLat, lng: this.fromLng, floor: this.fromFloor }, destination: location });
    }

    renderLegsOverview(route) {
        route.legs.forEach((leg, legIndex) => {
            const legElement = document.createElement('div');
            legElement.classList.add('mapsindoors-directions-leg');
            if (legIndex === 0) {
                legElement.classList.add('active');
            }
            legElement.innerHTML = `
                <span class="mapsindoors-directions-leg-index">${legIndex + 1}</span>
                <span class="mapsindoors-directions-leg-description">
                    ${leg.distance.text}<br>
                    <small>${leg.duration.text}</small>
                </span>
            `;
            legElement.addEventListener('click', () => {
                const siblings = legElement.parentNode.querySelectorAll('.mapsindoors-directions-leg');
                [].slice.call(siblings).forEach(sibling => {
                    sibling.classList.remove('active');
                });
                this.emitEvent('mapsindoorssetrouteleg', legIndex);
                legElement.classList.add('active');
            })
            this.legsOverviewElement.insertAdjacentElement('beforeend', legElement);
        });
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
