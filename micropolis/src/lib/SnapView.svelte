<script lang="ts">
    import { onMount } from 'svelte';

    let snapCanvas: HTMLCanvasElement;
    let snapContext: CanvasRenderingContext2D;
    //let snapViewLeft = -1180;
    //let snapViewTop = 50;
    //let snapViewWidth = 1200;
    //let snapViewHeight = 1000;
    let snapViewLeft = $state(-1180);
    let snapViewTop = $state(50);
    let snapViewWidth = $state(1200);
    let snapViewHeight = $state(800);
    let margin = $state(24);
    let snapViewVisible = $state(true);
    let snapWorld: any;

    // JavaScript for handling dragging and resizing
    let offsetX = 0;
    let offsetY = 0;
    let dragging = false;
    let resizing = false;
    let resizeCorner: string | null = null;
    let downX = 0;
    let downY = 0;
    let startX = 0;
    let startY = 0;
    let startWidth = 0;
    let startHeight = 0;

    function handleDragStart(event: MouseEvent) {
        const outerFrame = snapCanvas.parentElement!.parentElement!;
        const rect = outerFrame.getBoundingClientRect();

        // Check if the mouse is within the margin area
        const withinLeftMargin = event.clientX >= rect.left && event.clientX <= rect.left + margin;
        const withinRightMargin = event.clientX >= rect.right - margin && event.clientX <= rect.right;
        const withinTopMargin = event.clientY >= rect.top && event.clientY <= rect.top + margin;
        const withinBottomMargin = event.clientY >= rect.bottom - margin && event.clientY <= rect.bottom;

        const withinMargin = withinLeftMargin || withinRightMargin || withinTopMargin || withinBottomMargin;

        // Check if the mouse is within the corner area for resizing
        const withinTopLeftCorner = withinLeftMargin && withinTopMargin;
        const withinTopRightCorner = withinRightMargin && withinTopMargin;
        const withinBottomLeftCorner = withinLeftMargin && withinBottomMargin;
        const withinBottomRightCorner = withinRightMargin && withinBottomMargin;

        downX = event.clientX;
        downY = event.clientY;
        startX = snapViewLeft;
        startY = snapViewTop;
        startWidth = snapViewWidth;
        startHeight = snapViewHeight;

        if (withinTopLeftCorner) {
            resizeCorner = "top-left";
            resizing = true;
        } else if (withinTopRightCorner) {
            resizeCorner = "top-right";
            resizing = true;
        } else if (withinBottomLeftCorner) {
            resizeCorner = "bottom-left";
            resizing = true;
        } else if (withinBottomRightCorner) {
            resizeCorner = "bottom-right";
            resizing = true;
        } else if (withinMargin) {
            dragging = true;
        } else {
            // Let the event bubble if not within the margin
            event.stopPropagation();
        }

        if (dragging || resizing) {
            window.addEventListener('mousemove', handleDraggingOrResizing);
            window.addEventListener('mouseup', handleDragEnd);
        }
    }

    function handleDraggingOrResizing(event: MouseEvent) {
        const outerFrame = snapCanvas.parentElement!.parentElement!;
        const dx = event.clientX - downX;
        const dy = event.clientY - downY;

        if (dragging) {
            snapViewLeft = startX + dx;
            snapViewTop = startY + dy;
        } else if (resizing) {
            const rect = outerFrame.getBoundingClientRect();

            if (resizeCorner === "top-left") {
                snapViewLeft = startX + dx;
                snapViewTop = startY + dy;
                snapViewWidth = startWidth - dx;
                snapViewHeight = startHeight - dy;
            } else if (resizeCorner === "top-right") {
                snapViewWidth = startWidth + dx;
                snapViewTop = startY + dy;
                snapViewHeight = startHeight - dy;
            } else if (resizeCorner === "bottom-left") {
                snapViewLeft = startX + dx;
                snapViewWidth = startWidth - dx;
                snapViewHeight = startHeight + dy;
            } else if (resizeCorner === "bottom-right") {
                snapViewWidth = startWidth + dx;
                snapViewHeight = startHeight + dy;
            }

            //snapWorld.initRetina();
        }
    }

    function handleDragEnd() {
        dragging = false;
        resizing = false;
        resizeCorner = null;
        window.removeEventListener('mousemove', handleDraggingOrResizing);
        window.removeEventListener('mouseup', handleDragEnd);
    }

    onMount(() => {
        snapContext = snapCanvas.getContext('2d');

        var FPS = 67,
            lastTime = 0,

        loop = (timestamp) => {
            requestAnimationFrame(loop);
            if (timestamp - lastTime < 1000 / FPS) {
                return;
            }
            snapWorld.doOneCycle();
            lastTime = Math.max(
                lastTime + 1000 / FPS,
                timestamp - 1000 / FPS
            );
        };

        //if ('serviceWorker' in navigator) {
        //    navigator.serviceWorker.register('https://snap.berkeley.edu/snap/src/sw.js');
        //}
        snapWorld = new WorldMorph(snapCanvas, false);
        new IDE_Morph().openIn(snapWorld);
        requestAnimationFrame(loop);

    });

</script>

<div
    style="left: {snapViewLeft}px; top: {snapViewTop}px; width: {snapViewWidth}px; height: {snapViewHeight}px; display: {snapViewVisible ? 'block' : 'none'};"
    class="snap-frame-outer"
    onmousedown={handleDragStart}
>
    <div
        class="snap-frame-inner"
    >
        <canvas
            id="snap-canvas"
            class="snap-canvas"
            style="left: 0px; top: 0px; width: {snapViewWidth - 2 * margin}px; height: {snapViewHeight - 2 * margin}px; display: {snapViewVisible ? 'block' : 'none'};"
            tabindex="1"
            bind:this={snapCanvas}
        ></canvas>
    </div>
</div>


<style>

  .snap-frame-outer {
    display: block;
    position: absolute;
    padding: 20px; /* Adjust to create space for dragging */
    background-color: lightgray;
    border: 2px solid black;
    box-sizing: border-box; /* Ensures padding and border are included in the width and height */
    z-index: 10;
  }

  .snap-frame-inner {
    display: block;
    position: relative; /* Ensures it fills the outer frame properly */
    background-color: darkgray;
    border: 2px solid black;
    width: 100%;
    height: 100%;
    box-sizing: border-box; /* Ensures padding and border are included in the width and height */
  }

  .snap-canvas {
    display: block;
    position: relative;
    border: none; /* Canvas will completely cover the inner frame, so no border needed */
    z-index: 11;
    box-sizing: border-box; /* Ensures padding and border are included in the width and height */
    width: 100%;
    height: 100%;
  }

</style>
