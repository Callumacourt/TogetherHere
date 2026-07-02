import fixWebmDuration from "fix-webm-duration";

export async function webmHelper(
  blob: Blob,
  durationMs: number
): Promise<Blob> {
 return await fixWebmDuration(blob, durationMs, {
  logger: (msg) => alert(msg),
})}
;