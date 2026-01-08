import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
const basePath = '/models/';

export function loadModel(fileName, onLoad, onProgress, onError) {
    const url = basePath + fileName;
    loader.load(url, (gltf) => {
        const model = gltf.scene;
        onLoad(model);
    }, onProgress, onError);
}