(() => {
  const W = 13, H = 9;
  const species = [
    { name: 'Mossbit', icon: '🐸', hp: 11, atk: 3, hue: '#a6d69d', type: 'FERN' },
    { name: 'Cinderling', icon: '🦊', hp: 10, atk: 4, hue: '#f1a17f', type: 'EMBER' },
    { name: 'Murkfin', icon: '🐟', hp: 13, atk: 3, hue: '#8dc9d6', type: 'TIDE' },
    { name: 'Fuzzlet', icon: '🐭', hp: 9, atk: 3, hue: '#d8b8ec', type: 'DUSK' },
    { name: 'Pebblit', icon: '🐢', hp: 15, atk: 2, hue: '#c4cc86', type: 'STONE' },
    { name: 'Glimmer', icon: '🦋', hp: 9, atk: 4, hue: '#e5c4f6', type: 'LUMEN' }
  ];
  const wildIcons = ['🦇', '🕷️', '🐍', '👾', '🦎', '🪲', '🐺', '🦂'];
  const names = ['Gloomwing', 'Weblet', 'Vinecoil', 'Nullbug', 'Skitter', 'Shardback', 'Nightpup', 'Scuttle'];
  const $ = id => document.getElementById(id);
  let state;
  let soundOn = false;
  let audio;
  const directions = { up: [0,-1], down: [0,1], left: [-1,0], right: [1,0] };

  function newGame() {
    state = { floor: 1, turn: 0, xp: 0, rank: 1, maxHp: 24, hp: 24, signals: 3, rations: 2, team: [{...species[0], hp: species[0].hp, maxHp: species[0].hp, id: 1}], enemies: [], items: [], walls: new Set(), player: {x:1,y:1}, logs: [], ended: false, bossDown: false };
    makeFloor();
    log('A faint signal pulses from below. Find the descent.');
    render();
    $('modal').classList.remove('visible');
  }
  function makeFloor() {
    state.walls = new Set(); state.enemies = []; state.items = []; state.bossDown = false;
    state.player = {x:1,y:1};
    // Leave a clear upper corridor and the final descent route open; the rest of each floor shifts.
    for (let y=1;y<H-1;y++) for (let x=1;x<W-1;x++) {
      if ((y===1 && x<=11) || (x===11 && y>=1) || (x===1 && y<=6)) continue;
      if (Math.random() < .15) state.walls.add(key(x,y));
    }
    const candidates = [[4,2],[7,2],[9,3],[3,4],[6,5],[9,6],[4,7],[7,7],[2,6],[5,3],[8,5],[10,2],[2,3],[5,6]];
    const available = candidates.filter(([x,y])=>!state.walls.has(key(x,y)) && !(x===1&&y===1));
    shuffle(available);
    const enemyCount = Math.min(3 + Math.floor(state.floor/2), 6);
    for(let i=0;i<enemyCount && i<available.length;i++) {
      const [x,y]=available[i], idx=(Math.random()*wildIcons.length)|0;
      const boss = state.floor===5 && i===0;
      const hp = (boss ? 25 : 7 + state.floor*3 + ((Math.random()*4)|0));
      state.enemies.push({x,y,hp,maxHp:hp,atk:(boss?5:2+Math.floor(state.floor/2)),name:boss?'ROOTWRAITH':names[idx],icon:boss?'👹':wildIcons[idx],boss,id:Date.now()+i});
    }
    const itemSpots=available.slice(enemyCount, enemyCount+2);
    for(const [x,y] of itemSpots) state.items.push({x,y,type:Math.random()<.58?'ration':'signal'});
    state.exit={x:11,y:7};
  }
  const key=(x,y)=>`${x},${y}`;
  function shuffle(a){for(let i=a.length-1;i>0;i--){const j=(Math.random()*(i+1))|0;[a[i],a[j]]=[a[j],a[i]]}return a}
  function inside(x,y){return x>=0&&y>=0&&x<W&&y<H}
  function enemyAt(x,y){return state.enemies.find(e=>e.x===x&&e.y===y)}
  function tileClass(x,y){if(x===0||y===0||x===W-1||y===H-1||state.walls.has(key(x,y)))return 'wall';return 'floor'}

  function render() {
    if(!state)return;
    const board=$('board'); board.innerHTML='';
    for(let y=0;y<H;y++) for(let x=0;x<W;x++) {
      const tile=document.createElement('div'); tile.className='tile '+tileClass(x,y); tile.setAttribute('role','gridcell');
      const enemy=enemyAt(x,y), item=state.items.find(i=>i.x===x&&i.y===y);
      if(x===state.exit.x&&y===state.exit.y){tile.classList.add('exit-tile');tile.title=state.floor===5?'The signal core':'Descent to the next depth';tile.innerHTML='<span class="sprite">▣</span>';}
      if(item){tile.className='tile item-tile';tile.innerHTML=`<span class="sprite">${item.type==='ration'?'✚':'✦'}</span>`;tile.title=item.type==='ration'?'Field ration':'Signal shard'}
      if(enemy){tile.className='tile enemy-tile';tile.title=`${enemy.name} · ${enemy.hp}/${enemy.maxHp} HP`;tile.innerHTML=`<span class="sprite">${enemy.icon}</span><span class="hp-pip"><i style="width:${Math.max(3,enemy.hp/enemy.maxHp*100)}%"></i></span>`}
      if(x===state.player.x&&y===state.player.y){tile.className='tile player-tile';tile.title='You';tile.innerHTML='<span class="sprite">🧑‍🚀</span>'}
      board.appendChild(tile);
    }
    $('floor-number').textContent=String(state.floor).padStart(2,'0');
    $('floor-title').innerHTML=`${['THE MOSSBOUND ARCHIVE','THE SUNKEN GALLERY','THE GLASSROOT MAZE','THE HOLLOW ORCHARD','THE SIGNAL HEART'][state.floor-1]} <span>0${state.floor}</span>`;
    $('seed').textContent=`SECTOR 0${state.floor}`;
    $('turn-counter').textContent=`TURN ${String(state.turn).padStart(3,'0')}`;
    $('coords').textContent=`X ${String(state.player.x).padStart(2,'0')} · Y ${String(state.player.y).padStart(2,'0')}`;
    $('hp-text').textContent=`${state.hp} / ${state.maxHp}`;
    $('hp-bar').style.width=`${Math.max(0,state.hp/state.maxHp*100)}%`;
    $('hp-bar').style.background=state.hp/state.maxHp<.3?'linear-gradient(90deg,#ff756b,#dc5558)':'linear-gradient(90deg,#c8ed98,#92dda9)';
    $('signal-count').textContent=state.signals;
    $('ration-count').textContent=`×${state.rations}`;
    $('rank').textContent=String(state.rank).padStart(2,'0');
    $('xp-label').textContent=`${state.xp} / ${state.rank*30} XP`;
    $('team-count').textContent=`${String(state.team.length).padStart(2,'0')} / 03`;
    $('team-list').innerHTML=state.team.map(c=>`<div class="team-creature"><div class="creature-avatar" style="color:${c.hue}">${c.icon}</div><div class="creature-info"><strong>${c.name}</strong><small>${c.type} · ATK ${c.atk}</small></div><div class="creature-hp">${c.hp}/${c.maxHp}</div></div>`).join('');
    $('team-note').textContent=state.team.length===1?'Your first friend. It attacks wild creatures beside you.':`${state.team.length} signals in sync. Friends strike when wild things get close.`;
    $('log').innerHTML=state.logs.map((msg,i)=>`<div class="log-entry ${i<state.logs.length-3?'old':''}">${msg}</div>`).join('');
    $('log').scrollTop=$('log').scrollHeight;
    const close=nearestEnemy(); $('pulse-button').disabled=state.signals<1||state.team.length>=3||!close;
    $('snack-button').disabled=state.rations<1||state.hp===state.maxHp;
    $('action-hint').textContent=state.ended?'The expedition has ended.':close?`${close.name} is in range. Capture or attack!`:state.team.length>=3?'Crew full. Explore for supplies and the descent.':'Explore the ruins. Your crew attacks nearby wild things.';
  }
  function log(text){state.logs.push(text);if(state.logs.length>22)state.logs.shift()}
  function nearestEnemy(){return state.enemies.filter(e=>Math.abs(e.x-state.player.x)+Math.abs(e.y-state.player.y)===1).sort((a,b)=>a.hp-b.hp)[0]}
  function gainXp(n){state.xp+=n;while(state.xp>=state.rank*30){state.xp-=state.rank*30;state.rank++;state.maxHp+=4;state.hp=Math.min(state.maxHp,state.hp+8);log(`RANK UP! Vitality increased. You are rank ${state.rank}.`)}}
  function move(dir){if(!state||state.ended)return;const [dx,dy]=directions[dir]||[];if(dx===undefined)return;const nx=state.player.x+dx,ny=state.player.y+dy;
    if(!inside(nx,ny)||state.walls.has(key(nx,ny))) {tone(110,.035);return}
    const enemy=enemyAt(nx,ny);
    if(enemy){attack(enemy);return}
    state.player={x:nx,y:ny};state.turn++;
    collect();
    if(nx===state.exit.x&&ny===state.exit.y){if(state.floor===5){if(!state.enemies.some(e=>e.boss)){finish(true);return}log('The descent is sealed. Defeat the Rootwraith first.')}else{nextFloor();return}}
    worldTurn();render();tone(250,.025);
  }
  function attack(enemy){const damage=2+Math.floor((state.rank-1)/2)+((Math.random()*3)|0);enemy.hp-=damage;state.turn++;log(`You strike ${enemy.name} for ${damage} damage.`);tone(180,.05);
    if(enemy.hp<=0){defeat(enemy);worldTurn();render();return}
    worldTurn();render();
  }
  function defeat(enemy){state.enemies=state.enemies.filter(e=>e!==enemy);log(`${enemy.name} retreats into the dark. +${enemy.boss?30:8} XP.`);gainXp(enemy.boss?30:8);if(enemy.boss){state.bossDown=true;log('The signal heart is clear. Reach the descent to finish the expedition.')}}
  function worldTurn(){
    if(state.ended)return;
    // Crew members chip at nearby threats after every committed move.
    for(const c of state.team){const target=state.enemies.find(e=>Math.abs(e.x-state.player.x)+Math.abs(e.y-state.player.y)===1);if(target){const dmg=c.atk+((Math.random()*2)|0);target.hp-=dmg;log(`${c.name} hits ${target.name} for ${dmg}.`);if(target.hp<=0)defeat(target)}}
    for(const e of [...state.enemies]){
      if(!state.enemies.includes(e))continue;
      const dist=Math.abs(e.x-state.player.x)+Math.abs(e.y-state.player.y);
      if(dist===1){state.hp-=e.atk;log(`${e.name} claws you for ${e.atk}.`);tone(90,.08);if(state.hp<=0){state.hp=0;finish(false);return}continue}
      if(dist<=6){const options=shuffle([[0,-1],[0,1],[-1,0],[1,0]]);for(const [dx,dy] of options){const nx=e.x+dx,ny=e.y+dy;if(inside(nx,ny)&&!state.walls.has(key(nx,ny))&&!(nx===state.player.x&&ny===state.player.y)&&!enemyAt(nx,ny)&&!(nx===state.exit.x&&ny===state.exit.y)){e.x=nx;e.y=ny;break}}}
    }
  }
  function collect(){const item=state.items.find(i=>i.x===state.player.x&&i.y===state.player.y);if(!item)return;state.items=state.items.filter(i=>i!==item);if(item.type==='ration'){state.rations++;log('Field ration secured.')}else{state.signals++;log('Signal shard recovered. +1 capture charge.')}}
  function capture(){if(state.ended)return;const enemy=nearestEnemy();if(!enemy){log('No wild signal close enough. Stand beside a creature.');render();return}if(state.signals<1){log('No capture charges. Find a signal shard.');return}if(state.team.length>=3){log('Crew is full. Your three bonds are strong.');return}state.signals--;state.turn++;const chance=enemy.hp/enemy.maxHp<=.4?.88:enemy.hp/enemy.maxHp<=.7?.54:.22;
    if(Math.random()<chance){const s=species[Math.floor(Math.random()*species.length)];const c={...s,hp:s.hp,maxHp:s.hp,id:Date.now()};state.team.push(c);state.enemies=state.enemies.filter(e=>e!==enemy);log(`${enemy.name} trusts your signal. ${c.name} joined the crew!`);gainXp(5);tone(520,.12);worldTurn()}else{log(`${enemy.name} resisted the pulse! Weaken it first.`);worldTurn()}
    render();
  }
  function ration(){if(state.ended||state.rations<1||state.hp===state.maxHp)return;state.rations--;const heal=Math.min(10,state.maxHp-state.hp);state.hp+=heal;for(const c of state.team)c.hp=Math.min(c.maxHp,c.hp+4);state.turn++;log(`Field ration restored ${heal} vitality. Crew recovered.`);worldTurn();render()}
  function nextFloor(){state.floor++;state.hp=Math.min(state.maxHp,state.hp+6);state.signals=Math.min(5,state.signals+1);makeFloor();log(`Depth 0${state.floor}. Your crew catches its breath. +6 vitality, +1 charge.`);render();window.scrollTo({top:0,behavior:'smooth'})}
  function finish(win){state.ended=true;render();const card=document.querySelector('.modal-card');card.classList.toggle('result',win);$('modal-title').innerHTML=win?'THE SIGNAL<br><em>IS YOURS.</em>':'THE DARK<br><em>CLAIMS YOU.</em>';$('start-button').innerHTML=win?'DESCEND AGAIN <span>↗</span>':'TRY ANOTHER RUN <span>↗</span>';document.querySelector('.modal-copy').textContent=win?`You reached the heart of the Underwild with ${state.team.length} creature${state.team.length===1?'':'s'} by your side. The world below is listening.`:`You reached depth ${String(state.floor).padStart(2,'0')} and earned rank ${state.rank}. The Underwild will be here when you're ready.`;document.querySelector('.howto').innerHTML=`<span>DEPTH <b>0${state.floor}</b></span><span>CREW <b>${state.team.length}</b></span><span>RANK <b>${state.rank}</b></span>`;$('modal').classList.add('visible')}
  function tone(freq,duration){if(!soundOn)return;try{audio=audio||new (window.AudioContext||window.webkitAudioContext)();const o=audio.createOscillator(),g=audio.createGain();o.frequency.value=freq;o.type='sine';g.gain.value=.035;o.connect(g);g.connect(audio.destination);o.start();g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);o.stop(audio.currentTime+duration)}catch(_){}}

  $('start-button').addEventListener('click',newGame);
  $('pulse-button').addEventListener('click',capture);
  $('snack-button').addEventListener('click',ration);
  $('sound-button').addEventListener('click',()=>{soundOn=!soundOn;$('sound-button').classList.toggle('sound-on',soundOn);tone(440,.08)});
  document.querySelectorAll('[data-move]').forEach(btn=>btn.addEventListener('click',()=>move(btn.dataset.move)));
  document.addEventListener('keydown',e=>{if($('modal').classList.contains('visible')&&!state.ended)return;const map={ArrowUp:'up',w:'up',W:'up',ArrowDown:'down',s:'down',S:'down',ArrowLeft:'left',a:'left',A:'left',ArrowRight:'right',d:'right',D:'right'};if(map[e.key]){e.preventDefault();move(map[e.key])}else if(e.code==='Space'){e.preventDefault();capture()}});
  // Initial scenic board behind the welcome card.
  state={floor:1,turn:0,xp:0,rank:1,maxHp:24,hp:24,signals:3,rations:2,team:[{...species[0],hp:species[0].hp,maxHp:species[0].hp}],enemies:[],items:[],walls:new Set(),player:{x:1,y:1},logs:[],ended:false};makeFloor();render();
})();
