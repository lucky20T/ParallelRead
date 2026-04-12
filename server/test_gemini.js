const { GoogleGenerativeAI } = require('@google/generative-ai');
const apiKey = 'AIzaSyDRbHQbxwp6MhZk-JTijv1r00wlpMadTwA';
const genAI = new GoogleGenerativeAI(apiKey);

async function checkModel(name) {
  try {
    const model = genAI.getGenerativeModel({ model: name });
    await model.generateContent("hello");
    console.log(`${name} SUCCESS`);
  } catch (err) {
    console.log(`${name} ERROR:`, err.message);
  }
}

async function run() {
  await checkModel('gemini-2.5-flash');
  await checkModel('gemini-3.0-flash');
}
run();
