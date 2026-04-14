const amqp = require("amqplib");

const EXCHANGE_NAME = "user_events";
const EXCHANGE_TYPE = "fanout";

let connection = null;
let channel = null;

const connectBroker = async () => {
  if (connection && channel) {
    return { connection, channel };
  }

  const url = process.env.RABBITMQ_URL;

  for (let i = 0; i < 5; i++) {
    try {
      connection = await amqp.connect(url);
      channel = await connection.createChannel();

      await channel.assertExchange(EXCHANGE_NAME, EXCHANGE_TYPE, {
        durable: true
      });

      console.log("[ms-auth] Conectado a RabbitMQ");
      return { connection, channel };
    } catch (error) {
      if (i === 4) {
        throw error;
      }

      console.log(`[ms-auth] RabbitMQ no responde, reintentando en 5s... (${i + 1}/5)`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};

const publishUserCreated = async (userData) => {
  const { channel } = await connectBroker();

  const sent = channel.publish(
    EXCHANGE_NAME,
    "",
    Buffer.from(JSON.stringify(userData)),
    {
      persistent: true
    }
  );

  if (sent) {
    console.log("[ms-auth] Evento user.created publicado:", userData);
  }
};

module.exports = {
  connectBroker,
  publishUserCreated
};