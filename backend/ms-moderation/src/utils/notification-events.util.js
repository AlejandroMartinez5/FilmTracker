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

  console.log("[ms-moderation] Conectado a RabbitMQ para notificaciones");
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

    console.log("[ms-moderation] Evento de notificacion publicado:", payload.type);
  } catch (error) {
    console.warn(
      "[ms-moderation] No se pudo publicar la notificacion:",
      error.message
    );
  }
};

const publishReportDismissed = async ({ report, action }) => {
  return safePublishNotificationEvent({
    recipientAuthId: report.reporter_auth_id,
    actorAuthId: action.admin_auth_id,
    type: "moderation.report_dismissed",
    title: "Reporte revisado",
    body: "Tu reporte fue revisado y descartado.",
    metadata: {
      reportId: report.id,
      targetType: report.target_type,
      targetId: report.target_id,
      actionType: action.action_type
    }
  });
};

const publishReportActionTaken = async ({ report, action }) => {
  return safePublishNotificationEvent({
    recipientAuthId: report.reporter_auth_id,
    actorAuthId: action.admin_auth_id,
    type: "moderation.report_action_taken",
    title: "Reporte atendido",
    body: "Tu reporte fue revisado y se tomo una accion.",
    metadata: {
      reportId: report.id,
      targetType: report.target_type,
      targetId: report.target_id,
      actionType: action.action_type
    }
  });
};

const publishModerationActionToTarget = async ({ report, action }) => {
  const targetSnapshot = report.target_snapshot || {};
  const targetAuthId = report.target_type === "USER"
    ? report.target_id
    : targetSnapshot.authId;

  if (!targetAuthId) {
    return null;
  }

  return safePublishNotificationEvent({
    recipientAuthId: targetAuthId,
    actorAuthId: action.admin_auth_id,
    type: "moderation.action_taken",
    title: "Accion de moderacion aplicada",
    body: "Se aplico una accion de moderacion sobre tu cuenta o contenido.",
    metadata: {
      reportId: report.id,
      targetType: report.target_type,
      targetId: report.target_id,
      actionType: action.action_type
    }
  });
};

module.exports = {
  publishReportDismissed,
  publishReportActionTaken,
  publishModerationActionToTarget
};
