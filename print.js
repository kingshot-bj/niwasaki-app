(() => {
  const PRINT_BUTTON_ID = "niwasakiPrintButton";

  function addPrintButton() {
    const detail = document.querySelector(".detail");
    if (!detail || document.getElementById(PRINT_BUTTON_ID)) return;
    const actions = detail.querySelector(".actions");
    if (!actions) return;

    const button = document.createElement("button");
    button.id = PRINT_BUTTON_ID;
    button.className = "button secondary";
    button.type = "button";
    button.textContent = "🖨 印刷";
    button.onclick = () => {
      const infoTab = document.getElementById("infoTab");
      if (infoTab) infoTab.click();
      window.setTimeout(() => window.print(), 50);
    };
    actions.appendChild(button);
  }

  function linkPhone() {
    document.querySelectorAll(".detail .meta").forEach(meta => {
      if (meta.dataset.phoneLinked === "1") return;
      const text = meta.textContent.trim();
      const match = text.match(/^☎\\s*(.+)$/);
      if (!match) return;
      const phone = match[1].trim();
      meta.innerHTML = "";
      const a = document.createElement("a");
      a.href = "tel:" + phone.replace(/[^0-9+]/g, "");
      a.textContent = "☎ " + phone;
      a.className = "phone-link";
      meta.appendChild(a);
      meta.dataset.phoneLinked = "1";
    });
  }

  const observer = new MutationObserver(() => {
    addPrintButton();
    linkPhone();
  });
  observer.observe(document.getElementById("app") || document.body, {childList:true, subtree:true});
  addPrintButton();
  linkPhone();
})();
