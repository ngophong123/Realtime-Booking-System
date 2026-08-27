export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

export interface Movie {
  id: string;
  title: string;
  description: string;
  duration: number;
  releaseDate: string;
  posterUrl: string;
}

export interface Seat {
  id: string;
  row: string;
  column: number;
  label: string;
  type: 'STANDARD' | 'VIP' | 'COUPLE';
  price: number;
  status: 'AVAILABLE' | 'HOLDING' | 'BOOKED';
  isMine?: boolean;
}

export interface Room {
  id: string;
  name: string;
  rows: number;
  columns: number;
  totalSeats?: number;
}

export interface Showtime {
  id: string;
  startTime: string;
  endTime: string;
  price: number;
  movieId: string;
  roomId: string;
  movie?: Movie;
  room?: Room;
}

export interface Booking {
  id: string;
  userId: string;
  showtimeId: string;
  totalPrice: number | string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  showtime?: Showtime;
  seats?: {
    id?: string;
    seatId: string;
    price: number | string;
    seat?: Seat;
  }[];
}

export interface SeatMapResponse {
  showtime: {
    id: string;
    startTime: string;
    endTime: string;
    basePrice: number;
    movie: Movie;
    room: Room;
  };
  seats: Seat[];
}
