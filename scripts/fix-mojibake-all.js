const fs = require('fs');
const path = require('path');
function walk(dir){
  const list = [];
  const entries = fs.readdirSync(dir,{withFileTypes:true});
  for(const e of entries){
    const full = path.join(dir,e.name);
    if(e.isDirectory()) list.push(...walk(full));
    else if(e.isFile() && e.name === 'copaData.json') list.push(full);
  }
  return list;
}
const root = path.join(__dirname,'..');
const files = walk(root);
console.log('Found', files.length, 'copaData.json files');
const map = [
  ['Ã¡','á'],['Ã©','é'],['Ãª','ê'],['Ã£','ã'],['Ãµ','õ'],['Ã§','ç'],['Ãº','ú'],['Ã­','í'],['Ã³','ó'],['Ã´','ô'],['Ã¼','ü'],
  ['Ã‰','É'],['Ã','Á'],['Ã“','Ó'],['Ãš','Ú'],['Ã‡','Ç'],
  ['MÃ©xico','México'],['CuraÃ§ao','Curaçao'],['TchÃ©quia','Tchéquia'],['SuÃ­Ã§a','Suíça'],['SuÃ©cia','Suécia'],
  ['FranÃ§a','França'],['BÃ©lgica','Bélgica'],['BÃ³snia','Bósnia'],['FiladÃ©lfia','Filadélfia'],['Nova ZelÃ¢ndia','Nova Zelândia'],
  ['ArgÃ©lia','Argélia'],['PanamÃ¡','Panamá'],['IrÃ£','Irã'],['CroÃ¡cia','Croácia'],['UzbequistÃ£o','Uzbequistão'],['ColÃ´mbia','Colômbia'],
  ['TunÃ­sia','Tunísia'],['ArÃ¡bia','Arábia'],['pÃºblico','público'],['protÃ³tipo','protótipo'],['Âº','º']
];
for(const f of files){
  let s = fs.readFileSync(f,'utf8');
  map.forEach(([bad,good])=>{ s = s.split(bad).join(good); });
  fs.writeFileSync(f,s,'utf8');
  console.log('Fixed', f);
}
