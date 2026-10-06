const KEY = "niwasaki.v2";

const state = {
  stores: [],
  courses: [],
  manuals: [],
  route: "home",
  selectedId: null,
  selectedCourse: null
};

const $ = (id) => document.getElementById(id);
const now = () => new Date().toISOString();
const uid = (prefix = "s") => prefix + "_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);

function esc(value) {
  return String(value ?? "").replace(/[&<>"]/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"
  }[c]));
}

function seedData() {
  const t = now();
  state.stores = [
    {
      id:"test-sg", name:"SGキャリア（テスト）", status:"通常", code:"TEST-SG", address:"（テストデータ）", phone:"",
      course:"テストコース", deliveryPlace:"3階 担当者席付近", entrance:"駐車場近くの自動扉 → EV",
      parking:"1階 月極駐車場（指定位置）", vehicleRoute:"駐車後、建物内へ", security:"日曜は入口開放待ち",
      emptyCases:"空オリコン", timeRestriction:"9:15までは駐車不可 / 9:20納品開始",
      notes:"ラジオ体操終了まで待機。資料由来のテストデータ。", favorite:true,
      procedure:["駐車場近くの自動扉から入る","左側のEVで3階へ","9:20のラジオ体操終了まで待機","担当者席へオリコンを運ぶ","メールバッグを受け渡し、記帳する"],
      sources:[{name:"【最新】★SGキャリア.pdf",type:"PDF"}], history:[{id:uid("h"),date:t,title:"テストデータ登録",summary:"旧庭先資料から初期登録",editor:"テスト",status:"approved"}], updatedAt:t
    },
    {
      id:"test-wise-west", name:"ワイズ ペリエ西小中台店（テスト）", code:"TEST-WISE-01", address:"（テストデータ）", phone:"",
      course:"三郷汎用2コース", deliveryPlace:"デリカ", entrance:"客駐の奥の搬入口", parking:"客駐の奥", vehicleRoute:"",
      security:"", emptyCases:"", timeRestriction:"指定時間内に駐車", notes:"店舗内を通ってデリカへ。持参した台車を使用。",
      favorite:false, procedure:["客駐の奥の搬入口へ進む","持参した台車で店舗内を通ってデリカへ"], sources:[{name:"三郷汎用2コース 1.17.pdf",type:"PDF"}], history:[{id:uid("h"),date:t,title:"テストデータ登録",summary:"旧庭先資料から初期登録",editor:"テスト",status:"approved"}], updatedAt:t
    },
    {
      id:"test-wise-westchiba", name:"ワイズ ペリエ西千葉店（テスト）", code:"TEST-WISE-02", address:"（テストデータ）", phone:"",
      course:"三郷汎用2コース", deliveryPlace:"バックヤード → デリカ", entrance:"ペリエ搬入口", parking:"搬入口付近", vehicleRoute:"側道から搬入口へ",
      security:"守衛室で記帳・入館証", emptyCases:"", timeRestriction:"搬入口の高さに注意", notes:"退出時に入館証を返却。検品なしとの資料記載。",
      favorite:false, procedure:["側道から搬入口へ","守衛室で記帳し入館証を取得","シャッターからバックヤードへ","持参台車でデリカへ","退出時に入館証を返却"], source:"三郷汎用2コース 1.17.pdf", updatedAt:t
    },
    {
      id:"test-wise-inage", name:"ワイズ 稲毛海岸店（テスト）", code:"TEST-WISE-03", address:"（テストデータ）", phone:"",
      course:"三郷汎用2コース", deliveryPlace:"デリカ", entrance:"駅ガード下左手の搬入口", parking:"資料記載の駐車場所", vehicleRoute:"海浜松風通りから駅方面",
      security:"", emptyCases:"", timeRestriction:"", notes:"バックヤードが非常に狭い。デリカ入口付近の動線に注意。",
      favorite:false, procedure:["駅方面へ進む","ガード下左手の搬入口へ","狭いバックヤードに注意して搬入"], source:"三郷汎用2コース 1.17.pdf", updatedAt:t
    },
    {
      id:"test-wise-makuhari", name:"ワイズ 幕張本郷店（テスト）", code:"TEST-WISE-04", address:"（テストデータ）", phone:"",
      course:"三郷汎用2コース", deliveryPlace:"2階 デリカ", entrance:"店舗手前を左", parking:"状況に応じる", vehicleRoute:"",
      security:"", emptyCases:"", timeRestriction:"", notes:"店舗前で荷下ろししているトラックがいる場合あり。",
      favorite:false, procedure:["店舗手前を左へ","状況に応じて荷下ろし場所を選ぶ","2階のデリカへ"], source:"三郷汎用2コース 1.17.pdf", updatedAt:t
    },
    {
      id:"test-wise-kasumi", name:"ワイズ 香澄店（テスト）", code:"TEST-WISE-05", address:"（テストデータ）", phone:"",
      course:"三郷汎用2コース", deliveryPlace:"店舗裏側", entrance:"店舗裏側", parking:"客駐", vehicleRoute:"左手奥の店舗裏側へ",
      security:"", emptyCases:"", timeRestriction:"", notes:"通りから店が見にくい。",
      favorite:false, procedure:["客駐へ入る","左手奥の店舗裏側へ進む"], source:"三郷汎用2コース 1.17.pdf", updatedAt:t
    }
  ];
  state.stores = state.stores.map(normalizeStore);
  if (Array.isArray(window.NIWASAKI_TEST_STORES)) state.stores = mergeImportedStores(state.stores, window.NIWASAKI_TEST_STORES);
  state.courses = [{id:"test-course-1",name:"三郷汎用2コース",description:"旧庭先資料をもとにしたテスト用コース。",storeIds:["test-wise-west","test-wise-westchiba","test-wise-inage","test-wise-makuhari","test-wise-kasumi"]}];
  state.manuals = [{
    id:"test-manual-leoc",name:"レオック ドライバーマニュアル（テスト）",version:"2023-08-01",
    sections:["運行前","積込み","配送中","納品時","報告・連絡・相談","動態管理","緊急連絡先"],
    notes:["納品場所は店舗カルテに準じる","納品時間を勝手に変更しない","配送上のトラブルは速やかに報告"],
    sources:[{name:"レオックドライバーマニュアル23.8.1更新.pdf",type:"PDF"}]
  }];
}

