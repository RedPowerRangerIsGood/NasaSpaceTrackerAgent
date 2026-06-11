import { Schema as _Schema, model } from "mongoose";

const Schema = _Schema;

const satelliteSchema = new Schema({
    name: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    altitude: { type: Number, required: true },
    velocity: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
}, { versionKey: false });

export default model("satellite", satelliteSchema, "satellite");