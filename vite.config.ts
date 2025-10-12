import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { VitePWA } from "vite-plugin-pwa";
import gitInfo from "./git-info.json";

// https://vitejs.dev/config/
export default defineConfig({
  server: { host: true },
  plugins: [
    react(),
    tsconfigPaths(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true,
      },
      manifestFilename: "manifest.json",
      workbox: {
        mode: "production",
        globPatterns: ["**/*.{js,css,html,ico,png,svg,json,jpeg}"],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === self.location.origin,
            handler: "NetworkFirst",
            options: {
              cacheName: "site-cache",
            },
          },
        ],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB
      },
      manifest: {
        name: "infinidream",
        short_name: "infinidream",
        description: "infinidream remote control app",
        theme_color: "#ffdab7",
        background_color: "#ffdab7",
        screenshots: [
          {
            src: "screenshot-1.jpeg",
            sizes: "3016x2020",
            form_factor: "wide",
          },
          {
            src: "screenshot-2.jpeg",
            sizes: "850x1852",
            form_factor: "narrow",
          },
        ],
        icons: [
          {
            purpose: "maskable",
            sizes: "192x192",
            src: "icons/maskable/maskable_icon_x192.png",
            type: "image/png",
          },
          {
            purpose: "maskable",
            sizes: "512x512",
            src: "icons/maskable/maskable_icon_x512.png",
            type: "image/png",
          },
        ],
      },
    }),
  ],
  define: {
    "import.meta.env.VITE_COMMIT_REF": JSON.stringify(gitInfo?.VITE_COMMIT_REF),
    "import.meta.env.VITE_BRANCH": JSON.stringify(gitInfo?.VITE_BRANCH),
    "import.meta.env.VITE_BUILD_DATE": JSON.stringify(gitInfo?.VITE_BUILD_DATE),
  },
  build: {
    target: "esnext",
  },
});
