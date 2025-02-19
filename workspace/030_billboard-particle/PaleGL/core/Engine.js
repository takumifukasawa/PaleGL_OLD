﻿import {TimeSkipper} from "../utilities/TimeSkipper.js";
import {TimeAccumulator} from "../utilities/TimeAccumulator.js";
import {ActorTypes} from "../constants.js";
import {Stats} from "../utilities/Stats.js";

export class Engine {
    #renderer;
    #fixedUpdateFrameTimer;
    #updateFrameTimer;
    #onBeforeFixedUpdate;
    #onBeforeUpdate;
    #scene;
    #gpu;
    #stats;
    
    get renderer() {
        return this.#renderer;
    }
    
    set onBeforeUpdate(value) {
        this.#onBeforeUpdate = value;
    }
    
    constructor({ gpu, renderer, onBeforeFixedUpdate, onBeforeUpdate }) {
        this.#gpu = gpu;
        this.#renderer = renderer;
        
        this.#stats = new Stats();
        this.#renderer.setStats(this.#stats);

        // TODO: 外からfps変えられるようにしたい
        this.#fixedUpdateFrameTimer = new TimeAccumulator(60, this.fixedUpdate.bind(this));
        this.#updateFrameTimer = new TimeSkipper(60, this.update.bind(this));

        this.#onBeforeFixedUpdate = onBeforeFixedUpdate;
        this.#onBeforeUpdate = onBeforeUpdate;
    }
    
    setScene(scene) {
        this.#scene = scene;
    }
    
    start() {
        const t = performance.now() / 1000;
        this.#fixedUpdateFrameTimer.start(t);
        this.#updateFrameTimer.start(t);
    }
    
    setSize(width, height) {
        const rw = width * this.renderer.pixelRatio;
        const rh = height * this.renderer.pixelRatio;
        const w = Math.floor(rw);
        const h = Math.floor(rh);
        this.#scene.traverse((actor) => actor.setSize(w, h));
        this.#renderer.setSize(w, h, rw, rh);
    }

    fixedUpdate(fixedTime, fixedDeltaTime) {
        if(this.#onBeforeFixedUpdate) {
            this.#onBeforeFixedUpdate({ fixedTime, fixedDeltaTime });
        }
        
        this.#scene.traverse((actor) => actor.fixedUpdate({ gpu: this.#gpu, fixedTime, fixedDeltaTime }));

        // update all actors matrix
        // TODO
        // - scene 側でやった方がよい？
        // - skyboxのupdateTransformが2回走っちゃうので、sceneかカメラに持たせて特別扱いさせたい
        // - やっぱりcomponentシステムにした方が良い気もする
        this.#scene.traverse((actor) => actor.updateTransform());
    }

    update(time, deltaTime) {
        if(this.#onBeforeUpdate) {
            this.#onBeforeUpdate({ time, deltaTime });
        }

        // 本当はあんまりgpu渡したくないけど、渡しちゃったほうがいろいろと楽
        this.#scene.traverse((actor) => {
            actor.update({gpu: this.#gpu, time, deltaTime});
            switch(actor.type) {
                case ActorTypes.Skybox:
                case ActorTypes.Mesh:
                case ActorTypes.SkinnedMesh:
                    actor.beforeRender({ gpu: this.#gpu });
                    break;
                default:
                    break;
            }
        });
        
        this.render();
    }
    
    render() {
        this.#stats.clear();
        this.#renderer.render(this.#scene, this.#scene.mainCamera);
        this.#stats.updateView();
    }
   
    // time [sec]
    run(time) {
        this.#fixedUpdateFrameTimer.exec(time / 1000);
        this.#updateFrameTimer.exec(time / 1000);
    }
}