const KEY = "niwasaki.v1";

const state = {
  stores: [],
  route: "home",
  selectedId: null
};

const $ = (id) => document.getElementById(id);
const now = () => new Date().toISOString();
const uid = () => "s_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);

function esc(value) {
  return String(value ?? "").replace(/[&<>"]/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;"
  }[c]));
}

function load() {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || "[]");
    state.stores = Array.isArray(value) ? value : [];
  } catch {
    state.stores = [];
  }
}

function save() {
  localStorage.setItem(KEY, JSON.stringify(state.stores));
}

function blankStore() {
  const t = now();
  return {
    id: uid(),
    name: "",
    code: "",
    address: "",
    phone: "",
    course: "",
    deliveryPlace: "",
    entrance: "",
    parking: "",
    vehicleRoute: "",
    security: "",
    emptyCases: "",
    timeRestriction: "",
    notes: "",
    favorite: false,
    createdAt: t,
    updatedAt: t
  };
}

function navigate(route) {
  state.route = route;
  state.selectedId = null;
  render();
  window.scrollTo(0, 0);
}

function shell(title, subtitle, body) {
  $("app").innerHTML =
    '<div class="page-head">' +
      '<h1 class="page-title">' + title + '</h1>' +
      (subtitle ? '<p class="page-sub">' + subtitle + '</p>' : "") +
    '</div>' +
    body;
}

function empty(title, subtitle) {
  return '<div class="empty"><strong>' + title + '</strong>' +
    (subtitle ? '<span>' + subtitle + '</span>' : "") +
    '</div>';
}

function storeRow(store) {
  return '<article class="store-row" data-store-id="' + store.id + '">' +
    '<div class="thumb"></div>' +
    '<div>' +
      '<strong>' + esc(store.name || "名称未設定") + '</strong>' +
      '<small>' + esc(store.code || "コード未登録") +
        (store.course ? "　" + esc(store.course) : "") + '</small>' +
      '<small>' + esc(store.address || "住所未登録") + '</small>' +
    '</div>' +
    '<button class="star ' + (store.favorite ? "on" : "") +
      '" data-favorite-id="' + store.id + '">' +
      (store.favorite ? "★" : "☆") +
    '</button>' +
  '</article>';
}

function bindStoreRows() {
  document.querySelectorAll("[data-store-id]").forEach((element) => {
    element.onclick = (event) => {
      if (event.target.closest("[data-favorite-id]")) return;
      state.selectedId = element.dataset.storeId;
      state.route = "detail";
      render();
    };
  });

  document.querySelectorAll("[data-favorite-id]").forEach((button) => {
    button.onclick = (event) => {
      event.stopPropagation();
      const store = state.stores.find((item) => item.id === button.dataset.favoriteId);
      if (!store) return;
      store.favorite = !store.favorite;
      save();
      render();
    };
  });
}

function home() {
  const favorites = state.stores.filter((store) => store.favorite).slice(0, 3);

  shell(
    "ホーム",
    "",
    '<button class="search-box" id="homeSearch">' +
      '<span>⌕</span><input readonly placeholder="店舗名・コード・住所を検索">' +
    '</button>' +
    '<div class="quick-list">' +
      '<button class="quick-card" id="searchQuick">' +
        '<span class="left"><span class="quick-icon">⌕</span>' +
        '<span><strong>店舗を探す</strong><small>名前・コード・住所から</small></span></span>' +
        '<span class="chevron">›</span>' +
      '</button>' +
      '<button class="quick-card" id="courseQuick">' +
        '<span class="left"><span class="quick-icon">≡</span>' +
        '<span><strong>コースから探す</strong><small>コース別に店舗を見る</small></span></span>' +
        '<span class="chevron">›</span>' +
      '</button>' +
    '</div>' +
    '<section class="section">' +
      '<div class="section-head"><h2>お気に入り</h2></div>' +
      (favorites.length
        ? '<div class="store-list">' + favorites.map(storeRow).join("") + '</div>'
        : empty("お気に入りはまだありません", "店舗を登録するとここに表示されます。")) +
    '</section>' +
    '<section class="section">' +
      '<div class="section-head"><h2>最近見た店舗</h2></div>' +
      empty("最近見た店舗はまだありません") +
    '</section>'
  );

  $("homeSearch").onclick = () => navigate("search");
  $("searchQuick").onclick = () => navigate("search");
  $("courseQuick").onclick = () => navigate("courses");
  bindStoreRows();
}

