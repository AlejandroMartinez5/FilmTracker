const amqp = require("amqplib");
const notificationsService = require("../services/notifications.service");

const EXCHANGE_NAME = "notification_events";
const QUEUE_NAME = "notification_events_queue";
const DLX_NAME = "notification_events_dlx";
const DLQ_NAME = "notification_events_dlq";
const DLQ_ROUTING_KEY = "notification.failed";

const isPermanentError = (error) => {
  const status = error?.status;
  return status >= 400 && status < 500;
};

const handleNotificationEvent = async (event) => {
  const payload = event.payload || event;
  return notificationsService.createNotification(payload);
};

const consumeNotificationEvents = async () => {
  if (!process.env.RABBITMQ_URL) {
    console.log("[ms-notifications] RABBITMQ_URL no configurado, consumidor omitido");
    return;
  }

  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertExchange(EXCHANGE_NAME, "fanout", {
      durable: true
    });

    await channel.assertExchange(DLX_NAME, "direct", {
      durable: true
    });

    await channel.assertQueue(DLQ_NAME, {
      durable: true
    });

    await channel.bindQueue(DLQ_NAME, DLX_NAME, DLQ_ROUTING_KEY);

    const q = await channel.assertQueue(QUEUE_NAME, {
      durable: true,
      arguments: {
        "x-dead-letter-exchange": DLX_NAME,
        "x-dead-letter-routing-key": DLQ_ROUTING_KEY
      }
    });

    await channel.bindQueue(q.queue, EXCHANGE_NAME, "");
    console.log(`[ms-notifications] Escuchando eventos en ${QUEUE_NAME}...`);

    channel.consume(
      q.queue,
      async (msg) => {
        if (!msg) return;

        try {
          const event = JSON.parse(msg.content.toString());
          await handleNotificationEvent(event);
          channel.ack(msg);
        } catch (error) {
          console.error("[ms-notifications] Error procesando notification event:", error);

          if (isPermanentError(error)) {
            channel.nack(msg, false, false);
            return;
          }

          channel.nack(msg, false, true);
        }
      },
      { noAck: false }
    );
  } catch (error) {
    console.error("[ms-notifications] Error conectando a notification_events:", error.message);
    setTimeout(consumeNotificationEvents, 5000);
  }
};

module.exports = {
  consumeNotificationEvents
};
