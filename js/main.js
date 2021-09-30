/* ----------------------------------------------
*   Curso Javascript - Coder House
*   Proyecto Final: Simulador Ecommerce "FreshMarket"
*   Profesor: Cristian Ciarallo
*   Alumno: Matías Nasiff
* ---------------------------------------------- */


/*
 * ----------------------------------------
 *  Clases
 * ----------------------------------------
 */
class Producto {
    constructor(id, nombre, tipo, categoria, precioUnitario) {
        this.id = id;
        this.nombre = nombre;
        this.tipo = tipo;
        this.categoria = categoria;
        this.precioUnitario = precioUnitario;
    }

    SumarIva() {
        this.precioUnitario = this.precioUnitario * 1.21;
    }
}

class Cliente {
    constructor(nombreCompleto, dni, direccion, telefono, email, carrito) {
        this.nombreCompleto = nombreCompleto;
        this.dni = dni;
        this.direccion = direccion;
        this.telefono = telefono;
        this.email = email;
        this.carrito = carrito;
    }
}


/*
 * ----------------------------------------
 *  Variables
 * ----------------------------------------
 */
let miLocalStorage = window.localStorage;
let listaDeProductos = [];
let carrito = [];
let clientes = [];
let itemsCategoria = [];

/*--Carrito--*/
let sideCart = document.querySelector('#sideCart');
let showCart = document.querySelector('#showCart');
let closeCart = document.querySelector('#closeCart');
let cartMessageIntro = document.querySelector('#cartMessageIntro');
let cartHeading = document.getElementById("cartHeading");
let cartItems = document.querySelector("#cartItems");
let buyButton = document.getElementById('buyButton');
let clearCartButton = document.getElementById('clearCartButton');
let cartTotal = document.querySelector(".cartTotal");
/*--Barra de búsqueda--*/
let searchBar = document.getElementById("searchBar");
/*--Seccion principal--*/
let section = document.querySelector(".section");
let sectionTitle = document.querySelector(".sectionTitle");
/*--Contador--*/
let counter = document.getElementById("counter");
/*--Payment Modal--*/
let paymentModal = document.getElementById("paymentModal");
let closePaymentModal = document.getElementsByClassName("close")[1];
let form = document.getElementById('form');
let paymentButton = document.getElementById("paymentButton");
/*--Success Modal--*/
let successModal = document.getElementById("successModal");
let closeSuccessModal = document.getElementsByClassName("close")[2];


/*
 * ----------------------------------------
 *  Eventos
 * ----------------------------------------
 */

window.addEventListener('DOMContentLoaded', () => {
    iniciar();
});

window.addEventListener('click', function (e) {
    if (e.target == successModal) {
        successModal.style.display = "none";
    }
    if (e.target == paymentModal) {
        paymentModal.style.display = "none";
    }
});

searchBar.addEventListener("submit", buscarProducto);

showCart.addEventListener('click', abrirCarrito);

closeCart.addEventListener('click', cerrarCarrito);

buyButton.addEventListener('click', cerrarCarrito);

clearCartButton.addEventListener('click', vaciarCarrito);

section.addEventListener('click', (e) => {
    if (e.target.classList.contains('button-add')) {
        agregarProductoAlCarrito(e);
    }
    e.stopPropagation();
});

cartItems.addEventListener("click", (e) => {
    // Quitar productos
    if (e.target.classList.contains('btn-red')) {
        let dataItem = e.target.dataset.remove;
        carrito = carrito.filter(x => x.id !== parseInt(dataItem));
        calcularTotal();
        imprimirCarrito();
        guardarCarritoEnLocalStorage();
    }

    // Aumentar cantidad
    if (e.target.classList.contains('btn-mas')) {
        let dataItem = e.target.dataset.mas;
        let item = carrito.find(x => x.id === parseInt(dataItem));
        item.cantidad++;
        calcularTotal();
        imprimirCarrito();
        guardarCarritoEnLocalStorage();
    }

    // Disminuir cantidad
    if (e.target.classList.contains('btn-menos')) {
        let dataItem = e.target.dataset.menos;
        let item = carrito.find(x => x.id === parseInt(dataItem));
        item.cantidad--;
        calcularTotal();
        imprimirCarrito();
        guardarCarritoEnLocalStorage();
        if (item.cantidad === 0) {
            carrito = carrito.filter(x => x.id !== parseInt(dataItem));
            calcularTotal();
            imprimirCarrito();
            guardarCarritoEnLocalStorage();
        }
    }
    e.stopPropagation();
});

