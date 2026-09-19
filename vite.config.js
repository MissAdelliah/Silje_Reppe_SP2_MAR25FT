import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/Silje_Reppe_SP2_MAR25FT/',

  build: {
    rollupOptions: {
      input: {
        home: resolve(__dirname, 'index.html'),
        auth: resolve(__dirname, 'auth.html'),
        profile: resolve(__dirname, 'profile.html'),
        listing: resolve(__dirname, 'listing.html'),
        create: resolve(__dirname, 'create.html'),
        edit: resolve(__dirname, 'edit.html'),
      },
    },
  },
});
