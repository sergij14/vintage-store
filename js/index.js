import "regenerator-runtime/runtime";
import "core-js/stable";

if (module.hot) {
  module.hot.accept();
}

//

// Author: Sergi. J
// Date: Jan, 2020

//

("use strict");

const client = contentful.createClient({
  space: "5errz0iwjsls",
  accessToken: "M2fbKbJSZ1-Rk56Nd84fPGjuWNgqfIwXPhuQXCDAjb4",
});

////////////////////////////////////////////////////////
// Selecting
////////////////////////////////////////////////////////

const hamBtn = document.querySelector(".nav__ham-btn");
const nav = document.querySelector(".nav__menu");

const overlay = document.querySelector(".overlay");

const scrollLinks = document.querySelectorAll(".scroll");

const cartBtn = document.querySelector(".nav__cart-btn");
const cart = document.querySelector(".nav__cart");

const cartTotal = document.querySelector(".nav__cart__total");
const bagCartItems = document.querySelector(".nav__cart-count");

const store = document.querySelector(".store__items");

let cartList = [];

let buttons = [];

////////////////////////////////////////////////////////
// Cart & Nav Toggle
////////////////////////////////////////////////////////
const navShow = function () {
  nav.classList.toggle("nav__menu--show");
  hamBtn.firstElementChild.classList.toggle("fa-times");
  if (cart.classList.contains("nav__cart--show")) {
    cartShow();
  }
};

const outSideClick = function (event) {
  if (
    nav.classList.contains("nav__menu--show") &&
    !hamBtn.contains(event.target) &&
    !event.target.closest(".nav__menu")
  ) {
    navShow();
  }
};

const cartShow = function () {
  cart.classList.toggle("nav__cart--show");
  cartBtn.firstElementChild.classList.toggle("fa-times");
  overlay.classList.toggle("overlay--show");
};

hamBtn.addEventListener("click", navShow);
document.addEventListener("click", outSideClick);

cartBtn.addEventListener("click", cartShow);
overlay.addEventListener("click", cartShow);

////////////////////////////////////////////////////////
// Smooth Scrolling
////////////////////////////////////////////////////////

scrollLinks.forEach((link) => {
  link.addEventListener("click", function (event) {
    event.preventDefault();
    const id = event.target.dataset.section;
    const yOffset = -80;
    const element = document.getElementById(id);
    const y =
      element.getBoundingClientRect().top + window.pageYOffset + yOffset;

    window.scrollTo({ top: y, behavior: "smooth" });
  });
});

////////////////////////////////////////////////////////
// Getting Products
////////////////////////////////////////////////////////
class Products {
  async getProducts() {
    try {
      const contentful = await client.getEntries();

      let products = contentful.items;
      products = products.map((item) => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;
        return { title, price, id, image };
      });
      return products;
    } catch (err) {
      console.log(err);
    }
  }
}

