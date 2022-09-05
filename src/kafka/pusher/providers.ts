import { config, logger } from "config";

import got from "got";
import nodemailer from "nodemailer";

const MAIL_SETTINGS = { ...config.mailServer };
const SMS_SETTINGS = { ...config.smsServer };

export function email(userEmail, message) {
  if (!MAIL_SETTINGS.active) return console.log(userEmail, message);
  if (MAIL_SETTINGS.nodemailer) return sendNodemailer(userEmail, message);
  return null;
}

async function sendNodemailer(userEmail, message) {
  const settings = MAIL_SETTINGS.nodemailer;
  // create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    service: settings.provider,
    auth: {
      user: settings.login,
      pass: settings.password,
    },
  });

  // setup email data with unicode symbols
  const mailOptions = {
    from: `"${settings.title}" <${settings.login}>`, // sender address
    to: userEmail, // list of receivers
    subject: message.title, // Subject line
    html: message.html || message.body, // html body
    attachments: message.attachments, // вложения
  };

  // send mail with defined transport object
  return transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return logger.info(error);
    }

    return info;
  });
}

export function phone(userPhone, message) {
  if (!SMS_SETTINGS.active) return console.log(userPhone, message);

  return smsCSms(userPhone, message.body);
}

const smsCSms = function (phoneNumber, message) {
  const SMSC_SETTINGS = SMS_SETTINGS.smsc;

  const fromTitle = SMSC_SETTINGS.title;

  const searchParams = {
    sender: fromTitle,
    phones: phoneNumber,
    mes: message,
    charset: "utf8",
    login: SMSC_SETTINGS.login,
    psw: SMSC_SETTINGS.password,
  };
  return got
    .get("https://smsc.ru/sys/send.php", { searchParams })
    .then((res) => {
      // ...
    })
    .catch((e) => {
      logger.error("SMSC send error", e);
      return {};
    });
};
