export default class extends HTMLElement {
    constructor() {
        super();

        const template = document.createElement('template');

        template.innerHTML = `
        <style>
            :host {
                display: inline-block;
            }
            .mapsindoors-map {
                width: 100%;
                height: 100%;
            }
            .loading {
                text-align: center;
                color: #999;
            }
            .map {
                display: none;
            }
            .map.active {
                display: block;
                width: 100%;
                height: 100%;
            }
        </style>
        <div class="mapsindoors-map">
            <p class="loading js-loading">&hellip;</p>
            <div class="map js-map"></div>
        </div>
        `;

        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        // Attributes
        this.googleApiKey = this.getAttribute('google-api-key');
        this.mapsIndoorsSolutionId = this.getAttribute('solution-id');
        this.lat = this.getAttribute('lat');
        this.lng = this.getAttribute('lng');
        this.zoom = this.getAttribute('zoom');

        this.mapElement = this.shadowRoot.querySelector('.js-map');

    }

    async connectedCallback() {
        await this.injectScript(`//maps.googleapis.com/maps/api/js?v=3&key=${this.googleApiKey}&libraries=geometry,places`);
        await this.injectScript(`https://app.mapsindoors.com/mapsindoors/js/sdk/mapsindoors-3.4.0.js.gz?apikey=${this.mapsIndoorsSolutionId}`);
        this.shadowRoot.querySelector('.js-loading').remove();
        this.createMap();
        this.mapElement.classList.add('active');
        this.setupListeners();
        this.directionsRenderer = new mapsindoors.DirectionsRenderer({ mapsindoors: this.mapsIndoors });
    }

    /* ------------------------------------------------------------------------- */

    createMap() {
        this.googleMap = new google.maps.Map(
            this.mapElement,
            {
                center: {
                    lat: parseFloat(this.lat || 0),
                    lng: parseFloat(this.lng || 0)
                },
                zoom: parseFloat(this.zoom || 0)
            }
        );
        this.mapsIndoors = new mapsindoors.MapsIndoors({ map: this.googleMap });
        this.infoWindow = new google.maps.InfoWindow();

        if (!this.lat || !this.lng || !this.zoom) {
            this.mapsIndoors.fitVenue();
        }
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

    setupListeners() {
        google.maps.event.addListener(this.mapsIndoors, 'click', location => {
            this.emitEvent('mapsindoorsclick', location);
            this.selectLocation(location);
        });

        google.maps.event.addListener(this.mapsIndoors, 'building_changed', () => {
            this.emitEvent('mapsindoorsbuildingchanged', { building: this.mapsIndoors.getBuilding(), floor: this.mapsIndoors.getFloor().toString() });
        });

        google.maps.event.addListener(this.mapsIndoors, 'floor_changed', () => {
            this.emitEvent('mapsindoorsfloorchanged', this.mapsIndoors.getFloor().toString());
        });

        window.addEventListener('mapsindoorsfilter', event => {
            if (event.detail) {
                this.mapsIndoors.filter(event.detail, true);
            } else {
                this.mapsIndoors.filter();
            }
        });

        window.addEventListener('mapsindoorsselectlocation', event => {
            this.selectLocation(event.detail);
        });

        window.addEventListener('mapsindoorssetroute', event => {
            this.drawRoute(event.detail);
        });

        window.addEventListener('mapsindoorssetrouteleg', event => {
            this.directionsRenderer.setLegIndex(event.detail);
        });

        window.addEventListener('mapsindoorssetfloor', event => {
            this.mapsIndoors.setFloor(event.detail);
        });

        window.addEventListener('mapsindoorsaddcontrol', event => {
            this.googleMap.controls[google.maps.ControlPosition.RIGHT_TOP].push(event.detail);
        });

        window.addEventListener('mapsindoorssetstyle', event => {
            this.shadowRoot.appendChild(event.detail);
        });
    }


    selectLocation(location) {
        const latLng = this.getLatLng(location);
        this.infoWindow.setContent(location.properties.name);
        this.infoWindow.setPosition(latLng);
        this.infoWindow.open(this.googleMap);
        this.googleMap.panTo(latLng);
        this.emitEvent('mapsindoorslocationselected', location);
    }

    drawRoute(route) {
        let args = {
            origin: route.origin,
            destination: {
                lat: route.destination.geometry.coordinates[1],
                lng: route.destination.geometry.coordinates[0],
                floor: route.destination.properties.floor
            }
        };
        mapsindoors.DirectionsService.getRoute(args).then(res => {
            this.directionsRenderer.setRoute(res.routes[0]);
            this.emitEvent('mapsindoorsrouteset', res.routes[0]);
        });
    }

    emitEvent(name, detail) {
		this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true }));
    }

    getLatLng(location) {
        let coords;
        if (location.geometry.type === 'Point') {
            coords = location.geometry.coordinates;
        } else {
            coords = location.properties.anchor.coordinates;
        }

        return { lat: coords[1], lng: coords[0] };
    }
};
