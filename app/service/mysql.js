'use strict';

const Service = require('egg').Service;

class MysqlService extends Service {
  consoleQuery(sql, params) {
    const { ctx: { app: { mysql } } } = this;
    const xprofiler_console = mysql.get('xprofiler_console');
    return xprofiler_console.query(sql, params);
  }

  getUserByName(name) {
    const sql = 'SELECT * FROM user WHERE name = ?';
    const params = [ name ];
    return this.consoleQuery(sql, params).then(data => data[0]);
  }

  saveUser(name, pass) {
    const sql = 'INSERT INTO user (name, pass) VALUES (?, ?)';
    const params = [ name, pass ];
    return this.consoleQuery(sql, params);
  }
}

module.exports = MysqlService;
