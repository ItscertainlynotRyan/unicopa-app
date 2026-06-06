const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'app', 'assets', 'data', 'copaData.json');
let s = fs.readFileSync(file, 'utf8');
const map = [
  ['Ã¡','á'],['Ã©','é'],['Ãª','ê'],['Ã£','ã'],['Ãµ','õ'],['Ã§','ç'],['Ãº','ú'],['Ã­','í'],['Ã³','ó'],['Ã´','ô'],['Ã¼','ü'],
  ['Ã‰','É'],['Ã','Á'],['Ã“','Ó'],['Ãš','Ú'],['Ã‡','Ç'],
  ['Ãº','ú'],['Ã¨','è'],['Ã‰','É'],
  ['Ãfrica','África'],['Ãustria','Áustria'],
  ['MÃ©xico','México'],['CuraÃ§ao','Curaçao'],['TchÃ©quia','Tchéquia'],
  ['SuÃ­Ã§a','Suíça'],['SuÃ©cia','Suécia'],['FranÃ§a','França'],['BÃ©lgica','Bélgica'],['BÃ³snia','Bósnia'],
  ['FiladÃ©lfia','Filadélfia'],['Nova ZelÃ¢ndia','Nova Zelândia'],['ArgÃ©lia','Argélia'],['PanamÃ¡','Panamá'],
  ['IrÃ£','Irã'],['CroÃ¡cia','Croácia'],['UzbequistÃ£o','Uzbequistão'],['ColÃ´mbia','Colômbia'],
  ['TunÃ­sia','Tunísia'],['ArÃ¡bia','Arábia'],['pÃºblico','público'],['protÃ³tipo','protótipo'],['Âº','º']
];
map.forEach(([bad,good])=>{
  s = s.split(bad).join(good);
});
fs.writeFileSync(file, s, 'utf8');
console.log('Applied replacements to', file);
