const friendsService = require("../services/friends.service");

const sendFriendRequest = async (req, res) => {
  try {
    const { receiverAuthId } = req.body;
    const request = await friendsService.sendFriendRequest(
      req.user.authId,
      receiverAuthId
    );

    return res.status(201).json({
      message: "Solicitud de amistad enviada correctamente",
      data: request
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Error interno del servidor"
    });
  }
};

const acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await friendsService.acceptFriendRequest(
      req.user.authId,
      requestId
    );

    return res.status(200).json({
      message: "Solicitud de amistad aceptada correctamente",
      data: request
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Error interno del servidor"
    });
  }
};

const rejectFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await friendsService.rejectFriendRequest(
      req.user.authId,
      requestId
    );

    return res.status(200).json({
      message: "Solicitud de amistad rechazada correctamente",
      data: request
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Error interno del servidor"
    });
  }
};

const cancelFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    await friendsService.cancelFriendRequest(req.user.authId, requestId);

    return res.status(200).json({
      message: "Solicitud de amistad cancelada correctamente"
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Error interno del servidor"
    });
  }
};

const removeFriend = async (req, res) => {
  try {
    const { friendAuthId } = req.params;
    await friendsService.removeFriend(req.user.authId, friendAuthId);

    return res.status(200).json({
      message: "Amistad eliminada correctamente"
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Error interno del servidor"
    });
  }
};

const getFriends = async (req, res) => {
  try {
    const result = await friendsService.getFriends(req.user.authId, req.query);

    return res.status(200).json({
      message: "Amigos obtenidos correctamente",
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Error interno del servidor"
    });
  }
};

const getIncomingRequests = async (req, res) => {
  try {
    const result = await friendsService.getIncomingRequests(
      req.user.authId,
      req.query
    );

    return res.status(200).json({
      message: "Solicitudes recibidas obtenidas correctamente",
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Error interno del servidor"
    });
  }
};

const getOutgoingRequests = async (req, res) => {
  try {
    const result = await friendsService.getOutgoingRequests(
      req.user.authId,
      req.query
    );

    return res.status(200).json({
      message: "Solicitudes enviadas obtenidas correctamente",
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Error interno del servidor"
    });
  }
};

const getRelationshipStatus = async (req, res) => {
  try {
    const { otherAuthId } = req.params;
    const result = await friendsService.getRelationshipStatus(
      req.user.authId,
      otherAuthId
    );

    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Error interno del servidor"
    });
  }
};

module.exports = {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
  removeFriend,
  getFriends,
  getIncomingRequests,
  getOutgoingRequests,
  getRelationshipStatus
};
