﻿import { GLObject } from '@/PaleGL/core/GLObject';
import {
    GL_DEPTH_COMPONENT,
    GL_DEPTH_COMPONENT16,
    GL_DEPTH_COMPONENT32F,
    GL_FLOAT,
    GL_R11F_G11F_B10F,
    GL_R16F,
    GL_RED,
    GL_RGB,
    GL_RGBA,
    GL_RGBA16F,
    GL_RGBA32F,
    GL_TEXTURE_2D,
    GL_TEXTURE_MAG_FILTER,
    GL_TEXTURE_MIN_FILTER,
    GL_TEXTURE_WRAP_S,
    GL_TEXTURE_WRAP_T,
    GL_UNPACK_FLIP_Y_WEBGL,
    GL_UNSIGNED_BYTE,
    GL_UNSIGNED_SHORT,
    GLTextureFilter,
    GLTextureWrap,
    TextureDepthPrecisionType,
    TextureFilterType,
    TextureFilterTypes,
    TextureType,
    TextureTypes,
    TextureWrapType,
    TextureWrapTypes,
} from '@/PaleGL/constants';
import { GPU } from './GPU';
import { isNeededCompact } from '@/PaleGL/utilities/envUtilities.ts';

export type TextureArgs = {
    // require
    gpu: GPU;
    // optional
    img?: HTMLImageElement | HTMLCanvasElement | null;
    arraybuffer?: ArrayBuffer | null;
    type?: TextureType;
    width?: number;
    height?: number;
    mipmap?: boolean;
    minFilter?: TextureFilterType;
    magFilter?: TextureFilterType;
    wrapS?: TextureWrapType;
    wrapT?: TextureWrapType;
    flipY?: boolean;
    depthPrecision?: TextureDepthPrecisionType;
    dxt1?: boolean;
};

/**
 *
 * @param glTextureFilter
 */
export function resolveGLEnumTextureFilterType(glTextureFilter: GLTextureFilter) {
    switch (glTextureFilter) {
        case GLTextureFilter.NEAREST:
            return TextureFilterTypes.Nearest;
        case GLTextureFilter.LINEAR:
            return TextureFilterTypes.Linear;
        case GLTextureFilter.NEAREST_MIPMAP_NEAREST:
            return TextureFilterTypes.NearestMipmapNearest;
        case GLTextureFilter.LINEAR_MIPMAP_NEAREST:
            return TextureFilterTypes.LinearMipmapNearest;
        case GLTextureFilter.NEAREST_MIPMAP_LINEAR:
            return TextureFilterTypes.NearestMipmapLinear;
        case GLTextureFilter.LINEAR_MIPMAP_LINEAR:
            return TextureFilterTypes.LinearMipmapLinear;
        default:
            console.error('[resolveGLEnumTextureFilterType] invalid glTextureFilter');
    }
}

/**
 *
 * @param glTextureWrap
 */
export function resolveGLEnumTextureWrapType(glTextureWrap: number) {
    switch (glTextureWrap) {
        case WebGLRenderingContext.CLAMP_TO_EDGE:
            return TextureWrapTypes.ClampToEdge;
        case WebGLRenderingContext.REPEAT:
            return TextureWrapTypes.Repeat;
        case WebGLRenderingContext.MIRRORED_REPEAT:
            return TextureWrapTypes.MirroredRepeat;
        default:
            console.error('[resolveGLEnumTextureWrapType] invalid glTextureWrap');
    }
}

// ref:
// https://webgl2fundamentals.org/webgl/lessons/webgl-data-textures.html
// TODO: texStorage2Dを使う場合と出し分ける
export class Texture extends GLObject {
    _texture: WebGLTexture;
    _img: HTMLImageElement | HTMLCanvasElement | null = null;
    _gpu: GPU;
    type: TextureType;
    minFilter: TextureFilterType;
    magFilter: TextureFilterType;
    mipmap: boolean;
    wrapS: TextureWrapType;
    wrapT: TextureWrapType;
    flipY: boolean;
    width: number | undefined;
    height: number | undefined;
    depthPrecision: TextureDepthPrecisionType | undefined;