function load() {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || "null");
    if (value && Array.isArray(value.stores)) {
      state.stores = value.stores.map(normalizeStore);
      if (Array.isArray(window.NIWASAKI_TEST_STORES)) state.stores = mergeImportedStores(state.stores, window.NIWASAKI_TEST_STORES);
      state.courses = Array.isArray(value.courses) ? value.courses : [];
      state.manuals = Array.isArray(value.manuals) ? value.manuals : [];
      save();
      return;
    }
  } catch {}
  seedData();
  save();
}

function save() {
  localStorage.setItem(KEY, JSON.stringify({
    stores: state.stores, courses: state.courses, manuals: state.manuals
  }));
}

function normalizeStore(store) {
  const base = {
    id: uid(), name:"", code:"", address:"", phone:"", course:"",
    status:"通常", deliveryPlace:"", entrance:"", parking:"", vehicleRoute:"",
    security:"", emptyCases:"", timeRestriction:"", notes:"",
    procedure:[], photos:[], customFields:[], history:[], sources:[],
    favorite:false, archivedAt:null, archiveReason:"", editing:false, editingStartedAt:null, editingUpdatedAt:null, editingBy:"", createdAt:now(), updatedAt:now()
  };
  const merged = Object.assign(base, store || {});
  merged.photos = Array.isArray(merged.photos) ? merged.photos : [];
  merged.customFields = Array.isArray(merged.customFields) ? merged.customFields : [];
  merged.history = Array.isArray(merged.history) ? merged.history : [];
  merged.sources = Array.isArray(merged.sources)
    ? merged.sources
    : (merged.source ? [{name: merged.source, type:"source"}] : []);
  delete merged.source;
  return merged;
}

function mergeImportedStores(existing, importedRaw) {
  const existingById = new Map(existing.map(store => [store.id, store]));
  const imported = importedRaw.map(normalizeStore);
  const importedIds = new Set(imported.map(store => store.id));
  const mergedImported = imported.map(store => {
    const previous = existingById.get(store.id);
    if (!previous) return store;
    // Imported data may refresh the record, but local archive state must survive refresh.
    return Object.assign(store, {
      archivedAt: previous.archivedAt || null,
      archiveReason: previous.archiveReason || ""
    });
  });
  return [...existing.filter(store => !importedIds.has(store.id)), ...mergedImported];
}

function blankStore() {
  return normalizeStore({});
}

function navigate(route) {
  state.route = route;
  state.selectedId = null;
  state.selectedCourse = null;
  render();
  window.scrollTo(0,0);
}

function shell(title, subtitle, body) {
  $("app").innerHTML = '<div class="page-head"><h1 class="page-title">'+title+'</h1>' +
    (subtitle ? '<p class="page-sub">'+subtitle+'</p>' : '') + '</div>' + body;
}

