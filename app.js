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
  if (Array.isArray(window.NIWASAKI_TEST_STORES)) state.stores = [...state.stores, ...window.NIWASAKI_TEST_STORES.map(normalizeStore).filter(x => !state.stores.some(s => s.id === x.id))];
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
    favorite:false, createdAt:now(), updatedAt:now()
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
  const favorites=state.stores.filter(x=>x.favorite).slice(0,3);
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
  shell("店舗を探す",state.stores.length+"件",
    '<div class="search-box"><span>⌕</span><input id="searchInput" placeholder="店舗名・コード・住所・コースで検索"></div>'+
    '<div class="section-head"><h2>店舗一覧</h2><button class="button secondary" id="newSearch">＋ 店舗登録</button></div><div id="searchResults" class="store-list"></div>');
  const draw=()=>{
    const q=$("searchInput").value.trim().toLowerCase();
    const stores=state.stores.filter(s=>!q||[s.name,s.code,s.address,s.course,s.notes].some(v=>String(v||"").toLowerCase().includes(q)));
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
  const stores=c.storeIds.map(id=>state.stores.find(s=>s.id===id)).filter(Boolean);
  $("app").innerHTML='<button class="back" id="courseBack">‹ コース一覧へ戻る</button><div class="page-head"><h1 class="page-title">'+esc(c.name)+'</h1><p class="page-sub">'+esc(c.description)+'</p></div>'+
    '<div class="store-list">'+stores.map(storeRow).join("")+'</div>';
  $("courseBack").onclick=()=>coursesPage(); bindStoreRows();
}

function detail() {
  const store=state.stores.find(x=>x.id===state.selectedId);
  if(!store)return navigate("search");
  const rows=[["状態",store.status],["コース",store.course],["納品場所",store.deliveryPlace],["搬入口",store.entrance],["駐車場所",store.parking],["車両進入経路",store.vehicleRoute],["鍵・警備",store.security],["空ケース等",store.emptyCases],["時間制限",store.timeRestriction],["注意事項",store.notes]].filter(x=>x[1]);
  const customRows=store.customFields.filter(x=>x&&x.label).map(x=>[x.label,x.value]).filter(x=>x[1]);
  const allRows=rows.concat(customRows);
  const info=allRows.length?allRows.map(x=>'<div class="info-row"><b>'+x[0]+'</b><span>'+esc(x[1])+'</span></div>').join(""):empty("配送情報がありません");
  const procedure=Array.isArray(store.procedure)&&store.procedure.length?'<section class="section"><div class="section-head"><h2>作業手順</h2></div><ol class="procedure">'+store.procedure.map(x=>'<li>'+esc(x)+'</li>').join("")+'</ol></section>':"";
  $("app").innerHTML='<div class="detail"><button class="back" id="detailBack">‹ 店舗一覧へ戻る</button><div class="detail-head"><div><h1 class="detail-title">'+esc(store.name)+'</h1><div class="meta">コード '+esc(store.code||"—")+'</div><div class="meta">'+esc(store.address||"住所未登録")+'</div>'+
    (store.phone?'<div class="meta">☎ '+esc(store.phone)+'</div>':"")+'</div><button class="star '+(store.favorite?"on":"")+'" id="detailFavorite">'+(store.favorite?"★":"☆")+'</button></div>'+
    '<div class="actions"><button class="button secondary" id="mapButton">⌖ 地図を見る</button><button class="button primary" id="editButton">情報を変更</button></div>'+
    '<div class="tabs"><button class="tab active" id="infoTab">配送情報</button><button class="tab" id="procedureTab">作業手順</button><button class="tab" id="sourceTab">出典</button></div>'+
    '<div class="info" id="detailContent">'+info+procedure+'</div></div>';
  $("detailBack").onclick=()=>navigate("search"); $("editButton").onclick=()=>edit(store.id);
  $("detailFavorite").onclick=()=>{store.favorite=!store.favorite;save();render();};
  $("mapButton").onclick=()=>{if(store.address&&store.address!=="（テストデータ）")window.open("https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(store.address),"_blank");};
  $("infoTab").onclick=()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));$("infoTab").classList.add("active");$("detailContent").innerHTML=info+procedure;};
  $("procedureTab").onclick=()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));$("procedureTab").classList.add("active");$("detailContent").innerHTML=procedure||empty("作業手順がありません");};
  $("sourceTab").onclick=()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));$("sourceTab").classList.add("active");
    const sources=store.sources.length?store.sources.map(x=>'<div class="info-row"><b>'+esc(x.type||"資料")+'</b><span>'+esc(x.name||"名称未設定")+'</span></div>').join(""):empty("出典がありません");
    const history=store.history.length?'<section class="section"><div class="section-head"><h2>更新履歴</h2></div><div class="info">'+store.history.slice().reverse().map(h=>'<div class="info-row"><b>'+esc(h.title||"更新")+'</b><span>'+esc(h.date||"")+'<br>'+esc(h.summary||"")+'<br>編集：'+esc(h.editor||"")+'</span></div>').join("")+'</div></section>':"";
    $("detailContent").innerHTML=sources+history;
  };
}

