import {parseNativeWorkbook} from "./quality-lab-native-workbook";
self.onmessage=async(event:MessageEvent<ArrayBuffer>)=>{
  try{self.postMessage({ok:true,result:await parseNativeWorkbook(event.data)});}
  catch(error){self.postMessage({ok:false,message:error instanceof Error?error.message:"Workbook could not be read."});}
};