    get glObject() {
        return this._texture;
    }

    constructor({
        gpu,
        img,
        arraybuffer,
        type = TextureTypes.RGBA,
        width,
        height,
        mipmap = false,
        minFilter = TextureFilterTypes.Nearest,
        magFilter = TextureFilterTypes.Nearest,
        wrapS = TextureWrapTypes.Repeat,
        wrapT = TextureWrapTypes.Repeat,
        flipY,
        depthPrecision,
        dxt1 = false,
    }: TextureArgs) {
        super();

        this._gpu = gpu;
        const gl = this._gpu.gl;

        this._img = img || null;
        this.type = type;
        this.mipmap = mipmap;
        this.minFilter = minFilter;
        this.magFilter = magFilter;
        this.wrapS = wrapS;
        this.wrapT = wrapT;
        this.width = width;
        this.height = height;
        // imgを持つが特に指定がない場合はflipする
        this.flipY = this._img && flipY === undefined ? true : !!flipY;

        this.depthPrecision =
            this.type === TextureTypes.Depth && depthPrecision !== undefined ? depthPrecision : undefined;

        if (this._img === null) {
            // this._img = createWhite1x1();
            // console.error("invalid img");
        }

        if (!this._img && !arraybuffer && (!width || !height)) {
            console.error('[Texture.constructor] invalid width or height');
        }

        const texture = gl.createTexture()!;
        // if (!texture) {
        //     console.error('[Texture.constructor] invalid texture');
        // }
        this._texture = texture;

        // bind texture object to gl
        gl.bindTexture(GL_TEXTURE_2D, this._texture);

        if (!isNeededCompact()) {
            if (dxt1) {
                const extDXT1 = gl.getExtension('WEBGL_compressed_texture_s3tc');
                console.log(`[Texture.constructor] extDXT1`, extDXT1);

                // ref: https://mklearning.blogspot.com/2014/10/webgldds.html

                // FCCを32bit符号付き整数に変換する
                const fourCCToInt32 = (value: string) => {
                    return (
                        (value.charCodeAt(0) << 0) +
                        (value.charCodeAt(1) << 8) +
                        (value.charCodeAt(2) << 16) +
                        (value.charCodeAt(3) << 24)
                    );
                };

                const ddsHeader = new Int32Array(arraybuffer!, 0, 32);
                if (ddsHeader[0] !== fourCCToInt32('DDS ')) {
                    console.error('[Texture.constructor] invalid DDS');
                    return;
                }

                const fourCCDXT1 = fourCCToInt32('DXT1');
                const fourCCDXT3 = fourCCToInt32('DXT3');
                const fourCCDXT5 = fourCCToInt32('DXT5');
                let ddsBlockBytes: number = -1;
                // let ddsFormat = extDXT1.COMPRESSED_RGB_S3TC_DXT1_EXT;
                let ddsFormat: number | undefined = -1;
                console.log(
                    `[Texture.constructor] is DXT5: ${ddsHeader[21] === fourCCDXT5}`,
                    ddsHeader[21],
                    fourCCDXT5
                );
                switch (ddsHeader[21]) {
                    case fourCCDXT1:
                        ddsBlockBytes = 8;
                        ddsFormat = extDXT1?.COMPRESSED_RGBA_S3TC_DXT1_EXT;
                        break;
                    case fourCCDXT3:
                        ddsBlockBytes = 16;
                        ddsFormat = extDXT1?.COMPRESSED_RGBA_S3TC_DXT3_EXT;
                        break;
                    case fourCCDXT5:
                        ddsBlockBytes = 16;
                        ddsFormat = extDXT1?.COMPRESSED_RGBA_S3TC_DXT5_EXT;
                        break;
                }
                const ddsWidth = ddsHeader[4];
                const ddsHeight = ddsHeader[3];
                const ddsOffset = ddsHeader[1] + 4;
                const ddsLength = (((Math.max(4, ddsWidth) / 4) * Math.max(4, ddsHeight)) / 4) * ddsBlockBytes;
                const ddsBuffer = new Uint8Array(arraybuffer!, ddsOffset, ddsLength);

                console.log(
                    `[Texture.constructor] ddsBlockBytes: ${ddsBlockBytes}, ddsFormat: ${ddsFormat}, ddsWidth: ${ddsWidth}, ddsHeight: ${ddsHeight}, ddsOffset: ${ddsOffset}, ddsLength: ${ddsLength}, ddsBuffer:`,
                    ddsBuffer
                );

                gl.compressedTexImage2D(GL_TEXTURE_2D, 0, ddsFormat!, ddsWidth, ddsHeight, 0, ddsBuffer);
            }
        }

        // mipmap settings
        if (mipmap) {
            gl.generateMipmap(GL_TEXTURE_2D);
        }

        //
        // filter
        //

        // filterable ref: https://webgl2fundamentals.org/webgl/lessons/webgl-data-textures.html
        switch (this.type) {
            case TextureTypes.RGBA:
            case TextureTypes.RGBA16F:
            case TextureTypes.RGBA32F:
            case TextureTypes.R11F_G11F_B10F:
            case TextureTypes.R16F:
                // min filter settings
                switch (this.minFilter) {
                    case TextureFilterTypes.Nearest:
                        gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GLTextureFilter.NEAREST);
                        break;
                    case TextureFilterTypes.Linear:
                        gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GLTextureFilter.LINEAR);
                        break;
                    default:
                        console.warn('[Texture.constructor] invalid min filter type and fallback to LINEAR');
                        gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GLTextureFilter.LINEAR);
                        break;
                }
                // mag filter settings
                switch (this.magFilter) {
                    case TextureFilterTypes.Nearest:
                        gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GLTextureFilter.NEAREST);
                        break;
                    case TextureFilterTypes.Linear:
                        gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GLTextureFilter.LINEAR);
                        break;
                    default:
                        console.warn('[Texture.constructor] invalid mag filter type and fallback to LINEAR');
                        gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GLTextureFilter.LINEAR);
                        break;
                }
                break;

            // TODO: depthの場合nearest必須？
            case TextureTypes.Depth:
                gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GLTextureFilter.NEAREST);
                gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GLTextureFilter.NEAREST);
                break;

            // // 「filterできない」で合っているはず？
            // case TextureTypes.RGBA32F:
            //     // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            //     // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            //     break;

            default:
                console.error('[Texture.constructor] invalid texture type');
        }

        //
        // wrap settings
        //

        switch (wrapS) {
            case TextureWrapTypes.ClampToEdge:
                gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GLTextureWrap.CLAMP_TO_EDGE);
                break;
            case TextureWrapTypes.Repeat:
                gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GLTextureWrap.REPEAT);
                break;
            default:
                console.warn('[Texture.constructor] invalid wrapS type and fallback to REPEAT');
                gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GLTextureWrap.REPEAT);
                break;
        }
        switch (wrapT) {
            case TextureWrapTypes.ClampToEdge:
                gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GLTextureWrap.CLAMP_TO_EDGE);
                break;
            case TextureWrapTypes.Repeat:
                gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GLTextureWrap.REPEAT);
                break;
            default:
                console.warn('[Texture.constructor] invalid wrapT type and fallback to REPEAT');
                gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GLTextureWrap.REPEAT);
                break;
        }

        //
        // storei
        //

        // if (!!this._img || this.flipY) {
        if (this.flipY) {
            // uv座標そのものは左下からなのでglもそれに合わせるためにflip
            // html image coord -> gl texture coord
            // (0, 0) - (1, 0)     (0, 1) - (1, 1)
            //   |         |         |         |
            // (0, 1) - (1, 1)     (0, 0) - (1, 0)
            gl.pixelStorei(GL_UNPACK_FLIP_Y_WEBGL, true);
        } else {
            gl.pixelStorei(GL_UNPACK_FLIP_Y_WEBGL, false);
        }

        //
        // bind texture data
        // TODO: startみたいな関数でtextureにdataをセットした方が効率よい？
        //

        switch (this.type) {
            case TextureTypes.RGBA:
                if (width && height) {
                    // for render target
                    if (this._img) {
                        gl.texImage2D(GL_TEXTURE_2D, 0, GL_RGBA, width, height, 0, GL_RGBA, GL_UNSIGNED_BYTE, this._img);
                    } else {
                        gl.texImage2D(GL_TEXTURE_2D, 0, GL_RGBA, width, height, 0, GL_RGBA, GL_UNSIGNED_BYTE, null);
                    }
                } else {
                    // set img to texture
                    if (this._img) {
                        gl.texImage2D(GL_TEXTURE_2D, 0, GL_RGBA, GL_RGBA, GL_UNSIGNED_BYTE, this._img);
                    } else {
                        // TODO: fix type
                        // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,null);
                    }
                }
                break;

            case TextureTypes.Depth:
                if (width && height) {
                    // for render target
                    // 1: use 16bit
                    if (this._img) {
                        gl.texImage2D(
                            GL_TEXTURE_2D,
                            0,
                            this.depthPrecision === TextureDepthPrecisionType.High
                                ? GL_DEPTH_COMPONENT32F
                                : GL_DEPTH_COMPONENT16,
                            width,
                            height,
                            0,
                            GL_DEPTH_COMPONENT,
                            this.depthPrecision === TextureDepthPrecisionType.High ? GL_FLOAT : GL_UNSIGNED_SHORT,
                            this._img
                        );
                    } else {
                        gl.texImage2D(
                            GL_TEXTURE_2D,
                            0,
                            this.depthPrecision === TextureDepthPrecisionType.High
                                ? GL_DEPTH_COMPONENT32F
                                : GL_DEPTH_COMPONENT16,
                            width,
                            height,
                            0,
                            GL_DEPTH_COMPONENT,
                            this.depthPrecision === TextureDepthPrecisionType.High ? GL_FLOAT : GL_UNSIGNED_SHORT,
                            null
                        );
                    }
                    // 2: use 32bit
                    // gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT32F, width, height, 0, gl.DEPTH_COMPONENT, gl.FLOAT, this._img);
                } else {
                    // set img to texture
                    // 1: use 16bit
                    // TODO: fix img nullable
                    if (this._img) {
                        gl.texImage2D(
                            GL_TEXTURE_2D,
                            0,
                            this.depthPrecision === TextureDepthPrecisionType.High
                                ? GL_DEPTH_COMPONENT32F
                                : GL_DEPTH_COMPONENT16,
                            GL_DEPTH_COMPONENT,
                            this.depthPrecision === TextureDepthPrecisionType.High ? GL_FLOAT : GL_UNSIGNED_SHORT,
                            this._img
                        );
                        // } else {
                        //     gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT16, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null);
                    }
                    // 2: use 32bit
                    // gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT32F, gl.DEPTH_COMPONENT, gl.FLOAT, this._img);
                }
                break;

            case TextureTypes.RGBA16F:
                if (width && height) {
                    if (this._img) {
                        gl.texImage2D(GL_TEXTURE_2D, 0, GL_RGBA16F, width, height, 0, GL_RGBA, GL_FLOAT, this._img);
                    } else {
                        gl.texImage2D(GL_TEXTURE_2D, 0, GL_RGBA16F, width, height, 0, GL_RGBA, GL_FLOAT, null);
                    }
                } else {
                    if (this._img) {
                        gl.texImage2D(GL_TEXTURE_2D, 0, GL_RGBA16F, GL_RGBA, GL_FLOAT, this._img);
                        // TODO: fix type
                        // } else {
                        // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, gl.RGBA, gl.FLOAT, null);
                    }
                }
                break;

            case TextureTypes.RGBA32F:
                if (width && height) {
                    if (this._img) {
                        gl.texImage2D(GL_TEXTURE_2D, 0, GL_RGBA32F, width, height, 0, GL_RGBA, GL_FLOAT, this._img);
                    } else {
                        gl.texImage2D(GL_TEXTURE_2D, 0, GL_RGBA32F, width, height, 0, GL_RGBA, GL_FLOAT, null);
                    }
                } else {
                    if (this._img) {
                        gl.texImage2D(GL_TEXTURE_2D, 0, GL_RGBA32F, GL_RGBA, GL_FLOAT, this._img);
                    } else {
                        // TODO: fix type
                        // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, gl.RGBA, gl.FLOAT, null);
                    }
                }
                break;

            case TextureTypes.R11F_G11F_B10F:
                if (width && height) {
                    if (this._img) {
                        gl.texImage2D(
                            GL_TEXTURE_2D,
                            0,
                            GL_R11F_G11F_B10F,
                            width,
                            height,
                            0,
                            GL_RGB,
                            GL_FLOAT,
                            this._img
                        );
                    } else {
                        gl.texImage2D(GL_TEXTURE_2D, 0, GL_R11F_G11F_B10F, width, height, 0, GL_RGB, GL_FLOAT, null);
                    }
                } else {
                    if (this._img) {
                        gl.texImage2D(GL_TEXTURE_2D, 0, GL_R11F_G11F_B10F, GL_RGB, GL_FLOAT, this._img);
                    } else {
                        // TODO: fix type
                        // gl.texImage2D(gl.TEXTURE_2D, 0, gl.R11F_G11F_B10F, gl.RGB, gl.FLOAT, null);
                    }
                }
                break;

            case TextureTypes.R16F:
                if (width && height) {
                    if (this._img) {
                        gl.texImage2D(GL_TEXTURE_2D, 0, GL_R16F, width, height, 0, GL_RED, GL_FLOAT, this._img);
                    } else {
                        gl.texImage2D(GL_TEXTURE_2D, 0, GL_R16F, width, height, 0, GL_RED, GL_FLOAT, null);
                    }
                } else {
                    if (this._img) {
                        gl.texImage2D(gl.TEXTURE_2D, 0, gl.R16F, gl.RED, gl.FLOAT, this._img);
                    } else {
                        // TODO: fix type
                        // gl.texImage2D(gl.TEXTURE_2D, 0, gl.R16F, gl.RED, gl.FLOAT, null);
                    }
                }
                break;

            default:
                console.error('[Texture.constructor] invalid type');
        }

        // TODO: あった方がよい？
        // unbind img
        gl.bindTexture(GL_TEXTURE_2D, null);
    }

    /**
     *
     * @param width
     * @param height
     */
    setSize(width: number, height: number) {
        // this.width = width;
        // this.height = height;
        this.width = Math.floor(width);
        this.height = Math.floor(height);

        // if (this._img === null) {
        //     console.error("[Texture.setSize] invalid img");
        // }

        const gl = this._gpu.gl;
        gl.bindTexture(GL_TEXTURE_2D, this._texture);

        // bind texture data
        switch (this.type) {
            case TextureTypes.RGBA:
                if (this._img) {
                    gl.texImage2D(GL_TEXTURE_2D, 0, GL_RGBA, width, height, 0, GL_RGBA, GL_UNSIGNED_BYTE, this._img);
                } else {
                    gl.texImage2D(GL_TEXTURE_2D, 0, GL_RGBA, width, height, 0, GL_RGBA, GL_UNSIGNED_BYTE, null);
                }
                break;

            case TextureTypes.Depth:
                // 1: use 16bit
                if (this._img) {
                    gl.texImage2D(
                        GL_TEXTURE_2D,
                        0,
                        this.depthPrecision === TextureDepthPrecisionType.High
                            ? GL_DEPTH_COMPONENT32F
                            : GL_DEPTH_COMPONENT16,
                        width,
                        height,
                        0,
                        GL_DEPTH_COMPONENT,
                        this.depthPrecision === TextureDepthPrecisionType.High ? GL_FLOAT : GL_UNSIGNED_SHORT,
                        this._img
                    );
                } else {
                    gl.texImage2D(
                        GL_TEXTURE_2D,
                        0,
                        this.depthPrecision === TextureDepthPrecisionType.High
                            ? GL_DEPTH_COMPONENT32F
                            : GL_DEPTH_COMPONENT16,
                        width,
                        height,
                        0,
                        GL_DEPTH_COMPONENT,
                        this.depthPrecision === TextureDepthPrecisionType.High ? GL_FLOAT : GL_UNSIGNED_SHORT,
                        null
                    );
                }
                // 2: use 32bit
                // gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT32F, width, height, 0, gl.DEPTH_COMPONENT, gl.FLOAT, this._img);
                break;

            case TextureTypes.RGBA16F:
                if (this._img) {
                    gl.texImage2D(GL_TEXTURE_2D, 0, GL_RGBA16F, width, height, 0, GL_RGBA, GL_FLOAT, this._img);
                } else {
                    gl.texImage2D(GL_TEXTURE_2D, 0, GL_RGBA16F, width, height, 0, GL_RGBA, GL_FLOAT, null);
                }
                break;

            case TextureTypes.RGBA32F:
                if (this._img) {
                    gl.texImage2D(GL_TEXTURE_2D, 0, GL_RGBA32F, width, height, 0, GL_RGBA, GL_FLOAT, this._img);
                } else {
                    gl.texImage2D(GL_TEXTURE_2D, 0, GL_RGBA32F, width, height, 0, GL_RGBA, GL_FLOAT, null);
                }
                break;

            case TextureTypes.R11F_G11F_B10F:
                if (this._img) {
                    gl.texImage2D(GL_TEXTURE_2D, 0, GL_R11F_G11F_B10F, width, height, 0, GL_RGB, GL_FLOAT, this._img);
                } else {
                    gl.texImage2D(GL_TEXTURE_2D, 0, GL_R11F_G11F_B10F, width, height, 0, GL_RGB, GL_FLOAT, null);
                }
                break;

            case TextureTypes.R16F:
                if (this._img) {
                    gl.texImage2D(GL_TEXTURE_2D, 0, GL_R16F, width, height, 0, GL_RED, GL_FLOAT, this._img);
                } else {
                    gl.texImage2D(GL_TEXTURE_2D, 0, GL_R16F, width, height, 0, GL_RED, GL_FLOAT, null);
                }
                break;

            default:
                console.error('[Texture.setSize] invalid type');
        }

        gl.bindTexture(GL_TEXTURE_2D, null);
    }

    /**
     *
     * @param width
     * @param height
     * @param data
     */
    update({ width, height, data }: { width: number; height: number; data: ArrayBufferView }) {
        this.width = width;
        this.height = height;

        // if (this._img === null) {
        //     console.error("invalid img");
        // }

        const gl = this._gpu.gl;
        gl.bindTexture(GL_TEXTURE_2D, this._texture);

        // TODO: execute all type
        switch (this.type) {
            // case TextureTypes.RGBA16F:
            //     if (this._img) {
            //         gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, width, height, 0, gl.RGBA, gl.FLOAT, this._img);
            //     } else {
            //         gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, width, height, 0, gl.RGBA, gl.FLOAT, null);
            //     }
            //     break;

            case TextureTypes.RGBA32F:
                gl.texImage2D(GL_TEXTURE_2D, 0, GL_RGBA32F, width, height, 0, GL_RGBA, GL_FLOAT, data);
                break;

            default:
                console.error('[Texture.update] invalid type');
        }

        gl.bindTexture(GL_TEXTURE_2D, null);
    }

    /**
     *
     */
    generate() {
        return new Texture({
            gpu: this._gpu,
            img: this._img,
            type: this.type,
            width: this.width,
            height: this.height,
            mipmap: this.mipmap,
            minFilter: this.minFilter,
            magFilter: this.magFilter,
            wrapS: this.wrapS,
            wrapT: this.wrapT,
            flipY: this.flipY,
        });
    }
}
