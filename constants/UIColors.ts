// constants/UIColors.js

// Brand (from screenshot)
const BRAND_PRIMARY    = '#4B49AC'; // deep indigo
const BRAND_PRIMARY_LT = '#98BDFF'; // ice blue
const BRAND_SUPPORT_1  = '#7DA0FA'; // sky
const BRAND_SUPPORT_2  = '#7978E9'; // periwinkle
const BRAND_ACCENT     = '#F3797E'; // coral (alerts/poor)

const NEUTRAL_900 = '#0F172A'; // text primary (slate-900)
const NEUTRAL_700 = '#334155'; // text strong
const NEUTRAL_600 = '#475569'; // text secondary
const NEUTRAL_200 = '#E2E8F0'; // borders
const NEUTRAL_100 = '#F1F5F9'; // soft panels
const NEUTRAL_050 = '#F6F6FF'; // whitish with a lavender tint


const UIColors = {
    // App surfaces
    background: NEUTRAL_050,      // page background
    surface: '#FFFFFF',           // cards/panels
    header: BRAND_PRIMARY,        // top bars / headings

    // Brand controls
    primary: BRAND_PRIMARY,       // buttons, active tabs
    primaryMuted: BRAND_PRIMARY_LT,
    secondary: BRAND_SUPPORT_2,   // secondary CTAs/accents
    accent: BRAND_SUPPORT_1,      // charts / highlights

    // Status
    success: '#16A34A',
    warning: '#FB923C',
    danger:  BRAND_ACCENT,

    // Text
    textPrimary: NEUTRAL_900,
    textStrong:  NEUTRAL_700,
    textSecondary: NEUTRAL_600,
    textLight: '#FFFFFF',

    // Lines
    border: NEUTRAL_200,

    // Chart helpers
    chartGood:  BRAND_SUPPORT_1,  // ✓ good
    chartNeutral: '#CBD5E1',      // neutral grey
    chartPoor:  BRAND_ACCENT,     // ✗ poor

    // soft tint of primary for selections
    primarySoft: 'rgba(75,73,172,0.10)',   // 4B49AC @ 10%
    primarySoftBorder: '#4B49AC',
};

export default UIColors;
