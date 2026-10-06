(() => {
  const KEY = "niwasaki.v2";
  const RECENT_KEY = "niwasaki.recent.v1";
  const NAV_KEY = "niwasaki.nav.v1";

  const esc = (v) => String(v ?? "").replace(/[&<>"]/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"
  }[c]));

  const read = () => {
    try {
      const v = JSON.parse(localStorage.getItem(KEY) || "null");
      return v && Array.isArray(v.stores) ? v : {stores:[],courses:[],manuals:[]};
    } catch { return {stores:[],courses:[],manuals:[]}; }
  };
  const write = (v) => localStorage.setItem(KEY, JSON.stringify(v));
  const app = () => document.getElementById("app");

  function pageKey() {
    const a = app();
    if (!a) return "";
    const detail = a.querySelector(".detail-title");
    if (detail) return "detail:" + detail.textContent.trim();
    const h = a.querySelector(".page-title");
    if (h) return h.textContent.trim();
    return "";
  }

  function rememberRecent(id) {
    if (!id) return;
    let list = [];
    try { list = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); } catch {}
    list = [id, ...list.filter(x => x !== id)].slice(0, 8);
    localStorage.setItem(RECENT_KEY, JSON.stringify(list));
  }

  function enhanceRecent() {
    const a = app();
    if (!a || !a.querySelector(".page-title") || a.querySelector(".detail-title")) return;
    if (a.querySelector(".page-title").textContent.trim() !== "ホーム") return;
    const section = [...a.querySelectorAll(".section")].find(s => s.querySelector("h2")?.textContent.trim() === "最近見た店舗");
    if (!section) return;
    const data = read();
    let ids = [];
    try { ids = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); } catch {}
    const stores = ids.map(id => data.stores.find(s => s.id === id)).filter(s => s && !s.archivedAt);
    if (!stores.length) return;
    section.innerHTML = '<div class="section-head"><h2>最近見た店舗</h2></div><div class="store-list">' +
      stores.map(s => '<article class="store-row stage-recent-row" data-stage-store-id="'+esc(s.id)+'"><div class="thumb"></div><div><strong>'+esc(s.name||"名称未設定")+'</strong><small>'+esc(s.code||"コード未登録")+'</small><small>'+esc(s.address||"住所未登録")+'</small></div><span class="chevron">›</span></article>').join("") +
      '</div>';
    section.querySelectorAll("[data-stage-store-id]").forEach(row => {
      row.onclick = () => openStore(row.dataset.stageStoreId);
    });
  }

  function openStore(id) {
    rememberRecent(id);
    const row = document.querySelector('[data-store-id="'+CSS.escape(id)+'"]');
    if (row) { row.click(); return; }
    const data = read();
    const store = data.stores.find(s => s.id === id);
    if (!store) return;
    // Re-enter through the app's store list when the previous page is not currently showing the row.
    const nav = document.querySelector('[data-route="search"]');
    if (nav) {
      sessionStorage.setItem(NAV_KEY, JSON.stringify({type:"store",id}));
      nav.click();
    }
  }

  function installSearchMemory() {
    const input = document.getElementById("searchInput");
    if (!input || input.dataset.stageBound) return;
    input.dataset.stageBound = "1";
    const saved = sessionStorage.getItem("niwasaki.searchQuery");
    if (saved) { input.value = saved; input.dispatchEvent(new Event("input")); }
    input.addEventListener("input", () => sessionStorage.setItem("niwasaki.searchQuery", input.value));
  }

  function addStickySave() {
    const form = document.getElementById("storeForm");
    if (!form || document.getElementById("stageStickySave")) return;
    const bar = document.createElement("div");
    bar.id = "stageStickySave";
    bar.className = "stage-sticky-save";
    bar.innerHTML =
      '<button type="button" class="button secondary" id="stageStickyBack">戻る</button>' +
      '<span>編集内容を保存</span>' +
      '<div><button type="button" class="button secondary" id="stageStickyDraft">編集中として保存</button>' +
      '<button type="button" class="button primary" id="stageStickySubmit">保存して終了</button></div>';
    document.body.appendChild(bar);
    const bottomCancel = document.getElementById("cancelButton");
    const draft = document.getElementById("saveDraftButton");
    const submit = form.querySelector('button[type="submit"]');
    document.getElementById("stageStickyBack").onclick = () => bottomCancel?.click();
    document.getElementById("stageStickyDraft").onclick = () => draft?.click();
    document.getElementById("stageStickySubmit").onclick = () => submit?.click();
  }

  function installBackButtons() {
    const a = app();
    if (!a) return;
    const back = a.querySelector("#detailBack");
    if (back && !back.dataset.stageBound) {
      back.dataset.stageBound = "1";
      back.onclick = () => goBack("search");
    }
    const courseBack = a.querySelector("#courseBack");
    if (courseBack && !courseBack.dataset.stageBound) {
      courseBack.dataset.stageBound = "1";
      courseBack.onclick = () => goBack("courses");
    }
  }

  function goBack(fallback) {
    const target = sessionStorage.getItem("niwasaki.previousRoute") || fallback;
    sessionStorage.removeItem("niwasaki.previousRoute");
    const nav = document.querySelector('[data-route="'+target+'"]');
    if (nav) nav.click(); else location.reload();
  }

  function trackClicks() {
    const a = app();
    if (!a || a.dataset.stageTrack) return;
    a.dataset.stageTrack = "1";
    a.addEventListener("click", e => {
      const row = e.target.closest("[data-store-id]");
      if (row && row.dataset.storeId) {
        rememberRecent(row.dataset.storeId);
        const key = pageKey();
        if (key && key !== "店舗を探す") sessionStorage.setItem("niwasaki.previousRoute", "search");
      }
      const course = e.target.closest("[data-course-id]");
      if (course) sessionStorage.setItem("niwasaki.previousRoute", "courses");
    });
  }

  function courseEditor(courseId) {
    const data = read();
    const editing = courseId ? data.courses.find(c => c.id === courseId) : null;
    const course = editing ? JSON.parse(JSON.stringify(editing)) : {
      id:"course_" + Date.now(),
      name:"",
      number:"",
      days:"",
      description:"",
      storeIds:[]
    };
    const stores = data.stores.filter(s => !s.archivedAt);
    const selected = new Set(course.storeIds || []);
    const available = stores.filter(s => !selected.has(s.id));

    app().innerHTML =
      '<div class="stage-course-editor">' +
      '<button class="back" id="stageCourseCancel">‹ コース一覧へ戻る</button>' +
      '<div class="page-head"><h1 class="page-title">'+(editing?"コースを編集":"コースを登録")+'</h1><p class="page-sub">店舗の順番を並べ替えてコースを設計できます。</p></div>' +
      '<section class="form-card"><div class="form-grid">' +
      '<div class="field"><label>コース番号</label><textarea id="stageCourseNumber" data-autogrow rows="1">'+esc(course.number||"")+'</textarea></div>' +
      '<div class="field"><label>コース名</label><textarea id="stageCourseName" data-autogrow rows="1">'+esc(course.name||"")+'</textarea></div>' +
      '<div class="field"><label>曜日</label><textarea id="stageCourseDays" data-autogrow rows="1" placeholder="例：月・水・金">'+esc(course.days||"")+'</textarea></div>' +
      '<div class="field full"><label>説明</label><textarea id="stageCourseDescription" data-autogrow>'+esc(course.description||"")+'</textarea></div>' +
      '</div></section>' +
      '<section class="form-card"><div class="section-head"><h2>配送順</h2><span class="page-sub">ドラッグ＆ドロップ / ▲▼で変更</span></div>' +
      '<div id="stageSelectedStores" class="stage-course-stores"></div></section>' +
      '<section class="form-card"><div class="section-head"><h2>コースへ追加</h2></div><div id="stageAvailableStores" class="stage-available-stores"></div></section>' +
      '<div class="form-actions"><button class="button secondary" type="button" id="stageCourseCancel2">戻る</button><button class="button primary" type="button" id="stageCourseSave">保存して終了</button></div>' +
      '</div>';

    const renderLists = () => {
      const selectedIds = [...selected];
      const selectedHtml = selectedIds.length ? selectedIds.map((id,i) => {
        const s=stores.find(x=>x.id===id); if(!s) return "";
        return '<article class="stage-course-store" draggable="true" data-stage-course-store="'+esc(id)+'">' +
          '<span class="stage-drag">☷</span><strong>'+ (i+1) +'</strong><div><b>'+esc(s.name||"名称未設定")+'</b><small>'+esc(s.code||"")+'</small></div>' +
          '<button type="button" class="button secondary stage-up" data-id="'+esc(id)+'">▲</button>' +
          '<button type="button" class="button secondary stage-down" data-id="'+esc(id)+'">▼</button>' +
          '<button type="button" class="button secondary stage-remove" data-id="'+esc(id)+'">削除</button></article>';
      }).join("") : '<div class="empty">まだ店舗がありません</div>';
      const availableIds = stores.filter(s=>!selected.has(s.id));
      const availableHtml = availableIds.length ? availableIds.map(s =>
        '<button type="button" class="stage-add-store" data-id="'+esc(s.id)+'"><span>＋</span><span><b>'+esc(s.name||"名称未設定")+'</b><small>'+esc(s.code||"")+'</small></span></button>'
      ).join("") : '<div class="empty">追加できる店舗はありません</div>';
      document.getElementById("stageSelectedStores").innerHTML=selectedHtml;
      document.getElementById("stageAvailableStores").innerHTML=availableHtml;
      bindDrag();
      document.querySelectorAll(".stage-up").forEach(b=>b.onclick=()=>move(b.dataset.id,-1));
      document.querySelectorAll(".stage-down").forEach(b=>b.onclick=()=>move(b.dataset.id,1));
      document.querySelectorAll(".stage-remove").forEach(b=>b.onclick=()=>{selected.delete(b.dataset.id);renderLists();});
      document.querySelectorAll(".stage-add-store").forEach(b=>b.onclick=()=>{selected.add(b.dataset.id);renderLists();});
    };
    const move=(id,delta)=>{
      const arr=[...selected];
      const i=arr.indexOf(id), j=i+delta;
      if(i<0||j<0||j>=arr.length)return;
      [arr[i],arr[j]]=[arr[j],arr[i]];
      selected.clear(); arr.forEach(x=>selected.add(x)); renderLists();
    };
    let dragId=null;
    const bindDrag=()=>{
      document.querySelectorAll("[data-stage-course-store]").forEach(row=>{
        row.ondragstart=()=>{dragId=row.dataset.stageCourseStore;row.classList.add("dragging");};
        row.ondragend=()=>row.classList.remove("dragging");
        row.ondragover=e=>{e.preventDefault();row.classList.add("drag-over");};
        row.ondragleave=()=>row.classList.remove("drag-over");
        row.ondrop=e=>{
          e.preventDefault();row.classList.remove("drag-over");
          const target=row.dataset.stageCourseStore;
          if(!dragId||dragId===target)return;
          const arr=[...selected], from=arr.indexOf(dragId), to=arr.indexOf(target);
          if(from<0||to<0)return;
          arr.splice(from,1);arr.splice(to,0,dragId);
          selected.clear();arr.forEach(x=>selected.add(x));renderLists();
        };
      });
    };
    renderLists();

    const cancel=()=>{ const nav=document.querySelector('[data-route="courses"]'); if(nav)nav.click(); };
    document.getElementById("stageCourseCancel").onclick=cancel;
    document.getElementById("stageCourseCancel2").onclick=cancel;
    document.getElementById("stageCourseSave").onclick=()=>{
      const name=document.getElementById("stageCourseName").value.trim();
      if(!name){alert("コース名を入力してください。");return;}
      course.number=document.getElementById("stageCourseNumber").value.trim();
      course.name=name;
      course.days=document.getElementById("stageCourseDays").value.trim();
      course.description=document.getElementById("stageCourseDescription").value.trim();
      course.storeIds=[...selected];
      if(editing){
        const i=data.courses.findIndex(c=>c.id===course.id); data.courses[i]=course;
      } else data.courses.push(course);
      write(data);
      const nav=document.querySelector('[data-route="courses"]'); if(nav)nav.click(); else location.reload();
    };
  }

  function enhanceCourses() {
    const a=app(); if(!a)return;
    const title=a.querySelector(".page-title")?.textContent.trim();
    if(title==="コースから探す" && !a.querySelector("#stageNewCourse")){
      const head=a.querySelector(".section-head");
      if(head){
        const b=document.createElement("button");
        b.id="stageNewCourse";b.className="button secondary";b.textContent="＋ コース登録";
        b.onclick=()=>courseEditor(); head.parentElement.insertBefore(b, head.parentElement.firstChild);
      }
      a.querySelectorAll("[data-course-id]").forEach(card=>{
        if(card.dataset.stageBound)return;
        card.dataset.stageBound="1";
      });
    }
    if(a.querySelector("#courseBack") && !a.querySelector("#stageEditCourse")){
      const h=a.querySelector(".page-head");
      const id = [...document.querySelectorAll("[data-course-id]")].find(x=>x.dataset.stageLast) || null;
      const data=read();
      const name=h?.querySelector(".page-title")?.textContent.trim();
      const c=data.courses.find(x=>x.name===name);
      if(h && c){
        const b=document.createElement("button");
        b.id="stageEditCourse";b.className="button primary";b.textContent="コースを編集";
        b.onclick=()=>courseEditor(c.id);
        h.appendChild(b);
      }
    }
  }

  function observe() {
    const mo=new MutationObserver(()=>{
      enhanceRecent();
      installSearchMemory();
      addStickySave();
      installBackButtons();
      trackClicks();
      enhanceCourses();
    });
    mo.observe(app() || document.body,{childList:true,subtree:true});
    enhanceRecent();installSearchMemory();addStickySave();installBackButtons();trackClicks();enhanceCourses();
  }

  window.addEventListener("load", observe);
  observe();
})();