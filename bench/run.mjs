import { Bench } from "tinybench";
import styleTransform from "@enhance/enhance-style-transform";
import importTransform from "@enhance/import-transform";
import enhance from "../index.mjs";

const scriptTransform = importTransform({ lookup: (s) => s })

function SimpleElement({ html }) {
  return html`<p>Simple element</p>`;
}

function StyledElement({ html }) {
  return html`
    <style>
      p {
        color: red;
      }
    </style>
    <p>Styled element</p>
  `;
}

function StyledHostElement({ html }) {
  return html`
    <style>
      :host {
        display: block;
      }
      p {
        color: red;
      }
    </style>
    <p>Styled element</p>
  `;
}

function ScriptedElement({ html }) {
  return html`
    <p>Scripted element</p>
    <script>
      console.log('Scripted element')
    </script>
  `;
}

function ScriptedImportElement({ html }) {
  return html`
    <p>Scripted element</p>
    <script>
      import('./script.js')
      console.log('Scripted element')
    </script>
  `;
}

function NestedElement({ html }) {
  return html`
    <p>Nested element</p>
    <simple-element></simple-element>
  `;
}

function SlotElement({ html }) {
  return html`
    <p>Slot element</p>
    <slot></slot>
  `;
}

function SuperElement({ html }) {
  return html`
    <style>
      p {
        color: blue;
      }
    </style>
    <p>Super element</p>
    <slot-element>
      <nested-element></nested-element>
      <styled-element></styled-element>
    </slot-element>
    <script>
      console.log('Super element')
    </script>
  `;
}

const allElements = {
  "simple-element": SimpleElement,
  "styled-element": StyledElement,
  "styled-host-element": StyledHostElement,
  "scripted-element": ScriptedElement,
  "scripted-import-element": ScriptedImportElement,
  "nested-element": NestedElement,
  "slot-element": SlotElement,
  "super-element": SuperElement,
};

const procedures = [
  {
    name: "simple",
    enhanceConfig: {
      elements: {
        "simple-element": SimpleElement,
      },
    },
    input: "<simple-element></simple-element>",
  },
  {
    name: "styled",
    enhanceConfig: {
      elements: {
        "styled-element": StyledElement,
      },
    },
    input: "<styled-element></styled-element>",
  },
  {
    name: "styled host",
    enhanceConfig: {
      elements: {
        "styled-host-element": StyledHostElement,
      },
      styleTransforms: [styleTransform],
    },
    input: "<styled-host-element></styled-host-element>",
  },
  {
    name: "scripted",
    enhanceConfig: {
      elements: {
        "scripted-element": ScriptedElement,
      },
    },
    input: "<scripted-element></scripted-element>",
  },
  {
    name: "scripted import",
    enhanceConfig: {
      elements: {
        "scripted-import-element": ScriptedImportElement,
      },
      scriptTransforms: [scriptTransform],
    },
    input: "<scripted-import-element></scripted-import-element>",
  },
  {
    name: "nested",
    enhanceConfig: {
      elements: {
        "nested-element": NestedElement,
      },
    },
    input: "<nested-element></nested-element>",
  },
  {
    name: "slot",
    enhanceConfig: {
      elements: {
        "slot-element": SlotElement,
      },
    },
    input: "<slot-element><p>Hi</p></slot-element>",
  },
  {
    name: "super",
    enhanceConfig: {
      elements: {
        "simple-element": SimpleElement,
        "styled-element": StyledElement,
        // 'scripted-element': ScriptedElement,
        "nested-element": NestedElement,
        "slot-element": SlotElement,
        "super-element": SuperElement,
      },
    },
    input: "<super-element></super-element>",
  },
  {
    name: "super++",
    enhanceConfig: {
      elements: allElements,
      styleTransforms: [styleTransform],
      scriptTransforms: [scriptTransform],
    },
    input: "<super-element></super-element>",
  }
];

const bench = new Bench({ time: 100 });

for (const proc of procedures) {
  const html = enhance(proc.enhanceConfig);
  bench.add(proc.name, () => html`${proc.input}`);

  bench.add(`${proc.name} [100]`, () => {
    return html`${proc.input.repeat(100)}`;
  });

  // * [BIG] doesn't vary much from the normal case; leave it out...
  // const bigHtml = enhance({
  //   ...proc.enhanceConfig,
  //   elements: allElements,
  //   styleTransforms: [styleTransform],
  //   scriptTransforms: [importTransform({ lookup: (s) => s })],
  // });
  // bench.add(`${proc.name} [BIG]`, () => bigHtml`${proc.input}`);
}

await bench.warmup();
await bench.run();

// console.table(
//   bench.table().sort(
//     (a, b) =>
//       Number(b['ops/sec'].replace(',','')) - Number(a['ops/sec'].replace(',',''))
//   )
// )

const table = bench.tasks.map((task) => ({
  name: task.name,
  "ops/sec": task.result?.error
    ? "NaN"
    : task.result?.hz ? Number.parseInt(task.result?.hz.toString(), 10).toString() : "NaN",
  average: task.result?.error ? "NaN" : task.result?.mean.toFixed(3),
  samples: task.result?.error ? "NaN" : task.result?.samples.length,
}));

const results = table
  .map((x) => ({ ...x, "ops/sec": Number.parseFloat(x["ops/sec"]) }))
  .toSorted((a, b) => b["ops/sec"] - a["ops/sec"]);

const maxOps = Math.max(...results.map((x) => x["ops/sec"]));

console.table(
  results.map((x, i) => ({
    ...x,
    [`relative to ${results[0].name}`]:
      i === 0
        ? ""
        : `${(maxOps / x["ops/sec"]).toFixed(2)} x slower`,
  })),
);
