import * as cheerio from 'cheerio';

async function test() {
  const isbn = "9789650420556";
  const url = `https://www.e-vrit.co.il/Search/${isbn}`;
  const response = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  const html = await response.text();
  const $ = cheerio.load(html);

  const title = $('.title').first().text().trim() || $('.book-title').first().text().trim() || $('h1').first().text().trim();
  const author = $('.author').first().text().trim() || $('.book-author').first().text().trim();
  console.log("Evrit Title:", title);
  console.log("Evrit Author:", author);
  console.log("Evrit HTML Length:", html.length);
}
test();
