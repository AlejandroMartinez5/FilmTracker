const amqp = require("amqplib");
const crypto = require("crypto");

const REQUEST_QUEUE = "username_check_queue";

let connection = null;
let channel = null;
let replyQueue = null;
const pendingRequests = new Map();

const connectUsernameCheckBroker = async () => {
  if (connection && channel && replyQueue) {
    return { connection, channel, replyQueue };
  }

  const url = process.env.RABBITMQ_URL;

  for (let i = 0; i < 5; i++) {
    try {
      connection = await amqp.connect(url);
      channel = await connection.createChannel();

      await channel.assertQueue(REQUEST_QUEUE, {
        durable: true
      });

      const assertedReplyQueue = await channel.assertQueue("", {
        exclusive: true
      });

      replyQueue = assertedReplyQueue.queue;

      channel.consume(
        replyQueue,
        (msg) => {
          if (!msg) return;

          const correlationId = msg.properties.correlationId;
          const pending = pendingRequests.get(correlationId);

          if (pending) {
            try {
              const response = JSON.parse(msg.content.toString());
              pending.resolve(response);
            } catch (error) {
              pending.reject(error);
            } finally {
              pendingRequests.delete(correlationId);
            }
          }
        },
        { noAck: true }
      );

      console.log("[ms-auth] Conectado a RabbitMQ para username check");
      return { connection, channel, replyQueue };
    } catch (error) {
      if (i === 4) {
        throw error;
      }

      console.log(`[ms-auth] RabbitMQ no responde para username check, reintentando en 5s... (${i + 1}/5)`);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
};

const requestUsernameAvailability = async (username) => {
  const { channel, replyQueue } = await connectUsernameCheckBroker();
  const correlationId = crypto.randomUUID();

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      pendingRequests.delete(correlationId);
      reject(new Error("Timeout verificando disponibilidad de username"));
    }, 5000);

    pendingRequests.set(correlationId, {
      resolve: (data) => {
        clearTimeout(timeout);
        resolve(data);
      },
      reject: (error) => {
        clearTimeout(timeout);
        reject(error);
      }
    });

    channel.sendToQueue(
      REQUEST_QUEUE,
      Buffer.from(JSON.stringify({ username })),
      {
        correlationId,
        replyTo: replyQueue,
        persistent: false
      }
    );

    console.log("[ms-auth] Solicitud de disponibilidad enviada:", { username, correlationId });
  });
};

module.exports = {
  connectUsernameCheckBroker,
  requestUsernameAvailability
};