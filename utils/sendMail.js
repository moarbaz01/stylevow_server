const transporter = require('../config/nodemailer');

// 
const sendMail = async (email, text, html) => {

    const info = await transporter.sendMail({
        from: '"STYLEVOW |~| " StyleVow.Com', // sender address
        to: email, // list of receivers
        subject: `${text}`, // Subject line
        text, // plain text body
        html: `<b>${html}</b>`, // html body
    })
    return info;
}

module.exports = sendMail;