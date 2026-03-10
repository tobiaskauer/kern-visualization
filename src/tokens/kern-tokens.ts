export interface KernTokens {
  colorText: string;
  colorTextMuted: string;
  colorBorder: string;
  colorBackground: string;
  colorAction: string;
  fontFamily: string;
  fontSizeBase: string;
  fontSizeSmall: string;
  spaceSmall: string;
  spaceDefault: string;
  chartColors: string[];
}

export function getTokens(container: Element): KernTokens {
  const get = (prop: string) =>
    getComputedStyle(container).getPropertyValue(prop).trim();

  const oklch = (l: string, c: string, h: string) =>
    `oklch(${get(l)} ${get(c)} ${get(h)})`;

  return {
    colorText: get('--kern-color-layout-text-default'),
    colorTextMuted: get('--kern-color-layout-text-muted'),
    colorBorder: get('--kern-color-layout-border'),
    colorBackground: get('--kern-color-layout-background-default'),
    colorAction: get('--kern-color-action-default'),
    fontFamily: get('--kern-typography-font-family-default'),
    fontSizeBase: get('--kern-font-size-16'),
    fontSizeSmall: get('--kern-font-size-12'),
    spaceSmall: get('--kern-metric-space-small'),
    spaceDefault: get('--kern-metric-space-default'),
    chartColors: [
      oklch('--kern-darkblue-600-lightness', '--kern-darkblue-600-chroma', '--kern-darkblue-600-hue'),
      oklch('--kern-turquoise-500-lightness', '--kern-turquoise-500-chroma', '--kern-turquoise-500-hue'),
      oklch('--kern-orange-600-lightness', '--kern-orange-600-chroma', '--kern-orange-600-hue'),
      oklch('--kern-lightblue-500-lightness', '--kern-lightblue-500-chroma', '--kern-lightblue-500-hue'),
      oklch('--kern-violet-600-lightness', '--kern-violet-600-chroma', '--kern-violet-600-hue'),
      oklch('--kern-green-600-lightness', '--kern-green-600-chroma', '--kern-green-600-hue'),
      oklch('--kern-red-600-lightness', '--kern-red-600-chroma', '--kern-red-600-hue'),
      oklch('--kern-yellow-600-lightness', '--kern-yellow-600-chroma', '--kern-yellow-600-hue'),
    ],
  };
}
