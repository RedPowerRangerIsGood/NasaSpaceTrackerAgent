import { Schema as _Schema, model } from "mongoose";

const Schema = _Schema;

const agencySchema = new _Schema({
    name: { type: String, required: true },
    variant: { type: String, required: true },
    launchers: { type: [String], required: true },
    spacecraft: { type: String, required: true },
});

export default model("Agency", agencySchema);