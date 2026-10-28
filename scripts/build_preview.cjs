'use strict';
// Re-render the four README panels from the workbench's own synthetic demo.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const scripts=[...html.matchAll(/<script(?: id="core")?>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
if(scripts.length!==2)throw new Error('Expected the inline core and UI scripts');
class Element{constructor(id){this.id=id;this.value=id==='vizOffset'?'0':'';this.innerHTML='';this.textContent='';this.listeners={};this.dataset={};this.files=[];this.style={}}addEventListener(type,fn){(this.listeners[type]??=[]).push(fn)}append(){}remove(){}click(){}}
const nodes=new Map(),document={getElementById(id){if(!nodes.has(id))nodes.set(id,new Element(id));return nodes.get(id)},querySelectorAll(){return []},documentElement:{},body:{append(){}},createElement(tag){return new Element(tag)}};
const ctx={document,localStorage:{getItem(){return null},setItem(){}},console,confirm:()=>true,prompt:()=>null,window:{print(){}},navigator:{clipboard:{async writeText(){}}},Blob,URL:{createObjectURL(){return 'blob:preview'},revokeObjectURL(){}},setTimeout,Date,Math,Number,String,Set,JSON,Error};
vm.runInNewContext(scripts[0],ctx);vm.runInNewContext(scripts[1],ctx);
const panels=[['Flow',20,62,700,285],['Pressure',740,62,700,280],['Composition',20,372,700,320],['Sensitivity',740,372,700,280]];
let output=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1460 720" role="img" aria-label="Synthetic membrane separation visual overview">','<rect width="1460" height="720" fill="#eef5f4"/>','<text x="30" y="35" font-family="system-ui, sans-serif" font-size="19" font-weight="700" fill="#1c424b">Membrane separation · synthetic demonstration</text>'];
for(const [name,x,y,width,height] of panels){let svg=document.getElementById('viz'+name).innerHTML;if(!svg.startsWith('<svg '))throw Error('Preview panel unavailable: '+name);output.push(svg.replace('<svg ',`<svg x="${x}" y="${y}" width="${width}" height="${height}" `))}output.push('</svg>');
let text=output.join('\n'),target=path.join(root,'assets','visual-overview.svg');if(process.argv.includes('--check')){if(!fs.existsSync(target)||fs.readFileSync(target,'utf8')!==text)throw Error('README preview is stale; run node scripts/build_preview.cjs');console.log('README preview matches the synthetic demo.')}else{fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,text);console.log('Wrote assets/visual-overview.svg');}
