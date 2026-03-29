import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
})
```

Salva con `Ctrl + S`, poi nel terminale:
```
git add .
git commit -m "fix base path per Netlify"
git push origin main