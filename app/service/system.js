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

    const list = Object.entries(logMap).map(([, log]) => log);
    list.forEach(log => {
      log.used_memory = log.total_memory - log.free_memory;
      try {
        log.disks_json = JSON.parse(log.disks);
      } catch (err) {
        err;
        log.disks_json = {};
      }
    });
    return list;
  }

  handleTrends(trends, type, duration) {
    let latestLog = trends[0];
    if (latestLog && (!latestLog.total_memory || !latestLog.total_gc_times)) {
      latestLog = trends[1];
    }
    if (!latestLog) {
      return { list: [] };
    }

    const { ctx: { service: { metric } } } = this;
    let keys = [];
    let extra;
    let yAxis;
    switch (type) {
      case 'osCpuTrend':
        keys = [{
          key: 'used_cpu', label: 'os_cpu',
          handle: value => Number((value * 100).toFixed(2)),
        }];
        extra = `${latestLog.cpu_count} Cores`;
        break;
      case 'osMemoryTrend': {
        let totalMemory = 0;
        totalMemory = latestLog.total_memory;
        extra = `${Math.round(totalMemory / 1024 / 1024 / 1024)} GB`;
        keys = [{
          key: 'used_memory',
          label: 'os_memory',
          handle: value => (totalMemory ? Number((value / totalMemory * 100).toFixed(2)) : 0),
        }];
      }
        break;
      case 'loadTrend':
        keys = [
          { key: 'load1', handle: value => Number(value.toFixed(2)) },
          { key: 'load5', handle: value => Number(value.toFixed(2)) },
          { key: 'load15', handle: value => Number(value.toFixed(2)) },
        ];
        break;
      case 'nodeCountTrend':
        keys = ['node_count'];
        break;
      case 'osGcTrend':
        keys = [
          { key: 'scavange_duration_last_record', label: 'scavenge_avg' },
          { key: 'marksweep_duration_last_record', label: 'marksweep_avg' },
        ];
        break;
      case 'diskUsageTrend': {
        const disks = latestLog.disks_json;
        yAxis = Object.keys(disks);
        keys = ['disks_json'];
      }
        break;
      case 'qpsTrend':
        keys = [{
          key: ['http_response_sent'], label: 'qps',
          handle: value => Number((value / 60).toFixed(2)),
        }];
        break;
      case 'httpResponseTrend':
        keys = [{
          key: ['http_rt'], label: 'response_time',
          handle: value => Number(value).toFixed(2),
        }];
        break;
      default:
        break;
    }

    let list = metric.handleTrends(trends, keys, duration);
    if (type === 'diskUsageTrend') {
      list = list.map(({ disks_json, time }) => ({ ...disks_json, time }));
    }
    return { list, extra, yAxis };
  }
}

module.exports = SystemService;
