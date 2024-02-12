process.setMaxListeners(50);

const puppeteer = require('puppeteer');

// Objeto para armazenar as traduções em cache
const cache = {};

async function translateElements(textoOriginal, idiomaOrigem, idiomaDestino, tentativas = 3) {
    // Gerar uma chave única para identificar a tradução no cache
    const cacheKey = `${textoOriginal}_${idiomaOrigem}_${idiomaDestino}`;

    // Verificar se a tradução já está em cache
    if (cache[cacheKey]) {
        console.log('Tradução obtida do cache:', cache[cacheKey]);
        return cache[cacheKey];
    }

    let browser;

    try {
        // Optar pelo novo modo headless ao iniciar o navegador
        browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
        const page = await browser.newPage();

        const url = `https://translate.google.com.br/?sl=${idiomaOrigem}&tl=${idiomaDestino}&text=${encodeURIComponent(textoOriginal)}&op=translate`;

        let result;

        for (let i = 0; i < tentativas; i++) {
            await page.goto(url);

            try {
                // Aguardar a presença do seletor específico
                await page.waitForSelector('.ryNqvb', { timeout: 5000 });

                result = await page.evaluate(() => {
                    const translationElement = document.querySelector('.ryNqvb');
                    return translationElement ? translationElement.innerText : null;
                });

                if (result) {
                    break; // Se obtiver a tradução com sucesso, saia do loop de tentativas
                }
            } catch (error) {
                console.error(`Tentativa ${i + 1} falhou:`, error.message);
            }
        }

        if (!result) {
            throw new Error('Não foi possível obter a tradução após várias tentativas.');
        }

        // Armazenar a tradução no cache
        cache[cacheKey] = result;

        console.log('Tradução bem-sucedida:', result);
        return result;
    } catch (error) {
        console.error('Erro na tradução:', error.message);
        throw error;
    } finally {
        // Fechar o navegador após obter a tradução, mesmo em caso de erro
        if (browser) {
            await browser.close();
        }
    }
}

module.exports = { translateElements };