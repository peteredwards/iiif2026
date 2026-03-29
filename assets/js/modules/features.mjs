import { 
    LayerGroup,
    GeoJSON,
    Marker,
    LatLng,
    DomEvent,
    DomUtil
} from 'leaflet';
import { iiif } from './config.mjs';
import { getJSON } from './utilities.mjs';
import { Icon, PinCirclePanel } from "leaflet-extra-markers";

export function loadFeatures() {
    getJSON({
        "url": iiif.featuresURL,
        "key": 'iiif2026features',
        "callback": function( data ) {
            iiif.featuresLayerGroup = new LayerGroup();
            iiif.featureLayer = new GeoJSON( data, {
                /**
                 * Add event handlers to features, and collect the features
                 * in arrays so we can build the selecters
                 */
                onEachFeature: function( feature, layer ) {
                    /**
                     * Add popups
                     */
                    layer.popup = layer.bindPopup( buildFeaturePopup(feature), { autoClose: false, minWidth: 300, className: feature.properties.type + '-popup' } );
                    if ( layer instanceof Marker && iiif.featureGroups.hasOwnProperty( feature.properties.type ) ) {
                        layer.setIcon( new Icon({
                            accentColor: iiif.featureGroups[feature.properties.type].accent,
                            color: iiif.featureGroups[feature.properties.type].color,
                            contentHtml:  iiif.featureGroups[feature.properties.type].iconSVG,
                            contentColor: "white",
                            scale: 1,
                            svg: PinCirclePanel,
                        }));
                        let fl = DomUtil.get(feature.properties.type+'-list');
                        layer.featureselecter = DomUtil.create('button', feature.properties.type+'-item', fl);
                        DomEvent.on(layer.featureselecter, 'click', selectFeature);
                        layer.featureselecter.setAttribute('data-target-id', feature.properties.id);
                        layer.featureselecter.innerText = feature.properties.name;
                    }
                    iiif.features.push( layer );
                },
                filter: function( feature, layer ) {
                    return ( ['annies','einstein','stadthouder'].indexOf(feature.properties.id) === -1 ? true: false );
                }
            });
            /* add the features geoJSON layer to the LayerGroup */
            iiif.featuresLayerGroup.addLayer( iiif.featureLayer );
            iiif.featuresLayerGroup.addTo(iiif.map);
        }
    });
}

export function loadRoutes() {
    getJSON({
        "url": iiif.routesURL,
        "key": 'iiif2026routes',
        "callback": function( data ) {
            iiif.routesLayerGroup = new LayerGroup();
            iiif.routesLayer = new GeoJSON( data, {
                /**
                 * Add event handlers to features, and collect the features
                 * in arrays so we can build the selecters
                 */
                onEachFeature: function( feature, layer ) {
                    if ( ! iiif.routes.hasOwnProperty(feature.properties.routeid) ) {
                        iiif.routes[feature.properties.routeid] = [layer];
                        let fl = DomUtil.get('route-list');
                        layer.featureselecter = DomUtil.create('button', feature.properties.type+'-item', fl);
                        DomEvent.on(layer.featureselecter, 'click', selectFeature);
                        layer.featureselecter.setAttribute('data-target-id', feature.properties.routeid);
                        layer.featureselecter.innerText = feature.properties.name;
                    } else {
                        iiif.routes[feature.properties.routeid].push(layer);
                    }
                    /**
                     * Add popups
                     */
                    //layer.popup = layer.bindPopup( buildFeaturePopup(feature), { autoClose: false, minWidth: 300, className: feature.properties.type + '-popup' } );
                },
                filter: function( feature, layer ) {
                    return ( ['annies','einstein','stadthouder'].indexOf(feature.properties.id) === -1 ? true: false );
                }
            });
            /* add the features geoJSON layer to the LayerGroup */
            iiif.routesLayerGroup.addLayer( iiif.routesLayer );
            iiif.routesLayerGroup.addTo(iiif.map);
        }
    });
}

/**
 * Buil;ds HTML to be used in the popups for each feature
 * @param {Object} feature 
 * @returns {String} HTML
 */
function buildFeaturePopup( feature ) {
    let anchor_open = '';
    let anchor_close = '';
    if ( feature.properties.url && feature.properties.url !== '' ) {
        anchor_open = '<a href="' + feature.properties.url + '" target="_external" title="Visit the ' + feature.properties.name + ' website">';
        anchor_close = '</a>';
    }
    let popupText = '<h3>' + anchor_open + feature.properties.name + anchor_close + '</h3>';
    if ( feature.properties.image && feature.properties.image !== '' ) {
        popupText += anchor_open + '<img class="popup-image" src="' + iiif.imagesURL + feature.properties.image + '" alt="' + feature.properties.name + '">' + anchor_close;
    }
    if ( feature.properties.description && feature.properties.description !== '' ) {
        popupText += '<p>' + feature.properties.description + '</p>';
    }
    if ( anchor_close !== '' ) {
        let re = /(Amsterdam|Leiden|The Hague) - /i
        popupText += '<p>' + anchor_open + 'Visit the ' + feature.properties.name.replace(re, '') + ' website' + anchor_close + '</p>';
    }
    popupText += '<p><a href="https://www.google.com/maps/dir/?api=1&travelmode=walking&destination=' + feature.geometry.coordinates[1] + ',' + feature.geometry.coordinates[0] + '" target="directions">Get directions</a></p>';
    return popupText;
}

function selectFeature(e) {
    let targetID = e.target.getAttribute('data-target-id');
    iiif.features.forEach( f => {
        if ( f.feature.properties.id === targetID ) {
            let targetPos = new LatLng(f.feature.geometry.coordinates[1], f.feature.geometry.coordinates[0]);
            iiif.map.panTo(targetPos, {animate: true });
            iiif.map.once('moveend', e => { f.openPopup(); });
        }
    })
}
