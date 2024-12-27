import { chromium } from "playwright";
import { test, expect } from "@playwright/test";

// Create the test that will run automatically when using 'npx playwright test'
test('Validate that the first 100 articles are sorted from newest to oldest on Hacker News', async ({ page }) => {
  // Launch browser and navigate to Hacker News Newest page
  await page.goto('https://news.ycombinator.com/newest');
  
  // Create a list to hold the articles
  const articles = [];

  // Loop through articles until 100 articles are in the list
  while (articles.length < 100) {
    // Extract articles timestamps using $$eval
    const hackerArticles = await page.$$eval('.subtext', (elements) => 
      elements.map((article) => {
        //extract the timestamp
        const timestamp = article.querySelector('.age')?.getAttribute('title');
        console.log("Timestamp: " + timestamp)
        //extract the iso time
        const isoTimestamp = timestamp?.split(" ")[0]
        //convert iso time to date
        const date = new Date(isoTimestamp)
        //return the timestamp
        return { timestamp: date };
      })
    );
    // Push the articles to the list
    articles.push(...hackerArticles);

    // Exit if there are exactly 100 articles
    if (articles.length >= 100) break;

    // Select the "More" button and click if available
    const moreButton = await page.$('.morelink');
    if (!moreButton) break; // If no more articles, exit

    // Wait for the next set of articles to load
    await moreButton.click();
    await page.waitForLoadState('networkidle');
  }

  for (let i = 0; i < articles.length - 1; i++) {
    const currentTime = articles[i].timestamp.getTime();
    const nextTime = articles[i + 1].timestamp.getTime();
     // Ensure current article is newer than the next article
    expect(currentTime).toBeGreaterThan(nextTime);
  }
});
