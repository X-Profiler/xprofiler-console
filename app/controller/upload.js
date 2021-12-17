'use strict';

const fs = require('fs');
const zlib = require('zlib');
const { PassThrough } = require('stream');
const { promisify } = require('util');
const unlink = promisify(fs.unlink);
const { v4: uuidv4 } = require('uuid');
const Controller = require('egg').Controller;

class UploadController extends Controller {
  async fromXtransit() {
    const { ctx, ctx: { app: { storage, sign, redis, config: { uploadNoncePrefix } }, service: { mysql } } } = this;
    const { fileId, fileType, nonce, timestamp, signature } = ctx.query;

    const isCoreFile = fileType === 'core';

    // check request time
    const expiredTime = 60;
    if (Date.now() - timestamp > expiredTime * 1000) {
      return (ctx.body = { ok: false, message: '请求已过期' });
    }

    // check nonce
    const nonceKey = `${uploadNoncePrefix}${nonce}`;
    const lock = await redis.setnx(nonceKey, 1);
    if (!lock) {
      return (ctx.body = { ok: false, message: '重放攻击' });
    }
    await redis.expire(nonceKey, expiredTime);

    // check file exists
    let file;
    if (isCoreFile) {
      file = await mysql.getCoredumpById(fileId);
    } else {
      file = await mysql.getFileByIdAndType(fileId, fileType);
    }

    if (!file) {
      return (ctx.body = { ok: false, message: '文件不存在' });
    }

    // check signature
    const { agent: agentId, file: fileName, token, node } = file;
    if (!signature) {
      return (ctx.body = { ok: false, message: '需要签名' });
    }
    if (sign({ agentId, fileId, fileType, nonce, timestamp }, token) !== signature) {
      return (ctx.body = { ok: false, message: '签名错误' });
    }

    // need store files
    const needStore = [];
    if (isCoreFile) {
      const [coreFile, nodeFile] = ctx.request.files;
      let nodeFileName = 'node';
      try {
        const { alinode, version } = JSON.parse(node);
        nodeFileName = alinode ? `alinode-v${version}` : `node-v${version}`;
      } catch (err) {
        ctx.logger.error(`[fromXtransit] parse executable failed: ${node}`);
      }

      needStore.push(
        { fileName, fileContent: coreFile },
        { fileName: nodeFileName, fileContent: nodeFile }
      );
    } else {
      needStore.push({
        fileName,
        fileContent: ctx.request.files[0],
      });
    }

    // check upload file
    for (const uploadFile of needStore) {
      if (!uploadFile.fileContent) {
        return (ctx.body = { ok: false, message: '上传文件不存在' });
      }
    }

    // delete old file storage
    if (isCoreFile) {
      const { file_storage, node_storage } = file;
      file_storage && await storage.deleteFile(file.file_storage);
      node_storage && await storage.deleteFile(file.node_storage);
    } else if (file.storage) {
      await storage.deleteFile(file.storage);
    }

    // upload file
    const uploadFileNameList = [];
    for (const { fileName, fileContent } of needStore) {
      // get upload file name
      const uploadName = ctx.app.modifyFileName(fileName);
      const uploadFileName = `u-${uuidv4()}-u-${uploadName}`;

      // save file
      await storage.saveFile(uploadFileName, fs.createReadStream(fileContent.filepath));
      await unlink(fileContent.filepath);

      uploadFileNameList.push(uploadFileName);
    }

    ctx.body = { ok: true, data: { storage: uploadFileNameList.join('\u0000') } };
  }

  async fromConsole() {
    const { ctx, ctx: { app: { storage, modifyFileName }, service: { mysql } } } = this;
    const { appId, fileType } = ctx.query;
    const { userId } = ctx.user;

    // save core
    if (fileType === 'core') {
      const [coreFile, nodeFile] = ctx.request.files;
      if (!coreFile || !nodeFile) {
        return (ctx.body = { ok: false, message: '上传文件不存在' });
      }

      // get file streams
      const files = [coreFile, nodeFile];
      const passes = [];
      for (const { filepath, filename } of files) {
        const pass = new PassThrough();
        const gzip = zlib.createGzip();
        fs.createReadStream(filepath).pipe(gzip).pipe(pass);
        passes.push({ pass, filepath, filename });
      }

      // save files
      const tasks = [];
      const params = { files: [], storages: [], paths: [] };
      for (const { pass, filename, filepath } of passes) {
        const fileName = modifyFileName(filename);
        const uploadFileName = `u-${uuidv4()}-u-${fileName}`;
        tasks.push(storage.saveFile(uploadFileName, pass));
        params.files.push(fileName);
        params.storages.push(uploadFileName);
        params.paths.push(filepath);
      }
      const {
        files: [coreFileName, nodeFileName],
        storages: [coreFileStorage, nodeFileStorage],
        paths,
      } = params;
      await mysql.addCoredump(appId, 'upload', coreFileName, nodeFileName, userId, 3, coreFileStorage, 3, nodeFileStorage);
      await paths.map(path => unlink(path));

      ctx.body = { ok: true, data: { file: coreFileName } };
      return;
    }

    // save file
    const uploadFile = ctx.request.files[0];
    if (!uploadFile) {
      return (ctx.body = { ok: false, message: '上传文件不存在' });
    }

    // get file stream
    const pass = new PassThrough();
    const gzip = zlib.createGzip();
    fs.createReadStream(uploadFile.filepath).pipe(gzip).pipe(pass);

    // save file
    const fileName = modifyFileName(uploadFile.filename);
    const uploadFileName = `u-${uuidv4()}-u-${fileName}`;
    const tasks = [];
    tasks.push(storage.saveFile(uploadFileName, pass));
    tasks.push(mysql.addFile(appId, 'upload', fileType, fileName, userId, 3, uploadFileName));
    await Promise.all(tasks);
    await unlink(uploadFile.filepath);

    ctx.body = { ok: true, data: { file: fileName } };
  }
}

module.exports = UploadController;