function search() {
  shell(
    "店舗を探す",
    state.stores.length + "件",
    '<div class="search-box">' +
      '<span>⌕</span><input id="searchInput" placeholder="店舗名・コード・住所で検索">' +
    '</div>' +
    '<div class="section-head">' +
      '<h2>店舗一覧</h2>' +
      '<button class="button secondary" id="newSearch">＋ 店舗登録</button>' +
    '</div>' +
    '<div id="searchResults" class="store-list"></div>'
  );

  const draw = () => {
    const query = $("searchInput").value.trim().toLowerCase();
    const stores = state.stores.filter((store) => {
      if (!query) return true;
      return [store.name, store.code, store.address, store.course]
        .some((value) => String(value || "").toLowerCase().includes(query));
    });

    $("searchResults").innerHTML = stores.length
      ? stores.map(storeRow).join("")
      : empty("店舗がまだありません", "「＋ 店舗登録」から追加できます。");

    bindStoreRows();
  };

  $("searchInput").oninput = draw;
  $("newSearch").onclick = () => edit();
  draw();
}

function coursesPage() {
  const courses = [...new Set(
    state.stores.map((store) => String(store.course || "").trim()).filter(Boolean)
  )].sort();

  if (!courses.length) {
    shell("コースから探す", "", empty("コースがまだありません", "店舗登録時にコースを設定できます。"));
    return;
  }

  shell(
    "コースから探す",
    "",
    '<div class="course-list">' +
      courses.map((course) =>
        '<button class="course-card" data-course="' + esc(course) + '">' +
          '<span><strong>' + esc(course) + '</strong>' +
          '<small>' + state.stores.filter((store) => store.course === course).length + '店舗</small></span>' +
          '<span class="chevron">›</span>' +
        '</button>'
      ).join("") +
    '</div>'
  );

  document.querySelectorAll("[data-course]").forEach((button) => {
    button.onclick = () => {
      const course = button.dataset.course;
      const stores = state.stores.filter((store) => store.course === course);
      $("app").innerHTML =
        '<button class="back" id="courseBack">‹ コース一覧へ戻る</button>' +
        '<div class="page-head"><h1 class="page-title">' + esc(course) + '</h1></div>' +
        '<div class="store-list">' + stores.map(storeRow).join("") + '</div>';
      $("courseBack").onclick = () => coursesPage();
      bindStoreRows();
    };
  });
}

function detail() {
  const store = state.stores.find((item) => item.id === state.selectedId);
  if (!store) {
    navigate("search");
    return;
  }

  const rows = [
    ["コース", store.course],
    ["納品場所", store.deliveryPlace],
    ["搬入口", store.entrance],
    ["駐車場所", store.parking],
    ["車両進入経路", store.vehicleRoute],
    ["鍵・警備", store.security],
    ["空ケース等", store.emptyCases],
    ["時間制限", store.timeRestriction],
    ["注意事項", store.notes]
  ].filter((row) => row[1]);

  const info = rows.length
    ? rows.map((row) =>
        '<div class="info-row"><b>' + row[0] + '</b><span>' + esc(row[1]) + '</span></div>'
      ).join("")
    : empty("配送情報がありません");

  $("app").innerHTML =
    '<div class="detail">' +
      '<button class="back" id="detailBack">‹ 店舗一覧へ戻る</button>' +
      '<div class="detail-head">' +
        '<div>' +
          '<h1 class="detail-title">' + esc(store.name || "名称未設定") + '</h1>' +
          '<div class="meta">コード ' + esc(store.code || "—") + '</div>' +
          '<div class="meta">' + esc(store.address || "住所未登録") + '</div>' +
          (store.phone ? '<div class="meta">☎ ' + esc(store.phone) + '</div>' : "") +
        '</div>' +
        '<button class="star ' + (store.favorite ? "on" : "") + '" id="detailFavorite">' +
          (store.favorite ? "★" : "☆") +
        '</button>' +
      '</div>' +
      '<div class="actions">' +
        '<button class="button secondary" id="mapButton">⌖ 地図を見る</button>' +
        '<button class="button primary" id="editButton">情報を変更</button>' +
      '</div>' +
      '<div class="tabs">' +
        '<button class="tab active">配送情報</button>' +
        '<button class="tab" id="photosTab">写真</button>' +
      '</div>' +
      '<div class="info" id="detailContent">' + info + '</div>' +
    '</div>';

  $("detailBack").onclick = () => navigate("search");
  $("editButton").onclick = () => edit(store.id);
  $("detailFavorite").onclick = () => {
    store.favorite = !store.favorite;
    save();
    render();
  };
  $("mapButton").onclick = () => {
    if (store.address) {
      window.open(
        "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(store.address),
        "_blank"
      );
    }
  };
  $("photosTab").onclick = () => {
    $("detailContent").innerHTML = empty("写真機能は次の実装段階で追加します。");
  };
}

