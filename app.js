/* Molecule Explorer | 3Dmol.js 2.5.5 | No server-side uploads */
'use strict';

const SAMPLES = {
  water: {
    title: '水', formula: 'H₂O', geometry: '折れ線形',
    question: 'なぜ水分子は曲がっているの？',
    description: '水分子は、酸素原子1つと水素原子2つからできています。3つの原子は一直線には並ばず、約104.5°の角度で折れ曲がっています。酸素原子の非共有電子対も、立体的な形に関わっています。',
    xyz: `3\nWater / H2O\nO   0.00000   0.00000   0.00000\nH   0.95720   0.00000   0.00000\nH  -0.23999   0.92663   0.00000\n`
  },
  methane: {
    title: 'メタン', formula: 'CH₄', geometry: '正四面体形',
    question: 'メタンの水素は、なぜ平面に並ばないの？',
    description: '炭素原子のまわりに4つの水素原子がほぼ等しく配置されています。H–C–H結合角は約109.5°で、4つの結合は空間に向かって伸びています。',
    xyz: `5\nMethane / CH4\nC   0.0000   0.0000   0.0000\nH   0.6293   0.6293   0.6293\nH  -0.6293  -0.6293   0.6293\nH  -0.6293   0.6293  -0.6293\nH   0.6293  -0.6293  -0.6293\n`
  },
  co2: {
    title: '二酸化炭素', formula: 'CO₂', geometry: '直線形',
    question: '水分子と二酸化炭素、形が違うのはなぜ？',
    description: '中央の炭素原子をはさんで、2つの酸素原子が反対方向に並びます。O=C=Oの結合角は180°です。水分子と比較すると、中心原子の周囲の電子の配置と分子の形の関係を考えられます。',
    xyz: `3\nCarbon dioxide / CO2\nO  -1.1600   0.0000   0.0000\nC   0.0000   0.0000   0.0000\nO   1.1600   0.0000   0.0000\n`
  },
  ammonia: {
    title: 'アンモニア', formula: 'NH₃', geometry: '三角錐形',
    question: 'アンモニアを横から見るとどう見える？',
    description: '窒素原子のまわりに3つの水素原子が三角形を作るように配置されています。窒素原子はその面より少し上にあり、分子全体は三角錐形です。窒素の非共有電子対も形に関係しています。',
    xyz: `4\nAmmonia / NH3\nN   0.00000   0.00000   0.10000\nH   0.93770   0.00000  -0.28130\nH  -0.46885   0.81207  -0.28130\nH  -0.46885  -0.81207  -0.28130\n`
  },
  benzene: {
    title: 'ベンゼン', formula: 'C₆H₆', geometry: '平面六角形',
    question: 'ベンゼンの原子は同じ平面にある？',
    description: '6つの炭素原子が六角形の環を作り、それぞれに水素原子が1つ結合しています。ほぼすべての原子が同じ平面上にあり、π電子が環全体に広がる芳香族分子です。',
    xyz: makeBenzeneXYZ()
  },
  ethanol: {
    title: 'エタノール', formula: 'C₂H₆O', geometry: '立体的な鎖状分子',
    question: '同じ分子でも、見る向きで形が変わる？',
    description: 'エタノールは2つの炭素原子とヒドロキシ基（–OH）からできています。C–CやC–Oなどの単結合のまわりで回転でき、異なる立体配座を取ります。ここでは一例を表示しています。',
    xyz: `9\nEthanol / C2H6O - illustrative 3D conformer\nC  -0.7480  -0.0150   0.0240\nC   0.7480   0.0300  -0.0200\nO   1.3130   1.3110   0.0700\nH  -1.1150  -0.5310   0.9130\nH  -1.1060  -0.5260  -0.8710\nH  -1.1450   1.0050   0.0350\nH   1.1270  -0.5330   0.8400\nH   1.1330  -0.4920  -0.9040\nH   2.2730   1.2190   0.0690\n`
  }
};

