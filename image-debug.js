const puppeteer = require("puppeteer");
const token = process.env.GITHUB_TOKEN;
const fs = require("fs");
const { execSync } = require("child_process");
async function getImage(page){

  const image = await page.evaluate(()=>{

    // og:image (best)
    const og = document.querySelector('meta[property="og:image"]');
    if(og) return og.content;

    // article image
    const articleImg = document.querySelector("article img");
    if(articleImg) return articleImg.src;

    // fallback
    const firstImg = document.querySelector("img");
    if(firstImg) return firstImg.src;

    return null;

  });

  return image;
}

async function run(){

  const data = JSON.parse(fs.readFileSync("news-with-real-links.json"));

 const browser = await puppeteer.launch({
  executablePath: "/opt/render/.cache/puppeteer/chrome/linux-146.0.7680.76/chrome-linux64/chrome",
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"]
});

  const page = await browser.newPage();

  for(let i=0;i<data.length;i++){

    const url = data[i].realLink;

    console.log("\nOpening article:",url);

    try{

      await page.goto(url,{
        waitUntil:"domcontentloaded",
        timeout:60000
      });

      const image = await getImage(page);

      console.log("Article Image:",image);

      // JSON update
      data[i].image = image;

    }catch(err){

      console.log("Error:",err.message);

    }

  }

  fs.writeFileSync(
    "news-final.json",
    JSON.stringify(data,null,2)
  );

  console.log("\n✅ Images updated in news-final.json");

  // 🔴 GitHub push
  try{
execSync('git config --global user.email "bot@render.com"');
  execSync('git config --global user.name "News Bot"');
execSync(`git remote set-url origin https://${token}@github.com/shravit12/News_bot_finder.git`);
    execSync("git add news-final.json");
    execSync('git commit -m "update final news images"');
      execSync("git push origin HEAD:main");

    console.log("✅ GitHub updated");

  }catch(err){

    console.log("Git push failed:",err.message);

  }
  await browser.close();

}

run();