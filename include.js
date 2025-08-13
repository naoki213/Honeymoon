// 同一ドメイン上の外部HTMLを読み込んで差し込むシンプルなローダー
async function loadIncludes() {
  const slots = Array.from(document.querySelectorAll('[data-include]'));
  await Promise.all(slots.map(async (el) => {
    const path = el.getAttribute('data-include');
    try {
      const res = await fetch(path, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      el.innerHTML = await res.text();
    } catch (e) {
      el.innerHTML = `<p style="color:#c00">読み込みエラー: ${path}<br>${e.message}</p>`;
    }
  }));
}
document.addEventListener('DOMContentLoaded', loadIncludes);
