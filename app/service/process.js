'use strict';

const Service = require('egg').Service;

class ProcessService extends Service {
  async getDataByPeriod(appId, agentId, peroid) {
    const { ctx: { service: { metric } } } = this;
    return await metric.getDataByPeriod(appId, agentId, 'process_', peroid);
  }

  async getDataByPeriodAndPid(appId, agentId, peroid, pid) {
    const { ctx: { service: { metric } } } = this;
    return await metric.getDataByPeriod(appId, agentId, 'process_', peroid, pid);
  }

  handleTrends(trends, type, duration) {
    const latestLog = trends[0];
    if (!latestLog) {
      return { list: [] };
    }

    const { ctx: { service: { metric } } } = this;
    let keys = [];
    let limit = 0;
    switch (type) {
      case 'heapTrend':
        keys = ['heap_total', 'heap_used', 'rss'];
        limit = latestLog.heap_limit;
        break;
      case 'cpuTrend':
        keys = ['cpu_now', 'cpu_15', 'cpu_30', 'cpu_60'];
        break;
      case 'heapSpaceTrend':
        keys = [
          { key: 'new_space_size', label: 'new_space' },
          { key: 'old_space_size', label: 'old_space' },
          { key: 'code_space_size', label: 'code_space' },
          { key: 'map_space_size', label: 'map_space' },
          { key: 'lo_space_size', label: 'lo_space' },
          { key: 'read_only_space_size', label: 'read_only_space' },
          { key: 'new_lo_space_size', label: 'new_lo_space' },
          { key: 'code_lo_space_size', label: 'code_lo_space' },
        ];
        break;
      case 'gcTrend':
        keys = [
          { key: 'marksweep_duration_last_record', label: 'marksweep_duration' },
          { key: 'scavange_duration_last_record', label: 'scavenge_duration' },
        ];
        break;
      case 'uvTrend':
        keys = ['active_handles'];
        break;
      case 'qpsTrend':
        keys = [{
          key: 'http_response_sent', label: 'qps',
          handle: value => Number((value / 60).toFixed(2)),
        }];
        break;
      case 'timerTrend':
        keys = [{
          key: 'active_timer_handles', label: 'active_timers',
        }];
        break;
      case 'tcpTrend':
        keys = ['active_tcp_handles'];
        break;
      case 'udpTrend':
        keys = ['active_udp_handles'];
        break;
      default:
        break;
    }

    const list = metric.handleTrends(trends, keys, duration);
    return { list, limit };
  }
}

module.exports = ProcessService;