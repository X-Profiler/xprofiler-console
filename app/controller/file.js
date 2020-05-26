'use strict';

const zlib = require('zlib');
const { PassThrough } = require('stream');
const pMap = require('p-map');
const moment = require('moment');
const Controller = require('egg').Controller;

class FileController extends Controller {
  async getFiles() {
    const { ctx, ctx: { app: { modifyFileName }, service: { mysql } } } = this;
    const { appId, filterType, currentPage, pageSize } = ctx.query;

    // get files
    const files = await mysql.getFiles(appId, filterType);
    const start = (currentPage - 1) * pageSize;
    const end = currentPage * pageSize;
    const count = files.length;
    let list = files
      .filter((...args) => args[1] >= start && args[1] < end);

    // get users;
    let users = Array.from(new Set(list.map(item => item.user)));
    users = (await mysql.getUserByUserIds(users)).reduce((users, user) => {
      users[user.id] = user;
      return users;
    }, {});

    list = list.map(item => {
      const {
        type: fileType,
        file,
        storage,
        user: creator,
        gm_create,
        agent,
        status,
        favor,
        id: fileId,
      } = item;
      return {
        fileId, fileType, file, agent, status, favor,
        creator: users[creator] ? users[creator].name : creator,
        time: moment(gm_create).format('YYYY-MM-DD HH:mm:ss'),
        basename: storage ? modifyFileName(storage) : modifyFileName(file),
      };
    });

    ctx.body = { ok: true, data: { list, count } };
  }

  async checkFileStatus() {
    const { ctx, ctx: { app: { config: { actionTime } }, service: { mysql, manager } } } = this;
    const { files } = ctx.request.body;

    const list = await pMap(files, async file => {
      const { fileId, fileType, index } = file;
      const { app, agent, status, file: filePath, gm_create } = ctx.file[ctx.createFileKey(fileId, fileType)];
      const result = { fileId, fileType, status, index };

      // file created
      if (status !== 0) {
        return result;
      }

      // check file creating status
      const { profilingTime, expired } = actionTime[fileType];
      const createdTime = new Date(gm_create).getTime();
      const now = Date.now();

      if (now - createdTime < profilingTime) {
        result.status = 0;
      } else if (now - createdTime < expired) {
        const fileStatus = manager.handleXtransitResponse(await manager.checkFileStatus(app, agent, filePath));
        if (!fileStatus) {
          result.status = 0;
          return;
        }
        const { exists } = fileStatus;
        if (exists) {
          await mysql.updateFileStatusById(fileId, 1);
          result.status = 1;
        } else {
          result.status = 0;
        }
      } else {
        await mysql.updateFileStatusById(fileId, 1);
        result.status = 1;
      }

      return result;
    }, { concurrency: 2 });

    ctx.body = { ok: true, data: { list } };
  }

  async transferFile() {
    const { ctx, ctx: { app, service: { mysql } } } = this;
    const { fileId, fileType } = ctx.request.body;
    const { app: appId, agent: agentId, file: filePath } = ctx.file[ctx.createFileKey(fileId, fileType)];

    // create token
    const token = app.createAppSecret(fileId, fileType);
    await mysql.updateFileStatusById(fileId, 2, token);

    // notification
    const { xprofilerConsole: server } = app.config;
    const transferResult = await ctx.handleXtransitResponse('transferFile', appId, agentId,
      fileId, fileType, filePath, server, token);
    if (transferResult === false) {
      await mysql.updateFileStatusById(fileId, 1);
      return;
    }

    try {
      const { storage } = JSON.parse(transferResult);
      await mysql.updateFileStatusById(fileId, 3, '', storage);
    } catch (err) {
      ctx.logger.error(`parse transfer result failed: ${err}, raw: ${transferResult}`);
      ctx.body = { ok: false, message: '下发转储命令失败' };
      await mysql.updateFileStatusById(fileId, 1);
      return;
    }

    ctx.body = { ok: true };
  }

  async deleteFile() {
    const { ctx, ctx: { app: { storage }, service: { mysql } } } = this;
    const { fileId, fileType } = ctx.request.body;
    const { storage: fileName } = ctx.file[ctx.createFileKey(fileId, fileType)];

    const tasks = [];
    tasks.push(mysql.deleteFileById(fileId));
    if (fileName) {
      tasks.push(storage.deleteFile(fileName));
    }
    await Promise.all(tasks);

    ctx.body = { ok: true };
  }

  async downloadFile() {
    const { ctx, ctx: { app: { storage } } } = this;
    const { fileId, fileType } = ctx.query;
    const { storage: fileName } = ctx.file[ctx.createFileKey(fileId, fileType)];

    ctx.set('content-type', 'application/octet-stream');
    ctx.set('content-disposition', `attachment;filename=${fileName}`);
    const pass = new PassThrough();
    const gunzip = zlib.createGunzip();
    storage.downloadFile(fileName).pipe(gunzip).pipe(pass);
    ctx.body = pass;
  }

  async favorFile() {
    const { ctx, ctx: { service: { mysql } } } = this;
    const { fileId, fileType, favor } = ctx.request.body;
    const { favor: oldFavor } = ctx.file[ctx.createFileKey(fileId, fileType)];

    if (Number(oldFavor) === Number(favor)) {
      return (ctx.body = { ok: false, message: `已经${oldFavor ? '取消收藏' : '收藏'}` });
    }

    await mysql.updateFileFavor(fileId, favor);

    ctx.body = { ok: true };
  }
}

module.exports = FileController;
