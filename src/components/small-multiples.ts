import * as d3 from 'd3';
import { getTokens } from '../tokens/kern-tokens';
import { BarChart } from '../charts/bar/bar-chart';
import type { Datum } from '../charts/bar/bar-chart';
import { LineChart } from '../charts/line/line-chart';
import type { LineSeries } from '../charts/line/line-chart';

export type SmallMultiplesChartType = 'BarChart' | 'LineChart';

export interface SmallMultiplesConfig {
  container: HTMLElement;
  data: Record<string, any>[];
  facetKey: string;
  type: SmallMultiplesChartType;
  columns?: number;
  minChartWidth?: number;
  chartHeight?: number;
  gap?: number;
  xValueKey?: string;
  yValueKey?: string;
  xSeriesKey?: string;
  valueKey?: string;
  seriesKey?: string;
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  animated?: boolean;
  gridlines?: { x?: boolean; y?: boolean };
}

export class SmallMultiples {
  private config: SmallMultiplesConfig;

  constructor(config: SmallMultiplesConfig) {
    this.config = {
      columns: 2,
      minChartWidth: 200,
      chartHeight: 240,
      gap: 16,
      xValueKey: 'label',
      yValueKey: 'value',
      xSeriesKey: 'label',
      valueKey: 'value',
      seriesKey: 'series',
      animated: true,
      ...config,
    };
  }

  render(): void {
    const {
      container,
      data,
      facetKey,
      type,
      columns = 2,
      minChartWidth = 200,
      chartHeight = 240,
      gap = 16,
      xValueKey = 'label',
      yValueKey = 'value',
      xSeriesKey = 'label',
      valueKey = 'value',
      seriesKey = 'series',
      animated,
      gridlines,
      xAxisLabel,
      yAxisLabel,
    } = this.config;

    // Clear container
    container.innerHTML = '';

    const tokens = getTokens(container);

    // Get unique facet values preserving order of first appearance
    const facetValues = Array.from(new Set(data.map((d) => d[facetKey])));

    // Split data by facet
    const facetData = new Map<string, Record<string, any>[]>();
    for (const fv of facetValues) {
      facetData.set(fv, data.filter((d) => d[facetKey] === fv));
    }

    // Compute global domains
    let globalYMax = 0;
    let globalXDomain: string[] = [];

    if (type === 'BarChart') {
      for (const [, rows] of facetData) {
        const vals = rows.map((r) => r[yValueKey] as number);
        const localMax = d3.max(vals) ?? 0;
        if (localMax > globalYMax) globalYMax = localMax;

        const labels = rows.map((r) => r[xValueKey] as string);
        for (const lbl of labels) {
          if (!globalXDomain.includes(lbl)) globalXDomain.push(lbl);
        }
      }
    } else if (type === 'LineChart') {
      for (const [, rows] of facetData) {
        const vals = rows.map((r) => r[valueKey] as number);
        const localMax = d3.max(vals) ?? 0;
        if (localMax > globalYMax) globalYMax = localMax;

        const labels = rows.map((r) => r[xSeriesKey] as string);
        for (const lbl of labels) {
          if (!globalXDomain.includes(lbl)) globalXDomain.push(lbl);
        }
      }
    }

    // Enforce minimum container width
    const minContainerWidth = columns * minChartWidth + (columns - 1) * gap;
    container.style.minWidth = `${minContainerWidth}px`;

    // Create title if provided
    if (this.config.title) {
      const titleEl = document.createElement('p');
      titleEl.textContent = this.config.title;
      titleEl.style.cssText = `
        margin: 0 0 ${tokens.spaceSmall} 0;
        padding: 0;
        font-family: ${tokens.fontFamily};
        font-size: ${tokens.fontSizeBase};
        color: ${tokens.colorText};
        font-weight: 600;
      `;
      container.appendChild(titleEl);
    }

    // Create CSS grid wrapper
    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
      display: grid;
      grid-template-columns: repeat(${columns}, 1fr);
      gap: ${gap}px;
    `;
    container.appendChild(wrapper);

    // Render each facet
    for (const fv of facetValues) {
      const rows = facetData.get(fv)!;

      // Facet container
      const facetContainer = document.createElement('div');
      facetContainer.style.cssText = `
        display: flex;
        flex-direction: column;
      `;

      // Facet title
      const facetTitle = document.createElement('p');
      facetTitle.textContent = String(fv);
      facetTitle.style.cssText = `
        margin: 0 0 ${tokens.spaceXSmall} 0;
        padding: 0;
        font-family: ${tokens.fontFamily};
        font-size: ${tokens.fontSizeSmall || '12px'};
        color: ${tokens.colorTextMuted};
        font-weight: 600;
      `;
      facetContainer.appendChild(facetTitle);

      // Chart sub-container
      const chartDiv = document.createElement('div');
      chartDiv.style.cssText = `
        width: 100%;
        height: ${chartHeight}px;
      `;
      facetContainer.appendChild(chartDiv);
      wrapper.appendChild(facetContainer);

      // Instantiate chart in requestAnimationFrame so layout is settled
      requestAnimationFrame(() => {
        if (type === 'BarChart') {
          const barData: Datum[] = rows.map((r) => ({
            label: r[xValueKey] as string,
            value: r[yValueKey] as number,
          }));

          new BarChart({
            container: chartDiv,
            data: barData,
            animated,
            gridlines,
            xAxisLabel,
            yAxisLabel,
            minWidth: minChartWidth,
            domainX: globalXDomain,
            domainY: [0, globalYMax],
          }).render();
        } else if (type === 'LineChart') {
          // Group rows into series
          const seriesNames = Array.from(new Set(rows.map((r) => r[seriesKey] as string)));
          const lineSeries: LineSeries[] = seriesNames.map((sName) => ({
            name: sName,
            data: rows
              .filter((r) => r[seriesKey] === sName)
              .map((r) => ({
                label: r[xSeriesKey] as string,
                value: r[valueKey] as number,
              })),
          }));

          new LineChart({
            container: chartDiv,
            series: lineSeries,
            animated,
            gridlines,
            xAxisLabel,
            yAxisLabel,
            minWidth: minChartWidth,
            domainY: [0, globalYMax],
          }).render();
        }
      });
    }
  }
}
