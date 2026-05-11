const amqp = require("amqplib");

const EXCHANGE_NAME = "user_events";
const EXCHANGE_TYPE = "fanout";
const USER_EVENTS = {
  CREATED: "user.created",
  EMAIL_VERIFIED: "user.email_verified",
  USERNAME_UPDATED: "user.username_updated"
};

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

const publishUserEvent = async (type, payload) => {
  const { channel } = await connectBroker();
  const event = {
    type,
    payload
  };

  const sent = channel.publish(
    EXCHANGE_NAME,
    "",
    Buffer.from(JSON.stringify(event)),
    {
      persistent: true
    }
  );

  if (sent) {
    console.log(`[ms-auth] Evento ${type} publicado:`, payload);
    return;
  }

  throw new Error(`No se pudo publicar el evento ${type}`);
};

const publishUserCreated = async (userData) => {
  return publishUserEvent(USER_EVENTS.CREATED, userData);
};

const publishUserEmailVerified = async ({ authId, emailVerified }) => {
  return publishUserEvent(USER_EVENTS.EMAIL_VERIFIED, {
    authId,
    emailVerified
  });
};

const publishUsernameUpdated = async ({ authId, username }) => {
  return publishUserEvent(USER_EVENTS.USERNAME_UPDATED, {
    authId,
    username
  });
};

module.exports = {
  connectBroker,
  publishUserCreated,
  publishUserEmailVerified,
  publishUsernameUpdated,
  USER_EVENTS
};
