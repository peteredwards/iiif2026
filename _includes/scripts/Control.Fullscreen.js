import L, {Map, TileLayer, Marker, Circle, Polygon, Popup, Control, DomUtil, DomEvent} from 'leaflet';

/*
 * @class Control.Fullscreen
 * @inherits Control
 *
 * A basic fullscreen control. Extends `Control`.
 */

// @namespace Control.Fullscreen
// @constructor Control.Fullscreen(options: Control.Fullscreen options)
// Creates a fullscreen control
export class Fullscreen extends Control {

    static {
        // @section
        // @aka Control.Fullscreen options
        this.setDefaultOptions({
            // @option position: String = 'topleft'
            // The position of the control (one of the map corners). Possible values are `'topleft'`,
            // `'topright'`, `'bottomleft'` or `'bottomright'`
            position: 'topleft',
            // @option title: Object = {
            //     'false': 'View Fullscreen',
            //     'true': 'Exit Fullscreen'
            // }
            // The text on the fullscreen toggle button.
            title: {
                'false': 'View Fullscreen',
                'true': 'Exit Fullscreen'
            }
        });
    }

    onAdd(map) {
        var container = DomUtil.create('div', 'leaflet-control-fullscreen');
        this.fsbutton = document.createElement( 'button' );
        this.fsbutton.innerHTML = '<span class="visuallyhidden"></span>';
        this.fsbutton.classList.add( 'mapfullscreen-button' );
        this.fsbutton.classList.add( 'icon-resize-full' );
        container.appendChild( this.fsbutton );
    
        this._map = map;
        this._map.on('fullscreenchange', this._toggleTitle, this);
        this._toggleTitle();

        DomEvent.on(this.fsbutton, 'click', this._click, this);

        return container;
    }

    _click(e) {
        DomEvent.stopPropagation(e);
        DomEvent.preventDefault(e);
        this._map.toggleFullscreen(this.options);
    }

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
};

// @namespace Map
// @section Control options
// @option fullscreenControl: Boolean = false
// Whether a [fullscreen control](#control-fullscreen) is added to the map by default.
Map.mergeOptions({
	fullscreenControl: false
});

Map.addInitHook(function () {
	if (this.options.fullscreenControl) {
		// @section Controls
		// @property fullscreenControl: Control.Fullscreen
		// The default fullscreen control (only available if the
		// [`fullscreenControl` option](#map-fullscreencontrol) was `true` when creating the map).
		this.fullscreenControl = new Fullscreen();

		this.addControl(this.zoomControl);
	}
});
Map.addInitHook(function () {
    if (this.options.fullscreenControl) {
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
                DomEvent.on(document, fullscreenchange, onFullscreenChange);
            });

            this.on('unload', function () {
                DomEvent.off(document, fullscreenchange, onFullscreenChange);
            });
        }
    });
});
