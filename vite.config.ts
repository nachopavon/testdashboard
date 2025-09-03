import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Set base to repository name so GitHub Pages serves assets from the correct path
// Example: https://<user>.github.io/testdashboard/
export default defineConfig({
  // For a custom domain the site must be served from the root
  base: '/',
  plugins: [react()],
})
