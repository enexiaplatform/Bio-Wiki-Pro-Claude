import {extractNativeCandidates,type NativeIntakeUnit,type NativeFormat} from "@shared/quality-lab-native-intake";
export async function parseQualityLabNativeFile(buffer:ArrayBuffer,fileName:string) {
  if(!buffer.byteLength||buffer.byteLength>8*1024*1024||fileName.length>180)throw new Error("Choose a non-empty XLSX, PDF or DOCX file up to 8 MB with a short filename.");
  const format=fileName.split(".").at(-1)?.toLowerCase() as NativeFormat;
  if(!["xlsx","pdf","docx"].includes(format))throw new Error("Unsupported native file format.");
  const digest=await crypto.subtle.digest("SHA-256",buffer);
  const file={fileName,fileSha256:Array.from(new Uint8Array(digest),byte=>byte.toString(16).padStart(2,"0")).join("")};
  const parsed= format==="xlsx" ? await new Promise<{units:NativeIntakeUnit[];notices:string[]}>((resolve,reject)=>{
    const worker=new Worker(new URL("./quality-lab-native-worker.ts",import.meta.url),{type:"module"});
    const timer=setTimeout(()=>{worker.terminate();reject(new Error("Workbook extraction exceeded 15 seconds. Upload fewer project sheets."));},15000);
    const finish=()=>{clearTimeout(timer);worker.terminate();};
    worker.onmessage=event=>{finish();event.data.ok?resolve(event.data.result):reject(new Error(event.data.message));};
    worker.onerror=()=>{finish();reject(new Error("Workbook parsing failed. Export a smaller XLSX or CSV."));};
    worker.postMessage(buffer,[buffer]);
  }) : await (await import("./quality-lab-native-documents")).parseNativeDocument(buffer,fileName);
  return {...parsed,file,format,candidates:extractNativeCandidates(parsed.units,file,format)};
}
