import * as d3 from 'd3';
import { BaseChart, type BaseChartConfig } from '../base-chart';
import { createBandScale, createLinearScale } from '../../utils/scales';
import { renderBottomAxis, renderLeftAxis, renderGridlinesY } from '../../utils/axes';
import { CHART_CONSTANTS } from '../../constants';
import { ChartTooltip } from '../../utils/tooltip';

export interface Datum {
  label: string;
  value: number;
}

export interface BarChartConfig extends BaseChartConfig {
  data: Datum[];
  showValueLabels?: boolean;
  sort?: 'asc' | 'desc' | 'none';
}

export class BarChart extends BaseChart<BarChartConfig> {
  private tooltip?: ChartTooltip;

  render(): void {
    if (this.isTooSmall()) return;
    // Destroy previous tooltip if re-rendering
    if (this.tooltip) {
      this.tooltip.destroy();
    }
    this.tokens = this.getTokens();
    const g = this.setupSvg();
    const rawData = this.config.data;
    const innerWidth = this.getInnerWidth();
    const innerHeight = this.getInnerHeight();

    const data = this.config.sort === 'asc'
      ? [...rawData].sort((a, b) => a.value - b.value)
      : this.config.sort === 'desc'
      ? [...rawData].sort((a, b) => b.value - a.value)
      : rawData;

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

    const xDomain = this.config.domainX ?? data.map((d) => d.label);
    const yMax = this.config.domainY ? this.config.domainY[1] : (d3.max(data, (d) => d.value) ?? 0);
    const xScale = createBandScale(xDomain, [0, innerWidth]);
    const yScale = createLinearScale([0, yMax], [innerHeight, 0]);

    // Gridlines (before data layer)
    if (this.config.gridlines?.y !== false) {
      renderGridlinesY(g, yScale, innerWidth, this.tokens);
    }

    // Tooltip
    this.tooltip = new ChartTooltip(this.config.container);
    const tooltip = this.tooltip;
    const tokens = this.tokens;
    const barColor = this.tokens.chartColors[0];

    // Bars
    const bars = g.selectAll<SVGRectElement, Datum>('rect').data(data);

    const enterBars = bars
      .enter()
      .append('rect')
      .attr('x', (d) => xScale(d.label) ?? 0)
      .attr('width', xScale.bandwidth())
      .attr('fill', barColor)
      .attr('rx', parseFloat(this.tokens.borderRadiusSmall))
      .attr('tabindex', '-1')
      .attr('aria-label', (d) => `${d.label}: ${d.value}`)
      .style('cursor', 'pointer')
      .style('outline', 'none');

    if (this.config.animated) {
      enterBars
        .attr('y', innerHeight)
        .attr('height', 0)
        .transition()
        .duration(CHART_CONSTANTS.animationDuration)
        .attr('y', (d) => yScale(d.value))
        .attr('height', (d) => innerHeight - yScale(d.value));
    } else {
      enterBars
        .attr('y', (d) => yScale(d.value))
        .attr('height', (d) => innerHeight - yScale(d.value));
    }

    // Hover / focus handlers
    const allBars = g.selectAll<SVGRectElement, Datum>('rect');

    allBars
      .on('mouseover focus', function (event: MouseEvent | FocusEvent, d) {
        // Dim other bars
        allBars.style('opacity', (other) => (other === d ? 1 : 0.4));

        // Get mouse position relative to container
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

        tooltip.show(
          d.label,
          [{ label: 'Wert', value: d.value.toString(), color: barColor }],
          px,
          py,
          tokens
        );
      })
      .on('mouseout blur', function () {
        allBars.style('opacity', 1);
        tooltip.hide();
      });

    // SVG-level keyboard navigation
    const margin = this.config.margin ?? { top: 20, right: 20, bottom: 40, left: 50 };
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
        ? Math.min(kbIdx + 1, data.length - 1)
        : Math.max(kbIdx - 1, 0);
      if (kbIdx < 0) kbIdx = 0;
      const d = data[kbIdx];
      allBars.style('opacity', (other) => (other === d ? 1 : 0.4));
      const svgRect = this.svg.node()!.getBoundingClientRect();
      const containerRect = this.config.container.getBoundingClientRect();
      const px = svgRect.left - containerRect.left + (xScale(d.label) ?? 0) + xScale.bandwidth() / 2 + margin.left;
      const py = svgRect.top - containerRect.top + yScale(d.value) + margin.top;
      tooltip.show(d.label, [{ label: 'Wert', value: d.value.toString(), color: barColor }], px, py, tokens);
    })
    .on('focus.kb', () => {
      kbIdx = 0;
      const d = data[0];
      allBars.style('opacity', (other) => (other === d ? 1 : 0.4));
      const svgRect = this.svg.node()!.getBoundingClientRect();
      const containerRect = this.config.container.getBoundingClientRect();
      const px = svgRect.left - containerRect.left + (xScale(d.label) ?? 0) + xScale.bandwidth() / 2 + margin.left;
      const py = svgRect.top - containerRect.top + yScale(d.value) + margin.top;
      tooltip.show(d.label, [{ label: 'Wert', value: d.value.toString(), color: barColor }], px, py, tokens);
    })
    .on('blur.kb', () => {
      kbIdx = -1;
      allBars.style('opacity', 1);
      tooltip.hide();
    });

    // Value labels
    if (this.config.showValueLabels) {
      g.selectAll<SVGTextElement, Datum>('text.value-label')
        .data(data)
        .enter()
        .append('text')
        .attr('class', 'value-label')
        .attr('x', (d) => (xScale(d.label) ?? 0) + xScale.bandwidth() / 2)
        .attr('y', (d) => yScale(d.value) - parseFloat(this.tokens.spaceXSmall))
        .attr('text-anchor', 'middle')
        .attr('fill', this.tokens.colorTextMuted)
        .attr('font-family', this.tokens.fontFamily)
        .attr('font-size', this.tokens.fontSizeSmall || '12px')
        .text((d) => d.value.toString());
    }

    // Annotations (after bars so lines render on top)
    this.renderAnnotations(g, yScale, null, innerWidth, innerHeight, this.tokens);

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call((sel) => renderBottomAxis(sel, xScale, { tokens: this.tokens, innerWidth }));

    g.append('g').call((sel) =>
      renderLeftAxis(sel, yScale, { tokens: this.tokens })
    );

    this.renderAxisLabels(g, innerWidth, innerHeight, this.tokens);
    this.renderCaption(this.tokens);
  }
}