function empty(title, subtitle) {
  return '<div class="empty"><strong>'+title+'</strong>'+(subtitle?'<span>'+subtitle+'</span>':'')+'</div>';
}

function storeRow(store) {
  return '<article class="store-row" data-store-id="'+esc(store.id)+'"><div class="thumb"></div><div>' +
    '<strong>'+esc(store.name||"名称未設定")+'</strong><small>'+esc(store.code||"コード未登録")+
    (store.course?"　"+esc(store.course):"")+'</small><small>'+esc(store.address||"住所未登録")+
    '</small></div><button class="star '+(store.favorite?"on":"")+'" data-favorite-id="'+esc(store.id)+'">'+
    (store.favorite?"★":"☆")+'</button></article>';
}

function bindStoreRows() {
  document.querySelectorAll("[data-store-id]").forEach((element)=>{
    element.onclick=(event)=>{
      if(event.target.closest("[data-favorite-id]")) return;
      state.selectedId=element.dataset.storeId; state.route="detail"; render();
    };
  });
  document.querySelectorAll("[data-favorite-id]").forEach((button)=>{
    button.onclick=(event)=>{
      event.stopPropagation();
      const store=state.stores.find(x=>x.id===button.dataset.favoriteId);
      if(!store)return;
      store.favorite=!store.favorite; save(); render();
    };
  });
}

function home() {
  const favorites=state.stores.filter(x=>x.favorite&&!x.archivedAt).slice(0,3);
  shell("ホーム","",
    '<button class="search-box" id="homeSearch"><span>⌕</span><input readonly placeholder="店舗名・コード・住所を検索"></button>'+
    '<div class="quick-list"><button class="quick-card" id="searchQuick"><span class="left"><span class="quick-icon">⌕</span><span><strong>店舗を探す</strong><small>名前・コード・住所から</small></span></span><span class="chevron">›</span></button>'+
    '<button class="quick-card" id="courseQuick"><span class="left"><span class="quick-icon">≡</span><span><strong>コースから探す</strong><small>コース別に店舗を見る</small></span></span><span class="chevron">›</span></button></div>'+
    '<section class="section"><div class="section-head"><h2>お気に入り</h2></div>'+
    (favorites.length?'<div class="store-list">'+favorites.map(storeRow).join("")+'</div>':empty("お気に入りはまだありません"))+
    '</section><section class="section"><div class="section-head"><h2>最近見た店舗</h2></div>'+
    '<div class="empty"><strong>テストデータを搭載しています</strong><span>旧庭先資料をもとにした検証用データです。</span></div></section>');
  $("homeSearch").onclick=$("searchQuick").onclick=()=>navigate("search");
  $("courseQuick").onclick=()=>navigate("courses"); bindStoreRows();
}

function search() {
  shell("店舗を探す",state.stores.filter(x=>!x.archivedAt).length+"件",
    '<div class="search-box"><span>⌕</span><input id="searchInput" placeholder="店舗名・コード・住所・コースで検索"></div>'+
    '<div class="section-head"><h2>店舗一覧</h2><button class="button secondary" id="newSearch">＋ 店舗登録</button></div><div id="searchResults" class="store-list"></div>');
  const draw=()=>{
    const q=$("searchInput").value.trim().toLowerCase();
    const stores=state.stores.filter(s=>!s.archivedAt && (!q||[s.name,s.code,s.address,s.course,s.notes].some(v=>String(v||"").toLowerCase().includes(q))));
    $("searchResults").innerHTML=stores.length?stores.map(storeRow).join(""):empty("店舗が見つかりません");
    bindStoreRows();
  };
  $("searchInput").oninput=draw; $("newSearch").onclick=()=>edit(); draw();
}

function coursesPage() {
  shell("コースから探す",state.courses.length+"コース",
    '<div class="course-list">'+state.courses.map(c=>'<button class="course-card" data-course-id="'+esc(c.id)+'"><span><strong>'+esc(c.name)+'</strong><small>'+c.storeIds.length+'店舗</small></span><span class="chevron">›</span></button>').join("")+'</div>'+
    '<section class="section"><div class="section-head"><h2>共通マニュアル</h2></div>'+state.manuals.map(m=>'<div class="form-card"><h2>'+esc(m.name)+'</h2><p class="page-sub">版：'+esc(m.version)+'</p><small>'+esc(m.source)+'</small></div>').join("")+'</section>');
  document.querySelectorAll("[data-course-id]").forEach(button=>{
    button.onclick=()=>courseDetail(button.dataset.courseId);
  });
}

