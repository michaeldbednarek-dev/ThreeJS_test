import { cubeBody, getCanJump, setCanJump } from './physics.js';

export const keysPressed = new Set();

export function updateCubePosition() {
    const moveSpeed = 0.2;
    if (keysPressed.has("a")) cubeBody.position.x -= moveSpeed; // Move left
    if (keysPressed.has("d")) cubeBody.position.x += moveSpeed; // Move right
    if (keysPressed.has("w")) cubeBody.position.z -= moveSpeed; // Move forward
    if (keysPressed.has("s")) cubeBody.position.z += moveSpeed; // Move backward
}

export function jump() {
    if (getCanJump()) {
        const jumpForce = 10;
        cubeBody.velocity.y = jumpForce;
        setCanJump(false);
    }
}