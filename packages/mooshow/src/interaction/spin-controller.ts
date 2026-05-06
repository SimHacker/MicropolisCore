const FRICTION = 0.993;
const DRAG_THRESHOLD = 3;
const VELOCITY_SMOOTHING = 0.3;

export class SpinController {
    rotationVelocity = 0;
    isDragging = false;
    private _dragStartX = 0;
    private _dragStartY = 0;
    private _lastDragX = 0;
    private _lastDragY = 0;
    private _lastDragTime = 0;
    private _dragMoved = false;
    private _dragButton = 0;
    private _smoothedVelocity = 0;

    rotY = 0;
    rotX = 0;
    zoom = 140;

    startDrag(clientX: number, clientY: number, button: number, shiftKey: boolean): void {
        this.isDragging = true;
        this._dragMoved = false;
        this._dragButton = (button === 0 && shiftKey) ? 2 : button;
        this._dragStartX = clientX;
        this._dragStartY = clientY;
        this._lastDragX = clientX;
        this._lastDragY = clientY;
        this._lastDragTime = performance.now();
        this._smoothedVelocity = 0;
    }

    drag(clientX: number, clientY: number): {
        spinDelta: number;
        zoomDelta: number;
        tiltDelta: number;
        isOrbit: boolean;
    } {
        const dx = clientX - this._lastDragX;
        const dy = clientY - this._lastDragY;
        const now = performance.now();
        const dt = Math.max(now - this._lastDragTime, 1);

        const totalDx = clientX - this._dragStartX;
        const totalDy = clientY - this._dragStartY;
        if (Math.abs(totalDx) > DRAG_THRESHOLD || Math.abs(totalDy) > DRAG_THRESHOLD) {
            this._dragMoved = true;
        }

        let spinDelta = 0;
        let zoomDelta = 0;
        let tiltDelta = 0;

        if (this._dragButton === 0) {
            spinDelta = -dx * 0.5;
            zoomDelta = dy * 0.25;
        }

        if (this._dragButton === 2) {
            spinDelta = -dx * 0.5;
            tiltDelta = dy * 0.3;
        }

        const instantVelocity = this._dragButton === 0 ? (-dx * 0.3) / (dt / 16.67) : 0;
        this._smoothedVelocity = this._smoothedVelocity * (1 - VELOCITY_SMOOTHING) +
            instantVelocity * VELOCITY_SMOOTHING;

        this._lastDragX = clientX;
        this._lastDragY = clientY;
        this._lastDragTime = now;

        return { spinDelta, zoomDelta, tiltDelta, isOrbit: this._dragButton === 2 };
    }

    endDrag(): void {
        if (!this.isDragging) return;
        this.isDragging = false;

        if (this._dragButton === 0 && this._dragMoved) {
            this.rotationVelocity = this._smoothedVelocity;
        }
    }

    applyWheel(deltaY: number, deltaMode: number, ctrlKey: boolean): void {
        let delta: number;
        if (ctrlKey) {
            delta = -deltaY * 0.3;
        } else if (deltaMode === 1) {
            delta = -deltaY * 3;
        } else {
            delta = -deltaY * 0.15;
        }
        this.zoom = Math.max(15, Math.min(400, this.zoom + delta));
    }

    tickMomentum(): boolean {
        if (this.isDragging || Math.abs(this.rotationVelocity) <= 0.001) return false;
        this.rotationVelocity *= FRICTION;
        return true;
    }

    get dragMoved(): boolean {
        return this._dragMoved;
    }
}
