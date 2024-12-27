//This file was used for testing code
import { chromium } from "playwright";
async function sortHackerNewsArticles() {
  // launch browser
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // go to Hacker News
    await page.goto("https://news.ycombinator.com/newest");
    // create a list to hold the articles
    const articles = [];
    // loop through articles until 100 articles are in the list
    while (articles.length < 100) {
      const hackerArticles = await page.$$eval(".subtext", (elements) =>
        elements.map((article) => {
          const timestamp = article.querySelector(".age")?.getAttribute("title");
          console.log("Timestamp: " + timestamp)
          //extract the iso time
          const isoTimestamp = timestamp?.split(" ")[0]
          //convert iso time to date
          const date = new Date(isoTimestamp)
          //return the timestamp
          return { timestamp: date };
        })
      );
      // push the articles to the list
      articles.push(...hackerArticles);

      // exit if there are exactly 100 articles
      if (articles.length >= 100) break;

      // select the more button
      const moreButton = await page.$(".morelink");
      // exit if there are no more articles
      if (!moreButton) {
        break;
      }

      // wait for the more button to be clicked
      await moreButton.click();
      // wait for the page to load
      await page.waitForLoadState("networkidle");
    }

    // Ensure that 100 articles are loaded
    if (articles.length < 100) {
      throw new Error("Not enough articles loaded");
    }

    // Validate that the first article is newer than the second one (and so on)
    for (let i = 0; i < articles.length - 1; i++) {
      const currentTime = articles[i].timestamp.getTime();
      const nextTime = articles[i + 1].timestamp.getTime();
      if (currentTime <= nextTime) {
        throw new Error("Articles are not sorted from newest to oldest");
      }
    }

    console.log("Articles are correctly sorted from newest to oldest");

  } catch (error) {
    console.error(error);
  }
}

(async () => {
  await sortHackerNewsArticles();
})();
