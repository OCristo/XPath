let htmlContent = null;
let output = document.getElementById('output');
let divSelectXPath = document.getElementById('contenedorSelectXPath');
let divIntroducirXPath = document.getElementById('contenedorXpath');
let btnIntroducir = document.getElementById('btnIntroducir');
let btnSelect = document.getElementById('btnSelect');

function introducirXPath() {
    divSelectXPath.classList.add('hidden');
    divIntroducirXPath.classList.remove('hidden');
    btnIntroducir.classList.add('hidden');
    btnSelect.classList.remove('hidden');
    esSelect.value = "";
    esIntroducido.value = "true";
}
function introducirSelectXPath() {
    divIntroducirXPath.classList.add('hidden');
    divSelectXPath.classList.remove('hidden');
    btnIntroducir.classList.remove('hidden');
    btnSelect.classList.add('hidden');
    esSelect.value = "true";
    esIntroducido.value = "";
}
async function scrape() {
    let urlIntroducido = document.getElementById('urlIntroducido').value;
    let xpathIntroducido = document.getElementById('xpathIntroducido').value;
    let esSelect = document.getElementById('esSelect');
    let esIntroducido = document.getElementById('esIntroducido');

    output.innerHTML = "<span class='text-gray-400'>Cargando...</span>";

    if (!urlIntroducido&&!!esIntroducido.value) {
        output.innerHTML = "<span class='text-red-500'>Debes ingresar una URL válida.</span>";
        return;
    }
    if (!xpathIntroducido&&!!esIntroducido.value) {
        output.innerHTML = "<span class='text-red-500'>Debes ingresar una expresión XPath.</span>";
        return;
    }

    try {
        
        if (!!esSelect.value) {
            let urlSeleccionado = document.getElementById("urls").value;
            let xpathSeleccionado = document.getElementById("xpaths").value;
            fetchData(urlSeleccionado,xpathSeleccionado);
        }
        if (!!esIntroducido.value) {
            fetchData(urlIntroducido,xpathIntroducido);
        }

    } catch (error) {
        output.innerHTML = `<span class='text-red-500'>Error: ${error.message}</span>`;
    }


    
}
function fetchData(url, xpath) {
    fetch(url)
    .then(
        function(respuesta) {
        if (!respuesta.ok) {
            console.log(url);
            console.log(xpath);
            throw new Error(`Error al descargar el HTML: ${respuesta.status}`);
        }
        return respuesta.text();
    })
    .then(
        function(htmlContent) {
            console.log(url);
            console.log(xpath);
        console.log(htmlContent);

        // Crear un DOM temporal a partir del HTML descargado
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');

        // Evaluar la expresión XPath
        const results = [];
        const evaluator = new XPathEvaluator();
        const result = evaluator.evaluate(xpath, doc, null, XPathResult.ANY_TYPE, null);

        let node = result.iterateNext();
        while (node) {
            results.push(node.outerHTML || node.textContent);
            node = result.iterateNext();
        }

        // Mostrar los resultados
        output.innerHTML = results.length > 0 ? results.map(r => `<p class="text-gray-700">${r}</p>`).join('') 
                                               : "<span class='text-gray-500'>No se encontraron resultados.</span>";
    })
    .catch(
        function(error) {
        output.innerHTML = `<span class='text-red-500'>Error: ${error.message}</span>`;
    });
}
document.getElementById('urls').addEventListener('change', function() {
    const urlSeleccionado = this.value;
    const xpathsSelect = document.getElementById('xpaths');

    // Aquí puedes definir las opciones de XPath para cada URL
    const xpathsOptions = {
        'https://www.apple.com/es/': [
            { value: '//a[contains(@class, "unit-link")]/@href', text: 'Enlaces a productos destacados' },
            { value: '//footer//a/text()', text: 'Pie de página - enlaces principales' },
            { value: '//h2[contains(@class, "headline")]/text()', text: 'Títulos de secciones principales' }
        ],
        'https://scholar.google.es/citations?user=a1Z-3jkAAAAJ&hl=es': [
            { value: '//a[@class="gsc_a_at"]/text()', text: 'Titulos de publicaciones' },
            { value: '//a[@class="gsc_a_ac gs_ibl"]/text()', text: 'Numero de citas por publicacion' },
            { value: '//span[@class="gsc_a_h gsc_a_hc gs_ibl"]/text()', text: 'Año de publicacion' }
        ]
    };

    // Limpiar las opciones actuales del select "xpaths"
    xpathsSelect.innerHTML = '';

    // Agregar las nuevas opciones basadas en la URL seleccionada
    if (xpathsOptions[urlSeleccionado]) {
        xpathsOptions[urlSeleccionado].forEach(option => {
            const opt = document.createElement('option');
            opt.value = option.value;
            opt.textContent = option.text;
            xpathsSelect.appendChild(opt);
        });
    }
});
