/**
 * Matches CSS to internal pixel size so canvas scales properly
 */
export function resizeCanvasToDisplay (
    canvas : HTMLCanvasElement, 
    ctx : CanvasRenderingContext2D,
    cssWidth : number, 
    cssHeight : number
    ): boolean {
        if (!canvas || !ctx) return false;
        if (!Number.isFinite(cssWidth) || !Number.isFinite(cssHeight)) return false;
        if (cssWidth <= 0 || cssHeight <= 0) return false;

        const dpr = window.devicePixelRatio || 1;
        const nextW = Math.round(cssWidth * dpr);
        const nextH = Math.round(cssHeight * dpr);

        if (canvas.width === nextW && canvas.height === nextH) return false;

        canvas.width = nextW;
        canvas.height = nextH;
        canvas.style.width = `${cssWidth}px`;
        canvas.style.height = `${cssHeight}px`;

        ctx.setTransform(1,0,0,1,0,0);
        ctx.scale(dpr, dpr);

        return true;
    };

type Peak = { min: number, max: number }

/**
 * Converts audio samples into min max buckets deduced via bucketCount
 * @param channelData - raw audio with lots of samples
 * @param bucketCount - number of buckets these samples are divided into
 * @returns - reduced list of { min, max } buckets
 */
export function computePeaks(
    channelData: Float32Array,
    bucketCount: number
    ): Peak[] {
    const length = channelData?.length ?? 0;
    if (length === 0 || bucketCount <= 0) return []; 
    if (!Number.isFinite(bucketCount)) return [];
    
    const safeBucketCount = Math.min(length, Math.floor(bucketCount));
    const chunkSize = Math.max(1, Math.floor(length / safeBucketCount));
    const peaks: Peak[] = [];

    for (let i = 0; i < length; i+= chunkSize) {
        let min = Infinity;
        let max = -Infinity;
        const end = Math.min(i + chunkSize, length);
        
        for (let j = i; j < end; j++) {
            const v = channelData[j];
            if (v === undefined) continue; // 0 value
            if (v < min) min = v;
            if (v > max) max = v;
        };

    if (min === Infinity) min = 0;
    if (max === -Infinity) max = 0;
    peaks.push({ min, max});
    };

    return peaks;
};

type ResizePeaksProps = {
    peaks: Array<{min :number, max: number}>,
    cssWidth: number,
    barWidth: number,
    gap: number,
}

/**
 * Adapts peaks to current rendered width and bar spacing
 * @returns a new peaks array sized to how many bars fit on the screen
 */
export function resizePeaks ({
    peaks,
    cssWidth, 
    barWidth, 
    gap
}: ResizePeaksProps) : Peak[]  {
    if (!peaks.length) return [];
    if (!Number.isFinite(cssWidth) || cssWidth <= 0) return [];
    if (!Number.isFinite(barWidth) || !Number.isFinite(gap)) return [];
    if (barWidth <= 0 || gap < 0) return [];

    const slot = barWidth + gap;
    if (slot <= 0) return [];

    const targetBucketCount = Math.max(1, Math.floor(cssWidth / slot));
    const resizedPeaks: Peak[] = [];
    const p = peaks.length;

    if (p === 0) return [];

    for (let col = 0; col < targetBucketCount; col+=1) {
        const start = Math.floor((col * p)  / targetBucketCount);
        let end = Math.floor((col + 1) * p / targetBucketCount);
        if (end === start) end = Math.min(p, start + 1);

        let min = Infinity;
        let max = -Infinity;

        for (let j = start; j < end; j+=1) {
            const peak = peaks[j];
            if (peak === undefined) continue;
            if (peak.min < min) min = peak.min;
            if (peak.max > max) max = peak.max;
        };

        if (min === Infinity) min = 0;
        if (max === -Infinity) max = 0; 
        resizedPeaks.push({min : min, max: max});
    };

    return resizedPeaks;
};

type DrawWavesProps = {
    cssHeight: number,
    resizedPeaks:  Array<{min :number, max: number}>,
    barWidth: number,
    gap: number,
    context: CanvasRenderingContext2D,
    radius: number
}

/**
 * Maps audio ampitude to canvas Y space for drawing audio bars
 * Draws one vertical bar for each bucket 
 */
export function drawWaves ({
    cssHeight, 
    resizedPeaks, 
    barWidth, 
    gap, 
    context, 
    radius,
} : DrawWavesProps) : void {
    if (!resizedPeaks.length) return;
    if (!Number.isFinite(cssHeight) || cssHeight <= 0) return;
    if (!Number.isFinite(barWidth) || barWidth <= 0) return;
    if (!Number.isFinite(gap) || gap < 0) return;
    if (!Number.isFinite(radius) || radius < 0) return;

    const center = cssHeight / 2;
    context.fillStyle = "rgb(77, 77, 77)";

    for (let i = 0; i < resizedPeaks.length; i += 1) {
        const x = i * (barWidth + gap);
        const wave = resizedPeaks[i];
        
        if (!wave) continue;
        
        const yTop = center - (wave.max * center);
        const yBottom = center - (wave.min * center);
        const height = Math.max(2, yBottom - yTop);
        const safeRadius = Math.min(radius, barWidth / 2, height / 2);
        
        context.beginPath();
        context.roundRect(x, yTop, barWidth, height, safeRadius);
        context.fill();
    }
}

type DrawOverlayProps = {
    cssHeight: number,
    resizedPeaks:  Array<{min :number, max: number}>,
    barWidth: number,
    gap: number,
    playedPercent: number,
    context: CanvasRenderingContext2D,
    radius: number
}

export function drawOverlay ({
    cssHeight, 
    resizedPeaks, 
    barWidth, 
    playedPercent,
    gap, 
    context,
    radius,
} : DrawOverlayProps) : void {
    if (!resizedPeaks.length) return;
    if (!Number.isFinite(cssHeight) || cssHeight <= 0) return;
    if (!Number.isFinite(barWidth) || barWidth <= 0) return;
    if (!Number.isFinite(gap) || gap < 0) return;
    if (!Number.isFinite(radius) || radius < 0) return;
    if (!Number.isFinite(playedPercent)) return;

    const center = cssHeight / 2;
    context.fillStyle = "rgb(255, 255, 255)";

    const safePlayedPercent = Math.max(0, Math.min(1, playedPercent));
    const totalWidth = resizedPeaks.length * (barWidth + gap) - gap;
    const playedPixels = totalWidth * safePlayedPercent;

    // Draw filled bars up to played position
    for (let i = 0; i < resizedPeaks.length; i++) {
        const x = i * (barWidth + gap);
        const barEndX = x + barWidth;

        // Stop if we've passed the played position
        if (x > playedPixels) break;

        const wave = resizedPeaks[i];
        if (!wave) continue;

        const yTop = center - (wave.max * center);
        const yBottom = center - (wave.min * center);
        const height = Math.max(2, yBottom - yTop);
        const safeRadius = Math.min(radius, barWidth / 2, height / 2);

        context.beginPath();
        context.roundRect(x, yTop, barWidth, height, safeRadius);
        context.fill();
    }

    // Draw a moving line at the play position
    context.strokeStyle = "rgba(255, 255, 255, 0.8)";
    context.lineWidth = 3;
    context.lineCap = "round";

    context.beginPath();
    context.moveTo(playedPixels, 0);
    context.lineTo(playedPixels, cssHeight);
    context.stroke();
}