function makeBenzeneXYZ() {
  const lines = ['12', 'Benzene / C6H6'];
  for (const element of ['C', 'H']) {
    const r = element === 'C' ? 1.397 : 2.479;
    for (let i = 0; i < 6; i++) {
      const angle = Math.PI * i / 3;
      lines.push(`${element} ${(Math.cos(angle) * r).toFixed(5)} ${(Math.sin(angle) * r).toFixed(5)} 0.00000`);
    }
  }
  return lines.join('\n') + '\n';
}

const ELEM_RE = /^[A-Z][a-z]?$/;
const MAX_FILE_BYTES = 20 * 1024 * 1024;
const MAX_FRAMES = 2000;
const MAX_ATOMS = 15000;
const ATOMIC_NUMBERS = ['', 'H','He','Li','Be','B','C','N','O','F','Ne','Na','Mg','Al','Si','P','S','Cl','Ar','K','Ca','Sc','Ti','V','Cr','Mn','Fe','Co','Ni','Cu','Zn','Ga','Ge','As','Se','Br','Kr','Rb','Sr','Y','Zr','Nb','Mo','Tc','Ru','Rh','Pd','Ag','Cd','In','Sn','Sb','Te','I','Xe'];
const EL_FULL = {H:'水素',C:'炭素',N:'窒素',O:'酸素',F:'フッ素',Cl:'塩素',Na:'ナトリウム',S:'硫黄',P:'リン',Si:'ケイ素',Br:'臭素',I:'ヨウ素',K:'カリウム',Fe:'鉄',Cu:'銅',Ge:'ゲルマニウム'};

const $ = id => document.getElementById(id);
let viewer = null;
let currentModel = null;
let currentData = null;
let currentStyle = 'ballstick';
let showLabels = false;
let spinning = false;
let frameIndex = 0;
let playbackTimer = null;
let frameEpoch = 0;

function parseXYZ(text) {
  // Strict enough to catch malformed uploads, but accepts extra columns and scientific notation.
  const lines = text.replace(/^\uFEFF/, '').replace(/\r/g, '').split('\n');
  let pos = 0;
  const frames = [];
  let expectedCount = null;
  let firstElements = [];
  while (pos < lines.length) {
    while (pos < lines.length && !lines[pos].trim()) pos++;
    if (pos >= lines.length) break;
    const countLine = lines[pos++].trim();
    if (!/^\d+$/.test(countLine)) throw new Error(`${frames.length + 1}番目の構造: 先頭行には原子数（整数）が必要です。`);
    const count = Number(countLine);
    if (count < 1 || count > MAX_ATOMS) throw new Error(`原子数は1〜${MAX_ATOMS.toLocaleString('ja-JP')}の範囲で指定してください。`);
    if (expectedCount !== null && count !== expectedCount) throw new Error('複数構造の原子数が一致しません。');
    if (pos >= lines.length) throw new Error('XYZファイルにコメント行がありません。');
    const comment = lines[pos++];
    const atoms = [];
    const atomsLines = [];
    for (let i = 0; i < count; i++) {
      if (pos >= lines.length) throw new Error(`原子座標が不足しています（${i}/${count}行）。`);
      const line = lines[pos++].trim();
      const parts = line.split(/\s+/);
      let elem = parts[0];
      if (/^\d+$/.test(elem)) elem = ATOMIC_NUMBERS[Number(elem)];
      if (!ELEM_RE.test(elem || '') || !elem) throw new Error(`${i+1}番目の原子の元素記号が認識できません。`);
      if (parts.length < 4 || parts.slice(1,4).some(x => !Number.isFinite(Number(x.replace(/[dD]/g,'e'))))) {
        throw new Error(`${i+1}番目の原子のXYZ座標が正しくありません。`);
      }
      const xyz = parts.slice(1,4).map(x => Number(x.replace(/[dD]/g,'e')));
      atoms.push({elem, x:xyz[0], y:xyz[1], z:xyz[2]});
      // Normalizing also supports atomic numbers and Fortran D notation.
      atomsLines.push(`${elem} ${xyz[0]} ${xyz[1]} ${xyz[2]}`);
    }
    if (expectedCount === null) {
      expectedCount = count;
      firstElements = atoms.map(a => a.elem);
    } else if (atoms.some((a, i) => a.elem !== firstElements[i])) {
      throw new Error('複数構造で原子の並び順または元素が異なります。');
    }
    frames.push({atoms, text: `${count}\n${comment}\n${atomsLines.join('\n')}\n`});
    if (frames.length > MAX_FRAMES) throw new Error(`構造数は最大${MAX_FRAMES}フレームまでです。`);
  }
  if (!frames.length) throw new Error('XYZ座標が見つかりませんでした。');
  return {frames, count:expectedCount, formula:composition(firstElements)};
}

