// Procedural room ambience: filtered stereo rain, mechanical keys and distant traffic.
// No recording, music file or network request is needed.
export function createRoomSound(context, destination=context.destination) {
  const master=context.createGain();master.gain.value=0;master.connect(destination);
  // Interaction sounds remain clear above the deliberately quiet rain bed.
  const effects=context.createGain();effects.gain.value=0;effects.connect(destination);
  const noise=context.createBuffer(2,context.sampleRate*8,context.sampleRate);
  for(let ch=0;ch<2;ch++){
    const samples=noise.getChannelData(ch),fade=Math.floor(context.sampleRate*.05);
    const raw=new Float32Array(samples.length+fade);let brown=0;
    for(let i=0;i<raw.length;i++){const white=Math.random()*2-1;brown=(brown+.025*white)/1.025;raw[i]=brown*2.6+white*.15;}
    samples.set(raw.subarray(0,samples.length));
    // Continue the tail through the start, then crossfade into the original head.
    for(let i=0;i<fade;i++){const a=i/fade;samples[i]=raw[samples.length+i]*(1-a)+raw[i]*a;}
  }
  const rain=context.createBufferSource();rain.buffer=noise;rain.loop=true;
  const low=context.createBiquadFilter();low.type='lowpass';low.frequency.value=3900;low.Q.value=.5;
  const high=context.createBiquadFilter();high.type='highpass';high.frequency.value=110;
  const rainGain=context.createGain();rainGain.gain.value=.65;
  rain.connect(high).connect(low).connect(rainGain).connect(master);rain.start();
  const click=context.createBuffer(1,context.sampleRate*.08,context.sampleRate);
  const data=click.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*Math.exp(-i/(context.sampleRate*.009));
  function key(at=context.currentTime,side=0){
    const source=context.createBufferSource();source.buffer=click;source.playbackRate.value=.8+Math.random()*.4;
    const filter=context.createBiquadFilter();filter.type='bandpass';filter.frequency.value=1700+Math.random()*800;filter.Q.value=.7;
    const gain=context.createGain();gain.gain.value=.20+Math.random()*.07;
    const pan=context.createStereoPanner();pan.pan.value=side*.18;
    source.connect(filter).connect(gain).connect(pan).connect(master);
    const thock=context.createOscillator();thock.type='triangle';thock.frequency.setValueAtTime(220+Math.random()*65,at);thock.frequency.exponentialRampToValueAtTime(110,at+.035);
    const body=context.createGain();body.gain.setValueAtTime(0,at);body.gain.linearRampToValueAtTime(.075,at+.002);body.gain.exponentialRampToValueAtTime(.0001,at+.055);
    thock.connect(body).connect(pan);source.start(at);thock.start(at);thock.stop(at+.06);
    source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};
    thock.onended=()=>{thock.disconnect();body.disconnect();setTimeout(()=>pan.disconnect(),100);};
  }
  function horn(at=context.currentTime){
    // A quiet two-tone car horn, softened by distance and the closed window.
    const gain=context.createGain(),filter=context.createBiquadFilter(),pan=context.createStereoPanner();
    filter.type='lowpass';filter.frequency.value=950;filter.Q.value=.4;
    const duration=.65+Math.random()*.35;
    gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(.019,at+.14);gain.gain.setValueAtTime(.019,at+duration*.65);gain.gain.linearRampToValueAtTime(0,at+duration);
    pan.pan.setValueAtTime(-.55,at);pan.pan.linearRampToValueAtTime(.12,at+duration);
    gain.connect(filter).connect(pan).connect(master);
    let finished=0;
    for(const frequency of [349,440]){const tone=context.createOscillator();tone.type='sawtooth';tone.frequency.setValueAtTime(frequency,at);tone.frequency.linearRampToValueAtTime(frequency*.982,at+duration);tone.connect(gain);tone.start(at);tone.stop(at+duration+.02);tone.onended=()=>{tone.disconnect();if(++finished===2){gain.disconnect();filter.disconnect();pan.disconnect();}};}
  }
  function meow(at=context.currentTime){
    // A short, bright low-poly meow: downward then upward pitch with light vibrato.
    const duration=.46,voice=context.createGain(),filter=context.createBiquadFilter(),pan=context.createStereoPanner();
    filter.type='bandpass';filter.frequency.value=1250;filter.Q.value=.45;pan.pan.value=(Math.random()-.5)*.16;
    voice.gain.setValueAtTime(.0001,at);voice.gain.linearRampToValueAtTime(.16,at+.045);voice.gain.setValueAtTime(.105,at+.27);voice.gain.exponentialRampToValueAtTime(.0001,at+duration);
    voice.connect(filter).connect(pan).connect(effects);
    const tone=context.createOscillator(),vibrato=context.createOscillator(),depth=context.createGain(),overtone=context.createOscillator(),bright=context.createGain();
    tone.type='triangle';tone.frequency.setValueAtTime(700,at);tone.frequency.exponentialRampToValueAtTime(430,at+.16);tone.frequency.exponentialRampToValueAtTime(610,at+.39);
    vibrato.type='sine';vibrato.frequency.value=7.4;depth.gain.value=15;vibrato.connect(depth).connect(tone.frequency);tone.connect(voice);
    overtone.type='sine';overtone.frequency.setValueAtTime(1400,at);overtone.frequency.exponentialRampToValueAtTime(860,at+.16);overtone.frequency.exponentialRampToValueAtTime(1220,at+.39);bright.gain.value=.24;overtone.connect(bright).connect(voice);
    tone.start(at);overtone.start(at);vibrato.start(at);tone.stop(at+duration+.02);overtone.stop(at+duration+.02);vibrato.stop(at+duration+.02);
    tone.onended=()=>{tone.disconnect();overtone.disconnect();vibrato.disconnect();depth.disconnect();bright.disconnect();voice.disconnect();filter.disconnect();pan.disconnect();};
  }
  return {master,effects,key,horn,meow,duck(at){master.gain.cancelScheduledValues(at);master.gain.setValueAtTime(.28,at);master.gain.linearRampToValueAtTime(.22,at+.04);master.gain.setValueAtTime(.22,at+.42);master.gain.linearRampToValueAtTime(.28,at+.55);},setPlaying(playing){const now=context.currentTime;master.gain.cancelScheduledValues(now);effects.gain.cancelScheduledValues(now);master.gain.setTargetAtTime(playing?.28:0,now,playing?.14:.025);effects.gain.setTargetAtTime(playing?.78:0,now,playing?.035:.015);}};
}

