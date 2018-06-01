// @flow

import nodemailer from "nodemailer";

import type { IMailer, EmailMessage } from "backend-types";

class Mailer implements IMailer {
  transporter: Object;
  testEmailsOnly: boolean;
  testEmailDomain: string;

  constructor(props: MailerConstructorProps) {
    const { smtpConfig, testEmailsOnly, testEmailDomain } = props;
    this.transporter = nodemailer.createTransport(smtpConfig);
    this.testEmailsOnly = testEmailsOnly || false;
    this.testEmailDomain = testEmailDomain;
  }

  async sendMail(message: EmailMessage): Promise<?Object> {
    const to = this.getValidRecipients(message);
    if (to.length) {
      return this.transporter.sendMail({
        ...message,
        to,
      });
    }
  }

  getValidRecipients(message: EmailMessage): Array<string> {
    const recipients =
      typeof message.to === "string" ? [message.to] : message.to;
    return this.testEmailsOnly
      ? recipients.filter(email => email.includes(`@${this.testEmailDomain}`))
      : recipients;
  }
}

type MailerConstructorProps = {
  smtpConfig: {
    host: string,
    port: string,
    secure?: boolean,
    auth?: {
      user: string,
      pass: string,
    },
    tls?: {
      rejectUnauthorized: boolean,
    },
  },
  testEmailsOnly?: boolean,
  testEmailDomain: string,
};

export default Mailer;
