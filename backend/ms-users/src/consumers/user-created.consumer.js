const amqp = require("amqplib");
const usersService = require("../services/users.service");

const EXCHANGE_NAME = "user_events";
const QUEUE_NAME = "user_created_queue";

let connection = null;
let channel = null;

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

    const q = await channel.assertQueue(QUEUE_NAME, {
      durable: true
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