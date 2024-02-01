const puppeteer = require('puppeteer');

// Objeto para armazenar as traduções em cache
const cache = {};

async function translateElements(textoOriginal, idiomaOrigem, idiomaDestino) {
    // Gerar uma chave única para identificar a tradução no cache
    const cacheKey = `${textoOriginal}_${idiomaOrigem}_${idiomaDestino}`;

    // Verificar se a tradução já está em cache
    if (cache[cacheKey]) {
        // console.log('Tradução obtida do cache:', cache[cacheKey]);
        return cache[cacheKey];
    }

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    try {
        var url = `https://translate.google.com.br/?sl=${idiomaOrigem}&tl=${idiomaDestino}&text=${encodeURIComponent(textoOriginal)}&op=translate`;
        await page.goto(url);
        await page.waitForTimeout(1500);

        const result = await page.evaluate(() => {
            return document.getElementsByClassName('ryNqvb')[0].innerText;
        });

        // Armazenar a tradução no cache
        cache[cacheKey] = result;

        return result;
    } catch (error) {
        console.error('Erro na tradução:', error);
        throw error;
    } finally {
        browser.close();
    }
}

module.exports = { translateElements };