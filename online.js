(()=>{if(!ACC.sb)return;const M={code:'',room:null,direct:null,host:false,uid:null,name:'',peers:[],fill:true,seat:-1};window.HOLDEM_MP=M;
const clean=x=>(x||'').replace(/[^\w ]/g,'').trim().slice(0,10)||'Player';
const roomTopic=()=>`holdem-room:${M.code}`;
function seatList(){if(!M.host)return [['You','',0,1],...BOTS].slice(0,sv.set.bots+1);return [['You','',0,1],...M.peers.map(x=>[x.name,'',0,1]),...(M.fill?BOTS:[]).slice(0,Math.max(0,3-M.peers.length))}
function attach(){if(!M.host||!P)return;M.peers.forEach((x,i)=>{if(P[i+1]){P[i+1].uid=x.uid;P[i+1].c={online:true}}})}
function snapshotFor(seat){const n=P.length,V=r=>(r-seat+n)%n,self=P[seat]?.n||M.name,hostName=M.name;let outLogs=logs.map(t=>String(t).replace(/\bYou\b/g,hostName));const re=new RegExp('\\b'+self.replace(/[^\w ]/g,'\\$&')+'\\b','g');outLogs=outLogs.map(t=>t.replace(re,'You'));return{P:P.map((_,v)=>{const p=P[(v+seat)%n],show=v===0||(reveal&&!p.fold&&!p.out);return{n:v===0?'You':p.n==='You'?hostName:p.n,sty:p.sty,q:p.q,chips:p.chips,bet:p.bet,tot:p.tot,fold:p.fold,all:p.all,out:p.out,h:show?p.h:p.h.map(()=>0),sc:reveal?p.sc:null}}),board,cur:cur<0?-1:V(cur),dealer:V(dealer),curBet,minRaise,done,reveal,winners:winners.map(w=>w==='You'?hostName:w===self?'You':w),logs:outLogs,SB,BB,phase,hid}}
async function sendRoom(payload){if(M.room)await M.room.send({type:'broadcast',event:'game',payload})}
async function sync(){if(!M.host||!P)return;for(const peer of M.peers){const seat=P.findIndex(x=>x.uid===peer.uid),ch=M.directMap?.get(peer.uid);if(seat>0&&ch)await ch.send({type:'broadcast',event:'state',payload:{kind:'state',state:snapshotFor(seat)}})}}
const baseRender=window.render,baseAct=window.act,baseNew=window.newGame;window.render=function(){baseRender();if(M.host&&M.room)sync().catch(()=>{})};window.seatList=seatList;window.attach=attach;window.act=function(i,t,a){if(!M.host&&M.room){if(i===0)sendRoom({kind:'act',uid:M.uid,t,amt:a}).catch(()=>toast('Action failed'));return}baseAct(i,t,a)};
window.applySnap=function(s){P=s.P;board=s.board;cur=s.cur;dealer=s.dealer;curBet=s.curBet;minRaise=s.minRaise;done=s.done;reveal=s.reveal;winners=s.winners;logs=s.logs;SB=s.SB;BB=s.BB;phase=s.phase;hid=s.hid;document.getElementById('ov').hidden=true;render()};
async function subscribeRoom(){
 M.room=ACC.sb.channel(roomTopic(),{config:{private:true,presence:{key:M.uid}}});
 M.room.on('broadcast',{event:'game'},({payload})=>{
  if(payload?.kind==='join'&&M.host){
   if(M.peers.length>=3)return;
   let name=clean(payload.name),taken=new Set([M.name,'Ada','Bruno','Chen',...M.peers.map(x=>x.name)]),k=0;
   while(taken.has(name))name=(name.slice(0,8)+(++k)).slice(0,10);
   const peer={uid:payload.uid,name};M.peers.push(peer);
   ensureDirect(peer.uid).then(()=>sendDirect(peer.uid,{kind:'joined',seat:M.peers.length,name})).catch(()=>{});
   renderLobby();
  } else if(payload?.kind==='act'&&M.host&&P){
   const i=P.findIndex(x=>x.uid===payload.uid);if(i>0)baseAct(i,payload.t,payload.amt);
  }
 }).on('presence',{event:'leave'},({key})=>{
  if(!M.host||!P)return;const peer=M.peers.find(x=>x.uid===key);if(!peer)return;
  M.peers=M.peers.filter(x=>x.uid!==key);const i=P.findIndex(x=>x.uid===key);
  if(i>0){P[i].c=null;say(peer.name+' left — bot takes over');if(!done&&P[cur]===P[i])setTimeout(()=>bot(i),500)}render();
 });
 return new Promise((resolve,reject)=>{
  M.room.subscribe(async status=>{
   if(status==='SUBSCRIBED'){try{await M.room.track({uid:M.uid,name:M.name})}catch(e){}resolve()}
   else if(status==='CHANNEL_ERROR'||status==='TIMED_OUT')reject(new Error(status));
  });
 });
}
async function ensureDirect(uid){M.directMap=M.directMap||new Map();if(M.directMap.has(uid))return M.directMap.get(uid);const ch=ACC.sb.channel('holdem-private:'+M.code+':'+uid,{config:{private:true}});M.directMap.set(uid,ch);await new Promise((res,rej)=>{ch.subscribe(status=>{if(status==='SUBSCRIBED')res();else if(status==='CHANNEL_ERROR'||status==='TIMED_OUT')rej(new Error(status))})});ch.on('broadcast',{event:'state'},({payload})=>{if(payload?.target&&payload.target!==M.uid)return;if(payload?.kind==='joined'){M.seat=payload.seat;M.name=payload.name;scr('wait')}if(payload?.kind==='state'&&payload.state)applySnap(payload.state)});return ch}
window.netHost=async()=>{if(!ACC.user)return toast('Sign in before creating a table');M.uid=ACC.user.id;M.name=clean(document.getElementById('nm')?.value||sv.name||ACC.user.user_metadata?.display_name);sv.name=M.name;M.code=Math.random().toString(36).slice(2,7).toUpperCase();M.host=true;M.peers=[];M.directMap=new Map();NET.name=M.name;NET.code=M.code;NET.host=true;try{await subscribeRoom();scr('lobby')}catch(e){leave();toast('Could not connect to online play')}};
window.netJoin=async()=>{if(!ACC.user)return toast('Sign in before joining a table');const code=(document.getElementById('jc')?.value||'').replace(/[^a-z0-9]/gi,'').toUpperCase();if(code.length!==5)return toast('Enter the 5-character code');M.uid=ACC.user.id;M.name=clean(document.getElementById('nm')?.value||sv.name||ACC.user.user_metadata?.display_name);M.code=code;M.host=false;M.directMap=new Map();NET.name=M.name;NET.code=code;NET.host=false;NET.c={online:true};try{await subscribeRoom();await ensureDirect(M.uid);await sendRoom({kind:'join',uid:M.uid,name:M.name});scr('wait')}catch(e){leave();toast('Table not found or online service unavailable')}};
window.netStart=async fill=>{if(!M.host||!M.room)return;if(!fill&&!M.peers.length)return toast('Need at least one other player');M.fill=fill;NET.on=true;NET.host=true;baseNew();document.getElementById('ov').hidden=true;render();await sync()};
window.leave=async()=>{try{await M.room?.untrack()}catch(e){}try{if(M.room)await ACC.sb.removeChannel(M.room)}catch(e){}try{for(const ch of M.directMap?.values()||[])await ACC.sb.removeChannel(ch)}catch(e){}M.room=null;M.directMap=new Map();M.code='';M.peers=[];M.host=false;NET.on=false;NET.host=false;NET.c=null;NET.peers=[];P=null;hid++;scr('menu')};
function renderLobby(){const c=document.getElementById('ovc');c.innerHTML='<h2>Your table</h2><div class="code">'+M.code+'</div><p class="note">Share this code with friends. Everyone needs an account.</p>'+[M.name,...M.peers.map(x=>x.name)].map((x,i)=>'<div class="ach"><span>'+x+'</span><span class="tag">'+(i?'Joined':'Host')+'</span></div>').join('')+'<div class="mm"><button class="p" onclick="netStart(true)">Start, fill with bots</button><button onclick="netStart(false)">Start humans only</button><button onclick="leave()">Close table</button></div>';document.getElementById('ov').hidden=false}
const baseScr=window.scr;window.scr=function(n){if(n==='lobby')return renderLobby();if(n==='wait'){const c=document.getElementById('ovc');c.innerHTML='<h2>Joined</h2><p class="note">Waiting for the host to start…</p><button onclick="leave()">Leave</button>';document.getElementById('ov').hidden=false;return}if(n==='online'&&!ACC.user)return baseScr('acct');return baseScr(n)};
})();