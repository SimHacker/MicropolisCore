import type { TopPhysicsState } from '../runtime/types.js';

const TOP_SPIN_THRESHOLD = 1.0;
const TOP_TILT_SCALE = 0.05;
const TOP_MAX_TILT = 1.0;
const TOP_PRECESSION_RATE = 0.04;
const TOP_NUTATION_FREQ = 4.5;
const TOP_NUTATION_SCALE = 0.3;
const TOP_DRIFT_FORCE = 0.0008;
const TOP_GRAVITY = 0.003;
const TOP_DRIFT_FRICTION = 0.97;
const TOP_TILT_DECAY = 0.95;
const TOP_SETTLE_RATE = 0.10;

export { TOP_MAX_TILT };

export function tickTopPhysics(t: TopPhysicsState, rotationVelocity: number): void {
    const spinSpeed = Math.abs(rotationVelocity);

    if (spinSpeed > TOP_SPIN_THRESHOLD) {
        if (!t.active) {
            const launchAngle = Math.random() * Math.PI * 2;
            t.driftVX += Math.sin(launchAngle) * spinSpeed * 0.015;
            t.driftVZ += Math.cos(launchAngle) * spinSpeed * 0.015;
            t.nutationPhase = Math.random() * Math.PI * 2;
        }
        t.active = true;
        t.tiltTarget = Math.min(spinSpeed * TOP_TILT_SCALE, TOP_MAX_TILT);
    } else if (t.active) {
        t.tiltTarget *= TOP_TILT_DECAY;
        if (t.tiltTarget < 0.005 && Math.abs(t.driftX) < 0.01 && Math.abs(t.driftZ) < 0.01) {
            t.active = false;
            t.tilt = 0;
            t.driftX = 0; t.driftZ = 0;
            t.driftVX = 0; t.driftVZ = 0;
            t.nutationAmp = 0;
            return;
        }
    }

    if (!t.active) return;

    t.tilt += (t.tiltTarget - t.tilt) * TOP_SETTLE_RATE;
    t.precessionAngle += spinSpeed * TOP_PRECESSION_RATE;

    t.nutationPhase += TOP_NUTATION_FREQ * 0.05;
    t.nutationAmp += (t.tilt * TOP_NUTATION_SCALE - t.nutationAmp) * 0.1;

    const tiltDirX = Math.sin(t.precessionAngle);
    const tiltDirZ = Math.cos(t.precessionAngle);
    t.driftVX += tiltDirX * t.tilt * TOP_DRIFT_FORCE;
    t.driftVZ += tiltDirZ * t.tilt * TOP_DRIFT_FORCE;

    const dist = Math.sqrt(t.driftX * t.driftX + t.driftZ * t.driftZ);
    if (dist > 0.01) {
        const orbitalStrength = spinSpeed * 0.0004;
        const spinSign = rotationVelocity > 0 ? 1 : -1;
        t.driftVX += (-t.driftZ / dist) * orbitalStrength * spinSign;
        t.driftVZ += (t.driftX / dist) * orbitalStrength * spinSign;
    }

    const jitter = t.tilt * 0.0003;
    t.driftVX += (Math.random() - 0.5) * jitter;
    t.driftVZ += (Math.random() - 0.5) * jitter;

    const gravStrength = TOP_GRAVITY * (1 + dist * 0.3);
    t.driftVX -= t.driftX * gravStrength;
    t.driftVZ -= t.driftZ * gravStrength;

    t.driftVX *= TOP_DRIFT_FRICTION;
    t.driftVZ *= TOP_DRIFT_FRICTION;
    t.driftX += t.driftVX;
    t.driftZ += t.driftVZ;
}

export function applyTopTransform(
    v: { x: number; y: number; z: number },
    t: TopPhysicsState,
    pivotY: number
): { x: number; y: number; z: number } {
    if (!t.active || !v) return v;

    const nutX = t.nutationAmp * Math.sin(t.nutationPhase);
    const nutZ = t.nutationAmp * Math.cos(t.nutationPhase * 0.7);
    const tiltX = t.tilt * Math.sin(t.precessionAngle) + nutX;
    const tiltZ = t.tilt * Math.cos(t.precessionAngle) + nutZ;

    const relY = v.y - pivotY;
    const cosZ = Math.cos(tiltZ), sinZ = Math.sin(tiltZ);
    const y1 = relY * cosZ - v.x * sinZ;
    const x1 = relY * sinZ + v.x * cosZ;

    const cosX = Math.cos(tiltX), sinX = Math.sin(tiltX);
    const y2 = y1 * cosX - v.z * sinX;
    const z2 = y1 * sinX + v.z * cosX;

    return { x: x1 + t.driftX, y: y2 + pivotY, z: z2 + t.driftZ };
}

