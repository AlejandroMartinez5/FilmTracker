const amqp = require("amqplib");

const EXCHANGE_NAME = "notification_events";

let connection = null;
let channel = null;

const resetBroker = () => {
  connection = null;
  channel = null;
};

const connectBroker = async () => {
  if (connection && channel) {
    return { connection, channel };
  }

  if (!process.env.RABBITMQ_URL) {
    throw new Error("RABBITMQ_URL no configurado");
  }

  connection = await amqp.connect(process.env.RABBITMQ_URL);
  connection.on("close", resetBroker);
  connection.on("error", resetBroker);

  channel = await connection.createChannel();
  await channel.assertExchange(EXCHANGE_NAME, "fanout", {
    durable: true
  });

  console.log("[ms-users] Conectado a RabbitMQ para notificaciones");
  return { connection, channel };
};

const safePublishNotificationEvent = async (payload) => {
  try {
    const { channel: brokerChannel } = await connectBroker();
    const event = {
      type: "notification.created",
      payload
    };

    const sent = brokerChannel.publish(
      EXCHANGE_NAME,
      "",
      Buffer.from(JSON.stringify(event)),
      {
        persistent: true
      }
    );

    if (!sent) {
      throw new Error("No se pudo publicar el evento de notificacion");
    }

    console.log("[ms-users] Evento de notificacion publicado:", payload.type);
  } catch (error) {
    console.warn("[ms-users] No se pudo publicar la notificacion:", error.message);
  }
};

const publishProfileUpdated = async ({ authId }) => {
  return safePublishNotificationEvent({
    recipientAuthId: authId,
    type: "profile.updated",
    title: "Perfil actualizado",
    body: "Tu perfil fue actualizado correctamente.",
    metadata: {
      source: "ms-users"
    }
  });
};

const publishProfilePhotoUpdated = async ({ authId }) => {
  return safePublishNotificationEvent({
    recipientAuthId: authId,
    type: "profile.photo_updated",
    title: "Foto de perfil actualizada",
    body: "Tu foto de perfil fue actualizada correctamente.",
    metadata: {
      source: "ms-users"
    }
  });
};

const publishProfilePhotoRemoved = async ({ authId, actorAuthId }) => {
  return safePublishNotificationEvent({
    recipientAuthId: authId,
    actorAuthId,
    type: "profile.photo_removed",
    title: "Foto de perfil eliminada",
    body: "Tu foto de perfil fue eliminada.",
    metadata: {
      source: "ms-users"
    }
  });
};

module.exports = {
  publishProfileUpdated,
  publishProfilePhotoUpdated,
  publishProfilePhotoRemoved
};
