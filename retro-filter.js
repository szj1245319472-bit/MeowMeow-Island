// A static full-page CRT treatment; artwork originals remain untouched on disk.
export function createRetroFilter(panelContent) {
  const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');
  svg.setAttribute('width','0');svg.setAttribute('height','0');svg.setAttribute('aria-hidden','true');
  svg.style.cssText='position:absolute;pointer-events:none;overflow:hidden';
  const filter=document.createElementNS(ns,'filter');filter.id='retro-color-steps';
  filter.setAttribute('color-interpolation-filters','sRGB');
  const transfer=document.createElementNS(ns,'feComponentTransfer');
  for(const channel of ['R','G','B']){
    const fn=document.createElementNS(ns,'feFunc'+channel);fn.setAttribute('type','discrete');
    fn.setAttribute('tableValues',Array.from({length:64},(_,i)=>(i/63).toFixed(5)).join(' '));transfer.append(fn);
  }
  filter.append(transfer);svg.append(filter);document.body.append(svg);
  let enabled=false,detailMode=false;const images=new WeakMap();
  function applyImage(img){
    let entry=images.get(img);
    if(!entry){
      entry={original:img.getAttribute('src'),low:null};images.set(img,entry);
      img.addEventListener('load',()=>applyImage(img));
    }
    const filtered=enabled&&!detailMode;
    if(filtered&&!entry.low&&img.complete&&img.naturalWidth){
      const limit=360;
      const scale=Math.min(1,limit/Math.max(img.naturalWidth,img.naturalHeight));
      const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(img.naturalWidth*scale));canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));
      const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0,canvas.width,canvas.height);
      entry.low=canvas.toDataURL('image/png');
    }
    const src=filtered&&entry.low?entry.low:entry.original;
    if(img.getAttribute('src')!==src)img.setAttribute('src',src);
  }
  const refresh=()=>panelContent.querySelectorAll('img').forEach(applyImage);
  new MutationObserver(refresh).observe(panelContent,{childList:true,subtree:true});
  return {
    setEnabled(value){enabled=value;document.body.classList.toggle('retro-filter',enabled);refresh();},
    // Detail viewing is an exemption, not a change to the visitor's preference.
    setDetailMode(value){detailMode=value;panelContent.closest('dialog').classList.toggle('media-original',value);refresh();},
    get enabled(){return enabled;},get detailMode(){return detailMode;}
  };
}
