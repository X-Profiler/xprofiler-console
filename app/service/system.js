'use strict';

const moment = require('moment');
const Service = require('egg').Service;

const systemLogKey = [
  'id',
  'app',
  'agent',
  'uptime',
  'log_time',
  'version',
  'used_cpu',
  'cpu_count',
  'total_memory',
  'free_memory',
  'load1',
  'load5',
  'load15',
  'disks',
  'node_count',
];

const mergeLogKey = [
  'total_gc_times',
  'total_gc_duration',
  'total_scavange_duration',
  'total_marksweep_duration',
  'total_incremental_marking_duration',
  'gc_time_during_last_record',
  'scavange_duration_last_record',
  'marksweep_duration_last_record',
  'incremental_marking_duration_last_record',
  'response_codes',
  'live_http_request',
  'http_response_close',
  'http_response_sent',
  'http_request_timeout',
  'http_patch_timeout',
  'http_rt',
];

class SystemService extends Service {
  getSystemLog(log, keys, checks) {
    const map = {};
    for (const key of keys) {
      map[key] = log[key];
    }
    if (checks.every(check => map[check])) {
      return map;
    }
    return {};
  }

  mergeSystemLog(log) {
    const log1 = this.getSystemLog(log, systemLogKey, ['total_memory']);
    const log2 = this.getSystemLog(log, mergeLogKey, ['total_gc_times']);
    return Object.assign({}, log1, log2);
  }

  async getDataByPeriod(appId, agentId, peroid) {
    const { ctx: { service: { metric } } } = this;
    const logs = await metric.getDataByPeriod(appId, agentId, 'osinfo_', peroid);

    const logMap = {};
    for (const log of logs) {
      const { log_time } = log;
      const formatTime = moment(log_time).format('YYYY-MM-DD HH:mm');
      if (!logMap[formatTime]) {
        logMap[formatTime] = this.mergeSystemLog(log);
        continue;
      }
      logMap[formatTime] = Object.assign(logMap[formatTime], this.mergeSystemLog(log));
    }

    return Object.entries(logMap).map(([, log]) => log);
  }
}

module.exports = SystemService;
