import type { KernTokens } from '../tokens/kern-tokens';

export interface LegendItem {
  name: string;
  color: string;
}

export function renderDivergingLegend(
  container: HTMLElement,
  domain: [number, number],       // symmetric, e.g. [-50, 50]
  colors: string[],               // divergingColors array (7 items)
  tokens: KernTokens,
  label?: string
): void {
  container.querySelector('.kern-chart-legend')?.remove();

  const legendWidth = 280;
  const barHeight = 16;
  const tickLen = 5;
  const fontSize = 11;
  const svgHeight = barHeight + tickLen + fontSize + 8;
  const n = colors.length;
  const stepW = legendWidth / n;

  const [zMin, zMax] = domain;
  const mid = (zMin + zMax) / 2;

  // 5 ticks: min, quarter-left, mid (neutral), quarter-right, max
  const ticks = [
    zMin,
    (zMin + mid) / 2,
    mid,
    (mid + zMax) / 2,
    zMax,
  ];

  const toX = (v: number): number =>
    ((v - zMin) / (zMax - zMin)) * legendWidth;

  const fmt = (v: number): string =>
    Number.isInteger(v) ? String(v) : v.toFixed(1);

  const ns = 'http://www.w3.org/2000/svg';

  const wrap = document.createElement('div');
  wrap.className = 'kern-chart-legend';
  wrap.style.cssText = `
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px 0 0 0;
    font-family: ${tokens.fontFamily};
  `;

  if (label) {
    const lbl = document.createElement('div');
    lbl.style.cssText = `
      font-size: ${tokens.fontSizeSmall || '12px'};
      color: ${tokens.colorTextMuted};
      margin-bottom: 4px;
    `;
    lbl.textContent = label;
    wrap.appendChild(lbl);
  }

  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('width', String(legendWidth));
  svg.setAttribute('height', String(svgHeight));
  svg.setAttribute('aria-hidden', 'true');

  // Color steps
  colors.forEach((color, i) => {
    const rect = document.createElementNS(ns, 'rect');
    rect.setAttribute('x', String(i * stepW));
    rect.setAttribute('y', '0');
    rect.setAttribute('width', String(stepW + 0.5)); // slight overlap avoids gaps
    rect.setAttribute('height', String(barHeight));
    rect.setAttribute('fill', color);
    svg.appendChild(rect);
  });

  // Thin border around the strip
  const border = document.createElementNS(ns, 'rect');
  border.setAttribute('x', '0');
  border.setAttribute('y', '0');
  border.setAttribute('width', String(legendWidth));
  border.setAttribute('height', String(barHeight));
  border.setAttribute('fill', 'none');
  border.setAttribute('stroke', tokens.colorBorder);
  border.setAttribute('stroke-width', '1');
  svg.appendChild(border);

  // Ticks + labels
  ticks.forEach((v) => {
    const x = toX(v);
    const isNeutral = v === mid;

    const line = document.createElementNS(ns, 'line');
    line.setAttribute('x1', String(x));
    line.setAttribute('x2', String(x));
    line.setAttribute('y1', String(barHeight));
    line.setAttribute('y2', String(barHeight + tickLen));
    line.setAttribute('stroke', tokens.colorText);
    line.setAttribute('stroke-width', isNeutral ? '2' : '1');
    svg.appendChild(line);

    const text = document.createElementNS(ns, 'text');
    text.setAttribute('x', String(x));
    text.setAttribute('y', String(barHeight + tickLen + fontSize));
    text.setAttribute('text-anchor',
      v === zMin ? 'start' : v === zMax ? 'end' : 'middle'
    );
    text.setAttribute('fill', isNeutral ? tokens.colorText : tokens.colorTextMuted);
    text.setAttribute('font-family', tokens.fontFamily);
    text.setAttribute('font-size', String(fontSize));
    if (isNeutral) text.setAttribute('font-weight', '600');
    text.textContent = fmt(v);
    svg.appendChild(text);
  });

  wrap.appendChild(svg);
  container.appendChild(wrap);
}

export function renderLegend(container: HTMLElement, items: LegendItem[], tokens: KernTokens): void {
  // Remove existing legend if re-rendering
  container.querySelector('.kern-chart-legend')?.remove();

  const legend = document.createElement('div');
  legend.className = 'kern-chart-legend';
  legend.setAttribute('role', 'list');
  legend.setAttribute('aria-label', 'Chart legend');
  legend.style.cssText = `
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 12px;
    padding: 8px 0 0 0;
    font-family: ${tokens.fontFamily};
    font-size: ${tokens.fontSizeSmall || '12px'};
    color: ${tokens.colorTextMuted};
  `;

  items.forEach((item) => {
    const entry = document.createElement('div');
    entry.setAttribute('role', 'listitem');
    entry.style.cssText = 'display:flex; align-items:center; gap:6px;';
    entry.innerHTML = `
      <span style="width:12px;height:12px;border-radius:2px;background:${item.color};flex-shrink:0;" aria-hidden="true"></span>
      <span>${item.name}</span>
    `;
    legend.appendChild(entry);
  });

  container.appendChild(legend);
}