function composition(elements) {
  const counts = {};
  for (const e of elements) counts[e] = (counts[e] || 0) + 1;
  const all = Object.keys(counts).sort((a,b) => a.localeCompare(b,'en'));
  const order = counts.C ? ['C',...(counts.H ? ['H'] : []),...all.filter(x => x !== 'C' && x !== 'H')] : all;
  const sub = {'0':'₀','1':'₁','2':'₂','3':'₃','4':'₄','5':'₅','6':'₆','7':'₇','8':'₈','9':'₉'};
  return order.map(e => e + (counts[e] === 1 ? '' : String(counts[e]).replace(/\d/g,d=>sub[d]))).join('');
}

function status(message='', error=false) {
  $('status-message').textContent = message;
  $('status-message').classList.toggle('is-error', error);
}

function stopPlayback() {
  if (playbackTimer !== null) clearInterval(playbackTimer);
  playbackTimer = null;
  $('play-frames').textContent = '▶';
  $('play-frames').setAttribute('aria-label','構造の連続再生');
}

function setSpin(value) {
  spinning = value;
  $('spin-button').setAttribute('aria-pressed',String(value));
  if (viewer) viewer.spin(value ? 'y' : false, 0.5);
}

function setActiveSample(id) {
  document.querySelectorAll('[data-sample]').forEach(button => {
    const active = button.dataset.sample === id;
    button.classList.toggle('is-active',active);
    button.setAttribute('aria-pressed',String(active));
  });
}

function updateNotes(data, parsed) {
  $('molecule-name').replaceChildren(document.createTextNode(data.title + ' '));
  const formula = document.createElement('span');
  formula.textContent = data.formula || parsed.formula;
  $('molecule-name').append(formula);
  $('info-title').textContent = data.question;
  $('info-description').textContent = data.description;
  $('formula-value').textContent = data.formula || parsed.formula;
  $('atom-count').textContent = parsed.count.toLocaleString('ja-JP');
  $('geometry-value').textContent = data.geometry;
  $('atom-inspector-text').textContent = '3Dモデルの原子をタップすると、元素と座標が表示されます。';
}

function applyStyle() {
  if (!viewer || !currentModel) return;
  const styles = {
    ballstick: {stick:{radius:.15,colorscheme:'Jmol'},sphere:{scale:.30,colorscheme:'Jmol'}},
    stick: {stick:{radius:.22,colorscheme:'Jmol'}},
    sphere: {sphere:{scale:.9,colorscheme:'Jmol'}}
  };
  viewer.setStyle({},styles[currentStyle]);
  viewer.setClickable({},true,(atom) => {
    $('atom-inspector-text').textContent = `${EL_FULL[atom.elem] || atom.elem} (${atom.elem})  |  #${Number(atom.index)+1}  |  x ${Number(atom.x).toFixed(3)}, y ${Number(atom.y).toFixed(3)}, z ${Number(atom.z).toFixed(3)} Å`;
    if (!showLabels) {
      viewer.removeAllLabels();
      viewer.addLabel(atom.elem,{position:atom,fontSize:15,fontColor:'#112339',backgroundColor:'#e4f7d4',backgroundOpacity:.88,inFront:true});
      viewer.render();
    }
  });
  updateLabels();
  viewer.render();
}

