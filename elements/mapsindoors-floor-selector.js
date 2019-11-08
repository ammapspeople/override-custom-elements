/*
 * Implementation of MapsIndoors Web SDK floor selector as custom element.
 *
 * Note: Not a full implementation.
 */
export default class extends HTMLElement {
    constructor() {
        super();

        this.floorSelectorElement;
    }

    async connectedCallback() {
        // TODO: injectScript should see if the script is already loaded
        // await this.injectScript(`//maps.googleapis.com/maps/api/js?v=3&key=${this.googleApiKey}&libraries=geometry,places`);
        // await this.injectScript(`https://app.mapsindoors.com/mapsindoors/js/sdk/mapsindoors-3.4.0.js.gz?apikey=${this.mapsIndoorsSolutionId}`);

        window.addEventListener('mapsindoorsbuildingchanged', this.onbuildingChanged.bind(this));
        window.addEventListener('mapsindoorsfloorchanged', this.onfloorChanged.bind(this));
    }

    /* ------------------------------------------------------------------------- */

    onbuildingChanged(e) {
        if (!this.floorSelectorElement) {
            this.floorSelectorElement = document.createElement('div');
            this.floorSelectorElement.className = 'mapsindoors floor-selector'; // TODO: ?
            this.emitEvent('mapsindoorsaddcontrol', this.floorSelectorElement);
            this.emitEvent('mapsindoorssetstyle', this.createStyleElement());
        }

        const building = e.detail.building;
        const floor = e.detail.floor;

        this.floorSelectorElement.innerHTML = '';
        if (building) {
            const floors = building.floors;

            Object.keys(floors)
                .sort((a, b) => b - a)
                .forEach(level => {
                    const btn = document.createElement('a');
                    btn.innerHTML = floors[level].name;
                    btn.setAttribute('data-floor', level);
                    btn.addEventListener('click', () => {
                        this.emitEvent('mapsindoorssetfloor', level);
                    });
                    btn.className = floor === level ? 'active' : '';
                    this.floorSelectorElement.appendChild(btn);
                });
        }
    }

    onfloorChanged(e) {
        const floor = e.detail;
        const nodes = Array.from(this.floorSelectorElement.childNodes);

        nodes.forEach(node => {
            const classes = node.className.split(' ');

                if (node.getAttribute('data-floor') === floor) {
                    if (classes.indexOf('active') < 0) {
                        classes.push('active');
                    }
                } else {
                    classes.splice(classes.indexOf('active'), 1);
                }

                node.className = classes.join(' ');
        });

    }

    createStyleElement() {
        const styleElement = document.createElement('style');
        styleElement.type = 'text/css';
        styleElement.appendChild(document.createTextNode(`
        .mapsindoors.floor-selector {
            margin: 10px;
            position: absolute;
            border-radius: 2px;
            -webkit-box-shadow: 0 1px 2px 0 rgba(0,0,0,0.3);
            box-shadow: 0 1px 2px 0 rgba(0,0,0,0.3);
            width: 40px;
            font-family: Roboto, Arial, sans-serif;
            user-select: none;
            font-size: 18px;
        }

        .mapsindoors.floor-selector a {
            position: relative;
            display: block;
            float: none;
            margin-top: -1px;
            text-align: center;
            cursor: pointer;
            border-radius: 2px;
            background: #fff;
            z-index: 0;
            height: 40px;
            line-height: 40px;
        }

        .mapsindoors.floor-selector a:hover {
            background: #ddd;
            border-color: #999;
            z-index: 2;
        }

        .mapsindoors.floor-selector a.active {
            background: #ddd;
            border-color: #00b1ff;
            z-index: 2;
        }

        .mapsindoors.floor-selector a:not(:first-child):not(:last-child) {
            border-radius: 0;
        }

        .mapsindoors.floor-selector a:first-child:not(:last-child) {
            border-top-right-radius: 2px;
            border-bottom-right-radius: 0;
            border-bottom-left-radius: 0;
        }

        .mapsindoors.floor-selector a:last-child:not(:first-child) {
            border-top-right-radius: 0;
            border-bottom-left-radius: 2px;
            border-top-left-radius: 0;
        }
        `));

        return styleElement;
    }

    /* ------------------------------------------------------------------------- */

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