export function createRoomAmbience(onState){
  let context=null,sound=null,status='waiting',desired=true,version=0;
  let hornWait=14+Math.random()*12,keyWait=0,meowCount=0,lastMeow=-Infinity;const lifted=[false,false];
  const state=()=>({status,enabled:desired,volume:.4,meows:meowCount,available:true,title:'Rainy workstation',effect:'room-ambience'});
  const publish=()=>onState(state());
  function ensureAudio(){
    if(!context){context=new (window.AudioContext||window.webkitAudioContext)();sound=createRoomSound(context);}
  }
  async function start(){
    if(!desired||document.hidden)return;
    const token=++version;
    try{
      ensureAudio();
      status=context.state==='running'?'loading':'waiting';publish();
      await context.resume();
      if(token!==version||!desired||document.hidden)return;
      sound.setPlaying(true);status='playing';publish();
    }catch(error){
      if(token!==version||!desired)return;
      // Browsers may require a user gesture; preserve the requested on state.
      status=error.name==='NotAllowedError'?'waiting':'error';publish();
    }
  }
  function toggle(){
    desired=!desired;
    if(!desired){version++;sound?.setPlaying(false);status='paused';publish();return Promise.resolve();}
    return start();
  }
  async function meow(delay=.7){
    if(!desired)return false;
    const now=performance.now();if(now-lastMeow<1500)return false;lastMeow=now;
    try{
      // Queue while still inside the click gesture. A suspended context begins
      // this note as soon as resume succeeds, instead of losing the brief meow.
      ensureAudio();const at=context.currentTime+Math.max(.08,delay);sound.meow(at);meowCount++;publish();
      await start();if(status==='playing')sound.duck(at);return status==='playing';
    }catch{return false;}
  }
  function suspend(){version++;sound?.setPlaying(false);status=desired?'waiting':'paused';publish();context?.suspend();}
  const unlock=()=>{if(desired&&status!=='playing')void start();};
  // Bubble after control handlers so an explicit mute is never undone by unlock.
  document.addEventListener('click',unlock);
  document.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')unlock();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)suspend();else if(desired)void start();});
  window.addEventListener('pagehide',suspend);
  window.addEventListener('pageshow',()=>{if(desired)void start();});
  // Defer callbacks until the scene and its controls finish initializing.
  queueMicrotask(()=>void start());
  return {toggle,meow,get state(){return state();},update(dt,kitten,reduced){
    const typing=kitten.reactionPhase==='typing'&&kitten.isTyping!==false;
    kitten.arms.forEach((arm,i)=>{const up=arm.paw.position.y>.730;if(lifted[i]&&!up&&typing&&!reduced&&status==='playing')sound.key(context.currentTime,arm.sign);lifted[i]=up;});
    if(status!=='playing')return;
    // Reduced-motion visitors still hear keys without animating the paws.
    if(reduced&&typing){keyWait-=dt;if(keyWait<=0){sound.key();keyWait=.27+Math.random()*.11;}}
    hornWait-=dt;if(hornWait<=0){sound.horn();hornWait=28+Math.random()*35;}
  }};
}
