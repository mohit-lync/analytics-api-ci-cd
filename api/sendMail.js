const nodemailer = require("nodemailer");
const config = require("./config");

exports.sendMail = async (email_address, apiKey) => {
  try {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: config.EMAIL_CONFIG.smtpHost,
      port: config.EMAIL_CONFIG.port,
      secure: config.EMAIL_CONFIG.secure, // true for 465, false for other ports
      auth: {
        user: config.EMAIL_CONFIG.emailAddress, // generated ethereal user
        pass: config.EMAIL_CONFIG.password, // generated ethereal password
      },
      tls: config.EMAIL_CONFIG.tls,
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: `${config.EMAIL_CONFIG.organization} <${config.EMAIL_CONFIG.emailAddress}>`, // sender address
      to: email_address, // list of receivers
      subject: "Your API Key for LYNC SDK", // Subject line
      html: `<h1>Your API Key for LYNC SDK</h1>
      <p>Dear User,</p>
      <p>We are pleased to provide you with your API key for LYNC SDK. Your API key is a crucial element for accessing LYNC SDK and making the most of our platform.</p>
      <h3>API KEY:${apiKey}</h3>
      <p>Please keep your API key confidential to prevent unauthorized access to your account. If you suspect that your API key has been compromised, please notify us immediately.</p>
      <p>We hope you find our platform and API key useful. If you have any questions or issues, please don't hesitate to reach out to us for support.</p>
      <p>Thank you for choosing LYNC SDK.</p>
      <p>Best regards,</p>
      <p>LYNC</p>`, // html body
    });
    return info;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

exports.sendApiKeyAndSdkDocs = async (email_address, apiKey, platform) => {
  try {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: config.EMAIL_CONFIG.smtpHost,
      port: config.EMAIL_CONFIG.port,
      secure: config.EMAIL_CONFIG.secure, // true for 465, false for other ports
      auth: {
        user: config.EMAIL_CONFIG.emailAddress, // generated ethereal user
        pass: config.EMAIL_CONFIG.password, // generated ethereal password
      },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: `${config.EMAIL_CONFIG.organization} <${config.EMAIL_CONFIG.emailAddress}>`, // sender address
      to: email_address, // list of receivers
      subject: "Your API Key for LYNC SDK", // Subject line
      html: `<h1>Your API Key for LYNC SDK</h1>
      <p>Dear User,</p>
      <p>We are pleased to provide you with your API key for LYNC SDK. Your API key is a crucial element for accessing LYNC SDK and making the most of our platform.</p>
      <h3>API KEY:${apiKey}</h3>
      <h3>SDK Docs for the chosen platform: <a href=${
        config.DOCS[platform.toLowerCase()].link
      } target=_blank>${platform}</a></h3>
      <p>Please keep your API key confidential to prevent unauthorized access to your account. If you suspect that your API key has been compromised, please notify us immediately.</p>
      <p>We hope you find our platform and API key useful. If you have any questions or issues, please don't hesitate to reach out to us for support.</p>
      <p>Thank you for choosing LYNC SDK.</p>
      <p>Best regards,</p>
      <p>LYNC</p>`, // html body
    });
    return info;
  } catch (error) {
    console.log(error);
  }
};
