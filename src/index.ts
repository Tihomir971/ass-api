import puppeteer from '@cloudflare/puppeteer';

interface Env {
	MYBROWSER: Fetcher;
}
interface MyRequestBody {
	source: string;
	barcode: string;
}
type ParseFunctions = {
	[key: string]: (barcode: string | undefined) => Promise<Response>;
};
let source: string | undefined = undefined;

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		if (request.method === 'POST') {
			const body: MyRequestBody = await request.json();
			source = body.source;
			const barcode = body.barcode;
			let href = 'Undefined';

			if (source && barcode) {
				const browser = await puppeteer.launch(env.MYBROWSER);
				const page = await browser.newPage();
				await page.goto('https://cenoteka.rs/');
				// Wait for suggest overlay to appear and click "show all results".
				const homeSearchSelector = '.nav_search_input__CB_KM';
				await page.waitForSelector(homeSearchSelector);
				await page.click(homeSearchSelector);
				// Wait for the results page to load and display the results.
				const innerSearchSelector = '#nav-search';
				await page.waitForSelector(innerSearchSelector);
				await page.type(innerSearchSelector, barcode);
				// This code waits for a specific webpage element to load within 5 seconds, then retrieves and stores its URL.
				const searchResultSelector =
					'#__next > div > form > div.search_search_content_wrap__Ab4ZA.container > div.row.pt-4.pb-1 > div > div > a';
				await page.waitForSelector(searchResultSelector, { timeout: 5000 });
				href = await page.$eval(searchResultSelector, (elm) => elm.href);
				await browser?.close();
				/* const href = await vendorPrice.cenoteka(barcode); */
				// Create a new object with the barcode
				const responseBody = { path: href, source: source };
				// Convert the object to a JSON string
				const responseJson = JSON.stringify(responseBody);
				// Return the JSON string as the response
				return new Response(responseJson, { status: 200, headers: { 'Content-Type': 'application/json' } });
			}
			return new Response(`Site: ${source}, Barcode: ${barcode}`, { status: 200 });
		} else {
			return new Response('Expected a POST request', { status: 400 });
		}
	},
};

const vendorPrice: ParseFunctions = {
	cenoteka: async function (barcode: string | undefined) {
		if (barcode) {
			let href = 'Undefined';
			let browser;
			try {
				browser = await puppeteer.launch(env.MYBROWSER);
				const page = await browser.newPage();
				await page.goto('https://cenoteka.rs/');
				// Wait for suggest overlay to appear and click "show all results".
				const homeSearchSelector = '.nav_search_input__CB_KM';
				await page.waitForSelector(homeSearchSelector);
				await page.click(homeSearchSelector);
				// Wait for the results page to load and display the results.
				const innerSearchSelector = '#nav-search';
				await page.waitForSelector(innerSearchSelector);
				await page.type(innerSearchSelector, barcode);
				// This code waits for a specific webpage element to load within 5 seconds, then retrieves and stores its URL.
				const searchResultSelector =
					'#__next > div > form > div.search_search_content_wrap__Ab4ZA.container > div.row.pt-4.pb-1 > div > div > a';
				await page.waitForSelector(searchResultSelector, { timeout: 5000 });
				href = await page.$eval(searchResultSelector, (elm) => elm.href);
				// Create a new object with the barcode
				const responseBody = { path: href, source: source };
				// Convert the object to a JSON string
				const responseJson = JSON.stringify(responseBody);
				// Return the JSON string as the response
				return new Response(responseJson, { status: 200, headers: { 'Content-Type': 'application/json' } });
			} catch (error) {
				console.log('Error show', error);
				//return href;
			} finally {
				await browser?.close();
			}
		}
		return new Response('Shit i didnt find', { status: 404, headers: { 'Content-Type': 'application/json' } });
	},
};
