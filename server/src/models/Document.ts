import mongoose, { Schema } from "mongoose";
import { Document } from "mongoose";

export interface IDocument extends Document {
    docId: string;
    content: string;
    owner: mongoose.Types.ObjectId;
    access: mongoose.Types.ObjectId[];
}

const DocumentSchema = new Schema<IDocument>(
    {
        docId: { type: String, required: true, unique: true },
        content: { type: String, default: "" },
        owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        access: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    },
    { timestamps: true }
);

export const DocumentModel = mongoose.model<IDocument>("Document", DocumentSchema);