function updateLabels() {
  if (!viewer || !currentModel) return;
  viewer.removeAllLabels();
  if (showLabels) {
    if (currentData.count > 120) {
      showLabels = false;
      $('labels-button').setAttribute('aria-pressed','false');
      status('原子数が120を超えるため、元素ラベルは省略しました。');
    } else {
      for (const atom of currentModel.selectedAtoms({})) {
        viewer.addLabel(atom.elem,{position:atom,fontSize:13,fontColor:'#142538',backgroundColor:'#dff4d1',backgroundOpacity:.8,inFront:true});
      }
    }
  }
  viewer.render();
}

async function loadMolecule(metadata, xyz, sampleId=null) {
  ++moleculeSelectionSerial;
  stopPlayback();
  if (!viewer) { status('3D表示ライブラリを読み込めません。ネットワーク接続をご確認ください。',true); return; }
  let parsed;
  try { parsed = parseXYZ(xyz); }
  catch(error) { status(error.message,true); return; }
  try {
    setSpin(false);
    frameEpoch++;
    viewer.removeAllLabels();
    viewer.removeAllModels();
    if (parsed.frames.length === 1) currentModel = viewer.addModel(parsed.frames[0].text,'xyz');
    else currentModel = viewer.addModelsAsFrames(parsed.frames.map(f => f.text).join(''),'xyz');
    currentData = parsed;
    frameIndex = 0;
    currentStyle = 'ballstick';
    document.querySelectorAll('[data-style]').forEach(b=>{
      const active=b.dataset.style===currentStyle;
      b.classList.toggle('is-active',active);
      b.setAttribute('aria-pressed',String(active));
    });
    showLabels = false;
    $('labels-button').setAttribute('aria-pressed','false');
    applyStyle();
    viewer.zoomTo();
    viewer.zoom(.88);
    viewer.render();
    updateNotes(metadata,parsed);
    setActiveSample(sampleId);
    const multiple = parsed.frames.length > 1;
    $('trajectory-controls').hidden = !multiple;
    $('frame-slider').max = String(parsed.frames.length-1);
    $('frame-slider').value = '0';
    $('frame-info').textContent = `1 / ${parsed.frames.length}`;
    status(`${metadata.title}を表示しています。${multiple ? ` 全${parsed.frames.length}フレームの構造を切り替えられます。` : ''}${parsed.count>2000?' 原子数が多いため、操作に時間がかかる場合があります。':''}`);
  } catch (error) {
    console.error(error);
    status('分子の表示中にエラーが発生しました。XYZ形式をご確認ください。',true);
  }
}

async function showFrame(n) {
  if (!viewer || !currentData || currentData.frames.length < 2) return;
  frameIndex = Math.max(0,Math.min(currentData.frames.length-1,Number(n)));
  $('frame-slider').value = String(frameIndex);
  $('frame-info').textContent = `${frameIndex+1} / ${currentData.frames.length}`;
  const epoch = ++frameEpoch;
  try {
    await viewer.setFrame(frameIndex);
    if (epoch !== frameEpoch) return;
    updateLabels();
    viewer.render();
  } catch(error) {
    stopPlayback();
    status('フレームの切り替えに失敗しました。',true);
  }
}

async function loadFile(file) {
  if (!file) return;
  ++moleculeSelectionSerial;
  if (!/\.xyz$/i.test(file.name)) { status('拡張子 .xyz のファイルを指定してください。',true); return; }
  if (file.size > MAX_FILE_BYTES) { status('ファイルサイズは20 MB以内にしてください。',true); return; }
  try {
    const text = await file.text();
    const cleanName = file.name.replace(/\.xyz$/i,'');
    // Parse first before modifying the current view. No file content is sent to a server.
    const parsed = parseXYZ(text);
    await loadMolecule({title:cleanName, formula:parsed.formula, geometry:'XYZ座標', question:'読み込んだXYZ構造', description:`「${file.name}」から読み込んだ構造です。座標の単位は通常 Å（オングストローム）です。原子の結合は距離に基づいて自動推定されるため、結合次数などは厳密には保証されません。`},text);
    $('xyz-file').value = '';
  } catch (error) { status(error.message || 'ファイルを読み込めませんでした。',true); }
}


