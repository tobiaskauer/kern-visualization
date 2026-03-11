import type { KernTokens } from '../tokens/kern-tokens';

export interface TooltipRow {
  label: string;
  value: string;
  color?: string;
}

export class ChartTooltip {
  private el: HTMLElement;
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
    // container must be position:relative
    container.style.position = 'relative';
    this.el = document.createElement('div');
    this.el.setAttribute('role', 'tooltip');
    this.el.setAttribute('aria-live', 'polite');
    this.el.setAttribute('aria-atomic', 'true');
    this.el.style.cssText = `
      position: absolute;
      pointer-events: none;
      display: none;
      z-index: 10;
    `;
    container.appendChild(this.el);
  }

  show(title: string, rows: TooltipRow[], x: number, y: number, tokens: KernTokens): void {
    // Apply KERN token styles on each show (theme-switch safe)
    this.el.style.background = tokens.colorBackground;
    this.el.style.border = `1px solid ${tokens.colorBorder}`;
    this.el.style.borderRadius = tokens.borderRadiusSmall || '2px';
    this.el.style.padding = tokens.spaceSmall || '8px';
    this.el.style.fontFamily = tokens.fontFamily;
    this.el.style.fontSize = tokens.fontSizeSmall || '12px';
    this.el.style.color = tokens.colorText;
    this.el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)';
    this.el.style.display = 'block';
    this.el.style.minWidth = '120px';
    this.el.style.maxWidth = '240px';

    // Build content
    let html = `<div style="font-weight:600; margin-bottom:4px;">${title}</div>`;
    for (const row of rows) {
      const swatch = row.color
        ? `<span style="width:8px;height:8px;border-radius:50%;background:${row.color};flex-shrink:0;display:inline-block;"></span>`
        : '';
      html += `
        <div style="display:flex; align-items:center; gap:6px; margin-top:2px;">
          ${swatch}
          <span>${row.label}</span>
          <span style="margin-left:auto; font-weight:500;">${row.value}</span>
        </div>`;
    }
    this.el.innerHTML = html;

    // Position with +12px offset, clamped to container bounds
    const offsetX = x + 12;
    const offsetY = y + 12;

    // Temporarily show to measure size
    this.el.style.left = '0';
    this.el.style.top = '0';

    const tooltipW = this.el.offsetWidth;
    const tooltipH = this.el.offsetHeight;
    const containerW = this.container.offsetWidth;
    const containerH = this.container.offsetHeight;

    const clampedX = Math.min(offsetX, containerW - tooltipW - 4);
    const clampedY = Math.min(offsetY, containerH - tooltipH - 4);

    this.el.style.left = `${Math.max(0, clampedX)}px`;
    this.el.style.top = `${Math.max(0, clampedY)}px`;
  }

  hide(): void {
    this.el.style.display = 'none';
  }

  destroy(): void {
    this.el.remove();
  }
}
