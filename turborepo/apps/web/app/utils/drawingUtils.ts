function resizeCanvasToDisplay (canvas : HTMLCanvasElement, dpr : number) {

}

function mapPeaksToPixels(peaks, cssWidth, cssHeight, amplitude) {
    
}

export function computePeaks(
    channelData: Float32Array, 
    bucketCount: number
    ) : Array<{min : number, max: number}> {
    const length = channelData?.length ?? 0;
    if (length === 0 || bucketCount <= 0) return []; 

    if (bucketCount > length) bucketCount = length;
    const chunkSize = Math.max(1, Math.floor(length / bucketCount));
    const peaks: Array<{ min: number, max: number}> = [];
    for (let i = 0; i < length; i+= chunkSize) {
        let min = Infinity;
        let max = -Infinity;
        const end = Math.min(i + chunkSize, length);
        for (let j = i; j < end; j++) {
            const v = channelData[j];
            if (v < min) min = v;
            if (v > max) max = v;
        }
    if (min === Infinity) min = 0;
    if (max === -Infinity) max = 0;
    peaks.push({ min, max})
    }
    return peaks;
}