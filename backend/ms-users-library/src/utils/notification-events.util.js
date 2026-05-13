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

  console.log("[ms-users-library] Conectado a RabbitMQ para notificaciones");
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

    console.log("[ms-users-library] Evento de notificacion publicado:", payload.type);
  } catch (error) {
    console.warn(
      "[ms-users-library] No se pudo publicar la notificacion:",
      error.message
    );
  }
};

const publishFavoriteAdded = async ({ authId, tvmazeId }) => {
  return safePublishNotificationEvent({
    recipientAuthId: authId,
    type: "library.favorite_added",
    title: "Agregado a favoritos",
    body: "Se agrego una serie a tus favoritos.",
    metadata: {
      tvmazeId
    }
  });
};

const publishWatchlistAdded = async ({ authId, tvmazeId }) => {
  return safePublishNotificationEvent({
    recipientAuthId: authId,
    type: "library.watchlist_added",
    title: "Agregado a tu watchlist",
    body: "Se agrego una serie a tu watchlist.",
    metadata: {
      tvmazeId
    }
  });
};

module.exports = {
  publishFavoriteAdded,
  publishWatchlistAdded
};
