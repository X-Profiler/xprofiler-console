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
    const file = await mysql.getFileByIdAndType(fileId, fileType);
    if (!file) {
      return (ctx.body = { ok: false, message: '文件不存在' });
    }

    // check signature
    const { agent: agentId, file: fileName, token } = file;
    if (!signature) {
      return (ctx.body = { ok: false, message: '需要签名' });
    }
    if (sign({ agentId, fileId, fileType, nonce, timestamp }, token) !== signature) {
      return (ctx.body = { ok: false, message: '签名错误' });
    }

    // check upload file
    const uploadFile = ctx.request.files[0];
    if (!uploadFile) {
      return (ctx.body = { ok: false, message: '上传文件不存在' });
    }

    // delete old file storage
    if (file.storage) {
      await storage.deleteFile(file.storage);
    }

    // get upload file name
    const uploadName = ctx.app.modifyFileName(fileName);
    const uploadFileName = `u-${uuidv4()}-u-${uploadName}`;

    // save file
    await storage.saveFile(uploadFileName, fs.createReadStream(uploadFile.filepath));
    await unlink(uploadFile.filepath);

    ctx.body = { ok: true, data: { storage: uploadFileName } };
  }

  async fromConsole() {
    const { ctx, ctx: { app: { storage, modifyFileName }, service: { mysql } } } = this;
    const { appId, fileType } = ctx.query;

    const uploadFile = ctx.request.files[0];
    if (!uploadFile) {
      return (ctx.body = { ok: false, message: '上传文件不存在' });
    }

    // get file stream
    const pass = new PassThrough();
    const gzip = zlib.createGzip();
    fs.createReadStream(uploadFile.filepath).pipe(gzip).pipe(pass);

    // save file
    const { userId } = ctx.user;
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
