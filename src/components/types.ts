import React from 'react';

export interface Resource {
  id: string;
  title: string;
  author: string;
  subject: string;
  year: string;
  type: string;
  icon: string;
  bgColor: string;
  iconColor: string;
  views?: number;
  downloads?: number;
  likes?: number;
  isPlaylist?: boolean;
  is_destaque?: boolean;
  estrutura?: 'UPLOAD' | 'URL' | 'NOTA';
  resources?: number;
}

export interface Playlist {
  id: string;
  title: string;
  resources: number;
  visibility: string;
  author?: string;
  subject?: string;
  year?: string;
  type?: string;
  icon?: string;
  bgColor?: string;
  iconColor?: string;
  isPlaylist?: boolean;
  views?: number;
  downloads?: number;
  likes?: number;
  is_destaque?: boolean;
}