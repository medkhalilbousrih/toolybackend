const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
// async..await is not allowed in global scope, must use a wrapper
const sendVerif = async (id, email) => {
  const token = jwt.sign({ id }, process.env.SECRET, { expiresIn: "1h" });
  let transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "tooly.team@gmail.com",
      pass: "toolyteam2020",
    },
  });
  // send mail with defined transport object
  await transporter.sendMail({
    from: '"Tooly" <tooly.team@gmail.com>', // sender address
    to: `${email}`, // list of receivers
    subject: "Confirmation", // Subject line
    html: `Hi,

    Thanks for getting started with Tooly.
    
    We need a little more information to complete your registration, including a confirmation of your email address. 
    
    Click below to confirm your email address:
    
    <a href="https://tranquil-journey-35786.herokuapp.com/api/users/confirmation/${token}">http://localhost:3001/api/users/confirmation</a>
    
    If you have problems, please paste the above URL into your web browser.`, // html body
  });
};

module.exports = sendVerif;
