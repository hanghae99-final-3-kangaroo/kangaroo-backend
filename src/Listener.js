class Listener {
  constructor(mailSender) {
    this._mailSender = mailSender;
    this.listen = this.listen.bind(this);
  }

  async listen(message) {
    try {
      const { targetEmail, type, authCode } = message;

      const result = await this._mailSender.sendEmail(
        targetEmail,
        type,
        authCode
      );

      console.log(result);
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = Listener;
