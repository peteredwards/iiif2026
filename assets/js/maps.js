/********************************************************
 * Leaflet fullscreen plugin
 * 
 * Modified to use a button rather than a link
 * 
 * @see https://github.com/Leaflet/Leaflet.fullscreen
 * 
 ********************************************************/
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['leaflet'], factory);
    } else if (typeof module !== 'undefined') {
        // Node/CommonJS
        module.exports = factory(require('leaflet'));
    } else {
        // Browser globals
        if (typeof window.L === 'undefined') {
            throw new Error('Leaflet must be loaded first');
        }
        factory(window.L);
    }
}(function (L) {
    L.Control.Fullscreen = L.Control.extend({
        options: {
            position: 'topleft',
            title: {
                'false': 'View Fullscreen',
                'true': 'Exit Fullscreen'
            }
        },

        onAdd: function (map) {
            var container = L.DomUtil.create('div', 'leaflet-control-fullscreen');
            this.fsbutton = document.createElement( 'button' );
            this.fsbutton.innerHTML = '<span class="visuallyhidden"></span>';
            this.fsbutton.classList.add( 'mapfullscreen-button' );
            this.fsbutton.classList.add( 'icon-resize-full' );
            container.appendChild( this.fsbutton );
        
            this._map = map;
            this._map.on('fullscreenchange', this._toggleTitle, this);
            this._toggleTitle();

            L.DomEvent.on(this.fsbutton, 'click', this._click, this);

            return container;
        },

        _click: function (e) {
            L.DomEvent.stopPropagation(e);
            L.DomEvent.preventDefault(e);
            this._map.toggleFullscreen(this.options);
        },

        _toggleTitle: function() {
            if ( this._map.isFullscreen() ) {
                this.fsbutton.classList.remove( 'icon-resize-full' );
                this.fsbutton.classList.add( 'icon-resize-small' );
            } else {
                this.fsbutton.classList.remove( 'icon-resize-small' );
                this.fsbutton.classList.add( 'icon-resize-full' );
            }
            this.fsbutton.setAttribute( 'aria-label', this.options.title[this._map.isFullscreen()] );
            this.fsbutton.setAttribute( 'title', this.options.title[this._map.isFullscreen()] );
            this.fsbutton.querySelector( 'span' ).innerText = this.options.title[this._map.isFullscreen()];
        }
    });

    L.Map.include({
        isFullscreen: function () {
            return this._isFullscreen || false;
        },

        toggleFullscreen: function (options) {
            var container = this.getContainer();
            if (this.isFullscreen()) {
                if (options && options.pseudoFullscreen) {
                    this._disablePseudoFullscreen(container);
                } else if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.webkitCancelFullScreen) {
                    document.webkitCancelFullScreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                } else {
                    this._disablePseudoFullscreen(container);
                }
            } else {
                if (options && options.pseudoFullscreen) {
                    this._enablePseudoFullscreen(container);
                } else if (container.requestFullscreen) {
                    container.requestFullscreen();
                } else if (container.mozRequestFullScreen) {
                    container.mozRequestFullScreen();
                } else if (container.webkitRequestFullscreen) {
                    container.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
                } else if (container.msRequestFullscreen) {
                    container.msRequestFullscreen();
                } else {
                    this._enablePseudoFullscreen(container);
                }
            }

        },

        _enablePseudoFullscreen: function (container) {
            L.DomUtil.addClass(container, 'leaflet-pseudo-fullscreen');
            this._setFullscreen(true);
            this.fire('fullscreenchange');
        },

        _disablePseudoFullscreen: function (container) {
            L.DomUtil.removeClass(container, 'leaflet-pseudo-fullscreen');
            this._setFullscreen(false);
            this.fire('fullscreenchange');
        },

        _setFullscreen: function(fullscreen) {
            this._isFullscreen = fullscreen;
            var container = this.getContainer();
            if (fullscreen) {
                L.DomUtil.addClass(container, 'leaflet-fullscreen-on');
            } else {
                L.DomUtil.removeClass(container, 'leaflet-fullscreen-on');
            }
            this.invalidateSize();
        },

        _onFullscreenChange: function (e) {
            var fullscreenElement =
                document.fullscreenElement ||
                document.mozFullScreenElement ||
                document.webkitFullscreenElement ||
                document.msFullscreenElement;

            if (fullscreenElement === this.getContainer() && !this._isFullscreen) {
                this._setFullscreen(true);
                this.fire('fullscreenchange');
            } else if (fullscreenElement !== this.getContainer() && this._isFullscreen) {
                this._setFullscreen(false);
                this.fire('fullscreenchange');
            }
        }
    });

    L.Map.mergeOptions({
        fullscreenControl: false
    });

    L.Map.addInitHook(function () {
        if (this.options.fullscreenControl) {
            this.fullscreenControl = new L.Control.Fullscreen(this.options.fullscreenControl);
            this.addControl(this.fullscreenControl);
        }

        var fullscreenchange;

        if ('onfullscreenchange' in document) {
            fullscreenchange = 'fullscreenchange';
        } else if ('onmozfullscreenchange' in document) {
            fullscreenchange = 'mozfullscreenchange';
        } else if ('onwebkitfullscreenchange' in document) {
            fullscreenchange = 'webkitfullscreenchange';
        } else if ('onmsfullscreenchange' in document) {
            fullscreenchange = 'MSFullscreenChange';
        }

        if (fullscreenchange) {
            var onFullscreenChange = L.bind(this._onFullscreenChange, this);

            this.whenReady(function () {
                L.DomEvent.on(document, fullscreenchange, onFullscreenChange);
            });

            this.on('unload', function () {
                L.DomEvent.off(document, fullscreenchange, onFullscreenChange);
            });
        }
    });

    L.control.fullscreen = function (options) {
        return new L.Control.Fullscreen(options);
    };
}));/**
 * Gets a JSON data file from a remote URL. Utilises localstorage
 * to cache the results.
 * @param {Object} options Information about the JSON file
 * @param {String} options.key Unique key used to store the data in localstorage (required)
 * @param {String} options.url URL of the JSON file (required)
 * @param {Integer} options.expiry How long to cache the results (in hours) default: 24
 * @param {Function} options.callback callback function with one parameter (JSON parsed response)
 */
