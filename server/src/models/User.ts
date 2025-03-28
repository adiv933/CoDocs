import mongoose, { Document, Schema } from "mongoose";
import axios from "axios";

export interface IUser extends Document {
    username: string;
    avatar: string;
}

const UserSchema = new Schema<IUser>(
    {
        username: { type: String },
        avatar: { type: String },
    },
    { timestamps: true }
);


UserSchema.pre("save", async function (next) {
    if (!this.username) {
        try {
            const response = await axios.get("https://usernameapiv1.vercel.app/api/random-usernames");
            this.username = response.data.usernames[0];
        } catch (error) {
            this.username = `Guest-${Math.floor(Math.random() * 1000)}`;
        }
    }

    if (!this.avatar) {
        const seed = Math.random().toString(36).substring(7);
        this.avatar = `https://api.dicebear.com/8.x/thumbs/svg?seed=${seed}`;
    }

    next();
});

export const UserModel = mongoose.model<IUser>("User", UserSchema);
