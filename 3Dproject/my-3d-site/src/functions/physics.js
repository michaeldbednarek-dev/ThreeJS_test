import * as CANNON from 'cannon-es';

export const world = new CANNON.World();
world.gravity.set(0, -9.8, 0);

export const groundShape = new CANNON.Plane();
export const groundBody = new CANNON.Body({ mass: 0, shape: groundShape });
groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
world.addBody(groundBody);

export const cubeShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
export const cubeBody = new CANNON.Body({ mass: 1, shape: cubeShape });
cubeBody.position.set(0, 1, 0);
world.addBody(cubeBody);

let canJump = true;

export function getCanJump() {
    return canJump;
}

export function setCanJump(value) {
    canJump = value;
}

cubeBody.addEventListener("collide", (event) => {
    if (event.body === groundBody) {
        setCanJump(true);
    }
});