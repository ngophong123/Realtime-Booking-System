export type Role = 'USER' | 'ADMIN';
export type SeatType = 'STANDARD' | 'VIP' | 'COUPLE';
export type RoomType = 'STANDARD' | 'IMAX' | 'COUPLE' | 'VIP';
export type MovieStatus = 'NOW_SHOWING' | 'COMING_SOON';
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
  status: MovieStatus | string;
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
  type?: RoomType | string;
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
  userId?: string | null;
  user?: User;
}

export interface PaymentSetting {
  id: string;
  momoQrUrl?: string;
  vietQrUrl?: string;
  zaloPayQrUrl?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankName?: string;
}

export interface Notification {
  id: string;
  userId?: string | null;
  title: string;
  message: string;
  type: 'BOOKING' | 'APPROVED' | 'CANCELLED' | 'VOUCHER' | 'SYSTEM' | string;
  isRead: boolean;
  createdAt: string;
}

export interface EmailSetting {
  id: string;
  smtpEmail?: string;
  smtpPassword?: string;
  senderName?: string;
  adminEmail?: string;
}
