import {definePreset} from "@primeuix/themes";
import Material from "@primeuix/themes/material";

/**
 * PrimeVue preset with the WashTrack palette (primary: #087FEA, navy: #123B7A / #0B192C).
 */
const WashTrackPreset = definePreset(Material, {
    semantic: {
        primary: {
            50: '#eaf8ff',
            100: '#d1efff',
            200: '#a6e0fb',
            300: '#6fcdf6',
            400: '#22b8f0',
            500: '#087fea',
            600: '#0768c4',
            700: '#0b54a0',
            800: '#123b7a',
            900: '#0f2f62',
            950: '#0b192c'
        }
    }
});

export default WashTrackPreset;
