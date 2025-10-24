import { InfluxDB } from "@influxdata/influxdb-client";

const url = process.env.INFLUX_URL!;
const token = process.env.INFLUX_TOKEN!;
const org = process.env.INFLUX_ORG!;
export const bucket = process.env.INFLUX_BUCKET!;

export const influxDB = new InfluxDB({ url, token });
export const queryApi = influxDB.getQueryApi(org);
