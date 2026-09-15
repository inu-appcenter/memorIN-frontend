import { useState } from 'react';
import type { TagType, TimeslotType, VisibilityType } from '@/entities/post';

export function usePostForm() {
  const [caption, setCaption] = useState('');
  const [timeslot, setTimeslot] = useState<TimeslotType>('AM');
  const [visibility, setVisibility] = useState<VisibilityType>('PUBLIC');
  const [tags, setTags] = useState<TagType[]>([]);

  return {
    caption,
    setCaption,
    timeslot,
    setTimeslot,
    visibility,
    setVisibility,
    tags,
    setTags,
  };
}
