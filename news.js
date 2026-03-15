const Parser = require("rss-parser");
const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const token = process.env.GITHUB_TOKEN;
const { execSync } = require("child_process");
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
   
console.log("news.json updated");

// push to GitHub
try {
execSync('git config --global user.email "bot@render.com"');
  execSync('git config --global user.name "News Bot"');
   
execSync(`git remote set-url origin https://${token}@github.com/shravit12/News_bot_finder.git`);
  execSync("git add news.json");
  execSync('git commit -m "update news json"');
    execSync("git push origin HEAD:main");

  console.log("GitHub updated");

} catch (err) {

  console.log("Git push failed");

}
})();