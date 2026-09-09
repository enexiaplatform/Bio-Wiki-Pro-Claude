import type {NativeIntakeUnit} from "@shared/quality-lab-native-intake";
import {inspectNativeArchive} from "./quality-lab-native-archive";

export async function parseNativeWorkbook(buffer:ArrayBuffer) {
  await inspectNativeArchive(buffer);
  const [{default:JSZip},XLSX]=await Promise.all([import("jszip"),import("xlsx")]);
  const archive=await JSZip.loadAsync(buffer);
  if(!archive.file("xl/workbook.xml") || Object.keys(archive.files).some(name=>/vbaProject|activeX\/|embeddings\/|externalLinks\//i.test(name))) throw new Error("Use an XLSX workbook without macros, embedded objects or external workbook links.");
  for(const name of Object.keys(archive.files).filter(name=>/\.(xml|rels)$/.test(name))) {
    const xml=await archive.files[name].async("string");
    if(/<!\s*(DOCTYPE|ENTITY)\b/i.test(xml)) throw new Error("Workbook XML contains unsupported declarations.");
    if(name.endsWith(".rels") && /TargetMode\s*=\s*["']External["']/i.test(xml)) throw new Error("External workbook relationships are unsupported. Remove external links first.");
  }
  const workbook=XLSX.read(buffer,{type:"array",cellFormula:true,cellNF:true,cellText:true,cellStyles:true,cellDates:false,bookVBA:false});
  if(workbook.SheetNames.length>20) throw new Error("Upload at most 20 sheets in one workbook.");
  const units:NativeIntakeUnit[]=[]; let skipped=0;
  for(const [index,name] of Array.from(workbook.SheetNames.entries())) {
    if(workbook.Workbook?.Sheets?.[index]?.Hidden) { skipped++; continue; }
    const sheet=workbook.Sheets[name];
    if(!sheet["!ref"])continue;
    const range=XLSX.utils.decode_range(sheet["!ref"]);
    if(range.e.r>4999||range.e.c>99)throw new Error("A worksheet exceeds 5,000 rows or 100 columns. Upload the relevant project table.");
    for(let row=range.s.r;row<=range.e.r;row++)for(let col=range.s.c;col<=range.e.c;col++) {
      if(sheet["!rows"]?.[row]?.hidden || sheet["!cols"]?.[col]?.hidden) {skipped++;continue;}
      const address=XLSX.utils.encode_cell({r:row,c:col});const cell=sheet[address];
      if(!cell || cell.v===undefined || cell.v===null)continue;
      if(cell.f || cell.t==="e" || cell.t==="b" || cell.t==="d" || cell.z && XLSX.SSF.is_date(cell.z)) {skipped++;continue;}
      const text=String(cell.w??cell.v).trim();if(!text)continue;
      if(text.length>500||units.length>=20000)throw new Error("Workbook exceeds 20,000 visible values or a 500-character cell limit.");
      const merge=sheet["!merges"]?.find(item=>item.s.r===row&&item.s.c===col);
      units.push({id:`xlsx:s${index+1}:${address}`,section:name,locator:address,text,rawText:String(cell.v),numberFormat:cell.z?.slice(0,100),row:row+1,column:col+1,columnSpan:merge?merge.e.c-merge.s.c+1:1});
    }
  }
  return {units,notices:["Visible sheet values only. Formula cells and cached formula results, dates, hidden rows/sheets, comments and document metadata are excluded.",...(skipped?[`${skipped} hidden or unsupported items were skipped; check completeness before confirming.`]:[])]};
}
