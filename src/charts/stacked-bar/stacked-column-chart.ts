import * as d3 from 'd3';
import { BaseChart, type BaseChartConfig } from '../base-chart';
import { createBandScale, createLinearScale, buildColorScale } from '../../utils/scales';
import { renderBottomAxis, renderLeftAxis, renderGridlinesX } from '../../utils/axes';
import type { StackedDatum } from './stacked-bar-chart';
import { ChartTooltip } from '../../utils/tooltip';
import { renderLegend } from '../../utils/legend';

export interface StackedColumnChartConfig extends BaseChartConfig {
  data: StackedDatum[];
  series: string[];
}

export class StackedColumnChart extends BaseChart<StackedColumnChartConfig> {
  private tooltip?: ChartTooltip;

  render(): void {
    if (this.isTooSmall()) return;
    if (this.tooltip) {
      this.tooltip.destroy();
    }
    this.tokens = this.getTokens();
    const g = this.setupSvg();
    const { data, series } = this.config;
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

    const colorScale = buildColorScale(series, this.tokens, 'categorical');
    const stackedData = d3.stack<StackedDatum>().keys(series)(data);

    const maxVal = d3.max(stackedData[stackedData.length - 1], (d) => d[1]) ?? 0;

    const yScale = createBandScale(
      data.map((d) => d.label),
      [0, innerHeight]
    );
    const xScale = createLinearScale([0, maxVal], [0, innerWidth]);

    // Gridlines (before data layer)
    if (this.config.gridlines?.x !== false) {
      renderGridlinesX(g, xScale, innerHeight, this.tokens);
    }

    // Annotations
    this.renderAnnotations(g, null, xScale, innerWidth, innerHeight, this.tokens);

    // Tooltip
    this.tooltip = new ChartTooltip(this.config.container);
    const tooltip = this.tooltip;
    const tokens = this.tokens;

    const layer = g.selectAll('g.layer')
      .data(stackedData)
      .enter()
      .append('g')
      .attr('class', 'layer')
      .attr('fill', (d) => colorScale(d.key));

    layer.selectAll<SVGRectElement, d3.SeriesPoint<StackedDatum>>('rect')
      .data((d) => d)
      .enter()
      .append('rect')
      .attr('y', (d) => yScale((d.data as StackedDatum).label) ?? 0)
      .attr('height', yScale.bandwidth())
      .attr('x', (d) => xScale(d[0]))
      .attr('width', (d) => xScale(d[1]) - xScale(d[0]))
      .attr('tabindex', '-1')
      .attr('aria-label', function (this: SVGRectElement, d) {
        const seriesName = (d3.select(this.parentElement as unknown as SVGGElement).datum() as d3.Series<StackedDatum, string>)?.key ?? '';
        const label = (d.data as StackedDatum).label;
        const value = (d.data as StackedDatum)[seriesName];
        return `${seriesName} - ${label}: ${value}`;
      })
      .style('cursor', 'pointer')
      .style('outline', 'none')
      .on('mouseover focus', function (this: SVGRectElement, event: MouseEvent | FocusEvent, d) {
        const hoveredSeries = (d3.select(this.parentElement as unknown as SVGGElement).datum() as d3.Series<StackedDatum, string>)?.key ?? '';
        const rowData = d.data as StackedDatum;
        const label = rowData.label;

        g.selectAll<SVGRectElement, d3.SeriesPoint<StackedDatum>>('rect')
          .style('opacity', function (this: SVGRectElement) {
            const key = (d3.select(this.parentElement as unknown as SVGGElement).datum() as d3.Series<StackedDatum, string>)?.key;
            return key === hoveredSeries ? 1 : 0.4;
          });

        const rows = series.map((s) => ({
          label: s,
          value: String(rowData[s] ?? 0),
          color: colorScale(s),
        }));

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

        tooltip.show(label, rows, px, py, tokens);
      })
      .on('mouseout blur', function () {
        g.selectAll<SVGRectElement, d3.SeriesPoint<StackedDatum>>('rect').style('opacity', 1);
        tooltip.hide();
      });

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call((sel) => renderBottomAxis(sel, xScale, { tokens: this.tokens, innerWidth }));

    g.append('g').call((sel) =>
      renderLeftAxis(sel, yScale, { tokens: this.tokens })
    );

    this.renderAxisLabels(g, innerWidth, innerHeight, this.tokens);

    // Legend
    if (this.config.legend !== false) {
      const legendItems = series.map((s) => ({ name: s, color: colorScale(s) }));
      renderLegend(this.config.container, legendItems, this.tokens);
    }
    this.renderCaption(this.tokens);

    // SVG-level keyboard navigation (ArrowUp/Down through group labels)
    const kbMargin = this.config.margin ?? { top: 20, right: 20, bottom: 40, left: 50 };
    const groupLabels = data.map((d) => d.label);

    this.svg
      .attr('tabindex', '0')
      .attr('role', 'application')
      .attr('aria-label', this.config.title ?? 'Chart');

    let kbIdx = -1;

    const showGroupTooltip = (label: string) => {
      const rowDatum = data.find((d) => d.label === label);
      const rows = series.map((s) => ({
        label: s,
        value: rowDatum ? String(rowDatum[s] ?? 0) : '—',
        color: colorScale(s),
      }));
      const svgRect = this.svg.node()!.getBoundingClientRect();
      const containerRect = this.config.container.getBoundingClientRect();
      const px = svgRect.left - containerRect.left + xScale(maxVal) + kbMargin.left;
      const py = svgRect.top - containerRect.top + (yScale(label) ?? 0) + yScale.bandwidth() / 2 + kbMargin.top;
      g.selectAll<SVGRectElement, d3.SeriesPoint<StackedDatum>>('rect')
        .style('opacity', function (this: SVGRectElement) {
          const ld = (d3.select(this).datum() as d3.SeriesPoint<StackedDatum>).data as StackedDatum;
          return ld.label === label ? 1 : 0.4;
        });
      tooltip.show(label, rows, px, py, tokens);
    };

    this.svg.on('keydown.kb', (event: KeyboardEvent) => {
      if (!['ArrowUp', 'ArrowDown', 'Escape'].includes(event.key)) return;
      event.preventDefault();
      if (event.key === 'Escape') { (this.svg.node() as SVGElement).blur(); return; }
      kbIdx = event.key === 'ArrowDown'
        ? Math.min(kbIdx + 1, groupLabels.length - 1)
        : Math.max(kbIdx - 1, 0);
      if (kbIdx < 0) kbIdx = 0;
      showGroupTooltip(groupLabels[kbIdx]);
    })
    .on('focus.kb', () => {
      kbIdx = 0;
      showGroupTooltip(groupLabels[0]);
    })
    .on('blur.kb', () => {
      kbIdx = -1;
      g.selectAll<SVGRectElement, d3.SeriesPoint<StackedDatum>>('rect').style('opacity', 1);
      tooltip.hide();
    });
  }
}