function courseDetail(id) {
  const c=state.courses.find(x=>x.id===id); if(!c)return navigate("courses");
  const stores=c.storeIds.map(id=>state.stores.find(s=>s.id===id)).filter(s=>s&&!s.archivedAt);
  $("app").innerHTML='<button class="back" id="courseBack">‹ コース一覧へ戻る</button><div class="page-head"><h1 class="page-title">'+esc(c.name)+'</h1><p class="page-sub">'+esc(c.description)+'</p></div>'+
    '<div class="store-list">'+stores.map(storeRow).join("")+'</div>';
  $("courseBack").onclick=()=>coursesPage(); bindStoreRows();
}

function inlinePhotos(store, category) {
  const photos = (Array.isArray(store.photos) ? store.photos : []).filter(p => !p.deletedAt && p.category === category);
  if (!photos.length) return "";
  return '<div class="inline-photos">' + photos.map(p =>
    '<figure><img src="' + esc(p.dataUrl || p.url || "") + '" alt="' + esc(p.caption || category) + '">' +
    (p.caption ? '<figcaption>' + esc(p.caption) + '</figcaption>' : '') +
    '</figure>'
  ).join("") + '</div>';
}

function detail() {
  const store=state.stores.find(x=>x.id===state.selectedId);
  if(!store)return navigate("search");
  const rows=[["状態",store.status],["コース",store.course],["納品場所",store.deliveryPlace],["搬入口",store.entrance],["駐車場所",store.parking],["車両進入経路",store.vehicleRoute],["鍵・警備",store.security],["空ケース等",store.emptyCases],["時間制限",store.timeRestriction],["注意事項",store.notes]].filter(x=>x[1]);
  const customRows=store.customFields.filter(x=>x&&x.label).map(x=>[x.label,x.value]).filter(x=>x[1]);
  const allRows=rows.concat(customRows);
  const info=allRows.length?allRows.map(x=>'<div class="info-row"><b>'+esc(x[0])+'</b><span>'+esc(x[1])+inlinePhotos(store,x[0])+'</span></div>').join(""):empty("配送情報がありません");
  const procedure=Array.isArray(store.procedure)&&store.procedure.length?'<section class="section"><div class="section-head"><h2>作業手順</h2></div><ol class="procedure">'+store.procedure.map(x=>'<li>'+esc(x)+'</li>').join("")+'</ol></section>':"";
  $("app").innerHTML='<div class="detail"><button class="back" id="detailBack">‹ 店舗一覧へ戻る</button><div class="detail-head"><div><h1 class="detail-title">'+esc(store.name)+'</h1><div class="meta">コード '+esc(store.code||"—")+'</div><div class="meta">'+esc(store.address||"住所未登録")+'</div>'+ (store.editing?'<div class="editing-badge">編集中 · 最終保存：'+esc(store.editingUpdatedAt||"")+' · '+esc(store.editingBy||"現場ユーザー")+"</div>":"")+
    (store.phone?'<div class="meta">☎ '+esc(store.phone)+'</div>':"")+'</div><button class="star '+(store.favorite?"on":"")+'" id="detailFavorite">'+(store.favorite?"★":"☆")+'</button></div>'+
    '<div class="actions"><button class="button secondary" id="mapButton">⌖ 地図を見る</button><button class="button primary" id="editButton">情報を変更</button><button class="button danger" id="archiveButton">アーカイブ</button></div>'+
    '<div class="tabs"><button class="tab active" id="infoTab">配送情報</button><button class="tab" id="procedureTab">作業手順</button><button class="tab" id="photoTab">写真</button><button class="tab" id="sourceTab">出典</button></div>'+
    '<div class="info" id="detailContent">'+info+procedure+'</div></div>';
  $("detailBack").onclick=()=>navigate("search"); $("editButton").onclick=()=>edit(store.id);
  $("archiveButton").onclick=()=>{
    if(!confirm("「"+store.name+"」をアーカイブしますか？
通常の店舗一覧から非表示になります。")) return;
    store.archivedAt=now(); store.archiveReason="店舗管理からアーカイブ"; store.updatedAt=now();
    store.history=Array.isArray(store.history)?store.history:[];
    store.history.push({id:uid("h"),date:now(),title:"店舗アーカイブ",summary:"通常一覧からアーカイブ",editor:"管理",status:"approved"});
    save(); navigate("search");
  };
  $("detailFavorite").onclick=()=>{store.favorite=!store.favorite;save();render();};
  $("mapButton").onclick=()=>{if(store.address&&store.address!=="（テストデータ）")window.open("https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(store.address),"_blank");};
  $("infoTab").onclick=()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));$("infoTab").classList.add("active");$("detailContent").innerHTML=info+procedure;};
  $("procedureTab").onclick=()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));$("procedureTab").classList.add("active");$("detailContent").innerHTML=procedure||empty("作業手順がありません");};
  $("photoTab").onclick=()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));$("photoTab").classList.add("active"); $("detailContent").innerHTML=photoGallery(store,false);};
  $("sourceTab").onclick=()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));$("sourceTab").classList.add("active");
    const sources=store.sources.length?store.sources.map(x=>'<div class="info-row"><b>'+esc(x.type||"資料")+'</b><span>'+esc(x.name||"名称未設定")+'</span></div>').join(""):empty("出典がありません");
    const history=store.history.length?'<section class="section"><div class="section-head"><h2>更新履歴</h2></div><div class="info">'+store.history.slice().reverse().map(h=>'<div class="info-row"><b>'+esc(h.title||"更新")+'</b><span>'+esc(h.date||"")+'<br>'+esc(h.summary||"")+'<br>編集：'+esc(h.editor||"")+'</span></div>').join("")+'</div></section>':"";
    $("detailContent").innerHTML=sources+history;
  };
}

