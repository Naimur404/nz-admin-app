export interface BookingOperationLog {
  done_by: string;
  created_at: string;
  booking_trans_id: string;
  operation_type: string;
  operation_details: string;
  remarks: string | null;
}

export interface BookingOperationLogResponse {
  code: number;
  data: BookingOperationLog[];
  flag: boolean;
  dataCount: number;
}

export interface OperationDetails {
  action: string;
  remarks: string;
}