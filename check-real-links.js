const puppeteer = require("puppeteer");
const fs = require("fs");

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

  await browser.close();
}

run();