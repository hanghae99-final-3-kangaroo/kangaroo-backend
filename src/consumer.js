const amqp = require("amqplib");
const MailSender = require("./MailSender");
const Listener = require("./Listener");

const init = async () => {
  const mailSender = new MailSender();
  const listener = new Listener(mailSender);

  const connection = await amqp.connect(process.env.RABBITMQ_SERVER);
  const channel = await connection.createChannel();

  await channel.assertQueue("export:mail", {
    durable: true,
  });

  channel.consume("export:mail", listener.listen, { noAck: true });
};

init();
