export const palette = {
  primary: {
    50:  '#F0FAFF',
    100: '#DBF3FF',
    200: '#B8E1FF',
    300: '#8AD6FF',
    400: '#66C5FF',
    500: '#4ABCFF',
    600: '#14A8FF',
    700: '#0088D6',
    800: '#006199',
    900: '#004166',
  },
  secondary: {
    50:  '#FFF6F0',
    100: '#FFEADB',
    200: '#FFD7B8',
    300: '#FFC08F',
    400: '#FFAE70',
    500: '#FF9E55',
    600: '#FF7A14',
    700: '#D65D00',
    800: '#994200',
    900: '#662C00',
  },
  tertiary: {
    50:  '#FFFBF0',
    100: '#FFF6DB',
    200: '#FFEDB8',
    300: '#FFE38F',
    400: '#FFDB70',
    500: '#FFD966',
    600: '#FFC414',
    700: '#D6A100',
    800: '#997300',
    900: '#664D00',
  },
  neutral: {
    50:  '#F3F7FC',
    100: '#E5EAF0',
    200: '#CFD9E3',
    300: '#AFBFD0',
    400: '#88A0B9',
    500: '#5B7A9B',
    600: '#48607A',
    700: '#35475A',
    800: '#263340',
    900: '#18212A',
  },
} as const

/** 각 색상의 기본값 (500) */
export const colors = {
  primary:   palette.primary[500],
  secondary: palette.secondary[500],
  tertiary:  palette.tertiary[500],
  neutral:   palette.neutral[500],
} as const

export type ColorKey = keyof typeof colors
export type PaletteKey = keyof typeof palette
