export interface User {
  id: string;
  username: string;
  name: string;
  badgeNumber: string;
  role: "admin" | "officer";
  district: string;
}

export interface Violation {
  id: string;
  vehicleNumber: string;
  ownerName: string;
  violationType: string;
  fineAmount: number;
  location: string;
  district: string;
  dateTime: string;
  status: "Pending" | "Paid";
  evidenceImage: string;
  officerId: string;
  officerName: string;
  description: string;
  repeatOffender: boolean;
}

export interface VehicleOwner {
  vehicleNumber: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  licenseNumber: string;
  vehicleModel: string;
  previousViolations: number;
  violationsHistory?: Violation[];
}

export interface Hotspot {
  id: string;
  locationName: string;
  district: string;
  riskLevel: "High Risk" | "Medium Risk" | "Low Risk";
  accidentCount: number;
  violationCount: number;
  description: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export type ActivePage =
  | "login"
  | "signup"
  | "dashboard"
  | "add-violation"
  | "view-records"
  | "owner-details"
  | "reports"
  | "hotspot-analysis"
  | "profile"
  | "settings"
  | "about"
  | "contact";
