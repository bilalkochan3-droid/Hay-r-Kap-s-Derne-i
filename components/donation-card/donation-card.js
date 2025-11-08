(function () {
  "use strict";

  const scope = document.getElementById("hk-kart-551");
  if (!scope) {
    return;
  }

  const amountInput = scope.querySelector("[data-amount-input]");
  const priceElement = scope.querySelector("[data-price]");
  const donateButton = scope.querySelector("[data-donate]");
  const whatsappLink = scope.querySelector("[data-whatsapp]");

  const minAmount = (() => {
    const fromDataset = Number.parseInt(scope.dataset.min || "1", 10);
    return Number.isNaN(fromDataset) || fromDataset < 1 ? 1 : fromDataset;
  })();

  const formatCurrency = (value) =>
    new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      maximumFractionDigits: 0,
    }).format(value);

  const normaliseAmount = (rawValue) => {
    const digitsOnly = String(rawValue).replace(/[^\d]/g, "");
    const parsed = Number.parseInt(digitsOnly, 10);
    if (Number.isNaN(parsed) || parsed < minAmount) {
      return minAmount;
    }
    return parsed;
  };

  const renderAmount = (value) => {
    const numeric = normaliseAmount(value);
    amountInput.value = String(numeric);
    priceElement.textContent = formatCurrency(numeric);
    donateButton.disabled = numeric <= 0;
    return numeric;
  };

  const initialiseWhatsapp = () => {
    if (!whatsappLink) {
      return;
    }

    const rawNumber = (scope.dataset.whatsapp || "").replace(/[^\d]/g, "");
    if (!rawNumber) {
      whatsappLink.hidden = true;
      return;
    }

    const normalisedNumber = rawNumber.startsWith("0") && rawNumber.length === 11
      ? `9${rawNumber.slice(1)}`
      : rawNumber;

    const message = encodeURIComponent(
      "Merhaba, Kermes Bağışı için destek vermek istiyorum."
    );

    whatsappLink.href = `https://wa.me/${normalisedNumber}?text=${message}`;
    whatsappLink.hidden = false;
  };

  amountInput.addEventListener("input", () => {
    renderAmount(amountInput.value);
  });

  amountInput.addEventListener("blur", () => {
    renderAmount(amountInput.value);
  });

  donateButton.addEventListener("click", () => {
    const total = renderAmount(amountInput.value);
    if (!total) {
      return;
    }

    const id = scope.dataset.id || "";
    const tur = scope.dataset.tur || "";
    const titleTxt = scope.dataset.title || "";

    const basketFn = window.hkAddToBasket || window.HKAddToBasket;
    if (typeof basketFn === "function") {
      basketFn(scope, id, tur, titleTxt, total, 1);
    } else {
      console.warn("hkAddToBasket fonksiyonu bulunamadı.");
    }
  });

  renderAmount(minAmount);
  initialiseWhatsapp();
})();
