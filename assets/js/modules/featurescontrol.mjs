import {Control, Map, DomUtil, DomEvent } from 'leaflet';
import { iiif } from './config.mjs';

/*
 * @class Control.FeatureSelecter
 * @inherits Control
 *
 * A basic control to select features to display on a map which are loaded using GeoJSON. Extends `Control`.
 */

// @namespace Control.FeatureSelecter
// @constructor Control.FeatureSelecte(options: Control.FeatureSelecte options)
// Creates a feature selection control
export class FeatureSelecter extends Control {

	static {
		// @section
		// @aka Control.Zoom options
		this.setDefaultOptions({
			// @option position: String = 'topright'
			// The position of the control (one of the map corners). Possible values are `'topleft'`,
			// `'topright'`, `'bottomleft'` or `'bottomright'`
			position: 'topright',
            // @option features: Array = []
            // The names of groups of features on the map, with CSS classes
            features: []
		});
	}

	onAdd(map) {
		let container = DomUtil.create('div', 'leaflet-control-featureselecter' );
		let mainDetails = DomUtil.create('details', 'featuregroup-container', container );
		let mainSummary = DomUtil.create('summary', 'featuregroup-label', mainDetails);
		mainSummary.textContent = 'Locations';
        if ( iiif.hasOwnProperty('featureGroups') ) {
            for ( let f in iiif.featureGroups ) {
                this._createSummary( f, iiif.featureGroups[f], mainDetails );
            }
        }
        return container;
	}

	onRemove(map) {
		// Do nothing
	}

	_createSummary(fg, f, container) {
        let d = DomUtil.create('details', 'featuregroup-container', container);
		d.setAttribute('name', 'iiif-location-group'); 
		let s = DomUtil.create('summary', 'featuregroup-label', d);
		s.innerText = f.label;
        let dl = DomUtil.create('div', 'featuregroup-list', d);
        dl.id = fg + '-list';
		return d;
	}
}
