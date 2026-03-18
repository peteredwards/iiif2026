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
                        layer.id = feature.properties.id;
                        /**
                         * Add tooltips / popups
                         */
                        if ( feature.properties.type === 'venue' ) {
                            layer.bindPopup( buildFeaturePopup(feature), { autoClose: false, minWidth: 300, className: feature.properties.type + '-popup' } ).openPopup();
                        } else {
                            layer.bindPopup( buildFeaturePopup(feature), { minWidth: 300, className: feature.properties.type + '-popup' } );
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
    let anchor_open = anchor_close = '';
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
        popupText += '<p>' + anchor_open + 'Visit the ' + feature.properties.name + ' website' + anchor_close + '</p>';
    }
    return popupText;
}