buyButton.addEventListener('click', function () {
    paymentModal.style.display = "block";
});

closePaymentModal.addEventListener('click', function () {
    paymentModal.style.display = "none";
});

paymentButton.addEventListener("click", finalizarCompra);

closeSuccessModal.addEventListener('click', function () {
    successModal.style.display = "none";
    form.submit();
});


/*
 * ----------------------------------------
 *  Funciones
 * ----------------------------------------
 */

/*--Función principal--*/
function iniciar() {
    cargarCarritoDeLocalStorage();
    sectionTitle.innerHTML = "<h2>Todos los productos <span class='lineDeco'></span></h2>";
    cargarProductos();
    actualizarPrecios();
    imprimirProductos(listaDeProductos);
    
    // Por defecto, seleccionada la categoría 'Todos'
    document.getElementById('option-todos').checked = true;
    filtrarPorCategorias();

    cartHeading.innerHTML = "";
    cartMessageIntro.textContent = "Aún no tienes productos en el carrito!";

    // Testimonials
    $(document).ready(function () {
        pagenum = 1;

        function AutoRotate() {
            let allElements = document.getElementsByClassName("control");
            for (var i = 0, n = allElements.length; i < n; i++) {
                var myfor = allElements[i].getAttribute("for");
                if (myfor !== null && myfor == "slide_2_" + pagenum) {
                    allElements[i].click();
                    break;
                }
            }
            if (pagenum == 4) {
                pagenum = 1;
            } else {
                pagenum++;
            }
        }
        setInterval(AutoRotate, 5000);
    });

    let URLJSON = "data/clientes.json"
    $.getJSON(URLJSON, function (respuesta, estado) {
        if (estado === "success") {
            let clientes = respuesta;
            for (const cliente of clientes) {
                $("#sliderContainer").append(`<div class="slide_content">
                                                <div class="testimonial_2">
                                                    <img src="${cliente.avatar}" alt="${cliente.nombre}" />
                                                    <div class="content_2">
                                                        <q>${cliente.opinion}</q>
                                                    </div>
                                                    <div class="author_2">
                                                        <p><strong>-${cliente.nombre}-</strong></p>
                                                    </div>
                                                </div>
                                          </div>`)
            }
        }
    });
}

/*--Función que carga carrito previo almacenado en LocalStorage--*/
function cargarCarritoDeLocalStorage() {
    if (miLocalStorage.getItem('carrito') !== null) {
        carrito = JSON.parse(miLocalStorage.getItem('carrito'));
        imprimirCarrito();
    }
}

/*--Función para cargar lista de productos a la venta--*/
function cargarProductos() {
    listaDeProductos.push(new Producto(1, "Manzana", "Roja", "Frutas", 64));
    listaDeProductos.push(new Producto(2, "Kiwi", "", "Frutas", 270));
    listaDeProductos.push(new Producto(3, "Papa", "", "Verduras", 60));
    listaDeProductos.push(new Producto(4, "Banana", "", "Frutas", 89));
    listaDeProductos.push(new Producto(5, "Perejil", "", "Hierbas", 110));
    listaDeProductos.push(new Producto(6, "Tomate", "Perita", "Verduras", 100));
    listaDeProductos.push(new Producto(7, "Manzana", "Verde", "Frutas", 120));
    listaDeProductos.push(new Producto(8, "Pera", "", "Frutas", 72));
    listaDeProductos.push(new Producto(9, "Cebolla", "", "Verduras", 54));
    listaDeProductos.push(new Producto(10, "Mandarina", "", "Frutas", 70));
    listaDeProductos.push(new Producto(11, "Albahaca", "", "Hierbas", 220));
    listaDeProductos.push(new Producto(12, "Tomate", "Cherry", "Verduras", 250));
    listaDeProductos.push(new Producto(13, "Naranja", "", "Frutas", 46));
}

