const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

const header = document.getElementById("site-header");
if (header) {
  window.addEventListener("scroll", () => {
    header.classList.toggle("scrolled", window.scrollY > 30);
  });
}

const menuToggle = document.getElementById("menu-toggle");
const mainNav = document.getElementById("mainNav");
if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  document.querySelectorAll("#mainNav a").forEach((link) => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

const wizardForm = document.getElementById("wizardForm");
if (wizardForm) {
  const steps = Array.from(document.querySelectorAll(".step"));
  const progressBar = document.getElementById("progressBar");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const submitBtn = document.getElementById("submitBtn");
  const stepCurrent = document.getElementById("stepCurrent");
  const stepTotal = document.getElementById("stepTotal");
  const serviceSelect = document.getElementById("serviceSelect");
  const summaryBox = document.getElementById("summaryBox");
  const storageKey = "monsantosMigratoryForm";
  let currentStep = 0;

  if (stepTotal) stepTotal.textContent = String(steps.length);

  const visibleFieldValue = (field) => {
    if (!field) return "";
    if (field.type === "checkbox") return field.checked ? "Sí" : "No";
    return field.value ? field.value.trim() : "";
  };

  const saveFormData = () => {
    const formData = {};
    Array.from(wizardForm.elements).forEach((field) => {
      if (!field.name) return;
      formData[field.name] = field.type === "checkbox" ? field.checked : field.value;
    });
    localStorage.setItem(storageKey, JSON.stringify(formData));
  };

  const loadFormData = () => {
    const saved = localStorage.getItem(storageKey);
    if (!saved) return;
    try {
      const data = JSON.parse(saved);
      Object.entries(data).forEach(([key, value]) => {
        const field = wizardForm.elements.namedItem(key);
        if (!field) return;
        if (field.type === "checkbox") {
          field.checked = Boolean(value);
        } else {
          field.value = value;
        }
      });
    } catch (error) {
      console.error(error);
    }
  };

  const updateServiceSections = () => {
    const selectedService = serviceSelect ? serviceSelect.value : "";
    document.querySelectorAll(".service-fields").forEach((block) => {
      const matches = block.dataset.service
        .split(" ")
        .some((service) => service === selectedService);
      block.classList.toggle("hidden", !matches);
    });
  };

  const buildSummary = () => {
    if (!summaryBox) return;
    summaryBox.innerHTML = "";
    const fields = Array.from(wizardForm.querySelectorAll("input, select, textarea"));
    fields.forEach((field) => {
      if (!field.name || !visibleFieldValue(field)) return;
      const label = field.closest("label")?.querySelector("span")?.textContent || field.name;
      const wrapper = document.createElement("div");
      wrapper.className = "summary-item";
      wrapper.innerHTML = `<strong>${label}</strong><span>${visibleFieldValue(field)}</span>`;
      summaryBox.appendChild(wrapper);
    });
  };

  const validateStep = () => {
    const currentFields = Array.from(steps[currentStep].querySelectorAll("input, select, textarea"));
    for (const field of currentFields) {
      if (field.offsetParent === null) continue;
      if (!field.checkValidity()) {
        field.reportValidity();
        return false;
      }
    }
    return true;
  };

  const updateWizard = () => {
    steps.forEach((step, index) => {
      step.classList.toggle("active", index === currentStep);
    });

    const progress = ((currentStep + 1) / steps.length) * 100;
    if (progressBar) progressBar.style.width = `${progress}%`;
    if (stepCurrent) stepCurrent.textContent = String(currentStep + 1);
    if (prevBtn) prevBtn.style.display = currentStep === 0 ? "none" : "inline-flex";
    if (nextBtn) nextBtn.style.display = currentStep === steps.length - 1 ? "none" : "inline-flex";
    if (submitBtn) submitBtn.style.display = currentStep === steps.length - 1 ? "inline-flex" : "none";

    if (currentStep === steps.length - 1) {
      buildSummary();
    }
  };

  const generatePdf = () => {
    if (!window.jspdf || !window.jspdf.jsPDF) return;
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    const fields = Array.from(wizardForm.querySelectorAll("input, select, textarea"));
    let y = 18;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.text("Evaluación Migratoria - Monsantos Worldwide Solutions", 14, y);
    y += 12;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);

    fields.forEach((field) => {
      const value = visibleFieldValue(field);
      if (!field.name || !value) return;
      const label = field.closest("label")?.querySelector("span")?.textContent || field.name;
      const lines = pdf.splitTextToSize(`${label}: ${value}`, 180);
      if (y > 275) {
        pdf.addPage();
        y = 18;
      }
      pdf.text(lines, 14, y);
      y += lines.length * 6 + 2;
    });

    pdf.save("evaluacion-migratoria-monsantos.pdf");
  };

  prevBtn?.addEventListener("click", () => {
    if (currentStep > 0) {
      currentStep -= 1;
      updateWizard();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  nextBtn?.addEventListener("click", () => {
    if (!validateStep()) return;
    saveFormData();
    if (currentStep < steps.length - 1) {
      currentStep += 1;
      updateWizard();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  serviceSelect?.addEventListener("change", () => {
    updateServiceSections();
    saveFormData();
  });

  wizardForm.addEventListener("input", saveFormData);
  wizardForm.addEventListener("change", saveFormData);

  wizardForm.addEventListener("submit", (event) => {
    event.preventDefault();
    saveFormData();
    buildSummary();
    generatePdf();
    alert("La evaluación ha sido completada correctamente.");
  });

  loadFormData();
  updateServiceSections();
  updateWizard();
}
