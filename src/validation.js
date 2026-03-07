function validateLead(lead) {
  const errors = {};

  if (!lead.fullName || lead.fullName.trim().length < 2) {
    errors.fullName = "Please enter your full name.";
  }

  const mobile = String(lead.mobileNumber || "").trim();
  if (!/^[0-9+\-\s]{8,15}$/.test(mobile)) {
    errors.mobileNumber = "Please enter a valid mobile number.";
  }

  const email = String(lead.emailAddress || "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.emailAddress = "Please enter a valid email address.";
  }

  if (!lead.currentExperience || lead.currentExperience.trim().length < 1) {
    errors.currentExperience = "Please enter your current experience.";
  }

  if (!lead.interestedCourse || lead.interestedCourse.trim().length < 2) {
    errors.interestedCourse = "Please select a course.";
  }

  if (!lead.message || lead.message.trim().length < 5) {
    errors.message = "Please add a short message or learning goal.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

module.exports = {
  validateLead
};
