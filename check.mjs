import {readFile,access} from 'node:fs/promises';
const html=await readFile('dist/index.html','utf8');
const ids=new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]));
for(const [,ref] of html.matchAll(/(?:src|href)="([^"]+)"/g)){
  if(ref.startsWith('http')||ref==='#') continue;
  if(ref.startsWith('#')) {if(!ids.has(ref.slice(1)))throw Error('Missing section '+ref);}
  else await access('dist/'+ref);
}
console.log('All local assets and section anchors verified.');
