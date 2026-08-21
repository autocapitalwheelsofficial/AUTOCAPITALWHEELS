export const SITE_NAME = 'AutoCapital Wheels';
export const SITE_TAGLINE = 'TRUSTED CARS. TRUSTED DEALS.';
export const SITE_EMAIL = 'autocapitalwheels@gmail.com';
export const SITE_PHONE = '+91 8800243707';
export const WHATSAPP_NUMBER = '918800243707';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://autocapitalwheels.com';

export const BUSINESS_HOURS = 'Mon–Sat: 10:00 AM – 7:00 PM | Sunday: 11:00 AM – 5:00 PM';

export const CAR_MAKES = [
  'Maruti Suzuki', 'Hyundai', 'Tata', 'Mahindra', 'Honda',
  'Toyota', 'Kia', 'Ford', 'Volkswagen', 'Skoda', 'Renault',
  'Nissan', 'MG', 'Jeep', 'Mercedes-Benz', 'BMW', 'Audi',
  'Volvo', 'Datsun', 'Fiat', 'Chevrolet', 'Mitsubishi',
] as const;

export const FUEL_TYPES = ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid', 'LPG'] as const;

export const TRANSMISSION_TYPES = ['Manual', 'Automatic', 'AMT', 'CVT', 'DCT'] as const;

export const BODY_TYPES = [
  'Sedan', 'Hatchback', 'SUV', 'MUV', 'Coupe',
  'Convertible', 'Van', 'Pickup', 'Wagon',
] as const;

export const VEHICLE_CATEGORIES = ['Car', 'SUV', 'Taxi', 'Commercial', 'Van', 'Truck'] as const;

export const VEHICLE_CONDITIONS = ['Excellent', 'Good', 'Fair', 'Poor'] as const;

export const INSURANCE_STATUSES = [
  'Comprehensive', 'Third Party', 'Valid', 'Expired', 'Not Available',
] as const;

export const SERVICE_HISTORY_OPTIONS = ['Full', 'Partial', 'None', 'Not Available'] as const;

export const ENQUIRY_STATUSES = [
  'NEW', 'CONTACTED', 'FOLLOW_UP', 'NEGOTIATION', 'CONVERTED', 'CLOSED',
] as const;

export const SELL_REQUEST_STATUSES = [
  'NEW', 'UNDER_REVIEW', 'INSPECTION_SCHEDULED', 'OFFER_MADE',
  'NEGOTIATION', 'COMPLETED', 'REJECTED', 'CLOSED',
] as const;

export const TEST_DRIVE_STATUSES = [
  'NEW', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED',
] as const;

export const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest Listed' },
  { value: 'oldest', label: 'Oldest Listed' },
  { value: 'mileage_asc', label: 'Lowest Mileage' },
  { value: 'mileage_desc', label: 'Highest Mileage' },
] as const;

export const PRICE_RANGES = [
  { label: 'Under ₹3 Lakh', min: 0, max: 300000 },
  { label: '₹3L – ₹5L', min: 300000, max: 500000 },
  { label: '₹5L – ₹8L', min: 500000, max: 800000 },
  { label: '₹8L – ₹12L', min: 800000, max: 1200000 },
  { label: '₹12L – ₹20L', min: 1200000, max: 2000000 },
  { label: 'Above ₹20L', min: 2000000, max: Infinity },
] as const;

export const OWNERSHIP_OPTIONS = [
  { value: 1, label: '1st Owner' },
  { value: 2, label: '2nd Owner' },
  { value: 3, label: '3rd Owner' },
  { value: 4, label: '4th Owner or More' },
] as const;

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan',
  'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal',
] as const;

export const PREFERRED_TIMES = [
  '9:00 AM – 11:00 AM',
  '11:00 AM – 1:00 PM',
  '1:00 PM – 3:00 PM',
  '3:00 PM – 5:00 PM',
  '5:00 PM – 7:00 PM',
] as const;

export const FEATURE_CATEGORIES = [
  'Safety', 'Comfort', 'Entertainment', 'Exterior', 'Interior', 'General',
] as const;

export const COMMON_FEATURES = {
  Safety: [
    'Airbags (Driver)', 'Airbags (Passenger)', 'Side Airbags', 'Curtain Airbags',
    '6 Airbags', 'ABS', 'EBD', 'ESP', 'Hill Hold Assist', 'Hill Descent Control',
    'ISOFIX Child Seat Anchors', 'Rear Parking Sensors', 'Reverse Camera',
    '360° Camera', 'Forward Collision Warning', 'Lane Keep Assist', 'Blind Spot Monitor',
  ],
  Comfort: [
    'Air Conditioning', 'Climate Control', 'Sunroof', 'Panoramic Sunroof',
    'Power Windows', 'Power Steering', 'Cruise Control', 'Adaptive Cruise Control',
    'Ventilated Seats', 'Heated Seats', 'Wireless Charging', 'USB Charging',
    'Push Button Start', 'Keyless Entry', 'Auto Dimming IRVM', 'Rain Sensing Wipers',
  ],
  Entertainment: [
    'Touchscreen Infotainment', 'Apple CarPlay', 'Android Auto', 'Bluetooth',
    'Bose Sound System', 'JBL Sound System', 'Connected Car Technology',
    'Navigation', 'Digital Instrument Cluster', 'Heads-Up Display',
  ],
  Exterior: [
    'Alloy Wheels', 'LED Headlights', 'LED DRLs', 'LED Tail Lights',
    'Projector Headlights', 'Fog Lamps', 'Roof Rails', 'Shark Fin Antenna',
  ],
  Interior: [
    'Leather Seats', 'Fabric Seats', 'Leatherette Seats', 'Ambient Lighting',
    'Rear AC Vents', 'Rear Armrest', 'Adjustable Headrests', 'Flat Bottom Steering Wheel',
  ],
} as const;

export const MAX_IMAGE_SIZE_MB = 10;
export const MAX_IMAGES_PER_VEHICLE = 20;
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
export const MAX_SELL_PHOTOS = 10;

export const ADMIN_SESSION_DURATION = 7 * 24 * 60 * 60; // 7 days in seconds

export const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/cars', label: 'Buy Cars' },
  { href: '/sell', label: 'Sell Your Car' },
  { href: '/about', label: 'About Us' },
  { href: '/contact', label: 'Contact' },
] as const;

export const LOCATIONS = [
  'Delhi', 'Gurugram', 'Noida', 'Faridabad', 'Ghaziabad',
  'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata',
  'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Chandigarh',
] as const;
