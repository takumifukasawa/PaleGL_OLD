﻿import { Texture } from '@/PaleGL/core/Texture';
import { Framebuffer } from '@/PaleGL/core/Framebuffer';
import {
    GL_DEPTH_ATTACHMENT,
    GL_FRAMEBUFFER,
    GL_TEXTURE_2D,
    GLColorAttachment,
    TextureFilterTypes,
    TextureTypes
} from '@/PaleGL/constants';
import { AbstractRenderTarget } from '@/PaleGL/core/AbstractRenderTarget';
import { GPU } from '@/PaleGL/core/GPU';

// ---------------------------------------------------------------------
// TODO: B,Cはまとめられる気がする
// TODO: shading model は RGB10A2 で rgb: normal + a: shading model でいい気がする
// [GBufferA: RGBA8] rgb: base color
// [GBufferB: RGBA8] rgb: normal, a: shading model
// [GBufferC: RGBA8] r: metallic, g: roughness
// [GBufferD: R11G11B10] rgb: emissive color
// [Depth] depth prepass depth
// ---------------------------------------------------------------------

// TODO: depth texture を resize しなくていいようにしたい。なぜなら depthprepassでリサイズしてるから
export class GBufferRenderTargets extends AbstractRenderTarget {
    gpu: GPU;
    name: string;
    width: number;
    height: number;
    _framebuffer: Framebuffer;
    _gBufferTextures: Texture[] = [];
    _gBufferATexture: Texture;
    _gBufferBTexture: Texture;
    _gBufferCTexture: Texture;
    _gBufferDTexture: Texture;
    _depthTexture: Texture | null = null;

    // get textures() {
    //     return this._gBufferTextures;
    // }

    $getGBufferATexture() {
        return this._gBufferATexture;
    }

    $getGBufferBTexture() {
        return this._gBufferBTexture;
    }

    $getGBufferCTexture() {
        return this._gBufferCTexture;
    }
    
    $getGBufferDTexture() {
        return this._gBufferDTexture;
    }

    $getDepthTexture() {
        return this._depthTexture;
    }

    $getFramebuffer() {
        return this._framebuffer;
    }

    get read() {
        return this;
    }

    get write() {
        return this;
    }

    constructor({ gpu, name, width = 1, height = 1 }: { gpu: GPU; name: string; width: number; height: number }) {
        super();

        this.gpu = gpu;

        const minFilter = TextureFilterTypes.Linear;
        const magFilter = TextureFilterTypes.Linear;

        const gl = gpu.gl;

        this.name = name;

        this.width = width;
        this.height = height;

        this._framebuffer = new Framebuffer({ gpu });
        this._framebuffer.bind();

        //
        // 1: GBufferA
        //
        const gBufferAAttachment = GLColorAttachment.COLOR_ATTACHMENT0;
        this._gBufferATexture = new Texture({
            gpu,
            width: this.width,
            height: this.height,
            mipmap: false,
            type: TextureTypes.RGBA,
            minFilter,
            magFilter,
        });
        gl.framebufferTexture2D(GL_FRAMEBUFFER, gBufferAAttachment, GL_TEXTURE_2D, this._gBufferATexture.glObject, 0);
        this._gBufferTextures.push(this._gBufferATexture);
        this._framebuffer.registerDrawBuffer(gBufferAAttachment as GLColorAttachment);

        //
        // 2: GBufferB
        //
        const gBufferBAttachment = GLColorAttachment.COLOR_ATTACHMENT1;
        this._gBufferBTexture = new Texture({
            gpu,
            width: this.width,
            height: this.height,
            mipmap: false,
            type: TextureTypes.RGBA,
            minFilter,
            magFilter,
        });
        gl.framebufferTexture2D(GL_FRAMEBUFFER, gBufferBAttachment, GL_TEXTURE_2D, this._gBufferBTexture.glObject, 0);
        this._framebuffer.registerDrawBuffer(gBufferBAttachment as GLColorAttachment);
        this._gBufferTextures.push(this._gBufferBTexture);

        //
        // 3: GBufferC
        //
        const gBufferCAttachment = GLColorAttachment.COLOR_ATTACHMENT2;
        this._gBufferCTexture = new Texture({
            gpu,
            width: this.width,
            height: this.height,
            mipmap: false,
            type: TextureTypes.RGBA,
            minFilter,
            magFilter,
        });
        gl.framebufferTexture2D(GL_FRAMEBUFFER, gBufferCAttachment, GL_TEXTURE_2D, this._gBufferCTexture.glObject, 0);
        this._framebuffer.registerDrawBuffer(gBufferCAttachment as GLColorAttachment);
        this._gBufferTextures.push(this._gBufferCTexture);

        //
        // 4: GBufferD
        //
        const gBufferDAttachment = GLColorAttachment.COLOR_ATTACHMENT3;
        this._gBufferDTexture = new Texture({
            gpu,
            width: this.width,
            height: this.height,
            mipmap: false,
            type: TextureTypes.R11F_G11F_B10F,
            minFilter,
            magFilter,
        });
        gl.framebufferTexture2D(GL_FRAMEBUFFER, gBufferDAttachment, GL_TEXTURE_2D, this._gBufferDTexture.glObject, 0);
        this._framebuffer.registerDrawBuffer(gBufferDAttachment as GLColorAttachment);
        this._gBufferTextures.push(this._gBufferDTexture);

        // 3: depth
        // this._depthTexture = new Texture({
        //     gpu,
        //     width: this.width,
        //     height: this.height,
        //     mipmap: false,
        //     type: TextureTypes.Depth,
        //     // 一旦linear固定
        //     minFilter,
        //     magFilter,
        // });
        // // depth as texture
        // gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this._depthTexture.glObject, 0);

        // unbind
        gl.bindTexture(GL_TEXTURE_2D, null);
        this._framebuffer.unbind();
    }

    setSize(width: number, height: number) {
        this.width = width;
        this.height = height;
        this._gBufferTextures.forEach((texture) => texture.setSize(this.width, this.height));
        if (this._depthTexture) {
            this._depthTexture.setSize(this.width, this.height);
        }
    }

    // TODO: render target と共通化できる
    setDepthTexture(depthTexture: Texture) {
        const gl = this.gpu.gl;
        this._depthTexture = depthTexture;
        this._framebuffer.bind();
        // depth as texture
        gl.framebufferTexture2D(GL_FRAMEBUFFER, GL_DEPTH_ATTACHMENT, GL_TEXTURE_2D, this._depthTexture.glObject, 0);
        this._framebuffer.unbind();
    }
}
