const modal = document.getElementById("enquiryModal");
const closeModalBtn = document.getElementById("closeModal");
const enrollBtns = document.querySelectorAll(".enroll-btn");
const leadForm = document.getElementById("leadForm");
const formStatus = document.getElementById("formStatus");
const yearEl = document.getElementById("year");
const submitBtn = leadForm ? leadForm.querySelector('button[type="submit"]') : null;
let isSubmitting = false;

if (yearEl) {
  yearEl.textContent = String(new Date().getFullYear());
}

function openModal(courseName) {
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  const courseField = leadForm.querySelector('input[name="interestedCourse"]');
  courseField.value = courseName || "";
  leadForm.querySelector('input[name="fullName"]').focus();
}

function closeModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
}

function clearErrors() {
  document.querySelectorAll(".error").forEach((el) => {
    el.textContent = "";
  });
}

function showErrors(errors = {}) {
  Object.keys(errors).forEach((field) => {
    const el = document.querySelector(`[data-error-for="${field}"]`);
    if (el) el.textContent = errors[field];
  });
}

enrollBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    openModal(btn.dataset.course);
  });
});

closeModalBtn.addEventListener("click", closeModal);

modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    closeModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal.classList.contains("open")) {
    closeModal();
  }
});

leadForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (isSubmitting) return;
  isSubmitting = true;
  clearErrors();
  formStatus.textContent = "Submitting your enquiry...";
  formStatus.className = "form-status";
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";
  }

  const formData = new FormData(leadForm);
  const payload = Object.fromEntries(formData.entries());

  if (Object.values(payload).some((val) => !String(val).trim())) {
    formStatus.textContent = "Please fill all required fields.";
    formStatus.classList.add("failure");
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit Enquiry";
    }
    isSubmitting = false;
    return;
  }

  try {
    const response = await fetch("/api/leads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (!response.ok) {
      showErrors(result.errors || {});
      formStatus.textContent = result.message || "Submission failed.";
      formStatus.classList.add("failure");
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit Enquiry";
      }
      isSubmitting = false;
      return;
    }

    formStatus.textContent =
      "Thank you! We have received your details and will contact you soon.";
    formStatus.classList.add("success");
    leadForm.reset();
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit Enquiry";
    }
    isSubmitting = false;
  } catch (error) {
    formStatus.textContent = "Server error. Please try again in a moment.";
    formStatus.classList.add("failure");
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit Enquiry";
    }
    isSubmitting = false;
  }
});
