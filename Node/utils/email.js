const nodemailer = require('nodemailer');
// const htmlToText = require('html-to-text');
const pug = require('pug');

module.exports = class Email {
  constructor(user, assetID) {
    this.to = user.email;
    this.firstName = user.name;
    this.assetID = assetID;
    this.from = `Tenx`;
  }

  newTransport() {
    // if (process.env.NODE_ENV === 'production') {
    //   // sendgrid
    //   return 1;
    // }
    return nodemailer.createTransport({
      service: 'gmail',
      // host: process.env.EMAIL_HOST,
      // PORT: process.env.EMAIL_PORT,
      // secureConnection: false,
      auth: {
        user: process.env.EMAIL_USERNAME_LOCAL,
        pass: process.env.EMAIL_PASSWORD_LOCAL,
      },
      // tls: {
      //   ciphers: 'SSLv3',
      // },
    });
  }

  // send the actual email
  async send(template, subject) {
    // 1) render the HTML based on the pug template
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        assetID: this.assetID,
        subject: this.subject,
      }
    );
    // 2) define email options

    // INSTALL html-to-text
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: subject,
      html,
      // text: htmlToText.fromString(html),
    };

    // 3) create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendId() {
    await this.send('assetId', 'Here is your certificate Asset ID');
    console.log('Sent!');
  }
};
