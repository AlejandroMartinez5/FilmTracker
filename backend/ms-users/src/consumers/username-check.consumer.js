const amqp = require("amqplib");
const usersService = require("../services/users.service");

const REQUEST_QUEUE = "username_check_queue";

let connection = null;
let channel = null;

const consumeUsernameCheck = async () => {
  try {
    console.log("[ms-users] Intentando conectar a RabbitMQ para username check...");
    console.log("[ms-users] URL:", process.env.RABBITMQ_URL);

    connection = await amqp.connect(process.env.RABBITMQ_URL);
    console.log("[ms-users] Conexión a RabbitMQ exitosa para username check");

    channel = await connection.createChannel();
    console.log("[ms-users] Canal creado para username check");

    await channel.assertQueue(REQUEST_QUEUE, {
      durable: true
    });
    console.log("[ms-users] Queue de username check asegurada");

    console.log(`[ms-users] Escuchando solicitudes en ${REQUEST_QUEUE}...`);

channel.consume(
  REQUEST_QUEUE,
  async (msg) => {
    if (!msg) return;

    console.log("[ms-users] Solicitud username check recibida:", msg.content.toString());

    try {
      const payload = JSON.parse(msg.content.toString());
      const result = await usersService.checkUsernameAvailability(payload.username);

      console.log("[ms-users] Respuesta username check:", result);

      channel.sendToQueue(
        msg.properties.replyTo,
        Buffer.from(JSON.stringify(result)),
        {
          correlationId: msg.properties.correlationId
        }
      );

      channel.ack(msg);
    } catch (error) {
      console.error("[ms-users] Error procesando username check:", error);

      const fallbackResponse = {
        available: false
      };

      if (msg.properties.replyTo) {
        channel.sendToQueue(
          msg.properties.replyTo,
          Buffer.from(JSON.stringify(fallbackResponse)),
          {
            correlationId: msg.properties.correlationId
          }
        );
      }

      channel.ack(msg);
    }
  },
  { noAck: false }
    );
  } catch (error) {
    console.error("[ms-users] Error conectando/consumiendo RabbitMQ para username check:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });

    console.log("[ms-users] Reintentando username check en 5s...");
    setTimeout(consumeUsernameCheck, 5000);
  }
};

module.exports = {
  consumeUsernameCheck
};