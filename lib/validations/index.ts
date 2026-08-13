import { z } from 'zod';

// ---- Enquiry Form ----
export const enquirySchema = z.object({
  customer_name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  customer_phone: z
    .string()
    .regex(/^\d{10}$/, 'Enter a valid 10-digit mobile number'),
  customer_email: z.string().email('Enter a valid email').nullable().optional().or(z.literal('')),
  customer_city: z.string().max(100).nullable().optional(),
  vehicle_id: z.string().nullable().optional().or(z.literal('')),
  message: z.string().max(1000).nullable().optional(),
  preferred_contact: z.enum(['Phone', 'WhatsApp', 'Email', 'Any']).default('Phone'),
  preferred_time: z.string().nullable().optional(),
  test_drive_requested: z.boolean().default(false),
  user_id: z.string().nullable().optional().or(z.literal('')),
});

export type EnquiryFormValues = z.infer<typeof enquirySchema>;

// ---- Test Drive Form ----
export const testDriveSchema = z.object({
  customer_name: z.string().min(2).max(100),
  customer_phone: z
    .string()
    .regex(/^\d{10}$/, 'Enter a valid 10-digit mobile number'),
  customer_email: z.string().email().nullable().optional().or(z.literal('')),
  vehicle_id: z.string().nullable().optional().or(z.literal('')),
  preferred_date: z.string().min(1, 'Please select a preferred date'),
  preferred_time: z.string().nullable().optional(),
  location: z.string().max(200).nullable().optional(),
  message: z.string().max(500).nullable().optional(),
});

export type TestDriveFormValues = z.infer<typeof testDriveSchema>;

// ---- Sell Your Car Form ----
export const sellCarSchema = z.object({
  owner_name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  owner_phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  owner_email: z.string().email().optional().or(z.literal('')),
  owner_city: z.string().min(2, 'Please enter your city').max(100),
  make: z.string().min(1, 'Please select car make'),
  model: z.string().min(1, 'Please enter car model'),
  variant: z.string().optional(),
  manufacturing_year: z
    .number()
    .int()
    .min(1990, 'Year must be 1990 or later')
    .max(new Date().getFullYear(), 'Year cannot be in the future'),
  registration_year: z.number().int().optional(),
  fuel_type: z.string().min(1, 'Please select fuel type'),
  transmission: z.string().min(1, 'Please select transmission'),
  kms_driven: z
    .number()
    .int()
    .min(0)
    .max(1000000, 'Please enter a valid mileage'),
  number_of_owners: z.number().int().min(1).max(10).default(1),
  expected_price: z.number().min(0).optional(),
  vehicle_condition: z.enum(['Excellent', 'Good', 'Fair', 'Poor']),
  accident_history: z.boolean().default(false),
  insurance_status: z.string().optional(),
  rc_available: z.boolean().default(true),
  additional_info: z.string().max(2000).optional(),
});

export type SellCarFormValues = z.infer<typeof sellCarSchema>;

// ---- Contact Form ----
export const contactSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number')
    .optional()
    .or(z.literal('')),
  email: z.string().email('Enter a valid email'),
  subject: z.string().max(200).optional(),
  message: z.string().min(10, 'Please write at least 10 characters').max(2000),
});

export type ContactFormValues = z.infer<typeof contactSchema>;

// ---- Admin Login ----
export const adminLoginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type AdminLoginValues = z.infer<typeof adminLoginSchema>;

// ---- Admin Vehicle Form ----
export const vehicleSchema = z.object({
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  variant: z.string().optional(),
  year: z
    .number()
    .int()
    .min(1980)
    .max(new Date().getFullYear() + 1),
  registration_year: z.number().int().optional(),
  price: z.number().min(1, 'Price is required'),
  original_price: z.number().optional(),
  mileage: z.number().int().min(0, 'Mileage is required'),
  fuel_type: z.enum(['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid', 'LPG']),
  transmission: z.enum(['Manual', 'Automatic', 'AMT', 'CVT', 'DCT']),
  body_type: z.enum(['Sedan', 'Hatchback', 'SUV', 'MUV', 'Coupe', 'Convertible', 'Van', 'Pickup', 'Wagon']).optional(),
  colour: z.string().optional(),
  seating_capacity: z.number().int().optional(),
  engine_cc: z.number().int().optional(),
  engine_description: z.string().optional(),
  location: z.string().optional(),
  registration_state: z.string().optional(),
  ownership: z.number().int().min(1).max(6).optional(),
  insurance_status: z.enum(['Valid', 'Expired', 'Third Party', 'Comprehensive', 'Not Available']).optional(),
  rc_available: z.boolean().default(true),
  puc_available: z.boolean().default(true),
  accident_history: z.boolean().default(false),
  service_history: z.enum(['Full', 'Partial', 'None', 'Not Available']).optional(),
  warranty_available: z.boolean().default(false),
  warranty_description: z.string().optional(),
  vehicle_category: z.enum(['Car', 'SUV', 'Taxi', 'Commercial', 'Van', 'Truck']).default('Car'),
  description: z.string().optional(),
  additional_info: z.string().optional(),
  is_featured: z.boolean().default(false),
  is_new_arrival: z.boolean().default(false),
  is_hot_deal: z.boolean().default(false),
  is_price_drop: z.boolean().default(false),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
  slug: z.string().optional(),
  status: z.enum(['Draft', 'Active', 'Reserved', 'Sold', 'Archived']).default('Draft'),
  sold_price: z.number().nullable().optional(),
  sold_date: z.string().nullable().optional(),
  buyer_name: z.string().nullable().optional(),
  buyer_phone: z.string().nullable().optional(),
  buyer_email: z.string().nullable().optional(),
  sales_notes: z.string().nullable().optional(),
});

export type VehicleFormValues = z.infer<typeof vehicleSchema>;

// ---- Testimonial Form ----
export const testimonialSchema = z.object({
  customer_name: z.string().min(2).max(100),
  customer_location: z.string().optional(),
  review: z.string().min(10).max(1000),
  rating: z.number().int().min(1).max(5),
  vehicle_purchased: z.string().optional(),
  is_active: z.boolean().default(true),
});

export type TestimonialFormValues = z.infer<typeof testimonialSchema>;

// ---- FAQ Form ----
export const faqSchema = z.object({
  question: z.string().min(5).max(500),
  answer: z.string().min(10).max(2000),
  category: z.string().optional(),
  is_active: z.boolean().default(true),
});

export type FAQFormValues = z.infer<typeof faqSchema>;

// ---- Customer Sign Up ----
export const signUpSchema = z.object({
  full_name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number')
    .optional()
    .or(z.literal('')),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
});

export type SignUpFormValues = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

export type SignInFormValues = z.infer<typeof signInSchema>;