/* GitHub Pages: Jekyll builds molecule-catalog.json automatically from molecules/*.xyz. */
let libraryRequestSerial = 0;
let moleculeSelectionSerial = 0;

function uploadedMoleculeMetadata(filename, parsed) {
  const title = filename.replace(/\.xyz$/i, '').replace(/[_-]+/g, ' ').trim() || '登録分子';
  return {
    title,
    formula: parsed.formula,
    geometry: 'XYZ構造',
    question: `${title}の立体構造を観察しよう`,
    description: `GitHubの molecules フォルダに登録された「${filename}」の構造です。原子をタップすると元素と座標を確認できます。単位は通常 Å です。XYZ形式には結合情報がないため、表示される結合は原子間距離に基づく推定です。`
  };
}

async function openUploadedMolecule(entry, id) {
  const serial = ++moleculeSelectionSerial;
  status(`「${entry.name}」を読み込んでいます…`);
  try {
    const url = new URL(entry.url, window.location.href);
    if (url.origin !== window.location.origin || !/\/molecules\/.+\.xyz$/i.test(url.pathname)) {
      throw new Error('分子データの参照先が正しくありません。');
    }
    const response = await fetch(url.href);
    if (!response.ok) {
      throw new Error(`ファイルを取得できません（HTTP ${response.status}）。公開サイトへの反映が完了しているかご確認ください。`);
    }
    const len = Number(response.headers.get('content-length') || 0);
    if (len > MAX_FILE_BYTES) throw new Error('XYZファイルは20 MB以内にしてください。');
    const xyz = await response.text();
    if (new Blob([xyz]).size > MAX_FILE_BYTES) throw new Error('XYZファイルは20 MB以内にしてください。');
    const parsed = parseXYZ(xyz);
    if (serial !== moleculeSelectionSerial) return;
    await loadMolecule(uploadedMoleculeMetadata(entry.name, parsed), xyz, id);
  } catch (error) {
    if (serial !== moleculeSelectionSerial) return;
    status(error.message || '登録分子を取得できませんでした。', true);
  }
}

function makeUploadedButton(entry) {
  const id = `uploaded:${entry.url}`;
  const button = document.createElement('button');
  button.className = 'sample-card';
  button.type = 'button';
  button.dataset.sample = id;
  button.setAttribute('aria-pressed', 'false');

  const symbol = document.createElement('span');
  symbol.className = 'sample-icon sample-uploaded';
  symbol.textContent = 'XYZ';

  const copy = document.createElement('span');
  copy.className = 'sample-copy';
  const title = document.createElement('strong');
  title.textContent = entry.name.replace(/\.xyz$/i, '').replace(/[_-]+/g, ' ');
  const subtitle = document.createElement('small');
  subtitle.textContent = '登録したXYZファイル';
  copy.append(title, subtitle);

  const arrow = document.createElement('span');
  arrow.className = 'sample-arrow';
  arrow.setAttribute('aria-hidden', 'true');
  arrow.textContent = '↗';

  button.append(symbol, copy, arrow);
  button.addEventListener('click', () => openUploadedMolecule(entry, id));
  return button;
}

async function refreshUploadedLibrary() {
  const serial = ++libraryRequestSerial;
  const list = $('uploaded-list');
  const message = $('library-message');
  message.textContent = '登録された分子を確認しています…';
  $('reload-library').disabled = true;
  try {
    // Jekyll regenerates this catalogue whenever molecules/*.xyz changes on the main branch.
    const response = await fetch(`./molecule-catalog.json?refresh=${Date.now()}`, {cache:'no-store'});
    if (!response.ok) throw new Error(`一覧データを取得できません（HTTP ${response.status}）`);
    const entries = await response.json();
    if (!Array.isArray(entries)) throw new Error('一覧データの形式が正しくありません。');
    const files = entries.filter(item => item && typeof item.name === 'string' && typeof item.url === 'string' && /\.xyz$/i.test(item.name)).sort((a,b)=>a.name.localeCompare(b.name, 'ja'));
    if (serial !== libraryRequestSerial) return;
    list.replaceChildren(...files.map(makeUploadedButton));
    $('sample-count').textContent = String(Object.keys(SAMPLES).length + files.length).padStart(2, '0');
    message.textContent = files.length ? `${files.length}件の登録分子があります。` : 'まだ登録分子はありません。GitHubの molecules フォルダにXYZファイルを追加してください。';
  } catch (error) {
    if (serial !== libraryRequestSerial) return;
    message.textContent = '登録分子の一覧を取得できませんでした。READMEの公開設定と molecule-catalog.json を確認してください。';
    console.warn('Molecule catalogue unavailable:', error);
  } finally {
    if (serial === libraryRequestSerial) $('reload-library').disabled = false;
  }
}

