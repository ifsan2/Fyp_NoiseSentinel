import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Edit, Delete, Visibility, CheckCircle, Cancel } from '@mui/icons-material';
import { UserListItemDto } from '@/models/User';

interface UserTableProps {
  users: UserListItemDto[];
  onView: (userId: number) => void;
  onEdit: (userId: number) => void;
  onDelete: (userId: number) => void;
  onToggleStatus: (userId: number, currentStatus: boolean) => void;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: 'primary.main' }}>
            <TableCell sx={{ color: 'white', fontWeight: 600 }}>ID</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 600 }}>Full Name</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 600 }}>Username</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 600 }}>Email</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 600 }}>Role</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 600 }}>Created</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 600 }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} align="center">
                No users found
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow
                key={user.userId}
                hover
                sx={{ '&:hover': { bgcolor: 'action.hover' } }}
              >
                <TableCell>{user.userId}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{user.fullName}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip
                    label={user.role}
                    size="small"
                    color={
                      user.role === 'Admin'
                        ? 'error'
                        : user.role === 'Judge'
                        ? 'warning'
                        : user.role === 'Police Officer'
                        ? 'info'
                        : 'default'
                    }
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.status}
                    size="small"
                    color={user.isActive ? 'success' : 'default'}
                    icon={user.isActive ? <CheckCircle /> : <Cancel />}
                  />
                </TableCell>
                <TableCell>{formatDate(user.createdAt)}</TableCell>
                <TableCell>
                  <Tooltip title="View Details">
                    <IconButton
                      size="small"
                      color="info"
                      onClick={() => onView(user.userId)}
                    >
                      <Visibility fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => onEdit(user.userId)}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title={user.isActive ? 'Deactivate' : 'Activate'}>
                    <IconButton
                      size="small"
                      color={user.isActive ? 'warning' : 'success'}
                      onClick={() => onToggleStatus(user.userId, user.isActive)}
                    >
                      {user.isActive ? <Cancel fontSize="small" /> : <CheckCircle fontSize="small" />}
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => onDelete(user.userId)}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};