function photoGallery(store, editable=false) {
  const photos = Array.isArray(store.photos) ? store.photos.filter(p => !p.deletedAt) : [];
  const cards = photos.length ? photos.map((p, i) =>
    '<article class="photo-card">' +
      '<img src="' + esc(p.dataUrl || p.url || "") + '" alt="' + esc(p.caption || p.category || "店舗写真") + '">' +
      '<div class="photo-meta">' +
      (editable ? '<label class="photo-edit-label">項目名<select class="photo-edit-category" data-photo-id="' + esc(p.id) + '">' +
        ['搬入口','駐車場所','納品場所','車両進入経路','鍵・警備','空ケース等の置き場所','時間制限','注意事項','作業手順','店舗情報','その他'].map(cat => '<option value="'+esc(cat)+'" '+(p.category===cat?'selected':'')+'>'+esc(cat)+'</option>').join("") +
        '</select></label><label class="photo-edit-label">説明<input class="photo-edit-caption" data-photo-id="' + esc(p.id) + '" value="' + esc(p.caption || "") + '" placeholder="写真の説明"></label>' :
        '<strong>' + esc(p.category || "写真") + '</strong>' + (p.caption ? '<span>' + esc(p.caption) + '</span>' : '')) +
      (p.capturedAt ? '<small>' + esc(p.capturedAt) + '</small>' : '') +
      (editable ? '<button type="button" class="button secondary photo-remove" data-photo-index="' + i + '">削除</button>' : '') +
      '</div></article>'
  ).join("") : empty("写真はまだありません","現場写真・搬入口・駐車位置・納品場所などを追加できます。");
  return '<div class="photo-grid">' + cards + '</div>';
}

function bindPhotoMetaEdit(store) {const saveField=(selector,key)=>document.querySelectorAll(selector).forEach(el=>el.oninput=()=>{const p=store.photos.find(x=>x.id===el.dataset.photoId);if(p){p[key]=el.value;save();}});saveField(".photo-edit-category","category");saveField(".photo-edit-caption","caption");}

function bindPhotoRemove(store) {
  document.querySelectorAll(".photo-remove").forEach(button => {
    button.onclick = () => {
      const index = Number(button.dataset.photoIndex);
      if (!Number.isInteger(index)) return;
      const active = store.photos.filter(p => !p.deletedAt);
      const target = active[index];
      if (target) target.deletedAt = now();
      save();
      render();
    };
  });
}

function resizePhoto(file, maxSize=1400, quality=0.78) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.naturalWidth, img.naturalHeight));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function addPhotoFromFile(store, file, category, caption) {
  return resizePhoto(file).then(dataUrl => {
    store.photos = Array.isArray(store.photos) ? store.photos : [];
    store.photos.push({
      id: uid("photo"),
      dataUrl,
      category: category || "現場写真",
      caption: caption || "",
      capturedAt: new Date().toISOString().slice(0,10),
      uploadedBy: "実機テスト"
    });
    save();
  });
}

function field(key,label,store,full) {
  return '<div class="field '+(full?"full":"")+'"><label>'+label+'</label>'+(full?'<textarea id="field_'+key+'" data-autogrow="true">'+esc(store[key])+'</textarea>':'<textarea id="field_'+key+'" data-autogrow="true" rows="1">'+esc(store[key])+'</textarea>')+'</div>';
}

