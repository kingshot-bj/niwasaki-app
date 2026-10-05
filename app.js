const KEY="niwasaki.v1";
const state={stores:[],selectedId:null,view:"home",course:null,favOnly:false};

const $=id=>document.getElementById(id);
const uid=()=>Date.now()+"_"+Math.random().toString(36).slice(2,7);
const now=()=>new Date().toISOString();
const esc=v=>String(v??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const fmt=v=>v?new Intl.DateTimeFormat("ja-JP",{dateStyle:"medium",timeStyle:"short"}).format(new Date(v)):"—";

function load(){try{const x=JSON.parse(localStorage.getItem(KEY)||"[]");state.stores=Array.isArray(x)?x:[]}catch{state.stores=[]}}
function save(){localStorage.setItem(KEY,JSON.stringify(state.stores))}
function blank(){const t=now();return{id:"s_"+uid(),name:"",code:"",address:"",phone:"",course:"",deliveryMethod:"",deliveryPlace:"",entrance:"",parking:"",vehicleRoute:"",security:"",emptyCases:"",timeRestriction:"",notes:"",photos:[],favorite:false,createdAt:t,updatedAt:t,history:[]}}
function courses(){return [...new Set(state.stores.map(s=>String(s.course||"").trim()).filter(Boolean))].sort()}
function firstPhoto(s){return s.photos&&s.photos[0]?s.photos[0].dataUrl:""}

function shell(title,sub,body){
 $("app").innerHTML='<div class="page-head"><div><h1 class="page-title">'+title+'</h1>'+(sub?'<p class="page-sub">'+sub+"</p>":"")+'</div></div>'+body;
}

function home(){
 const fav=state.stores.filter(s=>s.favorite);
 const recent=[...state.stores].sort((a,b)=>new Date(b.updatedAt)-new Date(a.updatedAt)).slice(0,6);
 shell("ホーム","必要な店舗情報へ、すぐに。",'<button class="search-box" id="homeSearch"><span>⌕</span><input readonly placeholder="店舗名・コード・住所を検索"></button>'+
 '<div class="section"><div class="quick-grid"><button class="quick-card" id="goSearch"><div><div class="qicon">⌕</div><strong>店舗を探す</strong><small>名前・コード・住所から</small></div><b>›</b></button>'+
 '<button class="quick-card" id="goCourse"><div><div class="qicon">⌘</div><strong>コースから探す</strong><small>コース別に店舗を見る</small></div><b>›</b></button></div></div>'+
 section("お気に入り",fav,"お気に入りはまだありません")+section("最近見た店舗",recent,"店舗がまだありません"));
 $("goSearch").onclick=()=>navigate("search");$("homeSearch").onclick=()=>navigate("search");$("goCourse").onclick=()=>navigate("courses");
 bindCards();
}
function section(title,list,emptyText){
 return '<section class="section"><div class="section-head"><h2>'+title+'</h2></div>'+(list.length?'<div class="store-grid">'+list.slice(0,3).map(card).join("")+"</div>":'<div class="empty"><strong>'+emptyText+"</strong></div>")+"</section>";
}
function card(s){
 const img=firstPhoto(s);
 return '<article class="store-card" data-id="'+s.id+'">'+(img?'<img src="'+img+'" alt="">':'<div style="height:150px;background:#eee"></div>')+
 '<button class="star '+(s.favorite?"on":"")+'" data-fav="'+s.id+'">'+(s.favorite?"★":"☆")+"</button>"+
 '<div class="store-card-body"><strong>'+esc(s.name||"名称未設定")+'</strong><small>コード '+esc(s.code||"—")+(s.course?"　"+esc(s.course):"")+"</small></div></article>";
}
function row(s){
 const img=firstPhoto(s);
 return '<article class="store-row" data-id="'+s.id+'">'+(img?'<img src="'+img+'" alt="">':'<div></div>')+
 '<div><strong>'+esc(s.name||"名称未設定")+'</strong><small>コード '+esc(s.code||"—")+'　'+esc(s.address||"住所未登録")+'</small>'+(s.course?'<small>コース：'+esc(s.course)+"</small>":"")+
 '</div><button class="star '+(s.favorite?"on":"")+'" data-fav="'+s.id+'">'+(s.favorite?"★":"☆")+"</button></article>";
}
function search(){
 shell("店舗を探す",state.stores.length+"件の店舗",'<button class="search-box"><span>⌕</span><input id="q" placeholder="店舗名・コード・住所で検索"></button>'+
 '<div class="filter-row"><select id="courseFilter" class="select"><option value="">すべてのコース</option>'+courses().map(c=>'<option value="'+esc(c)+'">'+esc(c)+"</option>").join("")+'</select><button id="favFilter" class="filter-btn">☆ お気に入りのみ</button><button id="newBtn" class="filter-btn">＋ 店舗を登録</button></div><div id="results" class="list"></div>');
 const render=()=>{const q=$("q").value.trim().toLowerCase(),c=$("courseFilter").value;
 const list=state.stores.filter(s=>(!q||[s.name,s.code,s.address,s.course].some(v=>String(v||"").toLowerCase().includes(q)))&&(!c||s.course===c)&&(!state.favOnly||s.favorite));
 $("results").innerHTML=list.length?list.map(row).join(""):'<div class="empty"><strong>条件に合う店舗がありません</strong></div>';bindCards()};
 $("q").oninput=render;$("courseFilter").onchange=render;$("favFilter").onclick=()=>{state.favOnly=!state.favOnly;$("favFilter").classList.toggle("active",state.favOnly);render()};$("newBtn").onclick=()=>edit();
 render();
}
function coursesPage(){
 shell("コースから探す","担当コースから店舗を確認",'<div class="course-grid">'+(courses().length?courses().map(c=>'<button class="course-card" data-course="'+esc(c)+'"><div><strong>'+esc(c)+'</strong><small>'+state.stores.filter(s=>s.course===c).length+"店舗</small></div><b>›</b></button>").join(""):'<div class="empty"><strong>コースが登録されていません</strong></div>')+"</div>"+
 (state.course?'<section class="section"><div class="section-head"><h2>'+esc(state.course)+' の店舗一覧</h2><button class="link-btn" id="clearCourse">すべてのコース</button></div><div class="list">'+state.stores.filter(s=>s.course===state.course).map(row).join("")+"</div></section>":""));
 document.querySelectorAll("[data-course]").forEach(b=>b.onclick=()=>{state.course=b.dataset.course;coursesPage()});
 if($("clearCourse"))$("clearCourse").onclick=()=>{state.course=null;coursesPage()};
 bindCards();
}
function detail(id){
 const s=state.stores.find(x=>x.id===id);if(!s)return navigate("search");
 state.selectedId=id;
 const rows=[["コース",s.course],["搬入口",s.entrance],["駐車場所",s.parking],["納品場所",s.deliveryPlace],["車両進入経路",s.vehicleRoute],["鍵・警備",s.security],["空ケース等の置き場所",s.emptyCases],["時間制限",s.timeRestriction],["注意事項",s.notes]].filter(x=>x[1]);
 const photos=(s.photos||[]).map(p=>'<img src="'+p.dataUrl+'" alt="'+esc(p.note||p.category||"写真")+'">').join("");
 $("app").innerHTML='<div class="detail-wrap"><button class="back-btn" id="back">‹ 店舗一覧へ戻る</button>'+
 (firstPhoto(s)?'<img class="hero-photo" src="'+firstPhoto(s)+'" alt="">':"")+
 '<div class="detail-title-row"><div><h1 class="detail-title">'+esc(s.name||"名称未設定")+'</h1><div class="code">コード '+esc(s.code||"—")+'</div><div class="address">'+esc(s.address||"住所未登録")+'</div>'+(s.phone?'<div class="address">☎ '+esc(s.phone)+"</div>":"")+'</div>'+
 '<button class="star '+(s.favorite?"on":"")+'" id="detailFav">'+(s.favorite?"★":"☆")+"</button></div>"+
 '<div class="detail-actions"><button class="btn" id="mapBtn">⌖ 地図を見る</button><button class="btn dark" id="editBtn">情報を変更</button></div>'+
 '<div class="tabs"><button class="tab active" data-tab="delivery">配送情報</button><button class="tab" data-tab="photos">写真'+(s.photos?.length?" ("+s.photos.length+")":"")+'</button><button class="tab" data-tab="history">更新履歴</button></div>'+
 '<div id="tabContent"><div class="info-table">'+(rows.length?rows.map(x=>'<div class="info-row"><b>'+x[0]+'</b><span>'+esc(x[1])+"</span></div>").join(""):'<div class="empty"><strong>配送情報がありません</strong></div>')+"</div></div></div>";
 $("back").onclick=()=>navigate("search");$("editBtn").onclick=()=>edit(id);$("detailFav").onclick=()=>toggleFav(id);
 $("mapBtn").onclick=()=>{if(s.address)window.open("https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(s.address),"_blank")};
 document.querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));b.classList.add("active");if(b.dataset.tab==="photos")$("tabContent").innerHTML='<div class="photos">'+(photos||'<div class="empty"><strong>写真がありません</strong></div>')+"</div>";else if(b.dataset.tab==="history")$("tabContent").innerHTML='<div class="history">'+((s.history||[]).slice().reverse().map(h=>'<article class="history-item"><time>'+fmt(h.at)+'</time><strong>'+esc(h.title)+'</strong><div>'+esc(h.detail)+'</div><small>編集者：'+esc(h.editor||"—")+'　状態：'+esc(h.status||"—")+"</small></article>").join("")||'<div class="empty"><strong>更新履歴がありません</strong></div>')+"</div>";else $("tabContent").innerHTML='<div class="info-table">'+(rows.length?rows.map(x=>'<div class="info-row"><b>'+x[0]+'</b><span>'+esc(x[1])+"</span></div>").join(""):'<div class="empty"><strong>配送情報がありません</strong></div>')+"</div>"});
}
function edit(id){
 const s=id?state.stores.find(x=>x.id===id):blank(),isNew=!id;if(isNew)state.stores.push(s);
 const fs=[["name","店舗名",1],["code","店舗コード"],["address","住所"],["phone","電話番号"],["course","コース"],["entrance","搬入口"],["parking","駐車場所"],["deliveryPlace","納品場所"],["vehicleRoute","車両進入経路"],["security","鍵・警備"],["emptyCases","空ケース等の置き場所"],["timeRestriction","時間制限"],["notes","注意事項",0,1]];
 $("app").innerHTML='<div class="detail-wrap"><button class="back-btn" id="cancelEdit">‹ 戻る</button><div class="page-head"><div><h1 class="page-title">'+(isNew?"店舗を登録":"情報を変更")+'</h1><p class="page-sub">'+(isNew?"店舗情報を入力してください":"変更内容は更新申請として記録します。")+"</p></div></div><form id="form"><div class="form-card"><h2>基本情報</h2><div class="form-grid">'+fs.slice(0,5).map(f=>field(f,s)).join("")+'</div></div><div class="form-card"><h2>配送情報</h2><div class="form-grid">'+fs.slice(5).map(f=>field(f,s)).join("")+'</div></div><div class="form-actions"><button type="button" class="btn" id="cancel2">キャンセル</button><button class="btn dark" type="submit">'+(isNew?"登録する":"更新を申請する")+"</button></div></form></div>";
 const cancel=()=>{if(isNew){state.stores=state.stores.filter(x=>x.id!==s.id);save()}isNew?navigate("search"):detail(id)};
 $("cancelEdit").onclick=cancel;$("cancel2").onclick=cancel;
 $("form").onsubmit=e=>{e.preventDefault();fs.forEach(f=>s[f[0]]=$("f_"+f[0]).value.trim());s.updatedAt=now();s.history=s.history||[];s.history.push({at:s.updatedAt,title:isNew?"店舗登録":"情報変更",detail:isNew?"店舗を登録しました":"変更内容を更新申請しました",editor:"社員番号",status:isNew?"承認済み":"申請中"});save();detail(s.id)};
}
function field(f,s){return '<div class="field '+(f[3]?"full":"")+'"><label>'+f[1]+(f[2]?" *":"")+"</label>"+(f[3]?'<textarea id="f_'+f[0]+'">'+esc(s[f[0]])+"</textarea>":'<input id="f_'+f[0]+'" value="'+esc(s[f[0]])+'" '+(f[2]?"required":"")+">")+"</div>"}
function toggleFav(id){const s=state.stores.find(x=>x.id===id);if(s){s.favorite=!s.favorite;save();detail(id)}}
function bindCards(){document.querySelectorAll("[data-id]").forEach(e=>e.onclick=x=>{if(x.target.closest("[data-fav]"))return;detail(e.dataset.id)});document.querySelectorAll("[data-fav]").forEach(b=>b.onclick=e=>{e.stopPropagation();toggleFav(b.dataset.fav)})}
function navigate(v){state.view=v;state.course=null;state.favOnly=false;render()}
function render(){if(state.view==="home")home();else if(state.view==="search")search();else if(state.view==="courses")coursesPage();else if(state.view==="favorites"){state.favOnly=true;search()}else detail(state.selectedId)}
document.querySelectorAll("[data-nav]").forEach(b=>b.onclick=()=>navigate(b.dataset.nav));
if($("newStoreButton"))$("newStoreButton").onclick=()=>edit();
if($("searchInput"))$("searchInput").oninput=()=>{navigate("search")};
$("mapsButton")?.remove();

load();render();
