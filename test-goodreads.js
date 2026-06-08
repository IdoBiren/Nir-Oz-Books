import * as cheerio from 'cheerio';

async function test() {
  const isbn = "9789650420556";
  const url = `https://www.goodreads.com/search?q=${isbn}`;
  const response = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  const html = await response.text();
  const $ = cheerio.load(html);

  const title = $('h1.Text__title1').text().trim() || $('h1[data-testid="bookTitle"]').text().trim();
  const author = $('span.ContributorLink__name').first().text().trim();
  
  console.log("Goodreads Title:", title);
  console.log("Goodreads Author:", author);
  console.log("Goodreads HTML Length:", html.length);
}
test();