function addCustomField(store, label = "", value = "") {
  store.customFields = Array.isArray(store.customFields) ? store.customFields : [];
  store.customFields.push({
    id: uid("cf"),
    label,
    value,
    type: "text",
    order: store.customFields.length,
    visible: true
  });
}

function procedureEditor(store){return "<section class=\"form-card\"><div class=\"section-head\"><h2>作業手順</h2><button class=\"button secondary\" type=\"button\" id=\"addProcedure\">＋ 手順を追加</button></div><div id=\"procedureEditor\"></div></section>";}
function bindProcedureEditor(store){const wrap=$("procedureEditor");if(!wrap)return;wrap.innerHTML=(store.procedure||[]).map((x,i)=>"<div class=\"procedure-edit-row\" data-i=\""+i+"\"><span>"+(i+1)+"</span><textarea class=\"procedure-input\" rows=\"1\">"+esc(x)+"</textarea><button type=\"button\" class=\"button secondary procedure-remove\">削除</button></div>").join("")||"<div class=\"empty\">作業手順はありません</div>";wrap.querySelectorAll(".procedure-input").forEach(input=>{input.oninput=()=>{store.procedure[Number(input.closest("[data-i]").dataset.i)]=input.value;input.style.height="auto";input.style.height=Math.max(input.scrollHeight,46)+"px"};input.oninput()});wrap.querySelectorAll(".procedure-remove").forEach(b=>b.onclick=()=>{store.procedure.splice(Number(b.closest("[data-i]").dataset.i),1);bindProcedureEditor(store)});}
function customFieldEditor(store) {
  store.customFields = Array.isArray(store.customFields) ? store.customFields : [];
  const rows = store.customFields.map((item, index) =>
    '<div class="custom-field-row" data-custom-index="' + index + '">' +
      '<input class="custom-label" value="' + esc(item.label || "") + '" placeholder="項目名">' +
      '<input class="custom-value" value="' + esc(item.value || "") + '" placeholder="内容">' +
      '<button class="button secondary custom-remove" type="button">削除</button>' +
    '</div>'
  ).join("");
  return '<section class="form-card"><div class="section-head"><h2>追加情報</h2>' +
    '<button class="button secondary" type="button" id="addCustomField">＋ 情報を追加</button></div>' +
    '<p class="page-sub">この店舗だけに必要な情報を追加できます。</p>' +
    '<div id="customFields">' + (rows || '<div class="empty">追加情報はありません</div>') + '</div></section>';
}

function bindCustomFields(store) {
  const wrap = $("customFields");
  if (!wrap) return;
  wrap.querySelectorAll(".custom-remove").forEach((button) => {
    button.onclick = () => {
      const row = button.closest(".custom-field-row");
      const index = Number(row.dataset.customIndex);
      store.customFields.splice(index, 1);
      renderCustomFieldEditor(store);
    };
  });
  wrap.querySelectorAll(".custom-label").forEach((input) => {
    input.oninput = () => {
      const row = input.closest(".custom-field-row");
      store.customFields[Number(row.dataset.customIndex)].label = input.value;
    };
  });
  wrap.querySelectorAll(".custom-value").forEach((input) => {
    input.oninput = () => {
      const row = input.closest(".custom-field-row");
      store.customFields[Number(row.dataset.customIndex)].value = input.value;
    };
  });
}

function renderCustomFieldEditor(store) {
  const old = $("customFields");
  if (!old) return;
  old.outerHTML = '<div id="customFields">' +
    (store.customFields.length
      ? store.customFields.map((item, index) =>
          '<div class="custom-field-row" data-custom-index="' + index + '">' +
          '<input class="custom-label" value="' + esc(item.label || "") + '" placeholder="項目名">' +
          '<input class="custom-value" value="' + esc(item.value || "") + '" placeholder="内容">' +
          '<button class="button secondary custom-remove" type="button">削除</button></div>'
        ).join("")
      : '<div class="empty">追加情報はありません</div>') +
    '</div>';
  bindCustomFields(store);
}