function getJSON( options ) {
    if ( ! options.hasOwnProperty( 'key' ) || ! options.hasOwnProperty( 'url' ) ) {
        return;
    }
    if ( ! options.hasOwnProperty( 'expires' ) ) {
        options.expires = 24;
    }
    if ( storageAvailable( 'localStorage' ) && getWithExpiry( options.key ) ) {
        splog( "getting data '"+options.key+"' from local storage", "utilities.js" );
        if ( options.hasOwnProperty( 'callback' ) && typeof options.callback == 'function' ) {
            options.callback( JSON.parse( getWithExpiry( options.key ) ) );
        }
    } else {
        splog( "getting data '"+options.key+"' from "+options.url, "utilities.js" );
        var oReq = new XMLHttpRequest();
        oReq.addEventListener( 'load', function(){
            if ( storageAvailable( 'localStorage' ) ) {
                var expires = new Date().getTime() + ( options.expires * 60 * 60 * 1000 );
                splog( "storing data '" + options.key + "' in localstorage - expires " + expires, "utilities.js" );
                setWithExpiry( options.key, this.responseText, options.expires );
            }
            if ( options.hasOwnProperty( 'callback' ) && typeof options.callback == 'function' ) {
                options.callback( JSON.parse( this.responseText ) );
            }
        });
        oReq.open("GET", options.url);
        oReq.send();
    }
}

function canUseLocalStorage() {
    return true;
}

/**
 * Checks to see if localStorage is available
 * 
 * @param {string} type (localStorage or sessionStorage)
 * @returns {boolean}
 */
