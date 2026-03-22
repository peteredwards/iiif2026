import { initMap } from './modules/core.mjs';
import { loadFeatures } from './modules/features.mjs';
/**
 * Initialise the map
 */
document.addEventListener( 'DOMContentLoaded', () => {
    initMap();
});
document.addEventListener( 'maploaded', (e) => {
    loadFeatures();
});
