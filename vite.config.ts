import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  ssr: {
    noExternal: [
      "@apollo/client",
      "ts-invariant",
      "@rainbow-me/rainbowkit",
      /^@vanilla-extract\//,
    ],
  },
  optimizeDeps: {
    include: ["@apollo/client/core", "@apollo/client/cache"],
  },
});
