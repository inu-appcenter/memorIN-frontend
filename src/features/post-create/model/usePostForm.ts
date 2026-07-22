import { useState } from 'react';
import type { TimeslotType, VisibilityType } from '@/entities/post';

export function usePostForm() {
  const [caption, setCaption] = useState('');
  const [timeslot, setTimeslot] = useState<TimeslotType>('AM');
  const [visibility, setVisibility] = useState<VisibilityType>('PUBLIC');

  return {
    caption,
    setCaption,
    timeslot,
    setTimeslot,
    visibility,
    setVisibility,
  };
}
