const puppeteer = require("puppeteer");
const fs = require("fs");
const { execSync } = require("child_process");
function delay(ms){
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run(){

  const data = JSON.parse(fs.readFileSync("news.json"));

  const browser = await puppeteer.launch({
    headless:false
  });

  for(let i=0;i<data.length;i++){

    const url = data[i].link;

    console.log("\nOpening:",url);

    const page = await browser.newPage();

    try{

      await page.goto(url,{waitUntil:"domcontentloaded",timeout:60000});

      let realUrl = url;

      // redirect check
      for(let t=0;t<10;t++){

        realUrl = page.url();

        if(!realUrl.includes("news.google.com")){
          break;
        }

        await delay(1000);
      }

      console.log("Real URL:",realUrl);

      // 🔴 JSON me save
      data[i].realLink = realUrl;

    }catch(err){

      console.log("Error:",err.message);
      data[i].realLink = null;

    }

    await page.close();

  }

  // 🔴 new file save
  fs.writeFileSync(
    "news-with-real-links.json",
    JSON.stringify(data,null,2)
  );

  console.log("\n✅ Saved in news-with-real-links.json");
try {
execSync('git config --global user.email "bot@render.com"');
  execSync('git config --global user.name "News Bot"');
   execSync("git remote add origin https://github.com/shravit12/News_bot_finder.git");
  execSync("git add news-with-real-links.json");
  execSync('git commit -m "update real news links"');
  execSync("git push");

  console.log("✅ GitHub updated");

} catch (err) {

  console.log("Git push failed:", err.message);

}
  await browser.close();
}

run();