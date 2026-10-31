import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // HTTPS front end: https://localhost:5173
    https: {
      key: "certs/localhost-key.pem",
      cert: "certs/localhost.pem",
    },
    // If you would rather avoid CORS entirely, comment out the https block
    // above and proxy /api to the backend instead:
    //
    // proxy: {
    //   "/api": {
    //     target: "https://localhost:5001",
    //     changeOrigin: true,
    //     secure: false, // backend dev cert is self-signed but trusted locally
    //   },
    // },
  },
});
