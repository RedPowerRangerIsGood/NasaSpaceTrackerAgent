import { Schema as _Schema, model } from "mongoose";

const Schema = _Schema;

const rocketSchema = new _Schema({
    fullname: { type: String, required: true },
    variant: { type: String },
    configId: { type: Number },
});

export default model("Rocket", rocketSchema);