export function applyTopRotation(
    v: { x: number; y: number; z: number },
    t: TopPhysicsState,
): { x: number; y: number; z: number } {
    if (!t.active || !v) return v;

    const nutX = t.nutationAmp * Math.sin(t.nutationPhase);
    const nutZ = t.nutationAmp * Math.cos(t.nutationPhase * 0.7);
    const tiltX = t.tilt * Math.sin(t.precessionAngle) + nutX;
    const tiltZ = t.tilt * Math.cos(t.precessionAngle) + nutZ;

    const cosZ = Math.cos(tiltZ);
    const sinZ = Math.sin(tiltZ);
    const y1 = v.y * cosZ - v.x * sinZ;
    const x1 = v.y * sinZ + v.x * cosZ;

    const cosX = Math.cos(tiltX);
    const sinX = Math.sin(tiltX);
    const y2 = y1 * cosX - v.z * sinX;
    const z2 = y1 * sinX + v.z * cosX;

    return { x: x1, y: y2, z: z2 };
}

export interface PreRotationParams {
    active: boolean;
    pivotY: number;
    transX: number;
    transZ: number;
    rotation: readonly [number, number, number, number, number, number, number, number, number];
}

const IDENTITY_ROT: PreRotationParams['rotation'] = [1, 0, 0, 0, 1, 0, 0, 0, 1];

export function topPhysicsToPreRotation(
    t: TopPhysicsState,
    pivotY: number,
): PreRotationParams {
    if (!t.active) {
        return { active: false, pivotY: 0, transX: 0, transZ: 0, rotation: IDENTITY_ROT };
    }
    const nutX = t.nutationAmp * Math.sin(t.nutationPhase);
    const nutZ = t.nutationAmp * Math.cos(t.nutationPhase * 0.7);
    const angleX = t.tilt * Math.sin(t.precessionAngle) + nutX;
    const angleZ = t.tilt * Math.cos(t.precessionAngle) + nutZ;

    const cosZ = Math.cos(angleZ);
    const sinZ = Math.sin(angleZ);
    const cosX = Math.cos(angleX);
    const sinX = Math.sin(angleX);

    // Combined rotation: first rotate around Z by tiltZ, then around X by tiltX.
    // R = Rx(tiltX) * Rz(tiltZ), applied to column vector (x, relY, z).
    // Row-major 3x3:
    //   [ sinZ,       cosZ,       0     ]
    //   [ cosX*sinZ, -cosX*cosZ,  sinX  ]   (note: axes are permuted because
    //   [-sinX*sinZ,  sinX*cosZ,  cosX  ]    the tilt operates on (relY, x) then (y1, z))
    // This matches the scalar math in applyTopTransform:
    //   x1 = relY*sinZ + x*cosZ  (wait — that's not standard Rz)
    // Actually the scalar code does:
    //   y1 = relY*cosZ - x*sinZ; x1 = relY*sinZ + x*cosZ  (rotation in the relY-x plane)
    //   y2 = y1*cosX - z*sinX;   z2 = y1*sinX + z*cosX    (rotation in the y1-z plane)
    // Matrix form for (x, relY, z) -> (x1, y2, z2):
    //   x1 = cosZ * x  + sinZ * relY + 0 * z
    //   y2 = -sinZ*cosX * x + cosZ*cosX * relY + -sinX * z
    //   z2 = sinZ*sinX * x  + -cosZ*sinX * relY + cosX * z
    //   wait that's wrong too, let me just derive it directly.
    //
    // From the scalar code:
    //   y1 = relY * cosZ - x * sinZ
    //   x1 = relY * sinZ + x * cosZ
    //   y2 = y1 * cosX - z * sinX
    //   z2 = y1 * sinX + z * cosX
    //
    // Substituting y1:
    //   x1 = cosZ * x + sinZ * relY
    //   y2 = cosX * (cosZ * relY - sinZ * x) - sinX * z
    //      = -sinZ*cosX * x + cosZ*cosX * relY - sinX * z
    //   z2 = sinX * (cosZ * relY - sinZ * x) + cosX * z
    //      = -sinZ*sinX * x + cosZ*sinX * relY + cosX * z
    //
    // So the 3x3 matrix for (x, relY, z) -> (x1, y2, z2):
    const r: PreRotationParams['rotation'] = [
        cosZ,           sinZ,            0,
        -sinZ * cosX,   cosZ * cosX,    -sinX,
        -sinZ * sinX,   cosZ * sinX,     cosX,
    ];

    return {
        active: true,
        pivotY,
        transX: t.driftX,
        transZ: t.driftZ,
        rotation: r,
    };
}