/*--Función para actualizar precios sumando IVA--*/
function actualizarPrecios() {
    for (const producto of listaDeProductos) {
        producto.SumarIva();
    }
}

/*--Función que imprime los productos--*/
function imprimirProductos(array) {
    for (const producto of array) {
        let productCard = document.createElement("div");
        productCard.classList.add("card", "fade-in");
        productCard.innerHTML =   ` <img class="cardImg" src="assets/img/${producto.nombre}${producto.tipo}.jpg">
                                    <h3>${producto.nombre} ${producto.tipo}</h3><h2>$${producto.precioUnitario.toFixed(2)}<small>/kilo</small></h2>
                                    <button class="button button-add" data-id="${producto.id}">AGREGAR</button>`;
        section.appendChild(productCard);
    }
}

/*--Función filtrar productos por categorías--*/
function filtrarPorCategorias() {
    document.getElementsByName('categoria').forEach((item) => {
        item.addEventListener('change', (e) => {
            let categoria = e.target.value;
            if (categoria === 'Todos') {
                itemsCategoria = listaDeProductos;
                section.innerHTML = "";
                sectionTitle.innerHTML = "<h2>Todos los productos <span class='lineDeco'></span></h2>";
                imprimirProductos(itemsCategoria);
            } else {
                itemsCategoria = listaDeProductos.filter(producto => producto.categoria === categoria);
                section.innerHTML = "";
                sectionTitle.innerHTML = `<h2>${categoria} <span class='lineDeco'></span></h2>`;
                imprimirProductos(itemsCategoria);
            }
            return itemsCategoria;
        });
    });
}

/*--Función que muestra el carrito--*/
function abrirCarrito() {
    document.getElementById("overlayCart").style.opacity = "1";
    sideCart.classList.add("slide-in-right");
    document.getElementById("overlayCart").style.display = "block";
}

/*--Función que cierra el carrito--*/
function cerrarCarrito() {
    document.getElementById("overlayCart").style.opacity = "0";
    sideCart.classList.remove("slide-in-right");
    document.getElementById("overlayCart").style.display = "none";
}

/*--Función para vaciar el carrito--*/
function vaciarCarrito() {
    finalizarContador();
    carrito = [];
    calcularTotal();
    cartTotal.innerHTML = "";
    imprimirCarrito();
    cartHeading.innerHTML = "";
    cartMessageIntro.textContent = "Aún no tienes productos en el carrito!";
    localStorage.clear();
}

/*--Función para buscar un producto--*/
function buscarProducto(e) {
    e.preventDefault();
    // Desmarco todas las categorías, para que el usuario luego de la búsqueda elija a qué categoría regresar
    document.getElementsByName('categoria').forEach((item) => {
        item.checked = false;
    });
    let productoBuscado = document.getElementById("search").value.toLowerCase();
    let productoEncontrado = listaDeProductos.filter(producto => producto.nombre.toLowerCase() === productoBuscado);
    if (productoEncontrado.length !== 0) {
        section.innerHTML = " ";
        sectionTitle.innerHTML = `<h2>Resultado de búqueda:</h2>`;
        imprimirProductos(productoEncontrado);
    } else {
        section.innerHTML = " ";
        sectionTitle.innerHTML = `<h2>Resultado de búqueda:</h2>`;
        section.innerHTML = `<p class="searchNoRes">No se encontró ningún producto que coincida con su búsqueda.</p>`;
    }
}

/*--Función para agregar productos al carrito--*/
function agregarProductoAlCarrito(e) {
    let dataItem = e.target.dataset.id;
    let item = listaDeProductos.find(producto => producto.id === parseInt(dataItem));

    if (carrito.some(x => x.id === item.id)) {
        item.cantidad++;
    }
    else {
        item.cantidad = 1;
        carrito.push(item);
    }

    // Mostrar alert de producto agregado
    document.querySelector('.alert').innerHTML = `<i class="fa fa-check" aria-hidden="true"></i>Agregaste ${item.cantidad} kilo de ${item.nombre} ${item.tipo} al carrito`;
    document.querySelector('.alert').classList.add('show');
    document.querySelector('.alert').classList.remove('hide');
    document.querySelector('.alert').classList.add('showAlert');
    setTimeout(() => {
        document.querySelector('.alert').classList.remove('show');
        document.querySelector('.alert').classList.add('hide');
    }, 4000);
    
    calcularTotal();
    imprimirCarrito();
    guardarCarritoEnLocalStorage();
}

