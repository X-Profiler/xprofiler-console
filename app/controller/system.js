'use strict';

const Controller = require('egg').Controller;

class SystemController extends Controller {
  async getOverview() {
    const { ctx, ctx: { service: { overview } } } = this;
    const { appId, agentId } = ctx.query;

    const latestSystemLog = await overview.getLatestSystemData(appId, agentId);
    if (!latestSystemLog) {
      return (ctx.body = { ok: true, data: {} });
    }

    const {
      used_cpu,
      used_memory_percent,
      max_disk_usage,
      disks_json,
      load1, load5, load15,
      node_count,
      total_scavange_duration,
      scavange_duration_last_record,
      total_marksweep_duration,
      marksweep_duration_last_record,
      http_response_sent,
      http_rt,
      http_patch_timeout,
    } = latestSystemLog;

    const data = {
      osCpu: Number((used_cpu * 100).toFixed(2)),
      osMem: Number((used_memory_percent * 100).toFixed(2)),
      maxDisk: max_disk_usage,
      disks: disks_json,
      load1: load1 && Number(load1.toFixed(2)),
      load5: load5 && Number(load5.toFixed(2)),
      load15: load15 && Number(load15.toFixed(2)),
      nodeCount: node_count,
      scavengeTotal: total_scavange_duration,
      scavengeAverage: scavange_duration_last_record,
      marksweepTotal: total_marksweep_duration,
      marksweepAverage: marksweep_duration_last_record,
      qps: Number((http_response_sent / 60).toFixed(2)),
      rtExpired: http_patch_timeout,
      rtAverage: http_rt,
    };

    ctx.body = { ok: true, data };
  }

  async getSystemTrend() {
    const { ctx, ctx: { service: { system } } } = this;
    const { appId, agentId, trendType, duration } = ctx.query;

    const period = duration * 60;
    const trends = await system.getDataByPeriod(appId, agentId, period, false);
    const data = system.handleTrends(trends, trendType, duration);

    ctx.body = { ok: true, data };
  }
}

module.exports = SystemController;
