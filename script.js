const form = document.getElementById("checkoutForm");
const steps = Array.from(document.querySelectorAll(".step"));
const progressFill = document.getElementById("progressFill");
const progressDots = Array.from(document.querySelectorAll(".progress-steps li"));
const stepMeta = document.getElementById("stepMeta");
const backBtn = document.getElementById("backBtn");
const nextBtn = document.getElementById("nextBtn");
const confirmBtn = document.getElementById("confirmBtn");
const formStatus = document.getElementById("formStatus");

let currentStep = 1;

const validators = {
  fullName: (v) => v.trim().length > 2 || "Ingresa tu nombre completo.",
  email: (v) => /^\S+@\S+\.\S+$/.test(v.trim()) || "Ingresa un correo valido.",
  phone: (v) => /^[\d\s()+-]{8,}$/.test(v.trim()) || "Ingresa un telefono valido.",
  address: (v) => v.trim().length > 5 || "Ingresa una direccion valida.",
  city: (v) => v.trim().length > 1 || "Ingresa la ciudad.",
  postalCode: (v) => /^[A-Za-z0-9\s-]{3,10}$/.test(v.trim()) || "Ingresa un codigo postal valido.",
  country: (v) => v.trim().length > 1 || "Ingresa el pais.",
  cardNumber: (v) => v.replace(/\s+/g, "").length >= 13 || "Numero de tarjeta incompleto.",
  cardHolder: (v) => v.trim().length > 2 || "Ingresa el nombre del titular.",
  cardExpiry: (v) => {
    const clean = v.trim();
    if (!/^\d{2}\/\d{2}$/.test(clean)) {
      return "Usa formato MM/AA.";
    }
    const [mm] = clean.split("/").map(Number);
    return (mm >= 1 && mm <= 12) || "Mes de expiracion invalido.";
  },
  cardCvv: (v) => /^\d{3,4}$/.test(v.trim()) || "CVV invalido.",
};

const fieldsByStep = {
  1: ["fullName", "email", "phone"],
  2: ["address", "city", "postalCode", "country"],
  3: ["cardNumber", "cardHolder", "cardExpiry", "cardCvv"],
};

function setError(fieldName, message) {
  const input = form.elements[fieldName];
  const errorEl = document.querySelector(`[data-error-for="${fieldName}"]`);

  if (!input || !errorEl) return;

  errorEl.textContent = message || "";
  input.classList.remove("is-error", "is-valid");

  if (message) {
    input.classList.add("is-error");
  } else if (input.value.trim()) {
    input.classList.add("is-valid");
  }
}

function validateField(fieldName) {
  const input = form.elements[fieldName];
  const rule = validators[fieldName];

  if (!input || !rule) return true;
  const result = rule(input.value);
  const isValid = result === true;
  setError(fieldName, isValid ? "" : result);
  return isValid;
}

function validateStep(stepNumber) {
  let isStepValid = true;
  fieldsByStep[stepNumber].forEach((field) => {
    if (!validateField(field)) {
      isStepValid = false;
    }
  });
  return isStepValid;
}

function updateProgress() {
  const percent = (currentStep / steps.length) * 100;
  progressFill.style.width = `${percent}%`;
  stepMeta.textContent = `Paso ${currentStep} de ${steps.length}`;

  document
    .querySelector(".progress")
    .setAttribute("aria-valuenow", String(currentStep));

  progressDots.forEach((dot, index) => {
    dot.classList.toggle("active", index + 1 <= currentStep);
  });

  backBtn.disabled = currentStep === 1;
  nextBtn.hidden = currentStep === steps.length;
  confirmBtn.hidden = currentStep !== steps.length;
}

function showStep(stepNumber) {
  currentStep = stepNumber;

  steps.forEach((step) => {
    const isCurrent = Number(step.dataset.step) === currentStep;
    step.hidden = !isCurrent;
    step.classList.toggle("active", isCurrent);
  });

  formStatus.textContent = "";
  updateProgress();
}

function setupRealtimeValidation() {
  Object.keys(validators).forEach((fieldName) => {
    const input = form.elements[fieldName];
    if (!input) return;

    input.addEventListener("input", () => {
      validateField(fieldName);
    });
  });
}

function setupCardFormatting() {
  const cardNumber = form.elements.cardNumber;
  const cardExpiry = form.elements.cardExpiry;

  cardNumber.addEventListener("input", (event) => {
    const value = event.target.value.replace(/\D/g, "").slice(0, 16);
    event.target.value = value.replace(/(.{4})/g, "$1 ").trim();
  });

  cardExpiry.addEventListener("input", (event) => {
    const value = event.target.value.replace(/\D/g, "").slice(0, 4);
    event.target.value = value.length > 2 ? `${value.slice(0, 2)}/${value.slice(2)}` : value;
  });
}

backBtn.addEventListener("click", () => {
  if (currentStep > 1) {
    showStep(currentStep - 1);
  }
});

nextBtn.addEventListener("click", () => {
  if (!validateStep(currentStep)) {
    formStatus.textContent = "Completa los campos requeridos para continuar.";
    return;
  }
  showStep(currentStep + 1);
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!validateStep(3)) {
    formStatus.textContent = "Revisa los datos de pago antes de confirmar.";
    return;
  }

  formStatus.textContent = "Compra confirmada. Gracias por elegir Marea.";
});

setupRealtimeValidation();
setupCardFormatting();
updateProgress();