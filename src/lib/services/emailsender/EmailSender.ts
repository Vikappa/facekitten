import nodemailer from 'nodemailer';

const { GMAIL_ADRESS, GMAIL_APPPASSWORD } = process.env;

export const SendEmail = async ( email:string, token:string, nome :string, emailtext: string, emailhtml :string ) => {
  if (!GMAIL_ADRESS || !GMAIL_APPPASSWORD) {
    console.error('GMAIL_ADRESS o GMAIL_APPPASSWORD non definiti');
    return;
  }

    const normalizedEmail = normalizeEmail(email);


    if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
    const invalidRecipientError = new Error('Invalid recipient email');
    throw invalidRecipientError;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: GMAIL_ADRESS,
      pass: GMAIL_APPPASSWORD,
    },
  });

  const mailOptions = {
    from: GMAIL_ADRESS,
    to: normalizedEmail,
    subject: 'Registrazione a Facekitten',
    text: emailtext,
    html: emailhtml,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Errore nell'invio dell'email:", error);
    throw error;
  }
}


export function normalizeEmail(email : string) {
  return typeof email === 'string' ? email.toLowerCase().trim() : '';
}

export function isValidEmail(email : string) {
  const normalizedEmail = normalizeEmail(email);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);
}

