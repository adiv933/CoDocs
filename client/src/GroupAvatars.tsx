import Avatar from "@mui/material/Avatar";
import AvatarGroup from "@mui/material/AvatarGroup";
import CustomTooltip from "./CustomTooltip";

export interface User {
    username: string;
    avatar: string;
}

interface GroupAvatarsProps {
    currentUser: string;
    users: User[];
}

export default function GroupAvatars({ currentUser, users }: GroupAvatarsProps) {
    return (
        <AvatarGroup max={4} spacing="small">
            {users.map((user) => (
                <CustomTooltip
                    title={
                        user.username === currentUser
                            ? `${user.username} (You)`
                            : user.username
                    }
                    key={user.username}
                >
                    <Avatar
                        alt={user.username}
                        src={user.avatar}
                        sx={{ width: 48, height: 48 }}
                    />
                </CustomTooltip>
            ))}
        </AvatarGroup>
    );
}
