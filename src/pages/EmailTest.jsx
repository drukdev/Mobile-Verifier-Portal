import React, { useState } from "react";

const EmailForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <form
      action="https://formsubmit.co/druk3s.official@gmail.com"  // Replace with your email
      method="POST"
    >
      <input
        type="text"
        name="name"
        placeholder="Your Name"
        value={formData.name}
        onChange={handleChange}
        required
      />
      <input
        type="email"
        name="email"
        placeholder="Your Email"
        value={formData.email}
        onChange={handleChange}
        required
      />
      <textarea
        name="message"
        placeholder="Your Message"
        value={formData.message}
        onChange={handleChange}
        required
      />
      {/* Anti-Spam Protection */}
      <input type="hidden" name="_captcha" value="false" />

      {/* Redirect after submission (optional) */}
      <input type="hidden" name="_next" value="https://www.bhutanndi.com/" />

      <button type="submit">Send Email</button>
    </form>
  );
};

export default EmailForm;
