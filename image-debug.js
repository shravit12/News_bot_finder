const puppeteer = require("puppeteer");
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
    headless:true
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

    execSync("git add news-final.json");
    execSync('git commit -m "update final news images"');
    execSync("git push");

    console.log("✅ GitHub updated");

  }catch(err){

    console.log("Git push failed:",err.message);

  }
  await browser.close();

}

run();