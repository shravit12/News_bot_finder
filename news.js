const Parser = require("rss-parser");
const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

const parser = new Parser();

async function getFirstImage(url) {

  try {

    const { data } = await axios.get(url);

    const $ = cheerio.load(data);

    const img = $("img").first().attr("src");

    return img || "";

  } catch (e) {

    return "";

  }

}

(async () => {

  const feed = await parser.parseURL(
    "https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en"
  );

  let news = [];

  for (let item of feed.items.slice(0,5)) {

    const image = await getFirstImage(item.link);

    news.push({
      title: item.title,
      link: item.link,
      date: item.pubDate,
      image: image
    });

  }

  console.log(news);

  fs.writeFileSync("news.json", JSON.stringify(news, null, 2));

})();