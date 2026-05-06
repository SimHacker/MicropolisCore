import type { Body } from '../runtime/types.js';
import { MOO_SHOW_VERTICAL_FOV_DEG } from '../camera-defaults.js';

export function perspectiveMatrix(fov: number, aspect: number, near: number, far: number): Float32Array {
    const f = 1.0 / Math.tan(fov * Math.PI / 360);
    const nf = 1 / (near - far);
    return new Float32Array([
        f / aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (far + near) * nf, -1,
        0, 0, 2 * far * near * nf, 0,
    ]);
}

export function lookAtMatrix(
    ex: number, ey: number, ez: number,
    cx: number, cy: number, cz: number,
    ux: number, uy: number, uz: number
): Float32Array {
    let fx = cx - ex, fy = cy - ey, fz = cz - ez;
    let fl = Math.sqrt(fx * fx + fy * fy + fz * fz);
    fx /= fl; fy /= fl; fz /= fl;
    let sx = fy * uz - fz * uy, sy = fz * ux - fx * uz, sz = fx * uy - fy * ux;
    let sl = Math.sqrt(sx * sx + sy * sy + sz * sz);
    sx /= sl; sy /= sl; sz /= sl;
    const uux = sy * fz - sz * fy, uuy = sz * fx - sx * fz, uuz = sx * fy - sy * fx;
    return new Float32Array([
        sx, uux, -fx, 0,
        sy, uuy, -fy, 0,
        sz, uuz, -fz, 0,
        -(sx * ex + sy * ey + sz * ez),
        -(uux * ex + uuy * ey + uuz * ez),
        fx * ex + fy * ey + fz * ez, 1,
    ]);
}

function projectToScreen(
    wx: number, wy: number, wz: number,
    view: Float32Array, proj: Float32Array,
    width: number, height: number
): { x: number; y: number } | null {
    const vx = view[0] * wx + view[4] * wy + view[8] * wz + view[12];
    const vy = view[1] * wx + view[5] * wy + view[9] * wz + view[13];
    const vz = view[2] * wx + view[6] * wy + view[10] * wz + view[14];
    const vw = view[3] * wx + view[7] * wy + view[11] * wz + view[15];
    const px = proj[0] * vx + proj[4] * vy + proj[8] * vz + proj[12] * vw;
    const py = proj[1] * vx + proj[5] * vy + proj[9] * vz + proj[13] * vw;
    const pw = proj[3] * vx + proj[7] * vy + proj[11] * vz + proj[15] * vw;
    if (Math.abs(pw) < 0.001) return null;
    const ndcX = px / pw;
    const ndcY = py / pw;
    return {
        x: (ndcX * 0.5 + 0.5) * width,
        y: (1.0 - (ndcY * 0.5 + 0.5)) * height,
    };
}

export function pickActorAtScreen(
    screenX: number, screenY: number,
    canvasRect: DOMRect,
    canvasWidth: number, canvasHeight: number,
    bodies: Body[],
    cameraTarget: { x: number; y: number; z: number },
    rotYDeg: number, rotX: number, zoom: number,
    selectedActorIndex: number
): number {
    if (bodies.length === 0) return -1;

    const mx = screenX - canvasRect.left;
    const my = screenY - canvasRect.top;
    const dist = zoom / 10;
    const fov = MOO_SHOW_VERTICAL_FOV_DEG;
    const aspect = canvasWidth / canvasHeight;

    const rotYRad = rotYDeg * Math.PI / 180;
    const cosX = Math.cos(rotX * Math.PI / 180);
    const eyeX = Math.sin(rotYRad) * cosX * dist;
    const eyeY = cameraTarget.y + Math.sin(rotX * Math.PI / 180) * dist;
    const eyeZ = Math.cos(rotYRad) * cosX * dist;

    const proj = perspectiveMatrix(fov, aspect, 0.01, 100);
    const view = lookAtMatrix(eyeX, eyeY, eyeZ, cameraTarget.x, cameraTarget.y, cameraTarget.z, 0, 1, 0);

    let bestIdx = -1;
    let bestDist = 60;

    for (let i = 0; i < bodies.length; i++) {
        const b = bodies[i];
        if (!b.skeleton) continue;

        const spinDeg = (b.direction || 0) + (b.spinOffset || 0);
        const bodyDir = spinDeg * Math.PI / 180;

        const spine = b.skeleton.find((bn: any) => bn.name === 'SPINE1') || b.skeleton.find((bn: any) => bn.name === 'PELVIS');
        let wx = b.x, wy = 2.5, wz = b.z;
        if (spine) {
            const cosD = Math.cos(bodyDir);
            const sinD = Math.sin(bodyDir);
            wx = spine.worldPosition.x * cosD - spine.worldPosition.z * sinD + b.x;
            wy = spine.worldPosition.y;
            wz = spine.worldPosition.x * sinD + spine.worldPosition.z * cosD + b.z;
        }

        const sp = projectToScreen(wx, wy, wz, view, proj, canvasWidth, canvasHeight);
        if (!sp) continue;

        const dx = sp.x - mx;
        const dy = sp.y - my;
        const screenDist = Math.sqrt(dx * dx + dy * dy);

        if (screenDist < bestDist) {
            bestDist = screenDist;
            bestIdx = i;
        }
    }

    return bestIdx;
}
