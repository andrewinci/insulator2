import { defineConfig } from "vite";
import { ViteFaviconsPlugin } from "vite-plugin-favicon";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), ViteFaviconsPlugin("../icons/icon.png")],
});
