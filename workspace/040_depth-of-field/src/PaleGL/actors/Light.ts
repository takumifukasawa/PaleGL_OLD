﻿import { Actor } from '@/PaleGL/actors/Actor';
import { ActorTypes, LightType } from '@/PaleGL/constants';
import { Color } from '@/PaleGL/math/Color';
// import {Camera} from "./Camera";
import { RenderTarget } from '@/PaleGL/core/RenderTarget';
import { OrthographicCamera } from './OrthographicCamera';
import { PerspectiveCamera } from './PerspectiveCamera';
import { Material } from '@/PaleGL/materials/Material.ts';

export type LightArgs = {
    intensity: number;
    color: Color;
};

export interface ILight {
    updateUniform(targetMaterial: Material): void;
}

// TODO: interfaceでいいかも
export class Light extends Actor implements ILight {
    intensity: number = 1;
    color: Color = Color.white();
    castShadow: boolean = false; // bool
    shadowCamera: OrthographicCamera | PerspectiveCamera | null = null;
    shadowMap: RenderTarget | null = null; // TODO: shadow camera に持たせたほうが良いような気もする

    hasShadowCamera() {
        return !!this.shadowCamera;
    }

    constructor({ intensity, color }: LightArgs & { lightType: LightType }) {
        super({ type: ActorTypes.Light });
        this.intensity = intensity;
        this.color = color;
    }

    setSize(width: number, height: number) {
        super.setSize(width, height);
    }

    setShadowSize() {
        throw 'should implementation';
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    updateUniform(_targetMaterial: Material) {
        throw 'should implementation';
    }
}
