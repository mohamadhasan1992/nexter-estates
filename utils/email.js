const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');
const mailGun = require('nodemailer-mailgun-transport');

//creating a template for email
module.exports = class Email{
  constructor(user,url){
    this.to = user.email;
    this.firstName = user.username;
    this.url = url;
    this.from = `mohamadhasan Tabrizi <${process.env.EMAIL_FROM}>`;
  }

  methodTransport(){
    //if in production environment
    
    if (process.env.NODE_ENV === 'production') {
      //send grid
      
      return nodemailer.createTransport(
        mailGun({
          host: process.env.MAILGUN_HOST,
          port: process.env.MAILGUN_PORT,
          //secureConnection: true,
          auth: {
            user: process.env.MAILGUN_USERNAME,
            pass: process.env.MAILGUN_PASSWORD,
          },
        })
      );
    }
    //if in development environment
    return nodemailer.createTransport({
      host:process.env.EMAIL_HOST,
      port:process.env.EMAIL_PORT,
      //secureConnection: true,
      auth:{
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD
       }
    })
    
  }

//method that will do actual sending
  async send(template,subject){
    //send actual email
    //1-render html for the email pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`,{
      firstName:this.firstName,
      url:this.url,
      subject
    });

    //2-define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html),
    };

    //3-create a transport and send an email
    await this.methodTransport().sendMail(mailOptions);

  }

  async sendWelcome(){
    await this.send('welcome','به خانواده ی نکستر خوش آمدید');
  }
  
  async sendPasswordReset(){
    await this.send('passwordReset','تا دقیقه می توانید با استفاده از این پیام رمز عبور خود را تغییر دهید');

  }
} 

