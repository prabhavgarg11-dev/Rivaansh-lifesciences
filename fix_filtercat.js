const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend', 'script.js');
let content = fs.readFileSync(filePath, 'utf8');

// Fix: Replace the old filterCat (with broken await) with clean sync version
const oldFilterCat = /window\.filterCat\s*=\s*function\s*\(cat,\s*el\)\s*\{[\s\S]*?window\.scrollTo\(\{\s*top:\s*0,\s*behavior:\s*['"]smooth['"]\s*\}\);\s*\n\};/;

const newFilterCat = `window.filterCat = function (cat, el) {
  _currentCat = cat;
  if (el) {
    document.querySelectorAll(".cgrid-item, .cat-btn").forEach((b) => b.classList.remove("active"));
    el.classList.add("active");
  } else {
    document.querySelectorAll(".cgrid-item, .cat-btn").forEach((b) => {
      const btnText = b.querySelector('span')?.innerText || b.innerText;
      if (btnText.toLowerCase().includes(cat.toLowerCase())) b.classList.add("active");
      else b.classList.remove("active");
    });
  }
  const select = document.getElementById("filterCategory");
  if (select) select.value = cat;
  showPage("products");
  applyFilters();
  window.scrollTo({ top: 0, behavior: "smooth" });
};`;

const match = content.match(oldFilterCat);
if (match) {
  content = content.replace(oldFilterCat, newFilterCat);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ filterCat fixed — await removed, function is now clean sync');
} else {
  console.log('⚠️ Pattern not found — checking what filterCat currently looks like:');
  const idx = content.indexOf('window.filterCat');
  console.log(content.substring(idx, idx + 600));
}
