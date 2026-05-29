import { create } from 'zustand';
import type { BookingState } from './types';
import { createCrmSlice } from './crmSlice';
import { createMasterSlice } from './masterSlice';
import { createBookingSlice } from './bookingSlice';

export const useBookingStore = create<BookingState>((...a) => ({
  ...createCrmSlice(...a),
  ...createMasterSlice(...a),
  ...createBookingSlice(...a),
}));
