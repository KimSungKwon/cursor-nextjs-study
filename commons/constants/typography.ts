// Figma Text Styles (E Commerce 템플릿) 기반 타이포그래피 토큰
// next/font 변수(--font-poppins 등)와 globals.css 토큰을 함께 사용

const poppins = 'var(--font-poppins, "Poppins"), "Poppins", sans-serif';
const inter = 'var(--font-inter, "Inter"), "Inter", sans-serif';
const spaceGrotesk =
  'var(--font-space-grotesk, "Space Grotesk"), "Space Grotesk", sans-serif';

export const commerceTypography = {
  fontFamily: {
    heading: poppins,
    body: inter,
    navigation: spaceGrotesk,
  },
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  hero: {
    fontFamily: poppins,
    fontSize: "96px",
    fontWeight: 500,
    lineHeight: "110%",
  },
  headline: {
    h1: { fontFamily: poppins, fontSize: "80px", fontWeight: 500, lineHeight: "110%" },
    h2: { fontFamily: poppins, fontSize: "72px", fontWeight: 500, lineHeight: "110%" },
    h3: { fontFamily: poppins, fontSize: "54px", fontWeight: 500, lineHeight: "110%" },
    h4: { fontFamily: poppins, fontSize: "40px", fontWeight: 500, lineHeight: "110%" },
    h5: { fontFamily: poppins, fontSize: "34px", fontWeight: 500, lineHeight: "120%" },
    h6: { fontFamily: poppins, fontSize: "28px", fontWeight: 500, lineHeight: "120%" },
    h7: { fontFamily: poppins, fontSize: "20px", fontWeight: 500, lineHeight: "120%" },
  },
  body: {
    lg: {
      regular: { fontFamily: inter, fontSize: "20px", fontWeight: 400, lineHeight: "160%" },
      semibold: { fontFamily: inter, fontSize: "20px", fontWeight: 600, lineHeight: "160%" },
      bold: { fontFamily: inter, fontSize: "20px", fontWeight: 700, lineHeight: "160%" },
    },
    md: {
      regular: { fontFamily: inter, fontSize: "16px", fontWeight: 400, lineHeight: "175%" },
      semibold: { fontFamily: inter, fontSize: "16px", fontWeight: 600, lineHeight: "175%" },
      bold: { fontFamily: inter, fontSize: "16px", fontWeight: 700, lineHeight: "175%" },
    },
  },
  caption: {
    md: {
      regular: { fontFamily: inter, fontSize: "14px", fontWeight: 400, lineHeight: "140%" },
      semibold: { fontFamily: inter, fontSize: "14px", fontWeight: 600, lineHeight: "140%" },
      bold: { fontFamily: inter, fontSize: "14px", fontWeight: 700, lineHeight: "140%" },
    },
    sm: {
      regular: { fontFamily: inter, fontSize: "12px", fontWeight: 400, lineHeight: "140%" },
      semibold: { fontFamily: inter, fontSize: "12px", fontWeight: 600, lineHeight: "140%" },
      bold: { fontFamily: inter, fontSize: "12px", fontWeight: 700, lineHeight: "140%" },
    },
  },
  button: {
    xl: { fontFamily: inter, fontSize: "26px", fontWeight: 500, lineHeight: "120%" },
    lg: { fontFamily: inter, fontSize: "22px", fontWeight: 500, lineHeight: "120%" },
    md: { fontFamily: inter, fontSize: "18px", fontWeight: 500, lineHeight: "120%" },
    sm: { fontFamily: inter, fontSize: "16px", fontWeight: 500, lineHeight: "175%" },
    xs: { fontFamily: inter, fontSize: "14px", fontWeight: 500, lineHeight: "140%" },
  },
  navigation: {
    link: {
      fontFamily: spaceGrotesk,
      fontSize: "14px",
      fontWeight: 500,
      lineHeight: "24px",
    },
    logo: {
      fontFamily: poppins,
      fontSize: "24px",
      fontWeight: 500,
      lineHeight: "24px",
    },
  },
} as const;

// Figma Text Styles (Admin 템플릿) 기반 타이포그래피 토큰

export const adminTypography = {
  fontFamily: {
    heading: inter,
    body: inter,
  },
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  heading: {
    h1: { fontFamily: inter, fontSize: "24px", fontWeight: 600, lineHeight: "130%" },
    h2: { fontFamily: inter, fontSize: "18px", fontWeight: 600, lineHeight: "130%" },
    h3: { fontFamily: inter, fontSize: "15px", fontWeight: 600, lineHeight: "130%" },
    h4: { fontFamily: inter, fontSize: "14px", fontWeight: 600, lineHeight: "130%" },
  },
  body: {
    lg: { fontFamily: inter, fontSize: "16px", fontWeight: 400, lineHeight: "150%" },
    md: { fontFamily: inter, fontSize: "14px", fontWeight: 400, lineHeight: "150%" },
    sm: { fontFamily: inter, fontSize: "13px", fontWeight: 400, lineHeight: "150%" },
    xs: { fontFamily: inter, fontSize: "12px", fontWeight: 400, lineHeight: "150%" },
  },
  label: {
    md: { fontFamily: inter, fontSize: "14px", fontWeight: 500, lineHeight: "140%" },
    sm: { fontFamily: inter, fontSize: "12px", fontWeight: 500, lineHeight: "140%" },
  },
  button: {
    lg: { fontFamily: inter, fontSize: "15px", fontWeight: 500, lineHeight: "120%" },
    md: { fontFamily: inter, fontSize: "14px", fontWeight: 500, lineHeight: "120%" },
    sm: { fontFamily: inter, fontSize: "13px", fontWeight: 500, lineHeight: "120%" },
  },
  table: {
    header: { fontFamily: inter, fontSize: "12px", fontWeight: 600, lineHeight: "140%" },
    cell: { fontFamily: inter, fontSize: "14px", fontWeight: 400, lineHeight: "140%" },
  },
  link: {
    fontFamily: inter,
    fontSize: "11px",
    fontWeight: 400,
    lineHeight: "140%",
  },
} as const;

export type CommerceTypography = typeof commerceTypography;
export type AdminTypography = typeof adminTypography;
