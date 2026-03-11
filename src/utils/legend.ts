import type { KernTokens } from '../tokens/kern-tokens';

export interface LegendItem {
  name: string;
  color: string;
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
