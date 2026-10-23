export function createDesktopUI(open,t){
 const tools=document.querySelector('.tools'),taskbar=document.querySelector('#desktop-taskbar');
 taskbar.insertBefore(tools,document.querySelector('#desktop-clock'));
 const start=document.querySelector('#desktop-start'),menu=document.querySelector('#start-menu');
 const controlPanel=document.createElement('div');controlPanel.className='start-control-panel';
 controlPanel.innerHTML='<div class="start-section-title"></div>';
 for(const button of [...tools.querySelectorAll('button')])if(button.id!=='bgm')controlPanel.append(button);
 menu.querySelector('.start-items').append(controlPanel);
 function closeMenu(){menu.hidden=true;start.setAttribute('aria-expanded','false');}
 start.onclick=()=>{menu.hidden=!menu.hidden;start.setAttribute('aria-expanded',String(!menu.hidden));if(!menu.hidden)menu.querySelector('button').focus();};
 menu.addEventListener('click',e=>{const button=e.target.closest('[data-launch]');if(button){closeMenu();open(button.dataset.launch);}});
 document.addEventListener('pointerdown',e=>{if(!menu.contains(e.target)&&!start.contains(e.target))closeMenu();});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden){closeMenu();start.focus();e.preventDefault();}});
 function windowTitle(){
   const heading=document.querySelector('#panel-title');
   document.querySelector('#window-title').textContent=(heading?.textContent||'ATARO')+' — Portfolio Explorer';
   document.querySelector('#window-address').textContent='C:\\ATARO\\'+(heading?.textContent||'Portfolio');
 }
 new MutationObserver(windowTitle).observe(document.querySelector('#panel-content'),{childList:true});
 function clock(){document.querySelector('#desktop-clock').textContent=new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});}clock();setInterval(clock,30000);
 return {refresh(){
   document.querySelector('#desktop-start-label').textContent=t('开始','Start');
   document.querySelector('[data-launch="all"]').textContent=t('作品文件夹','Portfolio folders');
   document.querySelector('[data-launch="about"]').textContent=t('个人资料','My profile');
   document.querySelector('[data-launch="contact"]').textContent=t('联系我','Contact');
   document.querySelector('#start-blinds').textContent=t('百叶窗 · 开关','Blinds · toggle');
   document.querySelector('[data-launch="bgm"]').textContent=t('开启 / 关闭环境声','Toggle ambience');
   controlPanel.querySelector('.start-section-title').textContent=t('控制面板','Control panel');
   document.querySelector('#desktop-session').textContent=t('我的工作室','My studio');
   windowTitle();
 }};
}
