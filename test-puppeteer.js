const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));

  console.log("Navigating to index.html...");
  await page.goto('http://localhost:3000/index.html');
  await page.waitForTimeout(4000); // Wait for loader to finish

  console.log("Clicking chat link...");
  await page.click('a[href="chat.html"]');
  await page.waitForNavigation();
  await page.waitForTimeout(1000);

  console.log("Clicking back to index.html...");
  await page.click('a[href="index.html"]');
  await page.waitForNavigation();
  await page.waitForTimeout(1000);

  console.log("Clicking chat link again...");
  await page.click('a[href="chat.html"]');
  await page.waitForNavigation();
  await page.waitForTimeout(1000);

  console.log("Clicking back to index.html second time...");
  await page.click('a[href="index.html"]');
  await page.waitForNavigation();
  await page.waitForTimeout(1000);

  console.log("Checking visibility...");
  const loaderVisible = await page.$eval('#loader', el => window.getComputedStyle(el).display !== 'none');
  const mainVisible = await page.$eval('#mainPage', el => window.getComputedStyle(el).display !== 'none');
  
  console.log("Loader visible:", loaderVisible);
  console.log("Main visible:", mainVisible);

  await browser.close();
})();