function edit(id) {
  const isNew=!id; const store=id?state.stores.find(x=>x.id===id):blankStore(); if(!store)return;
  if(isNew)state.stores.push(store);
  $("app").innerHTML='<div class="detail"><button class="back" id="cancelEdit">‹ 戻る</button><div class="page-head"><h1 class="page-title">'+(isNew?"店舗を登録":"情報を変更")+'</h1></div><form id="storeForm">'+
    '<section class="form-card"><h2>基本情報</h2><div class="form-grid"><div class="field"><label>状態</label><select id="field_status"><option>通常</option><option>一時停止</option><option>閉店</option><option>移転</option><option>未確認</option></select></div>'+field("name","店舗名",store)+field("code","店舗コード",store)+field("address","住所",store)+field("phone","電話番号",store)+field("course","コース",store)+'</div></section>'+
    '<section class="form-card"><h2>配送情報</h2><div class="form-grid">'+field("deliveryPlace","納品場所",store)+field("entrance","搬入口",store)+field("parking","駐車場所",store)+field("vehicleRoute","車両進入経路",store)+field("security","鍵・警備",store)+field("emptyCases","空ケース等の置き場所",store)+field("timeRestriction","時間制限",store)+field("notes","注意事項",store,true)+'</div></section>'+
    'procedureEditor(store)+'<section class="form-card"><div class="section-head"><h2>写真</h2></div><div class="photo-upload"><label>項目名<select id="photoCategory"><option value="搬入口">搬入口</option><option value="駐車場所">駐車場所</option><option value="納品場所">納品場所</option><option value="車両進入経路">車両進入経路</option><option value="鍵・警備">鍵・警備</option><option value="空ケース等の置き場所">空ケース等の置き場所</option><option value="時間制限">時間制限</option><option value="注意事項">注意事項</option><option value="作業手順">作業手順</option><option value="店舗情報">店舗情報</option><option value="その他">その他</option></select></label><label id="photoOtherWrap" class="hidden-field">その他の項目名<input id="photoOtherCategory" placeholder="項目名を入力"></label><label>写真<input id="photoInput" type="file" accept="image/*" multiple></label><label>説明<input id="photoCaption" placeholder="写真の説明"></label><button class="button secondary" type="button" id="photoAddButton">写真を追加</button></div><div id="editPhotos">' + photoGallery(store,true) + '</div></section>'+
    customFieldEditor(store)+
    '<div class="form-actions"><button class="button secondary" type="button" id="cancelButton">戻る</button><button class="button secondary" type="button" id="saveDraftButton">編集中として保存</button><button class="button primary" type="submit">保存して終了</button></div></form></div>';
  $("field_status").value=store.status||"通常";
  const cancel=()=>{if(isNew&&!store.editing){state.stores=state.stores.filter(x=>x.id!==store.id);save();return navigate("search");}save();state.selectedId=store.id;state.route="detail";render();};
  $("cancelEdit").onclick=cancel; $("cancelButton").onclick=cancel;
  document.querySelectorAll("[data-autogrow]").forEach(input => {
    const grow = () => {
      input.style.height = "auto";
      input.style.height = Math.max(input.scrollHeight, 46) + "px";
    };
    input.addEventListener("input", grow);
    grow();
  });
  bindProcedureEditor(store);
  $("addProcedure").onclick=()=>{store.procedure=Array.isArray(store.procedure)?store.procedure:[];store.procedure.push("");bindProcedureEditor(store)};
  const markEditing=()=>{store.editing=true; store.editingStartedAt=store.editingStartedAt||now(); store.editingUpdatedAt=now(); store.editingBy="現場ユーザー"; store.updatedAt=store.editingUpdatedAt; save();};
  $("saveDraftButton").onclick=()=>{markEditing(); state.selectedId=store.id; state.route="detail"; render();};
  $("addCustomField").onclick=() => { addCustomField(store); renderCustomFieldEditor(store); };
  bindCustomFields(store);
  bindPhotoMetaEdit(store);
  bindPhotoRemove(store);
  const photoCategory = $("photoCategory");
  const photoOtherWrap = $("photoOtherWrap");
  const syncPhotoCategory = () => { photoOtherWrap.classList.toggle("hidden-field", photoCategory.value !== "その他"); };
  photoCategory.onchange = syncPhotoCategory; syncPhotoCategory();
  $("photoAddButton").onclick = async () => {
    const input = $("photoInput");
    const files = Array.from(input.files || []);
    if (!files.length) return;
    const selectedCategory = $("photoCategory").value;
    const category = selectedCategory === "その他" ? ($("photoOtherCategory").value.trim() || "その他") : selectedCategory;
    const caption = $("photoCaption").value.trim();
    try {
      for (const file of files) await addPhotoFromFile(store, file, category, caption);
      $("photoInput").value = "";
      $("photoCaption").value = "";
      $("photoOtherCategory").value = "";
      $("editPhotos").innerHTML = photoGallery(store,true);
      bindPhotoMetaEdit(store);
      bindPhotoRemove(store);
    } catch (error) {
      alert("写真を追加できませんでした。");
      console.error(error);
    }
  };
  $("storeForm").onsubmit=(event)=>{event.preventDefault();
    ["name","code","address","phone","course","deliveryPlace","entrance","parking","vehicleRoute","security","emptyCases","timeRestriction","notes"].forEach(k=>store[k]=$("field_"+k).value.trim());
    store.status=$("field_status").value||store.status||"通常";
    store.procedure=Array.isArray(store.procedure)?store.procedure.map(x=>String(x||"").trim()).filter(Boolean):[];
    const changedAt=now();
    store.updatedAt=changedAt;
    store.editing=true;
    store.editingStartedAt=store.editingStartedAt||changedAt;
    store.editingUpdatedAt=changedAt;
    store.editingBy="現場ユーザー";
    store.history=Array.isArray(store.history)?store.history:[];
    store.history.push({id:uid("h"),date:changedAt,title:isNew?"店舗登録":"店舗情報更新",summary:"基本情報・配送情報を保存",editor:"現場ユーザー",status:"draft"});
    save();state.selectedId=store.id;state.route="detail";render();
  };
}

