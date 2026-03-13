import * as d3 from 'd3';
import { BaseChart, type BaseChartConfig } from '../base-chart';
import { createLinearScale } from '../../utils/scales';
import { renderBottomAxis, renderLeftAxis, renderGridlinesY, renderGridlinesX } from '../../utils/axes';
import { CHART_CONSTANTS } from '../../constants';
import { ChartTooltip } from '../../utils/tooltip';
import { renderDivergingLegend } from '../../utils/legend';

export interface ScatterDatum {
  x: number;
  y: number;
  z?: number;   // third dimension mapped to color via diverging scale
}

export interface ScatterChartConfig extends BaseChartConfig {
  data: ScatterDatum[];
  zLabel?: string;  // label shown above the diverging legend
}

export class ScatterChart extends BaseChart<ScatterChartConfig> {
  private tooltip?: ChartTooltip;

  render(): void {
    if (this.isTooSmall()) return;
    if (this.tooltip) {
      this.tooltip.destroy();
    }
    this.tokens = this.getTokens();
    const g = this.setupSvg();
    const { data } = this.config;
    const innerWidth = this.getInnerWidth();
    const innerHeight = this.getInnerHeight();

    if (!data || data.length === 0) {
      g.append('text')
        .attr('x', innerWidth / 2)
        .attr('y', innerHeight / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', this.tokens.colorTextMuted)
        .attr('font-family', this.tokens.fontFamily)
        .text('No data');
      return;
    }

    const xScale = createLinearScale(
      [d3.min(data, (d) => d.x) ?? 0, d3.max(data, (d) => d.x) ?? 1],
      [0, innerWidth]
    );
    const yScale = createLinearScale(
      [d3.min(data, (d) => d.y) ?? 0, d3.max(data, (d) => d.y) ?? 1],
      [innerHeight, 0]
    );

    // Build z-based diverging color scale (symmetric around 0)
    const hasZ = data.some((d) => d.z != null);
    let colorFn: (d: ScatterDatum) => string;
    let zColorScale: d3.ScaleQuantize<string, never> | null = null;
    let zDomain: [number, number] = [0, 0];

    if (hasZ) {
      const zVals = data.filter((d) => d.z != null).map((d) => d.z as number);
      const absMax = Math.max(Math.abs(d3.min(zVals) ?? 0), Math.abs(d3.max(zVals) ?? 0));
      zDomain = [-absMax, absMax];
      zColorScale = d3
        .scaleQuantize<string>()
        .domain(zDomain)
        .range(this.tokens.divergingColors as string[]);
      colorFn = (d) => zColorScale!(d.z ?? 0);
    } else {
      colorFn = () => this.tokens.chartColors[0];
    }

    // Gridlines (before data layer)
    if (this.config.gridlines?.y !== false) {
      renderGridlinesY(g, yScale, innerWidth, this.tokens);
    }
    if (this.config.gridlines?.x !== false) {
      renderGridlinesX(g, xScale, innerHeight, this.tokens);
    }

    // Annotations
    this.renderAnnotations(g, yScale, xScale, innerWidth, innerHeight, this.tokens);

    // Tooltip
    this.tooltip = new ChartTooltip(this.config.container);
    const tooltip = this.tooltip;
    const tokens = this.tokens;

    const circles = g.selectAll<SVGCircleElement, ScatterDatum>('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', (d) => xScale(d.x))
      .attr('cy', (d) => yScale(d.y))
      .attr('r', CHART_CONSTANTS.dotRadius)
      .attr('fill', (d) => colorFn(d))
      .attr('fill-opacity', CHART_CONSTANTS.scatterOpacity)
      .attr('tabindex', '-1')
      .attr('aria-label', (d) => {
        const zPart = d.z != null ? `, z: ${d.z}` : '';
        return `(${d.x.toFixed(1)}, ${d.y.toFixed(1)}${zPart})`;
      })
      .style('cursor', 'pointer')
      .style('outline', 'none');

    circles
      .on('mouseover focus', function (this: SVGCircleElement, event: MouseEvent | FocusEvent, d) {
        circles.attr('fill-opacity', (other) => (other === d ? 1.0 : 0.3));

        const containerRect = (this.ownerSVGElement?.parentElement as HTMLElement)?.getBoundingClientRect();
        let px = 0;
        let py = 0;
        if (event instanceof MouseEvent && containerRect) {
          px = event.clientX - containerRect.left;
          py = event.clientY - containerRect.top;
        } else if (event instanceof FocusEvent) {
          const rect = this.getBoundingClientRect();
          if (containerRect) {
            px = rect.left - containerRect.left + rect.width / 2;
            py = rect.top - containerRect.top;
          }
        }

        const rows: { label: string; value: string; color?: string }[] = [
          { label: 'x', value: d.x.toFixed(1) },
          { label: 'y', value: d.y.toFixed(1) },
        ];
        if (d.z != null) {
          rows.push({ label: 'z', value: d.z.toFixed(1), color: colorFn(d) });
        }

        tooltip.show(`(${d.x.toFixed(1)}, ${d.y.toFixed(1)})`, rows, px, py, tokens);
      })
      .on('mouseout blur', function () {
        circles.attr('fill-opacity', CHART_CONSTANTS.scatterOpacity);
        tooltip.hide();
      });

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call((sel) => renderBottomAxis(sel, xScale, { tokens: this.tokens, innerWidth }));

    g.append('g').call((sel) =>
      renderLeftAxis(sel, yScale, { tokens: this.tokens })
    );

    this.renderAxisLabels(g, innerWidth, innerHeight, this.tokens);

    // Legend: diverging scale strip when z is present, nothing otherwise
    if (hasZ && zColorScale && this.config.legend !== false) {
      renderDivergingLegend(
        this.config.container,
        zDomain,
        this.tokens.divergingColors,
        this.tokens,
        this.config.zLabel
      );
    }
    this.renderCaption(this.tokens);

    // SVG-level keyboard navigation (sorted by x value)
    const kbMargin = this.config.margin ?? { top: 20, right: 20, bottom: 40, left: 50 };
    const sortedData = [...data].sort((a, b) => a.x - b.x);

    this.svg
      .attr('tabindex', '0')
      .attr('role', 'application')
      .attr('aria-label', this.config.title ?? 'Chart');

    let kbIdx = -1;

    this.svg.on('keydown.kb', (event: KeyboardEvent) => {
      if (!['ArrowLeft', 'ArrowRight', 'Escape'].includes(event.key)) return;
      event.preventDefault();
      if (event.key === 'Escape') { (this.svg.node() as SVGElement).blur(); return; }
      kbIdx = event.key === 'ArrowRight'
        ? Math.min(kbIdx + 1, sortedData.length - 1)
        : Math.max(kbIdx - 1, 0);
      if (kbIdx < 0) kbIdx = 0;
      const d = sortedData[kbIdx];
      circles.attr('fill-opacity', (other) => (other === d ? 1.0 : 0.3));
      const svgRect = this.svg.node()!.getBoundingClientRect();
      const containerRect = this.config.container.getBoundingClientRect();
      const px = svgRect.left - containerRect.left + xScale(d.x) + kbMargin.left;
      const py = svgRect.top - containerRect.top + yScale(d.y) + kbMargin.top;
      const rows: { label: string; value: string; color?: string }[] = [
        { label: 'x', value: d.x.toFixed(1) },
        { label: 'y', value: d.y.toFixed(1) },
      ];
      if (d.z != null) rows.push({ label: 'z', value: d.z.toFixed(1), color: colorFn(d) });
      tooltip.show(`(${d.x.toFixed(1)}, ${d.y.toFixed(1)})`, rows, px, py, tokens);
    })
    .on('focus.kb', () => {
      kbIdx = 0;
      const d = sortedData[0];
      circles.attr('fill-opacity', (other) => (other === d ? 1.0 : 0.3));
      const svgRect = this.svg.node()!.getBoundingClientRect();
      const containerRect = this.config.container.getBoundingClientRect();
      const px = svgRect.left - containerRect.left + xScale(d.x) + kbMargin.left;
      const py = svgRect.top - containerRect.top + yScale(d.y) + kbMargin.top;
      const rows: { label: string; value: string; color?: string }[] = [
        { label: 'x', value: d.x.toFixed(1) },
        { label: 'y', value: d.y.toFixed(1) },
      ];
      if (d.z != null) rows.push({ label: 'z', value: d.z.toFixed(1), color: colorFn(d) });
      tooltip.show(`(${d.x.toFixed(1)}, ${d.y.toFixed(1)})`, rows, px, py, tokens);
    })
    .on('blur.kb', () => {
      kbIdx = -1;
      circles.attr('fill-opacity', CHART_CONSTANTS.scatterOpacity);
      tooltip.hide();
    });
  }
}
