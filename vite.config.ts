import { resolve } from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig, loadEnv } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
// @ts-ignore
import gltf from 'vite-plugin-gltf';
import glsl from 'vite-plugin-glsl';
import checker from 'vite-plugin-checker';
import * as process from 'process';
import { transformGlslUnroll } from './plugins/vite-transform-glsl-unroll-plugin.ts';
import { transformGlslLayout } from './plugins/vite-transform-glsl-layout-plugin.ts';
import { transformExtractGlslRaymarchTemplate } from './plugins/vite-extract-glsl-raymarch-template-plugin.ts';
import string from 'vite-plugin-string';

type EntryPointInfo = { name: string; path: string };

// ---------------------------------------------------
// ビルドするentryを定義. TODO: 手動で切り替えるの面倒なので自動で分けたい
// const ENTRY_NAME = ENTRY_NAME_INDEX;
const ENTRY_NAME: string = 'sandbox';

const IS_MAIN_ENTRY = false;
const ENTRY_PATH = IS_MAIN_ENTRY ? ENTRY_NAME : `labs/${ENTRY_NAME}`;
// ---------------------------------------------------

// ref:
// https://ja.vitejs.dev/config/
// https://github.com/vitejs/vite/issues/621
/** @type {import('vite').UserConfig} */
export default defineConfig(async (config) => {
    const { mode } = config;

    const env = loadEnv(mode, process.cwd());

    // NOTE: 本来はなくてもいいはず
    Object.assign(process.env, env);

    const isDropConsole = env.VITE_DROP_CONSOLE === 'true';

    console.log(`=== [env] mode: ${mode} ===`);
    console.log(`isDropConsole: ${isDropConsole}`);
    console.log(`entryPath: ${ENTRY_PATH}`);
    console.log(`======================`);

    // NOTE: 今はentryを一つにしているので複数管理前提にする必要はない
    const entryPointInfos: EntryPointInfo[] = [];

    entryPointInfos.push({
        name: ENTRY_NAME,
        path: ENTRY_PATH,
    });

    const entryPoints: { [key: string]: string } = {};
    entryPointInfos.forEach((entryPointInfo) => {
        entryPoints[entryPointInfo.name] = resolve(__dirname, `pages/${entryPointInfo.path}/index.html`); // html含めてビルドする場合
    });

    console.log(`=== [entry_points] ===`);
    Object.keys(entryPoints).forEach((key) => {
        console.log(`${key}: ${entryPoints[key]}`);
    });
    console.log('======================');

    // ref:
    // https://uga-box.hatenablog.com/entry/2022/05/03/000000
    // https://vitejs.dev/config/
    return {
        plugins: [
            checker({
                overlay: false,
            }),
            tsconfigPaths(),
            checker({ typescript: true }),
            string({
                include: '**/*.txt',
            }),
            gltf(),
            glsl({
                include: ['**/*.glsl'],
                watch: true,
                root: 'src/PaleGL',
                defaultExtension: 'glsl',
                warnDuplicatedImports: true,
                exclude: undefined,
                compress: false,
            }),
            transformGlslLayout(),
            transformGlslUnroll(),
            // shaderMinifierPlugin({
            //     minify: isMinifyShader,
            //     minifierOptions: {
            //         preserveExternals: true,
            //         noRenamingList: ['main', 'dfScene', ...viteGlslShaderMinifierCustomNoRenamingList],
            //         aggressiveInlining: false,
            //     },
            // }),
            transformExtractGlslRaymarchTemplate({
                extractEnabled: true,
            }),
            checker({
                typescript: true,
                eslint: {
                    lintCommand: 'eslint --ext .ts,.js ./',
                },
            }),
            visualizer({
                template: 'treemap',
            }),
        ],
        // assetsInclude: ['**/*.gltf', '**/*.dxt'],
        assetsInclude: ['**/*.gltf'],
        root: './pages',
        publicDir: resolve(__dirname, 'public'),
        build: {
            reportCompressedSize: false,
            cssCodeSplit: false,
            // このbyte数よりも小さいアセットはbase64になる
            assetsInlineLimit: 0,
            outDir: resolve(__dirname, 'dist'),
            emptyOutDir: true,
            rollupOptions: {
                input: entryPoints,
                output: {
                    inlineDynamicImports: false,
                    entryFileNames: () => {
                        return IS_MAIN_ENTRY ? `assets/main.js` : `${ENTRY_PATH}/assets/main.js`;
                    },
                    assetFileNames: () => {
                        return IS_MAIN_ENTRY ? `assets/[name].[ext]` : `${ENTRY_PATH}/assets/[name].[ext]`;
                    },
                    chunkFileNames: () => {
                        return IS_MAIN_ENTRY ? `assets/[name].js` : `${ENTRY_PATH}assets/[name].js`;
                    },
                },
            },
            minify: 'terser',
            target: 'esnext',
            terserOptions: {
                mangle: {
                    // toplevel: true,
                    // properties: true,
                    properties: {
                        regex: /^(_|\$)/,
                    },
                },
                compress: {
                    drop_console: isDropConsole,
                    drop_debugger: true,
                    passes: 16,
                },
            },
        },
        server: {
            watch: {
                usePolling: true,
                interval: 2000,
            },
        },
    };
});
