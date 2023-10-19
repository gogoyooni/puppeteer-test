const puppeteer = require("puppeteer");

require("dotenv").config();

const app = require("express")();

app.get("/api", async (req, res) => {
  (async () => {
    // Launch the browser and open a new blank page
    const browser = await puppeteer.launch({
      args: ["--disable-setuid-sandbox", "--no-sandbox", "--single-process", "--no-zygote"],
      executablePath:
        process.env.NODE_ENV === "production"
          ? process.env.PUPPETEER_EXECUTABLE_PATH
          : puppeteer.executablePath(),
      // headless: true,
    });

    try {
      const page = await browser.newPage();

      // let URL = "http://itempage3.auction.co.kr/DetailView.aspx?itemno=C462258220#vip_tab_comment";
      let URL = "http://itempage3.auction.co.kr/DetailView.aspx?itemno=C462258220";

      // const resp = await fetch(URL);
      // const doc = await resp.text();

      // Navigate the page to a URL

      await page.goto(URL);

      await page.setViewport({ width: 1800, height: 1800 });

      // const content = await page.content();
      // const $ = cheerio.load(content);
      // document.querySelectorAll(".box__review-text > .text");

      const reviewTabMenuSelector = "#tap_moving_2";
      await page.waitForSelector(reviewTabMenuSelector);
      await page.click(reviewTabMenuSelector, { delay: 1000 });

      const element = await page.waitForSelector("#spnTotalItemTalk_display");
      const value = await element.evaluate((el) => el.textContent);

      // res.send(`<h2>리뷰갯수: ${value}</h2>`);

      // await page.waitForTimeout(1000);

      // Use Cheerio to extract text from elements with a specific class
      // $(".box__content > .box__review-text > .text").each((index, element) => {
      //   const text = $(element).text();
      //   textArray.push(text);
      // });
      // function removeLineBreaks(str) {
      //   return str.replace(/[\r\n]+/gm, " ");
      // }

      let pageCount = 3;

      let openMarketName = "옥션"; //옥션, 11번가, 스마트스토어, 쿠팡, 인터파크,

      // let textArray = [];

      // Function to clean the text

      // const reviewText = await page.waitForSelector(".box__content > .box__review-text > .text");
      // const reviewValue = await reviewText.evaluate((el) => {el.textContent});
      let textArray = [];

      if (openMarketName === "옥션") {
        //   pageCount = parseInt(
        //     removeLineBreaks(document.querySelector(".text__total > em.text").textContent)
        //   );

        for (let i = 1; i < pageCount; i++) {
          textArray.push(
            await page.evaluate(() => {
              // await page.evaluate(() => {
              //   function removeLineBreaks(str) {
              //     return str.replace(/[\t\r\n]+/gm, " ");
              //   }
              const elements = document.querySelectorAll(
                ".box__content > .box__review-text > .text"
              ); // Replace 'your-class-name' with the class you want to target

              const words = [];

              for (const element of elements) {
                // const cleanText = removeLineBreaks(element.textContent.trim());
                const cleanText = element.textContent.trim();
                words.push(cleanText);
                // textArray.push(cleanText);
              }

              return words;
            })
          );
          await (await page.$("#reviewPageNumber")).press(`${i}`);
          await await page.click(".link__page-move", { delay: 1000 });
        }
        console.log(JSON.stringify(textArray));
      }

      res.send(`<div>
      <h2>리뷰갯수 :  ${value}</h2>
      <div>
          ${JSON.stringify(textArray.flatMap((arr) => arr))}
      </div>
  </div>`);

      // console.log(test);

      // await page.screenshot({
      //   path: "screenshot.jpg",
      // });

      // // Print the extracted text
      // for (const text of textArray) {
      //   console.log(text);
      // }
      // res.send($(".list__review"));

      // Set screen size
      // await page.setViewport({ width: 1080, height: 1024 });

      // Type into search box
      //   await page.type(".search-box__input", "automate beyond recorder");

      // Wait and click on first result
      //   const searchResultSelector = ".search-box__link";
      //   await page.waitForSelector(searchResultSelector);
      //   await page.click(searchResultSelector);

      // const reviewTabMenuSelector = "#tap_moving_2";
      // await page.waitForSelector(reviewTabMenuSelector);
      // await page.click(reviewTabMenuSelector);

      // Locate the full title with a unique string
      //   const textSelector = await page.waitForSelector("text/Customize and automate");
      //   const fullTitle = await textSelector?.evaluate((el) => el.textContent);

      // Print the full title
      //   console.log('The title of this blog post is "%s".', fullTitle);
      // res.send(await page.title());
      //   console.log("title :", await page.title());
      //   resizeBy.sed
    } catch (e) {
      console.error(e);
      res.send(`Something went wrong while running Puppeteer: ${e}`);
    } finally {
      await browser.close();
    }
  })();
});

app.listen(process.env.PORT || 4000, () => {
  console.log("Server started");
});
