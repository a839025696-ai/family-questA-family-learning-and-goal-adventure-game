(() => {
  'use strict';

  const world = document.querySelector('.world');
  if (!world || world.querySelector('.lv-atmosphere')) return;

  const layer = document.createElement('div');
  layer.className = 'lv-atmosphere';
  layer.setAttribute('aria-hidden', 'true');
  layer.innerHTML = `
    <span class="lv-cloud lv-cloud-a"></span>
    <span class="lv-cloud lv-cloud-b"></span>
    <span class="lv-mountains"></span>
    <span class="lv-foreground"></span>
  `;
  world.prepend(layer);

  const style = document.createElement('style');
  style.id = 'lifeverse-anime-atmosphere-v1';
  style.textContent = `
    .lv-atmosphere,.lv-atmosphere span{position:absolute;pointer-events:none}
    .lv-atmosphere{inset:0;z-index:1;overflow:hidden;border-radius:inherit}
    .lv-cloud{width:130px;height:34px;border-radius:999px;background:rgba(255,255,255,.7);filter:blur(.2px);box-shadow:34px -12px 0 7px rgba(255,255,255,.62),72px 2px 0 2px rgba(255,255,255,.58);animation:lvCloudDrift 24s linear infinite}
    .lv-cloud-a{top:13%;left:-150px}.lv-cloud-b{top:29%;left:-190px;transform:scale(.72);opacity:.66;animation-duration:31s;animation-delay:-13s}
    .lv-mountains{left:-5%;right:-5%;bottom:23%;height:37%;opacity:.46;background:linear-gradient(145deg,transparent 0 18%,#a8cbea 18.4% 36%,transparent 36.4%),linear-gradient(215deg,transparent 0 24%,#91b8dc 24.4% 44%,transparent 44.4%),linear-gradient(155deg,transparent 0 39%,#bad9ee 39.4% 56%,transparent 56.4%);filter:drop-shadow(0 8px 8px rgba(74,118,158,.08))}
    .lv-foreground{left:-3%;right:-3%;bottom:-5%;height:23%;background:radial-gradient(ellipse at 8% 100%,#4eaf78 0 15%,transparent 15.5%),radial-gradient(ellipse at 27% 105%,#63bd79 0 18%,transparent 18.5%),radial-gradient(ellipse at 70% 108%,#4fac70 0 21%,transparent 21.5%),radial-gradient(ellipse at 93% 105%,#6bc47f 0 18%,transparent 18.5%);opacity:.72;filter:drop-shadow(0 -5px 10px rgba(52,125,80,.08))}
    @keyframes lvCloudDrift{from{translate:0 0}to{translate:calc(100vw + 380px) 0}}
    @media(max-width:760px){.lv-cloud{width:90px;height:25px;box-shadow:25px -9px 0 5px rgba(255,255,255,.58),52px 2px 0 1px rgba(255,255,255,.54);animation-duration:29s}.lv-mountains{bottom:24%;height:31%;opacity:.35}.lv-foreground{height:18%;opacity:.58}}
    @media(prefers-reduced-motion:reduce){.lv-cloud{animation:none}.lv-cloud-a{left:68%}.lv-cloud-b{left:18%}}
  `;
  document.head.appendChild(style);
  document.documentElement.dataset.animeAtmosphere = 'layered-v1';
})();
