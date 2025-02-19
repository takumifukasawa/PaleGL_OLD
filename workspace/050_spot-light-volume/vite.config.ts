import * as path from 'path';
import { resolve } from 'path';
import { defineConfig, loadEnv, Plugin } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { createHtmlPlugin } from 'vite-plugin-html';
import tsconfigPaths from 'vite-tsconfig-paths';
// @ts-ignore
import gltf from 'vite-plugin-gltf';
import glsl from 'vite-plugin-glsl';
import checker from 'vite-plugin-checker';
import { rimraf } from 'rimraf';
// import { minify } from 'terser';
import { shaderMinifierPlugin } from './vite-shader-minifier-plugin';
import { createDirectoryAsync } from './node-libs/file-io';
import { wait } from './node-libs/wait';
import * as process from 'process';
// import { NormalizedOutputOptions, OutputBundle, OutputChunk } from 'rollup';

export const deleteTmpCachesPlugin: () => Plugin = () => {
    return {
        name: 'delete-tmp-caches-plugin',
        // enforce: 'pre',
        async buildStart() {
            console.log('build start: delete-tmp-caches-plugin');
            const basePath = './';
            const tmpDirPath = path.join(basePath, 'tmp');
            await rimraf(tmpDirPath);
            await wait(10);
            await createDirectoryAsync(tmpDirPath);
        },
    };
};

/**
 *
 * #pragma BLOCK_***_START ~~ #pragma BLOCK_***_END を block として、その中身を挿入する
 */
const transformGlslLayout: () => Plugin = () => {
    return {
        name: 'transform-glsl-layout',
        enforce: 'pre',
        async transform(src: string, id: string) {
            const fileRegex = /\.glsl$/;
            if (fileRegex.test(id)) {
                const blockSrcRegex = /#pragma BLOCK_([A-Z_]*?)_START([\s\S]*?)#pragma BLOCK_[A-Z_]*?_END/g;
                const blockSrcMatches = [...src.matchAll(blockSrcRegex)];

                // for debug
                // const originalSrc = src;
                // console.log(`[transform-glsl-layout] target - id: ${id}`);
                // console.log("---------------------------------")
                // console.log(originalSrc)
                // console.log("---------------------------------")
                // console.log(blockSrcMatches)

                for (let i = 0; i < blockSrcMatches.length; i++) {
                    const [matchContent, blockName, blockContent] = blockSrcMatches[i];
                    const blockDestRegex = new RegExp(`#pragma BLOCK_${blockName}`, 'g');

                    // for debug
                    // console.log("---------------------------------")
                    // console.log("matchContent: ", matchContent);
                    // console.log("blockName: ", blockName);
                    // console.log("blockContent: ", blockContent);
                    // console.log("---------------------------------")
                    // console.log([...src.matchAll(blockDestRegex)]);
                    // console.log("---------------------------------")
                    // console.log("match block content: ", src.match(new RegExp(blockContent, 'g')));

                    // blockの囲い含めすべて消す
                    src = src.replaceAll(matchContent, '');
                    // 消した後、block内の記述を挿入（置き換え）
                    src = src.replaceAll(blockDestRegex, blockContent);
                }

                // for debug
                // console.log("---------------------------------")
                // console.log("original src: ------------------------------")
                // console.log(originalSrc)
                // console.log("result: ------------------------------")
                // console.log(src)

                return src;
            }
            return src;
        },
    };
};

/**
 *
 * #pragma UNROLL_START ~~ #pragma UNROLL_END を block として、その中身を挿入する
 * # 仕様
 * - 固定値 or definesを探す
 * - indexは0始まり
 * - unrollの中はfor文章一つという前提
 * - 2重ループは非対応。ただし、内側のループに対してのunrollは有効
 */
