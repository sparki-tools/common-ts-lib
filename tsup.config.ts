import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'utils/index': 'src/utils/index.ts',
    'types/index': 'src/types/index.ts',
    'websocket/index': 'src/websocket/index.ts',
    'react/index': 'src/react/index.ts',
    'react/hooks/index': 'src/react/hooks/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ['react'],
  treeshake: true,
  splitting: false,
});
