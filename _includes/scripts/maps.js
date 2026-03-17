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
}