const transformGlslUnroll: () => Plugin = () => {
    return {
        name: 'transform-glsl-unroll',
        enforce: 'pre',
        async transform(src: string, id: string) {
            const fileRegex = /\.glsl$/;
            if (fileRegex.test(id)) {
                const unrollSrcRegex = /#pragma UNROLL_START([\s\S]*?)#pragma UNROLL_END/g;
                const unrollSrcMatches = [...src.matchAll(unrollSrcRegex)];
                // blockを抜き出す
                for (let i = 0; i < unrollSrcMatches.length; i++) {
                    // #pragmaの囲い自体を消す
                    const [needsUnrollBlockContent, needsUnrollContent] = unrollSrcMatches[i];
                    // const [, needsUnrollContent] = unrollSrcMatches[i];
                    // src = src.replaceAll(needsUnrollBlockContent, needsUnrollContent);

                    // forのブロックを中身だけに置き換え
                    // const forRegex = new RegExp('for.*?\\(int.*?;.*?<\\s+?.*?(.*?);.*?\\).*?{(.*?)}', 'g');
                    const forRegex = new RegExp('for.*?\\(int\\s([a-zA-Z0-9]+?).+?;.*?<\\s+?.*?(.*?);.*?\\).*?{(.*)}', 'g');
                    const forMatches = [...needsUnrollContent.matchAll(forRegex)];
                    if (forMatches.length < 1) {
                        console.error(`[transform-glsl-unroll] specify unroll but for loop not found: ${id}`);
                        continue;
                    }
                    
                    // unrollの中はfor文が一つだけという前提
                    let [, forIterateName, forLoopNumStr, forContent] = forMatches[0];
                    // console.log(forIterateName, forLoopNumStr, forContent)

                    // 固定値の場合はそのまま使い、#define で定義されている場合はdefineの値をシェーダー内から拾ってくる
                    let loopCount = parseInt(forLoopNumStr);
                    if (isNaN(loopCount)) {
                        const defineRegex = new RegExp(`#define\\s+?${forLoopNumStr}\\s+?(\\d+)`, 'g');
                        const defineMatches = [...src.matchAll(defineRegex)];
                        if (defineMatches.length > 0) {
                            loopCount = parseInt(defineMatches[0][1]);
                            // for debug
                            // console.log(`[transform-glsl-unroll] loop count is defined: ${forLoopNumStr} = ${loopCount}`);
                        } else {
                            console.error(`[transform-glsl-unroll] loop count is not defined: ${forLoopNumStr}`);
                        }
                    } else {
                        // for debug
                        // console.log(`[transform-glsl-unroll] loop count is specified: ${forLoopNumStr} = ${loopCount}`);
                    }

                    let unrolledStr = '';
                    for (let j = 0; j < loopCount; j++) {
                        // ループのindexを置き換え. UNROLL_i を i に置き換える
                        const indexRegex = new RegExp(`UNROLL_${forIterateName}`, 'g');
                        unrolledStr += forContent.replaceAll(indexRegex, j.toString());
                    }

                    src = src.replaceAll(needsUnrollBlockContent, unrolledStr);
                }

                return src;
            }
            return src;
        },
    };
};

// ref:
// https://ja.vitejs.dev/config/
// https://github.com/vitejs/vite/issues/621
/** @type {import('vite').UserConfig} */
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd());

    const isBundle = env.VITE_BUNDLE === 'true';
    const isMinifyShader = env.VITE_MINIFY_SHADER === 'true';
    const isMangleProperties = env.VITE_MANGLE_PROPERTIES === 'true';

    console.log(`=== [env] mode: ${mode} ===`);
    console.log(`isBundle: ${isBundle}`);
    console.log(`isMinifyShader: ${isMinifyShader}`);
    console.log(`isMangleProperties: ${isMangleProperties}`);
    console.log('===========================');

    return {
        base: './',
        plugins: [
            deleteTmpCachesPlugin(),
            tsconfigPaths(),
            checker({ typescript: true }),
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
            shaderMinifierPlugin({
                minify: isMinifyShader,
                minifierOptions: {
                    preserveExternals: true,
                    // noRenamingList: ["main,dfScene"] // object space raymarch の scene 探索用関数は rename しない
                    // preserveAllGlobals: true,
                    // noRenaming: true
                },
            }),
            checker({
                typescript: true,
                eslint: {
                    lintCommand: 'eslint --ext .ts,.js ./',
                },
            }),
            // minifyBundles(),
            ...(isBundle ? [viteSingleFile(), createHtmlPlugin()] : []),
        ],
        assetsInclude: ['**/*.gltf'],
        build: {
            reportCompressedSize: false,
            cssCodeSplit: false,
            // このbyte数よりも小さいアセットはbase64になる
            assetsInlineLimit: isBundle ? 100000000 : 0,
            rollupOptions: {
                input: {
                    main: isBundle
                        ? resolve(__dirname, 'main.ts') // js一個にまとめる場合
                        : resolve(__dirname, 'index.html'), // html含めてビルドする場合
                    // sandbox: isBundle
                    //     ? resolve(__dirname, 'sandbox/main.ts') // js一個にまとめる場合
                    //     : resolve(__dirname, 'sandbox/index.html'), // html含めてビルドする場合
                },
            },
            minify: 'terser',
            target: 'es2022',
            terserOptions: {
                // keep_classnames: false,
                // keep_fnames: true,
                mangle: {
                    toplevel: true,
                    properties: isMangleProperties, // TODO: 出し分けできてないかも
                    // WIP
                    // properties: {
                    //     regex: /^_/
                    //     // regex: /^(Hoge)$/
                    // }
                },
                compress: {
                    drop_console: true,
                    drop_debugger: true,
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