function field(key,label,store,full) {
  return '<div class="field '+(full?"full":"")+'"><label>'+label+'</label>'+(full?'<textarea id="field_'+key+'">'+esc(store[key])+'</textarea>':'<input id="field_'+key+'" value="'+esc(store[key])+'">')+'</div>';
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
    '<section class="form-card"><h2>基本情報</h2><div class="form-grid">'+field("name","店舗名",store)+field("code","店舗コード",store)+field("address","住所",store)+field("phone","電話番号",store)+field("course","コース",store)+'</div></section>'+
    '<section class="form-card"><h2>配送情報</h2><div class="form-grid">'+field("deliveryPlace","納品場所",store)+field("entrance","搬入口",store)+field("parking","駐車場所",store)+field("vehicleRoute","車両進入経路",store)+field("security","鍵・警備",store)+field("emptyCases","空ケース等の置き場所",store)+field("timeRestriction","時間制限",store)+field("notes","注意事項",store,true)+'</div></section>'+
    customFieldEditor(store)+
    '<div class="form-actions"><button class="button secondary" type="button" id="cancelButton">キャンセル</button><button class="button primary" type="submit">保存する</button></div></form></div>';
  const cancel=()=>{if(isNew){state.stores=state.stores.filter(x=>x.id!==store.id);save();}navigate("search");};
  $("cancelEdit").onclick=cancel; $("cancelButton").onclick=cancel;
  $("addCustomField").onclick=() => { addCustomField(store); renderCustomFieldEditor(store); };
  bindCustomFields(store);
  $("storeForm").onsubmit=(event)=>{event.preventDefault();
    ["name","code","address","phone","course","deliveryPlace","entrance","parking","vehicleRoute","security","emptyCases","timeRestriction","notes"].forEach(k=>store[k]=$("field_"+k).value.trim());
    const changedAt=now();
    store.updatedAt=changedAt;
    store.history=Array.isArray(store.history)?store.history:[];
    store.history.push({id:uid("h"),date:changedAt,title:isNew?"店舗登録":"店舗情報更新",summary:"基本情報・配送情報を保存",editor:"現場ユーザー",status:"draft"});
    save();state.selectedId=store.id;state.route="detail";render();
  };
}

function render() {
  document.querySelectorAll("[data-route]").forEach(b=>b.classList.toggle("active",b.dataset.route===state.route));
  if(state.route==="home")home();
  else if(state.route==="search")search();
  else if(state.route==="courses")coursesPage();
  else if(state.route==="favorites"){const f=state.stores.filter(x=>x.favorite);shell("お気に入り",f.length+"件",f.length?'<div class="store-list">'+f.map(storeRow).join("")+'</div>':empty("お気に入りはまだありません"));bindStoreRows();}
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
$("adminButton").onclick=()=>alert("管理機能は次の実装段階で追加します。");
boot();
