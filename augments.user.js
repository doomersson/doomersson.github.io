// ==UserScript==
// @name         Tanki Online — Restore old augment icons
// @namespace    local.tanki.old-augment-icons
// @version      1
// @description  Replaces current hull and turret augment SVGs with their matched older versions.
// @match        *://*.3dtank.com/play*
// @match        *://*.tankionline.com/play*
// @match        *://*.test-eu.tankionline.com/browser-public/index.html*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(() => {
  'use strict';

  // Set localStorage['tanki-old-augment-icons'] to 'off' and reload to disable.
  try {
    if (localStorage.getItem('tanki-old-augment-icons') === 'off') return;
  } catch (_) {
    // Continue when storage is unavailable.
  }

  // Stable asset path -> old CDN URL. The changing version directory is omitted
  // from each key, so future versions of the same SVG are also recognized.
  const OLD_BY_ASSET = Object.freeze({
  "/606/71607/37/10/image.svg": "https://s.eu.tankionline.com/606/71607/37/10/30316341620052/image.svg",
  "/607/52626/355/111/image.svg": "https://s.eu.tankionline.com/607/52626/355/111/30352545567167/image.svg",
  "/625/153441/322/26/image.svg": "https://s.eu.tankionline.com/625/153441/322/26/31302761760227/image.svg",
  "/607/52626/353/345/image.svg": "https://s.eu.tankionline.com/607/52626/353/345/30352545566421/image.svg",
  "/607/52626/360/43/image.svg": "https://s.eu.tankionline.com/607/52626/360/43/30352545570515/image.svg",
  "/607/52626/356/271/image.svg": "https://s.eu.tankionline.com/607/52626/356/271/30352545567753/image.svg",
  "/626/14776/162/300/image.svg": "https://s.eu.tankionline.com/626/14776/162/300/31303177563156/image.svg",
  "/605/115405/222/233/image.svg": "https://s.eu.tankionline.com/605/115405/222/233/30263301311613/image.svg",
  "/605/115405/217/1/image.svg": "https://s.eu.tankionline.com/605/115405/217/1/30263301307766/image.svg",
  "/605/115405/221/162/image.svg": "https://s.eu.tankionline.com/605/115405/221/162/30263301311145/image.svg",
  "/605/115405/230/162/image.svg": "https://s.eu.tankionline.com/605/115405/230/162/30263301314555/image.svg",
  "/605/115405/215/334/image.svg": "https://s.eu.tankionline.com/605/115405/215/334/30263301307312/image.svg",
  "/605/115405/226/26/image.svg": "https://s.eu.tankionline.com/605/115405/226/26/30263301313416/image.svg",
  "/607/52626/352/170/image.svg": "https://s.eu.tankionline.com/607/52626/352/170/30352545565660/image.svg",
  "/605/115405/223/302/image.svg": "https://s.eu.tankionline.com/605/115405/223/302/30263301312266/image.svg",
  "/605/115405/220/55/image.svg": "https://s.eu.tankionline.com/605/115405/220/55/30263301310460/image.svg",
  "/605/115405/227/110/image.svg": "https://s.eu.tankionline.com/605/115405/227/110/30274277645715/image.svg",
  "/605/115405/224/357/image.svg": "https://s.eu.tankionline.com/605/115405/224/357/30274277535653/image.svg",
  "/606/71577/330/247/image.svg": "https://s.eu.tankionline.com/606/71577/330/247/30316337754712/image.svg",
  "/607/52626/346/113/image.svg": "https://s.eu.tankionline.com/607/52626/346/113/30352545563570/image.svg",
  "/625/153433/270/213/image.svg": "https://s.eu.tankionline.com/625/153433/270/213/31272707020417/image.svg",
  "/607/52626/344/341/image.svg": "https://s.eu.tankionline.com/607/52626/344/341/30352545563023/image.svg",
  "/607/52626/351/13/image.svg": "https://s.eu.tankionline.com/607/52626/351/13/30352545565073/image.svg",
  "/607/52626/347/254/image.svg": "https://s.eu.tankionline.com/607/52626/347/254/30352545564332/image.svg",
  "/626/14763/0/105/image.svg": "https://s.eu.tankionline.com/626/14763/0/105/31303174636476/image.svg",
  "/605/115404/255/112/image.svg": "https://s.eu.tankionline.com/605/115404/255/112/30263301127070/image.svg",
  "/605/115404/251/274/image.svg": "https://s.eu.tankionline.com/605/115404/251/274/30263301125261/image.svg",
  "/605/115404/254/37/image.svg": "https://s.eu.tankionline.com/605/115404/254/37/30263301126425/image.svg",
  "/605/115404/263/32/image.svg": "https://s.eu.tankionline.com/605/115404/263/32/30263301132023/image.svg",
  "/605/115404/250/232/image.svg": "https://s.eu.tankionline.com/605/115404/250/232/30263301124611/image.svg",
  "/605/115404/260/303/image.svg": "https://s.eu.tankionline.com/605/115404/260/303/30263301130677/image.svg",
  "/607/52626/343/154/image.svg": "https://s.eu.tankionline.com/607/52626/343/154/30352545562245/image.svg",
  "/605/115404/256/156/image.svg": "https://s.eu.tankionline.com/605/115404/256/156/30263301127546/image.svg",
  "/605/115404/252/351/image.svg": "https://s.eu.tankionline.com/605/115404/252/351/30263301125746/image.svg",
  "/605/115404/261/363/image.svg": "https://s.eu.tankionline.com/605/115404/261/363/30274273241777/image.svg",
  "/605/115404/257/232/image.svg": "https://s.eu.tankionline.com/605/115404/257/232/30274273120410/image.svg",
  "/606/71600/66/210/image.svg": "https://s.eu.tankionline.com/606/71600/66/210/30664176122301/image.svg",
  "/607/52626/330/66/image.svg": "https://s.eu.tankionline.com/607/52626/330/66/30664175162560/image.svg",
  "/625/153434/211/174/image.svg": "https://s.eu.tankionline.com/625/153434/211/174/31272707144507/image.svg",
  "/607/52626/326/312/image.svg": "https://s.eu.tankionline.com/607/52626/326/312/30664176172747/image.svg",
  "/607/52626/333/7/image.svg": "https://s.eu.tankionline.com/607/52626/333/7/30664175105565/image.svg",
  "/607/52626/331/234/image.svg": "https://s.eu.tankionline.com/607/52626/331/234/30664176045077/image.svg",
  "/626/14763/222/273/image.svg": "https://s.eu.tankionline.com/626/14763/222/273/31303174776207/image.svg",
  "/605/115404/271/2/image.svg": "https://s.eu.tankionline.com/605/115404/271/2/30664175471247/image.svg",
  "/605/115404/265/163/image.svg": "https://s.eu.tankionline.com/605/115404/265/163/30664174712541/image.svg",
  "/605/115404/267/326/image.svg": "https://s.eu.tankionline.com/605/115404/267/326/30664175256502/image.svg",
  "/605/115404/276/325/image.svg": "https://s.eu.tankionline.com/605/115404/276/325/30664176261044/image.svg",
  "/605/115404/264/114/image.svg": "https://s.eu.tankionline.com/605/115404/264/114/30664174607325/image.svg",
  "/605/115404/274/173/image.svg": "https://s.eu.tankionline.com/605/115404/274/173/30664175707772/image.svg",
  "/607/52626/325/132/image.svg": "https://s.eu.tankionline.com/607/52626/325/132/30664175333541/image.svg",
  "/605/115404/272/45/image.svg": "https://s.eu.tankionline.com/605/115404/272/45/30664175540271/image.svg",
  "/605/115404/266/244/image.svg": "https://s.eu.tankionline.com/605/115404/266/244/30664175003140/image.svg",
  "/605/115404/275/253/image.svg": "https://s.eu.tankionline.com/605/115404/275/253/30664175776073/image.svg",
  "/605/115404/273/122/image.svg": "https://s.eu.tankionline.com/605/115404/273/122/30664175624647/image.svg",
  "/606/71606/172/352/image.svg": "https://s.eu.tankionline.com/606/71606/172/352/30316341476014/image.svg",
  "/607/52626/276/325/image.svg": "https://s.eu.tankionline.com/607/52626/276/325/30352545540000/image.svg",
  "/625/153440/130/316/image.svg": "https://s.eu.tankionline.com/625/153440/130/316/31272710271165/image.svg",
  "/607/52626/275/155/image.svg": "https://s.eu.tankionline.com/607/52626/275/155/30352545537235/image.svg",
  "/607/52626/304/160/image.svg": "https://s.eu.tankionline.com/607/52626/304/160/30352545542720/image.svg",
  "/607/52626/300/70/image.svg": "https://s.eu.tankionline.com/607/52626/300/70/30352545542052/image.svg",
  "/626/14775/270/340/image.svg": "https://s.eu.tankionline.com/626/14775/270/340/31303177425217/image.svg",
  "/605/115405/200/351/image.svg": "https://s.eu.tankionline.com/605/115405/200/351/30263301300726/image.svg",
  "/605/115405/175/147/image.svg": "https://s.eu.tankionline.com/605/115405/175/147/30263301277133/image.svg",
  "/605/115405/177/303/image.svg": "https://s.eu.tankionline.com/605/115405/177/303/30263301300266/image.svg",
  "/605/115405/206/277/image.svg": "https://s.eu.tankionline.com/605/115405/206/277/30263301303673/image.svg",
  "/605/115405/174/105/image.svg": "https://s.eu.tankionline.com/605/115405/174/105/30263301276465/image.svg",
  "/605/115405/204/144/image.svg": "https://s.eu.tankionline.com/605/115405/204/144/30263301302536/image.svg",
  "/607/52626/273/364/image.svg": "https://s.eu.tankionline.com/607/52626/273/364/30352545536452/image.svg",
  "/605/115405/202/17/image.svg": "https://s.eu.tankionline.com/605/115405/202/17/30263301301406/image.svg",
  "/605/115405/176/222/image.svg": "https://s.eu.tankionline.com/605/115405/176/222/30263301277611/image.svg",
  "/605/115405/205/223/image.svg": "https://s.eu.tankionline.com/605/115405/205/223/30274277423776/image.svg",
  "/605/115405/203/72/image.svg": "https://s.eu.tankionline.com/605/115405/203/72/30274277306523/image.svg",
  "/606/71575/203/64/image.svg": "https://s.eu.tankionline.com/606/71575/203/64/30316337302130/image.svg",
  "/607/52626/311/141/image.svg": "https://s.eu.tankionline.com/607/52626/311/141/30352545545343/image.svg",
  "/625/153432/123/23/image.svg": "https://s.eu.tankionline.com/625/153432/123/23/31272706523157/image.svg",
  "/607/52626/307/301/image.svg": "https://s.eu.tankionline.com/607/52626/307/301/30352545544466/image.svg",
  "/607/52626/314/224/image.svg": "https://s.eu.tankionline.com/607/52626/314/224/30352545546746/image.svg",
  "/607/52626/313/26/image.svg": "https://s.eu.tankionline.com/607/52626/313/26/30352545546143/image.svg",
  "/626/14757/372/20/image.svg": "https://s.eu.tankionline.com/626/14757/372/20/31303174034500/image.svg",
  "/605/115404/161/51/image.svg": "https://s.eu.tankionline.com/605/115404/161/51/30263301071030/image.svg",
  "/605/115404/155/230/image.svg": "https://s.eu.tankionline.com/605/115404/155/230/30263301067220/image.svg",
  "/605/115404/157/376/image.svg": "https://s.eu.tankionline.com/605/115404/157/376/30263301070363/image.svg",
  "/605/115404/167/3/image.svg": "https://s.eu.tankionline.com/605/115404/167/3/30263301073776/image.svg",
  "/605/115404/154/161/image.svg": "https://s.eu.tankionline.com/605/115404/154/161/30263301066541/image.svg",
  "/605/115404/164/240/image.svg": "https://s.eu.tankionline.com/605/115404/164/240/30263301072634/image.svg",
  "/607/52626/306/22/image.svg": "https://s.eu.tankionline.com/607/52626/306/22/30352545543613/image.svg",
  "/605/115404/162/117/image.svg": "https://s.eu.tankionline.com/605/115404/162/117/30263301071505/image.svg",
  "/605/115404/156/315/image.svg": "https://s.eu.tankionline.com/605/115404/156/315/30263301067705/image.svg",
  "/605/115404/165/323/image.svg": "https://s.eu.tankionline.com/605/115404/165/323/30274272264152/image.svg",
  "/605/115404/163/173/image.svg": "https://s.eu.tankionline.com/605/115404/163/173/30274272100003/image.svg",
  "/606/71600/177/21/image.svg": "https://s.eu.tankionline.com/606/71600/177/21/30316340100064/image.svg",
  "/607/52626/267/303/image.svg": "https://s.eu.tankionline.com/607/52626/267/303/30352545534345/image.svg",
  "/625/153435/56/204/image.svg": "https://s.eu.tankionline.com/625/153435/56/204/31272707444471/image.svg",
  "/607/52626/266/125/image.svg": "https://s.eu.tankionline.com/607/52626/266/125/30352545533605/image.svg",
  "/607/52626/272/222/image.svg": "https://s.eu.tankionline.com/607/52626/272/222/30352545535673/image.svg",
  "/607/52626/271/51/image.svg": "https://s.eu.tankionline.com/607/52626/271/51/30352545535126/image.svg",
  "/626/14773/203/76/image.svg": "https://s.eu.tankionline.com/626/14773/203/76/31303176751641/image.svg",
  "/605/115404/305/361/image.svg": "https://s.eu.tankionline.com/605/115404/305/361/30263301143336/image.svg",
  "/605/115404/302/147/image.svg": "https://s.eu.tankionline.com/605/115404/302/147/30263301141536/image.svg",
  "/605/115404/304/306/image.svg": "https://s.eu.tankionline.com/605/115404/304/306/30263301142673/image.svg",
  "/605/115404/313/302/image.svg": "https://s.eu.tankionline.com/605/115404/313/302/30263301146271/image.svg",
  "/605/115404/301/77/image.svg": "https://s.eu.tankionline.com/605/115404/301/77/30263301141057/image.svg",
  "/605/115404/311/152/image.svg": "https://s.eu.tankionline.com/605/115404/311/152/30263301145137/image.svg",
  "/607/52626/264/207/image.svg": "https://s.eu.tankionline.com/607/52626/264/207/30352545532726/image.svg",
  "/605/115404/307/27/image.svg": "https://s.eu.tankionline.com/605/115404/307/27/30263301144007/image.svg",
  "/605/115404/303/226/image.svg": "https://s.eu.tankionline.com/605/115404/303/226/30263301142214/image.svg",
  "/605/115404/312/223/image.svg": "https://s.eu.tankionline.com/605/115404/312/223/30274274122350/image.svg",
  "/605/115404/310/101/image.svg": "https://s.eu.tankionline.com/605/115404/310/101/30274274014242/image.svg",
  "/606/71601/226/172/image.svg": "https://s.eu.tankionline.com/606/71601/226/172/30316340313636/image.svg",
  "/607/52626/321/33/image.svg": "https://s.eu.tankionline.com/607/52626/321/33/30352545551105/image.svg",
  "/625/153437/45/146/image.svg": "https://s.eu.tankionline.com/625/153437/45/146/31272707655525/image.svg",
  "/607/52626/317/260/image.svg": "https://s.eu.tankionline.com/607/52626/317/260/30352545550335/image.svg",
  "/607/52626/323/353/image.svg": "https://s.eu.tankionline.com/607/52626/323/353/30352545552430/image.svg",
  "/607/52626/322/171/image.svg": "https://s.eu.tankionline.com/607/52626/322/171/30352545551651/image.svg",
  "/626/14774/252/246/image.svg": "https://s.eu.tankionline.com/626/14774/252/246/31303177163004/image.svg",
  "/605/115404/354/246/image.svg": "https://s.eu.tankionline.com/605/115404/354/246/30263301166625/image.svg",
  "/605/115404/351/35/image.svg": "https://s.eu.tankionline.com/605/115404/351/35/30263301165022/image.svg",
  "/605/115404/353/176/image.svg": "https://s.eu.tankionline.com/605/115404/353/176/30263301166161/image.svg",
  "/605/115404/362/172/image.svg": "https://s.eu.tankionline.com/605/115404/362/172/30263301171567/image.svg",
  "/605/115404/347/366/image.svg": "https://s.eu.tankionline.com/605/115404/347/366/30263301164350/image.svg",
  "/605/115404/360/42/image.svg": "https://s.eu.tankionline.com/605/115404/360/42/30263301170433/image.svg",
  "/607/52626/316/33/image.svg": "https://s.eu.tankionline.com/607/52626/316/33/30352545547575/image.svg",
  "/605/115404/355/316/image.svg": "https://s.eu.tankionline.com/605/115404/355/316/30263301167302/image.svg",
  "/605/115404/352/112/image.svg": "https://s.eu.tankionline.com/605/115404/352/112/30263301165506/image.svg",
  "/605/115404/361/120/image.svg": "https://s.eu.tankionline.com/605/115404/361/120/30274276742065/image.svg",
  "/605/115404/356/372/image.svg": "https://s.eu.tankionline.com/605/115404/356/372/30274276645464/image.svg",
  "/606/71575/316/60/image.svg": "https://s.eu.tankionline.com/606/71575/316/60/30316337347523/image.svg",
  "/607/52626/337/100/image.svg": "https://s.eu.tankionline.com/607/52626/337/100/30352545560143/image.svg",
  "/625/153432/353/164/image.svg": "https://s.eu.tankionline.com/625/153432/353/164/31272706652426/image.svg",
  "/607/52626/335/352/image.svg": "https://s.eu.tankionline.com/607/52626/335/352/30352545557432/image.svg",
  "/607/52626/342/12/image.svg": "https://s.eu.tankionline.com/607/52626/342/12/30352545561467/image.svg",
  "/607/52626/340/224/image.svg": "https://s.eu.tankionline.com/607/52626/340/224/30352545560711/image.svg",
  "/626/14760/353/56/image.svg": "https://s.eu.tankionline.com/626/14760/353/56/31303174244125/image.svg",
  "/605/115404/175/3/image.svg": "https://s.eu.tankionline.com/605/115404/175/3/30263301076762/image.svg",
  "/605/115404/171/147/image.svg": "https://s.eu.tankionline.com/605/115404/171/147/30263301075137/image.svg",
  "/605/115404/173/326/image.svg": "https://s.eu.tankionline.com/605/115404/173/326/30263301076311/image.svg",
  "/605/115404/202/353/image.svg": "https://s.eu.tankionline.com/605/115404/202/353/30263301101742/image.svg",
  "/605/115404/170/74/image.svg": "https://s.eu.tankionline.com/605/115404/170/74/30263301074454/image.svg",
  "/605/115404/200/211/image.svg": "https://s.eu.tankionline.com/605/115404/200/211/30263301100600/image.svg",
  "/607/52626/334/161/image.svg": "https://s.eu.tankionline.com/607/52626/334/161/30352545556647/image.svg",
  "/605/115404/176/56/image.svg": "https://s.eu.tankionline.com/605/115404/176/56/30263301077441/image.svg",
  "/605/115404/172/240/image.svg": "https://s.eu.tankionline.com/605/115404/172/240/30263301075635/image.svg",
  "/605/115404/201/275/image.svg": "https://s.eu.tankionline.com/605/115404/201/275/30274272730104/image.svg",
  "/605/115404/177/134/image.svg": "https://s.eu.tankionline.com/605/115404/177/134/30274272610102/image.svg",
  "/606/71605/220/141/image.svg": "https://s.eu.tankionline.com/606/71605/220/141/30316341310602/image.svg",
  "/607/52626/373/202/image.svg": "https://s.eu.tankionline.com/607/52626/373/202/30352545576247/image.svg",
  "/625/153437/257/205/image.svg": "https://s.eu.tankionline.com/625/153437/257/205/31272710001572/image.svg",
  "/607/52626/372/40/image.svg": "https://s.eu.tankionline.com/607/52626/372/40/30352545575521/image.svg",
  "/607/52626/376/110/image.svg": "https://s.eu.tankionline.com/607/52626/376/110/30352545577563/image.svg",
  "/607/52626/374/331/image.svg": "https://s.eu.tankionline.com/607/52626/374/331/30352545577014/image.svg",
  "/626/14775/64/127/image.svg": "https://s.eu.tankionline.com/626/14775/64/127/31303177275076/image.svg",
  "/605/115405/152/265/image.svg": "https://s.eu.tankionline.com/605/115405/152/265/30263301265642/image.svg",
  "/605/115405/147/52/image.svg": "https://s.eu.tankionline.com/605/115405/147/52/30263301264041/image.svg",
  "/605/115405/151/210/image.svg": "https://s.eu.tankionline.com/605/115405/151/210/30263301265175/image.svg",
  "/605/144203/5/124/image.svg": "https://s.eu.tankionline.com/605/144203/5/124/30271040603315/image.svg",
  "/605/115405/146/1/image.svg": "https://s.eu.tankionline.com/605/115405/146/1/30267737066301/image.svg",
  "/605/115405/156/63/image.svg": "https://s.eu.tankionline.com/605/115405/156/63/30263301267452/image.svg",
  "/607/52626/370/255/image.svg": "https://s.eu.tankionline.com/607/52626/370/255/30352545574736/image.svg",
  "/605/115405/153/333/image.svg": "https://s.eu.tankionline.com/605/115405/153/333/30263301266316/image.svg",
  "/605/115405/150/131/image.svg": "https://s.eu.tankionline.com/605/115405/150/131/30263301264520/image.svg",
  "/605/115405/157/142/image.svg": "https://s.eu.tankionline.com/605/115405/157/142/30274277157304/image.svg",
  "/605/115405/155/6/image.svg": "https://s.eu.tankionline.com/605/115405/155/6/30274277067364/image.svg",
  "/606/71574/376/266/image.svg": "https://s.eu.tankionline.com/606/71574/376/266/30316337177765/image.svg",
  "/607/52627/2/224/image.svg": "https://s.eu.tankionline.com/607/52627/2/224/30352545601676/image.svg",
  "/625/153431/244/273/image.svg": "https://s.eu.tankionline.com/625/153431/244/273/31272706377100/image.svg",
  "/607/52627/1/55/image.svg": "https://s.eu.tankionline.com/607/52627/1/55/30352545601131/image.svg",
  "/607/52627/5/137/image.svg": "https://s.eu.tankionline.com/607/52627/5/137/30352545603214/image.svg",
  "/607/52627/3/366/image.svg": "https://s.eu.tankionline.com/607/52627/3/366/30352545602452/image.svg",
  "/626/14757/7/353/image.svg": "https://s.eu.tankionline.com/626/14757/7/353/31303173653776/image.svg",
  "/605/115404/145/136/image.svg": "https://s.eu.tankionline.com/605/115404/145/136/30263301063115/image.svg",
  "/605/115404/141/307/image.svg": "https://s.eu.tankionline.com/605/115404/141/307/30263301061277/image.svg",
  "/605/115404/144/63/image.svg": "https://s.eu.tankionline.com/605/115404/144/63/30263301062450/image.svg",
  "/605/115404/153/100/image.svg": "https://s.eu.tankionline.com/605/115404/153/100/30263301066070/image.svg",
  "/605/115404/132/344/image.svg": "https://s.eu.tankionline.com/605/115404/132/344/30263301055732/image.svg",
  "/605/115404/150/335/image.svg": "https://s.eu.tankionline.com/605/115404/150/335/30263301064726/image.svg",
  "/607/52626/377/265/image.svg": "https://s.eu.tankionline.com/607/52626/377/265/30352545600353/image.svg",
  "/605/115404/146/210/image.svg": "https://s.eu.tankionline.com/605/115404/146/210/30263301063574/image.svg",
  "/605/115404/142/374/image.svg": "https://s.eu.tankionline.com/605/115404/142/374/30263301061771/image.svg",
  "/605/115404/152/21/image.svg": "https://s.eu.tankionline.com/605/115404/152/21/30274271440071/image.svg",
  "/605/115404/147/265/image.svg": "https://s.eu.tankionline.com/605/115404/147/265/30274271272031/image.svg",
  "/606/71601/125/254/image.svg": "https://s.eu.tankionline.com/606/71601/125/254/30316340253316/image.svg",
  "/607/52626/364/144/image.svg": "https://s.eu.tankionline.com/607/52626/364/144/30352545572620/image.svg",
  "/625/153436/225/317/image.svg": "https://s.eu.tankionline.com/625/153436/225/317/31272707552602/image.svg",
  "/607/52626/362/366/image.svg": "https://s.eu.tankionline.com/607/52626/362/366/30352545572041/image.svg",
  "/607/52626/367/101/image.svg": "https://s.eu.tankionline.com/607/52626/367/101/30352545574156/image.svg",
  "/607/52626/365/305/image.svg": "https://s.eu.tankionline.com/607/52626/365/305/30352545573363/image.svg",
  "/626/14774/57/121/image.svg": "https://s.eu.tankionline.com/626/14774/57/121/31303177061063/image.svg",
  "/605/115404/340/343/image.svg": "https://s.eu.tankionline.com/605/115404/340/343/30263301160720/image.svg",
  "/605/115404/335/127/image.svg": "https://s.eu.tankionline.com/605/115404/335/127/30263301157112/image.svg",
  "/605/115404/337/266/image.svg": "https://s.eu.tankionline.com/605/115404/337/266/30263301160252/image.svg",
  "/605/115404/346/302/image.svg": "https://s.eu.tankionline.com/605/115404/346/302/30263301163675/image.svg",
  "/605/115404/334/54/image.svg": "https://s.eu.tankionline.com/605/115404/334/54/30263301156436/image.svg",
  "/605/115404/344/142/image.svg": "https://s.eu.tankionline.com/605/115404/344/142/30263301162533/image.svg",
  "/607/52626/361/203/image.svg": "https://s.eu.tankionline.com/607/52626/361/203/30352545571276/image.svg",
  "/605/115404/342/11/image.svg": "https://s.eu.tankionline.com/605/115404/342/11/30263301161400/image.svg",
  "/605/115404/336/205/image.svg": "https://s.eu.tankionline.com/605/115404/336/205/30263301157574/image.svg",
  "/605/115404/345/225/image.svg": "https://s.eu.tankionline.com/605/115404/345/225/30274276070224/image.svg",
  "/605/115404/343/73/image.svg": "https://s.eu.tankionline.com/605/115404/343/73/30274275755406/image.svg",
  "/606/71576/76/42/image.svg": "https://s.eu.tankionline.com/606/71576/76/42/30316337437470/image.svg",
  "/625/153142/22/275/image.svg": "https://s.eu.tankionline.com/625/153142/22/275/31272631235770/image.svg",
  "/605/161407/341/230/image.svg": "https://s.eu.tankionline.com/605/161407/341/230/31261222644475/image.svg",
  "/626/14777/75/17/image.svg": "https://s.eu.tankionline.com/626/14777/75/17/31303177701337/image.svg",
  "/606/113532/53/323/image.svg": "https://s.eu.tankionline.com/606/113532/53/323/30322726426353/image.svg",
  "/605/115404/212/6/image.svg": "https://s.eu.tankionline.com/605/115404/212/6/31261126744702/image.svg",
  "/605/115404/213/45/image.svg": "https://s.eu.tankionline.com/605/115404/213/45/31261127634773/image.svg",
  "/605/115404/214/131/image.svg": "https://s.eu.tankionline.com/605/115404/214/131/31261127512033/image.svg",
  "/605/115404/210/316/image.svg": "https://s.eu.tankionline.com/605/115404/210/316/31261127412430/image.svg",
  "/605/115404/204/34/image.svg": "https://s.eu.tankionline.com/605/115404/204/34/31272630245777/image.svg",
  "/605/137574/35/123/image.svg": "https://s.eu.tankionline.com/605/137574/35/123/31261127125054/image.svg",
  "/605/137574/33/65/image.svg": "https://s.eu.tankionline.com/605/137574/33/65/31261126426502/image.svg",
  "/605/115404/207/251/image.svg": "https://s.eu.tankionline.com/605/115404/207/251/31261127265135/image.svg",
  "/606/71576/212/53/image.svg": "https://s.eu.tankionline.com/606/71576/212/53/30316337505501/image.svg",
  "/625/153142/104/314/image.svg": "https://s.eu.tankionline.com/625/153142/104/314/31272631312161/image.svg",
  "/623/22505/354/320/image.svg": "https://s.eu.tankionline.com/623/22505/354/320/31261222770230/image.svg",
  "/624/172214/74/266/image.svg": "https://s.eu.tankionline.com/624/172214/74/266/31236443103310/image.svg",
  "/626/14777/310/231/image.svg": "https://s.eu.tankionline.com/626/14777/310/231/31303200003222/image.svg",
  "/606/113532/200/147/image.svg": "https://s.eu.tankionline.com/606/113532/200/147/30322726500600/image.svg",
  "/605/115404/217/336/image.svg": "https://s.eu.tankionline.com/605/115404/217/336/31261131532413/image.svg",
  "/605/115404/224/216/image.svg": "https://s.eu.tankionline.com/605/115404/224/216/31261132241105/image.svg",
  "/605/115404/222/102/image.svg": "https://s.eu.tankionline.com/605/115404/222/102/31261132100342/image.svg",
  "/605/115404/225/307/image.svg": "https://s.eu.tankionline.com/605/115404/225/307/31261132010461/image.svg",
  "/605/115404/215/175/image.svg": "https://s.eu.tankionline.com/605/115404/215/175/30263301107160/image.svg",
  "/605/137574/40/217/image.svg": "https://s.eu.tankionline.com/605/137574/40/217/31261131714410/image.svg",
  "/605/137574/37/51/image.svg": "https://s.eu.tankionline.com/605/137574/37/51/31261131334437/image.svg",
  "/605/115404/223/146/image.svg": "https://s.eu.tankionline.com/605/115404/223/146/31261132352611/image.svg",
  "/606/71600/305/54/image.svg": "https://s.eu.tankionline.com/606/71600/305/54/30316340143100/image.svg",
  "/625/153142/305/125/image.svg": "https://s.eu.tankionline.com/625/153142/305/125/31272631501664/image.svg",
  "/605/115404/321/240/image.svg": "https://s.eu.tankionline.com/605/115404/321/240/30263301151226/image.svg",
  "/617/5400/231/261/image.svg": "https://s.eu.tankionline.com/617/5400/231/261/30741300115302/image.svg",
  "/623/61301/132/106/image.svg": "https://s.eu.tankionline.com/623/61301/132/106/31154260343207/image.svg",
  "/626/15001/352/355/image.svg": "https://s.eu.tankionline.com/626/15001/352/355/31303200421671/image.svg",
  "/606/113533/22/240/image.svg": "https://s.eu.tankionline.com/606/113533/22/240/30322726611675/image.svg",
  "/611/125417/135/371/image.svg": "https://s.eu.tankionline.com/611/125417/135/371/31261146465102/image.svg",
  "/613/123104/313/102/image.svg": "https://s.eu.tankionline.com/613/123104/313/102/31261147042671/image.svg",
  "/614/1145/57/337/image.svg": "https://s.eu.tankionline.com/614/1145/57/337/31261146736614/image.svg",
  "/607/7000/376/240/image.svg": "https://s.eu.tankionline.com/607/7000/376/240/31261146573242/image.svg",
  "/605/115404/314/361/image.svg": "https://s.eu.tankionline.com/605/115404/314/361/30263301146743/image.svg",
  "/605/137574/47/123/image.svg": "https://s.eu.tankionline.com/605/137574/47/123/31261146365540/image.svg",
  "/605/137574/50/260/image.svg": "https://s.eu.tankionline.com/605/137574/50/260/31261147154066/image.svg",
  "/605/115404/317/105/image.svg": "https://s.eu.tankionline.com/605/115404/317/105/31261146655626/image.svg",
  "/606/71604/334/157/image.svg": "https://s.eu.tankionline.com/606/71604/334/157/30316341156606/image.svg",
  "/625/153144/76/330/image.svg": "https://s.eu.tankionline.com/625/153144/76/330/31272632226544/image.svg",
  "/605/137574/135/23/image.svg": "https://s.eu.tankionline.com/605/137574/135/23/30267737057035/image.svg",
  "/625/104563/334/216/image.svg": "https://s.eu.tankionline.com/625/104563/334/216/31261135016303/image.svg",
  "/634/160343/200/134/image.svg": "https://s.eu.tankionline.com/634/160343/200/134/31634070763007/image.svg",
  "/626/15006/236/134/image.svg": "https://s.eu.tankionline.com/626/15006/236/134/31303201552544/image.svg",
  "/605/137574/144/142/image.svg": "https://s.eu.tankionline.com/605/137574/144/142/30267737062556/image.svg",
  "/605/137574/137/302/image.svg": "https://s.eu.tankionline.com/605/137574/137/302/31261150254452/image.svg",
  "/605/137574/136/147/image.svg": "https://s.eu.tankionline.com/605/137574/136/147/31261150650271/image.svg",
  "/605/137574/147/16/image.svg": "https://s.eu.tankionline.com/605/137574/147/16/31261150511125/image.svg",
  "/605/137574/145/271/image.svg": "https://s.eu.tankionline.com/605/137574/145/271/31261151167166/image.svg",
  "/605/137574/132/177/image.svg": "https://s.eu.tankionline.com/605/137574/132/177/31261151063444/image.svg",
  "/605/137574/141/22/image.svg": "https://s.eu.tankionline.com/605/137574/141/22/31261150727724/image.svg",
  "/605/115405/105/22/image.svg": "https://s.eu.tankionline.com/605/115405/105/22/30263301243005/image.svg",
  "/605/137574/142/156/image.svg": "https://s.eu.tankionline.com/605/137574/142/156/31261151015270/image.svg",
  "/605/137574/131/63/image.svg": "https://s.eu.tankionline.com/605/137574/131/63/31261150171563/image.svg",
  "/605/137574/133/315/image.svg": "https://s.eu.tankionline.com/605/137574/133/315/31261150416742/image.svg",
  "/606/71577/206/226/image.svg": "https://s.eu.tankionline.com/606/71577/206/226/30316337703651/image.svg",
  "/625/153142/223/336/image.svg": "https://s.eu.tankionline.com/625/153142/223/336/31272631431331/image.svg",
  "/605/115404/232/163/image.svg": "https://s.eu.tankionline.com/605/115404/232/163/30263301115537/image.svg",
  "/605/115404/235/362/image.svg": "https://s.eu.tankionline.com/605/115404/235/362/30263301117350/image.svg",
  "/606/55122/350/216/image.svg": "https://s.eu.tankionline.com/606/55122/350/216/30313224564641/image.svg",
  "/606/55122/166/133/image.svg": "https://s.eu.tankionline.com/606/55122/166/133/30313224473612/image.svg",
  "/611/150032/152/234/image.svg": "https://s.eu.tankionline.com/611/150032/152/234/30472006465670/image.svg",
  "/613/12172/37/254/image.svg": "https://s.eu.tankionline.com/613/12172/37/254/30542436420276/image.svg",
  "/622/112605/232/247/image.svg": "https://s.eu.tankionline.com/622/112605/232/247/31122541315700/image.svg",
  "/627/6071/254/247/image.svg": "https://s.eu.tankionline.com/627/6071/254/247/31341416415124/image.svg",
  "/635/105570/100/322/image.svg": "https://s.eu.tankionline.com/635/105570/100/322/31661336073254/image.svg",
  "/626/15001/146/305/image.svg": "https://s.eu.tankionline.com/626/15001/146/305/31303200330516/image.svg",
  "/605/115404/243/311/image.svg": "https://s.eu.tankionline.com/605/115404/243/311/30263301122274/image.svg",
  "/605/115404/237/42/image.svg": "https://s.eu.tankionline.com/605/115404/237/42/31261151727300/image.svg",
  "/605/115404/247/161/image.svg": "https://s.eu.tankionline.com/605/115404/247/161/31261152277057/image.svg",
  "/605/115404/242/247/image.svg": "https://s.eu.tankionline.com/605/115404/242/247/31261152201332/image.svg",
  "/605/115404/246/64/image.svg": "https://s.eu.tankionline.com/605/115404/246/64/31261152771505/image.svg",
  "/605/115404/234/317/image.svg": "https://s.eu.tankionline.com/605/115404/234/317/31261152651255/image.svg",
  "/605/115404/241/156/image.svg": "https://s.eu.tankionline.com/605/115404/241/156/31261152545473/image.svg",
  "/605/115404/233/226/image.svg": "https://s.eu.tankionline.com/605/115404/233/226/30263301116211/image.svg",
  "/605/137574/44/105/image.svg": "https://s.eu.tankionline.com/605/137574/44/105/31261153057064/image.svg",
  "/605/137574/42/305/image.svg": "https://s.eu.tankionline.com/605/137574/42/305/31261152414510/image.svg",
  "/605/115404/300/13/image.svg": "https://s.eu.tankionline.com/605/115404/300/13/31261152117511/image.svg",
  "/606/71606/50/17/image.svg": "https://s.eu.tankionline.com/606/71606/50/17/30316341424442/image.svg",
  "/625/153144/214/177/image.svg": "https://s.eu.tankionline.com/625/153144/214/177/31272632403613/image.svg",
  "/605/115405/170/320/image.svg": "https://s.eu.tankionline.com/605/115405/170/320/30263301274677/image.svg",
  "/616/75433/17/170/image.svg": "https://s.eu.tankionline.com/616/75433/17/170/30717306610215/image.svg",
  "/546/137515/247/264/image.svg": "https://s.eu.tankionline.com/546/137515/247/264/31406107141372/image.svg",
  "/626/15007/216/65/image.svg": "https://s.eu.tankionline.com/626/15007/216/65/31303201745262/image.svg",
  "/605/147204/271/201/image.svg": "https://s.eu.tankionline.com/605/147204/271/201/30271641135254/image.svg",
  "/605/115405/173/35/image.svg": "https://s.eu.tankionline.com/605/115405/173/35/31261153537356/image.svg",
  "/605/115405/161/300/image.svg": "https://s.eu.tankionline.com/605/115405/161/300/31261154066510/image.svg",
  "/605/115405/164/34/image.svg": "https://s.eu.tankionline.com/605/115405/164/34/31261153635574/image.svg",
  "/575/72435/73/200/image.svg": "https://s.eu.tankionline.com/575/72435/73/200/31261154606673/image.svg",
  "/605/115405/167/254/image.svg": "https://s.eu.tankionline.com/605/115405/167/254/31261154315142/image.svg",
  "/605/115405/166/171/image.svg": "https://s.eu.tankionline.com/605/115405/166/171/31261154233247/image.svg",
  "/605/115405/160/220/image.svg": "https://s.eu.tankionline.com/605/115405/160/220/30263301270605/image.svg",
  "/605/137574/161/215/image.svg": "https://s.eu.tankionline.com/605/137574/161/215/31261154667701/image.svg",
  "/605/137574/160/13/image.svg": "https://s.eu.tankionline.com/605/137574/160/13/31261154431742/image.svg",
  "/605/115405/162/364/image.svg": "https://s.eu.tankionline.com/605/115405/162/364/31261154150417/image.svg",
  "/606/71602/351/15/image.svg": "https://s.eu.tankionline.com/606/71602/351/15/30316340565037/image.svg",
  "/625/153143/105/74/image.svg": "https://s.eu.tankionline.com/625/153143/105/74/31272631671576/image.svg",
  "/605/115405/4/66/image.svg": "https://s.eu.tankionline.com/605/115405/4/66/30263301202443/image.svg",
  "/605/115405/7/261/image.svg": "https://s.eu.tankionline.com/605/115405/7/261/30271633203426/image.svg",
  "/623/53773/111/315/image.svg": "https://s.eu.tankionline.com/623/53773/111/315/31152776707606/image.svg",
  "/631/160736/322/206/image.svg": "https://s.eu.tankionline.com/631/160736/322/206/31474170621235/image.svg",
  "/626/15003/334/245/image.svg": "https://s.eu.tankionline.com/626/15003/334/245/31303201007577/image.svg",
  "/605/115405/15/240/image.svg": "https://s.eu.tankionline.com/605/115405/15/240/30263301207227/image.svg",
  "/605/115405/16/316/image.svg": "https://s.eu.tankionline.com/605/115405/16/316/31261155615320/image.svg",
  "/605/115405/5/131/image.svg": "https://s.eu.tankionline.com/605/115405/5/131/31261156006154/image.svg",
  "/605/115405/12/25/image.svg": "https://s.eu.tankionline.com/605/115405/12/25/31261155725556/image.svg",
  "/605/115405/21/37/image.svg": "https://s.eu.tankionline.com/605/115405/21/37/31261157174120/image.svg",
  "/605/115405/17/370/image.svg": "https://s.eu.tankionline.com/605/115405/17/370/31261156272346/image.svg",
  "/605/115405/10/340/image.svg": "https://s.eu.tankionline.com/605/115405/10/340/31261156120340/image.svg",
  "/605/115405/3/3/image.svg": "https://s.eu.tankionline.com/605/115405/3/3/30263301201771/image.svg",
  "/605/137574/60/51/image.svg": "https://s.eu.tankionline.com/605/137574/60/51/31261157316056/image.svg",
  "/605/137574/61/262/image.svg": "https://s.eu.tankionline.com/605/137574/61/262/31261156212310/image.svg",
  "/605/115405/14/146/image.svg": "https://s.eu.tankionline.com/605/115405/14/146/31261156440610/image.svg",
  "/606/71606/277/374/image.svg": "https://s.eu.tankionline.com/606/71606/277/374/30316341540417/image.svg",
  "/625/153144/264/41/image.svg": "https://s.eu.tankionline.com/625/153144/264/41/31272632460524/image.svg",
  "/605/115405/214/246/image.svg": "https://s.eu.tankionline.com/605/115405/214/246/30263301306636/image.svg",
  "/613/62100/344/43/image.svg": "https://s.eu.tankionline.com/613/62100/344/43/30554420162467/image.svg",
  "/613/61333/55/135/image.svg": "https://s.eu.tankionline.com/613/61333/55/135/30554266627176/image.svg",
  "/620/116140/342/103/image.svg": "https://s.eu.tankionline.com/620/116140/342/103/31023430161570/image.svg",
  "/626/15010/4/6/image.svg": "https://s.eu.tankionline.com/626/15010/4/6/31303202037143/image.svg",
  "/606/113534/6/213/image.svg": "https://s.eu.tankionline.com/606/113534/6/213/30322727003653/image.svg",
  "/617/163556/127/124/image.svg": "https://s.eu.tankionline.com/617/163556/127/124/31261161023263/image.svg",
  "/615/75332/4/347/image.svg": "https://s.eu.tankionline.com/615/75332/4/347/31261160622764/image.svg",
  "/616/75405/214/251/image.svg": "https://s.eu.tankionline.com/616/75405/214/251/31261161536475/image.svg",
  "/613/12170/376/100/image.svg": "https://s.eu.tankionline.com/613/12170/376/100/31261161367254/image.svg",
  "/606/55123/317/310/image.svg": "https://s.eu.tankionline.com/606/55123/317/310/31261161176345/image.svg",
  "/605/115405/207/363/image.svg": "https://s.eu.tankionline.com/605/115405/207/363/30263301304345/image.svg",
  "/605/137574/164/322/image.svg": "https://s.eu.tankionline.com/605/137574/164/322/31261161306334/image.svg",
  "/605/137574/163/164/image.svg": "https://s.eu.tankionline.com/605/137574/163/164/31261161111155/image.svg",
  "/605/115405/212/113/image.svg": "https://s.eu.tankionline.com/605/115405/212/113/31261160537461/image.svg",
  "/606/71604/46/134/image.svg": "https://s.eu.tankionline.com/606/71604/46/134/30316341023557/image.svg",
  "/625/153143/312/335/image.svg": "https://s.eu.tankionline.com/625/153143/312/335/31272632105653/image.svg",
  "/605/115405/56/233/image.svg": "https://s.eu.tankionline.com/605/115405/56/233/30263301227613/image.svg",
  "/605/115405/67/356/image.svg": "https://s.eu.tankionline.com/605/115405/67/356/30263301234353/image.svg",
  "/605/115405/62/23/image.svg": "https://s.eu.tankionline.com/605/115405/62/23/31604732043030/image.svg",
  "/605/115405/71/50/image.svg": "https://s.eu.tankionline.com/605/115405/71/50/30263301235053/image.svg",
  "/617/163647/140/233/image.svg": "https://s.eu.tankionline.com/617/163647/140/233/30774751660657/image.svg",
  "/626/15005/127/361/image.svg": "https://s.eu.tankionline.com/626/15005/127/361/31303201332146/image.svg",
  "/605/147212/342/222/image.svg": "https://s.eu.tankionline.com/605/147212/342/222/30271642561723/image.svg",
  "/605/115405/63/66/image.svg": "https://s.eu.tankionline.com/605/115405/63/66/31261164650561/image.svg",
  "/605/115405/57/305/image.svg": "https://s.eu.tankionline.com/605/115405/57/305/31261165140051/image.svg",
  "/605/115405/60/355/image.svg": "https://s.eu.tankionline.com/605/115405/60/355/31261165015762/image.svg",
  "/605/115405/64/140/image.svg": "https://s.eu.tankionline.com/605/115405/64/140/31261165667476/image.svg",
  "/605/115405/65/227/image.svg": "https://s.eu.tankionline.com/605/115405/65/227/31261165441274/image.svg",
  "/605/115537/140/243/image.svg": "https://s.eu.tankionline.com/605/115537/140/243/31261165360742/image.svg",
  "/605/115405/54/102/image.svg": "https://s.eu.tankionline.com/605/115405/54/102/30263301226465/image.svg",
  "/605/137574/125/317/image.svg": "https://s.eu.tankionline.com/605/137574/125/317/31261163710376/image.svg",
  "/605/137574/127/144/image.svg": "https://s.eu.tankionline.com/605/137574/127/144/31261165525131/image.svg",
  "/605/115405/72/161/image.svg": "https://s.eu.tankionline.com/605/115405/72/161/31261166006724/image.svg",
  "/606/71604/214/1/image.svg": "https://s.eu.tankionline.com/606/71604/214/1/30316341106425/image.svg",
  "/625/153144/23/215/image.svg": "https://s.eu.tankionline.com/625/153144/23/215/31272632161406/image.svg",
  "/605/115405/102/310/image.svg": "https://s.eu.tankionline.com/605/115405/102/310/30263301241667/image.svg",
  "/605/147222/345/214/image.svg": "https://s.eu.tankionline.com/605/147222/345/214/30271644563310/image.svg",
  "/612/127056/353/361/image.svg": "https://s.eu.tankionline.com/612/127056/353/361/30525613566412/image.svg",
  "/610/176122/121/70/image.svg": "https://s.eu.tankionline.com/610/176122/121/70/30437424451140/image.svg",
  "/614/76403/251/210/image.svg": "https://s.eu.tankionline.com/614/76403/251/210/30617500725234/image.svg",
  "/615/6647/254/11/image.svg": "https://s.eu.tankionline.com/615/6647/254/11/30641551726444/image.svg",
  "/626/66003/354/107/image.svg": "https://s.eu.tankionline.com/626/66003/354/107/31315401031271/image.svg",
  "/626/15006/46/161/image.svg": "https://s.eu.tankionline.com/626/15006/46/161/31303201457152/image.svg",
  "/605/147224/331/326/image.svg": "https://s.eu.tankionline.com/605/147224/331/326/30271645155425/image.svg",
  "/612/150610/365/312/image.svg": "https://s.eu.tankionline.com/612/150610/365/312/31261167151174/image.svg",
  "/620/156734/156/340/image.svg": "https://s.eu.tankionline.com/620/156734/156/340/31261167535037/image.svg",
  "/612/127056/213/323/image.svg": "https://s.eu.tankionline.com/612/127056/213/323/31261167433172/image.svg",
  "/605/115405/101/222/image.svg": "https://s.eu.tankionline.com/605/115405/101/222/31261170470305/image.svg",
  "/605/115405/74/316/image.svg": "https://s.eu.tankionline.com/605/115405/74/316/31261170277476/image.svg",
  "/622/20176/45/174/image.svg": "https://s.eu.tankionline.com/622/20176/45/174/31261170012530/image.svg",
  "/605/115405/73/237/image.svg": "https://s.eu.tankionline.com/605/115405/73/237/30263301236221/image.svg",
  "/605/115405/77/36/image.svg": "https://s.eu.tankionline.com/605/115405/77/36/31261167653052/image.svg",
  "/605/115405/75/361/image.svg": "https://s.eu.tankionline.com/605/115405/75/361/31261167320621/image.svg",
  "/605/115405/100/152/image.svg": "https://s.eu.tankionline.com/605/115405/100/152/31261170406546/image.svg",
  "/606/71605/71/135/image.svg": "https://s.eu.tankionline.com/606/71605/71/135/30316341235161/image.svg",
  "/625/153144/145/41/image.svg": "https://s.eu.tankionline.com/625/153144/145/41/31272632332142/image.svg",
  "/605/115405/143/251/image.svg": "https://s.eu.tankionline.com/605/115405/143/251/30263301262241/image.svg",
  "/605/115405/142/164/image.svg": "https://s.eu.tankionline.com/605/115405/142/164/30263301261555/image.svg",
  "/605/115405/133/111/image.svg": "https://s.eu.tankionline.com/605/115405/133/111/30263301256100/image.svg",
  "/605/115405/121/362/image.svg": "https://s.eu.tankionline.com/605/115405/121/362/30263301251344/image.svg",
  "/605/115405/127/312/image.svg": "https://s.eu.tankionline.com/605/115405/127/312/31002105557326/image.svg",
  "/605/115405/124/105/image.svg": "https://s.eu.tankionline.com/605/115405/124/105/30263301252475/image.svg",
  "/623/154746/364/11/image.svg": "https://s.eu.tankionline.com/623/154746/364/11/31173171640441/image.svg",
  "/634/24211/5/226/image.svg": "https://s.eu.tankionline.com/634/24211/5/226/31605042245043/image.svg",
  "/626/15007/17/150/image.svg": "https://s.eu.tankionline.com/626/15007/17/150/31303201645022/image.svg",
  "/605/115405/136/373/image.svg": "https://s.eu.tankionline.com/605/115405/136/373/30263301257756/image.svg",
  "/605/115405/140/45/image.svg": "https://s.eu.tankionline.com/605/115405/140/45/31261174407272/image.svg",
  "/605/115405/144/333/image.svg": "https://s.eu.tankionline.com/605/115405/144/333/31261174613630/image.svg",
  "/605/115405/132/42/image.svg": "https://s.eu.tankionline.com/605/115405/132/42/31261174532057/image.svg",
  "/605/115405/135/271/image.svg": "https://s.eu.tankionline.com/605/115405/135/271/31261175372400/image.svg",
  "/605/115405/126/246/image.svg": "https://s.eu.tankionline.com/605/115405/126/246/31261175313210/image.svg",
  "/605/115405/134/201/image.svg": "https://s.eu.tankionline.com/605/115405/134/201/31261175106456/image.svg",
  "/605/115405/123/31/image.svg": "https://s.eu.tankionline.com/605/115405/123/31/30263301252013/image.svg",
  "/605/137574/151/362/image.svg": "https://s.eu.tankionline.com/605/137574/151/362/31261175174006/image.svg",
  "/605/137574/150/212/image.svg": "https://s.eu.tankionline.com/605/137574/150/212/31261174321474/image.svg",
  "/605/115405/141/126/image.svg": "https://s.eu.tankionline.com/605/115405/141/126/31261175450177/image.svg",
  "/634/112243/143/327/image.svg": "https://s.eu.tankionline.com/634/112243/143/327/31622455333354/image.svg",
  "/634/112237/40/362/image.svg": "https://s.eu.tankionline.com/634/112237/40/362/31622455310550/image.svg",
  "/634/112241/153/137/image.svg": "https://s.eu.tankionline.com/634/112241/153/137/31622455332524/image.svg",
  "/634/112243/16/24/image.svg": "https://s.eu.tankionline.com/634/112243/16/24/31622455333200/image.svg",
  "/634/112244/40/150/image.svg": "https://s.eu.tankionline.com/634/112244/40/150/31622455333712/image.svg",
  "/634/112241/77/52/image.svg": "https://s.eu.tankionline.com/634/112241/77/52/31622455332460/image.svg",
  "/634/112243/302/325/image.svg": "https://s.eu.tankionline.com/634/112243/302/325/31622455333535/image.svg",
  "/634/107721/260/354/image.svg": "https://s.eu.tankionline.com/634/107721/260/354/31622455333471/image.svg",
  "/634/112242/270/315/image.svg": "https://s.eu.tankionline.com/634/112242/270/315/31622455333071/image.svg",
  "/634/112243/51/336/image.svg": "https://s.eu.tankionline.com/634/112243/51/336/31622455333244/image.svg",
  "/634/112244/245/101/image.svg": "https://s.eu.tankionline.com/634/112244/245/101/31622455334021/image.svg",
  "/634/112237/376/72/image.svg": "https://s.eu.tankionline.com/634/112237/376/72/31622455332306/image.svg",
  "/634/112241/340/366/image.svg": "https://s.eu.tankionline.com/634/112241/340/366/31622455332636/image.svg",
  "/634/112243/205/350/image.svg": "https://s.eu.tankionline.com/634/112243/205/350/31622455333422/image.svg",
  "/634/112242/156/41/image.svg": "https://s.eu.tankionline.com/634/112242/156/41/31622455332757/image.svg",
  "/634/112242/222/234/image.svg": "https://s.eu.tankionline.com/634/112242/222/234/31622455333024/image.svg",
  "/634/112241/213/12/image.svg": "https://s.eu.tankionline.com/634/112241/213/12/31622455332571/image.svg",
  "/634/112243/341/120/image.svg": "https://s.eu.tankionline.com/634/112243/341/120/31622455333602/image.svg",
  "/634/112243/103/56/image.svg": "https://s.eu.tankionline.com/634/112243/103/56/31622455333307/image.svg",
  "/634/112244/3/272/image.svg": "https://s.eu.tankionline.com/634/112244/3/272/31622455333647/image.svg",
  "/634/112236/325/324/image.svg": "https://s.eu.tankionline.com/634/112236/325/324/31622455273730/image.svg",
  "/634/112242/333/350/image.svg": "https://s.eu.tankionline.com/634/112242/333/350/31622455333134/image.svg",
  "/634/112242/54/34/image.svg": "https://s.eu.tankionline.com/634/112242/54/34/31622455332714/image.svg",
  "/634/112244/77/41/image.svg": "https://s.eu.tankionline.com/634/112244/77/41/31622455333757/image.svg",
  "/606/71603/237/12/image.svg": "https://s.eu.tankionline.com/606/71603/237/12/30316340720036/image.svg",
  "/625/153143/163/245/image.svg": "https://s.eu.tankionline.com/625/153143/163/245/31272631743536/image.svg",
  "/605/115405/42/324/image.svg": "https://s.eu.tankionline.com/605/115405/42/324/30263301221704/image.svg",
  "/605/115405/36/26/image.svg": "https://s.eu.tankionline.com/605/115405/36/26/30263301217414/image.svg",
  "/605/115405/33/271/image.svg": "https://s.eu.tankionline.com/605/115405/33/271/30263301216256/image.svg",
  "/605/115405/34/350/image.svg": "https://s.eu.tankionline.com/605/115405/34/350/30263301216734/image.svg",
  "/634/63466/6/312/image.svg": "https://s.eu.tankionline.com/634/63466/6/312/31614715441421/image.svg",
  "/626/15004/132/112/image.svg": "https://s.eu.tankionline.com/626/15004/132/112/31303201111474/image.svg",
  "/605/115405/40/160/image.svg": "https://s.eu.tankionline.com/605/115405/40/160/30263301220541/image.svg",
  "/605/115405/31/122/image.svg": "https://s.eu.tankionline.com/605/115405/31/122/31261176757176/image.svg",
  "/605/115405/24/252/image.svg": "https://s.eu.tankionline.com/605/115405/24/252/31261177140455/image.svg",
  "/605/115405/25/341/image.svg": "https://s.eu.tankionline.com/605/115405/25/341/31261177052525/image.svg",
  "/605/115405/41/227/image.svg": "https://s.eu.tankionline.com/605/115405/41/227/31261177433407/image.svg",
  "/605/115405/23/205/image.svg": "https://s.eu.tankionline.com/605/115405/23/205/31261177334245/image.svg",
  "/605/115405/32/201/image.svg": "https://s.eu.tankionline.com/605/115405/32/201/31261177222455/image.svg",
  "/605/115405/22/130/image.svg": "https://s.eu.tankionline.com/605/115405/22/130/30263301211513/image.svg",
  "/605/115405/27/5/image.svg": "https://s.eu.tankionline.com/605/115405/27/5/31604732451505/image.svg",
  "/605/115405/30/57/image.svg": "https://s.eu.tankionline.com/605/115405/30/57/31261176503432/image.svg",
  "/605/115405/37/105/image.svg": "https://s.eu.tankionline.com/605/115405/37/105/31261176565522/image.svg",
  "/606/71601/12/26/image.svg": "https://s.eu.tankionline.com/606/71601/12/26/30316340205447/image.svg",
  "/625/153142/357/251/image.svg": "https://s.eu.tankionline.com/625/153142/357/251/31272631553164/image.svg",
  "/605/115404/331/327/image.svg": "https://s.eu.tankionline.com/605/115404/331/327/30263301155301/image.svg",
  "/612/41746/164/263/image.svg": "https://s.eu.tankionline.com/612/41746/164/263/30510371472706/image.svg",
  "/621/133301/74/107/image.svg": "https://s.eu.tankionline.com/621/133301/74/107/31066660236524/image.svg",
  "/622/165764/376/133/image.svg": "https://s.eu.tankionline.com/622/165764/376/133/31135375177562/image.svg",
  "/633/20351/64/220/image.svg": "https://s.eu.tankionline.com/633/20351/64/220/31544072351511/image.svg",
  "/626/15002/341/363/image.svg": "https://s.eu.tankionline.com/626/15002/341/363/31303200612111/image.svg",
  "/606/113533/135/224/image.svg": "https://s.eu.tankionline.com/606/113533/135/224/30322726657264/image.svg",
  "/605/115404/330/255/image.svg": "https://s.eu.tankionline.com/605/115404/330/255/31261201000056/image.svg",
  "/605/115404/326/126/image.svg": "https://s.eu.tankionline.com/605/115404/326/126/31261201463745/image.svg",
  "/611/44450/377/277/image.svg": "https://s.eu.tankionline.com/611/44450/377/277/31261201371266/image.svg",
  "/616/4250/5/63/image.svg": "https://s.eu.tankionline.com/616/4250/5/63/31261201701607/image.svg",
  "/605/115404/324/1/image.svg": "https://s.eu.tankionline.com/605/115404/324/1/31261201620317/image.svg",
  "/613/123105/147/37/image.svg": "https://s.eu.tankionline.com/613/123105/147/37/31261201543510/image.svg",
  "/605/115404/322/317/image.svg": "https://s.eu.tankionline.com/605/115404/322/317/30263301151704/image.svg",
  "/605/115404/332/363/image.svg": "https://s.eu.tankionline.com/605/115404/332/363/31261200613333/image.svg",
  "/605/115404/325/44/image.svg": "https://s.eu.tankionline.com/605/115404/325/44/31261200430450/image.svg",
  "/546/137515/231/276/image.svg": "https://s.eu.tankionline.com/546/137515/231/276/31261200530511/image.svg",
  "/606/71601/340/235/image.svg": "https://s.eu.tankionline.com/606/71601/340/235/30316340360662/image.svg",
  "/625/153143/35/151/image.svg": "https://s.eu.tankionline.com/625/153143/35/151/31272631617502/image.svg",
  "/605/137574/55/32/image.svg": "https://s.eu.tankionline.com/605/137574/55/32/30267737027045/image.svg",
  "/605/115404/376/102/image.svg": "https://s.eu.tankionline.com/605/115404/376/102/30263301177460/image.svg",
  "/605/115404/366/0/image.svg": "https://s.eu.tankionline.com/605/115404/366/0/30263301173367/image.svg",
  "/605/115404/372/302/image.svg": "https://s.eu.tankionline.com/605/115404/372/302/30271633110044/image.svg",
  "/606/25171/245/307/image.svg": "https://s.eu.tankionline.com/606/25171/245/307/30305236323337/image.svg",
  "/614/1144/200/261/image.svg": "https://s.eu.tankionline.com/614/1144/200/261/30600231100717/image.svg",
  "/627/142531/56/121/image.svg": "https://s.eu.tankionline.com/627/142531/56/121/31370526376541/image.svg",
  "/633/10556/24/206/image.svg": "https://s.eu.tankionline.com/633/10556/24/206/31542133450636/image.svg",
  "/626/15003/117/47/image.svg": "https://s.eu.tankionline.com/626/15003/117/47/31303200712152/image.svg",
  "/605/161114/267/166/image.svg": "https://s.eu.tankionline.com/605/161114/267/166/30274223134236/image.svg",
  "/605/115404/373/360/image.svg": "https://s.eu.tankionline.com/605/115404/373/360/31261203746370/image.svg",
  "/605/115404/364/322/image.svg": "https://s.eu.tankionline.com/605/115404/364/322/31261204144677/image.svg",
  "/605/115404/367/60/image.svg": "https://s.eu.tankionline.com/605/115404/367/60/31261204055620/image.svg",
  "/605/115405/1/317/image.svg": "https://s.eu.tankionline.com/605/115405/1/317/31261204415453/image.svg",
  "/605/115404/375/32/image.svg": "https://s.eu.tankionline.com/605/115404/375/32/31261204324220/image.svg",
  "/605/115537/27/314/image.svg": "https://s.eu.tankionline.com/605/115537/27/314/31261204241171/image.svg",
  "/605/115404/363/257/image.svg": "https://s.eu.tankionline.com/605/115404/363/257/30263301172235/image.svg",
  "/605/137574/53/256/image.svg": "https://s.eu.tankionline.com/605/137574/53/256/31261202466535/image.svg",
  "/605/137574/56/244/image.svg": "https://s.eu.tankionline.com/605/137574/56/244/31261202670274/image.svg",
  "/605/115404/377/146/image.svg": "https://s.eu.tankionline.com/605/115404/377/146/31261202571244/image.svg",
  "/606/71576/366/165/image.svg": "https://s.eu.tankionline.com/606/71576/366/165/30316337573610/image.svg",
  "/625/153142/155/344/image.svg": "https://s.eu.tankionline.com/625/153142/155/344/31272631371252/image.svg",
  "/606/113476/60/105/image.svg": "https://s.eu.tankionline.com/606/113476/60/105/30456237742715/image.svg",
  "/611/67030/210/164/image.svg": "https://s.eu.tankionline.com/611/67030/210/164/30455606104614/image.svg",
  "/611/67027/162/134/image.svg": "https://s.eu.tankionline.com/611/67027/162/134/30455605671570/image.svg",
  "/623/44244/2/213/image.svg": "https://s.eu.tankionline.com/623/44244/2/213/31151051065656/image.svg",
  "/632/120275/211/15/image.svg": "https://s.eu.tankionline.com/632/120275/211/15/31524057364033/image.svg",
  "/626/15000/104/132/image.svg": "https://s.eu.tankionline.com/626/15000/104/132/31303200102114/image.svg",
  "/606/113532/321/357/image.svg": "https://s.eu.tankionline.com/606/113532/321/357/30322726551410/image.svg",
  "/611/66627/105/110/image.svg": "https://s.eu.tankionline.com/611/66627/105/110/31261205671314/image.svg",
  "/611/66630/64/264/image.svg": "https://s.eu.tankionline.com/611/66630/64/264/31261206046776/image.svg",
  "/605/115404/231/123/image.svg": "https://s.eu.tankionline.com/605/115404/231/123/31261205766603/image.svg",
  "/607/131160/264/374/image.svg": "https://s.eu.tankionline.com/607/131160/264/374/31261206301507/image.svg",
  "/605/115404/230/55/image.svg": "https://s.eu.tankionline.com/605/115404/230/55/31261206204657/image.svg",
  "/611/67027/312/216/image.svg": "https://s.eu.tankionline.com/611/67027/312/216/31261206131160/image.svg",
  "/605/115404/226/374/image.svg": "https://s.eu.tankionline.com/605/115404/226/374/30263301113762/image.svg",
  "/611/67026/233/112/image.svg": "https://s.eu.tankionline.com/611/67026/233/112/31261205440213/image.svg",
  "/611/67027/21/56/image.svg": "https://s.eu.tankionline.com/611/67027/21/56/31261205510135/image.svg",
  "/611/67030/36/256/image.svg": "https://s.eu.tankionline.com/611/67030/36/256/31261205604655/image.svg",
  "/606/71603/340/207/image.svg": "https://s.eu.tankionline.com/606/71603/340/207/30316340760632/image.svg",
  "/625/153143/235/270/image.svg": "https://s.eu.tankionline.com/625/153143/235/270/31272632043007/image.svg",
  "/605/115405/51/352/image.svg": "https://s.eu.tankionline.com/605/115405/51/352/30263301225333/image.svg",
  "/605/115405/45/51/image.svg": "https://s.eu.tankionline.com/605/115405/45/51/30263301223044/image.svg",
  "/623/154745/143/361/image.svg": "https://s.eu.tankionline.com/623/154745/143/361/31173171431111/image.svg",
  "/627/115736/0/267/image.svg": "https://s.eu.tankionline.com/627/115736/0/267/31363367445744/image.svg",
  "/626/15004/330/76/image.svg": "https://s.eu.tankionline.com/626/15004/330/76/31303201216215/image.svg",
  "/606/113533/243/206/image.svg": "https://s.eu.tankionline.com/606/113533/243/206/30322726722237/image.svg",
  "/607/65044/323/337/image.svg": "https://s.eu.tankionline.com/607/65044/323/337/31261210245706/image.svg",
  "/621/45765/150/23/image.svg": "https://s.eu.tankionline.com/621/45765/150/23/31261210404770/image.svg",
  "/620/44540/243/134/image.svg": "https://s.eu.tankionline.com/620/44540/243/134/31261210324636/image.svg",
  "/612/5273/330/266/image.svg": "https://s.eu.tankionline.com/612/5273/330/266/31261210650753/image.svg",
  "/605/115405/50/303/image.svg": "https://s.eu.tankionline.com/605/115405/50/303/31261210567737/image.svg",
  "/617/163550/12/157/image.svg": "https://s.eu.tankionline.com/617/163550/12/157/31261210511731/image.svg",
  "/605/115405/43/367/image.svg": "https://s.eu.tankionline.com/605/115405/43/367/30263301222357/image.svg",
  "/605/137574/124/170/image.svg": "https://s.eu.tankionline.com/605/137574/124/170/31261210161240/image.svg",
  "/605/137574/122/354/image.svg": "https://s.eu.tankionline.com/605/137574/122/354/31261210003025/image.svg",
  "/605/115405/47/222/image.svg": "https://s.eu.tankionline.com/605/115405/47/222/31261210075275/image.svg"
});
  const CDN_HOST = 's.eu.tankionline.com';

  function assetKey(value) {
    try {
      const url = new URL(String(value), location.href);
      if (url.hostname !== CDN_HOST) return null;
      const parts = url.pathname.split('/').filter(Boolean);
      if (parts.length < 2 || parts[parts.length - 1] !== 'image.svg') return null;
      parts.splice(parts.length - 2, 1); // discard the version directory
      return '/' + parts.join('/');
    } catch (_) {
      return null;
    }
  }

  function oldUrl(value) {
    const replacement = OLD_BY_ASSET[assetKey(value)];
    return replacement || value;
  }

  function replaceCssUrls(value) {
    if (typeof value !== 'string' || !value.includes(CDN_HOST)) return value;
    return value.replace(/url\(\s*(['"]?)([^'"\)]+)\1\s*\)/gi,
      (whole, quote, url) => `url(${quote}${oldUrl(url)}${quote})`);
  }

  // Game/network requests.
  const nativeFetch = window.fetch;
  if (nativeFetch) {
    window.fetch = function(input, init) {
      if (typeof input === 'string' || input instanceof URL) {
        input = oldUrl(input);
      } else if (typeof Request !== 'undefined' && input instanceof Request) {
        const replacement = oldUrl(input.url);
        if (replacement !== input.url) input = new Request(replacement, input);
      }
      return nativeFetch.call(this, input, init);
    };
  }

  if (typeof XMLHttpRequest !== 'undefined') {
    const nativeOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, ...rest) {
      return nativeOpen.call(this, method, oldUrl(url), ...rest);
    };
  }

  if (typeof HTMLImageElement !== 'undefined') {
    const srcDescriptor = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
    if (srcDescriptor?.get && srcDescriptor?.set) {
      Object.defineProperty(HTMLImageElement.prototype, 'src', {
        configurable: srcDescriptor.configurable,
        enumerable: srcDescriptor.enumerable,
        get: srcDescriptor.get,
        set(value) { return srcDescriptor.set.call(this, oldUrl(value)); }
      });
    }
  }

  // Image URLs and inline CSS assigned by the page.
  const nativeSetAttribute = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function(name, value) {
    const lower = String(name).toLowerCase();
    if (lower === 'src' || lower === 'href' || lower === 'xlink:href') {
      value = oldUrl(value);
    } else if (lower === 'style') {
      value = replaceCssUrls(value);
    }
    return nativeSetAttribute.call(this, name, value);
  };

  if (typeof CSSStyleDeclaration !== 'undefined') {
    const nativeSetProperty = CSSStyleDeclaration.prototype.setProperty;
    CSSStyleDeclaration.prototype.setProperty = function(name, value, priority) {
      return nativeSetProperty.call(this, name, replaceCssUrls(value), priority);
    };
  }

  function rewriteElement(element) {
    if (!(element instanceof Element)) return;
    for (const attr of ['src', 'href', 'xlink:href']) {
      if (!element.hasAttribute(attr)) continue;
      const current = element.getAttribute(attr);
      const replacement = oldUrl(current);
      if (replacement !== current) nativeSetAttribute.call(element, attr, replacement);
    }
    if (element.hasAttribute('style')) {
      const current = element.getAttribute('style');
      const replacement = replaceCssUrls(current);
      if (replacement !== current) nativeSetAttribute.call(element, 'style', replacement);
    }
  }

  function rewriteTree(node) {
    if (!(node instanceof Element)) return;
    rewriteElement(node);
    // `xlink:href` needs special CSS escaping and caused repeated selector errors.
    // SVG image elements are selected by tag and then inspected by rewriteElement.
    for (const child of node.querySelectorAll('[src], [href], [style], image'))
      rewriteElement(child);
  }

  const observer = new MutationObserver(records => {
    for (const record of records) {
      if (record.type === 'attributes') rewriteElement(record.target);
      for (const node of record.addedNodes) rewriteTree(node);
    }
  });
  observer.observe(document, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['src', 'href', 'style']
  });

  rewriteTree(document.documentElement);
  console.info('[Tanki old augment icons] Active: 515 matches (198 hull, 317 turret).');
})();
