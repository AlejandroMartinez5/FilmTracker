const fs = require("fs/promises");
const path = require("path");
const { uploadDir } = require("../config/env");
const { ALLOWED_CONTENT_TYPES, MEDIA_TYPES } = require("../constants/media.constants");

const ensureUploadDirs = async () => {
  await Promise.all(
    Object.values(MEDIA_TYPES).map((mediaType) =>
      fs.mkdir(path.join(uploadDir, mediaType.directory), { recursive: true })
    )
  );
};

const buildBasePath = ({ directory, storageId }) => {
  return path.join(uploadDir, directory, storageId);
};

const removeExistingByBasePath = async (basePath) => {
  await Promise.all(
    Object.values(ALLOWED_CONTENT_TYPES).map(async (extension) => {
      try {
        await fs.unlink(`${basePath}${extension}`);
      } catch (error) {
        if (error.code !== "ENOENT") {
          throw error;
        }
      }
    })
  );
};

const findExistingByBasePath = async (basePath) => {
  for (const extension of Object.values(ALLOWED_CONTENT_TYPES)) {
    const filePath = `${basePath}${extension}`;

    try {
      const stats = await fs.stat(filePath);
      return {
        filePath,
        extension,
        stats
      };
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }
  }

  return null;
};

const saveSingleImage = async ({ directory, storageId, extension, buffer }) => {
  await ensureUploadDirs();

  const basePath = buildBasePath({ directory, storageId });
  const filePath = `${basePath}${extension}`;

  await removeExistingByBasePath(basePath);
  await fs.writeFile(filePath, buffer);

  return {
    extension,
    stats: await fs.stat(filePath)
  };
};

const findImage = async ({ directory, storageId }) => {
  const basePath = buildBasePath({ directory, storageId });
  return findExistingByBasePath(basePath);
};

const deleteImage = async ({ directory, storageId }) => {
  const existing = await findImage({ directory, storageId });

  if (!existing) {
    return false;
  }

  await fs.unlink(existing.filePath);
  return true;
};

module.exports = {
  ensureUploadDirs,
  saveSingleImage,
  findImage,
  deleteImage
};