function storageAvailable( type ) {
    if ( ! canUseLocalStorage() ) {
        return false;
    }
    var storage;
    try {
        storage = window[ type ];
        var x = '__storage_test__';
        storage.setItem( x, x );
        storage.removeItem( x );
        return true;
    }
    catch(e) {
        return e instanceof DOMException && (
            // everything except Firefox
            e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // test name field too, because code might not be present
            // everything except Firefox
            e.name === 'QuotaExceededError' ||
            // Firefox
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            ( storage && storage.length !== 0 );
    }
}

/**
 * Sets a value in localStorage but adds expiry date
 * 
 * @param {string} key localStorage key
 * @param {string} value to set
 * @param {int} ttl Time to live (in hours)
 */
function setWithExpiry( key, value, ttl ) {
    const now = new Date()
    const item = {
        value: value,
        expiry: now.getTime() + ( ttl * 60 * 60 * 1000 ),
    }
    localStorage.setItem( key, JSON.stringify( item ) )
}

/**
 * Gets a value in localStorage but checks expiry date
 * first. If expired, localStorage key is removed and
 * null returned.
 * 
 * @param {string} key localStorage key
 */
function getWithExpiry( key ) {
    const itemStr = localStorage.getItem( key )
    if ( ! itemStr ) {
        return null;
    }
    const item = JSON.parse( itemStr )
    const now = new Date()
    if ( now.getTime() > item.expiry ) {
        localStorage.removeItem( key )
        return null
    }
    return item.value;
}

/**
 * Logs messages to console if debug flag is set
 * @param {string} message
 * @param {string} filename
 */
function splog( message, filename ) {
    if ( iiif.debug ) {
        let now = new Date();
        console.log( now.getHours() + ':' + now.getMinutes().toString().padStart(2, '0') + ':' + now.getSeconds().toString().padStart(2, '0') + '.' + now.getMilliseconds().toString().padStart(3, '0') + ' ' + filename.padEnd(12) + ' - ' + message );
    }
}
/**
 * Leafletjs functions for FoCC Maps
 */
document.addEventListener( 'DOMContentLoaded', () => {
    initMap();
});

/**
 * Initialise map and set listeners to set up markers when loaded
 */
function initMap() {
    if ( document.getElementById( 'map' ) === null ) {
        return;
    }
    iiif.map = L.map( 'map' ).setView([iiif.currentLoc.lat, iiif.currentLoc.lng], iiif.startZoom );
    /* change leaflet attribution */
    iiif.map.attributionControl.setPrefix( '<a href="https://leafletjs.com" target="external" title="A JavaScript library for interactive maps" aria-label="Leaflet - a JavaScript library for interactive maps"><svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="12" height="8"><path fill="#4C7BE1" d="M0 0h12v4H0z"></path><path fill="#FFD500" d="M0 4h12v3H0z"></path><path fill="#E0BC00" d="M0 7h12v1H0z"></path></svg> Leaflet</a>' );
    iiif.osm = L.tileLayer( 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 20,
        attribution: '© <a target="external" href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo( iiif.map );
    iiif.OpenCycleMap = L.tileLayer('https://api.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=953b59eb91064cc1a54bc7fe78939685', {
        maxZoom: 20,
        attribution: 'Maps: &copy; <a href="https://www.thunderforest.com/">Thunmderforest</a>, Data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    });
    iiif.Esri_WorldImagery = L.tileLayer( 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 20,
	    attribution: 'Tiles © Esri - Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    });
    iiif.map.addControl( new L.Control.Fullscreen( { position: 'topright' } ) );
    L.control.zoom( { position: 'bottomleft' } ).addTo( iiif.map );
    baseMaps = {
        "OpenStreetMap": iiif.osm,
        "OpenCycleMap": iiif.OpenCycleMap,
        "Esri WorldImagery": iiif.Esri_WorldImagery
    };
    overlayMaps = {};
    var layerControl = L.control.layers(baseMaps, overlayMaps, {collapsed:false}).addTo(iiif.map);
    iiif.mapLoaded = true;

    document.dispatchEvent( new Event( 'maploaded' ) );
}/**
 * Load features (in GeoJSON files) for different datasets within the map
 */
document.addEventListener( 'maploaded', () => {
    loadFeatures();
});

function loadFeatures() {
    for ( f of iiif.features ) {
        console.log( f );
        getJSON({
            "url": iiif.featuresURL + f.filename,
            "key": f.id,
            "callback": function( data ) {
                console.log(data);
                f.layerGroup = L.layerGroup();
                f.features = L.geoJSON( data, {
                    /**
                     * Add event handlers to features, and collect the features
                     * in arrays so we can build the selecters
                     */
                    onEachFeature: function( feature, layer ) {
                        layer.id = feature.properties.type + feature.id;
                        /**
                         * Add icons to the map
                         * TODO: This will currently add an icon, but the bounds are not set correctly.
                         * Ideally the GeoJSON would contain a point feature for each icon, but for now
                         * we will just use the polygon bounds.
                         */
                        // if ( feature.properties.type === 'icon' ) {
                        //     floor.iconlayer.addLayer( L.svgOverlay(getSVGIcon(feature.properties.icon), layer._latlngs) );
                        //     return;    
                        // }
                        /**
                         * Add icons to features on the map. These are SVG overlays which are positioned
                         * in the centre of each GeoJSON Polygon. At the moment, this accesses the _latlngs
                         * property of the layer (which I presume is intended to be private) so it would
                         * be good to use another means to loop through GeoJSON features which are comprised
                         * of multiple polygons.
                         */
                        let featureIcon = feature.properties.hasOwnProperty('icon') ? feature.properties.icon : false;
                        /**
                         * Add tooltips / popups
                         */
                        if ( feature.properties.type === 'area' ) {
                            layer.bindTooltip( buildFeaturePopup(feature), { className: 'area-tooltip' } );
                        } else {
                            layer.bindPopup( buildFeaturePopup(feature), { className: 'feature-tooltip' } );
                        }
                        /**
                         * Add interaction highlighting (only when entering the feature - the
                         * highlighting function needs to reset first)
                         */
                        // layer.on({
                        //     mouseover: highlightFeature,
                        //     focus: highlightFeature,
                        //     mouseout: resetFeatures,
                        //     blur: resetFeatures,
                        // });
                    },
                    /* style each feature and add appropriate className */
                    // style: function( feature ) {
                    //     return {
                    //         opacity: 0,
                    //         fillOpacity: ( ( feature.properties.type !== 'area' ) ? 0.5: 0.2 ),
                    //         className: feature.properties.class
                    //     };
                    // }
                });
                /* add the features geoJSON layer to the LayerGroup */
                f.layerGroup.addLayer( f.features );
                f.layerGroup.addTo(iiif.map);
            }
        });
    }
}

function buildFeaturePopup( feature ) {
    return "hello!";
}