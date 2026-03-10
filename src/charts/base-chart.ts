import * as d3 from 'd3';
import { getTokens, type KernTokens } from '../tokens/kern-tokens';
import { createResizeObserver } from '../utils/resize-observer';

export interface BaseChartConfig {
  container: HTMLElement;
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  title?: string;
  description?: string;
  animated?: boolean;
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
  }

  protected getTokens(): KernTokens {
    return getTokens(this.config.container);
  }

  protected getInnerWidth(): number {
    const margin = this.config.margin ?? DEFAULT_MARGIN;
    const totalWidth =
      this.config.width ?? this.config.container.clientWidth ?? 600;
    return totalWidth - margin.left - margin.right;
  }

  protected getInnerHeight(): number {
    const margin = this.config.margin ?? DEFAULT_MARGIN;
    const totalHeight = this.config.height ?? DEFAULT_HEIGHT;
    return totalHeight - margin.top - margin.bottom;
  }

  protected getTotalWidth(): number {
    return this.config.width ?? this.config.container.clientWidth ?? 600;
  }

  protected getTotalHeight(): number {
    return this.config.height ?? DEFAULT_HEIGHT;
  }

  protected setupSvg(): d3.Selection<SVGGElement, unknown, null, undefined> {
    // Remove existing SVG
    d3.select(this.config.container).selectAll('svg').remove();

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

  protected setupResizeObserver(): void {
    this.resizeObserver = createResizeObserver(
      this.config.container,
      () => {
        this.render();
      }
    );
  }
}
