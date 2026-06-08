import fs from 'fs';
fetch("https://simania.co.il/searchBooks.php?query=9789650420556", {
  headers: { "User-Agent": "Mozilla/5.0" }
}).then(r => r.text()).then(html => {
  fs.writeFileSync('simania-test.html', html);
  console.log("Wrote HTML to simania-test.html");
}).catch(console.error);
