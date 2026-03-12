import * as d3 from 'd3';
import { BaseChart, type BaseChartConfig } from '../base-chart';
import { createLinearScale, createPointScale, createOrdinalColorScale } from '../../utils/scales';
import { renderBottomAxis, renderLeftAxis, renderGridlinesY, renderGridlinesX } from '../../utils/axes';
import { CHART_CONSTANTS } from '../../constants';
import type { Datum } from '../bar/bar-chart';
import type { LineSeries } from '../line/line-chart';
import { ChartTooltip } from '../../utils/tooltip';
import { renderLegend } from '../../utils/legend';

export interface AreaChartConfig extends BaseChartConfig {
  series: LineSeries[];
}

export class AreaChart extends BaseChart<AreaChartConfig> {
  private tooltip?: ChartTooltip;

  render(): void {
    if (this.tooltip) {
      this.tooltip.destroy();
    }
    this.tokens = this.getTokens();
    const g = this.setupSvg();
    const { series } = this.config;
    const innerWidth = this.getInnerWidth();
    const innerHeight = this.getInnerHeight();

    if (!series || series.length === 0) {
      g.append('text')
        .attr('x', innerWidth / 2)
        .attr('y', innerHeight / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', this.tokens.colorTextMuted)
        .attr('font-family', this.tokens.fontFamily)
        .text('No data');
      return;
    }

    const allLabels = series[0].data.map((d) => d.label);
    const xScale = createPointScale(allLabels, [0, innerWidth]);

    const allValues = series.flatMap((s) => s.data.map((d) => d.value));
    const yScale = createLinearScale([0, d3.max(allValues) ?? 0], [innerHeight, 0]);

    const colorScale = createOrdinalColorScale(
      series.map((s) => s.name),
      this.tokens.chartColors
    );

    // Gridlines (before data layer)
    if (this.config.gridlines?.y !== false) {
      renderGridlinesY(g, yScale, innerWidth, this.tokens);
    }
    if (this.config.gridlines?.x !== false) {
      renderGridlinesX(g, xScale, innerHeight, this.tokens);
    }

    // Annotations
    this.renderAnnotations(g, yScale, xScale, innerWidth, innerHeight, this.tokens);

    const areaGen = d3
      .area<Datum>()
      .x((d) => xScale(d.label) ?? 0)
      .y0(innerHeight)
      .y1((d) => yScale(d.value))
      .curve(d3.curveLinear);

    const lineGen = d3
      .line<Datum>()
      .x((d) => xScale(d.label) ?? 0)
      .y((d) => yScale(d.value))
      .curve(d3.curveLinear);

    series.forEach((s) => {
      const color = colorScale(s.name);

      g.append('path')
        .datum(s.data)
        .attr('fill', color)
        .attr('fill-opacity', CHART_CONSTANTS.areaOpacity)
        .attr('d', areaGen);

      g.append('path')
        .datum(s.data)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', CHART_CONSTANTS.strokeWidth)
        .attr('d', lineGen);
    });

    // Tooltip
    this.tooltip = new ChartTooltip(this.config.container);
    const tooltip = this.tooltip;
    const tokens = this.tokens;

    // Crosshair group (vertical line + per-series dots), hidden until hover
    const crosshair = g.append('g').attr('class', 'crosshair').style('display', 'none');

    crosshair.append('line')
      .attr('class', 'crosshair-line')
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', tokens.colorBorder)
      .attr('stroke-width', 1)
      .attr('pointer-events', 'none');

    series.forEach((s) => {
      crosshair.append('circle')
        .attr('class', 'crosshair-dot')
        .attr('data-series', s.name)
        .attr('r', 4)
        .attr('fill', colorScale(s.name))
        .attr('stroke', 'white')
        .attr('stroke-width', 2)
        .attr('pointer-events', 'none');
    });

    // Focus handles per data point per series
    series.forEach((s) => {
      const color = colorScale(s.name);
      s.data.forEach((d) => {
        const cx = xScale(d.label) ?? 0;
        const cy = yScale(d.value);

        g.append('circle')
          .datum(d)
          .attr('cx', cx)
          .attr('cy', cy)
          .attr('r', 12)
          .attr('fill', 'transparent')
          .attr('tabindex', '0')
          .attr('aria-label', `${s.name} ${d.label}: ${d.value}`)
          .style('cursor', 'pointer')
          .style('outline', 'none')
          .on('focus', (event: FocusEvent, fd: Datum) => {
            const containerRect = this.config.container.getBoundingClientRect();
            const target = event.target as HTMLElement;
            const rect = target.getBoundingClientRect();
            const px = rect.left - containerRect.left + rect.width / 2;
            const py = rect.top - containerRect.top;

            crosshair.style('display', null);
            crosshair.select('.crosshair-line').attr('x1', cx).attr('x2', cx);
            crosshair.selectAll<SVGCircleElement, unknown>('.crosshair-dot')
              .each(function() {
                const el = d3.select(this);
                if (el.attr('data-series') === s.name) {
                  el.attr('cx', cx).attr('cy', cy);
                }
              });

            tooltip.show(
              fd.label,
              [{ label: s.name, value: fd.value.toString(), color }],
              px,
              py,
              tokens
            );
          })
          .on('blur', () => {
            crosshair.style('display', 'none');
            tooltip.hide();
          });
      });
    });

    // Mousemove overlay
    const margin = this.config.margin ?? { top: 20, right: 20, bottom: 40, left: 50 };
    const svgNode = this.svg.node();

    g.append('rect')
      .attr('class', 'tooltip-overlay')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .on('mousemove', (event: MouseEvent) => {
        if (!svgNode) return;
        const svgRect = svgNode.getBoundingClientRect();
        const mouseX = event.clientX - svgRect.left - margin.left;

        let nearestLabel = allLabels[0];
        let minDist = Infinity;
        for (const label of allLabels) {
          const lx = xScale(label) ?? 0;
          const dist = Math.abs(lx - mouseX);
          if (dist < minDist) {
            minDist = dist;
            nearestLabel = label;
          }
        }

        const nearestX = xScale(nearestLabel) ?? 0;

        // Update crosshair
        crosshair.style('display', null);
        crosshair.select('.crosshair-line').attr('x1', nearestX).attr('x2', nearestX);
        crosshair.selectAll<SVGCircleElement, unknown>('.crosshair-dot').each(function() {
          const el = d3.select(this);
          const seriesName = el.attr('data-series');
          const s = series.find((s) => s.name === seriesName);
          const point = s?.data.find((dp) => dp.label === nearestLabel);
          if (point) {
            el.attr('cx', nearestX).attr('cy', yScale(point.value));
          }
        });

        const rows = series.map((s) => {
          const point = s.data.find((dp) => dp.label === nearestLabel);
          return {
            label: s.name,
            value: point ? point.value.toString() : '—',
            color: colorScale(s.name),
          };
        });

        const containerRect = this.config.container.getBoundingClientRect();
        const px = event.clientX - containerRect.left;
        const py = event.clientY - containerRect.top;

        tooltip.show(nearestLabel, rows, px, py, tokens);
      })
      .on('mouseleave', () => {
        crosshair.style('display', 'none');
        tooltip.hide();
      });

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call((sel) => renderBottomAxis(sel, xScale, { tokens: this.tokens }));

    g.append('g').call((sel) =>
      renderLeftAxis(sel, yScale, { tokens: this.tokens })
    );

    this.renderAxisLabels(g, innerWidth, innerHeight, this.tokens);

    // Legend
    if (this.config.legend !== false && series.length > 1) {
      const legendItems = series.map((s) => ({ name: s.name, color: colorScale(s.name) }));
      renderLegend(this.config.container, legendItems, this.tokens);
    }
    this.renderCaption(this.tokens);
  }
}
