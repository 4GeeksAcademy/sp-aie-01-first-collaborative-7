const TAX_RATE = 0.21;

const cartItems = [
  {
    id: 1,
    name: "Producto A",
    unitPrice: 58.5,
    quantity: 2,
    image:
      "https://images.unsplash.com/photo-1618354691321-e851c56960d1?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 2,
    name: "Producto B",
    unitPrice: 12.9,
    quantity: 3,
    image:
      "https://images.unsplash.com/photo-1611930021592-a8cfd5319ceb?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 3,
    name: "Producto C",
    unitPrice: 139.0,
    quantity: 1,
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=400&q=80",
  },
];

const dom = {
  cartContainer: document.querySelector("#cart-items"),
  template: document.querySelector("#cart-item-template"),
  itemCount: document.querySelector("#items-count"),
  subtotal: document.querySelector("#subtotal"),
  taxes: document.querySelector("#taxes"),
  total: document.querySelector("#total"),
  emptyMessage: document.querySelector("#empty-cart-message"),
  checkoutButton: document.querySelector("#checkout-button"),
};

function formatPrice(value) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

function computeItemTotal(item) {
  return item.unitPrice * item.quantity;
}

function updateSummary() {
  const subtotalValue = cartItems.reduce((acc, item) => acc + computeItemTotal(item), 0);
  const taxesValue = subtotalValue * TAX_RATE;
  const totalValue = subtotalValue + taxesValue;

  dom.subtotal.textContent = formatPrice(subtotalValue);
  dom.taxes.textContent = formatPrice(taxesValue);
  dom.total.textContent = formatPrice(totalValue);

  const count = cartItems.length;
  dom.itemCount.textContent = `${count} ${count === 1 ? "producto" : "productos"}`;

  const isEmpty = count === 0;
  dom.emptyMessage.classList.toggle("hidden", !isEmpty);
  dom.checkoutButton.disabled = isEmpty;
}

function changeQuantity(id, nextValue) {
  const item = cartItems.find((current) => current.id === id);
  if (!item) {
    return;
  }

  item.quantity = Math.max(1, nextValue);
  render();
}

function removeItem(id) {
  const index = cartItems.findIndex((item) => item.id === id);
  if (index === -1) {
    return;
  }

  cartItems.splice(index, 1);
  render();
}

function render() {
  dom.cartContainer.innerHTML = "";

  cartItems.forEach((item) => {
    const fragment = dom.template.content.cloneNode(true);
    const card = fragment.querySelector(".cart-item");
    const image = fragment.querySelector(".item-image");
    const name = fragment.querySelector(".item-name");
    const unitPrice = fragment.querySelector(".item-unit-price");
    const qtyInput = fragment.querySelector(".qty-input");
    const minusBtn = fragment.querySelector(".qty-btn.minus");
    const plusBtn = fragment.querySelector(".qty-btn.plus");
    const itemTotal = fragment.querySelector(".item-total");
    const removeBtn = fragment.querySelector(".remove-btn");

    card.dataset.id = String(item.id);
    image.src = item.image;
    image.alt = `Imagen de ${item.name}`;
    name.textContent = item.name;
    unitPrice.textContent = `Precio unitario: ${formatPrice(item.unitPrice)}`;
    qtyInput.value = String(item.quantity);
    itemTotal.textContent = formatPrice(computeItemTotal(item));

    minusBtn.addEventListener("click", () => changeQuantity(item.id, item.quantity - 1));
    plusBtn.addEventListener("click", () => changeQuantity(item.id, item.quantity + 1));

    qtyInput.addEventListener("input", () => {
      const parsed = Number.parseInt(qtyInput.value, 10);
      if (Number.isNaN(parsed)) {
        return;
      }
      changeQuantity(item.id, parsed);
    });

    qtyInput.addEventListener("blur", () => {
      const parsed = Number.parseInt(qtyInput.value, 10);
      changeQuantity(item.id, Number.isNaN(parsed) ? 1 : parsed);
    });

    removeBtn.addEventListener("click", () => removeItem(item.id));

    dom.cartContainer.appendChild(fragment);
  });

  updateSummary();
}

dom.checkoutButton.addEventListener("click", () => {
  if (cartItems.length === 0) {
    return;
  }
});

render();