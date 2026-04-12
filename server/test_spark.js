require('dotenv').config();
const crypto = require('crypto');
const WebSocket = require('ws');

const APPID = process.env.SPARK_APP_ID;
const APISecret = process.env.SPARK_API_SECRET;
const APIKey = process.env.SPARK_API_KEY;

function getAuthUrl(hostUrl, apiKey, apiSecret) {
    const url = new URL(hostUrl);
    const date = new Date().toUTCString();
    const signatureOrigin = `host: ${url.host}\ndate: ${date}\nGET ${url.pathname} HTTP/1.1`;
    const signatureSha = crypto.createHmac('sha256', apiSecret).update(signatureOrigin).digest('base64');
    const authorizationOrigin = `api_key="${apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signatureSha}"`;
    const authorization = Buffer.from(authorizationOrigin).toString('base64');
    return `${hostUrl}?authorization=${encodeURIComponent(authorization)}&date=${encodeURIComponent(date)}&host=${encodeURIComponent(url.host)}`;
}

async function test(domain, url, k, s) {
    return new Promise((resolve) => {
        const authUrl = getAuthUrl(url, k, s);
        const ws = new WebSocket(authUrl);
        
        ws.on('open', () => {
            ws.send(JSON.stringify({
                header: { app_id: APPID, uid: "test" },
                parameter: { chat: { domain: domain, temperature: 0.5, max_tokens: 1024 } },
                payload: { message: { text: [{ role: "user", content: "hello" }] } }
            }));
        });
        ws.on('message', (data) => {
            const res = JSON.parse(data);
            if (res.header.code !== 0) {
                console.log(`Error ${domain}:`, res.header.code, res.header.message);
                ws.close();
                resolve(false);
            } else {
                console.log(`Success ${domain}`);
                ws.close();
                resolve(true);
            }
        });
        ws.on('error', (err) => {
            ws.close();
            resolve(false);
        });
        ws.on('unexpected-response', (request, response) => {
            console.log(`401 on ${domain}`);
            resolve(false);
        });
    });
}

async function run() {
    console.log("Testing with APIKey as key, APISecret as secret");
    await test('general', 'wss://spark-api.xf-yun.com/v1.1/chat', APIKey, APISecret);
    await test('generalv2', 'wss://spark-api.xf-yun.com/v2.1/chat', APIKey, APISecret);
    await test('generalv3', 'wss://spark-api.xf-yun.com/v3.1/chat', APIKey, APISecret);
    await test('generalv3.5', 'wss://spark-api.xf-yun.com/v3.5/chat', APIKey, APISecret);
    
    console.log("Testing with swapped APIKey and APISecret");
    await test('general', 'wss://spark-api.xf-yun.com/v1.1/chat', APISecret, APIKey);
    await test('generalv3.5', 'wss://spark-api.xf-yun.com/v3.5/chat', APISecret, APIKey);
}
run();