function archivePage() {
  const archived=state.stores.filter(x=>x.archivedAt).slice().sort((a,b)=>String(b.archivedAt).localeCompare(String(a.archivedAt)));
  shell("アーカイブ",archived.length+"件",
    archived.length
      ? '<div class="archive-list">'+archived.map(store =>
          '<article class="archive-row"><div><strong>'+esc(store.name||"名称未設定")+'</strong><small>'+esc(store.code||"コード未登録")+'</small><small>アーカイブ：'+esc(store.archivedAt||"")+'</small></div><div class="archive-actions"><button class="button secondary" data-restore-id="'+esc(store.id)+'">復元</button><button class="button danger" data-delete-id="'+esc(store.id)+'">完全削除</button></div></article>'
        ).join("")
      : empty("アーカイブはありません","削除した店舗はここには表示されません。")
  );
  document.querySelectorAll("[data-restore-id]").forEach(button=>{
    button.onclick=()=>{
      const store=state.stores.find(x=>x.id===button.dataset.restoreId);
      if(!store)return;
      store.archivedAt=null; store.archiveReason=""; store.updatedAt=now();
      store.history=Array.isArray(store.history)?store.history:[];
      store.history.push({id:uid("h"),date:now(),title:"店舗復元",summary:"アーカイブから復元",editor:"管理",status:"approved"});
      save(); archivePage();
    };
  });
  document.querySelectorAll("[data-delete-id]").forEach(button=>{
    button.onclick=()=>{
      const store=state.stores.find(x=>x.id===button.dataset.deleteId);
      if(!store)return;
      if(!confirm("「"+store.name+"」を完全に削除しますか？
この操作は元に戻せません。"))return;
      state.stores=state.stores.filter(x=>x.id!==store.id);
      state.courses=state.courses.map(c=>Object.assign({},c,{storeIds:c.storeIds.filter(id=>id!==store.id)}));
      save(); archivePage();
    };
  });
}

function render() {
  document.querySelectorAll("[data-route]").forEach(b=>b.classList.toggle("active",b.dataset.route===state.route));
  if(state.route==="home")home();
  else if(state.route==="search")search();
  else if(state.route==="courses")coursesPage();
  else if(state.route==="favorites"){const f=state.stores.filter(x=>x.favorite&&!x.archivedAt);shell("お気に入り",f.length+"件",f.length?'<div class="store-list">'+f.map(storeRow).join("")+'</div>':empty("お気に入りはまだありません"));bindStoreRows();}
  else if(state.route==="archive") archivePage();
  else detail();
}

function boot() {
  try { load(); render(); } catch(error) {
    console.error("niwasaki boot error:",error);
    const app=$("app"); if(app)app.innerHTML='<div class="empty"><strong>niwasaki.を起動できませんでした</strong><span>JavaScriptの初期化中にエラーが発生しました。</span></div>';
  }
}

document.querySelectorAll("[data-route]").forEach(button=>button.onclick=()=>navigate(button.dataset.route));
$("brand").onclick=()=>navigate("home");
$("newStoreButton").onclick=()=>edit();
$("adminButton").onclick=()=>navigate("archive");
import("./test-data.js").then(m=>{window.NIWASAKI_TEST_STORES=m.NIWASAKI_TEST_STORES;boot();}).catch(()=>boot());
