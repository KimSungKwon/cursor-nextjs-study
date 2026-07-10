// Figma: E Commerce 템플릿 (node-id=245-3108) 기반 컬러 토큰

export const commerceColors = {
  primary: {
    main: "#141718", // Neutral/07/100%
    dark: "#232627", // Neutral/06/100%
    light: "#343839", // Neutral/05/100%
  },
  background: {
    default: "#ffffff",
    paper: "#fefefe", // Neutral/01/100%
    light: "#f3f5f7", // Neutral/02/100%
    subtle: "#e8ecef", // Neutral/03/100%
  },
  text: {
    primary: "#000000", // Brand color
    secondary: "#141718", // Neutral/07/100%
    tertiary: "#6c7275", // Neutral/04/100%
    inverse: "#fefefe",
    disabled: "rgba(108, 114, 117, 0.5)", // Neutral/04/50%
  },
  border: {
    light: "#e8ecef", // Neutral/03/100%
    default: "rgba(108, 114, 117, 0.25)", // Neutral/04/25%
    dark: "#6c7275", // Neutral/04/100%
  },
  semantic: {
    info: "#377dff", // Blue
    success: "#38cb89", // Green
    warning: "#ffab00", // Yellow
    error: "#ff5630", // Red
  },
  neutral: {
    n01: "#fefefe",
    n02: "#f3f5f7",
    n03: "#e8ecef",
    n04: "#6c7275",
    n05: "#343839",
    n06: "#232627",
    n07: "#141718",
  },
} as const;

// Figma: Admin 템플릿 (node-id=245-10962) 기반 컬러 토큰

export const adminColors = {
  primary: {
    main: "#155dfc", // Blue Ribbon
    dark: "#0a0a0a", // Cod Gray
    light: "#4d49fc", // Dodger Blue
  },
  background: {
    default: "#ffffff",
    paper: "#f9fafb", // Athens Gray
    light: "#f3f4f6", // Athens Gray variant
    gray: "#cac5cd", // Admin 템플릿 보드 배경
    sidebar: "#141718", // Foundation /Grey/grey-500
  },
  text: {
    primary: "#0a0a0a", // Cod Gray
    secondary: "#717182", // Storm Gray
    tertiary: "#6a7282", // Pale Sky
    muted: "#99a1af", // Gray Chateau
    inverse: "#ffffff",
    disabled: "rgba(0, 0, 0, 0.5)", // Black 50%
  },
  border: {
    light: "#f3f4f6",
    default: "#e8e8e8", // Foundation /Grey/grey-50
    dark: "#939495", // Foundation /Grey/grey-200
  },
  semantic: {
    info: "#155dfc",
    success: "#38cb89",
    warning: "#f0b100", // Selective Yellow
    error: "#ff5630",
  },
  grey: {
    50: "#e8e8e8",
    100: "#b6b7b7",
    200: "#939495",
    300: "#626464",
    400: "#434546",
    500: "#141718",
    600: "#121516",
    700: "#0e1011",
    800: "#0b0d0d",
    900: "#080a0a",
  },
} as const;

export type CommerceColors = typeof commerceColors;
export type AdminColors = typeof adminColors;
