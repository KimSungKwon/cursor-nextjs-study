type ToastType = "success" | "error";

const ROOT_ID = "commerce-toast-root";

const showToast = (message: string, type: ToastType) => {
  if (typeof document === "undefined") return;

  let root = document.getElementById(ROOT_ID);
  if (!root) {
    root = document.createElement("div");
    root.id = ROOT_ID;
    root.setAttribute("aria-live", "polite");
    root.style.cssText = [
      "position:fixed",
      "bottom:24px",
      "left:50%",
      "transform:translateX(-50%)",
      "z-index:9999",
      "display:flex",
      "flex-direction:column",
      "align-items:center",
      "gap:8px",
      "pointer-events:none",
    ].join(";");
    document.body.appendChild(root);
  }

  const el = document.createElement("div");
  el.setAttribute("role", type === "error" ? "alert" : "status");
  el.textContent = message;
  el.style.cssText = [
    "pointer-events:auto",
    "min-width:240px",
    "max-width:min(90vw,420px)",
    "padding:12px 16px",
    "border-radius:8px",
    "font-family:var(--commerce-font-family-body)",
    "font-size:14px",
    "line-height:1.4",
    "color:var(--commerce-text-inverse)",
    type === "error"
      ? "background:var(--commerce-semantic-error)"
      : "background:var(--commerce-primary-main)",
    "box-shadow:0 8px 24px rgba(0,0,0,0.16)",
  ].join(";");

  root.appendChild(el);
  window.setTimeout(() => {
    el.remove();
    if (root && root.childElementCount === 0) {
      root.remove();
    }
  }, 2500);
};

export const toast = {
  success: (message: string) => showToast(message, "success"),
  error: (message: string) => showToast(message, "error"),
};
