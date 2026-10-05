const KEY="niwasaki.v1";
const state={stores:[],view:"home",selectedId:null,course:null,favOnly:false};

const $=id=>document.getElementById(id);
const uid=()=>Date.now()+"_"+Math.random().toString(36).slice(2,7);
const now=()=>new Date().toISOString();
const esc=v=>String(v??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const fmt=v=>v?new Intl.DateTimeFormat("ja-JP",{dateStyle:"medium",timeStyle:"short"}).format(new Date(v)):"—";

function load(){try{const x=JSON.parse(localStorage.getItem(KEY)||"[]");state.stores=Array.isArray(x)?x:[]}catch{state.stores=[]}}
function save(){localStorage.setItem(KEY,JSON.stringify(state.stores))}
function blank(){const t=now();return{id:"s_"+uid(),name:"",code:"",address:"",phone:"",course:"",deliveryMethod:"",deliveryPlace:"",entrance:"",parking:"",vehicleRoute:"",security:"",emptyCases:"",timeRestriction:"",notes:"",photos:[],favorite:false,createdAt:t,updatedAt:t,history:[]}}
function courses(){return [...new Set(state.stores.map(s=>String(s.course||"").trim()).filter(Boolean))].sort()}
function photo(s){return s.photos?.[0]?.dataUrl||""}
function go(v){state.view=v;state.course=null;state.favOnly=false;render();window.scrollTo({top:0,behavior:"smooth"})}
function shell(title,sub,body){$("app").innerHTML='<div class="page-head"><h1 class="page-title">'+title+'</h1>'+(sub?'<p class="page-sub">'+sub+"</p>":"")+'</div>'+body}
function empty(text,sub=""){return '<div class="empty"><strong>'+text+'</strong>'+(sub?'<p>'+sub+"</p>":"")+"</div>"}

function card(s){
 return '<article class="store-card" data-id="'+s.id+'">'+(photo(s)?'<img class="store-image" src="'+photo(s)+'" alt="">':'<div class="store-image empty"></div>')+
 '<button class="star '+(s.favorite?"on":"")+'" data-fav="'+s.id+'" aria-label="お気に入り">'+(s.favorite?"★":"☆")+'</button>'+
 '<div class="store-body"><strong>'+esc(s.name||"名称未設定")+'</strong><small>'+esc(s.code||"コード未登録")+(s.course?"　"+esc(s.course):"")+"</small></div></article>"
}
function row(s){
 return '<article class="store-row" data-id="'+s.id+'">'+(photo(s)?'<img class="row-image" src="'+photo(s)+'" alt="">':'<span class="row-image empty"></span>')+
 '<div><strong>'+esc(s.name||"名称未設定")+'</strong><small>'+esc(s.code||"コード未登録")+'　'+esc(s.address||"住所未登録")+'</small>'+(s.course?'<small>コース：'+esc(s.course)+"</small>":"")+'</div>'+
 '<button class="star '+(s.favorite?"on":"")+'" data-fav="'+s.id+'">'+(s.favorite?"★":"☆")+"</button></article>"
}
function bindCards(){
 document.querySelectorAll("[data-id]").forEach(el=>el.onclick=e=>{if(e.target.closest("[data-fav]"))return;detail(el.dataset.id)});
 document.querySelectorAll("[data-fav]").forEach(b=>b.onclick=e=>{e.stopPropagation();toggleFav(b.dataset.fav)});
}
function home(){
 const fav=state.stores.filter(s=>s.favorite).slice(0,3);
 const recent=[...state.stores].sort((a,b)=>new Date(b.updatedAt)-new Date(a.updatedAt)).slice(0,3);
 shell("ホーム","",'<button class="search-box" id="homeSearch"><span class="search-icon">⌕</span><input readonly placeholder="店舗名・コード・住所を検索"></button>'+
 '<div class="quick-list"><button class="quick-card" id="goSearch"><span class="left"><span class="quick-icon">⌕</span><span><strong>店舗を探す</strong><small>名前・コード・住所から</small></span></span><span class="chevron">›</span></button>'+
 '<button class="quick-card" id="goCourse"><span class="left"><span class="quick-icon">≡</span><span><strong>コースから探す</strong><small>コース別に店舗を見る</small></span></span><span class="chevron">›</span></button></div>'+
 '<section class="section"><div class="section-head"><h2>お気に入り</h2>'+(fav.length?'<button class="link-btn" id="allFav">すべて見る</button>':"")+'</div>'+(fav.length?'<div class="store-grid">'+fav.map(card).join("")+"</div>":empty("お気に入りはまだありません","店舗の☆から登録できます。"))+"</section>"+
 '<section class="section"><div class="section-head"><h2>最近見た店舗</h2></div>'+(recent.length?'<div class="store-grid">'+recent.map(card).join("")+"</div>":empty("最近見た店舗はありません"))+"</section>");
 $("homeSearch").onclick=()=>go("search");$("goSearch").onclick=()=>go("search");$("goCourse").onclick=()=>go("courses");$("allFav")?.addEventListener("click",()=>go("favorites"));bindCards();
}
function search(){
 shell("店舗を探す",state.stores.length+"件",'<div class="search-box"><span class="search-icon">⌕</span><input id="q" autofocus placeholder="店舗名・コード・住所で検索"></div>'+
 '<div class="filter-row"><select id="courseFilter" class="select"><option value="">すべてのコース</option>'+courses().map(c=>'<option value="'+esc(c)+'">'+esc(c)+"</option>").join("")+'</select><button id="favFilter" class="filter-btn">☆ お気に入り</button><button id="newBtn" class="filter-btn">＋ 店舗登録</button></div><div id="results" class="list"></div>');
 const renderList=()=>{const q=$("q").value.trim().toLowerCase(),c=$("courseFilter").value;const list=state.stores.filter(s=>(!q||[s.name,s.code,s.address,s.course].some(v=>String(v||"").toLowerCase().includes(q)))&&(!c||s.course===c)&&(!state.favOnly||s.favorite));$("results").innerHTML=list.length?list.map(row).join(""):empty("条件に合う店舗がありません");bindCards()};
 $("q").oninput=renderList;$("courseFilter").onchange=renderList;$("favFilter").onclick=()=>{state.favOnly=!state.favOnly;$("favFilter").classList.toggle("active",state.favOnly);renderList()};$("newBtn").onclick=()=>edit();renderList();
}
function coursesPage(){
 const list=courses();
 shell("コースから探す","",'<div class="course-grid">'+(list.length?list.map(c=>'<button class="course-card" data-course="'+esc(c)+'"><span><strong>'+esc(c)+'</strong><small>'+state.stores.filter(s=>s.course===c).length+"店舗</small></span><span class="chevron">›</span></button>").join(""):empty("コースが登録されていません"))+"</div>"+
 (state.course?'<section class="section"><div class="section-head"><h2>'+esc(state.course)+'</h2><button class="link-btn" id="clearCourse">すべてのコース</button></div><div class="list">'+state.stores.filter(s=>s.course===state.course).map(row).join("")+"</div></section>":""));
 document.querySelectorAll("[data-course]").forEach(b=>b.onclick=()=>{state.course=b.dataset.course;coursesPage()});$("clearCourse")?.addEventListener("click",()=>{state.course=null;coursesPage()});bindCards();
}
function detail(id){
 const s=state.stores.find(x=>x.id===id);if(!s){go("search");return}state.selectedId=id;
 const rows=[["コース",s.course],["納品方法",s.deliveryMethod],["搬入口",s.entrance],["駐車場所",s.parking],["納品場所",s.deliveryPlace],["車両進入経路",s.vehicleRoute],["鍵・警備",s.security],["空ケース等の置き場所",s.emptyCases],["時間制限",s.timeRestriction],["注意事項",s.notes]].filter(x=>x[1]);
 const delivery=()=>'<div class="info-table">'+(rows.length?rows.map(x=>'<div class="info-row"><b>'+x[0]+'</b><span>'+esc(x[1])+"</span></div>").join(""):empty("配送情報がありません"))+"</div>";
 const photos=(s.photos||[]).map(p=>'<img src="'+p.dataUrl+'" alt="'+esc(p.note||p.category||"写真")+'">').join("");
 const history=(s.history||[]).slice().reverse().map(h=>'<article class="history-item"><time>'+fmt(h.at)+'</time><strong>'+esc(h.title)+'</strong><div>'+esc(h.detail)+'</div><small>編集者：'+esc(h.editor||"—")+'　状態：'+esc(h.status||"—")+"</small></article>").join("");
 $("app").innerHTML='<div class="detail-wrap"><button class="back-btn" id="back">‹ 店舗一覧へ戻る</button>'+
 (photo(s)?'<img class="hero-photo" src="'+photo(s)+'" alt="">':"")+
 '<div class="detail-title-row"><div><h1 class="detail-title">'+esc(s.name||"名称未設定")+'</h1><div class="code">コード '+esc(s.code||"—")+'</div><div class="address">'+esc(s.address||"住所未登録")+'</div>'+(s.phone?'<div class="address">☎ '+esc(s.phone)+"</div>":"")+'</div><button class="star '+(s.favorite?"on":"")+'" id="detailFav">'+(s.favorite?"★":"☆")+'</button></div>'+
 '<div class="detail-actions"><button class="btn" id="mapBtn">⌖ 地図を見る</button><button class="btn dark" id="editBtn">情報を変更</button></div>'+
 '<div class="tabs"><button class="tab active" data-tab="delivery">配送情報</button><button class="tab" data-tab="photos">写真'+(s.photos?.length?" ("+s.photos.length+")":"")+'</button><button class="tab" data-tab="history">更新履歴</button></div><div id="tabContent">'+delivery()+"</div></div>";
 $("back").onclick=()=>go("search");$("editBtn").onclick=()=>edit(id);$("detailFav").onclick=()=>toggleFav(id);$("mapBtn").onclick=()=>{if(s.address)window.open("https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(s.address),"_blank")};
 document.querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));b.classList.add("active");$("tabContent").innerHTML=b.dataset.tab==="delivery"?delivery():b.dataset.tab==="photos"?'<div class="photos">'+(photos||empty("写真がありません"))+"</div>":'<div class="history">'+(history||empty("更新履歴がありません"))+"</div>"});
}
function field(name,label,s,required=false,full=false){return '<div class="field '+(full?"full":"")+'"><label>'+label+(required?" *":"")+"</label>"+(full?'<textarea id="f_'+name+'">'+esc(s[name])+"</textarea>":'<input id="f_'+name+'" value="'+esc(s[name])+'" '+(required?"required":"")+">")+"</div>"}
function edit(id){
 const s=id?state.stores.find(x=>x.id===id):blank(),isNew=!id;if(isNew)state.stores.push(s);
 $("app").innerHTML='<div class="detail-wrap"><button class="back-btn" id="cancelEdit">‹ 戻る</button><div class="page-head"><h1 class="page-title">'+(isNew?"店舗を登録":"情報を変更")+'</h1><p class="page-sub">'+(isNew?"店舗情報を入力してください":"変更内容を保存すると履歴に記録されます。")+'</p></div><form id="form">'+
 '<section class="form-card"><h2>基本情報</h2><div class="form-grid">'+field("name","店舗名",s,true)+field("code","店舗コード",s)+field("address","住所",s)+field("phone","電話番号",s)+field("course","コース",s)+'</div></section>'+
 '<section class="form-card"><h2>配送情報</h2><div class="form-grid">'+field("deliveryMethod","納品方法",s)+field("deliveryPlace","納品場所",s)+field("entrance","搬入口",s)+field("parking","駐車場所",s)+field("vehicleRoute","車両進入経路",s)+field("security","鍵・警備",s)+field("emptyCases","空ケース等の置き場所",s)+field("timeRestriction","時間制限",s)+field("notes","注意事項",s,false,true)+'</div></section>'+
 '<div class="form-actions"><button type="button" class="btn" id="cancel2">キャンセル</button><button class="btn dark" type="submit">'+(isNew?"登録する":"更新を保存")+"</button></div></form></div>";
 const cancel=()=>{if(isNew){state.stores=state.stores.filter(x=>x.id!==s.id);save()}isNew?go("search"):detail(id)};$("cancelEdit").onclick=cancel;$("cancel2").onclick=cancel;
 $("form").onsubmit=e=>{e.preventDefault();["name","code","address","phone","course","deliveryMethod","deliveryPlace","entrance","parking","vehicleRoute","security","emptyCases","timeRestriction","notes"].forEach(k=>s[k]=$("f_"+k).value.trim());s.updatedAt=now();s.history=s.history||[];s.history.push({at:s.updatedAt,title:isNew?"店舗登録":"情報変更",detail:isNew?"店舗を登録しました":"情報を変更しました",editor:"社員番号",status:"保存済み"});save();detail(s.id)};
}
function toggleFav(id){const s=state.stores.find(x=>x.id===id);if(!s)return;s.favorite=!s.favorite;save();if(state.view==="home")home();else if(state.view==="search"||state.view==="favorites")search();else detail(id)}
function render(){document.querySelectorAll("[data-nav]").forEach(b=>b.classList.toggle("active",b.dataset.nav===state.view));if(state.view==="home")home();else if(state.view==="search")search();else if(state.view==="courses")coursesPage();else if(state.view==="favorites"){state.favOnly=true;search()}else detail(state.selectedId)}
document.querySelectorAll("[data-nav]").forEach(b=>b.onclick=()=>go(b.dataset.nav));$("brandButton").onclick=()=>go("home");$("headerNew").onclick=()=>edit();
load();render();
