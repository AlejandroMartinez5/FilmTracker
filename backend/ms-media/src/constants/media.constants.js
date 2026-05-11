const MEDIA_TYPES = {
  PROFILE: {
    key: "profile",
    directory: "profiles"
  },
  REVIEW: {
    key: "review",
    directory: "reviews"
  },
  COMMENT: {
    key: "comment",
    directory: "comments"
  }
};

const ALLOWED_CONTENT_TYPES = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp"
};

const CONTENT_TYPE_BY_EXTENSION = {
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp"
};

module.exports = {
  MEDIA_TYPES,
  ALLOWED_CONTENT_TYPES,
  CONTENT_TYPE_BY_EXTENSION
};
