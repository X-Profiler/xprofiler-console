'use strict';

const pMap = require('p-map');
const moment = require('moment');
const Controller = require('egg').Controller;

class FileController extends Controller {
  async getFiles() {
    const { ctx, ctx: { service: { mysql } } } = this;
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
      };
    });

    ctx.body = { ok: true, data: { list, count } };
  }

  async checkFileStatus() {
    const { ctx, ctx: { app: { config: { actionTime } }, service: { mysql } } } = this;
    const { files } = ctx.request.body;

    const list = await pMap(files, async file => {
      const { fileId, fileType, index } = file;
      const { status, gm_create } = ctx.file[fileId];
      if (status !== 0) {
        return { fileId, fileType, status, index };
      }

      const { profilingTime, expired } = actionTime[fileType];
      const createdTime = new Date(gm_create).getTime();
      const now = Date.now();
      if (now - createdTime < profilingTime) {
        return { fileId, fileType, status: 0, index };
      } else if (now - createdTime < expired) {

      } else {
        await mysql.updateFileStatusById(fileId, 1);
        return { fileId, fileType, status: 1, index };
      }
    }, { concurrency: 2 });

    ctx.body = { ok: true, data: { list } };
  }
}

module.exports = FileController;
