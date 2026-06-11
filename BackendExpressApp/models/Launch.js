import { Schema as _Schema, model } from "mongoose";

const Schema = _Schema;

const launchSchema = new _Schema({
    launchName: { type: String, required: true },
    programName: { type: String },
    agency: { type: _Schema.Types.ObjectId, ref: "Agency" },
    status: {
        type: String,
        required: true,
        enum: ["TBD", "TBC", "Success", "Failure", "Go"],
        default: "TBD",
    },
    start: { type: Date },
    end: { type: Date },
    rocket: { type: _Schema.Types.ObjectId, ref: "Rocket" },
    mission: { type: _Schema.Types.ObjectId, ref: "Mission" },
});

export default model("Launch", launchSchema);