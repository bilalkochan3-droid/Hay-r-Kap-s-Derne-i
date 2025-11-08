(function () {
  "use strict";

  const formatCurrency = (value) => {
    if (Number.isNaN(value)) {
      return "";
    }
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const createCartStore = () => {
    const items = [];
    const findItemIndex = (id) => items.findIndex((entry) => entry.id === id);

    return {
      items,
      addItem(item) {
        const index = findItemIndex(item.id);
        if (index > -1) {
          items[index].quantity += item.quantity;
        } else {
          items.push({ ...item });
        }
        document.dispatchEvent(
          new CustomEvent("hk:cart:updated", {
            detail: { items: [...items] },
          })
        );
      },
    };
  };

  if (!window.HKDonationCart) {
    window.HKDonationCart = createCartStore();
  }

  const updateCardContent = (wrapper) => {
    const dataset = wrapper.dataset;
    const title = dataset.title;
    const description = dataset.description;
    const price = Number.parseFloat(dataset.price);
    const image = dataset.image;
    const whatsappNumber = dataset.whatsappNumber;
    const donationUrl = dataset.donationUrl;

    const titleElement = wrapper.querySelector(".hk-card__title");
    if (title && titleElement) {
      titleElement.textContent = title;
    }

    const descriptionElement = wrapper.querySelector(".hk-card__description");
    if (description && descriptionElement) {
      descriptionElement.textContent = description;
    }

    const priceElement = wrapper.querySelector("[data-price-text]");
    if (priceElement) {
      const formattedPrice = formatCurrency(price);
      priceElement.textContent = formattedPrice || dataset.price || "";
    }

    const imageElement = wrapper.querySelector(".hk-card__media img");
    if (image && imageElement) {
      imageElement.src = image;
      if (!imageElement.alt || imageElement.alt.trim() === "") {
        imageElement.alt = `${title || "Bağış"} görseli`;
      }
    }

    const whatsappAnchor = wrapper.querySelector("[data-whatsapp-link]");
    if (whatsappAnchor) {
      if (whatsappNumber) {
        const message = encodeURIComponent(
          `Merhaba, ${title || "bağış"} için destek olmak istiyorum.`
        );
        const normalizedNumber = whatsappNumber.replace(/[^\d]/g, "");
        whatsappAnchor.href = `https://wa.me/${normalizedNumber}?text=${message}`;
        whatsappAnchor.removeAttribute("hidden");
      } else {
        whatsappAnchor.setAttribute("hidden", "hidden");
      }
    }

    const addToCartButton = wrapper.querySelector("[data-add-to-cart]");
    if (addToCartButton) {
      const cardId = dataset.cardId;
      const addToCart = () => {
        if (!cardId) {
          console.warn("Bağış kartı için cardId eksik", wrapper);
          return;
        }

        const item = {
          id: cardId,
          title: title || "", 
          price: Number.isNaN(price) ? null : price,
          quantity: 1,
          donationUrl: donationUrl || null,
        };

        window.HKDonationCart.addItem(item);
        addToCartButton.disabled = true;
        const originalLabel = addToCartButton.textContent;
        addToCartButton.textContent = "Sepete Eklendi";
        setTimeout(() => {
          addToCartButton.disabled = false;
          addToCartButton.textContent = originalLabel;
        }, 1400);
      };

      addToCartButton.removeEventListener("click", addToCart);
      addToCartButton.addEventListener("click", addToCart);
    }
  };

  const initializeCards = () => {
    const wrappers = document.querySelectorAll("[data-card-id]");
    wrappers.forEach(updateCardContent);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeCards);
  } else {
    initializeCards();
  }
})();
