'use strict';

const moment = require('moment');
const Service = require('egg').Service;

class FileService extends Service {
  async filterFile(query, func) {
    const { ctx: { service: { mysql } } } = this;
    const { appId, filterType, currentPage, pageSize } = query;

    // get files
    const files = await mysql[func](appId, filterType);
    const start = (currentPage - 1) * pageSize;
    const end = currentPage * pageSize;
    const count = files.length;
    const list = files
      .filter((...args) => args[1] >= start && args[1] < end);

    // get users
    let users = Array.from(new Set(list.map(item => item.user)));
    users = (await mysql.getUserByUserIds(users)).reduce((users, user) => {
      users[user.id] = user;
      return users;
    }, {});
    return { list, count, users };
  }

  async getNormalFiles(query) {
    const { ctx: { app: { modifyFileName } } } = this;

    // get files
    let { list, count, users } = await this.filterFile(query, 'getFiles');
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

    return { list, count };
  }

  async getCoredumpFiles(query) {
    const { ctx: { app: { modifyFileName } } } = this;
    const { filterType } = query;
    if (filterType !== 'all' && filterType !== 'favor' && filterType !== 'core') {
      return { list: [], count: 0 };
    }

    // get coredumps
    let { list, count, users } = await this.filterFile(query, 'getCoredumps');
    list = list.map(item => {
      const {
        file: coreFile,
        file_storage: fileStorage,
        file_status: status,
        node: executableFile,
        node_status: executableStatus,
        user: creator,
        gm_create,
        agent,
        favor,
        id: fileId,
      } = item;
      return {
        fileId, coreFile, executableFile, agent, status, favor, executableStatus,
        creator: users[creator] ? users[creator].name : creator,
        fileType: 'core',
        time: moment(gm_create).format('YYYY-MM-DD HH:mm:ss'),
        basename: fileStorage ? modifyFileName(fileStorage) : modifyFileName(coreFile),
      };
    });

    return { list, count };
  }
}

module.exports = FileService;
