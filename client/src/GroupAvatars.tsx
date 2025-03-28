import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import CustomTooltip from './CustomTooltip';

interface User {
    username: string;
    avatar: string;
}

interface GroupAvatarsProps {
    users: User[];
}

export default function GroupAvatars({ users }: GroupAvatarsProps) {
    return (
        <AvatarGroup max={4} spacing="small">
            {users.map((user) => (
                <CustomTooltip title={user.username}>
                    <Avatar key={user.username} alt={user.username} src={user.avatar} sx={{ width: 48, height: 48 }} />
                </CustomTooltip>
            ))}
        </AvatarGroup>
    );
}
