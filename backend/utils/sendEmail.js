const nodemailer = require('nodemailer');

const cleanEnvValue = (value = '') => value.trim().replace(/^['"]|['"]$/g, '');

const sendEmail = async (to, subject, text) => {
    const emailUser = cleanEnvValue(process.env.EMAIL_USER);
    const emailPass = cleanEnvValue(process.env.EMAIL_PASS).replace(/\s/g, '');

    if (!emailUser || !emailPass) {
        throw new Error('Email credentials are missing');
    }

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: emailUser,
            pass: emailPass
        }
    });

    await transporter.sendMail({
        from: `"ShopNest" <${emailUser}>`,
        to,
        subject,
        text
    });
};


module.exports = sendEmail;
