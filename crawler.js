const fetch = require("node-fetch");
const cheerio = require("cheerio");

const [, , websiteUrl, depth] = process.argv;

const sleep = (ms) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });

async function crawl(link, initialDepth) {
  const result = [];
  const queue = [[link, initialDepth]];
  const visited = new Map();

  while (queue.length) {
    const [sourceUrl, depth] = queue.shift();

    try {
      const htmlText = await fetch(link).then((resp) => resp.text());
      const $ = cheerio.load(htmlText);

      await sleep(300);

      $("img").each((_, value) => {
        const item = {
          imageUrl: $(value).attr("src"),
          sourceUrl,
          depth: initialDepth - depth,
        };

        result.push(item);
      });

      if (depth > 0) {
        $("a").each((_, value) => {
          const href = $(value).attr("href");
          if (visited.has(href)) {
            return;
          }

          visited.set(href, true);
          queue.push([href, depth - 1]);
        });
      }
    } catch (e) {}
  }

  return result;
}

(async function () {
  const result = await crawl(websiteUrl, Number(depth));
  console.log(result);
})();