////////////////////////////////////////////////////////
// Dispaly Products
////////////////////////////////////////////////////////
class UI {
  displayProducts(products) {
    products.forEach((product) => {
      store.insertAdjacentHTML(
        "beforeend",
        `
      <article class="store__item">
      <div class="store__item__img-container">
          <img class="store__item__img" src="${product.image}" />
          <button class="store__item__btn" data-id="${product.id}">Add to Cart</button>
      </div>
      <div class="store__item__info">
      <span class="store__item__title mar-tb-05">${product.title}</span>
      <span class="store__item__price">$ ${product.price}</span>
      </div>
  </article>
      `
      );
    });
  }
  getBagButtons() {
    let btns = [...document.querySelectorAll(".store__item__btn")];
    buttons = btns;

    btns.forEach((btn) => {
      const id = btn.dataset.id;
      let inCart = cartList.find((item) => item.id === id);
      if (inCart) {
        btn.textContent = "In Cart";
        btn.disabled = true;
      }

      btn.addEventListener("click", function (event) {
        event.target.textContent = "In Cart";
        event.target.disabled = true;

        let cartItem = { ...Storage.getProduct(id), amount: 1 };
        cartList = [...cartList, cartItem];

        Storage.saveCart(cartList);

        let TempTotal = 0;
        let itemsTotal = 0;
        cartList.map((item) => {
          TempTotal += item.price * item.amount;
          itemsTotal += item.amount;
        });
        cartTotal.textContent = parseFloat(TempTotal.toFixed(2));
        bagCartItems.textContent = itemsTotal;

        cart.insertAdjacentHTML(
          "afterbegin",
          `
<div class="nav__cart__item">
<img class="nav__cart__item__img" src="${cartItem.image}" />
<div class="nav__cart__item__info">
    <span class="nav__cart__item__title mar-tb-05">${cartItem.title}</span>
    <span class="nav__cart__item__price">$ ${cartItem.price}</span>
    <button class="nav__cart__item__remove-btn mar-tb-05" data-id="${cartItem.id}">Remove</button>
</div>
<div class="nav__cart__item__quantity">
    <i class="fas fa-chevron-up" data-id="${cartItem.id}"></i>
    <span class="nav__cart__item__quantity-counter">${cartItem.amount}</span>
    <i class="fas fa-chevron-down" data-id="${cartItem.id}"></i>
</div>
</div>
`
        );
        cartShow();
      });
    });
  }
  setupAPP() {
    cartList = Storage.getCart();
    let TempTotal = 0;
    let itemsTotal = 0;
    cartList.map((item) => {
      TempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    cartTotal.textContent = parseFloat(TempTotal.toFixed(2));
    bagCartItems.textContent = itemsTotal;
    cartList.forEach((item) => {
      cart.insertAdjacentHTML(
        "afterbegin",
        `
<div class="nav__cart__item">
<img class="nav__cart__item__img" src="${item.image}" />
<div class="nav__cart__item__info">
  <span class="nav__cart__item__title mar-tb-05">${item.title}</span>
  <span class="nav__cart__item__price">$ ${item.price}</span>
  <button class="nav__cart__item__remove-btn mar-tb-05" data-id="${item.id}">Remove</button>
</div>
<div class="nav__cart__item__quantity">
  <i class="fas fa-chevron-up" data-id="${item.id}"></i>
  <span class="nav__cart__item__quantity-counter">${item.amount}</span>
  <i class="fas fa-chevron-down" data-id="${item.id}"></i>
</div>
</div>
`
      );
    });
  }
  cartLogic() {
    const cartClearBtn = document.querySelector(".nav__cart__clear-btn");
    cartClearBtn.addEventListener("click", () => this.clearCart());
    cart.addEventListener("click", function (event) {
      if (event.target.classList.contains("nav__cart__item__remove-btn")) {
        let removeItem = event.target;
        let id = removeItem.dataset.id;
        cartList = cartList.filter((item) => item.id !== id);
        let TempTotal = 0;
        let itemsTotal = 0;
        cartList.map((item) => {
          TempTotal += item.price * item.amount;
          itemsTotal += item.amount;
        });
        cartTotal.textContent = parseFloat(TempTotal.toFixed(2));
        bagCartItems.textContent = itemsTotal;
        Storage.saveCart(cartList);
        let button = buttons.find((btn) => btn.dataset.id === id);
        button.disabled = false;
        button.textContent = "Add to Cart";
        cart.removeChild(removeItem.parentElement.parentElement);
      } else if (event.target.classList.contains("fa-chevron-up")) {
        let addAmount = event.target;
        let id = addAmount.dataset.id;
        let tempItem = cartList.find((item) => item.id === id);
        tempItem.amount += 1;
        Storage.saveCart(cartList);
        let TempTotal = 0;
        let itemsTotal = 0;
        cartList.map((item) => {
          TempTotal += item.price * item.amount;
          itemsTotal += item.amount;
        });
        cartTotal.textContent = parseFloat(TempTotal.toFixed(2));
        bagCartItems.textContent = itemsTotal;
        addAmount.nextElementSibling.textContent = tempItem.amount;
      } else if (event.target.classList.contains("fa-chevron-down")) {
        let lowerAmount = event.target;
        let id = lowerAmount.dataset.id;
        let tempItem = cartList.find((item) => item.id === id);
        tempItem.amount -= 1;
        if (tempItem.amount > 0) {
          Storage.saveCart(cartList);
          let TempTotal = 0;
          let itemsTotal = 0;
          cartList.map((item) => {
            TempTotal += item.price * item.amount;
            itemsTotal += item.amount;
          });
          cartTotal.textContent = parseFloat(TempTotal.toFixed(2));
          bagCartItems.textContent = itemsTotal;
          lowerAmount.previousElementSibling.textContent = tempItem.amount;
        } else {
          cart.removeChild(lowerAmount.parentElement.parentElement);
          cartList = cartList.filter((item) => item.id !== id);
          let TempTotal = 0;
          let itemsTotal = 0;
          cartList.map((item) => {
            TempTotal += item.price * item.amount;
            itemsTotal += item.amount;
          });
          cartTotal.textContent = parseFloat(TempTotal.toFixed(2));
          bagCartItems.textContent = itemsTotal;
          let button = buttons.find((btn) => btn.dataset.id === id);
          button.disabled = false;
          button.textContent = "Add to Cart";
        }
      }
    });
  }
  clearCart() {
    let cartItems = cartList.map((item) => item.id);
    cartItems.forEach((id) => this.removeItem(id));
    while (cart.children.length > 1) {
      cart.removeChild(cart.children[0]);
    }
    cartShow();
  }
  removeItem(id) {
    cartList = cartList.filter((item) => item.id !== id);
    let TempTotal = 0;
    let itemsTotal = 0;
    cartList.map((item) => {
      TempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    cartTotal.textContent = parseFloat(TempTotal.toFixed(2));
    bagCartItems.textContent = itemsTotal;
    Storage.saveCart(cartList);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.textContent = "Add to Cart";
  }
  getSingleButton(id) {
    return buttons.find((btn) => btn.dataset.id === id);
  }
}

////////////////////////////////////////////////////////
// Loccal Storage
////////////////////////////////////////////////////////
class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }

  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find((product) => product.id === id);
  }

  static saveCart(cartList) {
    localStorage.setItem("cart", JSON.stringify(cartList));
  }

  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

////////////////////////////////////////////////////////
document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();

  ui.setupAPP();

  products
    .getProducts()
    .then((products) => {
      ui.displayProducts(products);
      Storage.saveProducts(products);
    })
    .then(() => {
      ui.getBagButtons();
      ui.cartLogic();
    });
});