function initialize() {
  if (!window.$3Dmol || !$3Dmol.createViewer) {
    $('stage-fallback').hidden = false;
    status('3Dmol.jsを読み込めませんでした。インターネット接続をご確認ください。',true);
    return;
  }
  try {
    viewer = $3Dmol.createViewer($('molecule-viewer'), {backgroundColor:'#11243a',antialias:true});
    if (!viewer) throw new Error('Viewer could not be created');
  } catch(error) {
    console.error(error);
    $('stage-fallback').hidden=false;
    status('3D表示に対応したブラウザまたは端末が必要です。',true);
    return;
  }
  for (const button of document.querySelectorAll('[data-sample]')) {
    button.addEventListener('click',()=>{
      const id=button.dataset.sample;
      const sample=SAMPLES[id];
      loadMolecule(sample,sample.xyz,id);
    });
  }
  document.querySelectorAll('[data-style]').forEach(button=>{
    button.addEventListener('click',()=>{
      currentStyle=button.dataset.style;
      document.querySelectorAll('[data-style]').forEach(b=>{
        const active=b===button;
        b.classList.toggle('is-active',active);
        b.setAttribute('aria-pressed',String(active));
      });
      applyStyle();
    });
  });
  $('labels-button').addEventListener('click',()=>{
    showLabels=!showLabels;
    $('labels-button').setAttribute('aria-pressed',String(showLabels));
    updateLabels();
  });
  $('spin-button').addEventListener('click',()=>setSpin(!spinning));
  $('reset-view').addEventListener('click',()=>{
    if (!viewer) return;
    setSpin(false);
    viewer.zoomTo();
    viewer.zoom(.88);
    viewer.render();
  });
  $('frame-slider').addEventListener('input',event=>showFrame(event.target.value));
  $('play-frames').addEventListener('click',()=>{
    if (playbackTimer !== null) {stopPlayback();return;}
    if (!currentData || currentData.frames.length<2) return;
    $('play-frames').textContent='Ⅱ';
    $('play-frames').setAttribute('aria-label','再生を一時停止');
    playbackTimer=setInterval(()=>showFrame((frameIndex+1)%currentData.frames.length),550);
  });
  $('xyz-file').addEventListener('change',event=>loadFile(event.target.files?.[0]));
  const drop=$('upload-area');
  ['dragenter','dragover'].forEach(type=>drop.addEventListener(type,e=>{
    e.preventDefault();drop.classList.add('drag-over');
  }));
  ['dragleave','drop'].forEach(type=>drop.addEventListener(type,e=>{
    e.preventDefault();drop.classList.remove('drag-over');
  }));
  drop.addEventListener('drop',e=>loadFile(e.dataTransfer?.files?.[0]));
  if ('ResizeObserver' in window) {
    new ResizeObserver(()=>{viewer.resize();viewer.render();}).observe($('viewer-stage'));
  } else window.addEventListener('resize',()=>{viewer.resize();viewer.render();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stopPlayback();});
  $('reload-library').addEventListener('click',refreshUploadedLibrary);
  loadMolecule(SAMPLES.water,SAMPLES.water.xyz,'water');
  refreshUploadedLibrary();
}

window.addEventListener('DOMContentLoaded',initialize);
