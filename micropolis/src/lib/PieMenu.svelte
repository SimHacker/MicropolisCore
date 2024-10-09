<script>

/*

    // https://imfeld.dev/writing/svelte_domless_components
    
    const directionNames: Record<string, number> = {
        'E': 0,
        'East': 0,
        'Right': 0,
        'NE': 45,
        'NorthEast': 45,
        'N': 90,
        'North': 90,
        'Up': 90,
        'NW': 135,
        'NorthWest': 135,
        'W': 180,
        'West': 180,
        'Left': 180,
        'SW': 225,
        'SouthWest': 225,
        'S': 270,
        'South': 270,
        'Down': 270,
        'SE': 315,
        'SouthEast': 315
    };

    interface PieOptions {

        // Default Options
        initialDirection: string | number;
        clockwise: boolean;
        turn?: number;
        itemLayout: string;
        itemTracking: string;
        selectCursorItem: boolean;
        timerDelay: number | null;
        inactiveDistance: number;
        outerDistance: number;
        itemDistanceMin: number;
        itemDistanceSpacing: number;
        itemGap: number;
        itemShear: number;
        itemOffsetX: number;
        itemOffsetY: number;
        rotateItems: boolean;
        itemRotation: number;
        stickyPin: boolean;
        draggyPin: boolean;
        dragThreshold: number;
        pieSliced: number;
        nextPieId?: string;
        disabled: boolean;

    };

    interface PieMenu {

        pieId?: string;
        label?: string;
        description?: string;
        slices?: (PieSlice | null)[];
        selectedSlice?: PieSlice;

        // Inheritable Options
        initialDirection?: string | number;
        clockwise?: boolean;
        turn?: number;
        itemLayout?: string;
        itemTracking?: string;
        selectCursorItem?: boolean;
        timerDelay?: number | null;
        inactiveDistance?: number;
        outerDistance?: number;
        itemDistanceMin?: number;
        itemDistanceSpacing?: number;
        itemGap?: number;
        itemShear?: number;
        itemOffsetX?: number;
        itemOffsetY?: number;
        rotateItems?: boolean;
        itemRotation?: number;
        stickyPin?: boolean;
        draggyPin?: boolean;
        dragThreshold?: number;
        pieSliced?: number;
        nextPieId?: string;
        disabled?: boolean;

    };

    interface PieSlice {

        sliceId?: string | null;
        label?: string | null;
        description?: string | null;
        items?: (PieItem | null)[];
        dir?: number;
        dx?: number;
        dy?: number;
        selectedItem?: PieItem;

        // Inheritable Options
        sliceDirection?: number;
        itemLayout?: string;
        itemTracking?: string;
        selectCursorItem?: boolean;
        timerDelay?: number | null;
        inactiveDistance?: number;
        outerDistance?: number;
        itemDistanceMin?: number;
        itemDistanceSpacing?: number;
        itemGap?: number;
        itemShear?: number;
        itemOffsetX?: number;
        itemOffsetY?: number;
        rotateItems?: boolean;
        itemRotation?: number;
        nextPieId?: string;

    };

    interface PieItem {

        itemId?: string | null;
        label?: string | null;
        description?: string;
        transform?: string;
        pinX?: number;
        pinY?: number;
        width?: number;
        height?: number;
        x?: number;
        y?: number;

        // Inheritable Options
        initialDirection?: string | number;
        clockwise?: boolean;
        itemLayout?: string;
        itemTracking?: string;
        selectCursorItem?: boolean;
        timerDelay?: number | null;
        inactiveDistance?: number;
        outerDistance?: number;
        itemDistanceMin?: number;
        itemDistanceSpacing?: number;
        itemGap?: number;
        itemShear?: number;
        itemOffsetX?: number;
        itemOffsetY?: number;
        rotateItems?: boolean;
        itemRotation?: number;
        nextPieId?: string;
        disabled?: boolean;

    };
    


    // Handlers for pies, pie slices and pie items:
    //
    // piedown(event, pie) - start event (low level mouse/touch/pen tracking)
    // piemove(event, pie) - move event (low level mouse/touch/pen tracking)
    // pieup(event, pie) - end event (low level mouse/touch/pen tracking)
    // piestart(event, pie) - pie starts tracking (popped up, either top level or sub menu)
    // piestop(event, pie) - pie ends tracking (popped down, either by select or cancel)
    // piepin(event, pie) - pie pinned (clicked up, stays up while button not pressed)
    // pieunpin(event, pie) - pie unpinned (clicked down after being pinned)
    // piecancel(event, pie) - pie canceled (clicked down without selecting, click in center inactive, press escape)
    // pieupdate(event, pie) - pie real time update (between piedown and pieup)
    // pieselect(event, pie) - pie menu selected (selected the menu itself, a slice or an item, but not cancel)
    // pieslicestart(event, pie, slice) - entered a slice (or slice=null for the inactive center region)
    // pieslicestop(event, pie, slice) - left a slice (or slice=null for the inactive center region)
    // piesliceupdate(event, pie, slice) - pie slice real time update (when in a slice)
    // piesliceselect(event, pie, slice) - pie slice selected (selected the current slice or current item, but not cancel)
    // pieitemstart(event, pie, slice, item) - entered an item (or item=null for no item)
    // pieitemstop(event, pie, slice, item) - left an item (or item=null for no item)
    // pieitemupdate(event, pie, slice, item) - pie item real time update (when in an item)
    // pieitemselect(event, pie, slice, item) - pie item selecte (selected the current item, but not cancel)
    // pietimer(event, pie, slice, item) - pie timer tick (event is null, item and slice may be null)

    type EventPieHandler = (event: MouseEvent, pie: PieMenu) => void;
    type EventPieSliceHandler = (event: MouseEvent, pie: PieMenu, slice: PieSlice) => void;
    type EventPieSliceItemHandler = (event: MouseEvent, pie: PieMenu, slice: PieSlice, item: PieItem) => void;

    let {
        options?: PieOptions,
        pieMenus?: Record<string, PieMenu>,
        onpiedown?: EventPieHandler,
        onpiemove?: EventPieHandler,
        onpieup?: EventPieHandler,
        onpiestart?: EventPieHandler,
        onpiestop?: EventPieHandler,
        onpiepin?: EventPieHandler,
        onpieunpin?: EventPieHandler,
        onpiecancel?: EventPieHandler,
        onpieupdate?: EventPieHandler,
        onpieselect?: EventPieHandler,
        onpieselectdisabled?: EventPieHandler,
        onpieslicestart?: EventPieSliceHandler,
        onpieslicestop?: EventPieSliceHandler,
        onpiesliceupdate?: EventPieSliceHandler,
        onpiesliceselect?: EventPieSliceHandler,
        onpiesliceselectdisabled?: EventPieSliceHandler,
        onpieitemstart?: EventPieSliceItemHandler,
        onpieitemstop?: EventPieSliceItemHandler,
        onpieitemupdate?: EventPieSliceItemHandler,
        onpieitemselect?: EventPieSliceItemHandler,
        onpieitemselectdisabled?: EventPieSliceItemHandler,
        onpietimer?: EventPieSliceItemHandler,
    } = $props;

    let defaultOptions: Record<string, any> = {

        defaultPie: "main",
        currentPie: undefined,
        pieMenus: {},
        initialDirection: 'North',
        clockwise: true,
        itemLayout: "equalDistance",
        itemTracking: "target",
        selectCursorItem: true,
        timerDelay: 100,
        inactiveDistance: 10,
        outerDistance: 300,
        itemDistanceMin: 120;
        itemDistanceSpacing: 80,
        itemGap: 80,
        itemShear: 30,
        itemOffsetX: 0,
        itemOffsetY: 0,
        rotateItems: false,
        itemRotation: 0,
        stickyPin: false,
        draggyPin: false,
        dragThreshold: 5,
        pieSliced: 1,
        nextPieId: undefined,
        disabled: false,

    };
    
    let pieMenus: Record<string, PieMenu> = {};
    let direction: number = $state(0);
    let distance: number = $state(0);
    let sliceIndex?: number = $state(undefined);
    let itemIndex?: number = $state(undefined);
    let rootPie?: PieMenu = undefined;
    let superPies: PieMenu[] = $state(PieMenu[]);
    let currentPie?: PieMenu = $state(undefined);
    let parentPie?: PieMenu = $state(undefined);
    let finalPie?: PieMenu = $state(undefined);
    let currentSlice?: PieSlice = $state(undefined);
    let lastSlice?: PieSlice = $state(undefined);
    let finalSlice?: PieSlice = $state(undefined);
    let currentItem?: PieItem = $state(undefined);
    let lastItem?: PieItem = $state(undefined);
    let finalItem?: PieItem = $state(undefined);
    let cursorItem?: pieItem = $state(undefined);
    let pinned: boolean = $state(false);
    let mouseDown: boolean = $state(false);
    let poppedUp: boolean = $state(false);
    let centerX: number = $state(0);
    let centerY: number = $state(0);
    let currentX: number = $state(0);
    let currentY: number = $state(0);
    let deltaX: number = $state(0);
    let deltaY: number = $state(0);
    let dragStartX: number = $state(0);
    let dragStartY: number = $state(0);
    let dragOffsetX: number = $state(0);
    let dragOffsetY: number = $state(0);
    let dragging: boolean = $state(false);
    let timer?: number = $state(undefined);

    // Takes any number of arguments, and returns the first non-undefined one, else returns undefined.
    function inherit(...args: unknown[]): unknown | undefined {
        for (let i = 0; i < args.length; i++) {
            if (args[i] !== undefined) {
                return args[i];
            }
        }
        return undefined;
    }

    function reset() {

        direction = 0;
        distance = 0;
        sliceIndex = undefined;
        itemIndex = undefined;
        rootPie = pieMenus["root"];
        currentPie = undefined;
        parentPie = undefined;
        finalPie = undefined;
        currentSlice = undefined;
        lastSlice = undefined;
        finalSlice = undefined;
        curentItem = undefined;
        lastItem = undefined;
        finalItem = undefined;
        pinned = false;
        mouseDown = false;
        centerX = 0;
        centerY = 0;
        currentX = 0;
        currentY = 0;
        deltaX = 0;
        deltaY = 0;
        dragStartX = 0;
        dragStartY = 0;
        dragOffsetX = 0;
        dragOffsetY = 0;
        dragging = false;
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }

    }

    // Utilities

    function degToRad(deg: number): number {
        return deg * Math.PI / 180;
    }

    function radToDeg(rad: number): number {
        return rad * 180 / Math.PI;
    }

    function normalDeg(deg: number): number {
        while (deg < 0) {
            deg += 360;
        }
        while (deg >= 360) {
            deg -= 360;
        }
        return deg;
    }

    function offsetToDirectionDeg(dx: number, dy: number): number {
        if ((dx == 0) &&
            (dy == 0)) {
            return 0;
        }
        return normalDeg(
            radToDeg(
                Math.atan2(-dy, dx)));
    }

    function offsetToDistance(dx: number, dy: number): number {
        return Math.sqrt(
            (dx * dx) +
            (dy * dy));
    }

    function readableRotationDeg(deg: number): number {
        deg = normalDeg(deg);
        if ((deg == 90) || (deg == 270)) {
            deg = 0;
        } else if (deg == 0) {
            deg = 90;
        } else if (deg == 180) {
            deg = -90;
        } else {
            if ((deg > 90) &&
                (deg < 270)) {
                deg = normalDeg(deg + 180);
            }
        }
        return deg;
    }

    function layoutPie(pie: PieMenu) {
        let slices = pie.slices;

        if (slices.length == 0) {
            return;
        }

        let usedDirections = {};

        // First lay out the slices that know what direction they want to go in.
        for (let slice in slices) {

            let sliceDirection = slice ? slice.sliceDirection : undefined;
            let dir = parseDirection(sliceDirection);

            if (dir === undefined) {
                slice.dir = undefined;
                continue;
            }

            let dirInt = Math.floor(dir);

            if (usedDirections[dirInt]) {

                console.log("PieMenu.svelte: layoutPie: got two slices with same direction so ignoring second slice direction:", ["this", this, "sliceDirection", sliceDirection, "dirInt", dirInt, "usedDirections[dirInt]", usedDirections[dirInt], "slice", slice]);

                slice.sliceDirection = undefined;
                slice.dir = undefined;

            } else {

                usedDirections[dirInt] = true;

                slice.dir = dir;
                slice.dx = Math.cos(degToRad(dir));
                slice.dy = -Math.sin(degToRad(dir));

            }

        }

        // Now lay out the rest of the slices, starting at "initialDirection", 
        // and turning "clockwise" or not, by an angle "turn". 
        // If turn is 0, then calculate the amount to turn so that the number of
        // slices fill up a proportion of the pie defined by pieSliced (i.e. if 
        // pieSliced is one, then fill the whole pie, if pieSliced is 0.5, then fill
        // half the pie, etc. Assign the remaining slices to those directions, 
        // skipping directions that already have slices assigned to them.

        let currentDir = inherit(pie.initialDirection, options.initialDirection);
        let clockwise = inherit(pie.clockwise, options.clockwise);
        let pieSliced = inherit(pie.pieSliced, options.pieSliced);
        let turn = (clockwise ? -360 : 360) / slices.length;

        // If the pie is sliced, then scale the turn by the pieSliced proportion,
        // and turn by half a slice, to make the initialDirection be the
        // leading edge of the first slice, instead of the center of the first slice.
        if (pieSliced !== 0) {
            turn *= pieSliced;
            currentDir = normalDeg(currentDir + (turn / 2));
        }

        for (let slice in slices) {

            // Skip empty slices and fixed direction slices.
            if (!slice ||
                (slice.dir !== undefined)) {
                currentDir = normalDeg(currentDir + turn);
                continue;
            }

            let currentDirStart = currentDir;

            // Skip used directions, until we find a free direction.
            while (usedDirections[Math.floor(currentDir)]) {
                currentDir = normalDeg(currentDir + turn);

                // If we go full circle and out of free directions, then divide turn
                // by two, and start filling in the directions between the used slices.
                // TODO: Will this even ever happen? If we have more slices than directions,
                if (currentDir === currentDirStart) {
                    console.log('PieMenu.svelte: layoutPie: got more slices than directions, so dividing turn by 2 and filling in the gaps between the used directions.');
                    turn /= 2;
                    currentDir = normalDeg(dir + turn);
                    currentDirStart = currentDir;
                }

            }

            // We found a free direction, so point this slice in that direction,
            // and remember we've used it.
            dir = currentDir;
            slice.dir = dir;
            slice.dx = Math.cos(degToRad(dir));
            slice.dy = -Math.sin(degToRad(dir));
            usedDirections[Math.floor(currentDir)] = true;

            // Turn to the next direction.
            currentDir = normalDeg(currentDir + turn);

        }

        // Now lay out all the items in all the slices, and measure their bounding box.

        let minX = 0;
        let minY = 0;
        let maxX = 0;
        let maxY = 0;

        for (let slice in slices) {

            if (!slice) {
                continue;
            }

            let items = slice.items;

            if (!items ||
                !items.length) {
                // No items in the slice, so nothing to do here.
                continue;
            }

            // Find out how the slice wants its item layed out.
            let itemLayout = inherit(slice.itemLayout, pie.itemLayout, options.itemLayout);

            // Load any generic slice specific parameters, that might be overridden by the item.
            // We load the slice values in param_slice, and then for each item load the item
            // value into param_item, and use it if it's not undefined, else we use param_slice.
            // This saves us from having to repeat the full search for each item.

            let dir = slice.dir;
            let dx = slice.dx;
            let dy = slice.dy;
            let itemDistance = 0;
            let itemPinX = 0;
            let itemPinY = 0;
            let itemWidth = 0;
            let itemHeight = 0;
            let previousItem?: PieItem = undefined;
            let previousitemPinX = 0;
            let previousitemPinY = 0;
            let previousItemLeft = 0;
            let previousItemTop = 0;
            let previousItemRight = 0;
            let previousItemBottom = 0;

            for (let itemIndex = 0, itemCount = items.length;
                itemIndex < itemCount;
                itemIndex++,
                // Set the previous values for the next loop.
                previousItem = item,
                previousitemPinX = itemPinX,
                previousitemPinY = itemPinY,
                previousItemLeft = itemLeft,
                previousItemRight = itemRight,
                previousItemTop = itemTop,
                previousItemBottom = itemBottom) {

                let item = items[itemIndex];

                // Rotate the item if rotateItems requests
                // automatic readable rotation by the slice
                // direction, or if itemRotation specifies an
                // explicit rotation (which overrides 
                // rotateItems for this slcie). 

                let rotateItems = inherit(item.rotateItems, slice.rotateItems, pie.rotateItems, options.rotateItems);
                let itemRotation = inherit(item.itemRotation, slice.itemRotation, pie.itemRotation, options.itemRotation);

                let rot =
                    (itemRotation !== undefined)
                        ? itemRotation
                        : (rotateItems
                            ? readableRotationDeg(dir)
                            : 0);

                item.transform = (rot == 0) ? '' : ('rotate(' + rot + 'deg)');

                // Now that it's rotated, measure the item's size.
                // TODO: Make a DOM element with the label and measure it.
                itemWidth = 100; // XXX: Math.ceil(item.$itemLabel.outerWidth());
                itemHeight = 100; // XXX: Math.ceil(item.$itemLabel.outerHeight());

                // Figure out how far out to place and space the items.

                // NOTE: We could speed these up by caching the value
                // inherited by the slice, and just checking to see
                // if the item dict overrides it.

                let itemDistanceMin = inherit(item.itemDistanceMin, slice.itemDistanceMin, pie.itemDistanceMin, options.itemDistanceMin);
                let itemDistanceSpacing = inherit(item.itemDistanceSpacing. slice.itemDistanceSpacing, pie.itemDistanceSpacing, options.itemDistanceSpacing);
                let itemGap = inherit(item.itemGap, slice.itemGap, pie.itemGap, options.itemGap);
                let itemShear = inherit(item.itemShear, slice.itemShear, pie.itemShear, options.itemShear);
                let itemOffsetX = inherit(item.itemOffsetX, slice.itemOffsetX, pie.itemOffsetX, options.itemOffsetX);
                let itemOffsetY = inherit(item.itemOffsetY, slice.itemOffsetY, pie.itemOffsetY, options.itemOffsetY);
                let itemExtraGap = 0;

                // Place the items according to the slice's layout policy.

                switch (itemLayout) {

                    case 'spacedDistance':
                        if (!previousItem) {
                            itemDistance = itemDistanceMin;
                        } else {
                            itemDistance += itemDistanceSpacing;
                        }
                        itemPinX = (dx * itemDistance) + itemOffsetX;
                        itemPinY = (dy * itemDistance) + itemOffsetY;
                        break;

                    case 'minDistance':
                        itemDistance = itemDistanceMin;
                        itemPinX = (dx * itemDistance) + itemOffsetX;
                        itemPinY = (dy * itemDistance) + itemOffsetY;
                        break;

                    case 'nonOverlapping':
                        if (!previousItem) {
                            itemDistance = itemDistanceMin;
                            itemPinX = dx * itemDistance;
                            itemPinY = dy * itemDistance;
                            if ((Math.abs(dx) + 0.01) < Math.abs(dy)) {
                                // vertical
                                if (dy < 0) {
                                    itemPinY -= itemHeight / 2;
                                } else {
                                    itemPinY += itemHeight / 2;
                                }
                                if (Math.abs(dx) > 0.01) {
                                    if (dx > 0) {
                                        itemPinX += itemWidth / 2;
                                    } else {
                                        itemPinX -= itemWidth / 2;
                                    }
                                }
                            } else {
                                // horizontal
                                if (dx < 0) {
                                    itemPinX -= itemWidth / 2;
                                } else {
                                    itemPinX += itemWidth / 2;
                                }
                                if (Math.abs(dy) > 0.01) {
                                    if (dy < 0) {
                                        itemPinY += itemHeight / 2;
                                    } else {
                                        itemPinY -= itemHeight / 2;
                                    }
                                }
                            }
                        } else {
                            if ((Math.abs(dx) + 0.1) < Math.abs(dy)) {
                                // vertical
                                if (dy < 0) {
                                    itemPinX = previousitemPinX;
                                    itemPinY = previousItemTop - (itemHeight / 2) - itemGap - itemExtraGap;
                                } else {
                                    itemPinX = previousitemPinX;
                                    itemPinY = previousItemBottom + (itemHeight / 2) + itemGap + itemExtraGap;
                                }
                                itemPinX += dx * itemShear;
                            } else {
                                // horizontal
                                if (dx < 0) {
                                    itemPinX = previousItemLeft - (itemWidth / 2) - itemGap - itemExtraGap;
                                    itemPinY = previousitemPinY;
                                } else {
                                    itemPinX = previousItemRight + (itemWidth / 2) + itemGap + itemExtraGap;
                                    itemPinY = previousitemPinY;
                                }
                                itemPinY += dy * itemShear;
                            }
                        }
                        itemPinX = Math.floor(itemPinX + 0.5) + itemOffsetX;
                        itemPinY = Math.floor(itemPinY + 0.5) + itemOffsetY;
                        break;

                    default:
                        console.log('PieMenu.svelte: layoutPie: got invalid itemLayout:', ["itemLayout", itemLayout, "pie", pie, "slice", slice, "item", item]);
                        break;

                }

                // Now move the item into place.
                // TODO: Does this do the right thing with rotated items?

                let itemMarginLeft =
                    Math.round(itemWidth / -2);
                let itemMarginTop =
                    Math.round(itemHeight / -2);

                let itemLeft =
                    itemPinX + itemMarginLeft;
                let itemTop =
                    itemPinY + itemMarginTop;
                let itemRight =
                    itemLeft + itemWidth;
                let itemBottom =
                    itemTop + itemHeight;

                item.pinX = itemPinX;
                item.pinY = itemPinY;
                item.x = itemLeft;
                item.y = itemTop;
                item.width = itemWidth;
                item.height = itemHeight;

                // Update the bounding box of all the items.
                minX = Math.min(minX, itemLeft);
                minY = Math.min(minY, itemTop);
                maxX = Math.max(maxX, itemRight);
                maxY = Math.max(maxY, itemBottom);

            }

        }

        let pieWidth =
            Math.ceil(maxX - minX);
        let pieHeight =
            Math.ceil(maxY - minY);

        let pieMarginLeft =
            Math.round(minX);
        let pieMarginTop =
            Math.round(minY);

    },

    function startPie(event: MouseEvent, startPinned: boolean) {

        captureInput();
        
        pinned = startPinned;
        currentPie = pieMenus['root'];
        currentSlice = null;
        currentItem = null;
        cursorItem = null;

        showPie(
            event,
            currentPie);

        notifyPieStart(
            currentPie);

        notifyPieSliceStart(
            currentPie,
            null);

        notifyPieItemStart(
            currentPie,
            null,
            null);

        trackDown(event, pinned);

        updateTimer(true);

    },

    captureInput: function() {
        // TODO
    },

    releaseInput: function() {
        // TODO
    },

    function trackDown(event: MouseEvent) {

        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        mouseDown = true;
        dragging = false;

        if (currentPie == null) {
            // No pie active, so do nothing.

            console.log("PieMenu.svelte: trackDown: called with no currentPie:", ["this", this]);

            trackDone();

            return;
        }

        notifyPieDown(
            event,
            currentPie);

        if (pinned &&
            inherit(currentPie.draggyPin, options.draggyPin)) {
            dragStartX = currentX;
            dragStartY = currentY;
            dragOffsetX = currentX - centerX;
            dragOffsetY = currentY - centerY;
        }

        trackCurrentPie(
            event);

        return false;
    }

    function trackMove(event: MouseEvent) {

        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        if (currentPie == null) {
            // No pie active, so do nothing.
            return;
        }

        if (!mouseDown &&
            inherit(currentPie.stickyPin, options.stickyPin)) {
            centerPie(
                event,
                currentPie,
                0,
                0);
        }

        if (mouseDown &&
            pinned &&
            inherit(currentPie.draggyPin, options.draggyPin)) {

            if (!dragging) {

                let dist =
                    offsetToDistance(
                        currentX - dragStartX,
                        currentY - dragStartY);
                let dragThreshold =
                    inherit(currentPie.dragThreshold, options.dragThreshold);

                if (dist > dragThreshold) {
                    dragging = true;
                }

            }

            if (dragging) {
                centerPie(
                    event,
                    currentPie,
                    dragOffsetX,
                    dragOffsetY);
            }

        }

        trackCurrentPie(
            event);

        notifyPieMove(
            event,
            currentPie);

        return false;
    }

    function trackUp(event: MouseEvent) {

        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        mouseDown = false;

        if (currentPie == null) {
            // No pie active, so do nothing.
            return;
        }

        trackCurrentPie(
            event);

        notifyPieUp(
            event,
            currentPie);

        if (dragging) {
            return;
        }

        finalPie = currentPie;
        finalSlice = currentSlice;
        finalItem = currentItem;

        currentPie.selectedSlice = currentSlice;
        if (currentSlice) {
            currentSlice.selectedItem = currentItem;
        }

        let nextPieId = undefined;
        let nextPie = undefined;

        if (currentSlice != null) {

            // In a slice.

            if (currentItem != null) {

                // In an item.

                if (currentItem.disabled) {
                    notifyPieItemSelectDisabled(
                        event,
                        currentPie,
                        currentSlice,
                        currentItem);
                } else {
                    notifyPieItemSelect(
                        event,
                        currentPie,
                        currentSlice,
                        currentItem);

                        nextPieId = inherit(currentItem.nextPieId, currentSlice.nextPieId, currentPie.nextPieId, options.nextPieId);

                    if (nextPieId) {
                        nextPie = pieMenus[nextPieId];
                    }

                }

                currentItem = null;

                notifyPieItemStop(
                    event,
                    currentPie,
                    currentSlice,
                    finalItem);

                notifyPieItemStart(
                    event,
                    currentPie,
                    currentSlice,
                    null);

            }

            if (currentSlice.disabled) {
                notifyPieSliceSelectDisabled(
                    event,
                    currentPie,
                    currentSlice);
            } else {
                notifyPieSliceSelect(
                    event,
                    currentPie,
                    currentSlice);
            }

            currentSlice = null;

            notifyPieSliceStop(
                event,
                currentPie,
                finalSlice);

            notifyPieSliceStart(
                event,
                currentPie,
                null);

        }

        if (currentPie.disabled) {
            notifyPieSelectDisabled(
                event,
                currentPie);
        } else {
            notifyPieSelect(
                event,
                currentPie);
        }

        if (finalSlice == null) {

            // No slice selected.

            if (!pinned) {

                // Pin up if not already pinned.

                pinned = true;

                notifyPiePin(
                    event,
                    currentPie);

                // Return without ending pie tracking.

                return;

            } else {

                // Cancel if pinned.

                notifyPieCancel(
                    event,
                    currentPie);

                trackDone();

            }

        }

        hidePie(
            event,
            currentPie);

        if (pinned) {

            notifyPieUnpin(
                event,
                currentPie);

        }

        pinned = false;

        notifyPieStop(
            event,
            currentPie);

        currentPie = null;

        updateTimer(false)

        if (nextPie != null) {

            // Keep tracking, and go on to the next pie, starting with it already pinned.

            currentPie = nextPie;

            notifyPieStart(
                event,
                currentPie);

            pinned = true;

            notifyPiePin(
                event,
                currentPie);

            showPie(
                event,
                currentPie);

            trackCurrentPie(
                event);

        } else {

            // Finished tracking.

            trackDone();

        }

        return false;
    }

    function trackDone() {

        mouseDown = false;

        releaseInput();

    }

    function trackTimer() {
        if (timer !== undefined) {
            cancelTimeout(timer);
            timer = undefined;
        }

        notifyPieTimer(
            null,
            currentPie,
            currentSlice,
            currentItem);

        updateTimer(currentPie != null);
    }

    function updateTimer(enabled: boolean) {
        if (timer) {
            clearTimeout(timer);
            timer = undefined;
        }

        let timerDelay = 
            inherit(currentItem.timerDelay, currentSlice.timerDelay, currentPie.timerDelay, options.timerDelay);

        if (timerDelay === 0) {
            trackTimer();
        } else {
            timer = setTimeout(trackTimer, timerDelay);
        }
    }

    function trackCurrentPie(event: MouseEvent) {

        currentX = event.pageX;
        currentY = event.pageY;

        deltaX = currentX - centerX;
        deltaY = currentY - centerY;

        distance =
            offsetToDistance(
                deltaX,
                deltaY);

        direction =
            offsetToDirectionDeg(
                deltaX,
                deltaY);

        lastSlice = currentSlice;
        lastItem = currentItem;

        let slices = currentPie && currentPie.slices;

        if (!slices ||
            !slices.length) {
            currentSlice = null;
            currentItem = null;
            return;
        }

        let foundCursorItem = false;
        let currentSlice =
            findSlice(
                event,
                currentPie);

        currentSlice = currentSlice;
        currentItem = null;

        // The options or the current slice may inhibit selecting
        // the item under the cursor. Also the item can inhibit it,
        // but we haven't found the item yet! 
        let selectCursorItem = inherit(currentSlice.selectCursorItem, currentPie.selectCursorItem, options.selectCursorItem);

        if (selectCursorItem) {

            // Look to see if the cursor is pointing at an item,
            // and select that item no matter what slice it's in.

            // TODO: Use enter and exit events on items to track which one is under the cursor in cursorItem.

            for (let slice in slices) {

                if (slice === null) {
                    continue;
                }

                let items = slice.items;

                if (!items || !items.length) {
                    continue;
                }

                for (let item in items) {
                    
                    if ((item === null) ||
                        (item !== cursorItem)) {
                        continue;
                    }

                    // The item can also inhibit selecting itself when
                    // when it's under the cursor. (But of course
                    // it can still be selected by the slice in _findItem.)
                    if (!inherit(item.selectCursorItem, slice.selectCursorItem, pie.selectCursorItem, options.selectCursorItem)) {
                        foundCursorItem = true;
                        currentItem = item;
                        currentSlice = slice;
                        break;
                    }

                }

            }

        }

        // If we didn't find the item under the cursor,
        // and we're currently in a slice, then find the
        // item selected in that slice,
        if (!foundCursorItem &&
            (currentSlice != null)) {

            currentItem =
                findItem(
                    event,
                    currentPie,
                    currentSlice);

        }

        if (currentSlice != lastSlice) {

            notifyPieSliceStop(
                event,
                currentPie,
                lastSlice);

            notifyPieSliceStart(
                event,
                currentPie,
                currentSlice);

        }

        if (currentItem != lastItem) {
            notifyPieItemStop(
                event,
                currentPie,
                lastSlice,
                lastItem);

            notifyPieItemStart(
                event,
                currentPie,
                currentSlice,
                currentItem);

        }

        notifyPieUpdate(
            event,
            currentPie);

        if (currentSlice != null) {

            notifyPieSliceUpdate(
                event,
                currentPie,
                currentSlice);

            if (currentItem != null) {

                notifyPieItemUpdate(
                    event,
                    currentPie,
                    currentSlice,
                    currentItem);

            }

        }

        updateTimer(currentPie != null);

    }

    function parseDirection(directionSpec: string | number | number[2] | null | undefined): number {
        let options = options;
        let dir = undefined;

        if ((directionSpec === null) ||
            (directionSpec === undefined)) {

            dir =
                undefined;

        } else if ((typeof directionSpec) == "number") {

            dir =
                normalDeg(
                    directionSpec);

        } else if ((typeof directionSpec) == "string") {

            dir = directionNames[directionSpec];

            if (dir === undefined) {

                try {

                    dir =
                        parseFloat(
                            directionSpec);

                } catch (e) {

                    console.log("PieMenu.svelte: parseDirection: got invalid string direction name:", ["this", this, "directionSpec", directionSpec, "not in directionNames", directionNames, "or convertable to number of degrees"]);

                }

            }

        } else if (Array.isArray(directionSpec)) {

            if (directionSpec.length != 2) {

                console.log("PieMenu.svelte: parseDirection: got invalid direction spec:", ["this", this, "directionSpec", directionSpec, "not array of two numbers [dx, dy]"]);

            } else {

                dir =
                    offsetToDirectionDeg(
                        directionSpec[0],
                        directionSpec[1]);

            }

        } else {

            ERROR("PieMenu.svelte: parseDirection: got invalid direction spec:", ["directionSpec", directionSpec, "not number of degrees, array of two numbers [dx, dy], or direction name string from", directionNames]);

        }

        return dir;
    }

    function findSlice(event: MouseEvent, pie: PieMenu): PieSlice {

        let slices = pie.slices;

        if (!slices || (slices.length === 0)) {
            return null;
        }

        let inactiveDistance = inherit(pie.inactiveDistance, options.inactiveDistance);

        if (distance <= inactiveDistance) {
            return null;
        }

        if (slices.length == 1) {
            return slices[0];
        }

        let maxDot = 0;
        let maxDotIndex = null;

        for (let slice in slices) {

            let sliceDx = slice.dx;
            let sliceDy = slice.dy;

            let dot =
                (deltaX * sliceDx) +
                (deltaY * sliceDy);

            if (dot > maxDot) {
                maxDot = dot;
                maxDotIndex = sliceIndex;
            }

        }

        return slices[maxDotIndex];

    }

    function findItem(event: MouseEvent, pie: PieMenu, slice: PieSlice): PieItem {

        let items = slice.items;
        if (!items || (items.length === 0)) {
            return null;
        }

        let itemTracking = inherit(slice.itemTracking, pie.itemTracking, options.itemTracking);

        if (itemTracking == 'target') {
            return null;
        }

        if (items.length == 1) {
            return items[0];
        }

        let minDistanceSquared = 1.0e+6;
        let minDistanceSquaredIndex = null;

        for (var item in items) {

            let itemPinX =
                item.centerX;
            let itemPinY =
                item.centerY;

            let distanceX =
                itemPinX - deltaX;
            let distanceY =
                itemPinY - deltaY;

            let distanceSquared =
                (distanceX * distanceX) +
                (distanceY * distanceY);

            if (distanceSquared < minDistanceSquared) {

                minDistanceSquared =
                    distanceSquared;
                minDistanceSquaredIndex =
                    itemIndex;

            }

        }

        return items[minDistanceSquaredIndex];

    },

    function showPie(event: MouseEvent, pie: PieMenu) {

        onShowPie(event, pie);

        layoutPie(pie);

        centerPie(
            event,
            pie,
            0,
            0);

    },

    function hidePie(event: MouseEvent, pie: PieMenu) {

        // TODO: Hide the pie.

    },

    function centerPie(event: MouseEvent, pie: PieMenu, offsetX: number, offsetY: number) {

        let x = event.pageX - offsetX;
        let y = event.pageY - offsetY;

        centerX = currentX = x;
        centerY = currentY = y;
        deltaX = 0;
        deltaY = 0;
        distance = 0;
        direction = 0;

        // TODO: Move the pie to the center.

    },

    function onShowPie(event: MouseEvent, pie: PieMenu) {

        notifyPieShow(event, pie);

        let slices = pie.slices;

        if (!slices || (slices.length === 0)) {
            return;
        }

        for (let slice in slices) {

            notifyPieSliceShow(event, pie, slice);

            let items = slice.items;

            if (!items || (items.length === 0)) {
                continue;
            }

            for (let item in items) {
                notifyPieItemShow(event, pie, slice, item);
            }

        }

    },

    // PieMenu Notifiers

    function notifyPieMenu(name: string, event: MouseEvent, pie: PieMenu | undefined) {

        const handler = inherit(pie?[name], options?[name], handler);

        console.log("notifyPieMenu", ["this", this, "name", name, "event", event, "pie", pie, "handler", handler]);

        if (handler) {
            handler.call(this, event, pie);
        }

    }

    function notifyPieDown(event: MouseEvent, pie: PieMenu | undefined) {
        notifyPieMenu('onpiedown', onpiedown, event, pie, null, null);
    }

    function notifyPieMove(event: MouseEvent, pie: PieMenu | undefined) {
        notifyPieMenu('onpiemove', onpiemove, event, pie, null, null);
    }

    function notifyPieUp(event: MouseEvent, pie: PieMenu | undefined) {
        notifyPieMenu('onpieup', onpieup, event, pie, null, null);
    }

    function notifyPieShow(event: MouseEvent, pie: PieMenu | undefined) {
        notifyPieMenu('onpieshow', onpieshow, event, pie, null, null);
    }

    function notifyPieStart(event: MouseEvent, pie: PieMenu | undefined) {
        notifyPieMenu('onpiestart', onpiestart, event, pie, null, null);
    }

    function notifyPieStop(event: MouseEvent, pie: PieMenu | undefined) {
        notifyPieMenu('onpiestop', onpiestop, event, pie, null, null);
    }

    function notifyPiePin(event: MouseEvent, pie: PieMenu | undefined) {
        notifyPieMenu('onpiepin', onpiepin, event, pie, null, null);
    }

    function notifyPieUnpin(event: MouseEvent, pie: PieMenu | undefined) {
        notifyPieMenu('onpieunpin', onpieunpin, event, pie, null, null);
    }

    function notifyPieCancel(event: MouseEvent, pie: PieMenu | undefined) {
        notifyPieMenu('onpiecancel', onpiecancel, event, pie, null, null);
    }

    function notifyPieUpdate(event: MouseEvent, pie: PieMenu | undefined) {
        notifyPieMenu('onpieupdate', onpieupdate, event, pie, null, null);
    }

    function notifyPieSelect(event: MouseEvent, pie: PieMenu | undefined) {
        notifyPieMenu('onpieselect', onpieselect, event, pie, null, null);
    }

    function notifyPieSelectDisabled(event: MouseEvent, pie: PieMenu | undefined) {
        notifyPieMenu('onpieselectdisabled', onpieselectdisabled, event, pie, null, null);
    }

    function notifyPieTimer(event: MouseEvent, pie: PieMenu | undefined, slice: PieSlice | undefined, item: PieItem | undefined) {
        notifyPieItem('onpietimer', onpietimer, event, pie, slice, item);
    }

    // Slice Notifiers

    function notifyPieSlice(name: string, event: MouseEvent, pie: PieMenu | undefined, slice: PieSlice | undefined, item: item | undefined) {

        const handler = inherit(itemslice?[name], pie?[name], options?[name], handler);

        console.log("notifyPieSlice", ["this", this, "name", name, "event", event, "pie", pie, "slice", slice, "handler", handler]);

        if (handler) {
            handler.call(this, event, pie, slice, item);
        }

    }

    function notifyPieSliceShow(event: MouseEvent, pie: PieMenu | undefined, slice: PieSlice | undefined) {
        notifyPieSlice('onpiesliceshow', onpiesliceshow, handler, event, pie, slice, null);
    }

    function notifyPieSliceStart(event: MouseEvent, pie: PieMenu | undefined, slice: PieSlice | undefined) {
        notifyPieSlice('onpieslicestart', pieslicestart, event, pie, slice, null);
    }

    function notifyPieSliceStop(event: MouseEvent, pie: PieMenu | undefined, slice: PieSlice | undefined) {
        notifyPieSlice('onpieslicestop', pieslicestop, event, pie, slice, null);
    }

    function notifyPieSliceUpdate(event: MouseEvent, pie: PieMenu | undefined, slice: PieSlice | undefined) {
        notifyPieSlice('onpiesliceupdate', piesliceupdate, event, pie, slice, null);
    }

    function notifyPieSliceSelect(event: MouseEvent, pie: PieMenu | undefined, slice: PieSlice | undefined) {
        notifyPieSlice('onpiesliceselect', piesliceselect, event, pie, slice, null);
    }

    function notifyPieSliceSelectDisabled(event: MouseEvent, pie: PieMenu | undefined, slice: PieSlice | undefined) {
        notifyPieSlice('onpiesliceselectdisabled', piesliceselectdisabled, event, pie, slice, null);
    }

    // Item Notifiers

    function notifyPieItem(name: string, handler: EventPieItemHandler, event: MouseEvent, pie: PieMenu | undefined, slice: PieSlice | undefined, item: item | undefined) {

        const handler = inherit(item?[name], slice?[name], pie?[name], options?[name], handler);

        console.log("notifyPieItem", ["this", this, "name", name, "handler", handler, "event", event, "pie", pie, "slice", slice, "item", item, "handler", handler]);

        if (handler) {
            handler.call(this, event, pie, slice, item);
        }

    }

    function notifyPieItemShow(event: MouseEvent, pie: PieMenu | undefined, slice: PieSlice | undefined, item: PieItem | undefined) {
        notifyPieItem('onpieitemshow', onpieitemshow, event, pie, slice, item);
    }

    function notifyPieItemStart(event: MouseEvent, pie: PieMenu | undefined, slice: PieSlice | undefined, item: PieItem | undefined) {
        notifyPieItem('onpieitemstart', onpieitemstart, event, pie, slice, item);
    }

    function notifyPieItemStop(event: MouseEvent, pie: PieMenu | undefined, slice: PieSlice | undefined, item: PieItem | undefined) {
        notifyPieItem('onpieitemstop', onpieitemstop, event, pie, slice, item);
    }

    function notifyPieItemUpdate(event: MouseEvent, pie: PieMenu | undefined, slice: PieSlice | undefined, item: PieItem | undefined) {
        notifyPieItem('onpieitemupdate', onpieitemupdate, event, pie, slice, item);
    }

    function notifyPieItemSelect(event: MouseEvent, pie: PieMenu | undefined, slice: PieSlice | undefined, item: PieItem | undefined) {
        notifyPieItem('onpieitemselect', onpieitemselect, event, pie, slice, item);
    }

    function notifyPieItemSelectDisabled(event: MouseEvent, pie: PieMenu | undefined, slice: PieSlice | undefined, item: PieItem | undefined) {
        notifyPieItem('onpieitemselectdisabled', onpieitemselectdisabled, event, pie, slice, item);
    }

*/

</script>

<div class="fullscreen">
    <h1>Pie Menu</h1>
</div>

<style>

    .mouseless {
        pointer-events: none;
    }

    .fullscreen {
        position: absolute;
        width: 100%;
        height: 100%;
    }

</style>