function field(key, label, store, full) {
  return '<div class="field ' + (full ? "full" : "") + '">' +
    '<label>' + label + '</label>' +
    (full
      ? '<textarea id="field_' + key + '">' + esc(store[key]) + '</textarea>'
      : '<input id="field_' + key + '" value="' + esc(store[key]) + '">') +
  '</div>';
}

function edit(id) {
  const isNew = !id;
  const store = id ? state.stores.find((item) => item.id === id) : blankStore();
  if (!store) return;
  if (isNew) state.stores.push(store);

  $("app").innerHTML =
    '<div class="detail">' +
      '<button class="back" id="cancelEdit">‹ 戻る</button>' +
      '<div class="page-head"><h1 class="page-title">' + (isNew ? "店舗を登録" : "情報を変更") + '</h1></div>' +
      '<form id="storeForm">' +
        '<section class="form-card"><h2>基本情報</h2><div class="form-grid">' +
          field("name", "店舗名", store) +
          field("code", "店舗コード", store) +
          field("address", "住所", store) +
          field("phone", "電話番号", store) +
          field("course", "コース", store) +
        '</div></section>' +
        '<section class="form-card"><h2>配送情報</h2><div class="form-grid">' +
          field("deliveryPlace", "納品場所", store) +
          field("entrance", "搬入口", store) +
          field("parking", "駐車場所", store) +
          field("vehicleRoute", "車両進入経路", store) +
          field("security", "鍵・警備", store) +
          field("emptyCases", "空ケース等の置き場所", store) +
          field("timeRestriction", "時間制限", store) +
          field("notes", "注意事項", store, true) +
        '</div></section>' +
        '<div class="form-actions">' +
          '<button class="button secondary" type="button" id="cancelButton">キャンセル</button>' +
          '<button class="button primary" type="submit">保存する</button>' +
        '</div>' +
      '</form>' +
    '</div>';

  const cancel = () => {
    if (isNew) {
      state.stores = state.stores.filter((item) => item.id !== store.id);
      save();
    }
    navigate("search");
  };

  $("cancelEdit").onclick = cancel;
  $("cancelButton").onclick = cancel;

  $("storeForm").onsubmit = (event) => {
    event.preventDefault();

    [
      "name", "code", "address", "phone", "course",
      "deliveryPlace", "entrance", "parking", "vehicleRoute",
      "security", "emptyCases", "timeRestriction", "notes"
    ].forEach((key) => {
      store[key] = $("field_" + key).value.trim();
    });

    store.updatedAt = now();
    save();
    state.selectedId = store.id;
    state.route = "detail";
    render();
  };
}

function render() {
  document.querySelectorAll("[data-route]").forEach((button) => {
    button.classList.toggle("active", button.dataset.route === state.route);
  });

  if (state.route === "home") home();
  else if (state.route === "search") search();
  else if (state.route === "courses") coursesPage();
  else if (state.route === "favorites") {
    const favorites = state.stores.filter((store) => store.favorite);
    shell(
      "お気に入り",
      favorites.length + "件",
      favorites.length
        ? '<div class="store-list">' + favorites.map(storeRow).join("") + '</div>'
        : empty("お気に入りはまだありません")
    );
    bindStoreRows();
  } else {
    detail();
  }
}

function boot() {
  try {
    load();
    render();
  } catch (error) {
    console.error("niwasaki boot error:", error);
    const app = $("app");
    if (app) {
      app.innerHTML =
        '<div class="empty"><strong>niwasakiを起動できませんでした</strong>' +
        '<span>JavaScriptの初期化中にエラーが発生しました。</span></div>';
    }
  }
}

document.querySelectorAll("[data-route]").forEach((button) => {
  button.onclick = () => navigate(button.dataset.route);
});

$("brand").onclick = () => navigate("home");
$("newStoreButton").onclick = () => edit();
$("adminButton").onclick = () => alert("管理機能は次の実装段階で追加します。");

boot();
