import React from 'react';
import { FaSpinner } from 'react-icons/fa';

export type enumeratedConversion = {
  value: string;
};

export type ApplicationType = {
  appid: string;
  name: string;
  created_at: string;
  updated_at: string;
  description: string;
  conversions: enumeratedConversion[];
};

export const FidgetLoader: React.FC = () => {
  return <FaSpinner className="animate-spin" size={40} />;
};
