import * as d3 from 'd3';
import { BaseChart, type BaseChartConfig } from '../base-chart';
import { createBandScale, createLinearScale, createOrdinalColorScale } from '../../utils/scales';
import { renderBottomAxis, renderLeftAxis, renderGridlinesY } from '../../utils/axes';
import { ChartTooltip } from '../../utils/tooltip';
import { renderLegend } from '../../utils/legend';

export interface StackedDatum {
  label: string;
  [series: string]: number | string;
}

export interface StackedBarChartConfig extends BaseChartConfig {
  data: StackedDatum[];
  series: string[];
}

export class StackedBarChart extends BaseChart<StackedBarChartConfig> {
  private tooltip?: ChartTooltip;

  render(): void {
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

    const colorScale = createOrdinalColorScale(series, this.tokens.chartColors);
    const stackedData = d3.stack<StackedDatum>().keys(series)(data);

    const maxVal = d3.max(stackedData[stackedData.length - 1], (d) => d[1]) ?? 0;

    const xScale = createBandScale(
      data.map((d) => d.label),
      [0, innerWidth]
    );
    const yScale = createLinearScale([0, maxVal], [innerHeight, 0]);

    // Gridlines (before data layer)
    if (this.config.gridlines?.y !== false) {
      renderGridlinesY(g, yScale, innerWidth, this.tokens);
    }

    // Annotations
    this.renderAnnotations(g, yScale, null, innerWidth, innerHeight, this.tokens);

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
      .attr('x', (d) => xScale((d.data as StackedDatum).label) ?? 0)
      .attr('width', xScale.bandwidth())
      .attr('y', (d) => yScale(d[1]))
      .attr('height', (d) => yScale(d[0]) - yScale(d[1]))
      .attr('tabindex', '0')
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

        // Dim other segments
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
      .call((sel) => renderBottomAxis(sel, xScale, { tokens: this.tokens }));

    g.append('g').call((sel) =>
      renderLeftAxis(sel, yScale, { tokens: this.tokens })
    );

    this.renderAxisLabels(g, innerWidth, innerHeight, this.tokens);

    // Legend (always show for multi-series, unless opted out)
    if (this.config.legend !== false) {
      const legendItems = series.map((s) => ({ name: s, color: colorScale(s) }));
      renderLegend(this.config.container, legendItems, this.tokens);
    }
  }
}
