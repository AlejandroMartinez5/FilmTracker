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

  console.log("[ms-reviews] Conectado a RabbitMQ para notificaciones");
  return { connection, channel };
};

const safePublishNotificationEvent = async (payload) => {
  try {
    if (payload.recipientAuthId === payload.actorAuthId) {
      return;
    }

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

    console.log("[ms-reviews] Evento de notificacion publicado:", payload.type);
  } catch (error) {
    console.warn(
      "[ms-reviews] No se pudo publicar la notificacion:",
      error.message
    );
  }
};

const publishReviewCommented = async ({ review, comment }) => {
  return safePublishNotificationEvent({
    recipientAuthId: review.auth_id,
    actorAuthId: comment.auth_id,
    type: "review.comment_created",
    title: "Nuevo comentario en tu resena",
    body: "Alguien comento tu resena.",
    metadata: {
      reviewId: review.id,
      commentId: comment.id,
      tvmazeId: review.tvmaze_id
    }
  });
};

const publishReviewLiked = async ({ review, actorAuthId }) => {
  return safePublishNotificationEvent({
    recipientAuthId: review.auth_id,
    actorAuthId,
    type: "review.liked",
    title: "Nuevo like en tu resena",
    body: "Alguien le dio like a tu resena.",
    metadata: {
      reviewId: review.id,
      tvmazeId: review.tvmaze_id
    }
  });
};

const publishCommentLiked = async ({ comment, actorAuthId }) => {
  return safePublishNotificationEvent({
    recipientAuthId: comment.auth_id,
    actorAuthId,
    type: "comment.liked",
    title: "Nuevo like en tu comentario",
    body: "Alguien le dio like a tu comentario.",
    metadata: {
      commentId: comment.id,
      reviewId: comment.review_id
    }
  });
};

module.exports = {
  publishReviewCommented,
  publishReviewLiked,
  publishCommentLiked
};
