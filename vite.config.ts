import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Set base to repository name so GitHub Pages serves assets from the correct path
// Example: https://<user>.github.io/testdashboard/
export default defineConfig({
  base: '/testdashboard/',
  plugins: [react()],
})
