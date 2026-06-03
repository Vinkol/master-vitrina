import { create } from 'zustand';
import type { BookingState } from './types';
import { createCrmSlice } from './crmSlice';
import { createMasterSlice } from './masterSlice';
import { createBookingSlice } from './bookingSlice';
import { createAuthSlice } from './authSlice';

export const useBookingStore = create<BookingState>((...a) => ({
  ...createAuthSlice(...a),
  ...createCrmSlice(...a),
  ...createMasterSlice(...a),
  ...createBookingSlice(...a),
}));
