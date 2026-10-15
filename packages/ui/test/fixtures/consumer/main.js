// A consumer app, without JSX: renders kit components from the built bundle.
import { createElement as h } from "react";
import { createRoot } from "react-dom/client";

import { PortalButton, PortalStatusChip } from "../../../dist/index.js";
import "./app.css";

createRoot(document.getElementById("root")).render(
  h(
    "div",
    null,
    h(PortalButton, null, "Save"),
    h(PortalStatusChip, { label: "Active", tone: "success" }),
  ),
);
