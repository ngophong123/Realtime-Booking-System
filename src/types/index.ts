export type Role = 'USER' | 'ADMIN';
export type SeatType = 'STANDARD' | 'VIP' | 'COUPLE';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Movie {
  id: string;
  title: string;
  description?: string;
  duration: number;
  releaseDate: string;
  posterUrl?: string;
}

export interface Seat {
  id: string;
  roomId: string;
  row: string;
  column: number;
  label: string;
  type: SeatType;
}

export interface Room {
  id: string;
  name: string;
  rows: number;
  columns: number;
  seats?: Seat[];
}

export interface Showtime {
  id: string;
  movieId: string;
  roomId: string;
  startTime: string;
  endTime: string;
  price: number;
  movie?: Movie;
  room?: Room;
}

export interface BookingSeat {
  id: string;
  bookingId: string;
  seatId: string;
  price: number;
  seat?: Seat;
}

export interface Booking {
  id: string;
  userId: string;
  user?: User;
  showtimeId: string;
  showtime?: Showtime;
  totalPrice: number;
  discountAmount?: number;
  voucherCode?: string;
  paymentMethod?: 'MOMO' | 'ZALOPAY' | 'VIETQR' | 'CASH' | 'ATM' | string;
  status: BookingStatus;
  bookingSeats?: BookingSeat[];
  seats?: BookingSeat[];
  createdAt: string;
}

export interface Voucher {
  id: string;
  code: string;
  discountPercent?: number | null;
  discountAmount?: number | null;
  minOrderAmount: number;
  maxDiscount?: number | null;
  expireAt: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
}
