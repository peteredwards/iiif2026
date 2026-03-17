/**
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