/*--Función para calcular total de compra--*/
function calcularTotal() {
    let total = 0;
    for (let i = 0; i < carrito.length; i++) {
        total += carrito[i].precioUnitario * carrito[i].cantidad;
    }
    cartTotal.innerHTML = "TOTAL: $" + total.toFixed(2);
    return total;
}

/*--Función que almacena carrito en LocalStorage--*/
function guardarCarritoEnLocalStorage() {
    miLocalStorage.setItem('carrito', JSON.stringify(carrito));
}

/*--Función imprimir carrito--*/
function imprimirCarrito() {
    cartHeading.innerHTML = `<tr>
                                <th>Producto</th>
                                <th>Precio</th>
                                <th>Cantidad</th>
                                <th>Subtotal</th>
                                <th></th>
                            </tr>`
    cartItems.innerHTML = "";

    if (carrito.length !== 0) {
        cartMessageIntro.textContent = "";
        iniciarContador();

        for (const item of carrito) {
            let subtotal = 0;
            subtotal = item.precioUnitario * item.cantidad;

            let cartItem = document.createElement("tr");
            cartItem.innerHTML = ` <td>${item.nombre} ${item.tipo}</td>
                                    <td>$${item.precioUnitario.toFixed(2)}</td>
                                    <td>
                                        <div class="q-container">
                                            <button class="btn btn-menos" data-menos="${item.id}">-</button>
                                            <span class="q" data-q="${item.id}">${item.cantidad}</span>
                                            <button class="btn btn-mas" data-mas="${item.id}">+</button>
                                        </div>
                                    </td>
                                    <td>$${subtotal.toFixed(2)}</td>
                                    <td><button class="btn btn-red" data-remove="${item.id}">x</button></td> `;
            cartItems.appendChild(cartItem);
        }
    } 
    else {
        finalizarContador();
        calcularTotal();
        cartTotal.innerHTML = "";
        cartMessageIntro.textContent = "Aún no tienes productos en el carrito!";
        cartHeading.innerHTML = "";
    }
}

/*--Función para contar los de productos del carrito--*/
function iniciarContador() {
    let contador = carrito.reduce(function (acum, item) {
        return acum + item.cantidad;
    }, 0);
    counter.classList.add('animate__animated', 'animate__bounceIn');
    counter.innerHTML = `<span class="counterText">${contador}</span>`
    counter.style.display = "block";
}

/*--Función finalizar contador--*/
function finalizarContador() {
    counter.classList.replace('animate__bounceIn', 'animate__bounceOut');
    setTimeout(() => {
        counter.classList.remove('animate__animated', 'animate__bounceOut');
        counter.style.display = "none";        
    }, 1000);
}

/*--Función para finalizar compra--*/
function finalizarCompra(e) {
    e.preventDefault();
    let nombreCliente = document.getElementsByTagName('input')[6].value;
    let dniCliente = document.getElementsByTagName('input')[7].value;
    let direccionCliente = document.getElementsByTagName('input')[9].value;
    let telefonoCliente = document.getElementsByTagName('input')[8].value;
    let emailCliente = document.getElementsByTagName('input')[10].value;

    let nuevoCliente = new Cliente(nombreCliente, dniCliente, direccionCliente, telefonoCliente, emailCliente, carrito);
    clientes.push(nuevoCliente);

    localStorage.setItem(1, JSON.stringify(clientes));   
    paymentModal.style.display = "none";

    // Mostar mensaje de confirmación de pago
    let successMessage = document.getElementById("successMessage");
    successMessage.innerHTML = `<h2>¡El pago fue realizado con éxito!</h2>
                                <h3>${nombreCliente}, muchas gracias por tu compra!</h3>
                                <h3>Te enviamos a ${emailCliente} la confimación de tu compra.</h3><br>`;
    successModal.style.display = "block";
}
