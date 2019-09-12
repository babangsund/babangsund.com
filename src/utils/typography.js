import '../fonts/fonts.css';
import Typography from 'typography';

import theme from 'utils/theme';

const typographyTheme = {
  scaleRatio: 2,
  bodyWeight: 300,
  boldWeight: 600,
  headerWeight: 600,
  title: 'Nunito',
  baseFontSize: '16px',
  baseLineHeight: 1.5,
  headerColor: theme.green,
  bodyColor: 'hsla(0,0%,100%,0.95)',
  bodyFontFamily: ['Nunito', 'sans-serif'],
  headerFontFamily: ['Nunito', 'sans-serif'],
  overrideStyles: ({rhythm}) => ({
    'pre,code': {
      fontFamily: 'Fira Code, -apple-system, monospace',
    },
    'h2,h3,h4': {
      letterSpacing: '1.5px',
    },
  }),
};

const typography = new Typography(typographyTheme);

if (process.env.NODE_ENV !== 'production') {
  typography.injectStyles();
}

export default typography;
export const scale = typography.scale;
export const rhythm = (...args) =>
  args.map(x => typography.rhythm(x)).join(' ');
