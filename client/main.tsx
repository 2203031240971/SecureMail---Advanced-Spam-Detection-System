import "./global.css";
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

console.log("Starting React app...");

const container = document.getElementById("root");
if (!container) {
  console.error("Root element not found");
  throw new Error("Root element not found");
}

try {
  const root = createRoot(container);
  console.log("Created React root, rendering app...");
  root.render(React.createElement(App));
  console.log("App rendered successfully");
} catch (error) {
  console.error("Failed to render app:", error);

  // Fallback error display
  const errorDiv = document.createElement("div");
  errorDiv.innerHTML = `
    <div style="padding: 20px; font-family: Arial, sans-serif;">
      <h1 style="color: #dc2626;">Error Loading SecureMail</h1>
      <p>There was an error loading the application. Please try refreshing the page.</p>
      <details>
        <summary>Error details</summary>
        <pre style="background: #f5f5f5; padding: 10px; margin-top: 10px;">${error}</pre>
      </details>
    </div>
  `;
  container.appendChild(errorDiv);
}
