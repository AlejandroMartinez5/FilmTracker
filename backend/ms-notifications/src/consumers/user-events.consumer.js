const amqp = require("amqplib");
const notificationsService = require("../services/notifications.service");

const EXCHANGE_NAME = "user_events";
const QUEUE_NAME = "notifications_user_events_queue";
const USER_EVENTS = {
  CREATED: "user.created",
  EMAIL_VERIFIED: "user.email_verified",
  USERNAME_UPDATED: "user.username_updated",
  PASSWORD_CHANGED: "user.password_changed",
  PASSWORD_RESET: "user.password_reset"
};

const handleUserEvent = async (rawEvent) => {
  const event = rawEvent.type && rawEvent.payload
    ? rawEvent
    : {
        type: USER_EVENTS.CREATED,
        payload: rawEvent
      };

  if (event.type === USER_EVENTS.CREATED) {
    return notificationsService.createWelcomeNotification(event.payload);
  }

  if (event.type === USER_EVENTS.EMAIL_VERIFIED) {
    return notificationsService.createEmailVerifiedNotification(event.payload);
  }

  if (event.type === USER_EVENTS.USERNAME_UPDATED) {
    return notificationsService.createUsernameUpdatedNotification(event.payload);
  }

  if (event.type === USER_EVENTS.PASSWORD_CHANGED) {
    return notificationsService.createPasswordChangedNotification(event.payload);
  }

  if (event.type === USER_EVENTS.PASSWORD_RESET) {
    return notificationsService.createPasswordResetNotification(event.payload);
  }

  console.log("[ms-notifications] Evento de usuario ignorado:", event.type);
  return null;
};

const consumeUserEvents = async () => {
  if (!process.env.RABBITMQ_URL) {
    console.log("[ms-notifications] RABBITMQ_URL no configurado, user_events omitido");
    return;
  }

  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertExchange(EXCHANGE_NAME, "fanout", {
      durable: true
    });

    const q = await channel.assertQueue(QUEUE_NAME, {
      durable: true
    });

    await channel.bindQueue(q.queue, EXCHANGE_NAME, "");
    console.log(`[ms-notifications] Escuchando eventos en ${QUEUE_NAME}...`);

    channel.consume(
      q.queue,
      async (msg) => {
        if (!msg) return;

        try {
          const event = JSON.parse(msg.content.toString());
          await handleUserEvent(event);
          channel.ack(msg);
        } catch (error) {
          console.error("[ms-notifications] Error procesando user event:", error);
          channel.nack(msg, false, true);
        }
      },
      { noAck: false }
    );
  } catch (error) {
    console.error("[ms-notifications] Error conectando a user_events:", error.message);
    setTimeout(consumeUserEvents, 5000);
  }
};

module.exports = {
  consumeUserEvents
};
