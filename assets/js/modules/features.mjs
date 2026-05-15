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
            /**
             * Analyse route data before creating GeoJSON layers
             * Each route has its own GoeJSON layer with just the legs
             * of that route in it
             */
            //let routesJSON = JSON.parse(data);
            for ( let f of data.features ) {
                if ( ! iiif.routes.hasOwnProperty(f.properties.routeid) ) {
                    iiif.routes[f.properties.routeid] = {
                        name: f.properties.routename,
                        legs: [f.properties.leg],
                        services: [f.properties.service],
                        features: [f]
                    };
                    let fl = DomUtil.get('route-list');
                    let rb = DomUtil.create('button', f.properties.type+'-item', fl);
                    DomEvent.on(rb, 'click', selectRoute);
                    rb.setAttribute('data-target-id', f.properties.routeid);
                    rb.innerText = f.properties.routename;
                } else {
                    iiif.routes[f.properties.routeid].legs.push(f.properties.leg);
                    iiif.routes[f.properties.routeid].services.push(f.properties.service);
                    iiif.routes[f.properties.routeid].features.push(f);
                }
            }
            for ( let r in iiif.routes ) {
                iiif.routes[r].layer = new GeoJSON(null,{
                    onEachFeature: function( feature, layer ) {
                        layer.bindPopup( buildRoutePopup(feature), { autoClose: true, minWidth: 300, className: feature.properties.mode + '-popup' } );
                    },
                    style: function(feature) {
                        return iiif.routeStyles[feature.properties.mode];
                    }
                }).addTo(iiif.map);
                for ( let f of iiif.routes[r].features ) {
                    iiif.routes[r].layer.addData(f);
                }
            }
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
    if ( feature.properties.menu_url || feature.properties.veggiekarte_url || anchor_close !== "" ) {
        popupText += '<ul>';
        let re = /(Amsterdam|Leiden|The Hague) - /i
        let truncname = feature.properties.name.replace(re, '');
        if ( anchor_close !== '' ) {
            popupText += '<li>' + anchor_open + 'Visit the ' + truncname + ' website' + anchor_close + '</li>';
        }
        if ( feature.properties.menu_url && feature.properties.menu_url !== '' ) {
            popupText += '<li><a href="' + feature.properties.menu_url + '" target="_external" title="View the menu of ' + truncname + '">View the menu</a></li>';
        }
        if ( feature.properties.veggiekarte_url && feature.properties.veggiekarte_url !== '' ) {
            popupText += '<li><a href="' + feature.properties.veggiekarte_url + '" target="_external" title="Visit the Veggie Karte site at ' + truncname + '">See on Veggie Karte</a></li>';
        }
        popupText += '</ul>';
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

function selectRoute(e) {
    let targetID = e.target.getAttribute('data-target-id');
    console.log(targetID);
}

/**
 * Builds HTML to be used in the popups for each leg of a route
 * @param {Object} feature 
 * @returns {String} HTML
 */
function buildRoutePopup( feature ) {
    let route = iiif.routes[feature.properties.routeid];
    let popupText = '<h3>' + route.name + '</h3><p>Steps on this route:</p></ol>';
    for ( let i = 0; i < route.legs.length; i++ ) {
        popupText += '<li>'
        popupText += feature.properties.leg === route.legs[i]? '<strong>' + route.legs[i] + '</strong>': route.legs[i];
        popupText += route.services[i]? ' (' + route.services[i] + ')': '';
        popupText += '</li>';
    }
    popupText += '</ol>';
    return popupText;
}
