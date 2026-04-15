import axios from "axios";

export const sendOtpEmail = async (to, otp) => {
  try {
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          email: process.env.EMAIL_FROM,
          name: "Chat X",
        },
        to: [{ email: to }],
        subject: "Your OTP Code",
        htmlContent: `
          <h2>Your OTP is: ${otp}</h2>
          <p>This OTP expires in 10 minutes.</p>
        `,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("OTP email sent successfully");
  } catch (error) {
    console.error("Email send error:", error.response?.data || error.message);
    throw new Error("Email sending failed");
  }
};