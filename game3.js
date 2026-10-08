window.ACC=window.ACC||{sb:null,user:null};
const BOTS=[['Ada','Tight',.08,.8],['Bruno','Calling station',-.1,.3],['Chen','Maniac',-.05,1.6]];
const ACH={win:['First blood','Win a hand'],reg:['Regular','Win 10 hands'],big:['Whale','Win a pot of 800 or more'],str:['Strong hand','Win a showdown with a straight or better'],clean:['Table cleared','Knock out every bot'],streak3:['Hot streak','Win 3 hands in a row'],boat:['Full house','Win a showdown with a full house or better'],rich:['High roller','Finish a hand with 3000+ chips']};
const TIPS=['Position matters: acting last is a real edge.','Fold more often than you think.','Pot odds: call only when the price is right.','Calling stations rarely bluff. Value bet them.','Maniacs will pay you off. Let them bet.'];
const SHOP=[
{id:'f0',t:'felt',n:'Classic teal',p:0,v:['#1b4a53','#14363d']},{id:'f1',t:'felt',n:'Crimson room',p:150,v:['#6a2330','#451520']},
{id:'f2',t:'felt',n:'Midnight',p:150,v:['#26335f','#161d3b']},{id:'f3',t:'felt',n:'Emerald',p:200,v:['#1f6b45','#134a2e']},{id:'f4',t:'felt',n:'Violet',p:250,v:['#4d2f73','#2e1b47']},
{id:'b0',t:'back',n:'Oxblood',p:0,v:'repeating-linear-gradient(45deg,#7a2630,#7a2630 4px,#5c1b24 4px,#5c1b24 8px)'},
{id:'b1',t:'back',n:'Navy dots',p:100,v:'radial-gradient(#6f8fd8 22%,#1a2a55 24%) 0 0/8px 8px'},
{id:'b2',t:'back',n:'Gold stripe',p:200,v:'repeating-linear-gradient(90deg,#c9a45c,#c9a45c 3px,#8a6b2c 3px,#8a6b2c 6px)'},
{id:'b3',t:'back',n:'Checker',p:200,v:'repeating-conic-gradient(#222 0 25%,#ddd 0 50%) 0 0/12px 12px'},
{id:'k0',t:'face',n:'Classic faces',p:0,v:{card:'#f7f3ea',c:['#1a1a1a','#b3342f','#b3342f','#1a1a1a']}},
{id:'k1',t:'face',n:'Four colours',p:250,v:{card:'#f7f3ea',c:['#1a1a1a','#b3342f','#1f5fbf','#1f7a3a']}},
{id:'k2',t:'face',n:'Night cards',p:200,v:{card:'#1d2430',c:['#e8e4d8','#ff7b72','#ff7b72','#e8e4d8']}},
{id:'rebuy',t:'perk',n:'Rebuy token',p:60,d:'Return with a fresh stack after busting. Stackable.'},
{id:'stack',t:'perk',n:'Deep stack',p:400,d:'Start each game with 500 extra chips. One-time.'}];
function toast(t){const e=document.getElementById('toast');e.textContent=t;e.className='show';clearTimeout(window.__toast);window.__toast=setTimeout(()=>e.className='',2600)}
function unlock(id){if(sv.ach.includes(id))return;sv.ach.push(id);sv.coins+=50;save();toast('Achievement: '+ACH[id][0]+' +50 coins')}
function theme(){const g=t=>SHOP.find(x=>x.id==sv.eq[t]),st=document.documentElement.style;st.setProperty('--f1',g('felt').v[0]);st.setProperty('--f2',g('felt').v[1]);st.setProperty('--back',g('back').v);const f=g('face').v;st.setProperty('--card',f.card);f.c.forEach((k,i)=>st.setProperty('--c'+i,k))}
function buy(id){const it=SHOP.find(x=>x.id==id);if(sv.coins<it.p)return toast('Not enough coins');sv.coins-=it.p;if(it.t=='perk'){if(id=='rebuy')sv.perks.rebuy++;else if(!sv.own.includes(id))sv.own.push(id)}else{if(!sv.own.includes(id))sv.own.push(id);sv.eq[it.t]=id;theme()}save();toast('Bought '+it.n);scr('shop')}
function equip(id){const it=SHOP.find(x=>x.id==id);if(!it)return;sv.eq[it.t]=id;theme();save();scr('shop')}
function rebuy(){if(!sv.perks.rebuy)return toast('No rebuy tokens');sv.perks.rebuy--;save();P[0].out=false;P[0].chips=sv.set.chips;hand()}
function play(){document.getElementById('ov').hidden=true;if(!P)newGame()}
function seatList(){return [['You','',0,1],...BOTS].slice(0,sv.set.bots+1)}
function attach(){}
const baseScr=window.scr;
window.scr=function(n){const o=document.getElementById('ov'),c=document.getElementById('ovc'),coin='<div class="coin">'+sv.coins+' coins</div>';if(n==='acct'||n==='online'||n==='lobby'||n==='wait')return baseScr(n);if(n==='load'||n==='menu'||n==='shop'||n==='set'||n==='stats'||n==='ach')return baseScr(n);o.hidden=false;c.innerHTML='<h2>Hold\'em</h2><p class="note">Screen unavailable</p><button onclick="scr(\'menu\')">Back</button>'};
window.render = window.render || (()=>{});
theme();setb();window.scr('load');setTimeout(()=>window.scr('menu'),2200);