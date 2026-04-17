# kern-visualization

D3.js data visualization components built on the [KERN UX design system](https://github.com/tobiaskauer/kern-ux-plain).

**[Live documentation →](https://tobiaskauer.github.io/kern-visualization/)**

---

## Chart types

| Chart | Description |
|---|---|
| `BarChart` | Horizontal bars |
| `ColumnChart` | Vertical columns |
| `StackedBarChart` | Stacked horizontal bars |
| `StackedColumnChart` | Stacked vertical columns |
| `LineChart` | Single or multi-series line |
| `AreaChart` | Single or multi-series area |
| `StackedAreaChart` | Stacked area |
| `ScatterChart` | Scatter / bubble plot |
| `SmallMultiples` | Faceted multi-panel wrapper |

---

## Getting started

```bash
npm install kern-visualization d3
```

```ts
import { BarChart } from 'kern-visualization';

new BarChart({
  container: document.getElementById('chart'),
  data: [
    { label: 'Jan', value: 42 },
    { label: 'Feb', value: 68 },
    { label: 'Mär', value: 35 },
  ],
  title: 'Monthly Values',
}).render();
```

> The container must be in the DOM before calling `render()`. When creating the element programmatically, wrap the call in `requestAnimationFrame`.

---

## Configuration

Options shared across all chart types:

| Option | Type | Default | Description |
|---|---|---|---|
| `headline` | `string` | — | Heading rendered above the chart |
| `subheadline` | `string` | — | Subheading below the headline |
| `caption` | `string` | — | Source/footnote below the chart |
| `xAxisLabel` | `string` | — | Label for the x-axis |
| `yAxisLabel` | `string` | — | Label for the y-axis |
| `animated` | `boolean` | `true` | Entry animations |
| `legend` | `boolean` | `true` | Show legend (multi-series charts) |
| `legendPosition` | `'bottom' \| 'inline'` | `'bottom'` | `'inline'` places labels at line endpoints |
| `gridlines` | `{ x?: boolean, y?: boolean }` | off | Show axis gridlines |
| `annotations` | `Annotation[]` | — | Reference lines with optional labels |
| `colorScheme` | `'categorical' \| 'sequential' \| 'diverging'` | `'categorical'` | Colour palette |
| `margin` | `{ top, right, bottom, left }` | built-in defaults | Inner SVG margin in pixels |
| `sort` | `'none' \| 'asc' \| 'desc'` | `'none'` | Bar/column sort order |

Chart-specific options (e.g. `series`, `showValueLabels`, `zLabel`) are documented in the [live Storybook](https://tobiaskauer.github.io/kern-visualization/).

---

## Theming

The library reads KERN CSS custom properties at render time. Wrap the container in a theme attribute:

```html
<div data-kern-theme="dark">
  <div id="chart"></div>
</div>
```

Supported values: `"light"` (default) | `"dark"`. The chart re-reads tokens on every `.render()` call, so switching the attribute and re-rendering updates all colours automatically.

---

## Development

Requires Node 20.

```bash
export PATH="/opt/homebrew/opt/node@20/bin:$PATH"
npm install
npm run dev              # Storybook at http://localhost:6007
npm run build            # Library build → dist/
npm run build-storybook  # Static docs → storybook-static/
```
