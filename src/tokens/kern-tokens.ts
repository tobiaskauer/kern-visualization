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
  borderRadiusSmall: string;
  spaceXSmall: string;
  chartColors: string[];
  sequentialColors: string[];
  divergingColors: string[];
}

export function getTokens(container: Element): KernTokens {
  const get = (prop: string) =>
    getComputedStyle(container).getPropertyValue(prop).trim();

  const oklch = (l: string, c: string, h: string) =>
    `oklch(${get(l)} ${get(c)} ${get(h)})`;

  const theme = container.closest('[data-kern-theme]')?.getAttribute('data-kern-theme') ?? 'light';
  const isDark = theme === 'dark';

  const divergingColors = isDark
    ? [
        oklch('--kern-lightblue-400-lightness', '--kern-lightblue-400-chroma', '--kern-lightblue-400-hue'),
        oklch('--kern-lightblue-300-lightness', '--kern-lightblue-300-chroma', '--kern-lightblue-300-hue'),
        oklch('--kern-lightblue-200-lightness', '--kern-lightblue-200-chroma', '--kern-lightblue-200-hue'),
        oklch('--kern-neutral-400-lightness', '--kern-neutral-400-chroma', '--kern-neutral-400-hue'),
        oklch('--kern-red-200-lightness', '--kern-red-200-chroma', '--kern-red-200-hue'),
        oklch('--kern-red-300-lightness', '--kern-red-300-chroma', '--kern-red-300-hue'),
        oklch('--kern-red-400-lightness', '--kern-red-400-chroma', '--kern-red-400-hue'),
      ]
    : [
        oklch('--kern-lightblue-600-lightness', '--kern-lightblue-600-chroma', '--kern-lightblue-600-hue'),
        oklch('--kern-lightblue-400-lightness', '--kern-lightblue-400-chroma', '--kern-lightblue-400-hue'),
        oklch('--kern-lightblue-200-lightness', '--kern-lightblue-200-chroma', '--kern-lightblue-200-hue'),
        oklch('--kern-neutral-300-lightness', '--kern-neutral-300-chroma', '--kern-neutral-300-hue'),
        oklch('--kern-red-200-lightness', '--kern-red-200-chroma', '--kern-red-200-hue'),
        oklch('--kern-red-400-lightness', '--kern-red-400-chroma', '--kern-red-400-hue'),
        oklch('--kern-red-600-lightness', '--kern-red-600-chroma', '--kern-red-600-hue'),
      ];

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
    borderRadiusSmall: get('--kern-metric-border-radius-small') || '2px',
    spaceXSmall: get('--kern-metric-space-x-small') || '4px',
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
    sequentialColors: [
      oklch('--kern-darkblue-200-lightness', '--kern-darkblue-200-chroma', '--kern-darkblue-200-hue'),
      oklch('--kern-darkblue-300-lightness', '--kern-darkblue-300-chroma', '--kern-darkblue-300-hue'),
      oklch('--kern-darkblue-400-lightness', '--kern-darkblue-400-chroma', '--kern-darkblue-400-hue'),
      oklch('--kern-darkblue-500-lightness', '--kern-darkblue-500-chroma', '--kern-darkblue-500-hue'),
      oklch('--kern-darkblue-600-lightness', '--kern-darkblue-600-chroma', '--kern-darkblue-600-hue'),
      oklch('--kern-darkblue-700-lightness', '--kern-darkblue-700-chroma', '--kern-darkblue-700-hue'),
      oklch('--kern-darkblue-800-lightness', '--kern-darkblue-800-chroma', '--kern-darkblue-800-hue'),
    ],
    divergingColors,
  };
}
