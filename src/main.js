(function() {
    "use strict";

    const urlBase = 'http://localhost:3400/produtos';

    (function start() {
        createTable();
        document.querySelector('[data-js="formCadProduct"]').addEventListener('submit', cadProduct);
        document.querySelector('[data-js="formEditProduct"]').addEventListener('submit', EditProduct);
        document.querySelector('[data-js="formDelProduct"]').addEventListener('submit', DelProduct);
    })();

    function createLine(obj) {
        const tr = document.createElement('tr');
        const editAndDel = 
        `<td>
            <a href="#editProductModal" data-id="${ obj.id }" class="edit" data-toggle="modal"><i class="material-icons" data-toggle="tooltip" title="Edit">&#xE254;</i></a>
            <a href="#deleteProductModal" data-id="${ obj.id }" class="delete" data-toggle="modal"><i class="material-icons" data-toggle="tooltip" title="Delete">&#xE872;</i></a>
        </td>`;
        
        for(let prop in obj) {
            let td = document.createElement('td');
            if(prop !== 'dataCadastro') {
                td.textContent = obj[prop];
            } else {
                td.setAttribute('data-timestamp', obj[prop]);
                td.textContent = (new Date(obj[prop])).toLocaleDateString();
            }
            tr.appendChild(td);
        }
        tr.innerHTML += editAndDel;

        var lastCell = tr.lastElementChild;
        var btnEdit = lastCell.firstElementChild;
        var btnDel = lastCell.lastElementChild;

        btnEdit.addEventListener('click', sendDataForformEdit);
        btnDel.addEventListener('click', sendDataForformDel);
        return tr;
    }

    function sendDataForformEdit() {
        var formEditProduct = document.querySelector('[data-js="formEditProduct"]');
        var trActual = (this.parentElement).parentElement;
        var inputHidden = formEditProduct.querySelector('[data-js="idPut"]');
        inputHidden.value = this.dataset.id;

        var name = formEditProduct.querySelector('[data-js="name"]');
        var price = formEditProduct.querySelector('[data-js="price"]');
        var qtsStock = formEditProduct.querySelector('[data-js="qtsStock"]');
        var obs = formEditProduct.querySelector('[data-js="obs"]');
        
        name.value = trActual.cells[1].innerText;
        price.value = trActual.cells[2].innerText;
        qtsStock.value = trActual.cells[3].innerText;
        obs.value = trActual.cells[4].innerText;
        inputHidden.dataset.timestamp = trActual.cells[5].dataset.timestamp;
    }

    function sendDataForformDel() {
        var formDelProduct = document.querySelector('[data-js="formDelProduct"]');
        var inputHidden = formDelProduct.querySelector('[data-js="idDel"]');
        inputHidden.value = this.dataset.id;
    }

    function createHeadTable(obj) {
        var thead = document.createElement('thead');
        var tr = document.createElement('tr');

        for(let prop in obj) {
            let th = document.createElement('th');
            th.textContent = prop;
            tr.appendChild(th);
        }
        thead.appendChild(tr);
        return thead;
    }

    function createTable() {

        var table = document.createElement('table');
        var docFrag = document.createDocumentFragment();
        var tbody = document.createElement('tbody');

        table.setAttribute('class', 'table table-striped table-hover');
        // requisitando do servidor
        axios.get(urlBase)
        .then((response) => {
            response.data.forEach(objProd => {
                tbody.appendChild(createLine(new Produto(objProd)));
            });
            table.appendChild(createHeadTable(new Produto(response.data[0])));
            table.appendChild(tbody);
            docFrag.appendChild(table);
            injectTable(docFrag);
        })
        .catch(function (error) {
            console.error(error);
        });
    }

    /**
     * Function construtora para evitar bug na hora do editar 
     * Após o envio do update na hora de requisar esses dados trás eles desordenado. 
     */
    function Produto(obj) {
        obj = obj || {};
        this.id = obj.id;
        this.nome = obj.nome;
        this.valor = obj.valor;
        this.quantidadeEstoque = obj.quantidadeEstoque;
        this.observacao = obj.observacao;
        this.dataCadastro = obj.dataCadastro;
    }

    function injectTable(docFrag) {
        const divToInject = document.querySelector('[data-js="injectTable"]');
        divToInject.replaceChildren(docFrag);
    }

    function cadProduct(evt) {
        evt.preventDefault();
        var formCadProduct = document.querySelector('[data-js="formCadProduct"]');
        var name = formCadProduct.querySelector('[data-js="name"]');
        var price = formCadProduct.querySelector('[data-js="price"]');
        var qtsStock = formCadProduct.querySelector('[data-js="qtsStock"]');
        var obs = formCadProduct.querySelector('[data-js="obs"]');
        
        const newProduct = {
            nome: name.value,
            quantidadeEstoque: qtsStock.value,
            valor: price.value,
            dataCadastro: new Date().toISOString(),
            observacao: obs.value
        };

        axios.post(urlBase, newProduct)
        .then((response) => { 
            createTable();
            name.value = '';
            price.value = '';
            qtsStock.value = '';
            obs.value = '';
            document.querySelector('[data-js="closeWinCad"]').click();
            console.log(true);
        })
        .catch(function (error) {
            console.error(error);
        }); 
    }

    function EditProduct(evt) {
        evt.preventDefault();
        var formEditProduct = document.querySelector('[data-js="formEditProduct"]');
        var inputHidden = formEditProduct.querySelector('[data-js="idPut"]');
        var name = formEditProduct.querySelector('[data-js="name"]');
        var price = formEditProduct.querySelector('[data-js="price"]');
        var qtsStock = formEditProduct.querySelector('[data-js="qtsStock"]');
        var obs = formEditProduct.querySelector('[data-js="obs"]');
        var url = urlBase + '/' + inputHidden.value;

        var productEdited = {
            nome: name.value,
            quantidadeEstoque: qtsStock.value,
            valor: price.value,
            observacao: obs.value,
            dataCadastro: inputHidden.dataset.timestamp
        };
        axios.put(url, productEdited)
        .then((response) => {
            createTable();
            name.value = '';
            price.value = '';
            qtsStock.value = '';
            obs.value = '';
            document.querySelector('[data-js="closeWinEdit"]').click();

        })
        .catch(function (error) {
            console.error(error);
        });
    }

    function DelProduct(evt) {
        evt.preventDefault();
        var formDelProduct = document.querySelector('[data-js="formDelProduct"]');
        var inputHidden = formDelProduct.querySelector('[data-js="idDel"]');
        var url = urlBase + '/' + inputHidden.value;
        axios.delete(url)
        .then((response) => {
            createTable();
            document.querySelector('[data-js="closeWinDel"]').click();
        })
        .catch(function (error) {
            console.error(error);
        });
    }
})();
