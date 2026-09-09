/** Inspect archive metadata before parsers inflate OOXML. Never execute content. */
export async function inspectNativeArchive(buffer: ArrayBuffer) {
  const view = new DataView(buffer);
  if (buffer.byteLength < 22 || view.getUint32(0,true) !== 0x04034b50) throw new Error("The file is not a supported Office ZIP archive.");
  let end = -1;
  for (let i = buffer.byteLength - 22; i >= Math.max(0, buffer.byteLength - 65557); i--) if(view.getUint32(i,true)===0x06054b50) { end=i; break; }
  if(end<0) throw new Error("The Office archive is incomplete.");
  const entries=view.getUint16(end+10,true), offset=view.getUint32(end+16,true);
  if(entries>500 || view.getUint16(end+4,true)!==0 || entries===65535) throw new Error("Office archive exceeds supported entry limits.");
  let cursor=offset,total=0;
  for(let i=0;i<entries;i++) {
    if(cursor+46>buffer.byteLength || view.getUint32(cursor,true)!==0x02014b50) throw new Error("Malformed Office archive.");
    const flags=view.getUint16(cursor+8,true), compressed=view.getUint32(cursor+20,true), expanded=view.getUint32(cursor+24,true);
    const nameLength=view.getUint16(cursor+28,true),extra=view.getUint16(cursor+30,true),comment=view.getUint16(cursor+32,true);
    total+=expanded;
    if(flags&1 || expanded>4*1024*1024 || total>32*1024*1024 || expanded>Math.max(1024*1024,compressed*200)) throw new Error("Encrypted or excessively expanded Office archives are unsupported.");
    cursor+=46+nameLength+extra+comment;
    if(cursor>buffer.byteLength) throw new Error("Malformed Office archive.");
  }
  const {default: JSZip}=await import("jszip");
  const zip=await JSZip.loadAsync(buffer);
  let actualTotal=0;
  for(const part of Object.values(zip.files)) {
    if(part.dir) continue;
    if(/(?:^|[\\/])\.\.(?:[\\/]|$)/.test(part.unsafeOriginalName ?? part.name)) throw new Error("Unsupported archive path.");
    await new Promise<void>((resolve,reject)=>{
      let length=0;
      type Stream = {on(event:string,callback:(value:any)=>void):Stream;pause():Stream;resume():Stream};
      const stream=(part as unknown as {internalStream(type:"uint8array"):Stream}).internalStream("uint8array");
      stream.on("data",(chunk:Uint8Array)=>{length+=chunk.length;actualTotal+=chunk.length;if(length>4*1024*1024||actualTotal>32*1024*1024){stream.pause();reject(new Error("Expanded archive exceeds safe limits."));}}).on("error",reject).on("end",resolve).resume();
    });
  }
}
