import { Schema as _Schema, model } from "mongoose";

const Schema = _Schema;

const missionSchema = new _Schema({
    name: { type: String, required: true },
    description: { type: String },
    orbit: { type: String },
    type: { type: String },
});

export default model("Mission", missionSchema);