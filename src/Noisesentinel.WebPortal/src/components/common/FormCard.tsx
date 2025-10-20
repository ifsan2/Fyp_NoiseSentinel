import React from 'react';
import { Card, CardContent, Typography, Divider } from '@mui/material';

interface FormCardProps {
  title: string;
  children: React.ReactNode;
}

export const FormCard: React.FC<FormCardProps> = ({ title, children }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom fontWeight={600}>
          {title}
        </Typography>
        <Divider sx={{ mb: 3 }} />
        {children}
      </CardContent>
    </Card>
  );
};