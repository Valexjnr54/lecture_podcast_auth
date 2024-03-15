const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');
const fs = require('fs');
const { Config, emailConfig } = require('../config/config');

const transporter = nodemailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    secure: emailConfig.secure,
    auth: {
        user: emailConfig.auth.user,
        pass: emailConfig.auth.pass
    }
});

async function sendReceiptEmail(email, user, reference) {
    const templatePath = path.join(__dirname, '../templates/email-templates/receipt.ejs');
    const template = fs.readFileSync(templatePath, 'utf-8');

    const url = Config.appRootURL + "reference?" + reference;

    const mailOptions = {
        from: 'no-reply@ministry.com',
        to: email,
        subject: 'Registration Successful',
        html: ejs.render(template, { user, email, url }),
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully.');
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

async function sendCompletionEmail(email, user, reference, password) {
    const templatePath = path.join(__dirname, '../templates/email-templates/complete.ejs');
    const template = fs.readFileSync(templatePath, 'utf-8');

    const url = Config.appRootURL + "reference?" + reference;

    const mailOptions = {
        from: 'no-reply@ministry.com',
        to: email,
        subject: 'Registration Successful',
        html: ejs.render(template, { user, email, url, password }),
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully.');
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

async function sendDeliveryRequest(email, rider, deliveryDetail) {
    const templatePath = path.join(__dirname, '../templates/email-templates/delivery.ejs');
    const template = fs.readFileSync(templatePath, 'utf-8');

    const mailOptions = {
        from: 'info@riderapp.com',
        to: email,
        subject: 'Welcome to Riders App',
        html: ejs.render(template, { deliveryDetail, rider, email }),
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully.');
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

async function sendProposal(email, proposal) {
    const templatePath = path.join(__dirname, '../templates/email-templates/proposal.ejs');
    const template = fs.readFileSync(templatePath, 'utf-8');

    const mailOptions = {
        from: 'info@riderapp.com',
        to: email,
        subject: 'Welcome to Riders App',
        html: ejs.render(template, { proposal, email }),
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully.');
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

async function sendApproval(email, deliveryDetail) {
    const templatePath = path.join(__dirname, '../templates/email-templates/approve.ejs');
    const template = fs.readFileSync(templatePath, 'utf-8');

    const mailOptions = {
        from: 'info@riderapp.com',
        to: email,
        subject: 'Welcome to Riders App',
        html: ejs.render(template, { deliveryDetail, email }),
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully.');
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

async function sendReject(email, deliveryDetail) {
    const templatePath = path.join(__dirname, '../templates/email-templates/reject.ejs');
    const template = fs.readFileSync(templatePath, 'utf-8');

    const mailOptions = {
        from: 'info@riderapp.com',
        to: email,
        subject: 'Welcome to Riders App',
        html: ejs.render(template, { deliveryDetail, email }),
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully.');
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

module.exports = {
    sendReceiptEmail,
    sendCompletionEmail,
    sendDeliveryRequest,
    sendProposal,
    sendApproval,
    sendReject
};
