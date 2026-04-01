import * as d3 from 'd3';
import { getTokens, type KernTokens } from '../tokens/kern-tokens';
import { createResizeObserver } from '../utils/resize-observer';
import type { ColorScheme } from '../utils/scales';

export interface Annotation {
  axis: 'x' | 'y';
  value: number | string; // number for y-axis, string (label) for x-axis
  label?: string;
}

export interface BaseChartConfig {
  container: HTMLElement;
  width?: number;
  height?: number;
  minWidth?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  title?: string;
  description?: string;
  animated?: boolean;
  gridlines?: { x?: boolean; y?: boolean };
  xAxisLabel?: string;
  yAxisLabel?: string;
  annotations?: Annotation[];
  legend?: boolean;
  caption?: string;
  colorScheme?: ColorScheme;
  domainX?: string[];
  domainY?: [number, number];
}

export const DEFAULT_MARGIN = { top: 20, right: 20, bottom: 40, left: 50 };
export const DEFAULT_HEIGHT = 300;

export abstract class BaseChart<TConfig extends BaseChartConfig> {
  protected config: TConfig;
  protected svg!: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  protected resizeObserver?: ResizeObserver;
  protected tokens!: KernTokens;

  constructor(config: TConfig) {
    this.config = {
      margin: DEFAULT_MARGIN,
      animated: true,
      ...config,
    };
    this.setupResizeObserver();
  }

  protected getTokens(): KernTokens {
    return getTokens(this.config.container);
  }

  protected getInnerWidth(): number {
    const margin = this.config.margin ?? DEFAULT_MARGIN;
    return this.getTotalWidth() - margin.left - margin.right;
  }

  protected getInnerHeight(): number {
    const margin = this.config.margin ?? DEFAULT_MARGIN;
    const totalHeight = this.config.height ?? DEFAULT_HEIGHT;
    return totalHeight - margin.top - margin.bottom;
  }

  protected getTotalWidth(): number {
    const minWidth = this.config.minWidth ?? 280;
    const available = this.config.width ?? this.config.container.clientWidth ?? 600;
    return Math.max(available, minWidth);
  }

  protected getTotalHeight(): number {
    return this.config.height ?? DEFAULT_HEIGHT;
  }

  protected setupSvg(): d3.Selection<SVGGElement, unknown, null, undefined> {
    // Remove existing SVG, legend, caption
    d3.select(this.config.container).selectAll('svg').remove();
    this.config.container.querySelector('.kern-chart-legend')?.remove();
    this.config.container.querySelector('.kern-chart-caption')?.remove();

    // Enable horizontal scroll when chart is wider than the container
    this.config.container.style.overflowX = 'auto';

    const margin = this.config.margin ?? DEFAULT_MARGIN;
    const width = this.getTotalWidth();
    const height = this.getTotalHeight();

    this.svg = d3
      .select(this.config.container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('role', 'img');

    // Accessibility
    if (this.config.title) {
      const titleId = `chart-title-${Math.random().toString(36).slice(2)}`;
      this.svg
        .append('title')
        .attr('id', titleId)
        .text(this.config.title);
      this.svg.attr('aria-labelledby', titleId);
    }
    if (this.config.description) {
      this.svg.append('desc').text(this.config.description);
    }

    return this.svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
  }

  protected isTooSmall(): boolean {
    return false;
  }

  abstract render(): void;

  update(partialConfig?: Partial<TConfig>): void {
    if (partialConfig) {
      this.config = { ...this.config, ...partialConfig };
    }
    this.render();
  }

  destroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    d3.select(this.config.container).selectAll('svg').remove();
  }

  protected renderAxisLabels(
    g: d3.Selection<SVGGElement, unknown, null, undefined>,
    innerWidth: number,
    innerHeight: number,
    tokens: KernTokens
  ): void {
    const margin = this.config.margin ?? DEFAULT_MARGIN;
    if (this.config.xAxisLabel) {
      g.append('text')
        .attr('x', innerWidth / 2)
        .attr('y', innerHeight + margin.bottom - 4)
        .attr('text-anchor', 'middle')
        .attr('fill', tokens.colorTextMuted)
        .attr('font-family', tokens.fontFamily)
        .attr('font-size', tokens.fontSizeSmall || '12px')
        .text(this.config.xAxisLabel);
    }
    if (this.config.yAxisLabel) {
      g.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -innerHeight / 2)
        .attr('y', -margin.left + 12)
        .attr('text-anchor', 'middle')
        .attr('fill', tokens.colorTextMuted)
        .attr('font-family', tokens.fontFamily)
        .attr('font-size', tokens.fontSizeSmall || '12px')
        .text(this.config.yAxisLabel);
    }
  }

  protected renderAnnotations(
    g: d3.Selection<SVGGElement, unknown, null, undefined>,
    yScale: d3.ScaleLinear<number, number> | null,
    xScale: any | null,
    innerWidth: number,
    innerHeight: number,
    tokens: KernTokens
  ): void {
    const annotations = this.config.annotations;
    if (!annotations || annotations.length === 0) return;

    const annotGroup = g.append('g').attr('class', 'annotations');

    for (const ann of annotations) {
      if (ann.axis === 'y' && yScale !== null) {
        const yVal = typeof ann.value === 'number' ? ann.value : parseFloat(ann.value as string);
        const yPos = yScale(yVal);
        annotGroup.append('line')
          .attr('x1', 0)
          .attr('x2', innerWidth)
          .attr('y1', yPos)
          .attr('y2', yPos)
          .attr('stroke', tokens.colorBorder)
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', '6,3');

        if (ann.label) {
          annotGroup.append('text')
            .attr('x', innerWidth - 4)
            .attr('y', yPos - 4)
            .attr('text-anchor', 'end')
            .attr('fill', tokens.colorTextMuted)
            .attr('font-family', tokens.fontFamily)
            .attr('font-size', tokens.fontSizeSmall || '12px')
            .text(ann.label);
        }
      } else if (ann.axis === 'x' && xScale !== null) {
        const xPos = xScale(ann.value);
        if (xPos == null) continue;
        annotGroup.append('line')
          .attr('x1', xPos)
          .attr('x2', xPos)
          .attr('y1', 0)
          .attr('y2', innerHeight)
          .attr('stroke', tokens.colorBorder)
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', '6,3');

        if (ann.label) {
          annotGroup.append('text')
            .attr('x', xPos + 4)
            .attr('y', 10)
            .attr('fill', tokens.colorTextMuted)
            .attr('font-family', tokens.fontFamily)
            .attr('font-size', tokens.fontSizeSmall || '12px')
            .text(ann.label);
        }
      }
    }
  }

  protected renderCaption(tokens: KernTokens): void {
    if (!this.config.caption) return;
    const el = document.createElement('p');
    el.className = 'kern-chart-caption';
    el.textContent = this.config.caption;
    el.style.cssText = `
      margin: 4px 0 0 0;
      padding: 0;
      font-family: ${tokens.fontFamily};
      font-size: ${tokens.fontSizeSmall || '12px'};
      color: ${tokens.colorTextMuted};
      text-align: center;
    `;
    this.config.container.appendChild(el);
  }

  protected setupResizeObserver(): void {
    this.resizeObserver = createResizeObserver(
      this.config.container,
      () => {
        this.render();
      }
    );
  }
}
