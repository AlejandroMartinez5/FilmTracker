const amqp = require("amqplib");
const usersService = require("../services/users.service");

const EXCHANGE_NAME = "user_events";
const QUEUE_NAME = "user_created_queue_v2";
const DLX_NAME = "user_events_dlx";
const DLQ_NAME = "user_created_dlq_v2";
const DLQ_ROUTING_KEY = "user.created.failed";

let connection = null;
let channel = null;

const isPermanentError = (error) => {
  const status = error?.status;

  if (status >= 400 && status < 500) {
    return true;
  }

  if (error?.code === 11000) {
    return true;
  }

  return false;
};

const consumeUserCreated = async () => {
  try {
    console.log("[ms-users] Intentando conectar a RabbitMQ...");
    console.log("[ms-users] URL:", process.env.RABBITMQ_URL);

    connection = await amqp.connect(process.env.RABBITMQ_URL);
    console.log("[ms-users] Conexión a RabbitMQ exitosa");

    channel = await connection.createChannel();
    console.log("[ms-users] Canal creado");

    await channel.assertExchange(EXCHANGE_NAME, "fanout", {
      durable: true
    });
    console.log("[ms-users] Exchange asegurado");

    await channel.assertExchange(DLX_NAME, "direct", {
      durable: true
    });
    console.log("[ms-users] Dead-letter exchange asegurado");

    await channel.assertQueue(DLQ_NAME, {
      durable: true
    });
    console.log("[ms-users] Dead-letter queue asegurada");

    await channel.bindQueue(DLQ_NAME, DLX_NAME, DLQ_ROUTING_KEY);
    console.log("[ms-users] Dead-letter queue enlazada");

    const q = await channel.assertQueue(QUEUE_NAME, {
      durable: true,
      arguments: {
        "x-dead-letter-exchange": DLX_NAME,
        "x-dead-letter-routing-key": DLQ_ROUTING_KEY
      }
    });
    console.log("[ms-users] Queue asegurada");

    await channel.bindQueue(q.queue, EXCHANGE_NAME, "");
    console.log("[ms-users] Queue enlazada al exchange");

    console.log(`[ms-users] Escuchando eventos en ${QUEUE_NAME}...`);

    channel.consume(
      q.queue,
      async (msg) => {
        if (!msg) return;

        try {
          const userData = JSON.parse(msg.content.toString());
          await usersService.createInitialProfile(userData);
          channel.ack(msg);
        } catch (error) {
          console.error("[ms-users] Error procesando user.created:", error);

          if (isPermanentError(error)) {
            console.error("[ms-users] Error permanente, enviando mensaje a DLQ");
            channel.nack(msg, false, false);
            return;
          }

          channel.nack(msg, false, true);
        }
      },
      { noAck: false }
    );
  } catch (error) {
    console.error("[ms-users] Error conectando/consumiendo RabbitMQ:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });

    console.log("[ms-users] Reintentando en 5s...");
    setTimeout(consumeUserCreated, 5000);
  }
};

module.exports = {
  consumeUserCreated
};
